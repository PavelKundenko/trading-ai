import { SSE_CHANNEL, TextAnalysisInfo } from '@/types/api.types';
import { createClient } from 'redis'

export async function publishRedis(data: TextAnalysisInfo) {
  let publisher = null
  try {
    publisher = createClient()
    publisher.connect()

    await publisher.publish(SSE_CHANNEL, JSON.stringify(data));
  } finally {
    publisher?.close()
  }
}

export async function subscribeRedis(callback: (data: unknown) => Promise<void>) {
  const subscriber = createClient();
  subscriber.connect();

  // Subscribing to a channel
  subscriber.subscribe(SSE_CHANNEL, callback);
}