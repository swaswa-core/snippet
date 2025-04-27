'use client';
import React from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { highlightAuto } from 'highlight.js';

interface CodeBlockProps {
    code: string;
    showLanguage?: boolean;
}

const CodeBlock = ({ code, showLanguage = false }: CodeBlockProps) => {
    const detectedLanguage = highlightAuto(code).language || 'text';

    return (
        <div className="relative">
            {showLanguage && detectedLanguage && (
                <div className="absolute top-1 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                    {detectedLanguage}
                </div>
            )}
            <SyntaxHighlighter
                language={detectedLanguage}
                style={vscDarkPlus}
                customStyle={{
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;