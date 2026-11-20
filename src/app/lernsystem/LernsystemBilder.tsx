'use client';

import ProduktBild from '@/components/ProduktBild';
import { useKundenstand } from '@/lib/kundenstand';

/**
 * Die Produktaufnahmen auf der Lernsystem-Seite.
 *
 * Eigener Baustein, weil der Hinweis auf dem Bild vom Anmeldestand abhängt:
 * „Kostenlos testen" ist für jemanden mit gekauftem Kurs schlicht falsch.
 * Die Seite selbst bleibt dadurch eine Server-Komponente.
 */
export default function LernsystemBilder({ art }: { art: 'uebersicht' | 'reel' }) {
  const { angemeldet } = useKundenstand();
  const hinweis = angemeldet ? 'Weiterlernen' : 'Kostenlos testen';
  const ziel = angemeldet ? '/?view=dashboard' : '/?view=analysis';

  if (art === 'reel') {
    /* Das Reel-Bild führt in den Reel-Modus, nicht ins Dashboard. Für Gäste
       geht das nicht: /feed verlangt ein Konto und schickt sie sonst wortlos
       auf die Startseite zurück. Sie landen deshalb im kostenlosen Kurs. */
    return (
      <ProduktBild
        name="reel"
        alt="Der Reel-Modus auf dem Handy: eine Funktion mit ihrem Graphen, darunter verstanden, wiederholen oder nicht verstanden."
        breite={860}
        hoehe={1760}
        hinweis={angemeldet ? 'Zum Reel-Modus' : hinweis}
        ziel={angemeldet ? '/feed' : ziel}
      />
    );
  }

  return (
    <ProduktBild
      name="uebersicht"
      alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema, offene Aufgaben und der nächste Schritt."
      breite={2560}
      hoehe={1800}
      hinweis={hinweis}
      ziel={ziel}
    />
  );
}
