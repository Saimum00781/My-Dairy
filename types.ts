export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface RoutineItem {
  id: string;
  title: string;
  startTime?: string; // e.g. "08:00"
}

export interface LogItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'project' | 'dream' | 'goal';
  createdAt: number;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  content: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'productive';
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompletedDate: string; // YYYY-MM-DD
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

export interface LifeSyncData {
  routine: RoutineItem[];
  logs: Record<string, LogItem[]>; // Key is YYYY-MM-DD
}
