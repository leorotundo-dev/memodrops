import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-61d0.up.railway.app';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = params.path || [];
  const path = '/' + pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Passar token se existir
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}${path}${query}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = params.path || [];
  const path = '/' + pathSegments.join('/');

  try {
    const body = await request.json();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Passar token se existir
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = params.path || [];
  const path = '/' + pathSegments.join('/');

  try {
    const body = await request.json();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = params.path || [];
  const path = '/' + pathSegments.join('/');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'DELETE',
      headers,
    });

    if (response.status === 204) {
      return NextResponse.json({}, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}
