'use client';

import { Suspense } from "react";
import { Snippet } from "@/types/snippet";
import {
    CheckIcon, CopyIcon, PencilIcon, Pin, PinOff, Tags, Trash2, Loader2
} from "lucide-react";

import { organizeSnippets } from "@/lib/snippet-util";
import { SearchFilterSection } from "@/components/snippet/search-filter-section";
import { SnippetCard } from "@/components/snippet/snippet-card";
import { SnippetGroupCarousel } from "@/components/snippet/snippet-carousel";
import { EditNameDialog, EditSnippetDialog, EditTagsDialog } from "@/components/snippet/edit-dialogs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSnippetStore } from "@/hooks/use-snippet-store";

// Define the view types
export type SnippetViewType = 'carousel' | 'table';

interface SnippetPageProps {
    viewType: SnippetViewType;
    title?: string;
    description?: string;
}

// Loading component for better UX
function SnippetPageSkeleton() {
    return (
        <div className="container mx-auto py-6 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
            
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    );
}

export default function SnippetPage({ viewType, title = "Snippets", description }: SnippetPageProps) {
    // Use centralized state from Zustand store
    const {
        snippets,
        filteredSnippets,
        allTags,
        isLoading,
        error,
        searchQuery,
        filterTag,
        copied,
        expandedSnippet,
        editingSnippet,
        isEditingName,
        isEditingTags,
        viewingSnippet,
        isDeleteConfirmOpen,
        snippetToDelete,
        
        // Actions
        fetchSnippets,
        updateSnippet,
        deleteSnippet,
        togglePinStatus,
        setSearchQuery,
        setFilterTag,
        copyToClipboard,
        toggleExpand,
        setEditingSnippet,
        setIsEditingName,
        setIsEditingTags,
        setViewingSnippet,
        confirmDelete,
        cancelDelete
    } = useSnippetStore();
    
    // Local state for tag editing
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    
    // Fetch snippets on mount
    useEffect(() => { 
        fetchSnippets(); 
    }, [fetchSnippets]);
    
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
    
    // Handle setting up tags when editing
    useEffect(() => {
        if (editingSnippet && isEditingTags) {
            setTags([...editingSnippet.tags]);
        }
    }, [editingSnippet, isEditingTags]);
    
    // Editing handlers
    const handleEditSnippet = (snippet: Snippet) => {
        setEditingSnippet({ ...snippet });
    };

    const handleEditName = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setIsEditingName(true);
    };

    const handleEditTags = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setTags([...snippet.tags]);
        setIsEditingTags(true);
    };

    const saveUpdatedSnippet = () => {
        if (!editingSnippet) return;
        updateSnippet(editingSnippet).then(() => {
            setEditingSnippet(null);
        });
    };

    const saveUpdatedName = () => {
        if (!editingSnippet) return;
        updateSnippet(editingSnippet).then(() => {
            setIsEditingName(false);
        });
    };

    const saveUpdatedTags = () => {
        if (!editingSnippet) return;
        updateSnippet({ ...editingSnippet, tags }).then(() => {
            setIsEditingTags(false);
        });
    };

    const handleTagFilter = (tag: string) => {
        setFilterTag(tag === filterTag ? null : tag);
    };

    // Organized snippets data (used for carousel view)
    const { pinnedSnippets, groupedByLanguage } = organizeSnippets(
        snippets,
        searchQuery,
        filterTag
    );

    // Render Table View
    const renderTableView = () => (
        <div className="container mx-auto space-y-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <div className="text-sm text-muted-foreground">
                    {filteredSnippets.length} of {snippets.length} snippets
                </div>
            </div>

            {description && <p className="text-muted-foreground mb-6">{description}</p>}

            <SearchFilterSection
                searchQuery={searchQuery}
                filterTag={filterTag}
                allTags={allTags}
                setSearchQuery={setSearchQuery}
                handleTagFilter={handleTagFilter}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-[150px]">Created</TableHead>
                            <TableHead className="text-right w-[150px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32">
                                    Loading snippets...
                                </TableCell>
                            </TableRow>
                        ) : filteredSnippets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32">
                                    {searchQuery || filterTag ? "No matching snippets found." : "No snippets found. Create your first snippet using the sidebar!"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSnippets.map((snippet) => (
                                <TableRow key={snippet.id} className={snippet.isPinned ? "bg-yellow-50/40" : ""}>
                                    <TableCell>
                                        {snippet.isPinned ? (
                                            <Pin className="h-4 w-4 text-yellow-500" />
                                        ) : (
                                            <div className="h-4 w-4" />
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className="font-medium cursor-pointer hover:underline"
                                        onClick={() => setViewingSnippet(snippet)}
                                    >
                                        {snippet.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {snippet.language || "text"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {snippet.tags.length > 0 ? (
                                                snippet.tags.slice(0, 3).map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="text-xs cursor-pointer"
                                                        onClick={() => handleTagFilter(tag)}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                            {snippet.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{snippet.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(snippet.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(snippet.id, snippet.content)}
                                                className="h-8 w-8"
                                            >
                                                {copied === snippet.id ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <CopyIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditSnippet(snippet)}>
                                                        Edit Content
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditName(snippet)}>
                                                        Edit Name
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditTags(snippet)}>
                                                        Edit Tags
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => togglePinStatus(snippet.id, !snippet.isPinned)}
                                                        className={snippet.isPinned ? "text-yellow-600" : ""}
                                                    >
                                                        {snippet.isPinned ? (
                                                            <>
                                                                <PinOff className="mr-2 h-4 w-4" />
                                                                Unpin Snippet
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Pin className="mr-2 h-4 w-4" />
                                                                Pin Snippet
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => confirmDelete(snippet.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    // Render Carousel View
    const renderCarouselView = () => (
        <div className="container mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <div className="text-sm text-muted-foreground">
                    {snippets.length} snippets
                </div>
            </div>

            {description && <p className="text-muted-foreground mb-6">{description}</p>}

            <SearchFilterSection
                searchQuery={searchQuery}
                filterTag={filterTag}
                allTags={allTags}
                setSearchQuery={setSearchQuery}
                handleTagFilter={handleTagFilter}
            />

            <div className="mt-6">
                {isLoading && snippets.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Loading snippets...</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">{error}</div>
                ) : pinnedSnippets.length === 0 && Object.keys(groupedByLanguage).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {searchQuery || filterTag ? "No matching snippets found." : "No snippets found. Create your first snippet using the sidebar!"}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {pinnedSnippets.length > 0 && (
                            <SnippetGroupCarousel
                                snippets={pinnedSnippets}
                                title="Pinned Snippets"
                                isPinned={true}
                                copied={copied}
                                expandedSnippet={expandedSnippet}
                                onCopy={copyToClipboard}
                                onToggleExpand={toggleExpand}
                                onTogglePin={togglePinStatus}
                                onDelete={deleteSnippet}
                                onEdit={handleEditSnippet}
                                onTagFilter={handleTagFilter}
                            />
                        )}

                        {Object.entries(groupedByLanguage).map(([language, languageSnippets]) => (
                            <SnippetGroupCarousel
                                key={language}
                                snippets={languageSnippets}
                                title={language}
                                copied={copied}
                                expandedSnippet={expandedSnippet}
                                onCopy={copyToClipboard}
                                onToggleExpand={toggleExpand}
                                onTogglePin={togglePinStatus}
                                onDelete={deleteSnippet}
                                onEdit={handleEditSnippet}
                                onTagFilter={handleTagFilter}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Show a loading state
    if (isLoading && snippets.length === 0) {
        return <SnippetPageSkeleton />;
    }

    return (
        <>
            <Suspense fallback={<SnippetPageSkeleton />}>
                {viewType === 'table' ? renderTableView() : renderCarouselView()}
            </Suspense>

            {/* Combined View/Edit Snippet Dialog */}
            <EditSnippetDialog
                editingSnippet={editingSnippet}
                setEditingSnippet={setEditingSnippet}
                saveUpdatedSnippet={saveUpdatedSnippet}
                viewingSnippet={viewingSnippet}
                setViewingSnippet={setViewingSnippet}
                copied={copied}
                copyToClipboard={copyToClipboard}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={cancelDelete}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this snippet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={cancelDelete}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => snippetToDelete && deleteSnippet(snippetToDelete)}
                            disabled={!snippetToDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Other Edit Dialogs */}
            <EditNameDialog
                isEditingName={isEditingName}
                setIsEditingName={setIsEditingName}
                editingSnippet={editingSnippet}
                setEditingSnippet={setEditingSnippet}
                saveUpdatedName={saveUpdatedName}
            />

            <EditTagsDialog
                isEditingTags={isEditingTags}
                setIsEditingTags={setIsEditingTags}
                editingSnippet={editingSnippet}
                currentTag={currentTag}
                tags={tags}
                setCurrentTag={setCurrentTag}
                addTag={addTag}
                removeTag={removeTag}
                handleTagKeyPress={handleTagKeyPress}
                saveUpdatedTags={saveUpdatedTags}
            />
        </>
    );
}