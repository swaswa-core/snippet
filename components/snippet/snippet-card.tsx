import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SnippetContextMenu } from "@/components/snippet/snippet-context-menu";
import { Snippet } from "@/types/snippet";
import { ChevronDown, ChevronUp, Check, Pin, X } from "lucide-react";
import Highlight from 'react-syntax-highlighter';
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
    return (
        <SnippetContextMenu
            snippet={snippet}
            onPinToggle={onTogglePin}
            onDelete={onDelete}
            onEdit={onEdit}
            onEditName={onEdit}
            onEditTags={onEdit}
        >
            <Card className={cn(
                "transition-shadow relative group cursor-pointer h-48",
                snippet.isPinned ? "border-yellow-400 shadow-md" : "hover:shadow-md"
            )}
                  onClick={() => onCopy(snippet.id, snippet.content)}
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

                    <button
                        className="absolute right-1 top-1 p-1 rounded-full bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => onToggleExpand(snippet.id, e)}
                        title={expandedSnippet === snippet.id ? "Collapse" : "Expand"}
                    >
                        {expandedSnippet === snippet.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </button>
                </CardContent>
            </Card>
        </SnippetContextMenu>
    );
}