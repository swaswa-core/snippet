'use client';

import React, { useState, useEffect } from "react";
import { IconCode, IconPlus, IconX } from "@tabler/icons-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { detectLanguage } from "@/lib/snippet-util";
import { Snippet } from "@/types/snippet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarSnippetFormProps {
    navItems: any[];
    onCreateSnippet: (snippetData: Partial<Snippet>) => Promise<void>;
    snippets: Snippet[];
}

export function SidebarWithSnippetForm({
                                           navItems,
                                           onCreateSnippet,
                                           snippets
                                       }: SidebarSnippetFormProps) {
    // State for snippet form
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [detectedLanguage, setDetectedLanguage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

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

    // Content change handler with language detection
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        setDetectedLanguage(detectLanguage(newContent));
    };

    // Auto-suggest name based on language
    useEffect(() => {
        if (!name.trim() && detectedLanguage) {
            const count = snippets.filter(s => s.language === detectedLanguage).length;
            setName(`${detectedLanguage}-snippet-${count + 1}`);
        }
    }, [detectedLanguage, snippets, name]);

    // Save snippet function
    const saveSnippet = async () => {
        if (!name.trim() || !content.trim()) return;

        setIsLoading(true);
        try {
            await onCreateSnippet({
                name,
                content,
                tags,
                language: detectedLanguage || 'text',
                isPinned: false
            });

            // Reset form
            setName("");
            setContent("");
            setTags([]);
            setDetectedLanguage("");
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save snippet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Acme Inc.</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {/* Collapsible Snippet Form */}
                        <Collapsible
                            open={isFormOpen}
                            onOpenChange={setIsFormOpen}
                            className="w-full mb-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="default"
                                    className="w-full flex items-center justify-between bg-primary hover:bg-primary/90 text-white"
                                >
                                    <div className="flex items-center">
                                        <IconCode size={16} className="mr-2" />
                                        <span>New Snippet</span>
                                    </div>
                                    {isFormOpen ? <IconX size={16} /> : <IconPlus size={16} />}
                                </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="p-2 space-y-2 bg-gray-50 rounded-md mt-1">
                                <Input
                                    placeholder="Snippet name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-xs"
                                />

                                <Textarea
                                    value={content}
                                    onChange={handleContentChange}
                                    placeholder="Paste your code here..."
                                    className="min-h-[80px] text-xs font-mono"
                                />

                                <div className="flex items-center gap-1">
                                    <Input
                                        placeholder="Add tags (Enter)"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={handleTagKeyPress}
                                        className="text-xs flex-1"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={addTag}
                                        disabled={!currentTag.trim()}
                                        className="h-7 w-7 p-0"
                                    >
                                        <IconPlus size={12} />
                                    </Button>
                                </div>

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs flex items-center">
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <IconX size={10} />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {detectedLanguage && (
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="text-gray-500">Detected:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {detectedLanguage}
                                        </Badge>
                                    </div>
                                )}

                                <Button
                                    onClick={saveSnippet}
                                    disabled={!name.trim() || !content.trim() || isLoading}
                                    className="w-full text-xs"
                                >
                                    {isLoading ? "Saving..." : "Save Snippet"}
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Navigation Menu */}
                        <SidebarMenu>
                            {navItems.map((item) => {
                                // Get the icon component dynamically
                                const IconComponent = item.iconComponent || (() => <div>•</div>);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url} className="flex items-center">
                                                <IconComponent size={16} />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}