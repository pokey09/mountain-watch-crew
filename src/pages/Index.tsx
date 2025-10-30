import { useState } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import StaffList from "@/components/StaffList";
import mountainHero from "@/assets/mountain-hero.jpg";
import TaccarConnectDialog from "@/components/TaccarConnectDialog";

const Index = () => {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const openConnectDialog = () => setConnectDialogOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Header onConnectClick={openConnectDialog} />

      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={mountainHero} 
          alt="Mountain landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-foreground drop-shadow-lg">
            Real-Time Staff Tracking
          </h2>
          <p className="text-sm text-primary-foreground/90 drop-shadow mt-1">
            Monitor all mountain operations personnel in real-time
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MapView onRequestConnect={openConnectDialog} />
          </div>

          {/* Staff List - Takes 1 column */}
          <div className="lg:col-span-1">
            <StaffList onRequestConnect={openConnectDialog} />
          </div>
        </div>
      </main>

      <TaccarConnectDialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen} />
    </div>
  );
};

export default Index;
