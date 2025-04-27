import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SnippetContextMenu } from "@/components/snippet/snippet-context-menu";
import { Snippet } from "@/types/snippet";
import { ChevronDown, ChevronUp, Check, Pin, X, Clipboard, Edit, Tag, Trash2 } from "lucide-react";
import Highlight from 'react-syntax-highlighter';
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface SnippetCardProps {
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

export function SnippetCard({
                                snippet,
                                copied,
                                expandedSnippet,
                                onCopy,
                                onToggleExpand,
                                onTogglePin,
                                onDelete,
                                onEdit,
                                onTagFilter
                            }: SnippetCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [showActions, setShowActions] = useState(false);
    
    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!cardRef.current || !cardRef.current.contains(document.activeElement)) return;
        
        // Only process if this card has focus
        switch (e.key) {
            case 'c':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    onCopy(snippet.id, snippet.content);
                }
                break;
            case 'e':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    onEdit(snippet);
                }
                break;
            case 'p':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    onTogglePin(snippet.id, !snippet.isPinned);
                }
                break;
            case 'Delete':
                if (cardRef.current.contains(document.activeElement)) {
                    e.preventDefault();
                    onDelete(snippet.id);
                }
                break;
            case 'Escape':
                if (expandedSnippet === snippet.id) {
                    e.preventDefault();
                    onToggleExpand(snippet.id, new MouseEvent('click') as any);
                }
                break;
        }
    }, [snippet, onCopy, onEdit, onTogglePin, onDelete, onToggleExpand, expandedSnippet]);
    
    // Register and cleanup event listeners
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    
    return (
        <SnippetContextMenu
            snippet={snippet}
            onPinToggle={onTogglePin}
            onDelete={onDelete}
            onEdit={onEdit}
            onEditName={onEdit}
            onEditTags={onEdit}
        >
            <Card 
                ref={cardRef}
                className={cn(
                    "transition-shadow relative group cursor-pointer h-48",
                    snippet.isPinned ? "border-yellow-400 shadow-md" : "hover:shadow-md",
                    "focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50"
                )}
                onClick={() => onCopy(snippet.id, snippet.content)}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
                tabIndex={0}
            >
                {snippet.isPinned && (
                    <div className="absolute left-1 top-1">
                        <Pin size={12} className="text-yellow-500 fill-yellow-500"/>
                    </div>
                )}
                <CardContent className="p-3 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs truncate">{snippet.name}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                            {snippet.language}
                        </Badge>
                    </div>

                    <div className="overflow-hidden rounded-lg mb-2 h-24">
                        <Highlight
                            language={snippet.language || 'text'}
                            style={vscDarkPlus}
                            customStyle={{
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.7rem',
                                height: '100%',
                                overflow: 'hidden'
                            }}
                            codeTagProps={{ style: { fontFamily: 'JetBrains Mono, monospace' } }}
                        >
                            {snippet.content.split('\n').slice(0, 5).join('\n')}
                        </Highlight>
                    </div>

                    {snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {snippet.tags.slice(0, 3).map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="cursor-pointer text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTagFilter(tag);
                                    }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {snippet.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{snippet.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="text-xs text-gray-500 flex justify-between items-center mt-auto">
                        <span className="text-xs">
                          {copied === snippet.id ? (
                              <span className="text-green-500 flex items-center">
                                <Check size={10} className="mr-1"/>
                                Copied
                              </span>
                          ) : (
                              "Click to copy"
                          )}
                        </span>
                        <span className="text-xs text-gray-400 text-right">{new Date(snippet.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Quick action buttons */}
                    <div 
                        className={cn(
                            "absolute right-1 top-1 flex space-x-1 bg-gray-800/80 rounded-full px-1",
                            showActions || cardRef.current?.contains(document.activeElement) 
                                ? "opacity-100" 
                                : "opacity-0"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="p-1 text-white hover:text-green-400 transition-colors"
                                        onClick={() => onCopy(snippet.id, snippet.content)}
                                    >
                                        <Clipboard size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    Copy (Ctrl+C)
                                </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="p-1 text-white hover:text-blue-400 transition-colors"
                                        onClick={() => onEdit(snippet)}
                                    >
                                        <Edit size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    Edit (Ctrl+E)
                                </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="p-1 text-white hover:text-yellow-400 transition-colors"
                                        onClick={() => onTogglePin(snippet.id, !snippet.isPinned)}
                                    >
                                        <Pin size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    {snippet.isPinned ? "Unpin (Ctrl+P)" : "Pin (Ctrl+P)"}
                                </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="p-1 text-white hover:text-red-400 transition-colors"
                                        onClick={() => onDelete(snippet.id)}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    Delete (Delete)
                                </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="p-1 text-white hover:text-gray-300 transition-colors"
                                        onClick={(e) => onToggleExpand(snippet.id, e)}
                                    >
                                        {expandedSnippet === snippet.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    {expandedSnippet === snippet.id ? "Collapse (Esc)" : "Expand"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </SnippetContextMenu>
    );
}