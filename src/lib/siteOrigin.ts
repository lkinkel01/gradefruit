import 'server-only';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function parseAllowedOrigin(value: string, allowLocalHttp: boolean): string | null {
  try {
    const url = new URL(value);
    const isHttps = url.protocol === 'https:';
    const isLocalHttp =
      allowLocalHttp && url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname);

    return isHttps || isLocalHttp ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * Liefert eine feste, vertrauenswürdige Basis-URL für serverseitig erzeugte
 * Rücksprung-Links. Der Origin-Header der Anfrage ist absichtlich keine Quelle:
 * Er kann von einem Client frei gesetzt werden.
 */
export function getTrustedSiteOrigin(request: Request): string {
  const allowLocalHttp = process.env.NODE_ENV !== 'production';
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    const origin = parseAllowedOrigin(configured, allowLocalHttp);
    if (origin) return origin;
    throw new Error(
      'NEXT_PUBLIC_SITE_URL muss eine gültige HTTPS-URL sein (lokal ist HTTP auf localhost erlaubt).',
    );
  }

  if (allowLocalHttp) {
    const localOrigin = parseAllowedOrigin(request.url, true);
    if (localOrigin) return localOrigin;
  }

  throw new Error('NEXT_PUBLIC_SITE_URL fehlt auf dem Server.');
}
