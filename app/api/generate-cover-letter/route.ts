import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch(`${process.env.BACKEND_URL}/api/cover-letter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Backend request failed');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in generate-cover-letter API:', error);
        return NextResponse.json(
            { error: 'Failed to generate cover letter' },
            { status: 500 }
        );
    }
} 