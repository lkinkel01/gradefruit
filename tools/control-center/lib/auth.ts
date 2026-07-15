import "server-only";

import { createClient } from "./supabase/server";
import { requireSupabaseEnvironment } from "./supabase/env";

export class WorkspaceAuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "WorkspaceAuthError";
  }
}

export async function requireWorkspaceUser() {
  const identity = await requireWorkspaceIdentity();
  if (identity.claims.aal !== "aal2") throw new WorkspaceAuthError("Bitte bestätige zuerst den zweiten Anmeldefaktor.", 403);
  return identity;
}

export async function requireWorkspaceIdentity() {
  const environment = requireSupabaseEnvironment();
  const client = await createClient();
  const { data, error } = await client.auth.getClaims();
  const subject = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (error || !subject) throw new WorkspaceAuthError("Bitte melde dich erneut an.", 401);
  if (subject !== environment.ownerId) throw new WorkspaceAuthError("Dieses Konto ist für den Gradefruit Workspace nicht freigeschaltet.", 403);
  return { client, ownerId: subject, claims: data!.claims };
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  let originHost = "";
  try {
    originHost = origin ? new URL(origin).host : "";
  } catch {
    originHost = "";
  }
  if (!originHost || originHost !== requestHost || (fetchSite && fetchSite !== "same-origin")) {
    throw new WorkspaceAuthError("Die Anfrage wurde aus Sicherheitsgründen abgewiesen.", 403);
  }
}
