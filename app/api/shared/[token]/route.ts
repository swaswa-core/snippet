import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET a shared snippet by token
export async function GET(
    request: Request,
    { params }: { params: { token: string } }
) {
    try {
        const token = params.token;
        
        // Find the snippet by share token
        const snippet = await prisma.snippet.findUnique({
            where: { 
                shareToken: token,
                isPublic: true // Only return if it's public
            }
        });
        
        if (!snippet) {
            return NextResponse.json(
                { error: 'Shared snippet not found or not public' },
                { status: 404 }
            );
        }
        
        // Increment the view count
        await prisma.snippet.update({
            where: { id: snippet.id },
            data: { views: { increment: 1 } }
        });
        
        return NextResponse.json(snippet);
    } catch (error) {
        console.error('Error fetching shared snippet:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shared snippet' },
            { status: 500 }
        );
    }
}