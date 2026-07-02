"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { AuthButtons } from "./auth-buttons";
import { MobileNav } from "./mobile-nav";
import { Button } from "./ui/button";
import { Eye, RefreshCw, Maximize } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-background/95 supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="mr-4 flex items-center md:ml-0 ml-2">
            <span className="text-3xl font-black tracking-tight text-black dark:text-white">
              Epoverse<span className="text-[#e74c3c]">.</span>
            </span>
          </Link>
          <MobileNav />

          <Button variant="outline" size="sm" className="hidden md:flex bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] hover:text-[#2e7d32] border-none ml-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Cache clear
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex text-[#2e7d32] hover:bg-[#e8f5e9] hover:text-[#2e7d32]">
              <Eye className="mr-2 h-4 w-4" />
              View site
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex text-muted-foreground hover:bg-accent/50 rounded-full">
              <Maximize className="h-4 w-4" />
            </Button>
            <ModeToggle />
            <AuthButtons />
          </nav>
        </div>
      </div>
    </header>
  );
}
