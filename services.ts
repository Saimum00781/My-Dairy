import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  deleteDoc,
  where
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { RoutineItem, LogItem, ShowcaseItem, DiaryEntry, Habit, Expense, Subject } from './types';
import { GoogleGenAI } from "@google/genai";

// --- Helpers for Demo Mode (LocalStorage) ---
const isDemo = !db || !auth;

const getLocal = <T,>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setLocal = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Gemini Service ---
const apiKey = process.env.API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateDiaryReflection = async (content: string): Promise<string> => {
    if (!genAI) return "AI Configuration missing.";
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Read this diary entry and provide a short, 2-sentence encouraging reflection: "${content}"`,
        });
        return response.text || "Could not generate reflection.";
    } catch (e) {
        return "AI is currently unavailable.";
    }
}

export const generateDashboardInsight = async (data: any): Promise<string> => {
    if (!genAI) return "Stay consistent and keep pushing forward.";
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are a productivity coach. Based on this user's status: ${JSON.stringify(data)}, give one sentence of specific, high-energy advice.`,
        });
        return response.text || "Focus on your goals.";
    } catch (e) {
        return "Conquer the day.";
    }
}

// --- Routine Services ---

export const fetchRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (isDemo) return getLocal(`routine_${userId}`) || [];
  const docRef = doc(db!, 'users', userId, 'data', 'routine');
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().items : [];
};

export const saveRoutine = async (userId: string, items: RoutineItem[]) => {
  if (isDemo) return setLocal(`routine_${userId}`, items);
  const docRef = doc(db!, 'users', userId, 'data', 'routine');
  await setDoc(docRef, { items }, { merge: true });
};

// --- Life Sync Logs ---

export const fetchDailyLog = async (userId: string, date: string): Promise<LogItem[]> => {
  if (isDemo) return getLocal(`log_${userId}_${date}`) || [];
  const docRef = doc(db!, 'users', userId, 'logs', date);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().items : [];
};

export const saveDailyLog = async (userId: string, date: string, items: LogItem[]) => {
  if (isDemo) return setLocal(`log_${userId}_${date}`, items);
  const docRef = doc(db!, 'users', userId, 'logs', date);
  await setDoc(docRef, { items }, { merge: true });
};

// --- Habits ---

export const fetchHabits = async (userId: string): Promise<Habit[]> => {
  if (isDemo) return getLocal(`habits_${userId}`) || [];
  const q = query(collection(db!, 'users', userId, 'habits'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));
};

export const updateHabit = async (userId: string, habit: Habit) => {
  if (isDemo) {
    const habits = getLocal<Habit[]>(`habits_${userId}`) || [];
    const index = habits.findIndex(h => h.id === habit.id);
    if (index >= 0) habits[index] = habit;
    else habits.push(habit);
    setLocal(`habits_${userId}`, habits);
    return;
  }
  await setDoc(doc(db!, 'users', userId, 'habits', habit.id), habit);
};

export const deleteHabit = async (userId: string, habitId: string) => {
    if (isDemo) {
        const habits = getLocal<Habit[]>(`habits_${userId}`) || [];
        setLocal(`habits_${userId}`, habits.filter(h => h.id !== habitId));
        return;
    }
    await deleteDoc(doc(db!, 'users', userId, 'habits', habitId));
}

// --- Finances ---

export const fetchExpenses = async (userId: string): Promise<Expense[]> => {
  if (isDemo) return getLocal(`expenses_${userId}`) || [];
  // In real app, you might want to limit this query by date
  const q = query(collection(db!, 'users', userId, 'expenses'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
};

export const addExpense = async (userId: string, expense: Omit<Expense, 'id'>) => {
  if (isDemo) {
    const expenses = getLocal<Expense[]>(`expenses_${userId}`) || [];
    const newEx = { ...expense, id: Date.now().toString() };
    setLocal(`expenses_${userId}`, [newEx, ...expenses]);
    return;
  }
  await addDoc(collection(db!, 'users', userId, 'expenses'), expense);
};

// --- Attendance ---

export const fetchSubjects = async (userId: string): Promise<Subject[]> => {
  if (isDemo) return getLocal(`subjects_${userId}`) || [];
  const q = query(collection(db!, 'users', userId, 'subjects'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
};

export const updateSubject = async (userId: string, subject: Subject) => {
  if (isDemo) {
    const subs = getLocal<Subject[]>(`subjects_${userId}`) || [];
    const index = subs.findIndex(s => s.id === subject.id);
    if (index >= 0) subs[index] = subject;
    else subs.push(subject);
    setLocal(`subjects_${userId}`, subs);
    return;
  }
  await setDoc(doc(db!, 'users', userId, 'subjects', subject.id), subject);
};

export const deleteSubject = async (userId: string, subjectId: string) => {
    if (isDemo) {
        const subs = getLocal<Subject[]>(`subjects_${userId}`) || [];
        setLocal(`subjects_${userId}`, subs.filter(s => s.id !== subjectId));
        return;
    }
    await deleteDoc(doc(db!, 'users', userId, 'subjects', subjectId));
}


// --- Showcase & Diary (Existing) ---

export const fetchShowcase = async (userId: string): Promise<ShowcaseItem[]> => {
  if (isDemo) return getLocal(`showcase_${userId}`) || [];
  const q = query(collection(db!, 'users', userId, 'showcase'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ShowcaseItem));
};

export const addShowcaseItem = async (userId: string, item: Omit<ShowcaseItem, 'id'>) => {
  if (isDemo) {
    const current = getLocal<ShowcaseItem[]>(`showcase_${userId}`) || [];
    const newItem = { ...item, id: Date.now().toString() };
    setLocal(`showcase_${userId}`, [newItem, ...current]);
    return;
  }
  await addDoc(collection(db!, 'users', userId, 'showcase'), item);
};

export const deleteShowcaseItem = async (userId: string, itemId: string) => {
  if (isDemo) {
    const current = getLocal<ShowcaseItem[]>(`showcase_${userId}`) || [];
    setLocal(`showcase_${userId}`, current.filter(i => i.id !== itemId));
    return;
  }
  await deleteDoc(doc(db!, 'users', userId, 'showcase', itemId));
};

export const fetchDiaryEntries = async (userId: string): Promise<DiaryEntry[]> => {
  if (isDemo) return getLocal(`diary_${userId}`) || [];
  const q = query(collection(db!, 'users', userId, 'diary'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as DiaryEntry));
};

export const addDiaryEntry = async (userId: string, entry: Omit<DiaryEntry, 'id'>) => {
  if (isDemo) {
    const current = getLocal<DiaryEntry[]>(`diary_${userId}`) || [];
    const newEntry = { ...entry, id: Date.now().toString() };
    setLocal(`diary_${userId}`, [newEntry, ...current]);
    return;
  }
  await addDoc(collection(db!, 'users', userId, 'diary'), entry);
};