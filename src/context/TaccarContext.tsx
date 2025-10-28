import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type TaccarConfig = {
  baseUrl: string;
  username: string;
  password: string;
};

type TaccarContextValue = {
  config: TaccarConfig | null;
  setConfig: (config: TaccarConfig) => void;
  clearConfig: () => void;
};

const TaccarContext = createContext<TaccarContextValue | undefined>(undefined);

const STORAGE_KEY = 'taccar:connection';

const readStoredConfig = (): TaccarConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TaccarConfig;
    if (parsed.baseUrl && parsed.username && typeof parsed.password === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const TaccarProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<TaccarConfig | null>(() => readStoredConfig());

  const setConfig = (value: TaccarConfig) => {
    setConfigState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  };

  const clearConfig = () => {
    setConfigState(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo<TaccarContextValue>(
    () => ({
      config,
      setConfig,
      clearConfig,
    }),
    [config]
  );

  return <TaccarContext.Provider value={value}>{children}</TaccarContext.Provider>;
};

export const useTaccar = () => {
  const context = useContext(TaccarContext);
  if (!context) {
    throw new Error('useTaccar must be used within a TaccarProvider');
  }
  return context;
};
