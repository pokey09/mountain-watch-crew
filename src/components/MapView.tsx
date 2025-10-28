import { useEffect, useMemo, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cog, RefreshCcw } from 'lucide-react';
import { useTaccar } from '@/context/TaccarContext';
import { StaffRole, StaffStatus, useTaccarStaff } from '@/hooks/useTaccarStaff';

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

const TOMTOM_STORAGE_KEY = 'tomtom:api-key';

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<ReturnType<typeof tt.map> | null>(null);
  const markers = useRef<tt.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [hasFitBounds, setHasFitBounds] = useState(false);
  const storedTomTomKey = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(TOMTOM_STORAGE_KEY) ?? '';
  }, []);
  const [tomtomKeyInput, setTomtomKeyInput] = useState(storedTomTomKey);
  const { config, setConfig, clearConfig } = useTaccar();
  const [baseUrlInput, setBaseUrlInput] = useState(config?.baseUrl ?? '');
  const [usernameInput, setUsernameInput] = useState(config?.username ?? '');
  const [passwordInput, setPasswordInput] = useState(config?.password ?? '');
  const [showConfig, setShowConfig] = useState(() => !(storedTomTomKey && config));

  const { staff, isLoading, isFetching, isError, error, refetch } = useTaccarStaff();

  const initializeMap = (key: string) => {
    if (!mapContainer.current || !key) return;

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

  const persistTomTomKey = (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOMTOM_STORAGE_KEY, key);
  };

  const handleConfigSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedKey = tomtomKeyInput.trim();
    const trimmedBaseUrl = baseUrlInput.trim();
    const trimmedUsername = usernameInput.trim();

    if (!trimmedKey || !trimmedBaseUrl || !trimmedUsername || passwordInput.length === 0) {
      return;
    }

    persistTomTomKey(trimmedKey);
    setConfig({
      baseUrl: trimmedBaseUrl,
      username: trimmedUsername,
      password: passwordInput,
    });
    initializeMap(trimmedKey);
    setShowConfig(false);
  };

  const handleResetConfig = () => {
    setTomtomKeyInput('');
    setBaseUrlInput('');
    setUsernameInput('');
    setPasswordInput('');
    clearConfig();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOMTOM_STORAGE_KEY);
    }
    setShowConfig(true);
    map.current?.remove();
    map.current = null;
    setMapReady(false);
    setHasFitBounds(false);
  };

  useEffect(() => {
    if (!map.current && storedTomTomKey) {
      initializeMap(storedTomTomKey);
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
      activeStaff.forEach((member) => {
        bounds.extend(member.coordinates as [number, number]);
      });
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

  const showOverlay = showConfig || !map.current || !config;

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />

      {showOverlay ? (
        <Card className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
          <form onSubmit={handleConfigSubmit} className="w-full max-w-lg p-6 space-y-5 bg-card rounded-lg shadow-lg">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Connect Mapping & Tracking Services</h3>
              <p className="text-sm text-muted-foreground">
                Provide your TomTom Maps API key and Taccar (Traccar) server credentials to load live staff locations.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tomtom-api-key">TomTom Maps API Key</Label>
              <Input
                id="tomtom-api-key"
                type="text"
                placeholder="Your TomTom API key"
                value={tomtomKeyInput}
                onChange={(e) => setTomtomKeyInput(e.target.value)}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Need a key?{' '}
                <a
                  href="https://developer.tomtom.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Request one from TomTom
                </a>
                .
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taccar-base-url">Taccar Base URL</Label>
                <Input
                  id="taccar-base-url"
                  type="url"
                  placeholder="https://taccar.example.com"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taccar-username">Username</Label>
                <Input
                  id="taccar-username"
                  type="text"
                  placeholder="service-account"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="taccar-password">Password</Label>
                <Input
                  id="taccar-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-muted-foreground sm:max-w-xs">
                Credentials are stored locally in your browser to keep the session active.
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                {config && (
                  <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowConfig(false)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1 sm:flex-none">
                  Connect & Load Map
                </Button>
              </div>
            </div>
            {(config || storedTomTomKey) && (
              <Button type="button" variant="ghost" size="sm" onClick={handleResetConfig} className="w-full">
                Reset saved credentials
              </Button>
            )}
          </form>
        </Card>
      ) : null}

      {!showOverlay && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <Button variant="secondary" size="icon" onClick={() => setShowConfig(true)} title="Update connection settings">
            <Cog className="h-4 w-4" />
          </Button>
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
      )}

      {!showOverlay && (
        <div className="absolute bottom-4 left-4 z-20">
          <Badge variant="secondary">
            {isFetching ? 'Updating positions…' : `Tracking ${staff.filter((member) => member.coordinates).length} staff`}
          </Badge>
        </div>
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
