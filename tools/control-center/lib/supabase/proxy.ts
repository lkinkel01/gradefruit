import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "../database.types";
import { readSupabaseEnvironment } from "./env";

function withCookies(target: NextResponse, source: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  return target;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const environment = readSupabaseEnvironment();
  const loginPage = request.nextUrl.pathname === "/login";
  const apiRequest = request.nextUrl.pathname.startsWith("/api/");
  const identityCheck = request.nextUrl.pathname === "/api/auth/identity";
  if (!environment) {
    if (loginPage) return NextResponse.next({ request });
    if (apiRequest) return NextResponse.json({ ok: false, error: "Der Gradefruit Workspace ist noch nicht eingerichtet." }, { status: 503 });
    return NextResponse.redirect(new URL("/login?reason=config", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(environment.url, environment.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        for (const { name, value } of cookies) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookies) response.cookies.set(name, value, options);
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const subject = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  const owner = !error && subject === environment.ownerId;
  const aal2 = owner && data?.claims?.aal === "aal2";

  if (loginPage) {
    return aal2 ? withCookies(NextResponse.redirect(new URL("/overview", request.url)), response) : response;
  }
  if (!owner) {
    if (apiRequest) return withCookies(NextResponse.json({ ok: false, error: "Bitte melde dich erneut an." }, { status: 401 }), response);
    return withCookies(NextResponse.redirect(new URL("/login", request.url)), response);
  }
  if (identityCheck) return response;
  if (!aal2) {
    if (apiRequest) return withCookies(NextResponse.json({ ok: false, error: "Die Zwei-Faktor-Anmeldung ist noch nicht abgeschlossen." }, { status: 403 }), response);
    return withCookies(NextResponse.redirect(new URL("/login?reason=mfa", request.url)), response);
  }
  return response;
}
