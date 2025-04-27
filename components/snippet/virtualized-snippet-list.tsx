'use client';

import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Snippet } from '@/types/snippet';
import { SnippetCard } from './snippet-card';

interface VirtualizedSnippetListProps {
    snippets: Snippet[];
    copied: string | null;
    expandedSnippet: string | null;
    onCopy: (id: string, content: string) => void;
    onToggleExpand: (id: string, e: React.MouseEvent) => void;
    onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onEdit: (snippet: Snippet) => void;
    onTagFilter: (tag: string) => void;
    className?: string;
}

export function VirtualizedSnippetList({
    snippets,
    copied,
    expandedSnippet,
    onCopy,
    onToggleExpand,
    onTogglePin,
    onDelete,
    onEdit,
    onTagFilter,
    className = '',
}: VirtualizedSnippetListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    
    // Recalculate on window resize
    useEffect(() => {
        const handleResize = () => {
            if (rowVirtualizer) {
                rowVirtualizer.measure();
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const rowVirtualizer = useVirtualizer({
        count: snippets.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 200, // Approximate height of a card
        overscan: 5, // Number of items to render outside of the visible area
    });
    
    return (
        <div 
            ref={parentRef} 
            className={`h-[600px] overflow-auto ${className}`}
            style={{
                height: '600px',
                width: '100%',
                overflow: 'auto',
            }}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map(virtualItem => {
                    const snippet = snippets[virtualItem.index];
                    return (
                        <div
                            key={snippet.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                                padding: '0.5rem',
                            }}
                        >
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
                    );
                })}
            </div>
        </div>
    );
}