import { publishRedis } from '@/libs/redis'
import { TextAnalysisInfo } from '@/types/api.types'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body: TextAnalysisInfo = await request.json()

    await publishRedis(body)

    return NextResponse.json({
      status: 'success'
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to upload file',
        status: 'error'
      },
      { status: 500 }
    )
  }
}