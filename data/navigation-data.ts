// Define navigation items using string-based icon names
import {SerializableNavItem} from "@/components/layout/sidebar-nav";

export const navItems: SerializableNavItem[] = [
    {
        title: "Dashboard",
        url: "/",
        iconName: "IconDashboard"
    },
    {
        title: "Snippets",
        url: "/snippets",
        iconName: "IconCode"
    }
]