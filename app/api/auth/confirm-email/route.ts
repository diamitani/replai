import { createClient } from "@supabase/supabase-js";
import { confirmUserEmail } from "@/lib/auth/confirm";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Verifies password via sign-in attempt, then force-confirms the email
 * when Supabase still has "Confirm email" enabled.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = bodySchema.parse(await request.json());
    const normalized = email.trim().toLowerCase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });

    if (!error) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    const notConfirmed =
      error.message.toLowerCase().includes("not confirmed") ||
      error.code === "email_not_confirmed";

    if (!notConfirmed) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    await confirmUserEmail(normalized);
    return NextResponse.json({ ok: true, confirmed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Confirm failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
