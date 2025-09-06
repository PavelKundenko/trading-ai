import { constants } from 'fs'
import { access, readFile } from 'fs/promises'

export async function POST() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        try {
          await access('test.txt', constants.F_OK)
        } catch {
          controller.enqueue(encoder.encode('event: no_data\ndata: {}\n\n'))
          return
        }

        while (true) {
          const data = await readFile('test.txt', 'utf8')
          controller.enqueue(encoder.encode(`event: data\ndata: ${data}\n\n`))

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
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