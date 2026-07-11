import { createClient } from "@/lib/supabase/server";
import { getConversationsForUser } from "@/lib/conversations";
import { findOrCreateConversation, normalizeUsername } from "@/lib/users";
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

  const body = await request.json();
  const recipientUserId =
    typeof body.recipientUserId === "string" ? body.recipientUserId : null;
  const recipientUsername =
    typeof body.recipientUsername === "string"
      ? normalizeUsername(body.recipientUsername)
      : null;
  const recipientEmail =
    typeof body.recipientEmail === "string"
      ? body.recipientEmail.trim().toLowerCase()
      : null;

  if (!recipientUserId && !recipientUsername && !recipientEmail) {
    return NextResponse.json(
      { error: "Provide recipientUserId, recipientUsername, or recipientEmail" },
      { status: 400 }
    );
  }

  let recipient: {
    id: string;
    display_name: string | null;
    username?: string | null;
    is_discoverable?: boolean;
  } | null = null;

  if (recipientUserId) {
    const { data, error } = await supabase.rpc("get_public_profiles", {
      target_ids: [recipientUserId],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    recipient = Array.isArray(data) ? data[0] ?? null : data;
  } else if (recipientUsername) {
    const { data, error } = await supabase.rpc("find_user_by_username", {
      lookup_username: recipientUsername,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    recipient = Array.isArray(data) ? data[0] ?? null : data;
  } else if (recipientEmail) {
    if (recipientEmail === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("find_user_by_email", {
      lookup_email: recipientEmail,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    recipient = Array.isArray(data) ? data[0] ?? null : data;
  }

  if (!recipient) {
    return NextResponse.json(
      {
        error:
          "User not found. Try their @username, or ask them to share it / accept an invite.",
      },
      { status: 404 }
    );
  }

  if (recipient.id === user.id) {
    return NextResponse.json(
      { error: "Cannot start a conversation with yourself" },
      { status: 400 }
    );
  }

  // Private users require an accepted invite (or existing conversation)
  const isDiscoverable = recipient.is_discoverable !== false;

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user_a.eq.${user.id},user_b.eq.${recipient.id}),and(user_a.eq.${recipient.id},user_b.eq.${user.id})`
    )
    .maybeSingle();

  if (!isDiscoverable && !existingConversation) {
    const { data: acceptedInvite } = await supabase
      .from("contact_invites")
      .select("id")
      .eq("status", "accepted")
      .or(
        `and(from_user_id.eq.${user.id},to_user_id.eq.${recipient.id}),and(from_user_id.eq.${recipient.id},to_user_id.eq.${user.id})`
      )
      .maybeSingle();

    if (!acceptedInvite) {
      return NextResponse.json(
        {
          error:
            "This person is private. Send a contact invite, or ask them to message you first.",
          requiresInvite: true,
          user: {
            id: recipient.id,
            username: recipient.username ?? null,
            display_name: recipient.display_name,
            is_discoverable: false,
          },
        },
        { status: 403 }
      );
    }
  }

  try {
    const { conversation } = await findOrCreateConversation(
      supabase,
      user.id,
      recipient.id
    );
    return NextResponse.json({ conversation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create conversation" },
      { status: 500 }
    );
  }
}
