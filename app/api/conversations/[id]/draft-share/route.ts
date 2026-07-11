import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  userId: string
) {
  const { data } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .maybeSingle();
  return data;
}

/**
 * GET /api/conversations/[id]/draft-share
 * Returns whether the current user has shared their originals with the other person,
 * and whether the other person has shared with them.
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

  const conversation = await getConversation(supabase, conversationId, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const otherUserId =
    conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

  const [{ data: iShared }, { data: theyShared }] = await Promise.all([
    supabase
      .from("draft_shares")
      .select("id, created_at")
      .eq("conversation_id", conversationId)
      .eq("owner_id", user.id)
      .eq("viewer_id", otherUserId)
      .maybeSingle(),
    supabase
      .from("draft_shares")
      .select("id, created_at")
      .eq("conversation_id", conversationId)
      .eq("owner_id", otherUserId)
      .eq("viewer_id", user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    sharingWithThem: Boolean(iShared),
    theySharingWithMe: Boolean(theyShared),
    sharedAt: iShared?.created_at ?? null,
    receivedAt: theyShared?.created_at ?? null,
  });
}

/**
 * PUT /api/conversations/[id]/draft-share
 * Body: { enabled: boolean }
 * Grant or revoke the other person's access to your original drafts in this chat.
 */
export async function PUT(request: Request, context: RouteContext) {
  const { id: conversationId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await getConversation(supabase, conversationId, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const otherUserId =
    conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

  const body = await request.json();
  const enabled = Boolean(body.enabled);

  if (enabled) {
    const { error } = await supabase.from("draft_shares").upsert(
      {
        conversation_id: conversationId,
        owner_id: user.id,
        viewer_id: otherUserId,
      },
      { onConflict: "conversation_id,owner_id,viewer_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sharingWithThem: true });
  }

  const { error } = await supabase
    .from("draft_shares")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("owner_id", user.id)
    .eq("viewer_id", otherUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sharingWithThem: false });
}
