'use client';
import { useState } from 'react';
import styles from './TutorsView.module.css';

const TUTORS = [
  { id: 't1', initials: 'MK', name: 'Miriam K.', focus: 'Analysis & Stochastik', bio: 'Mathe-Studentin im 5. Semester, 3 Jahre Nachhilfe-Erfahrung.', rating: 4.9, reviews: 42, price: 28 },
  { id: 't2', initials: 'LF', name: 'Lukas F.', focus: 'Lineare Algebra & Analysis', bio: 'Gymnasiallehrer i.A., spezialisiert auf Abitur-Vorbereitung Hessen.', rating: 5.0, reviews: 31, price: 35 },
  { id: 't3', initials: 'SR', name: 'Sara R.', focus: 'Stochastik & Grundkurs', bio: 'Mathematik B.Sc., hilft dir gezielt auf die hessischen Aufgabenformate.', rating: 4.8, reviews: 27, price: 24 },
];

const SLOTS = ['Mo 14:00', 'Mo 16:00', 'Di 10:00', 'Mi 15:00', 'Do 17:00', 'Fr 11:00'];

export default function TutorsView() {
  const [bookingTutor, setBookingTutor] = useState<string | null>(null);
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const tutor = TUTORS.find(t => t.id === bookingTutor);

  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>1:1 Nachhilfe</h1>
      <p className={styles.pblurb}>Buche eine Stunde mit einem echten Tutor – gezielt auf deine Lücken.</p>
      <div className={styles.list}>
        {TUTORS.map(t => (
          <div key={t.id} className={styles.tutorCard}>
            <div className={styles.tav}>{t.initials}</div>
            <div className={styles.tinfo}>
              <div className={styles.tn}>{t.name}</div>
              <div className={styles.tf}>{t.focus}</div>
              <div className={styles.trow}>
                <span className={styles.trate}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F5A623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {t.rating} ({t.reviews} Bewertungen)
                </span>
              </div>
              <div className={styles.tbio}>{t.bio}</div>
            </div>
            <div className={styles.tbook}>
              <div className={styles.tprice}>{t.price} €<small>/Stunde</small></div>
              <button className="btn primary btn sm" style={{ fontSize: 13 }} onClick={() => { setBookingTutor(t.id); setSelSlot(null); setBooked(false); }}>
                Termin buchen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking panel */}
      {bookingTutor && tutor && !booked && (
        <div className={styles.bookPanel}>
          <h3>Termin mit {tutor.name}</h3>
          <div className={styles.sech}>Freie Termine</div>
          <div className={styles.slots}>
            {SLOTS.map(s => (
              <button key={s} className={`${styles.slot} ${selSlot === s ? styles.selSlot : ''}`} onClick={() => setSelSlot(s)}>{s}</button>
            ))}
          </div>
          <div className={styles.demohint}>Prototyp: Es wird kein echter Termin gebucht — die Anfrage wird nur simuliert.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn light" onClick={() => setBookingTutor(null)}>Abbrechen</button>
            <button className="btn primary" disabled={!selSlot} onClick={() => setBooked(true)}>Termin anfragen</button>
          </div>
        </div>
      )}
      {bookingTutor && booked && (
        <div className={styles.bookPanel} style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8.5 12.5 11 15 16 9" />
            </svg>
          </div>
          <h3>Anfrage gesendet!</h3>
          <p style={{ color: 'var(--muted)', marginTop: 6, marginBottom: 16 }}>Dein Tutor meldet sich in Kürze bei dir.</p>
          <button className="btn light" onClick={() => setBookingTutor(null)}>Zurück</button>
        </div>
      )}
    </div>
  );
}
