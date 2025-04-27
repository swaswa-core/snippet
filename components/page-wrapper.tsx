interface PageWrapperProps {
    children: React.ReactNode;
    title?: string;
}
import React from "react";



export function PageWrapper({ title, children }: PageWrapperProps) {
    return (
        <div className="container mx-auto px-2 py-4 max-w-7xl">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            {children}
        </div>
    );
}