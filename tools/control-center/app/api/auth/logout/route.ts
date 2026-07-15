import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const client = await createClient();
  await client.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
