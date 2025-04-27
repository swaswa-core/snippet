'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShareIcon, Copy, Check, Twitter, Linkedin, Facebook, Link2, Mail } from 'lucide-react';
import { Snippet } from '@/types/snippet';

interface ShareDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    snippet: Snippet | null;
}

export function ShareDialog({ isOpen, onOpenChange, snippet }: ShareDialogProps) {
    const [shareUrl, setShareUrl] = useState<string>('');
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Reset state when dialog opens/closes or snippet changes
    useEffect(() => {
        if (isOpen && snippet) {
            setIsLoading(true);
            fetchShareStatus();
        } else {
            setCopied(false);
        }
    }, [isOpen, snippet]);
    
    const fetchShareStatus = async () => {
        if (!snippet) return;
        
        try {
            const response = await fetch(`/api/snippets/${snippet.id}/share`);
            
            if (response.ok) {
                const data = await response.json();
                setShareUrl(data.shareUrl || '');
                setIsPublic(data.isPublic || false);
            }
        } catch (error) {
            console.error('Error fetching share status:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const togglePublicStatus = async () => {
        if (!snippet) return;
        
        try {
            setIsLoading(true);
            
            const newStatus = !isPublic;
            const response = await fetch(`/api/snippets/${snippet.id}/share`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: newStatus }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setIsPublic(data.isPublic);
                setShareUrl(data.shareUrl || '');
            }
        } catch (error) {
            console.error('Error updating sharing status:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const getTwitterShareUrl = () => {
        const text = `Check out this code snippet: ${snippet?.name} #coding #snippets`;
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    };
    
    const getLinkedInShareUrl = () => {
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    };
    
    const getFacebookShareUrl = () => {
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    };
    
    const getEmailShareUrl = () => {
        const subject = `Code Snippet: ${snippet?.name}`;
        const body = `Check out this code snippet: ${shareUrl}`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShareIcon className="h-5 w-5" />
                        Share Snippet
                    </DialogTitle>
                    <DialogDescription>
                        Share this snippet with others via a public link
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center space-x-2 py-4">
                    <Switch
                        id="public-snippet"
                        checked={isPublic}
                        onCheckedChange={togglePublicStatus}
                        disabled={isLoading}
                    />
                    <Label htmlFor="public-snippet" className="text-sm font-medium">
                        {isPublic ? 'Public - Anyone with the link can view' : 'Private - Only you can view'}
                    </Label>
                </div>
                
                {isPublic && (
                    <>
                        <div className="flex items-center space-x-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="shrink-0"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                <span className="sr-only">Copy link</span>
                            </Button>
                        </div>
                        
                        <Tabs defaultValue="social" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="social">Social</TabsTrigger>
                                <TabsTrigger value="embed">Embed</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="social" className="space-y-4">
                                <div className="flex justify-center space-x-4 py-4">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => window.open(getTwitterShareUrl(), '_blank')}
                                        title="Share on Twitter"
                                    >
                                        <Twitter className="h-5 w-5 text-blue-400" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => window.open(getLinkedInShareUrl(), '_blank')}
                                        title="Share on LinkedIn"
                                    >
                                        <Linkedin className="h-5 w-5 text-blue-600" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => window.open(getFacebookShareUrl(), '_blank')}
                                        title="Share on Facebook"
                                    >
                                        <Facebook className="h-5 w-5 text-blue-600" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => window.open(getEmailShareUrl(), '_blank')}
                                        title="Share via Email"
                                    >
                                        <Mail className="h-5 w-5 text-gray-600" />
                                    </Button>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="embed" className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                    Embed this snippet on your website or blog
                                </div>
                                <Input
                                    readOnly
                                    value={`<iframe src="${shareUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`}
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <div className="text-xs text-muted-foreground mt-2">
                                    Click the code to select it all, then copy and paste it into your HTML.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
                
                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}