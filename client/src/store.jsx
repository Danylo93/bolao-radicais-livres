import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

const PLAYER_KEY = 'bolao_rl_player';

export function StoreProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PLAYER_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [toasts, setToasts] = useState([]);

  const refresh = useCallback(async () => {
    const s = await api.state();
    setState(s);
    return s;
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refresh]);

  const savePlayer = useCallback((u) => {
    setPlayer(u);
    localStorage.setItem(PLAYER_KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setPlayer(null);
    localStorage.removeItem(PLAYER_KEY);
  }, []);

  const toast = useCallback((msg, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  return (
    <StoreCtx.Provider
      value={{ state, loading, refresh, player, savePlayer, logout, toast, toasts }}
    >
      {children}
    </StoreCtx.Provider>
  );
}
