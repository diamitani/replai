import { createClient } from "@/lib/supabase/server";
import { findOrCreateConversation } from "@/lib/users";
import type { ContactInviteWithUser, PublicUser } from "@/lib/types";
import { NextResponse } from "next/server";

async function hydrateInvites(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ContactInviteWithUser[]> {
  const { data: invites, error } = await supabase
    .from("contact_invites")
    .select("*")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !invites) {
    throw new Error(error?.message ?? "Failed to load invites");
  }

  const otherIds = [
    ...new Set(
      invites.map((invite) =>
        invite.from_user_id === userId ? invite.to_user_id : invite.from_user_id
      )
    ),
  ];

  const usersById = new Map<string, PublicUser>();

  if (otherIds.length > 0) {
    const { data: users, error: usersError } = await supabase.rpc(
      "get_public_profiles",
      { target_ids: otherIds }
    );

    if (usersError) {
      throw new Error(usersError.message);
    }

    for (const u of users ?? []) {
      usersById.set(u.id, u);
    }
  }

  return invites
    .map((invite) => {
      const direction =
        invite.to_user_id === userId ? ("incoming" as const) : ("outgoing" as const);
      const otherId =
        direction === "incoming" ? invite.from_user_id : invite.to_user_id;
      const other_user = usersById.get(otherId);

      if (!other_user) return null;

      return {
        ...invite,
        direction,
        other_user,
      };
    })
    .filter((invite): invite is ContactInviteWithUser => invite !== null);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invites = await hydrateInvites(supabase, user.id);
    return NextResponse.json({
      invites,
      incoming: invites.filter(
        (i) => i.direction === "incoming" && i.status === "pending"
      ),
      outgoing: invites.filter(
        (i) => i.direction === "outgoing" && i.status === "pending"
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load invites" },
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

  const body = await request.json();
  const toUserId = typeof body.toUserId === "string" ? body.toUserId : null;
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 280) : null;

  if (!toUserId) {
    return NextResponse.json({ error: "toUserId is required" }, { status: 400 });
  }

  if (toUserId === user.id) {
    return NextResponse.json(
      { error: "Cannot invite yourself" },
      { status: 400 }
    );
  }

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user_a.eq.${user.id},user_b.eq.${toUserId}),and(user_a.eq.${toUserId},user_b.eq.${user.id})`
    )
    .maybeSingle();

  if (existingConversation) {
    return NextResponse.json({
      alreadyConnected: true,
      conversationId: existingConversation.id,
    });
  }

  const { data: existingInvite } = await supabase
    .from("contact_invites")
    .select("*")
    .eq("from_user_id", user.id)
    .eq("to_user_id", toUserId)
    .maybeSingle();

  if (existingInvite?.status === "pending") {
    return NextResponse.json({ invite: existingInvite, alreadyPending: true });
  }

  if (existingInvite?.status === "accepted") {
    try {
      const { conversation } = await findOrCreateConversation(
        supabase,
        user.id,
        toUserId
      );
      return NextResponse.json({ invite: existingInvite, conversation });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create conversation" },
        { status: 500 }
      );
    }
  }

  // If they already invited you, auto-accept and open chat
  const { data: reverseInvite } = await supabase
    .from("contact_invites")
    .select("*")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (reverseInvite) {
    const { error: updateError } = await supabase
      .from("contact_invites")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", reverseInvite.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      const { conversation } = await findOrCreateConversation(
        supabase,
        user.id,
        toUserId
      );
      return NextResponse.json({
        invite: { ...reverseInvite, status: "accepted" },
        conversation,
        autoAccepted: true,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create conversation" },
        { status: 500 }
      );
    }
  }

  const { data: invite, error } = await supabase
    .from("contact_invites")
    .upsert(
      {
        from_user_id: user.id,
        to_user_id: toUserId,
        message,
        status: "pending",
        responded_at: null,
      },
      { onConflict: "from_user_id,to_user_id" }
    )
    .select()
    .single();

  if (error || !invite) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to send invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invite });
}
