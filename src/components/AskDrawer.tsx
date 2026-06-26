'use client';
import { useState, useEffect } from 'react';
import styles from './AskDrawer.module.css';

interface Message { role: 'user' | 'ai'; text: string; }

interface Props {
  open: boolean;
  ctx: string;
  snippet: string;
  onClose: () => void;
}

const PRESETS = [
  'Erkläre mir diesen Schritt nochmal',
  'Gibt es eine einfachere Methode?',
  'Welche Formel brauche ich hier?',
  'Was sind typische Fehler dabei?',
];

const AI_REPLIES: Record<string, string> = {
  default: 'Das ist eine gute Frage! In der Mathematik gilt hier: Schau dir zuerst die gegebenen Informationen an, leite die relevante Formel her und setze dann Schritt für Schritt ein. Soll ich einen bestimmten Schritt genauer erklären?',
};

export default function AskDrawer({ open, ctx, snippet, onClose }: Props) {
  const [mode, setMode] = useState<'ki' | 'tutor'>('ki');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (open) setMessages([]);
  }, [open, ctx]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: AI_REPLIES.default }]);
    }, 1200);
  };

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.open : ''}`} onClick={onClose} />
      <aside className={`${styles.drawer} ${open ? styles.open : ''}`} role="dialog">
        <div className={styles.dhead}>
          <button className={styles.dclose} onClick={onClose}>✕</button>
          <div className={styles.dctx}>{ctx || 'Frage'}</div>
          <h2>Frage stellen</h2>
          {snippet && <div className={styles.snippet}><span className={styles.snipLabel}>Aufgabe</span>{snippet.slice(0, 120)}{snippet.length > 120 ? '…' : ''}</div>}
        </div>

        <div className={styles.seg}>
          <button className={mode === 'ki' ? styles.on : ''} onClick={() => setMode('ki')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v2M5 8l1.5 1M19 8l-1.5 1"/><rect x="6" y="9" width="12" height="9" rx="3"/><path d="M9.5 13h.01M14.5 13h.01"/></svg>
            Sofort per KI
          </button>
          <button className={mode === 'tutor' ? styles.on : ''} onClick={() => setMode('tutor')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/></svg>
            An einen Tutor
          </button>
        </div>
        <div className={styles.modeHint}>
          {mode === 'ki' ? 'Sofortige Antwort von der KI.' : 'Schreibe deinem Tutor — er antwortet innerhalb von 2 h.'}
        </div>

        <div className={styles.dbody}>
          {messages.length === 0 && !typing && (
            <div className={styles.empty}>Stell deine erste Frage zu diesem Thema.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.q : styles.a}`}>
              {m.text}
            </div>
          ))}
          {typing && (
            <div className={`${styles.msg} ${styles.a} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          )}
          {messages.length === 0 && !typing && (
            <div className={styles.presets}>
              <div className={styles.pt}>Schnellfragen</div>
              {PRESETS.map(p => (
                <button key={p} className={styles.pchip} onClick={() => send(p)}>{p}</button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dfoot}>
          <div className={styles.askform}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Frage eingeben …"
            />
            <button onClick={() => send(input)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
