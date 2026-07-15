import { LoginClient } from "@/components/LoginClient";
import { readSupabaseEnvironment } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const message = reason === "mfa" ? "Bitte schließe die Zwei-Faktor-Anmeldung ab." : "";
  return <LoginClient configured={Boolean(readSupabaseEnvironment())} initialMessage={message} />;
}
