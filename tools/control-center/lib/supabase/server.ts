import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../database.types";
import { requireSupabaseEnvironment } from "./env";

export async function createClient() {
  const environment = requireSupabaseEnvironment();
  const cookieStore = await cookies();
  return createServerClient<Database>(environment.url, environment.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          for (const { name, value, options } of items) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes them instead.
        }
      },
    },
  });
}
