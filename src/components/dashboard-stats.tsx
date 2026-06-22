"use client";

import { 
    ListTodo, 
    MessageCircle, 
    Users, 
    CheckCircle2, 
    Clock, 
    Star, 
    Files,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardResponse } from "@/services/dashboard-service";

interface DashboardStatsProps {
    dashboardData: DashboardResponse;
}

export function DashboardStats({ dashboardData }: DashboardStatsProps) {
    // Graceful fallbacks using 0 if the backend omits any fields
    const stats = [
        {
            title: "Total Posts",
            value: dashboardData.totalArticle?.allLength || 0,
            icon: ListTodo,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            title: "Approved Posts",
            value: dashboardData.totalArticle?.approvedCount || 0,
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
            title: "Pending Posts",
            value: dashboardData.totalArticle?.pendingCount || 0,
            icon: Clock,
            color: "text-yellow-600 dark:text-yellow-500",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        },
        {
            title: "Featured Posts",
            value: dashboardData.totalArticle?.featuredCount || 0,
            icon: Star,
            color: "text-orange-500",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
        },
        {
            title: "Total Comments",
            value: dashboardData.totalComments || 0,
            icon: MessageCircle,
            color: "text-slate-600 dark:text-slate-300",
            bgColor: "bg-slate-100 dark:bg-slate-800/50",
        },
        {
            title: "Total Categories",
            value: dashboardData.totalCategories || 0,
            icon: Layers,
            color: "text-indigo-600",
            bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        },
        {
            title: "Total Users",
            value: dashboardData.totalUser || 0,
            icon: Users,
            color: "text-pink-600",
            bgColor: "bg-pink-100 dark:bg-pink-900/30",
        },
        {
            title: "Total Languages",
            value: dashboardData.totalLanguage || 0,
            icon: Files,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div 
                    key={index} 
                    className={cn(
                        "flex items-center p-4 rounded-xl transition-all hover:scale-[1.02] cursor-default border shadow-sm",
                        stat.bgColor
                    )}
                >
                    <div className={cn("p-3 rounded-lg mr-4 bg-white/50 dark:bg-black/20", stat.color)}>
                        <stat.icon className="h-8 w-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className={cn("text-sm font-bold text-muted-foreground/80 dark:text-muted-foreground", "text-black/70 dark:text-white/70")}>
                            {stat.title}
                        </p>
                        <h3 className={cn("text-2xl font-bold", "text-black/90 dark:text-white mt-1")}>
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
