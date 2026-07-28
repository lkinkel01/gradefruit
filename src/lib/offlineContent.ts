// ===========================================================================
// Kursinhalte für den Offline-Zugriff auf dem Gerät ablegen.
//
// EHRLICHE EINORDNUNG ZUR VERSCHLÜSSELUNG: Die Inhalte werden verschlüsselt
// abgelegt, aber der Schlüssel liegt zwangsläufig auf demselben Gerät — sonst
// wäre Lesen ohne Netz unmöglich. Das erschwert das Mitlesen erheblich
// (nichts steht im Klartext in der Datenbank des Browsers), hält aber niemanden
// auf, der das Gerät in der Hand hat und weiß, was er tut. Es ist eine Hürde,
// kein Tresor.
//
// Was es dagegen sicher tut: Die Ablage gehört immer genau einem Konto. Meldet
// sich jemand anderes an, wird sie restlos gelöscht — auf einem geteilten
// Gerät bleibt nichts vom Vorgänger liegen.
// ===========================================================================

const DB_NAME = 'gradefruit-offline';
const STORE = 'inhalte';
const KEY_STORAGE = 'gf-offline-key';
const DB_VERSION = 1;

interface StoredEntry {
  id: string;          // `${userId}:${topic}:${level}`
  userId: string;
  iv: number[];
  data: number[];      // verschlüsselte Nutzdaten
  gespeichertAm: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Geräte-Schlüssel. Wird einmal je Installation erzeugt und im lokalen Speicher
 * gehalten — ohne ihn ließe sich offline nichts entschlüsseln.
 */
async function deviceKey(): Promise<CryptoKey> {
  let raw = '';
  try { raw = localStorage.getItem(KEY_STORAGE) ?? ''; } catch { /* Speicher gesperrt */ }

  if (!raw) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    raw = btoa(String.fromCharCode(...bytes));
    try { localStorage.setItem(KEY_STORAGE, raw); } catch { /* Speicher gesperrt */ }
  }

  const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

const entryId = (userId: string, topic: string, level: string) => `${userId}:${topic}:${level}`;

/** Legt die Inhalte eines Themas verschlüsselt ab. Fehler bleiben folgenlos. */
export async function speichereOffline(
  userId: string,
  topic: string,
  level: string,
  payload: unknown,
): Promise<void> {
  try {
    const key = await deviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const klartext = new TextEncoder().encode(JSON.stringify(payload));
    const verschluesselt = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, klartext);

    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const entry: StoredEntry = {
        id: entryId(userId, topic, level),
        userId,
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(verschluesselt)),
        gespeichertAm: Date.now(),
      };
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch { /* Ohne Ablage funktioniert alles wie bisher, nur ohne Offline. */ }
}

/** Holt abgelegte Inhalte zurück — nur für dasselbe Konto. */
export async function ladeOffline<T>(
  userId: string,
  topic: string,
  level: string,
): Promise<T | null> {
  try {
    const db = await openDb();
    const entry = await new Promise<StoredEntry | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(entryId(userId, topic, level));
      request.onsuccess = () => resolve(request.result as StoredEntry | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();

    // Fremde Ablage niemals anfassen, auch wenn der Schlüssel passen würde.
    if (!entry || entry.userId !== userId) return null;

    const key = await deviceKey();
    const klartext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(entry.iv) },
      key,
      new Uint8Array(entry.data),
    );
    return JSON.parse(new TextDecoder().decode(klartext)) as T;
  } catch {
    return null;
  }
}

/** Räumt die Ablage vollständig — beim Abmelden und beim Nutzerwechsel. */
export async function loescheOffline(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch { /* Nichts zu räumen */ }
}
