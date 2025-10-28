import { useState } from "react";
import StaffCard from "./StaffCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockStaff = [
  { id: 1, name: "Sarah Chen", role: "patrol" as const, status: "active" as const, location: "North Peak - Chair 3", lastUpdate: "2 min ago" },
  { id: 2, name: "Mike Johnson", role: "instructor" as const, status: "active" as const, location: "Bunny Hill - Base", lastUpdate: "5 min ago" },
  { id: 3, name: "Alex Rivera", role: "operations" as const, status: "active" as const, location: "Lift Operations - Main", lastUpdate: "1 min ago" },
  { id: 4, name: "Jamie Lee", role: "patrol" as const, status: "break" as const, location: "Patrol Base", lastUpdate: "15 min ago" },
  { id: 5, name: "Taylor Swift", role: "instructor" as const, status: "active" as const, location: "Intermediate - Run 7", lastUpdate: "3 min ago" },
  { id: 6, name: "Chris Martin", role: "operations" as const, status: "inactive" as const, location: "Off Duty", lastUpdate: "2 hours ago" },
  { id: 7, name: "Dana White", role: "patrol" as const, status: "active" as const, location: "South Bowl - Peak", lastUpdate: "4 min ago" },
  { id: 8, name: "Jordan Bell", role: "instructor" as const, status: "active" as const, location: "Advanced - Black Diamond", lastUpdate: "7 min ago" },
];

const StaffList = () => {
  const [filter, setFilter] = useState("all");

  const filteredStaff = filter === "all" 
    ? mockStaff 
    : mockStaff.filter(staff => staff.role === filter);

  const activeCount = mockStaff.filter(s => s.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Staff Directory</h2>
        <div className="text-sm text-muted-foreground">
          {activeCount} of {mockStaff.length} active
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="patrol">Patrol</TabsTrigger>
          <TabsTrigger value="instructor">Instructors</TabsTrigger>
          <TabsTrigger value="operations">Ops</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredStaff.map(staff => (
                <StaffCard key={staff.id} {...staff} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffList;
