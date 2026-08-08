import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DB, Role, User } from "./types";
import { seedDB } from "./seed";

const KEY = "eventflow360.db.v1";
const ROLE_KEY = "eventflow360.role.v1";

interface StoreValue {
  db: DB;
  ready: boolean;
  currentUser: User | null;
  signIn: (role: Role) => void;
  signOut: () => void;
  update: (fn: (draft: DB) => void) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => seedDB());
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDb(JSON.parse(raw) as DB);
      const r = localStorage.getItem(ROLE_KEY) as Role | null;
      if (r) setRole(r);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: DB) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full — keep in-memory state */
    }
  }, []);

  const update = useCallback(
    (fn: (draft: DB) => void) => {
      setDb((prev) => {
        const draft = JSON.parse(JSON.stringify(prev)) as DB;
        fn(draft);
        persist(draft);
        return draft;
      });
    },
    [persist],
  );

  const signIn = useCallback((r: Role) => {
    setRole(r);
    try {
      localStorage.setItem(ROLE_KEY, r);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setRole(null);
    try {
      localStorage.removeItem(ROLE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    const fresh = seedDB();
    setDb(fresh);
    persist(fresh);
  }, [persist]);

  const currentUser = useMemo(
    () => (role ? (db.users.find((u) => u.role === role) ?? null) : null),
    [role, db.users],
  );

  const value = useMemo(
    () => ({ db, ready, currentUser, signIn, signOut, update, reset }),
    [db, ready, currentUser, signIn, signOut, update, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
