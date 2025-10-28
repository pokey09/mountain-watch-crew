import { useEffect, useMemo, useState } from "react";
import StaffCard from "./StaffCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTaccarStaff } from "@/hooks/useTaccarStaff";
import { useTaccar } from "@/context/TaccarContext";

const StaffList = () => {
  const { config } = useTaccar();
  const { staff, isLoading, isFetching, isError, error, refetch } = useTaccarStaff();
  const [filter, setFilter] = useState<string>("all");

  const roleFilters = useMemo(() => {
    const roles = new Set(staff.map((member) => member.role));
    return ["all", ...Array.from(roles)];
  }, [staff]);

  useEffect(() => {
    if (!roleFilters.includes(filter)) {
      setFilter("all");
    }
  }, [roleFilters, filter]);

  const filteredStaff = useMemo(() => {
    if (filter === "all") return staff;
    return staff.filter((member) => member.role === filter);
  }, [filter, staff]);

  const activeCount = useMemo(
    () => staff.filter((member) => member.status === "active").length,
    [staff]
  );

  if (!config) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Staff Directory</h2>
        </div>
        <Alert>
          <AlertTitle>Connect to Taccar</AlertTitle>
          <AlertDescription>
            Provide your Taccar credentials in the map panel to load the live staff roster.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Staff Directory</h2>
          <p className="text-xs text-muted-foreground">
            {isFetching ? "Refreshing positions…" : `${activeCount} of ${staff.length} active`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching || isLoading}>
          Refresh
        </Button>
      </div>

      {isError && error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load staff</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${roleFilters.length}, minmax(0, 1fr))` }}>
          {roleFilters.map((roleOption) => (
            <TabsTrigger key={roleOption} value={roleOption}>
              {roleOption === "all" ? "All" : roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))
              ) : filteredStaff.length ? (
                filteredStaff.map((staffMember) => (
                  <StaffCard
                    key={staffMember.id}
                    name={staffMember.name}
                    role={staffMember.role}
                    status={staffMember.status}
                    location={staffMember.location}
                    lastUpdate={staffMember.lastUpdate}
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-10">
                  No staff match the selected filter.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffList;
