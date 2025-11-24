import { useState } from "react";
import { useTaccarDevices, useTaccarPositions } from "@/hooks/useTaccarData";
import { useTaccarStaff } from "@/hooks/useTaccarStaff";
import { useTaccar } from "@/context/TaccarContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useTaccar();
  const devicesQuery = useTaccarDevices();
  const positionsQuery = useTaccarPositions();
  const { staff } = useTaccarStaff();

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[1000]"
      >
        Debug
      </Button>
    );
  }

  const devicesStatus = devicesQuery.isLoading
    ? "loading"
    : devicesQuery.isError
    ? "error"
    : devicesQuery.data?.length
    ? "success"
    : "empty";

  const positionsStatus = positionsQuery.isLoading
    ? "loading"
    : positionsQuery.isError
    ? "error"
    : positionsQuery.data?.length
    ? "success"
    : "empty";

  return (
    <Card className="fixed bottom-4 right-4 w-[600px] max-h-[80vh] overflow-auto z-[1000] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Badge variant={devicesStatus === "success" ? "default" : devicesStatus === "error" ? "destructive" : "secondary"}>
            Devices: {devicesStatus}
          </Badge>
          <Badge variant={positionsStatus === "success" ? "default" : positionsStatus === "error" ? "destructive" : "secondary"}>
            Positions: {positionsStatus}
          </Badge>
          <Badge variant={staff.length ? "default" : "secondary"}>
            Staff: {staff.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Config:</strong>
          <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(
              config
                ? { ...config, password: "***" }
                : "No config",
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <strong>Devices Query ({devicesQuery.data?.length ?? 0} devices):</strong>
          {devicesQuery.isError && (
            <div className="bg-destructive/10 text-destructive p-2 rounded mt-1">
              <strong>Error:</strong> {devicesQuery.error?.message}
            </div>
          )}
          {!devicesQuery.isError && (
            <pre className="bg-muted p-2 rounded mt-1 overflow-auto max-h-[200px]">
              {JSON.stringify(devicesQuery.data, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <strong>Positions Query ({positionsQuery.data?.length ?? 0} positions):</strong>
          {positionsQuery.isError && (
            <div className="bg-destructive/10 text-destructive p-2 rounded mt-1">
              <strong>Error:</strong> {positionsQuery.error?.message}
            </div>
          )}
          {!positionsQuery.isError && (
            <pre className="bg-muted p-2 rounded mt-1 overflow-auto max-h-[200px]">
              {JSON.stringify(positionsQuery.data, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <strong>Staff Members ({staff.length} total):</strong>
          <pre className="bg-muted p-2 rounded mt-1 overflow-auto max-h-[200px]">
            {JSON.stringify(
              staff.map((s) => ({
                id: s.id,
                name: s.name,
                role: s.role,
                status: s.status,
                hasCoordinates: !!s.coordinates,
                coordinates: s.coordinates,
                location: s.location,
              })),
              null,
              2
            )}
          </pre>
        </div>

        <div className="border-t pt-3 space-y-2">
          <strong className="block">Troubleshooting:</strong>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>1. Is Traccar running? Check: <code className="bg-muted px-1">http://localhost:8082</code></p>
            <p>2. Do you have devices created in Traccar?</p>
            <p>3. Have devices reported any positions?</p>
            <p>4. Check browser console (F12) for CORS errors</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
