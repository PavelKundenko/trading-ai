import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const response = await fetch('http://localhost:5678/webhook-test/upload-file', {
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
