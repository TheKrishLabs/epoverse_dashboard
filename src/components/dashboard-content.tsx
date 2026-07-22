"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { dashboardService, DashboardResponse } from "@/services/dashboard-service";
import { PrimaryDashboardStats, SecondaryDashboardStats } from "@/components/dashboard-stats";
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
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        {/* Primary Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[140px] w-full rounded-2xl" />
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4">
             {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[80px] w-full rounded-2xl" />
             ))}
          </div>
        </div>

        {/* Latest Articles Skeleton */}
        <Skeleton className="h-[300px] w-full rounded-2xl mt-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PrimaryDashboardStats dashboardData={data} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-full">
          <ChartAreaInteractive dashboardData={data} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
          <SecondaryDashboardStats dashboardData={data} />
        </div>
      </div>
      
      <div className="w-full">
        <LatestArticles />
      </div>
    </div>
  );
}
