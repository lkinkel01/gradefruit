'use client';
import { useEffect, useState } from 'react';
import { View, TOPICS, LernStatus, STATUS_LABEL } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { GrapefruitProgress } from './Logo';
import { ArrowRightIcon } from './UiIcons';
import { indexFor } from '@/lib/contentIndex';
import { useTopicContent } from '@/lib/ContentContext';
import { useImAppRahmen } from '@/lib/nativeApp';
import styles from './ReviewView.module.css';

// Wiederholen: das Herz des Lernsystems. Jeder Inhalt lässt sich als
// „Verstanden", „Wiederholen" oder „Nicht verstanden" einordnen – hier werden die
// Einordnungen nach Lernstufe und Thema gefiltert und direkt geöffnet.
// Die Oberfläche ist bewusst auf Active Recall / Spaced Repetition
// vorbereitet: die Filter unten sind die spätere Wiederhol-Warteschlange.

type TopicId = 'analysis' | 'linalg' | 'stochastik';

// Diese Seite listet nur, was schon eingeordnet wurde — dafür genügen
// Nummer und Überschrift aus dem Inhaltsverzeichnis. Der Aufgabentext selbst
// wird erst beim Öffnen vom Server geholt.

type StatusFilter = 'alle' | Exclude<LernStatus, 'none'>;
const STATUS_FILTERS: StatusFilter[] = ['alle', 'unklar', 'wiederholen', 'verstanden'];

// Ampel: grün = verstanden, gelb = wiederholen, rot = nicht verstanden.
const STATUS_DOT: Record<Exclude<LernStatus, 'none'>, string> = {
  verstanden: 'var(--green)',
  wiederholen: 'var(--yellow)',
  unklar: 'var(--danger)',
};

interface Props {
  level: 'gk' | 'lk';
  onNavigate: (v: View) => void;
}

export default function ReviewView({ level, onNavigate }: Props) {
  const imApp = useImAppRahmen();
  // Der Aufgabentext in der Vorschau kommt vom Server. Feste Reihenfolge,
  // damit die Hook-Regeln eingehalten sind.
  const analysisContent = useTopicContent('analysis', level);
  const linalgContent = useTopicContent('linalg', level);
  const stochastikContent = useTopicContent('stochastik', level);
  const questionOf = (topicId: TopicId, taskId: string) => {
    const source = topicId === 'analysis' ? analysisContent
      : topicId === 'linalg' ? linalgContent
      : stochastikContent;
    return source.tasks.find(t => t.id === taskId)?.q ?? '';
  };

  const { statusOf } = useProgress();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('alle');
  const [topicFilter, setTopicFilter] = useState<Set<TopicId>>(new Set());

  // Sprung vom Dashboard: gewünschte Lernstufe vorwählen (einmalig).
  useEffect(() => {
    let frame = 0;
    try {
      const s = localStorage.getItem('gf-review-status');
      if (s === 'verstanden' || s === 'wiederholen' || s === 'unklar') {
        frame = requestAnimationFrame(() => {
          setStatusFilter(s);
          localStorage.removeItem('gf-review-status');
        });
      }
    } catch { /* Speicher gesperrt */ }
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const toggleTopic = (id: TopicId) => {
    setTopicFilter(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Alle eingeordneten Inhalte der gewählten Stufe einsammeln
  const activeTopics = TOPICS.filter(t => topicFilter.size === 0 || topicFilter.has(t.id as TopicId));
  const items = activeTopics.flatMap(topic => {
    const tasks = indexFor(topic.id as TopicId, level).tasks;
    return tasks
      .map(task => ({ topic, task, status: statusOf(topic.id, task.id) }))
      .filter(x => x.status !== 'none')
      .filter(x => statusFilter === 'alle' || x.status === statusFilter);
  });

  // Reihenfolge: Unklares zuerst, dann Wiederholen, Verstandenes zuletzt –
  // so liegt das Wichtigste immer oben (Vorstufe von Spaced Repetition).
  const ORDER: Record<string, number> = { unklar: 0, wiederholen: 1, verstanden: 2 };
  items.sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  const openTask = (topicId: View, taskId: string) => {
    try {
      localStorage.setItem('gf-open-tab', 'uebungen');
      localStorage.setItem('gf-open-task', taskId);
    } catch { /* Speicher gesperrt */ }
    onNavigate(topicId);
  };

  const anyRated = TOPICS.some(t =>
    indexFor(t.id as TopicId, level).tasks.some(task => statusOf(t.id, task.id) !== 'none'),
  );

  return (
    <div className={styles.page}>
      {/* In der App steht der Titel schon in der Kopfzeile. */}
      {!imApp && <h1 className={styles.ph1}>Wiederholen</h1>}

      {/* Filter: links die Lernstufe, rechts die Themen — beides untereinander
          und nebeneinander sichtbar. Als Reihe brach der längste Name („Lineare
          Algebra & Geometrie") entweder um oder wurde abgeschnitten; in einer
          Spalte hat jeder Name die volle Breite für sich. */}
      <div className={styles.filters}>
        <div className={styles.filterCol} role="tablist" aria-label="Lernstufe filtern">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              role="tab"
              aria-selected={statusFilter === s}
              className={`${styles.seg} ${statusFilter === s ? styles.segOn : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              <span
                className={styles.segDot}
                style={{ background: s === 'alle' ? 'transparent' : STATUS_DOT[s] }}
                aria-hidden="true"
              />
              {s === 'alle' ? 'Alle' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {/* Themen (mehrere gleichzeitig wählbar) */}
        <div className={styles.filterCol} aria-label="Themen filtern">
          {TOPICS.map(t => {
            const on = topicFilter.has(t.id as TopicId);
            return (
              <button
                key={t.id}
                className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                aria-pressed={on}
                onClick={() => toggleTopic(t.id as TopicId)}
              >
                <span className={styles.cdot} style={{ background: t.color }} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {items.length > 0 ? (
        <div className={styles.list}>
          {items.map(({ topic, task, status }) => (
            <button key={`${topic.id}-${task.id}`} className={styles.item} onClick={() => openTask(topic.id, task.id)}>
              <span className={styles.itemDot} style={{ background: topic.color }} />
              <span className={styles.itemBody}>
                <span className={styles.itemTag}>{task.tag}</span>
                <span className={styles.itemQ}>{questionOf(topic.id as TopicId, task.id)}</span>
              </span>
              <span className={`${styles.status} ${styles[`st_${status}`]}`}>{STATUS_LABEL[status as Exclude<LernStatus, 'none'>]}</span>
              <span className={styles.itemGo}><ArrowRightIcon size={15} /></span>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <GrapefruitProgress pct={0} size={56} />
          {anyRated ? (
            <>
              <div className={styles.emptyTitle}>Nichts in dieser Auswahl</div>
              <p className={styles.emptyText}>Ändere die Filter oben oder lerne weiter und ordne neue Inhalte ein.</p>
            </>
          ) : (
            <>
              <div className={styles.emptyTitle}>Noch nichts eingeordnet</div>
              <p className={styles.emptyText}>
                Beim Üben kannst du jede Aufgabe als „Verstanden“, „Wiederholen“
                oder „Nicht verstanden“ einordnen. Hier findest du sie dann wieder.
              </p>
              <button className="btn primary" onClick={() => onNavigate('analysis')}>Jetzt lernen</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
