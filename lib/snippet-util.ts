// lib/snippet-util.ts
import { highlightAuto } from 'highlight.js';
import { Snippet } from '@/types/snippet';

// Type for grouped snippets
export type GroupedSnippets = {
    pinnedSnippets: Snippet[];
    groupedByLanguage: Record<string, Snippet[]>;
};

/**
 * Detects the programming language of a code snippet
 */
export const detectLanguage = (code: string): string => {
    if (!code.trim()) return 'text';
    try {
        const result = highlightAuto(code);
        const commonLangs = ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'text'];
        // Add null check and default value
        const detectedLang = result.language || 'text';
        return commonLangs.includes(detectedLang) ? detectedLang : 'text';
    } catch (error) {
        return 'text';
    }
};

/**
 * Organizes snippets into pinned and language-grouped categories
 */
export const organizeSnippets = (
    snippets: Snippet[],
    searchQuery: string,
    filterTag: string | null
): GroupedSnippets => {
    const filtered = snippets.filter(snippet => {
        const matchesSearch =
            snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesTag = filterTag ? snippet.tags.includes(filterTag) : true;
        return matchesSearch && matchesTag;
    });

    const groupedByLanguage: Record<string, Snippet[]> = {};
    const pinnedSnippets = filtered.filter(s => s.isPinned);
    const nonPinnedSnippets = filtered.filter(s => !s.isPinned);

    nonPinnedSnippets.forEach(snippet => {
        const lang = snippet.language || 'text';
        groupedByLanguage[lang] = groupedByLanguage[lang] || [];
        groupedByLanguage[lang].push(snippet);
    });

    return { pinnedSnippets, groupedByLanguage };
};

/**
 * Extracts all unique tags from an array of snippets
 */
export const extractUniqueTags = (snippets: Snippet[]): string[] => {
    return Array.from(new Set(snippets.flatMap(snippet => snippet.tags))).filter(
        Boolean
    ) as string[];
};

/**
 * Validates snippet data before saving
 */
export const validateSnippet = (name: string, content: string): void => {
    if (!name.trim() || !content.trim()) {
        throw new Error('Please provide both a name and content');
    }
};

/**
 * Formats date for display
 */
export const formatSnippetDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

/**
 * Handles API errors consistently
 */
export const handleSnippetError = (error: unknown, defaultMessage: string): string => {
    console.error("Snippet error:", error);
    return error instanceof Error ? error.message : defaultMessage;
};

/**
 * Filters and sorts tags for display
 */
export const processTags = (
    tags: string[],
    filterTag: string | null
): { tag: string; count: number }[] => {
    const tagCounts = tags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => {
            if (filterTag === a.tag) return -1;
            if (filterTag === b.tag) return 1;
            return b.count - a.count;
        });
};

export const validateCodeContent = (content: string) => {
    if (content.trim().length < 10) {
        throw new Error('Code snippet seems too short');
    }
};

export const generateSuggestedName = (language: string, existingSnippets: Snippet[]) => {
    const count = existingSnippets.filter(s => s.language === language).length;
    return `${language}-${count + 1}`;
};