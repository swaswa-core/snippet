

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {CheckIcon, CopyIcon, Plus, Tags, X} from "lucide-react";
import { Snippet } from "@/types/snippet";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "recharts";
import {useState} from "react";

interface EditSnippetDialogProps {
    // Edit mode props
    editingSnippet: Snippet | null;
    setEditingSnippet: (snippet: any) => void;
    saveUpdatedSnippet: () => void;

    // View mode props
    viewingSnippet: Snippet | null;
    setViewingSnippet: (snippet: Snippet | null) => void;

    // Copy functionality
    copied: string | null;
    copyToClipboard: (id: string, content: string) => void;
}


interface EditSnippetDialogProps {
    // Edit mode props
    editingSnippet: Snippet | null;
    setEditingSnippet: (snippet: any) => void;
    saveUpdatedSnippet: () => void;

    // View mode props
    viewingSnippet: Snippet | null;
    setViewingSnippet: (snippet: Snippet | null) => void;

    // Copy functionality
    copied: string | null;
    copyToClipboard: (id: string, content: string) => void;
}

export function EditSnippetDialog({
                                      editingSnippet,
                                      setEditingSnippet,
                                      saveUpdatedSnippet,
                                      viewingSnippet,
                                      setViewingSnippet,
                                      copied,
                                      copyToClipboard
                                  }: EditSnippetDialogProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Handle toggling edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing);

        // If turning off edit mode without saving, reset content to original
        if (isEditing && viewingSnippet) {
            setEditingSnippet({...viewingSnippet});
        }
    };

    // Handle save - also turns off edit mode
    const handleSave = () => {
        saveUpdatedSnippet();
        setIsEditing(false);
    };

    // Combined snippet - either viewing or editing
    const snippet = editingSnippet || viewingSnippet;

    return (
        <Dialog open={!!snippet} onOpenChange={(open) => !open && (setViewingSnippet(null), setEditingSnippet(null))}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>{snippet?.name}</span>
                        <Badge variant="outline" className="ml-2">
                            {snippet?.language || "text"}
                        </Badge>
                        <div className="ml-auto flex items-center gap-2">
                            <Checkbox
                                id="edit-mode"
                                checked={isEditing}
                                onCheckedChange={toggleEditMode}
                            />
                            <span className="text-sm cursor-pointer" onClick={toggleEditMode}>
                                Edit mode
                            </span>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        {snippet?.tags && snippet.tags.length > 0 ? (
                            <div className="flex items-center gap-1 mt-1">
                                <Tags className="h-3 w-3 text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                    {snippet.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : "No tags"}
                    </DialogDescription>
                </DialogHeader>

                {isEditing ? (
                    // Edit mode
                    <div className="grid gap-4">
                        <Textarea
                            value={editingSnippet?.content || ""}
                            onChange={(e) => setEditingSnippet({...editingSnippet, content: e.target.value})}
                            className="min-h-[200px] text-sm font-mono"
                        />
                        <Button onClick={handleSave} className="mt-2">
                            Save
                        </Button>
                    </div>
                ) : (
                    // View mode
                    <>
                        <div className="rounded-md bg-slate-950 p-4 overflow-auto max-h-[400px]">
                            <pre className="text-sm font-mono text-white whitespace-pre-wrap">
                                {snippet?.content}
                            </pre>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Created on {snippet && new Date(snippet.createdAt).toLocaleDateString()}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => snippet && copyToClipboard(snippet.id, snippet.content)}
                                className="gap-1"
                            >
                                {copied === snippet?.id ? (
                                    <>
                                        <CheckIcon className="h-3 w-3 text-green-500" />
                                        <span className="text-green-500">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="h-3 w-3" />
                                        <span>Copy code</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
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