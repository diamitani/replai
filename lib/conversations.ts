import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationWithPreview } from "./types";

export async function getConversationsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ConversationWithPreview[]> {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !conversations) {
    throw new Error(error?.message ?? "Failed to load conversations");
  }

  const results: ConversationWithPreview[] = [];

  for (const conversation of conversations) {
    const otherUserId =
      conversation.user_a === userId ? conversation.user_b : conversation.user_a;

    const { data: otherUser } = await supabase
      .from("users")
      .select("id, email, display_name, username")
      .eq("id", otherUserId)
      .single();

    const { data: lastMessage } = await supabase
      .from("messages")
      .select("content, created_at, sender_id")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otherUser) {
      results.push({
        ...conversation,
        other_user: otherUser,
        last_message: lastMessage ?? undefined,
      });
    }
  }

  results.sort((a, b) => {
    const aTime = a.last_message?.created_at ?? a.created_at;
    const bTime = b.last_message?.created_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return results;
}

export function getOtherUserId(conversation: { user_a: string; user_b: string }, userId: string) {
  return conversation.user_a === userId ? conversation.user_b : conversation.user_a;
}

export function buildContactRules(contact: {
  tone_notes?: string | null;
  no_send_rules?: string | null;
  relationship_notes?: string | null;
}) {
  return [
    contact.tone_notes ? `Tone: ${contact.tone_notes}` : null,
    contact.no_send_rules ? `No-send rules: ${contact.no_send_rules}` : null,
    contact.relationship_notes ? `Relationship: ${contact.relationship_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
