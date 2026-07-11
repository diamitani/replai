import postgres from "postgres";
import { createAdminClient } from "@/lib/supabase/admin";

function canForceConfirm() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DATABASE_URL);
}

/**
 * Force-confirm an email so the user can sign in without a confirmation link.
 * Prefers service-role admin API; falls back to direct auth.users update.
 * Returns false when neither credential is configured (DB trigger may still confirm).
 */
export async function confirmUserEmail(email: string, userId?: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const admin = createAdminClient();

  if (admin) {
    if (userId) {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
      if (error) throw error;
      return true;
    }

    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (!user) throw new Error("User not found");

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (updateError) throw updateError;
    return true;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return false;
  }

  const sql = postgres(databaseUrl, { max: 1, ssl: "require" });
  try {
    if (userId) {
      await sql`
        UPDATE auth.users
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = ${userId}::uuid
      `;
    } else {
      await sql`
        UPDATE auth.users
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE lower(email) = ${normalized}
      `;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  return true;
}

export async function createConfirmedUser(input: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const admin = createAdminClient();

  if (admin) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName ?? email.split("@")[0],
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        await confirmUserEmail(email);
        return { created: false };
      }
      throw error;
    }

    return { created: true, userId: data.user.id };
  }

  // Public signup — DB trigger auto-confirms on insert when migration 005 is applied
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: input.fullName ?? email.split("@")[0] },
    },
  });

  if (error) throw error;

  // Best-effort force-confirm when service role / DATABASE_URL is available
  if (data.user && canForceConfirm()) {
    await confirmUserEmail(email, data.user.id);
  }

  return {
    created: true,
    userId: data.user?.id,
    session: Boolean(data.session),
  };
}
