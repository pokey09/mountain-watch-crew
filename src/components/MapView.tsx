import { useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L, { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useTaccar } from "@/context/TaccarContext";
import { StaffMember, StaffRole, StaffStatus, useTaccarStaff } from "@/hooks/useTaccarStaff";

type MapViewProps = {
  onRequestConnect: () => void;
};

const roleLabels: Record<StaffRole, string> = {
  patrol: "Ski Patrol",
  instructor: "Instructor",
  operations: "Operations",
};

const roleColors: Record<StaffRole, string> = {
  patrol: "#EF4444",
  instructor: "#3B82F6",
  operations: "#F59E0B",
};

const statusLabels: Record<StaffStatus, string> = {
  active: "Active",
  break: "On Break",
  inactive: "Inactive",
};

const DEFAULT_CENTER: [number, number] = [39.1911, -106.8175];

const createRoleIcon = (color: string): DivIcon =>
  L.divIcon({
    className: "staff-marker",
    html: `<span style="
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      background: ${color};
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      ">
    </span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });

const StaffMarkers = ({ staff, icons }: { staff: StaffMember[]; icons: Record<string, DivIcon> }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  const markers = useMemo(
    () =>
      staff
        .filter((member) => member.coordinates)
        .map((member) => ({
          member,
          position: [member.coordinates![1], member.coordinates![0]] as [number, number],
        })),
    [staff]
  );

  if (!markers.length) {
    hasCentered.current = false;
  }

  if (markers.length && !hasCentered.current) {
    if (markers.length === 1) {
      map.flyTo(markers[0].position, 14, { duration: 1.2 });
    } else {
      const bounds = L.latLngBounds(markers.map((marker) => marker.position));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    }
    hasCentered.current = true;
  }

  return (
    <>
      {markers.map(({ member, position }) => (
        <Marker key={member.id} position={position} icon={icons[member.role] ?? icons.default}>
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold text-sm text-foreground">{member.name}</div>
              <div className="text-xs text-muted-foreground">{roleLabels[member.role]}</div>
              <div className="text-xs text-muted-foreground">{member.location}</div>
              <div className="text-xs text-muted-foreground">
                Status: {statusLabels[member.status]} · Updated {member.lastUpdate}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const MapView = ({ onRequestConnect }: MapViewProps) => {
  const { config } = useTaccar();
  const { staff, isLoading, isFetching, isError, error, refetch } = useTaccarStaff();

  const activeStaff = useMemo(
    () => staff.filter((member) => member.coordinates),
    [staff]
  );

  const roleIcons = useMemo(
    () => ({
      patrol: createRoleIcon(roleColors.patrol),
      instructor: createRoleIcon(roleColors.instructor),
      operations: createRoleIcon(roleColors.operations),
      default: createRoleIcon("#6366F1"),
    }),
    []
  );

  const initialCenter = activeStaff.length
    ? ([activeStaff[0].coordinates![1], activeStaff[0].coordinates![0]] as [number, number])
    : DEFAULT_CENTER;

  const showConfigOverlay = !config;
  const showEmptyState = config && !isLoading && !activeStaff.length;

  return (
    <div className="relative isolate w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom
        className="relative h-full w-full rounded-lg shadow-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <StaffMarkers staff={activeStaff} icons={roleIcons} />
      </MapContainer>

      {showConfigOverlay && (
        <Card className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-[1000]">
          <div className="w-full max-w-lg p-6 space-y-4 bg-card rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold text-foreground">Connect your Traccar server</h3>
            <p className="text-sm text-muted-foreground">
              Enter the connection details for <span className="font-mono">http://localhost:8082</span> (or your preferred server) to
              load live staff locations on the map.
            </p>
            <Button onClick={onRequestConnect} className="mt-2">
              Connect server
            </Button>
          </div>
        </Card>
      )}

      {showEmptyState && (
        <Card className="absolute top-4 left-4 max-w-sm z-[900] shadow-lg">
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">No live positions yet</h4>
            <p className="text-xs text-muted-foreground">
              Connected to Traccar but no devices have reported a location. Make sure your devices are online or use the
              built-in simulator.
            </p>
          </div>
        </Card>
      )}

      {!showConfigOverlay && (
        <>
          <div className="absolute top-3 right-3 flex items-center gap-2 z-[900]">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              title="Refresh positions"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 z-[900]">
            <Badge variant="secondary">
              {isFetching ? "Updating positions…" : `Tracking ${activeStaff.length} staff`}
            </Badge>
          </div>
        </>
      )}

      {!showConfigOverlay && isError && error ? (
        <div className="absolute bottom-4 right-4 z-[900] max-w-sm">
          <Alert variant="destructive">
            <AlertTitle>Failed to load Traccar data</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}
    </div>
  );
};

export default MapView;
