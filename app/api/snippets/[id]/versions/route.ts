import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all versions of a snippet
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const snippetId = params.id;
        
        // Validate that the snippet exists
        const snippet = await prisma.snippet.findUnique({
            where: { id: snippetId },
        });
        
        if (!snippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }
        
        // Get all versions of the snippet
        const versions = await prisma.snippetVersion.findMany({
            where: { snippetId },
            orderBy: { versionNumber: 'desc' },
        });
        
        return NextResponse.json(versions);
    } catch (error) {
        console.error('Error fetching snippet versions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch snippet versions' },
            { status: 500 }
        );
    }
}

// POST to create a new version of a snippet
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const snippetId = params.id;
        const { content } = await request.json();
        
        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }
        
        // Check if the snippet exists
        const snippet = await prisma.snippet.findUnique({
            where: { id: snippetId },
            include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
        });
        
        if (!snippet) {
            return NextResponse.json(
                { error: 'Snippet not found' },
                { status: 404 }
            );
        }
        
        // Calculate the next version number
        const latestVersion = snippet.versions[0];
        const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
        
        // Create a new version
        const newVersion = await prisma.snippetVersion.create({
            data: {
                snippetId,
                content,
                versionNumber: nextVersionNumber,
            },
        });
        
        return NextResponse.json(newVersion, { status: 201 });
    } catch (error) {
        console.error('Error creating snippet version:', error);
        return NextResponse.json(
            { error: 'Failed to create snippet version' },
            { status: 500 }
        );
    }
}