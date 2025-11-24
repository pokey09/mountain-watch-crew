import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import StaffList from "@/components/StaffList";
import mountainHero from "@/assets/mountain-hero.jpg";
import TaccarConnectDialog from "@/components/TaccarConnectDialog";
import { useKioskMode } from "@/hooks/useKioskMode";

const Index = () => {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const openConnectDialog = () => setConnectDialogOpen(true);

  // Enable kiosk mode optimizations (screen lock, fullscreen, etc.)
  // Set to true to auto-enable fullscreen on load
  useKioskMode(false);

  // Auto-reload page on network reconnection
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network reconnected, reloading...");
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header onConnectClick={openConnectDialog} />

      {/* Hero Section */}
      <div className="relative h-32 flex-shrink-0 overflow-hidden">
        <img
          src={mountainHero}
          alt="Mountain landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="absolute bottom-4 left-0 right-0 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-foreground drop-shadow-lg">
            Real-Time Staff Tracking
          </h2>
          <p className="text-xs text-primary-foreground/90 drop-shadow mt-1">
            Monitor all mountain operations personnel in real-time
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Map Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 h-full">
            <MapView onRequestConnect={openConnectDialog} />
          </div>

          {/* Staff List - Takes 1 column */}
          <div className="lg:col-span-1 h-full overflow-hidden">
            <StaffList onRequestConnect={openConnectDialog} />
          </div>
        </div>
      </main>

      <TaccarConnectDialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen} />
    </div>
  );
};

export default Index;
