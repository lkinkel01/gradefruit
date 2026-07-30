/**
 * Was beim bewussten Anmelden im Browser vermerkt werden muss.
 *
 * Zwei Dinge, die leicht zu vergessen sind und beide böse enden:
 *
 * 1. Die Geräte-Markierung — nur eine bewusste Anmeldung darf das Gerät
 *    übernehmen. Ein bloßes Neuladen darf es nicht, sonst reißt jedes Gerät
 *    beim Seitenaufruf den Anspruch an sich und wirft das andere hinaus.
 *
 * 2. Der Zeitstempel der letzten Aktivität — wer sich anmeldet, IST aktiv.
 *    Ohne ihn gilt der Wert der VORIGEN Sitzung; liegt der über zwei Stunden
 *    zurück, meldet die Leerlauf-Sperre denselben Nutzer in der Sekunde wieder
 *    ab, in der die Anmeldung gelang.
 *
 * Deshalb steht es hier an einer Stelle statt an dreien. Jeder neue Weg in ein
 * Konto (Anmeldemaske, Google, Passwort zurücksetzen) ruft das hier auf.
 */
export function bewussteAnmeldung(): void {
  try {
    sessionStorage.setItem('gf-claim-device', '1');
    localStorage.setItem('gf-last-activity', String(Date.now()));
  } catch { /* Speicher gesperrt */ }
}
