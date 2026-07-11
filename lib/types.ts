export type User = {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  is_discoverable: boolean;
  created_at: string;
};

export type PublicUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  is_discoverable: boolean;
};

export type UserSearchResult = PublicUser & {
  match_type: "username" | "name";
};

export type ContactInviteStatus = "pending" | "accepted" | "declined";

export type ContactInvite = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: ContactInviteStatus;
  created_at: string;
  responded_at: string | null;
};

export type ContactInviteWithUser = ContactInvite & {
  other_user: PublicUser;
  direction: "incoming" | "outgoing";
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
  other_user: Pick<User, "id" | "email" | "display_name" | "username">;
  last_message?: Pick<Message, "content" | "created_at" | "sender_id">;
};
