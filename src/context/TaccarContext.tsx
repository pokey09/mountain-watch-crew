import { createContext, ReactNode, useContext, useMemo } from 'react';

export type TaccarConfig = {
  baseUrl: string;
  username: string;
  password: string;
};

type TaccarContextValue = {
  config: TaccarConfig | null;
};

const TaccarContext = createContext<TaccarContextValue | undefined>(undefined);

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
    : null;

export const TaccarProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<TaccarContextValue>(
    () => ({
      config: envConfig,
    }),
    []
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
