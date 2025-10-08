import { NextRequest, NextResponse } from 'next/server';

const CONTENT_API_URL = process.env.CONTENT_API_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${CONTENT_API_URL}/api/v1/content/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch content');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
