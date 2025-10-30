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

const toBrowserSafeBaseUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();

  try {
    const parsed = new URL(trimmed);
    return parsed.toString();
  } catch (error) {
    throw new Error('The Traccar server URL is invalid. Include the protocol, for example http://localhost:8082.');
  }
};

const encodeBasicAuth = (config: TaccarConfig): string => {
  const credentials = `${config.username}:${config.password}`;

  if (typeof btoa === 'function') {
    try {
      return btoa(credentials);
    } catch {
      if (typeof TextEncoder !== 'undefined') {
        const binary = String.fromCharCode(...new TextEncoder().encode(credentials));
        return btoa(binary);
      }
    }
  }

  const maybeBuffer = (globalThis as unknown as {
    Buffer?: {
      from(input: string, encoding: string): { toString(encoding: string): string };
    };
  }).Buffer;

  if (maybeBuffer) {
    return maybeBuffer.from(credentials, 'utf-8').toString('base64');
  }

  throw new Error('Unable to encode credentials for Traccar authentication in this environment.');
};

const fetchFromTaccar = async <T>(config: TaccarConfig, path: string, options?: FetchOptions): Promise<T> => {
  const normalizedBase = toBrowserSafeBaseUrl(config.baseUrl);

  if (
    typeof window !== 'undefined' &&
    window.location?.protocol === 'https:' &&
    normalizedBase.startsWith('http://')
  ) {
    throw new Error(
      'Browsers block HTTP requests from HTTPS pages. Serve Traccar over HTTPS or open this app over HTTP to continue.'
    );
  }

  const url = new URL(path.replace(/^\//, ''), normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`);
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${encodeBasicAuth(config)}`,
      },
      signal: options?.signal,
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
