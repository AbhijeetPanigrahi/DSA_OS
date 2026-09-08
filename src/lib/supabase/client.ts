import { createBrowserClient } from "@supabase/ssr";
import { validateEnvironment } from "@/config/environment";

export function createClient() {
  const env = validateEnvironment();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
