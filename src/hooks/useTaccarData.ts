import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTaccar, TaccarConfig } from '@/context/TaccarContext';

export type TaccarDevice = {
  id: number;
  name: string;
  uniqueId?: string;
  status?: string;
  lastUpdate?: string;
  positionId?: number;
  attributes?: Record<string, unknown>;
};

export type TaccarPosition = {
  id: number;
  deviceId: number;
  latitude: number;
  longitude: number;
  address?: string;
  speed?: number;
  course?: number;
  accuracy?: number;
  altitude?: number;
  deviceTime?: string;
  fixTime?: string;
  serverTime?: string;
  attributes?: Record<string, unknown>;
};

type FetchOptions = {
  signal?: AbortSignal;
};

const fetchFromTaccar = async <T>(config: TaccarConfig, path: string, options?: FetchOptions): Promise<T> => {
  const url = new URL(path.replace(/^\//, ''), config.baseUrl.endsWith('/') ? config.baseUrl : `${config.baseUrl}/`);
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
        'Content-Type': 'application/json',
      },
      signal: options?.signal,
      credentials: 'include',
    });

    if (!response.ok) {
      const message = `Taccar request failed with status ${response.status}`;
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Unable to reach the Traccar server. Check the URL and ensure CORS is enabled via the web.origin setting.'
      );
    }
    throw error;
  }
};

export const useTaccarDevices = () => {
  const { config } = useTaccar();

  return useQuery<TaccarDevice[], Error>({
    queryKey: ['taccar', 'devices', config?.baseUrl, config?.username],
    queryFn: ({ signal }) => fetchFromTaccar<TaccarDevice[]>(config!, '/api/devices', { signal }),
    enabled: Boolean(config),
    staleTime: 60_000,
    refetchInterval: config ? 60_000 : false,
  });
};

export const useTaccarPositions = () => {
  const { config } = useTaccar();

  return useQuery<TaccarPosition[], Error>({
    queryKey: ['taccar', 'positions', config?.baseUrl, config?.username],
    queryFn: ({ signal }) => fetchFromTaccar<TaccarPosition[]>(config!, '/api/positions', { signal }),
    enabled: Boolean(config),
    refetchInterval: config ? 15_000 : false,
  });
};

export const usePositionsByDeviceId = () => {
  const positionsQuery = useTaccarPositions();

  const positionsByDevice = useMemo(() => {
    if (!positionsQuery.data) return new Map<number, TaccarPosition>();
    return new Map<number, TaccarPosition>(
      positionsQuery.data.map((position) => [position.deviceId, position])
    );
  }, [positionsQuery.data]);

  return {
    ...positionsQuery,
    positionsByDevice,
  };
};
