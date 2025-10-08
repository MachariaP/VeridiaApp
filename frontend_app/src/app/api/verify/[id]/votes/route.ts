import { NextRequest, NextResponse } from 'next/server';

const VERIFICATION_API_URL = process.env.VERIFICATION_API_URL || 'http://localhost:8002';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(
      `${VERIFICATION_API_URL}/api/v1/verify/${id}/votes`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch vote stats');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Vote stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote stats' },
      { status: 500 }
    );
  }
}
