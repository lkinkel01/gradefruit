export type View = 'landing' | 'dashboard' | 'analysis' | 'linalg' | 'stochastik' | 'videos' | 'review' | 'tutors' | 'account';

export interface Topic {
  id: View;
  label: string;
  color: string;
  tasks: number;
  done: number;
}

/* Gedeckte, warme Themenfarben – ruhiger als die früheren Signaltöne. */
export const TOPICS: Topic[] = [
  { id: 'analysis', label: 'Analysis', color: '#DE5D43', tasks: 24, done: 8 },
  { id: 'linalg', label: 'Lineare Algebra & Geometrie', color: '#5D6BC9', tasks: 18, done: 3 },
  { id: 'stochastik', label: 'Stochastik', color: '#2F9E68', tasks: 16, done: 0 },
];

/* Lernstatus des Wiederholungssystems: bewusst nur drei einfache Stufen.
   'none' = noch nicht eingeordnet. Vorbereitet für Active Recall /
   Spaced Repetition: die Stufen lassen sich später als Wiederhol-Intervalle
   interpretieren, ohne dass sich die Oberfläche ändern muss. */
export type LernStatus = 'none' | 'verstanden' | 'wiederholen' | 'unklar';

export const STATUS_LABEL: Record<Exclude<LernStatus, 'none'>, string> = {
  verstanden: 'Verstanden',
  wiederholen: 'Wiederholen',
  unklar: 'Noch unklar',
};
