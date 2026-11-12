import styles from './Bildband.module.css';

/**
 * Ein Foto über die volle Breite zwischen zwei Abschnitten.
 *
 * Trägt keinen Text und keine Bedienelemente: Es gliedert die Seite und zeigt,
 * worum es geht. Deshalb ist es für Vorleseprogramme beschrieben, aber nicht
 * anklickbar — ein Bild, das nichts tut, soll auch nicht so aussehen.
 */
export default function Bildband({ datei, alt, hoch = false }: { datei: string; alt: string; hoch?: boolean }) {
  return (
    <div className={`${styles.band} ${hoch ? styles.hoch : ''}`}>
      <img src={datei} alt={alt} loading="lazy" draggable={false} />
    </div>
  );
}
