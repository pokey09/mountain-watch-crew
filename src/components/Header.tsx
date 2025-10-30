import { MousePointer2, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaccar } from "@/context/TaccarContext";

type HeaderProps = {
  onConnectClick: () => void;
};

const Header = ({ onConnectClick }: HeaderProps) => {
  const { config } = useTaccar();

  const serverLabel = (() => {
    if (!config) return "Not connected";
    try {
      const url = new URL(config.baseUrl);
      return url.host;
    } catch {
      return config.baseUrl;
    }
  })();

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
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Server</span>
              <div className="flex items-center gap-2">
                <Badge variant={config ? "secondary" : "destructive"}>
                  {config ? "Connected" : "Disconnected"}
                </Badge>
                <span className="text-sm text-foreground font-medium">{serverLabel}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onConnectClick} className="gap-2">
              <MousePointer2 className="h-4 w-4" />
              {config ? "Manage connection" : "Connect server"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
