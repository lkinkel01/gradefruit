export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json()) as { ok: boolean; data?: T; error?: string };
  if (!response.ok || !payload.ok || payload.data === undefined) {
    if (response.status === 401 && typeof window !== "undefined") window.location.assign("/login");
    throw new Error(payload.error || "Die Anfrage ist fehlgeschlagen.");
  }
  return payload.data;
}
