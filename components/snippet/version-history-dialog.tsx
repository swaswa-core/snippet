'use client';

import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Snippet } from '@/types/snippet';
import { HistoryIcon, CheckIcon, ArrowRightIcon, TimerIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Highlight from 'react-syntax-highlighter';
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface SnippetVersion {
    id: string;
    snippetId: string;
    content: string;
    versionNumber: number;
    createdAt: string | Date;
}

interface VersionHistoryDialogProps {
    snippet: Snippet | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onRestore: (version: SnippetVersion) => void;
}

export function VersionHistoryDialog({
    snippet,
    isOpen,
    onOpenChange,
    onRestore
}: VersionHistoryDialogProps) {
    const [versions, setVersions] = useState<SnippetVersion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
    const [compareMode, setCompareMode] = useState(false);
    const [comparedVersions, setComparedVersions] = useState<{
        older: SnippetVersion | null;
        newer: SnippetVersion | null;
    }>({ older: null, newer: null });
    
    // Fetch versions when dialog opens and snippet changes
    useEffect(() => {
        if (isOpen && snippet) {
            fetchVersions();
        } else {
            // Reset selections when dialog closes
            setSelectedVersionId(null);
            setCompareMode(false);
            setComparedVersions({ older: null, newer: null });
        }
    }, [isOpen, snippet]);
    
    const fetchVersions = async () => {
        if (!snippet) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/snippets/${snippet.id}/versions`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch versions');
            }
            
            const data = await response.json();
            
            // Add the current version to the list
            const currentVersion: SnippetVersion = {
                id: 'current',
                snippetId: snippet.id,
                content: snippet.content,
                versionNumber: data.length > 0 ? data[0].versionNumber + 1 : 1,
                createdAt: snippet.updatedAt || new Date()
            };
            
            const allVersions = [currentVersion, ...data];
            setVersions(allVersions);
            
            // Select the current version by default
            setSelectedVersionId('current');
        } catch (error) {
            console.error('Error fetching versions:', error);
            setError('Failed to load version history');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRestoreVersion = () => {
        const selectedVersion = versions.find(v => v.id === selectedVersionId);
        if (selectedVersion && selectedVersion.id !== 'current') {
            onRestore(selectedVersion);
            onOpenChange(false);
        }
    };
    
    const handleCompareSelect = (version: SnippetVersion) => {
        if (!compareMode) return;
        
        if (!comparedVersions.newer) {
            setComparedVersions({ ...comparedVersions, newer: version });
        } else if (!comparedVersions.older) {
            // Ensure newer version has higher version number than older
            if (version.versionNumber > comparedVersions.newer.versionNumber) {
                setComparedVersions({ older: comparedVersions.newer, newer: version });
            } else {
                setComparedVersions({ ...comparedVersions, older: version });
            }
        } else {
            // Reset and start over
            setComparedVersions({ newer: version, older: null });
        }
    };
    
    // Helper to format relative time
    const formatRelativeTime = (date: Date | string) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };
    
    // Selected version object
    const selectedVersion = versions.find(v => v.id === selectedVersionId);
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HistoryIcon className="h-5 w-5" />
                        Version History
                    </DialogTitle>
                    <DialogDescription>
                        View and restore previous versions of this snippet
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 flex flex-col min-h-0">
                    <Tabs defaultValue="history" className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <TabsList>
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="compare">Compare</TabsTrigger>
                            </TabsList>
                            
                            {!compareMode && selectedVersionId && selectedVersionId !== 'current' && (
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={handleRestoreVersion}
                                >
                                    Restore this version
                                </Button>
                            )}
                        </div>
                        
                        <TabsContent value="history" className="flex-1 flex gap-4 min-h-0">
                            {/* Version list */}
                            <div className="w-1/3 border rounded-md overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="p-4">
                                        {isLoading ? (
                                            <div className="text-center py-8">Loading versions...</div>
                                        ) : error ? (
                                            <div className="text-center py-8 text-red-500">{error}</div>
                                        ) : versions.length === 0 ? (
                                            <div className="text-center py-8">No version history available</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {versions.map((version) => (
                                                    <div
                                                        key={version.id}
                                                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                                                            selectedVersionId === version.id
                                                                ? 'bg-primary/10 border-primary'
                                                                : 'hover:bg-muted'
                                                        }`}
                                                        onClick={() => setSelectedVersionId(version.id)}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-medium">
                                                                {version.id === 'current' ? (
                                                                    'Current Version'
                                                                ) : (
                                                                    `Version ${version.versionNumber}`
                                                                )}
                                                            </div>
                                                            {selectedVersionId === version.id && (
                                                                <CheckIcon className="h-4 w-4 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                            <TimerIcon className="h-3 w-3 mr-1" />
                                                            {formatRelativeTime(version.createdAt)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                            
                            {/* Version content */}
                            <div className="w-2/3 border rounded-md overflow-hidden">
                                <ScrollArea className="h-full">
                                    {selectedVersion ? (
                                        <Highlight
                                            language={snippet?.language || 'text'}
                                            style={vscDarkPlus}
                                            customStyle={{
                                                margin: 0,
                                                padding: '1rem',
                                                borderRadius: 0,
                                                minHeight: '100%'
                                            }}
                                        >
                                            {selectedVersion.content}
                                        </Highlight>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Select a version to view content
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="compare" className="flex-1 min-h-0" onSelect={() => setCompareMode(true)} onDeselect={() => setCompareMode(false)}>
                            <div className="mb-4 flex justify-between items-center">
                                <div className="text-sm">
                                    {!comparedVersions.newer ? (
                                        "Select the first version to compare"
                                    ) : !comparedVersions.older ? (
                                        "Now select the second version"
                                    ) : (
                                        "Comparing versions"
                                    )}
                                </div>
                                
                                {comparedVersions.newer && comparedVersions.older && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setComparedVersions({ newer: null, older: null })}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                            
                            {comparedVersions.newer && comparedVersions.older ? (
                                <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                                    <div className="border rounded-md overflow-hidden">
                                        <div className="bg-muted p-2 text-sm font-medium">
                                            {comparedVersions.older.id === 'current' ? 'Current Version' : `Version ${comparedVersions.older.versionNumber}`}
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {formatRelativeTime(comparedVersions.older.createdAt)}
                                            </span>
                                        </div>
                                        <ScrollArea className="h-[calc(100%-32px)]">
                                            <Highlight
                                                language={snippet?.language || 'text'}
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1rem',
                                                    borderRadius: 0
                                                }}
                                            >
                                                {comparedVersions.older.content}
                                            </Highlight>
                                        </ScrollArea>
                                    </div>
                                    
                                    <div className="border rounded-md overflow-hidden">
                                        <div className="bg-muted p-2 text-sm font-medium">
                                            {comparedVersions.newer.id === 'current' ? 'Current Version' : `Version ${comparedVersions.newer.versionNumber}`}
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {formatRelativeTime(comparedVersions.newer.createdAt)}
                                            </span>
                                        </div>
                                        <ScrollArea className="h-[calc(100%-32px)]">
                                            <Highlight
                                                language={snippet?.language || 'text'}
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1rem',
                                                    borderRadius: 0
                                                }}
                                            >
                                                {comparedVersions.newer.content}
                                            </Highlight>
                                        </ScrollArea>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 border rounded-md overflow-hidden">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            <div className="space-y-2">
                                                {versions.map((version) => (
                                                    <div
                                                        key={version.id}
                                                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                                                            (comparedVersions.newer?.id === version.id || comparedVersions.older?.id === version.id)
                                                                ? 'bg-primary/10 border-primary'
                                                                : 'hover:bg-muted'
                                                        }`}
                                                        onClick={() => handleCompareSelect(version)}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-medium">
                                                                {version.id === 'current' ? (
                                                                    'Current Version'
                                                                ) : (
                                                                    `Version ${version.versionNumber}`
                                                                )}
                                                            </div>
                                                            {(comparedVersions.newer?.id === version.id || comparedVersions.older?.id === version.id) && (
                                                                <CheckIcon className="h-4 w-4 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                            <TimerIcon className="h-3 w-3 mr-1" />
                                                            {formatRelativeTime(version.createdAt)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}