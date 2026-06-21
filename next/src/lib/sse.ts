type SSEClient = ReadableStreamDefaultController;

class SSEManager {
  private clients = new Map<string, SSEClient>();
  private nextId = 0;

  addClient(controller: SSEClient): string {
    const id = String(++this.nextId);
    this.clients.set(id, controller);
    return id;
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  emit(event: string, data: unknown): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    for (const [, controller] of this.clients) {
      try {
        controller.enqueue(encoded);
      } catch {
        // Client disconnected — will be cleaned up on next event
      }
    }
  }
}

export const sseManager = new SSEManager();
export { SSEManager };
