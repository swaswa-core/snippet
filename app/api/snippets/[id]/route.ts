import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET a specific snippet
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const snippet = await prisma.snippet.findUnique({
            where: {
                id,
            },
        });

        if (!snippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(snippet);
    } catch (error) {
        console.error('Error fetching snippet:', error);
        return NextResponse.json(
            { error: 'Failed to fetch snippet' },
            { status: 500 }
        );
    }
}

// DELETE a snippet
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Check if snippet exists
        const snippet = await prisma.snippet.findUnique({
            where: {
                id,
            },
        });

        if (!snippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }

        // Delete the snippet
        await prisma.snippet.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ message: 'Snippet deleted successfully' });
    } catch (error) {
        console.error('Error deleting snippet:', error);
        return NextResponse.json(
            { error: 'Failed to delete snippet' },
            { status: 500 }
        );
    }
}

// UPDATE a snippet
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { content, language, name, tags, isPinned } = body;

        // Check if snippet exists
        const existingSnippet = await prisma.snippet.findUnique({
            where: {
                id,
            },
        });

        if (!existingSnippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }

        // If trying to pin, check pinned limit
        if (isPinned && !existingSnippet.isPinned) {
            const pinnedCount = await prisma.snippet.count({
                where: {
                    isPinned: true,
                },
            });

            if (pinnedCount >= 10) {
                return NextResponse.json(
                    { error: 'Maximum of 10 pinned snippets allowed' },
                    { status: 400 }
                );
            }
        }

        // Update the snippet
        const updatedSnippet = await prisma.snippet.update({
            where: {
                id,
            },
            data: {
                content: content !== undefined ? content : existingSnippet.content,
                language: language !== undefined ? language : existingSnippet.language,
                name: name !== undefined ? name : existingSnippet.name,
                tags: tags !== undefined ? tags : existingSnippet.tags,
                isPinned: isPinned !== undefined ? isPinned : existingSnippet.isPinned,
            },
        });

        return NextResponse.json(updatedSnippet);
    } catch (error) {
        console.error('Error updating snippet:', error);
        return NextResponse.json(
            { error: 'Failed to update snippet' },
            { status: 500 }
        );
    }
}

