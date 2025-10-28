import { useMemo } from 'react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useTaccarDevices, usePositionsByDeviceId, TaccarDevice, TaccarPosition } from './useTaccarData';

export type StaffRole = 'patrol' | 'instructor' | 'operations';
export type StaffStatus = 'active' | 'inactive' | 'break';

export type StaffMember = {
  id: number;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  location: string;
  lastUpdate: string;
  coordinates: [number, number] | null;
  device: TaccarDevice;
  position?: TaccarPosition;
};

const mapRole = (device: TaccarDevice): StaffRole => {
  const roleAttr = device.attributes?.role;
  if (typeof roleAttr === 'string') {
    const normalized = roleAttr.toLowerCase();
    if (normalized === 'patrol' || normalized === 'instructor' || normalized === 'operations') {
      return normalized;
    }
  }
  return 'operations';
};

const mapStatus = (device: TaccarDevice): StaffStatus => {
  const status = device.status?.toLowerCase();
  switch (status) {
    case 'online':
    case 'moving':
    case 'active':
      return 'active';
    case 'idle':
    case 'maintenance':
    case 'break':
      return 'break';
    default:
      return 'inactive';
  }
};

const toRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'unknown';
  try {
    const parsed = parseISO(dateString);
    return formatDistanceToNowStrict(parsed, { addSuffix: true });
  } catch {
    const backup = new Date(dateString);
    if (Number.isNaN(backup.getTime())) {
      return 'unknown';
    }
    return formatDistanceToNowStrict(backup, { addSuffix: true });
  }
};

const formatLocation = (position?: TaccarPosition): string => {
  if (!position) return 'No recent location';
  if (position.address) return position.address;
  const { latitude, longitude } = position;
  const lat = latitude?.toFixed(5);
  const lng = longitude?.toFixed(5);
  if (lat && lng) return `${lat}, ${lng}`;
  return 'No recent location';
};

export const useTaccarStaff = () => {
  const devicesQuery = useTaccarDevices();
  const positionsQuery = usePositionsByDeviceId();

  const staff = useMemo<StaffMember[]>(() => {
    if (!devicesQuery.data) return [];
    return devicesQuery.data.map((device) => {
      const position = positionsQuery.positionsByDevice.get(device.id);
      const coordinates =
        position && position.longitude != null && position.latitude != null
          ? [position.longitude, position.latitude] as [number, number]
          : null;

      const lastUpdate = position?.deviceTime ?? position?.fixTime ?? device.lastUpdate;

      return {
        id: device.id,
        name: device.name ?? `Device ${device.id}`,
        role: mapRole(device),
        status: mapStatus(device),
        location: formatLocation(position),
        lastUpdate: toRelativeTime(lastUpdate),
        coordinates,
        device,
        position,
      };
    });
  }, [devicesQuery.data, positionsQuery.positionsByDevice]);

  return {
    staff,
    isLoading: devicesQuery.isLoading || positionsQuery.isLoading,
    isFetching: devicesQuery.isFetching || positionsQuery.isFetching,
    isError: devicesQuery.isError || positionsQuery.isError,
    error: devicesQuery.error ?? positionsQuery.error,
    refetch: async () => {
      const [devicesResult, positionsResult] = await Promise.all([devicesQuery.refetch(), positionsQuery.refetch()]);
      return { devicesResult, positionsResult };
    },
  };
};
