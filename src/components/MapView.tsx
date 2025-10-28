import { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useTaccar } from '@/context/TaccarContext';
import { StaffRole, StaffStatus, useTaccarStaff } from '@/hooks/useTaccarStaff';

const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY?.trim();

const roleLabels: Record<StaffRole, string> = {
  patrol: 'Ski Patrol',
  instructor: 'Instructor',
  operations: 'Operations',
};

const roleColors: Record<StaffRole, string> = {
  patrol: '#EF4444',
  instructor: '#3B82F6',
  operations: '#F59E0B',
};

const statusLabels: Record<StaffStatus, string> = {
  active: 'Active',
  break: 'On Break',
  inactive: 'Inactive',
};

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<ReturnType<typeof tt.map> | null>(null);
  const markers = useRef<tt.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [hasFitBounds, setHasFitBounds] = useState(false);
  const { config } = useTaccar();
  const { staff, isLoading, isFetching, isError, error, refetch } = useTaccarStaff();

  const missingTomTomKey = !TOMTOM_API_KEY;
  const missingTaccarConfig = !config;

  const initializeMap = (key: string) => {
    if (!mapContainer.current) return;

    map.current?.remove();
    setMapReady(false);
    setHasFitBounds(false);

    const mapInstance = tt.map({
      key,
      container: mapContainer.current,
      center: [-106.8175, 39.1911],
      zoom: 12,
      pitch: 45,
    });

    mapInstance.addControl(new tt.NavigationControl(), 'top-right');
    mapInstance.addControl(
      new tt.ScaleControl({
        maxWidth: 100,
        unit: 'imperial',
      }),
      'bottom-right'
    );

    mapInstance.on('load', () => setMapReady(true));

    map.current = mapInstance;
  };

  useEffect(() => {
    if (!map.current && TOMTOM_API_KEY) {
      initializeMap(TOMTOM_API_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    const activeStaff = staff.filter((member) => member.coordinates);
    if (!activeStaff.length) return;

    activeStaff.forEach((member) => {
      const element = document.createElement('div');
      element.className = 'marker';
      element.style.backgroundColor = roleColors[member.role] ?? '#6366F1';
      element.style.width = '12px';
      element.style.height = '12px';
      element.style.borderRadius = '50%';
      element.style.border = '2px solid white';
      element.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      element.style.cursor = 'pointer';

      const marker = new tt.Marker({ element })
        .setLngLat(member.coordinates as [number, number])
        .setPopup(
          new tt.Popup({ offset: 25 }).setHTML(
            `<strong>${member.name}</strong><br/>${roleLabels[member.role]}<br/>${member.location}<br/><small>Status: ${statusLabels[member.status]}<br/>Updated ${member.lastUpdate}</small>`
          )
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });

    if (activeStaff.length === 1 && activeStaff[0].coordinates) {
      map.current.flyTo({
        center: activeStaff[0].coordinates,
        zoom: 14,
        speed: 0.5,
      });
      return;
    }

    if (activeStaff.length > 1) {
      const bounds = new tt.LngLatBounds();
      activeStaff.forEach((member) => bounds.extend(member.coordinates as [number, number]));
      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
        duration: hasFitBounds ? 0 : 1000,
      });
      setHasFitBounds(true);
    }
  }, [staff, mapReady, hasFitBounds]);

  useEffect(() => {
    if (!mapReady) {
      setHasFitBounds(false);
    }
  }, [mapReady]);

  const showOverlay = missingTomTomKey || missingTaccarConfig;

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />

      {showOverlay && (
        <Card className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
          <div className="w-full max-w-lg p-6 space-y-4 bg-card rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">Environment configuration required</h3>
            <p className="text-sm text-muted-foreground">
              Provide the following Vite environment variables before building the app to enable TomTom mapping and
              Taccar tracking:
            </p>
            <ul className="text-sm space-y-1 font-mono text-muted-foreground">
              <li>VITE_TOMTOM_API_KEY</li>
              <li>VITE_TACCAR_BASE_URL</li>
              <li>VITE_TACCAR_USERNAME</li>
              <li>VITE_TACCAR_PASSWORD</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Add them to an `.env.local` file or your deployment environment. Rebuild after making changes.
            </p>
          </div>
        </Card>
      )}

      {!showOverlay && (
        <>
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              title="Refresh positions"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 z-20">
            <Badge variant="secondary">
              {isFetching ? 'Updating positions…' : `Tracking ${staff.filter((member) => member.coordinates).length} staff`}
            </Badge>
          </div>
        </>
      )}

      {!showOverlay && isError && error ? (
        <div className="absolute bottom-4 right-4 z-20 max-w-sm">
          <Alert variant="destructive">
            <AlertTitle>Failed to load Taccar data</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}
    </div>
  );
};

export default MapView;
