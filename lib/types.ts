export type User = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  owner_id: string;
  contact_user_id: string;
  tone_notes: string | null;
  no_send_rules: string | null;
  relationship_notes: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  ai_original_draft: string | null;
  ai_was_rewritten: boolean;
  created_at: string;
};

export type ConversationWithPreview = Conversation & {
  other_user: Pick<User, "id" | "email" | "display_name">;
  last_message?: Pick<Message, "content" | "created_at" | "sender_id">;
};
