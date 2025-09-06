import { subscribeRedis } from '@/libs/redis'
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'

export async function POST(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await subscribeRedis(
          async (data: any) => {
            controller.enqueue(encoder.encode(`event: data\ndata: ${data}\n\n`))
          }
        )
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: (err as Error).message })}\n\n`
          )
        )
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}