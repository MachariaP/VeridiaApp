import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8003';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const sort_by = searchParams.get('sort_by');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({ query });
    if (category) params.append('category', category);
    if (sort_by) params.append('sort_by', sort_by);

    const response = await fetch(
      `${SEARCH_API_URL}/api/v1/search/?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
}
