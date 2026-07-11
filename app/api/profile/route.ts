import { createClient } from "@/lib/supabase/server";
import { isValidUsername, normalizeUsername } from "@/lib/users";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, email, display_name, username, bio, is_discoverable, created_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: error?.message ?? "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: {
    display_name?: string | null;
    username?: string | null;
    bio?: string | null;
    is_discoverable?: boolean;
  } = {};

  if ("display_name" in body) {
    const name =
      typeof body.display_name === "string" ? body.display_name.trim() : null;
    updates.display_name = name && name.length > 0 ? name.slice(0, 80) : null;
  }

  if ("username" in body) {
    if (body.username === null || body.username === "") {
      updates.username = null;
    } else if (typeof body.username === "string") {
      const username = normalizeUsername(body.username);
      if (!isValidUsername(username)) {
        return NextResponse.json(
          {
            error:
              "Username must be 3–30 characters: lowercase letters, numbers, underscores.",
          },
          { status: 400 }
        );
      }
      updates.username = username;
    }
  }

  if ("bio" in body) {
    if (body.bio === null || body.bio === "") {
      updates.bio = null;
    } else if (typeof body.bio === "string") {
      const bio = body.bio.trim().slice(0, 160);
      updates.bio = bio.length > 0 ? bio : null;
    } else {
      return NextResponse.json({ error: "bio must be a string" }, { status: 400 });
    }
  }

  if ("is_discoverable" in body) {
    if (typeof body.is_discoverable !== "boolean") {
      return NextResponse.json(
        { error: "is_discoverable must be a boolean" },
        { status: 400 }
      );
    }
    updates.is_discoverable = body.is_discoverable;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("id, email, display_name, username, bio, is_discoverable, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
