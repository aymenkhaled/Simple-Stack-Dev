import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  level: MoodLevel;
  note: string;
  timestamp: string;
}

interface MoodContextValue {
  entries: MoodEntry[];
  addEntry: (level: MoodLevel, note: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  isLoading: boolean;
}

const MoodContext = createContext<MoodContextValue | null>(null);

const STORAGE_KEY = "@mooddrop_entries";

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: MoodEntry[] = JSON.parse(raw);
        setEntries(parsed.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = async (updated: MoodEntry[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addEntry = useCallback(async (level: MoodLevel, note: string) => {
    const entry: MoodEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      level,
      note,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await saveEntries(updated);
  }, [entries]);

  const deleteEntry = useCallback(async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await saveEntries(updated);
  }, [entries]);

  return (
    <MoodContext.Provider value={{ entries, addEntry, deleteEntry, isLoading }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}
