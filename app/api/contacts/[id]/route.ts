import { createClient } from "@/lib/supabase/server";
import { getOtherUserId } from "@/lib/conversations";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const otherUserId = getOtherUserId(conversation, user.id);

  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", user.id)
    .eq("contact_user_id", otherUserId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { toneNotes, noSendRules, relationshipNotes } = await request.json();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const otherUserId = getOtherUserId(conversation, user.id);

  const { data: contact, error } = await supabase
    .from("contacts")
    .upsert(
      {
        owner_id: user.id,
        contact_user_id: otherUserId,
        tone_notes: toneNotes ?? null,
        no_send_rules: noSendRules ?? null,
        relationship_notes: relationshipNotes ?? null,
      },
      { onConflict: "owner_id,contact_user_id" }
    )
    .select()
    .single();

  if (error || !contact) {
    return NextResponse.json({ error: error?.message ?? "Failed to save contact" }, { status: 500 });
  }

  return NextResponse.json({ contact });
}
