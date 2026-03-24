import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "resume_scorer_history";

export function useHistory() {
  const [history, setHistory] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      setHistory([]);
    }
  }, []);

  const addEntry = useCallback((entry) => {
    setHistory((prev) => {
      const updated = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...entry,
        },
        ...prev,
      ].slice(0, 50); // keep last 50
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { history, addEntry, removeEntry, clearAll };
}
