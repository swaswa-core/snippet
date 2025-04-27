'use client';

import { useEffect, useState } from 'react';
import { Snippet } from '@/types/snippet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Copy, Check, ExternalLink } from 'lucide-react';
import Highlight from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { formatDistanceToNow } from 'date-fns';

interface SharedSnippetPageProps {
    params: {
        token: string;
    };
}

export default function SharedSnippetPage({ params }: SharedSnippetPageProps) {
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        async function fetchSharedSnippet() {
            try {
                setLoading(true);
                const response = await fetch(`/api/shared/${params.token}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Shared snippet not found or no longer available');
                    }
                    throw new Error('Failed to load shared snippet');
                }
                
                const data = await response.json();
                setSnippet(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }
        
        fetchSharedSnippet();
    }, [params.token]);
    
    const copyToClipboard = () => {
        if (snippet) {
            navigator.clipboard.writeText(snippet.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-[400px] bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-500">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (!snippet) {
        return null;
    }
    
    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{snippet.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">{snippet.language}</Badge>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    {snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {snippet.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    )}
                </CardHeader>
                
                <CardContent>
                    <div className="rounded-md overflow-hidden border">
                        <Highlight
                            language={snippet.language || 'text'}
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                padding: '1rem'
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                        >
                            {snippet.content}
                        </Highlight>
                    </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                        Shared snippet from Code Snippets
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => window.location.href = '/'}
                    >
                        <ExternalLink className="h-3 w-3" />
                        View all snippets
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}