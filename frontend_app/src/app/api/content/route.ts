import { NextRequest, NextResponse } from 'next/server';

const CONTENT_API_URL = process.env.CONTENT_API_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const sort_by = searchParams.get('sort_by');

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (sort_by) params.append('sort_by', sort_by);

    const queryString = params.toString();
    const url = `${CONTENT_API_URL}/api/v1/content/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
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
