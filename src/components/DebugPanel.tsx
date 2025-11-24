import { useState } from "react";
import { useTaccarDevices, useTaccarPositions } from "@/hooks/useTaccarData";
import { useTaccarStaff } from "@/hooks/useTaccarStaff";
import { useTaccar } from "@/context/TaccarContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  return (
    <Card className="fixed bottom-4 right-4 w-[500px] max-h-[80vh] overflow-auto z-[1000] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
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
          <strong>Devices Query:</strong>
          <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(
              {
                isLoading: devicesQuery.isLoading,
                isError: devicesQuery.isError,
                error: devicesQuery.error?.message,
                dataCount: devicesQuery.data?.length ?? 0,
                data: devicesQuery.data,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <strong>Positions Query:</strong>
          <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(
              {
                isLoading: positionsQuery.isLoading,
                isError: positionsQuery.isError,
                error: positionsQuery.error?.message,
                dataCount: positionsQuery.data?.length ?? 0,
                data: positionsQuery.data,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <strong>Staff Members:</strong>
          <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(
              staff.map((s) => ({
                id: s.id,
                name: s.name,
                role: s.role,
                status: s.status,
                hasCoordinates: !!s.coordinates,
                coordinates: s.coordinates,
                position: s.position,
              })),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </Card>
  );
};
