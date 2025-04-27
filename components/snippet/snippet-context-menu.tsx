import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { Snippet } from "@/types/snippet";

interface SnippetContextMenuProps {
    children: React.ReactNode;
    snippet: Snippet;
    onPinToggle: (id: string, isPinned: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onEdit: (snippet: Snippet) => void;
    onEditName: (snippet: Snippet) => void;
    onEditTags: (snippet: Snippet) => void;
}

export function SnippetContextMenu({
                                       children,
                                       snippet,
                                       onPinToggle,
                                       onDelete,
                                       onEdit,
                                       onEditName,
                                       onEditTags,
                                   }: SnippetContextMenuProps) {
    const handlePinToggle = async () => {
        try {
            await onPinToggle(snippet.id, !snippet.isPinned);
            toast.success(
                snippet.isPinned
                    ? "Snippet unpinned successfully"
                    : "Snippet pinned successfully"
            );
        } catch (error) {
            toast.error("Failed to update pin status");
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this snippet?")) {
            try {
                await onDelete(snippet.id);
                toast.success("Snippet deleted successfully");
            } catch (error) {
                toast.error("Failed to delete snippet");
            }
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem
                    inset
                    onClick={handlePinToggle}
                >
                    {snippet.isPinned ? "Unpin Snippet" : "Pin Snippet"}
                    <ContextMenuShortcut>⌘P</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    onClick={() => onEditName(snippet)}
                >
                    Edit Name
                    <ContextMenuShortcut>⌘N</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    onClick={() => onEditTags(snippet)}
                >
                    Edit Tags
                    <ContextMenuShortcut>⌘T</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    inset
                    onClick={() => onEdit(snippet)}
                >
                    Edit Snippet
                    <ContextMenuShortcut>⌘E</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    onClick={handleDelete}
                    className="text-red-600"
                >
                    Delete Snippet
                    <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}