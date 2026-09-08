"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  signupSchema,
  AuthActionResult,
} from "../schemas/auth-schema";

export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const parsed = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/dashboard");
}

export async function signupAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawDisplayName = formData.get("displayName");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const parsed = signupSchema.safeParse({
    displayName: rawDisplayName,
    email: rawEmail,
    password: rawPassword,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const user = authData.user;

  if (user) {
    // 2. Initialize profile and user_settings records if authenticated session exists
    try {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: parsed.data.displayName,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          weekday_problem_target: 2,
          weekday_revision_target: 1,
          saturday_revision_target: 3,
          difficulty_mode: "adaptive",
          daily_practice_reminder_enabled: true,
          revision_reminder_enabled: true,
          theme: "system",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch (dbErr) {
      // Non-fatal if database table RLS/migration is not yet applied; Auth user creation succeeded
      console.warn("Profile/settings initial setup notice:", dbErr);
    }
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
