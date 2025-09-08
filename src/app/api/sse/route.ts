import { subscribeRedis } from '@/libs/redis'

export async function POST() {
  const encoder = new TextEncoder()
  let subscriber: Awaited<ReturnType<typeof subscribeRedis>> | null = null

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false
      
      const safeClose = () => {
        if (!isClosed) {
          isClosed = true
          controller.close()
        }
      }

      const safeEnqueue = (data: Uint8Array) => {
        if (!isClosed) {
          try {
            controller.enqueue(data)
          } catch (err) {
            console.error('Failed to enqueue data:', err)
            safeClose()
          }
        }
      }

      try {
        subscriber = await subscribeRedis(
          async (data: unknown) => {
            safeEnqueue(encoder.encode(`event: data\ndata: ${data}\n\n`))
          }
        )
      } catch (err) {
        console.error('Redis subscription error:', err)
        safeEnqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: (err as Error).message })}\n\n`
          )
        )
        safeClose()
      }
    },

    cancel() {
      // Clean up Redis subscription when stream is cancelled
      if (subscriber) {
        subscriber.disconnect().catch((err: Error) => {
          console.error('Error disconnecting Redis subscriber:', err)
        })
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