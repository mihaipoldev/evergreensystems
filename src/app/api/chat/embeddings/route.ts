import { NextResponse } from 'next/server';
import { generateQueryEmbedding } from '@/features/chat/services/rag-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/embeddings
 * Generate embedding for a query string using OpenAI
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Query string is required' },
        { status: 400 }
      );
    }

    const embedding = await generateQueryEmbedding(query.trim());

    return NextResponse.json({ embedding });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate embedding',
      },
      { status: 500 }
    );
  }
}

