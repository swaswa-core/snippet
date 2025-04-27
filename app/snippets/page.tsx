'use client';

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Snippet } from "@/types/snippet";
import { CheckIcon, CopyIcon, PencilIcon, Pin, PinOff, Tags, Trash2 } from "lucide-react";
import { IconCode } from "@tabler/icons-react";

import { detectLanguage, extractUniqueTags, handleSnippetError } from "@/lib/snippet-util";
import { SearchFilterSection } from "@/components/snippet/search-filter-section";
import { EditNameDialog, EditSnippetDialog, EditTagsDialog } from "@/components/snippet/edit-dialogs";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function SnippetsTablePage() {
    // State management
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [viewingSnippet, setViewingSnippet] = useState<Snippet | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

    // Fetch snippets from the API
    const fetchSnippets = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/snippets');
            if (!response.ok) throw new Error('Failed to fetch snippets');

            const data = await response.json();
            setSnippets(data);
            setFilteredSnippets(data);
            setAllTags(extractUniqueTags(data));
            setError(null);
        } catch (error) {
            setError(handleSnippetError(error, 'Failed to load snippets.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSnippets(); }, []);
    useEffect(() => { if (copied) setTimeout(() => setCopied(null), 2000); }, [copied]);

    // Filter snippets when search or tag filter changes
    useEffect(() => {
        const filtered = snippets.filter(snippet => {
            const matchesSearch =
                !searchQuery ||
                snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTag = !filterTag || snippet.tags.includes(filterTag);

            return matchesSearch && matchesTag;
        });

        setFilteredSnippets(filtered);
    }, [snippets, searchQuery, filterTag]);

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

    // Snippet CRUD operations
    const deleteSnippet = async (id: string): Promise<void> => {
        try {
            const response = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete snippet');
            setSnippets(prev => prev.filter(s => s.id !== id));
            toast.success("Snippet deleted successfully");
        } catch (error) {
            toast.error(handleSnippetError(error, "Failed to delete snippet."));
            throw error;
        } finally {
            setSnippetToDelete(null);
            setIsDeleteConfirmOpen(false);
        }
    };

    const togglePinStatus = async (id: string, isPinned: boolean): Promise<void> => {
        try {
            const response = await fetch(`/api/snippets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPinned }),
            });

            if (!response.ok) throw new Error('Failed to update pin status');
            const updatedSnippet = await response.json();
            setSnippets(prev => prev.map(s => s.id === id ? updatedSnippet : s));
            toast.success(isPinned ? "Snippet pinned" : "Snippet unpinned");
        } catch (error) {
            toast.error(handleSnippetError(error, "Failed to update pin status."));
            throw error;
        }
    };

    const updateSnippet = async (updatedSnippet: Snippet) => {
        try {
            const response = await fetch(`/api/snippets/${updatedSnippet.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...updatedSnippet,
                    language: detectLanguage(updatedSnippet.content)
                }),
            });

            if (!response.ok) throw new Error('Failed to update snippet');
            const result = await response.json();
            setSnippets(prev => prev.map(s => s.id === updatedSnippet.id ? result : s));
            toast.success("Snippet updated successfully!");
            return result;
        } catch (error) {
            toast.error(handleSnippetError(error, "Failed to update snippet."));
        }
    };

    // UI interaction handlers
    const copyToClipboard = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopied(id);
        toast.success("Snippet copied to clipboard!");
    };

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
        setFilterTag(prev => prev === tag ? null : tag);
    };

    const confirmDelete = (id: string) => {
        setSnippetToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    return (
        <div className="container mx-auto space-y-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Snippets Library</h2>
                <div className="text-sm text-muted-foreground">
                    {filteredSnippets.length} of {snippets.length} snippets
                </div>
            </div>

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
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this snippet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
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
        </div>
    );
}