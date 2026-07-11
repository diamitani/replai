import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getConversationParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  userId: string
) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .maybeSingle();

  return conversation;
}

/**
 * GET /api/conversations/[id]/drafts
 * Returns private originals the caller is allowed to see:
 * - their own drafts always
 * - the other person's drafts only if that person shared with them
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id: conversationId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await getConversationParticipant(supabase, conversationId, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: drafts, error } = await supabase
    .from("private_drafts")
    .select("id, message_id, conversation_id, owner_id, original_text, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messageIds = (drafts ?? []).map((d) => d.message_id);
  let sentByMessageId: Record<string, { content: string; created_at: string }> = {};

  if (messageIds.length > 0) {
    const { data: messages } = await supabase
      .from("messages")
      .select("id, content, created_at")
      .in("id", messageIds);

    sentByMessageId = Object.fromEntries(
      (messages ?? []).map((m) => [m.id, { content: m.content, created_at: m.created_at }])
    );
  }

  const enriched = (drafts ?? []).map((draft) => ({
    ...draft,
    sent_content: sentByMessageId[draft.message_id]?.content ?? "",
    sent_at: sentByMessageId[draft.message_id]?.created_at ?? draft.created_at,
  }));

  const mine = enriched.filter((d) => d.owner_id === user.id);
  const sharedWithMe = enriched.filter((d) => d.owner_id !== user.id);

  return NextResponse.json({
    drafts: enriched,
    mine,
    sharedWithMe,
  });
}
