import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {Snippet} from "@/types/snippet";
import {SnippetCard} from "@/components/snippet/snippet-card";
import {Pin} from "lucide-react";

interface SnippetCarouselProps {
    snippet: Snippet;
    copied: string | null;
    expandedSnippet: string | null;
    onCopy: (id: string, content: string) => void;
    onToggleExpand: (id: string, e: React.MouseEvent) => void;
    onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onEdit: (snippet: Snippet) => void;
    onTagFilter: (tag: string) => void;
}

export function SnippetColumnCarousel({
                                          snippet,
                                          copied,
                                          expandedSnippet,
                                          onCopy,
                                          onToggleExpand,
                                          onTogglePin,
                                          onDelete,
                                          onEdit,
                                          onTagFilter
                                      }: SnippetCarouselProps) {
    // Since we only have one snippet per carousel now, we'll just display it
    return (
        <div className="mb-4">
            <div className="p-1">
                <SnippetCard
                    snippet={snippet}
                    copied={copied}
                    expandedSnippet={expandedSnippet}
                    onCopy={onCopy}
                    onToggleExpand={onToggleExpand}
                    onTogglePin={onTogglePin}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onTagFilter={onTagFilter}
                />
            </div>
        </div>
    )
}

// New component to handle groups of snippets in a carousel
interface SnippetGroupCarouselProps {
    snippets: Snippet[];
    title: string;
    isPinned?: boolean;
    copied: string | null;
    expandedSnippet: string | null;
    onCopy: (id: string, content: string) => void;
    onToggleExpand: (id: string, e: React.MouseEvent) => void;
    onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onEdit: (snippet: Snippet) => void;
    onTagFilter: (tag: string) => void;
}

export function SnippetGroupCarousel({
                                         snippets,
                                         title,
                                         isPinned = false,
                                         copied,
                                         expandedSnippet,
                                         onCopy,
                                         onToggleExpand,
                                         onTogglePin,
                                         onDelete,
                                         onEdit,
                                         onTagFilter
                                     }: SnippetGroupCarouselProps) {
    return (
        <div className="p-4 border-b">
            <div className="flex items-center mb-2">
                {isPinned && <Pin size={16} className="text-yellow-500 mr-2" />}
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2">
                    {snippets.map((snippet) => (
                        <CarouselItem key={snippet.id} className="pl-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                            <div className="p-1">
                                <SnippetCard
                                    snippet={snippet}
                                    copied={copied}
                                    expandedSnippet={expandedSnippet}
                                    onCopy={onCopy}
                                    onToggleExpand={onToggleExpand}
                                    onTogglePin={onTogglePin}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onTagFilter={onTagFilter}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}

export function SnippetRowCarousel() {
    return (
        <Carousel
            opts={{
                align: "start",
            }}
            orientation="vertical"
            className="w-full max-w-xs"
        >
            <CarouselContent className="-mt-1 h-[200px]">
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="pt-1 md:basis-1/2">
                        <div className="p-1">
                            <Card>
                                <CardContent className="flex items-center justify-center p-6">
                                    <span className="text-3xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}