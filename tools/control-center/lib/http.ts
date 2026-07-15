import { ValidationError } from "./validation";

export async function jsonBody(request: Request, maximumBytes = 256_000): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > maximumBytes) throw new ValidationError("Die Anfrage ist zu groß.");
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Die Anfrage enthält kein gültiges JSON.");
  }
}

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json(
    { ok: true, data },
    { status: init?.status ?? 200, headers: { "Cache-Control": "no-store", ...init?.headers } },
  );
}

export function apiError(error: unknown): Response {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: number }).status) || 500
    : 500;
  const message = error instanceof Error ? error.message : "Die Aktion ist fehlgeschlagen.";
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
