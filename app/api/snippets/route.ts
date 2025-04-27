import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET all snippets
export async function GET() {
    try {
        // Define the orderBy with proper Prisma typing
        const orderBy: Prisma.SnippetOrderByWithRelationInput[] = [
            {
                isPinned: 'desc', // Pinned snippets first
            },
            {
                createdAt: 'desc', // Then by creation date (newest first)
            },
        ];

        const snippets = await prisma.snippet.findMany({
            orderBy: orderBy,
        });

        return NextResponse.json(snippets);
    } catch (error) {
        console.error('Error fetching snippets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch snippets' },
            { status: 500 }
        );
    }
}

// POST a new snippet
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { content, language, name, tags = [], isPinned = false } = body;

        if (!content || !language || !name) {
            return NextResponse.json(
                { error: 'Content, language and name are required' },
                { status: 400 }
            );
        }

        // Check if pinning this snippet would exceed the 10 pinned snippets limit
        if (isPinned) {
            // Use the proper Prisma typing for the where clause
            const where: Prisma.SnippetWhereInput = {
                isPinned: true,
            };

            const pinnedCount = await prisma.snippet.count({
                where: where,
            });

            if (pinnedCount >= 10) {
                return NextResponse.json(
                    { error: 'Maximum of 10 pinned snippets allowed' },
                    { status: 400 }
                );
            }
        }

        // Create data with proper Prisma typing
        const data: Prisma.SnippetCreateInput = {
            content,
            language,
            name,
            tags,
            isPinned,
        };

        const snippet = await prisma.snippet.create({
            data: data,
        });

        return NextResponse.json(snippet, { status: 201 });
    } catch (error) {
        console.error('Error creating snippet:', error);
        return NextResponse.json(
            { error: 'Failed to create snippet' },
            { status: 500 }
        );
    }
}