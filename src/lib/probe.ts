/**
 * Wie groß der kostenlose Anfang eines Themas ist.
 *
 * Diese beiden Zahlen standen bisher nur in `src/app/api/content/route.ts`.
 * Das reichte, solange nur der Server sie brauchte — die Oberfläche las ja
 * ab, wie viel tatsächlich geliefert wurde. Die Seitenleiste kann das nicht:
 * Sie zeigt die Gliederung ALLER Themen, auch der noch nicht geladenen, und
 * würde sonst Überschriften anbieten, hinter denen nichts liegt.
 *
 * Wichtig: Das hier ist reine Anzeige. Gekürzt wird weiterhin auf dem Server,
 * und zwar bevor irgendetwas den Rechner verlässt. Wer diese Datei ändert,
 * ändert nur, was die Navigation anbietet, nicht was ausgeliefert wird — die
 * Bezahlschranke hängt nicht daran.
 */
export const PROBE_ABSCHNITTE = 3;
export const PROBE_AUFGABEN = 5;
