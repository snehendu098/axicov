import { Response } from "express";

class SSEManager {
  private static instance: SSEManager;
  private clients: Map<string, Response>;

  private constructor() {
    this.clients = new Map();
  }

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addClient(threadId: string, res: Response) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    this.clients.set(threadId, res);

    res.on("close", () => {
      this.removeClient(threadId);
    });
  }

  removeClient(threadId: string) {
    const client = this.clients.get(threadId);
    if (client) {
      client.end();
      this.clients.delete(threadId);
    }
  }

  emitToolEvent(threadId: string, event: any) {
    const client = this.clients.get(threadId);
    if (client) {
      client.write(
        `data: ${JSON.stringify({
          type: "toolEvent",
          ...event,
        })}\n\n`
      );
    }
  }
}

export const sseManager = SSEManager.getInstance();
