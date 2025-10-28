import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-106.8175, 39.1911], // Vail, Colorado as example
      zoom: 13,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'imperial'
      }),
      'bottom-right'
    );

    // Add example staff markers
    const staffLocations = [
      { name: 'Sarah Chen', role: 'Ski Patrol', coords: [-106.8175, 39.1911], color: '#EF4444' },
      { name: 'Mike Johnson', role: 'Instructor', coords: [-106.8200, 39.1920], color: '#3B82F6' },
      { name: 'Alex Rivera', role: 'Operations', coords: [-106.8150, 39.1900], color: '#F59E0B' },
    ];

    map.current.on('load', () => {
      staffLocations.forEach(staff => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = staff.color;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        new mapboxgl.Marker(el)
          .setLngLat(staff.coords as [number, number])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${staff.name}</strong><br/>${staff.role}`)
          )
          .addTo(map.current!);
      });
    });

    setIsMapInitialized(true);
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      initializeMap(apiKey.trim());
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {!isMapInitialized ? (
        <Card className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
          <form onSubmit={handleApiKeySubmit} className="w-full max-w-md p-6 space-y-4 bg-card rounded-lg shadow-lg">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Enter Mapbox Token</h3>
              <p className="text-sm text-muted-foreground">
                Get your free token at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Initialize Map
            </button>
          </form>
        </Card>
      ) : null}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
    </div>
  );
};

export default MapView;
