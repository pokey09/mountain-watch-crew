import { Mountain, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTaccar } from "@/context/TaccarContext";

const Header = () => {
  const { config } = useTaccar();

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Mountain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mountain Tracker</h1>
              <p className="text-xs text-muted-foreground">Staff GPS Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <Badge variant={config ? "secondary" : "destructive"}>
              {config ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
