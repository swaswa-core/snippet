'use client'
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

export interface NotificationItem {
    id: string | number
    title: string
    message: string
    time: string
    read?: boolean
}

export interface NotificationPopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
    notifications?: NotificationItem[]
    count?: number
    icon?: React.ReactNode
    onNotificationClick?: (notification: NotificationItem) => void
    onClearAll?: () => void
    emptyMessage?: string
    className?: string
}

export default function NotificationPopover({
                                 notifications = [],
                                 count,
                                 icon,
                                 onNotificationClick,
                                 onClearAll,
                                 emptyMessage = "No notifications",
                                 className,
                                 ...props
                             }: NotificationPopoverProps) {
    // Use provided count or calculate from unread notifications
    const notificationCount = count ?? notifications.filter(n => !n.read).length

    return (
        <Popover {...props}>
            <PopoverTrigger asChild>
                <div className={cn("ml-auto flex items-center gap-2", className)}>
                    <Button variant="ghost" size="icon" className="relative">
                        {icon || <BellIcon className="h-5 w-5" />}
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
                        )}
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-medium">Notifications</h3>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearAll}
                            className="h-auto px-2 text-xs"
                        >
                            Clear all
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-auto">
                    {notifications.length > 0 ? (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-3 border-b text-sm cursor-pointer hover:bg-muted transition-colors",
                                        !notification.read && "bg-muted/50"
                                    )}
                                    onClick={() => onNotificationClick?.(notification)}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium">{notification.title}</span>
                                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                                    </div>
                                    <p className="text-muted-foreground">{notification.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

// For convenience, providing a Bell icon component in case it's not imported
export function BellIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    )
}