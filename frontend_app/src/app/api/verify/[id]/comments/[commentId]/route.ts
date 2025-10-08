import { NextRequest, NextResponse } from 'next/server';

const VERIFICATION_API_URL = process.env.VERIFICATION_API_URL || 'http://localhost:8002';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${VERIFICATION_API_URL}/api/v1/verify/${id}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to delete comment' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
