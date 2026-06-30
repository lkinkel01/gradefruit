'use client';
import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useAuth } from '@/lib/AuthContext';
import styles from './AskDrawer.module.css';

interface Message { role: 'user' | 'ai'; text: string; }

interface Props {
  open: boolean;
  ctx: string;
  snippet: string;
  onClose: () => void;
}

interface Attachment {
  kind: 'image' | 'pdf';
  media_type: string;
  data: string; // Base64 ohne "data:"-Präfix
  name: string;
}

const PRESETS = [
  'Erkläre mir diesen Schritt nochmal',
  'Gibt es eine einfachere Methode?',
  'Welche Formel brauche ich hier?',
  'Was sind typische Fehler dabei?',
];

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

// Datei in Base64 umwandeln (ohne "data:...;base64,"-Präfix)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Ersetzt den Text der letzten KI-Nachricht (für das Streaming)
function updateLastAi(list: Message[], text: string): Message[] {
  const copy = [...list];
  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].role === 'ai') { copy[i] = { ...copy[i], text }; break; }
  }
  return copy;
}

export default function AskDrawer({ open, ctx, snippet, onClose }: Props) {
  const { session } = useAuth();
  const [mode, setMode] = useState<'ki' | 'tutor'>('ki');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Beim Öffnen / Themenwechsel alles zurücksetzen
  useEffect(() => {
    if (open) {
      setMessages([]);
      setAttachment(null);
      setFileError('');
      setInput('');
    }
  }, [open, ctx]);

  // Automatisch nach unten scrollen, wenn neue Inhalte kommen
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // erlaubt erneutes Auswählen derselben Datei
    if (!file) return;
    setFileError('');

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      setFileError('Bitte ein Foto (JPG, PNG) oder eine PDF hochladen.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('Die Datei ist zu groß (max. 4 MB). Bitte ein kleineres Foto/PDF nehmen.');
      return;
    }
    try {
      const data = await fileToBase64(file);
      setAttachment({
        kind: isPdf ? 'pdf' : 'image',
        media_type: isPdf ? 'application/pdf' : file.type,
        data,
        name: file.name,
      });
    } catch {
      setFileError('Datei konnte nicht gelesen werden. Bitte erneut versuchen.');
    }
  }

  async function send(text: string) {
    const question = text.trim();
    if ((!question && !attachment) || busy) return;

    // Tutor-Modus: noch kein echter Versand, freundlicher Platzhalter
    if (mode === 'tutor') {
      const label = attachment
        ? (question ? `${question}\n${attachment.name}` : attachment.name)
        : question;
      setMessages(prev => [
        ...prev,
        { role: 'user', text: label },
        { role: 'ai', text: 'Alles klar! Deine Frage ist bei deinem Tutor gelandet. Er meldet sich normalerweise innerhalb von 2 Stunden bei dir.' },
      ]);
      setInput('');
      setAttachment(null);
      return;
    }

    // KI-Modus: braucht eine Anmeldung
    if (!session?.access_token) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bitte melde dich an, um die KI zu nutzen.' }]);
      return;
    }

    // Verlauf festhalten, BEVOR die neue Nachricht hinzugefügt wird
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const sentAttachment = attachment;
    const userLabel = sentAttachment
      ? (question ? `${question}\n${sentAttachment.name}` : sentAttachment.name)
      : question;

    // Nutzer-Nachricht + leere KI-Nachricht (wird gestreamt) anzeigen
    setMessages(prev => [...prev, { role: 'user', text: userLabel }, { role: 'ai', text: '' }]);
    setInput('');
    setAttachment(null);
    setBusy(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ question, context: ctx, snippet, history, attachment: sentAttachment }),
      });

      if (!res.ok) {
        let msg = 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.';
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch { /* keine JSON-Antwort */ }
        setMessages(prev => updateLastAi(prev, msg));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setMessages(prev => updateLastAi(prev, 'Keine Antwort erhalten. Bitte versuch es noch einmal.'));
        return;
      }

      // Antwort Stück für Stück anzeigen (Streaming)
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages(prev => updateLastAi(prev, acc));
      }
      acc += decoder.decode();
      setMessages(prev => updateLastAi(prev, acc.trim() || 'Keine Antwort erhalten. Bitte versuch es noch einmal.'));
    } catch {
      setMessages(prev => updateLastAi(prev, 'Verbindung fehlgeschlagen. Bitte prüfe dein Internet und versuch es erneut.'));
    } finally {
      setBusy(false);
    }
  }

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
          {mode === 'ki' ? 'Sofortige Antwort von der KI – auf Deutsch, Schritt für Schritt.' : 'Schreibe deinem Tutor — er antwortet innerhalb von 2 h.'}
        </div>

        <div className={styles.dbody} ref={bodyRef}>
          {messages.length === 0 && !busy && (
            <div className={styles.empty}>Stell deine erste Frage zu diesem Thema – oder lade ein Foto deiner Aufgabe/Lösung hoch.</div>
          )}
          {messages.map((m, i) => {
            const showTyping = m.role === 'ai' && m.text === '' && busy && i === messages.length - 1;
            return (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.q : styles.a}`}>
                {showTyping
                  ? <span className={styles.typing}><span /><span /><span /></span>
                  : m.text}
              </div>
            );
          })}
          {messages.length === 0 && !busy && (
            <div className={styles.presets}>
              <div className={styles.pt}>Schnellfragen</div>
              {PRESETS.map(p => (
                <button key={p} className={styles.pchip} onClick={() => send(p)} disabled={busy}>{p}</button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dfoot}>
          {fileError && <div className={styles.fileError}>{fileError}</div>}
          {attachment && (
            <div className={styles.attachChip}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              <span className={styles.attachName}>{attachment.name}</span>
              <button className={styles.attachRemove} onClick={() => setAttachment(null)} aria-label="Anhang entfernen">✕</button>
            </div>
          )}
          <div className={styles.askform}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              aria-label="Foto oder PDF anhängen"
              title="Foto oder PDF anhängen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !busy) send(input); }}
              placeholder={mode === 'ki' ? 'Frage eingeben …' : 'Nachricht an deinen Tutor …'}
              disabled={busy}
            />
            <button onClick={() => send(input)} disabled={busy} aria-label="Senden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
