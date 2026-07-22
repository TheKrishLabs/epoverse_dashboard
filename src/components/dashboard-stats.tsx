"use client";

import {
    ListTodo,
    MessageCircle,
    Users,
    CheckCircle2,
    Files,
    Layers,
    Clock,
    FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardResponse } from "@/services/dashboard-service";

interface DashboardStatsProps {
    dashboardData: DashboardResponse;
}

export function PrimaryDashboardStats({ dashboardData }: DashboardStatsProps) {
    const summary = dashboardData.dashboard?.summary;

    const stats = [
        {
            title: "Total Posts",
            value: summary?.totalArticles || 0,
            icon: ListTodo,
            gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            borderColor: "border-emerald-200 dark:border-emerald-500/30",
        },
        {
            title: "Total Users",
            value: summary?.totalUsers || 0,
            icon: Users,
            gradient: "from-pink-500/10 via-pink-500/5 to-transparent",
            iconColor: "text-pink-600 dark:text-pink-400",
            borderColor: "border-pink-200 dark:border-pink-500/30",
        },
        {
            title: "Total Comments",
            value: summary?.totalComments || 0,
            icon: MessageCircle,
            gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
            iconColor: "text-blue-600 dark:text-blue-400",
            borderColor: "border-blue-200 dark:border-blue-500/30",
        },
        {
            title: "Total Employees",
            value: summary?.totalEmployees || 0,
            icon: CheckCircle2,
            gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
            iconColor: "text-cyan-600 dark:text-cyan-400",
            borderColor: "border-cyan-200 dark:border-cyan-500/30",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={cn(
                        "relative flex flex-col p-6 rounded-2xl overflow-hidden transition-all duration-300",
                        "bg-white/80 dark:bg-slate-900/50 backdrop-blur-md",
                        "border shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-default",
                        stat.borderColor
                    )}
                >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", stat.gradient)} />
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border", stat.borderColor)}>
                            <stat.icon className={cn("h-6 w-6", stat.iconColor)} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col">
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                            {stat.value}
                        </p>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {stat.title}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SecondaryDashboardStats({ dashboardData }: DashboardStatsProps) {
    const summary = dashboardData.dashboard?.summary;

    const stats = [
        {
            title: "Pending Articles",
            value: summary?.totalPendingArticles || 0,
            icon: Clock,
            iconColor: "text-purple-600 dark:text-purple-400",
            bgLight: "bg-purple-50",
            bgDark: "dark:bg-purple-500/10",
        },
        {
            title: "Approved Articles",
            value: summary?.totalApprovedArticles || 0,
            icon: FileCheck,
            iconColor: "text-blue-600 dark:text-blue-400",
            bgLight: "bg-blue-50",
            bgDark: "dark:bg-blue-500/10",
        },
        {
            title: "Total Categories",
            value: summary?.totalCategory || 0,
            icon: Layers,
            iconColor: "text-amber-600 dark:text-amber-400",
            bgLight: "bg-amber-50",
            bgDark: "dark:bg-amber-500/10",
        },
        {
            title: "Total Languages",
            value: summary?.totalLanguage || 0,
            icon: Files,
            iconColor: "text-emerald-600 dark:text-emerald-400",
            bgLight: "bg-emerald-50",
            bgDark: "dark:bg-emerald-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-full flex items-center justify-center", stat.bgLight, stat.bgDark)}>
                            <stat.icon className={cn("h-5 w-5", stat.iconColor)} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {stat.title}
                        </h3>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

