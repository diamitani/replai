import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, content, aiOriginalDraft, aiWasRewritten } = await request.json();

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "conversationId and content are required" },
      { status: 400 }
    );
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const wasRewritten = Boolean(aiWasRewritten);
  const originalDraft =
    typeof aiOriginalDraft === "string" && aiOriginalDraft.trim().length > 0
      ? aiOriginalDraft.trim()
      : null;

  // Public message: recipient only sees the final sent content.
  // Never write the original draft onto messages (RLS would expose it).
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      ai_original_draft: null,
      ai_was_rewritten: wasRewritten,
    })
    .select()
    .single();

  if (error || !message) {
    return NextResponse.json({ error: error?.message ?? "Failed to send message" }, { status: 500 });
  }

  // Private vault: only the sender (and anyone they share with) can read this.
  if (wasRewritten && originalDraft) {
    const { error: draftError } = await supabase.from("private_drafts").insert({
      message_id: message.id,
      conversation_id: conversationId,
      owner_id: user.id,
      original_text: originalDraft,
    });

    if (draftError) {
      // Message already sent — log but don't fail the send.
      console.error("Failed to store private draft:", draftError.message);
    }
  }

  return NextResponse.json({ message });
}
