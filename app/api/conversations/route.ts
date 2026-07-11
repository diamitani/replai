import { createClient } from "@/lib/supabase/server";
import { getConversationsForUser } from "@/lib/conversations";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await getConversationsForUser(supabase, user.id);
    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipientEmail } = await request.json();

  if (!recipientEmail || typeof recipientEmail !== "string") {
    return NextResponse.json({ error: "recipientEmail is required" }, { status: 400 });
  }

  const normalizedEmail = recipientEmail.trim().toLowerCase();

  if (normalizedEmail === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Cannot start a conversation with yourself" }, { status: 400 });
  }

  const { data: recipient, error: recipientError } = await supabase
    .from("users")
    .select("id, email, display_name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (recipientError) {
    return NextResponse.json({ error: recipientError.message }, { status: 500 });
  }

  if (!recipient) {
    return NextResponse.json(
      { error: "User not found. They need to sign up first." },
      { status: 404 }
    );
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(user_a.eq.${user.id},user_b.eq.${recipient.id}),and(user_a.eq.${recipient.id},user_b.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ conversation: existing });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({ user_a: user.id, user_b: recipient.id })
    .select()
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json(
      { error: conversationError?.message ?? "Failed to create conversation" },
      { status: 500 }
    );
  }

  await supabase.from("contacts").upsert(
    {
      owner_id: user.id,
      contact_user_id: recipient.id,
      tone_notes: null,
      no_send_rules: null,
      relationship_notes: null,
    },
    { onConflict: "owner_id,contact_user_id" }
  );

  return NextResponse.json({ conversation });
}
