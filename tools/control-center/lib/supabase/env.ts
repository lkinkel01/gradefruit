const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SupabaseEnvironment {
  url: string;
  publishableKey: string;
  ownerId: string;
}

export function readSupabaseEnvironment(): SupabaseEnvironment | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const ownerId = process.env.WORKSPACE_OWNER_ID?.trim() ?? "";
  if (!url || !publishableKey || !UUID_PATTERN.test(ownerId)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co")) return null;
  } catch {
    return null;
  }
  return { url, publishableKey, ownerId };
}

export function requireSupabaseEnvironment(): SupabaseEnvironment {
  const environment = readSupabaseEnvironment();
  if (!environment) throw new Error("Der Gradefruit Workspace ist noch nicht mit seinem separaten Supabase-Projekt verbunden.");
  return environment;
}

export function publicSupabaseEnvironment(): Pick<SupabaseEnvironment, "url" | "publishableKey"> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}
