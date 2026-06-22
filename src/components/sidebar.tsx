"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { sidebarNav } from "@/config/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onLinkClick?: () => void;
}

export function SidebarContent({ className, onLinkClick }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("pb-12 h-full flex flex-col bg-background/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60", className)}>
            <div className="space-y-4 py-4 flex flex-col h-full overflow-hidden">
                <div className="px-3 py-2 flex-1 flex flex-col min-h-0">
                    <div className="mb-6 px-4 relative flex-shrink-0">
                        <Search className="absolute left-6 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input placeholder="Search modules..." className="h-9 pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <ScrollArea className="flex-1 px-1 pr-3 w-full" type="always">
                        <div className="space-y-6 pb-2">
                            {sidebarNav.map((group, groupIndex) => (
                                <div key={groupIndex} className="px-3">
                                    <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                        {group.title}
                                    </h2>
                                    <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                
                                if (item.items && item.items.length > 0) {
                                    return (
                                        <DropdownMenu key={item.title}>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant={isActive ? "secondary" : "ghost"}
                                                    className={cn(
                                                        "w-full justify-start h-9 px-4 font-normal transition-all duration-200",
                                                        isActive
                                                            ? "bg-primary/10 text-primary hover:bg-primary/15 font-medium shadow-sm"
                                                            : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                                                    )}
                                                >
                                                    <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                                    {item.title}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" side="right" className="w-48 ml-2">
                                                {item.items.map((subItem) => (
                                                    <DropdownMenuItem key={subItem.title} asChild>
                                                        <Link href={subItem.href} className="cursor-pointer">
                                                            <subItem.icon className="mr-2 h-4 w-4" />
                                                            {subItem.title}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                }

                                return (
                                    <Button
                                        key={item.title}
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start h-9 px-4 font-normal transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary hover:bg-primary/15 font-medium shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                                        )}
                                        asChild
                                        onClick={onLinkClick}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                                    </div>
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
    <div className={cn("border-r", className)}>
       <SidebarContent /> 
    </div>
  );
}
