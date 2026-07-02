"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { sidebarNav } from "@/config/nav";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onLinkClick?: () => void;
}

export function SidebarContent({ className, onLinkClick }: SidebarProps) {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (title: string) => {
        setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <div className={cn("pb-12 h-full flex flex-col bg-white dark:bg-background/95", className)}>
            <div className="space-y-4 py-4 flex flex-col h-full overflow-hidden">
                <div className="py-2 flex-1 flex flex-col min-h-0">
                    <div className="mb-6 px-4 relative flex-shrink-0">
                        <Input placeholder="Menu Search..." className="h-10 border text-sm rounded-none focus-visible:ring-1 focus-visible:ring-[#2e7d32]" />
                    </div>
                    <ScrollArea className="flex-1 w-full" type="always">
                        <div className="space-y-1 pb-2">
                            {sidebarNav.map((group, groupIndex) => (
                                <div key={groupIndex} className={cn("space-y-1", groupIndex !== 0 && "mt-1")}>
                                    {group.items.map((item) => {
                                        const isSubItemActive = item.items?.some(sub => pathname === sub.href);
                                        const isActive = pathname === item.href || isSubItemActive;

                                        if (item.items && item.items.length > 0) {
                                            const isExpanded = expanded[item.title] !== undefined ? expanded[item.title] : isSubItemActive;

                                            return (
                                                <div key={item.title} className="space-y-1">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleExpand(item.title)}
                                                        className={cn(
                                                            "w-full justify-between h-11 px-6 font-normal transition-all duration-200 rounded-none",
                                                            isExpanded || isActive
                                                                ? "bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] dark:bg-green-900/20 dark:text-green-400 border-l-4 border-[#2e7d32]"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-l-4 border-transparent"
                                                        )}
                                                    >
                                                        <div className="flex items-center">
                                                            <item.icon className={cn("mr-3 h-5 w-5", (isExpanded || isActive) ? "text-[#2e7d32] dark:text-green-400" : "text-muted-foreground")} />
                                                            {item.title}
                                                        </div>
                                                        <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                                                    </Button>

                                                    {isExpanded && (
                                                        <div className="space-y-1 mt-1 bg-[#f9fbf9] dark:bg-black/10 py-2">
                                                            {item.items.map((subItem) => {
                                                                const isSubActive = pathname === subItem.href;
                                                                return (
                                                                    <Button
                                                                        key={subItem.title}
                                                                        variant="ghost"
                                                                        asChild
                                                                        onClick={onLinkClick}
                                                                        className={cn(
                                                                            "w-full justify-start h-9 pl-12 pr-6 font-normal transition-all duration-200 rounded-none",
                                                                            isSubActive
                                                                                ? "text-[#2e7d32] dark:text-green-400 font-medium"
                                                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                                                        )}
                                                                    >
                                                                        <Link href={subItem.href}>
                                                                            <Circle className={cn("mr-3 h-2 w-2 fill-current", isSubActive ? "text-[#2e7d32] dark:text-green-400" : "text-[#4caf50]")} />
                                                                            {subItem.title}
                                                                        </Link>
                                                                    </Button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <Button
                                                key={item.title}
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start h-11 px-6 font-normal transition-all duration-200 rounded-none",
                                                    isActive
                                                        ? "bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] dark:bg-green-900/20 dark:text-green-400 font-medium border-l-4 border-[#2e7d32]"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-l-4 border-transparent"
                                                )}
                                                asChild
                                                onClick={onLinkClick}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-[#2e7d32] dark:text-green-400" : "text-muted-foreground")} />
                                                    {item.title}
                                                </Link>
                                            </Button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <ScrollBar orientation="vertical" className="bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors w-2" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("border-r bg-white dark:bg-background", className)}>
            <SidebarContent />
        </div>
    );
}

