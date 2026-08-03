/**
 * Wer darf Screenshots machen?
 *
 * Der Screenshot-Schutz in der App (siehe `native/ios/App/App/AppDelegate.swift`)
 * ist für Käufer da: Die Kursinhalte gehören zum Zugang und sollen nicht als
 * Bild weiterwandern. Für die Entwicklung ist er im Weg — ohne Screenshots gibt
 * es keine Rückmeldung darüber, wie die App tatsächlich aussieht.
 *
 * Deshalb diese eine Liste. Sie ist die EINZIGE Stelle, an der entschieden
 * wird, für wen der Schutz ausgesetzt wird. Alles andere (Konto, Kauf, Inhalte)
 * bleibt für diese Konten unverändert.
 *
 * **Warum Fingerabdrücke statt Adressen:** Dieses Verzeichnis liegt öffentlich
 * auf GitHub. Eine E-Mail-Adresse im Klartext wäre damit veröffentlicht — und
 * Adressen, die öffentlich herumliegen, bekommen Werbung und
 * Anmelde-Versuche. Der Fingerabdruck (SHA-256) erfüllt denselben Zweck: Die
 * App kann prüfen, ob eine Adresse dazugehört, aber aus ihm lässt sich keine
 * Adresse zurückgewinnen.
 *
 * Eine neue Adresse aufnehmen:
 *   node -e "console.log(require('crypto').createHash('sha256').update('DIE@ADRESSE').digest('hex'))"
 *
 * Wichtig zu wissen: Das ist eine Bequemlichkeit, keine Sicherheitsgrenze. Sie
 * wird im Browser entschieden. Wer den Schutz wirklich aushebeln will, hält
 * ohnehin ein zweites Handy vor den Bildschirm — dagegen hilft nichts, in
 * keiner App der Welt.
 */

/**
 * Fingerabdrücke der freigestellten Konten.
 *
 * Bewusst eine namentliche Liste und KEIN Muster: Ein Muster wie „alle Adressen
 * mit .test@" wäre von außen erratbar — wer es kennt, legt sich ein Konto an,
 * das darauf passt, und der Schutz ist für ihn aus. Eine Liste kann nur
 * erweitern, wer diese Datei ändert.
 */
const FREIGESTELLT = [
  // Leon
  'fb248b072a94d631d7d2275ce64b0442a675d250707510e7ed8ad623ab9b9605',
];

async function fingerabdruck(text: string): Promise<string | null> {
  try {
    const roh = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(roh))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // Ohne sichere Herkunft (http statt https) gibt es crypto.subtle nicht.
    // Dann eben kein Freibrief — geschützt ist die richtige Vorgabe.
    return null;
  }
}

export async function screenshotsFrei(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const abdruck = await fingerabdruck(email.trim().toLowerCase());
  return abdruck !== null && FREIGESTELLT.includes(abdruck);
}

/**
 * Der Schlüssel, unter dem die App die Antwort ablegt.
 *
 * Die native Hülle liest ihn beim Aktivieren aus und merkt ihn sich. Sie kann
 * ihn nicht selbst berechnen — sie weiß nichts von Konten.
 */
export const SCHUTZ_KEY = 'gf-screenshot-frei';
