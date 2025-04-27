'use client'

import React from "react"
import { navItems } from "@/data/navigation-data"
import { NavMain } from "./sidebar-nav"

// Client component that renders the NavMain with serializable data
export default function AppSidebarNavMain() {
    return (
        <NavMain
            items={[
                ...navItems,
                {
                    title: "Snippets",
                    url: "/snippets",
                    iconName: "IconCode"
                }
            ]}
        />
    )
}