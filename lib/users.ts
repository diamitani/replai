import type { SupabaseClient } from "@supabase/supabase-js";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

export async function ensureContact(
  supabase: SupabaseClient,
  ownerId: string,
  contactUserId: string
) {
  await supabase.from("contacts").upsert(
    {
      owner_id: ownerId,
      contact_user_id: contactUserId,
      tone_notes: null,
      no_send_rules: null,
      relationship_notes: null,
    },
    { onConflict: "owner_id,contact_user_id" }
  );
}

export async function findOrCreateConversation(
  supabase: SupabaseClient,
  userId: string,
  recipientId: string
) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(user_a.eq.${userId},user_b.eq.${recipientId}),and(user_a.eq.${recipientId},user_b.eq.${userId})`
    )
    .maybeSingle();

  if (existing) {
    return { conversation: existing, created: false };
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ user_a: userId, user_b: recipientId })
    .select()
    .single();

  if (error || !conversation) {
    throw new Error(error?.message ?? "Failed to create conversation");
  }

  await ensureContact(supabase, userId, recipientId);
  await ensureContact(supabase, recipientId, userId);

  return { conversation, created: true };
}
