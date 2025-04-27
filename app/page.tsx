'use client';

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Snippet } from "@/types/snippet";
import { IconPin } from "@tabler/icons-react";

import { detectLanguage, extractUniqueTags, handleSnippetError, organizeSnippets } from "@/lib/snippet-util";
import { SearchFilterSection } from "@/components/snippet/search-filter-section";
import { SnippetCard } from "@/components/snippet/snippet-card";
import { SnippetGroupCarousel } from "@/components/snippet/snippet-carousel";
import { EditNameDialog, EditSnippetDialog, EditTagsDialog } from "@/components/snippet/edit-dialogs";

export default function SnippetsPage() {
    // State management
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [detectedLanguage, setDetectedLanguage] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);

    const [viewingSnippet, setViewingSnippet] = useState<Snippet | null>(null);

    // Fetch snippets from the API
    const fetchSnippets = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/snippets');
            if (!response.ok) throw new Error('Failed to fetch snippets');

            const data = await response.json();
            setSnippets(data);
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
        } catch (error) {
            toast.error(handleSnippetError(error, "Failed to delete snippet."));
            throw error; // Re-throw the error
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
        } catch (error) {
            toast.error(handleSnippetError(error, "Failed to update pin status."));
            throw error; // Make sure to re-throw the error
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

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedSnippet(prev => prev === id ? null : id);
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

    // Organized snippets data
    const { pinnedSnippets, groupedByLanguage } = organizeSnippets(
        snippets,
        searchQuery,
        filterTag
    );

    return (
        <div className="container mx-auto max-w-6xl px-4">
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

            <EditSnippetDialog
                editingSnippet={editingSnippet}
                setEditingSnippet={setEditingSnippet}
                saveUpdatedSnippet={saveUpdatedSnippet}
                viewingSnippet={viewingSnippet}
                setViewingSnippet={setViewingSnippet}
                copied={copied}
                copyToClipboard={copyToClipboard}
            />

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