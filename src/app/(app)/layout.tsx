import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Learner";

  return <AppShell displayName={displayName}>{children}</AppShell>;
}
