import { NextResponse } from 'next/server';

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';

export async function POST(request: Request) {
  try {
    console.log('Uploading file to webhook');
    const response = await fetch(`${N8N_URL}/webhook-test/upload-file`, {
      method: 'POST',
      body: await request.formData()
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to webhook');
    }

    const uploaded = await response.json();

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileId: uploaded.id,
      fileName: uploaded.name,
      status: 'success'
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to upload file',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
