import { NextRequest } from 'next/server';
import { sseManager } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let id: string;

  const stream = new ReadableStream({
    start(controller) {
      id = sseManager.addClient(controller);
      const message = `event: connected\ndata: {}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));
    },
    cancel() {
      if (id) sseManager.removeClient(id);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
