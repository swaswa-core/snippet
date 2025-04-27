'use client';

import { Separator } from "@/components/ui/separator";
import NotificationPopover from "@/components/layout/notification-popover";
import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SiteHeader({ onSearch }: { onSearch?: (query: string) => void }) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");

    // Determine current page title based on pathname
    const getPageTitle = () => {
        if (pathname === '/') return 'Home';
        if (pathname === '/inbox') return 'Inbox';
        if (pathname.includes('/snippets')) return 'Snippets';
        return 'Documents';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) onSearch(searchQuery);
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="relative w-64">
                        <IconSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="w-full pl-8 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* User actions */}
                    <div className="flex items-center gap-2">
                        <NotificationPopover />
                        <Button variant="ghost" size="sm" className="gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                AI
              </span>
                            <span className="hidden md:inline-block">Admin</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}