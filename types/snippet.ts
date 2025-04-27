export type Snippet = {
    id: string;
    content: string;
    language: string;
    name: string;
    tags: string[];
    isPinned: boolean;
    createdAt: Date | string;
    updatedAt?: Date | string;
};