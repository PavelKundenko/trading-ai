import { SSE_CHANNEL, TextAnalysisInfo } from '@/types/api.types';
import { createClient } from 'redis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export async function publishRedis(data: TextAnalysisInfo) {
  let publisher = null
  try {
    publisher = createClient({ url: REDIS_URL })
    await publisher.connect()

    await publisher.publish(SSE_CHANNEL, JSON.stringify(data));
  } finally {
    await publisher?.disconnect()
  }
}

export async function subscribeRedis(callback: (data: unknown) => Promise<void>) {
  const subscriber = createClient({ url: REDIS_URL });
  await subscriber.connect();

  // Subscribing to a channel
  subscriber.subscribe(SSE_CHANNEL, callback);
}