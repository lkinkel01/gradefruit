export type View = 'landing' | 'dashboard' | 'analysis' | 'linalg' | 'stochastik' | 'videos' | 'saved' | 'tutors';

export interface Topic {
  id: View;
  label: string;
  color: string;
  tasks: number;
  done: number;
}

export const TOPICS: Topic[] = [
  { id: 'analysis', label: 'Analysis', color: '#F0524A', tasks: 24, done: 8 },
  { id: 'linalg', label: 'Lineare Algebra & Geometrie', color: '#6C63FF', tasks: 18, done: 3 },
  { id: 'stochastik', label: 'Stochastik', color: '#17B26A', tasks: 16, done: 0 },
];
