import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffCardProps {
  name: string;
  role: "patrol" | "instructor" | "operations";
  status: "active" | "inactive" | "break";
  location: string;
  lastUpdate: string;
}

const roleConfig = {
  patrol: {
    label: "Ski Patrol",
    color: "bg-patrol text-patrol-foreground",
    dotColor: "bg-patrol",
  },
  instructor: {
    label: "Instructor",
    color: "bg-instructor text-instructor-foreground",
    dotColor: "bg-instructor",
  },
  operations: {
    label: "Operations",
    color: "bg-operations text-operations-foreground",
    dotColor: "bg-operations",
  },
};

const statusConfig = {
  active: { label: "Active", color: "bg-green-500" },
  inactive: { label: "Off Duty", color: "bg-gray-400" },
  break: { label: "On Break", color: "bg-yellow-500" },
};

const StaffCard = ({ name, role, status, location, lastUpdate }: StaffCardProps) => {
  const roleInfo = roleConfig[role];
  const statusInfo = statusConfig[status];

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-300 border-l-4" style={{ borderLeftColor: `hsl(var(--${role}))` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground mb-1">{name}</h3>
          <Badge className={cn("text-xs", roleInfo.color)}>
            {roleInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", statusInfo.color)} />
          <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Radio className="h-3.5 w-3.5" />
          <span className="text-xs">Updated {lastUpdate}</span>
        </div>
      </div>
    </Card>
  );
};

export default StaffCard;
