import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Generate or retrieve share token for a snippet
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const snippetId = params.id;
        
        // Find the snippet
        const snippet = await prisma.snippet.findUnique({
            where: { id: snippetId },
            select: {
                id: true,
                shareToken: true,
                isPublic: true
            }
        });
        
        if (!snippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }
        
        // If a token already exists, return it
        if (snippet.shareToken) {
            return NextResponse.json({
                shareToken: snippet.shareToken,
                isPublic: snippet.isPublic,
                shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/shared/${snippet.shareToken}`
            });
        }
        
        // Otherwise, generate a new token
        const shareToken = nanoid(10); // Generate a short unique ID
        
        // Update the snippet with the new token
        const updatedSnippet = await prisma.snippet.update({
            where: { id: snippetId },
            data: {
                shareToken,
                isPublic: true // Set to public by default when creating a share link
            },
            select: {
                id: true,
                shareToken: true,
                isPublic: true
            }
        });
        
        return NextResponse.json({
            shareToken: updatedSnippet.shareToken,
            isPublic: updatedSnippet.isPublic,
            shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/shared/${updatedSnippet.shareToken}`
        });
    } catch (error) {
        console.error('Error generating share token:', error);
        return NextResponse.json(
            { error: 'Failed to generate share token' },
            { status: 500 }
        );
    }
}

// Update sharing settings
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const snippetId = params.id;
        const { isPublic } = await request.json();
        
        if (isPublic === undefined) {
            return NextResponse.json(
                { error: 'isPublic field is required' },
                { status: 400 }
            );
        }
        
        // Find the snippet
        const snippet = await prisma.snippet.findUnique({
            where: { id: snippetId }
        });
        
        if (!snippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }
        
        // Update the sharing status
        const updatedSnippet = await prisma.snippet.update({
            where: { id: snippetId },
            data: {
                isPublic,
                // If turning off sharing, remove the token
                ...(isPublic === false ? { shareToken: null } : {})
            },
            select: {
                id: true,
                shareToken: true,
                isPublic: true
            }
        });
        
        return NextResponse.json({
            shareToken: updatedSnippet.shareToken,
            isPublic: updatedSnippet.isPublic,
            shareUrl: updatedSnippet.shareToken 
                ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/shared/${updatedSnippet.shareToken}`
                : null
        });
    } catch (error) {
        console.error('Error updating sharing settings:', error);
        return NextResponse.json(
            { error: 'Failed to update sharing settings' },
            { status: 500 }
        );
    }
}