import { useEffect } from 'react';

/**
 * Zurück-Wischen von der linken Bildschirmkante.
 *
 * In einer App erwartet das jeder — es ist die Bewegung, die man macht, ohne
 * darüber nachzudenken. Bewusst in der Web-Ebene gelöst statt nativ: So ist es
 * sofort auf dem Gerät, ohne die App neu zu bauen, und wirkt auch auf Android.
 *
 * Die Bedingungen sind eng gewählt, damit normales Scrollen und das Markieren
 * von Text nicht versehentlich zurückführen:
 * - Beginn höchstens 32 Punkte von der linken Kante
 * - mindestens 72 Punkte nach rechts
 * - dabei weniger als 44 Punkte senkrecht (sonst ist es Scrollen)
 * - nur ein Finger
 */
export function useZurueckWischen(aktiv: boolean, zurueck: () => void) {
  useEffect(() => {
    if (!aktiv) return;

    let startX = 0;
    let startY = 0;
    let ausgeloest = false;
    let kandidat = false;

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) { kandidat = false; return; }
      const beruehrung = event.touches[0];
      kandidat = beruehrung.clientX <= 32;
      ausgeloest = false;
      startX = beruehrung.clientX;
      startY = beruehrung.clientY;
    };

    const onMove = (event: TouchEvent) => {
      if (!kandidat || ausgeloest || event.touches.length !== 1) return;
      const beruehrung = event.touches[0];
      const dx = beruehrung.clientX - startX;
      const dy = Math.abs(beruehrung.clientY - startY);
      if (dx > 72 && dy < 44) {
        ausgeloest = true;
        kandidat = false;
        // Kurzes haptisches Echo, wie iOS es beim Zurückwischen gibt.
        try { navigator.vibrate?.(8); } catch { /* Gerät ohne Vibration */ }
        zurueck();
      }
    };

    const onEnd = () => { kandidat = false; };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [aktiv, zurueck]);
}
