import { createClient } from "@/lib/supabase/server";
import { findOrCreateConversation } from "@/lib/users";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const action = body.action as "accept" | "decline" | "cancel";

  if (!["accept", "decline", "cancel"].includes(action)) {
    return NextResponse.json(
      { error: "action must be accept, decline, or cancel" },
      { status: 400 }
    );
  }

  const { data: invite, error: inviteError } = await supabase
    .from("contact_invites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json(
      { error: `Invite is already ${invite.status}` },
      { status: 400 }
    );
  }

  if (action === "cancel") {
    if (invite.from_user_id !== user.id) {
      return NextResponse.json({ error: "Only the sender can cancel" }, { status: 403 });
    }

    const { error } = await supabase.from("contact_invites").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ cancelled: true });
  }

  if (invite.to_user_id !== user.id) {
    return NextResponse.json(
      { error: "Only the recipient can accept or decline" },
      { status: 403 }
    );
  }

  const status = action === "accept" ? "accepted" : "declined";
  const { data: updated, error: updateError } = await supabase
    .from("contact_invites")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to update invite" },
      { status: 500 }
    );
  }

  if (action === "decline") {
    return NextResponse.json({ invite: updated });
  }

  try {
    const { conversation } = await findOrCreateConversation(
      supabase,
      invite.from_user_id,
      invite.to_user_id
    );
    return NextResponse.json({ invite: updated, conversation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create conversation" },
      { status: 500 }
    );
  }
}
