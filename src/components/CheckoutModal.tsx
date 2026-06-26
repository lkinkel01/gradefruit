'use client';
import { useState } from 'react';
import styles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export default function CheckoutModal({ open, onClose, onPurchase }: Props) {
  const [selected, setSelected] = useState<'full' | 'month'>('full');

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.open : ''}`} onClick={onClose} />
      <div className={`${styles.modal} ${open ? styles.open : ''}`} role="dialog">
        <div className={styles.mhead}>
          <button className={styles.mclose} onClick={onClose}>✕</button>
          <div className={styles.ptag}>Mathe-Abi Hessen 2027 · Grundkurs</div>
          <h2>Vollzugang</h2>
          <p>Alle Themen, Aufgaben, Altklausuren, Erklärvideos und Fragen an KI &amp; Tutor.</p>
        </div>
        <div className={styles.mbody}>
          <div
            className={`${styles.opt} ${selected === 'full' ? styles.sel : ''}`}
            onClick={() => setSelected('full')}
          >
            <div className={styles.radio} />
            <div className={styles.ox}><b>Komplettkurs</b><small>einmalig · Zugang bis zur Prüfung</small></div>
            <div className={styles.op}>79 €</div>
          </div>
          <div
            className={`${styles.opt} ${selected === 'month' ? styles.sel : ''}`}
            onClick={() => setSelected('month')}
          >
            <div className={styles.radio} />
            <div className={styles.ox}><b>Monatlich</b><small>monatlich kündbar</small></div>
            <div className={styles.op}>14,90 €<small>/ Monat</small></div>
          </div>
          <div className={styles.demohint}>Prototyp: Es werden keine Zahlungsdaten abgefragt. Der Button schaltet den Kurs zur Ansicht frei.</div>
          <button className="btn primary" style={{ width: '100%' }} onClick={onPurchase}>
            Zugang freischalten
          </button>
        </div>
      </div>
    </>
  );
}
