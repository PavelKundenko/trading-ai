import { TextAnalysisRequest } from '@/types/api.types';
import { writeFileSync } from 'fs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: TextAnalysisRequest = await request.json();

    writeFileSync('test.txt', JSON.stringify(body), 'utf8');

    return NextResponse.json({
      status: 'success'
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || 'Failed to upload file',
        status: 'error'
      },
      { status: 500 }
    );
  }
}