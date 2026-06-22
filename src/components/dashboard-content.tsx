"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { dashboardService, DashboardResponse } from "@/services/dashboard-service";
import { DashboardStats } from "@/components/dashboard-stats";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { LatestArticles } from "@/components/dashboard/latest-articles";

export function DashboardContent() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await dashboardService.getAdminDashboard();
        if (res) {
            setData(res);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
            // @ts-expect-error Extracting potential customMessage from axios error utility
            setError(err.customMessage || err.message);
        } else {
            setError("Failed to load dashboard metrics");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {error}. Try refreshing the page or checking your credentials.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading core metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <DashboardStats dashboardData={data} />
      <div className="z-10 w-full flex flex-col gap-8">
        <ChartAreaInteractive dashboardData={data} />
      </div>
      <div className="w-full">
        <LatestArticles />
      </div>
    </div>
  );
}
