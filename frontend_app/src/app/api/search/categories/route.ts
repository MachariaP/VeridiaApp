import { NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8003';

export async function GET() {
  try {
    const response = await fetch(
      `${SEARCH_API_URL}/api/v1/search/categories`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Categories API error:', error);
    // Return empty categories array on error to avoid breaking the UI
    return NextResponse.json({ categories: [], count: 0 });
  }
}
