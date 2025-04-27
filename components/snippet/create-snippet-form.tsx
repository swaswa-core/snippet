'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { Snippet } from "@/types/snippet";

interface CreateSnippetFormProps {
    name: string;
    content: string;
    tags: string[];
    currentTag: string;
    detectedLanguage: string;
    isLoading: boolean;
    snippets: Snippet[]; // Added snippets prop
    setName: (value: string) => void;
    setContent: (value: string) => void;
    setCurrentTag: (value: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
    handleTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    saveSnippet: () => void;
}

export function CreateSnippetForm({
                                      name,
                                      content,
                                      tags,
                                      currentTag,
                                      detectedLanguage,
                                      isLoading,
                                      snippets,
                                      setName,
                                      setContent,
                                      setCurrentTag,
                                      addTag,
                                      removeTag,
                                      handleTagKeyPress,
                                      handleContentChange,
                                      saveSnippet
                                  }: CreateSnippetFormProps) {
    // Moved useEffect inside the component function
    useEffect(() => {
        if (!name.trim() && detectedLanguage) {
            const count = snippets.filter(s => s.language === detectedLanguage).length;
            setName(`${detectedLanguage}-snippet-${count + 1}`);
        }
    }, [detectedLanguage, snippets, name, setName]);

    return (
        <div className="p-4 border-b bg-gray-50">
            <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left column - Snippet name and language */}
                <div className="space-y-4 md:col-span-1">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Snippet name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 text-sm"
                        />
                        {detectedLanguage && (
                            <Badge variant="outline" className="shrink-0">
                                {detectedLanguage}
                            </Badge>
                        )}
                    </div>

                    <div className="mb-2">
                        <div className="flex items-center">
                            <Input
                                id="tag-input"
                                placeholder="Add tags (press Enter to add)"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagKeyPress}
                                className="flex-grow text-sm"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={addTag}
                                className="ml-2"
                                disabled={!currentTag.trim()}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="flex items-center text-xs">
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X size={12} />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={saveSnippet}
                        disabled={!name.trim() || !content.trim() || isLoading}
                        className="w-full text-sm"
                    >
                        {isLoading ? "Saving..." : "Save Snippet"}
                    </Button>

                    {!name.trim() && content.trim() && (
                        <div className="text-red-500 text-xs mt-1">
                            Please enter a name for your snippet
                        </div>
                    )}
                </div>

                {/* Right column - Code content */}
                <div className="md:col-span-2">
                    <Textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Paste your code here..."
                        className="min-h-[180px] text-sm font-mono w-full"
                    />
                </div>
            </div>
        </div>
    );
}