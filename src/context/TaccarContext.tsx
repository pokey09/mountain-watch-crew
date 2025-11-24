import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

// Hardcoded Traccar server configuration
const HARDCODED_CONFIG: TaccarConfig = {
  baseUrl: 'http://localhost:8082',
  username: 'admin',
  password: 'admin',
};

const baseUrl = import.meta.env.VITE_TACCAR_BASE_URL?.trim();
const username = import.meta.env.VITE_TACCAR_USERNAME?.trim();
const password = import.meta.env.VITE_TACCAR_PASSWORD ?? '';

const envConfig: TaccarConfig | null =
  baseUrl && username && password.length
    ? {
        baseUrl,
        username,
        password,
      }
    : HARDCODED_CONFIG;

const STORAGE_KEY = 'mountain-watch-crew:taccar-config';

const readStoredConfig = (): TaccarConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TaccarConfig>;
    if (
      typeof parsed?.baseUrl === 'string' &&
      parsed.baseUrl.length &&
      typeof parsed?.username === 'string' &&
      parsed.username.length &&
      typeof parsed?.password === 'string'
    ) {
      return {
        baseUrl: parsed.baseUrl,
        username: parsed.username,
        password: parsed.password,
      };
    }
  } catch {
    // ignore malformed storage
  }
  return null;
};

export const TaccarProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<TaccarConfig | null>(() => {
    const stored = readStoredConfig();
    if (stored) return stored;
    // Always fall back to hardcoded config if nothing else is available
    return envConfig ?? HARDCODED_CONFIG;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shouldPersist =
      config &&
      (!envConfig ||
        config.baseUrl !== envConfig.baseUrl ||
        config.username !== envConfig.username ||
        config.password !== envConfig.password);

    if (shouldPersist && config) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [config]);

  const setConfig = useCallback((next: TaccarConfig) => {
    setConfigState({
      baseUrl: next.baseUrl.trim(),
      username: next.username.trim(),
      password: next.password,
    });
  }, []);

  const clearConfig = useCallback(() => {
    // Always fall back to hardcoded config
    setConfigState(envConfig ?? HARDCODED_CONFIG);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<TaccarContextValue>(
    () => ({
      config,
      setConfig,
      clearConfig,
    }),
    [config, setConfig, clearConfig]
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
