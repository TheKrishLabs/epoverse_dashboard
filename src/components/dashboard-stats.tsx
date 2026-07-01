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

export function DashboardStats({ dashboardData }: DashboardStatsProps) {
    const summary = dashboardData.dashboard?.summary;

    const stats = [
        {
            title: "Total Posts",
            value: summary?.totalArticles || 0,
            icon: ListTodo,
            iconColor: "text-[#388e3c]", // green
            bgColor: "bg-[#e5f5cd] dark:bg-[#388e3c]/20",
        },
        {
            title: "Total Comments",
            value: summary?.totalComments || 0,
            icon: MessageCircle,
            iconColor: "text-[#343a40]", // dark grey
            bgColor: "bg-[#e2e6ea] dark:bg-[#343a40]/40",
        },
        {
            title: "Total Employees",
            value: summary?.totalEmployees || 0,
            icon: CheckCircle2,
            iconColor: "text-[#00acc1]", // cyan
            bgColor: "bg-[#e0f7fa] dark:bg-[#00acc1]/20",
        },
        {
            title: "Total Users",
            value: summary?.totalUsers || 0,
            icon: Users,
            iconColor: "text-[#d81b60]", // pink
            bgColor: "bg-[#f8bbd0] dark:bg-[#d81b60]/20",
        },
        {
            title: "Pending Articles",
            value: summary?.totalPendingArticles || 0,
            icon: Clock,
            iconColor: "text-[#5e35b1]", // purple
            bgColor: "bg-[#ede7f6] dark:bg-[#5e35b1]/20",
        },
        {
            title: "Approved Articles",
            value: summary?.totalApprovedArticles || 0,
            icon: FileCheck,
            iconColor: "text-[#039be5]", // blue
            bgColor: "bg-[#e1f5fe] dark:bg-[#039be5]/20",
        },
        {
            title: "Total Categories",
            value: summary?.totalCategory || 0,
            icon: Layers,
            iconColor: "text-[#fbc02d]", // yellow
            bgColor: "bg-[#fff9c4] dark:bg-[#fbc02d]/20",
        },
        {
            title: "Total Languages",
            value: summary?.totalLanguage || 0,
            icon: Files,
            iconColor: "text-[#43a047]", // mint green
            bgColor: "bg-[#c8e6c9] dark:bg-[#43a047]/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex items-center p-6 rounded-xl transition-all hover:scale-[1.02] cursor-default shadow-sm border-none",
                        stat.bgColor
                    )}
                >
                    <div className="mr-6">
                        <stat.icon className={cn("h-14 w-14", stat.iconColor)} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-black dark:text-white leading-tight">
                            {stat.title}
                        </h3>
                        <p className="text-xl font-medium text-black dark:text-white mt-1">
                            {stat.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

