"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import * as TablerIcons from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { detectLanguage } from "@/lib/snippet-util"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Snippet } from "@/types/snippet"

// Use a string-based approach for icons to make it serializable
export interface SerializableNavItem {
    title: string
    url: string
    iconName: string  // Icon name as a string instead of a component
    content?: React.ReactNode
    disabled?: boolean
    external?: boolean
    badge?: React.ReactNode
}

export interface NavMainProps {
    items: SerializableNavItem[]
    activeUrl?: string
    className?: string
    additionalActions?: React.ReactNode
    customActiveCheck?: (item: SerializableNavItem, pathname: string) => boolean
}

// Client component that resolves icon names to actual components
export function NavMain({
                            items,
                            activeUrl,
                            className,
                            additionalActions,
                            customActiveCheck,
                        }: NavMainProps) {
    const pathname = usePathname()
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [name, setName] = useState("")
    const [content, setContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState("")
    const [detectedLanguage, setDetectedLanguage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Fetch snippets for auto-naming
    useEffect(() => {
        const fetchSnippets = async () => {
            try {
                const response = await fetch('/api/snippets');
                if (response.ok) {
                    const data = await response.json();
                    setSnippets(data);
                }
            } catch (error) {
                console.error("Failed to fetch snippets:", error);
            }
        };
        fetchSnippets();
    }, []);

    // Auto-suggest name based on language
    useEffect(() => {
        if (!name.trim() && detectedLanguage) {
            const count = snippets.filter(s => s.language === detectedLanguage).length;
            setName(`${detectedLanguage}-snippet-${count + 1}`);
        }
    }, [detectedLanguage, snippets, name]);

    // Map icon names to actual components
    const getIconComponent = (iconName: string) => {
        // @ts-ignore - TablerIcons will have the icon as a property
        const IconComponent = TablerIcons[iconName]
        return IconComponent || TablerIcons.IconCircleX // Fallback icon
    }

    // Content change handler with language detection
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        setDetectedLanguage(detectLanguage(newContent));
    };

    // Tag management functions
    const addTag = () => {
        if (!currentTag.trim()) return;
        setTags(prev => [...prev, currentTag.trim()]);
        setCurrentTag("");
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    // Save snippet function
    const saveSnippet = async () => {
        if (!name.trim() || !content.trim()) {
            toast.error("Please provide both a name and content");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/snippets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    language: detectedLanguage || 'text',
                    name,
                    tags,
                    isPinned: false,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save snippet');
            }

            await response.json();

            // Reset form
            setName("");
            setContent("");
            setTags([]);
            setDetectedLanguage("");
            toast.success("Snippet saved successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to save snippet");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarGroup className={className}>
            <SidebarGroupContent className="flex flex-col gap-4">
                {/* Always-visible Snippet Form */}
                <div className="p-2 space-y-3">
                    <SidebarGroupContent className="p-0 space-y-3">
                        <Input
                            placeholder="Snippet name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white"
                        />

                        <Textarea
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Paste your code here..."
                            className="min-h-[100px] font-mono bg-white"
                        />

                        <div className="flex gap-1">
                            <Input
                                placeholder="Add tags (press Enter)"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagKeyPress}
                                className="flex-1 bg-white"
                            />
                            <Button
                                variant="outline"
                                onClick={addTag}
                                disabled={!currentTag.trim()}
                                className="shrink-0 px-2"
                            >
                                <TablerIcons.IconPlus size={16} />
                            </Button>
                        </div>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="flex items-center">
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <TablerIcons.IconX size={12} />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {detectedLanguage && (
                            <div className="flex justify-between text-xs items-center">
                                <span className="text-gray-500">Detected language:</span>
                                <Badge variant="outline">
                                    {detectedLanguage}
                                </Badge>
                            </div>
                        )}

                        <Button
                            onClick={saveSnippet}
                            disabled={!name.trim() || !content.trim() || isLoading}
                            className="w-full bg-gray-600 hover:bg-gray-700"
                        >
                            {isLoading ? "Saving..." : "Save Snippet"}
                        </Button>
                    </SidebarGroupContent>
                </div>

                {/* Navigation items */}
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = customActiveCheck
                            ? customActiveCheck(item, pathname)
                            : pathname === item.url || activeUrl === item.url

                        // Get the actual icon component from the name
                        const IconComponent = getIconComponent(item.iconName)

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive}
                                    disabled={item.disabled}
                                >
                                    {item.external ? (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            <IconComponent />
                                            <span>{item.title}</span>
                                            {item.badge && (
                                                <span className="ml-auto">{item.badge}</span>
                                            )}
                                        </a>
                                    ) : (
                                        <Link href={item.url}>
                                            <IconComponent />
                                            <span>{item.title}</span>
                                            {item.badge && (
                                                <span className="ml-auto">{item.badge}</span>
                                            )}
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>

                {additionalActions}
            </SidebarGroupContent>
        </SidebarGroup>
    )
}