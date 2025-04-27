import { highlightAuto } from 'highlight.js';

// Map highlight.js language identifiers to SyntaxHighlighter ones
const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'xml': 'html',
    'py': 'python',
    'yml': 'yaml',
    'md': 'markdown',
    'shell': 'bash',
    'sh': 'bash',
    'css': 'css',
    'sql': 'sql',
    'json': 'json'
};

/**
 * Detect the programming language of code using highlight.js
 */
export function detectLanguage(code: string): string {
    if (!code || code.trim() === '') {
        return 'text';
    }

    try {
        const result = highlightAuto(code);
        const language = result.language || 'text';

        // Map highlight.js language to SyntaxHighlighter language if needed
        return languageMap[language] || language;
    } catch (error) {
        console.error("Error detecting language:", error);
        return 'text';
    }
}