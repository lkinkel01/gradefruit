export class ValidationError extends Error {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function record(value: unknown, label = "Eingabe"): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(`${label} muss ein Objekt sein.`);
  }
  return value as Record<string, unknown>;
}

export function text(
  value: unknown,
  label: string,
  options: { required?: boolean; max?: number } = {},
): string {
  const { required = false, max = 4_000 } = options;
  if (value === undefined || value === null) {
    if (required) throw new ValidationError(`${label} ist erforderlich.`);
    return "";
  }
  if (typeof value !== "string") throw new ValidationError(`${label} muss Text sein.`);
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (required && !normalized) throw new ValidationError(`${label} ist erforderlich.`);
  if (normalized.length > max) throw new ValidationError(`${label} darf höchstens ${max} Zeichen enthalten.`);
  if (normalized.includes("\0")) throw new ValidationError(`${label} enthält ungültige Zeichen.`);
  if (/(?<![A-Za-z0-9])(?:sk_(?:live|test)_[A-Za-z0-9]{12,}|sk-[A-Za-z0-9_-]{20,}|gh[opsu]_[A-Za-z0-9]{20,}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY)/.test(normalized)) {
    throw new ValidationError(`${label} sieht nach einem Secret aus und wird nicht gespeichert.`);
  }
  return normalized;
}

export function enumValue<T extends readonly string[]>(value: unknown, label: string, values: T): T[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new ValidationError(`${label} hat keinen erlaubten Wert.`);
  }
  return value as T[number];
}

export function identifier(value: unknown, label: string): string {
  const result = text(value, label, { required: true, max: 80 });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result)) {
    throw new ValidationError(`${label} hat ein ungültiges Format.`);
  }
  return result;
}

export function integer(
  value: unknown,
  label: string,
  options: { min: number; max: number; fallback: number },
): number {
  const candidate = value === undefined || value === null ? options.fallback : value;
  if (!Number.isInteger(candidate) || Number(candidate) < options.min || Number(candidate) > options.max) {
    throw new ValidationError(`${label} muss zwischen ${options.min} und ${options.max} liegen.`);
  }
  return Number(candidate);
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 10
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

export function safeUrl(value: unknown, label: string, allowEmpty = true): string {
  const result = text(value, label, { required: !allowEmpty, max: 500 });
  if (!result && allowEmpty) return "";
  let parsed: URL;
  try {
    parsed = new URL(result);
  } catch {
    throw new ValidationError(`${label} ist keine gültige URL.`);
  }
  const local = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost" || isPrivateIpv4(parsed.hostname);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && local)) {
    throw new ValidationError(`${label} muss HTTPS oder eine lokale HTTP-Adresse verwenden.`);
  }
  if (parsed.username || parsed.password) throw new ValidationError(`${label} darf keine Zugangsdaten enthalten.`);
  return parsed.toString().replace(/\/$/, "");
}
