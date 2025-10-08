import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/v1/auth/me`,
      {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({ detail: 'Failed to get user' }));
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
