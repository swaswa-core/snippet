'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Snippet } from "@/types/snippet";

interface EditSnippetDialogProps {
    editingSnippet: Snippet | null;
    setEditingSnippet: (snippet: Snippet | null) => void;
    saveUpdatedSnippet: () => void;
}

export function EditSnippetDialog({ editingSnippet, setEditingSnippet, saveUpdatedSnippet }: EditSnippetDialogProps) {
    return (
        <Dialog open={!!editingSnippet} onOpenChange={() => setEditingSnippet(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg">Edit Snippet</DialogTitle>
                </DialogHeader>
                {editingSnippet && (
                    <div className="grid gap-4">
                        <Textarea
                            value={editingSnippet.content}
                            onChange={(e) => setEditingSnippet({...editingSnippet, content: e.target.value})}
                            className="min-h-[200px] text-sm font-mono"
                        />
                        <Button onClick={saveUpdatedSnippet} className="mt-2">
                            Save
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface EditNameDialogProps {
    isEditingName: boolean;
    setIsEditingName: (value: boolean) => void;
    editingSnippet: Snippet | null;
    setEditingSnippet: (snippet: Snippet | null) => void;
    saveUpdatedName: () => void;
}

export function EditNameDialog({
                                   isEditingName,
                                   setIsEditingName,
                                   editingSnippet,
                                   setEditingSnippet,
                                   saveUpdatedName
                               }: EditNameDialogProps) {
    return (
        <Dialog open={isEditingName} onOpenChange={() => setIsEditingName(false)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Snippet Name</DialogTitle>
                </DialogHeader>

                {editingSnippet && (
                    <>
                        <div className="grid gap-4 py-4">
                            <Input
                                placeholder="Snippet name"
                                value={editingSnippet.name}
                                onChange={(e) => setEditingSnippet({
                                    ...editingSnippet,
                                    name: e.target.value
                                })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={saveUpdatedName}>
                                Save name
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface EditTagsDialogProps {
    isEditingTags: boolean;
    setIsEditingTags: (value: boolean) => void;
    editingSnippet: Snippet | null;
    currentTag: string;
    tags: string[];
    setCurrentTag: (value: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
    handleTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    saveUpdatedTags: () => void;
}

export function EditTagsDialog({
                                   isEditingTags,
                                   setIsEditingTags,
                                   editingSnippet,
                                   currentTag,
                                   tags,
                                   setCurrentTag,
                                   addTag,
                                   removeTag,
                                   handleTagKeyPress,
                                   saveUpdatedTags
                               }: EditTagsDialogProps) {
    return (
        <Dialog open={isEditingTags} onOpenChange={() => setIsEditingTags(false)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Tags</DialogTitle>
                </DialogHeader>

                {editingSnippet && (
                    <>
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center">
                                <Input
                                    placeholder="Add tag"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagKeyPress}
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

                            {tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="flex items-center">
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
                            ) : (
                                <div className="text-sm text-gray-500">
                                    No tags added yet. Add some tags above.
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={saveUpdatedTags}>
                                Save tags
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}