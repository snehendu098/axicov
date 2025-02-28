import axios from "axios";
import { Response } from "express";
import { dbEndpoint } from "../constants";

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

  /**
   *
   * Has type: {"type":"tool","tool":"agent","status":"complete","message":"Message processed successfully","timestamp":"2025-02-27T15:05:44.234Z"}
   * And:{ type: "agent", message: response.messages[response.messages.length - 1].content, timestamp: new Date().toISOString()}
   */

  async emitToolEvent(threadId: string, event: any, type?: string) {
    const client = this.clients.get(threadId);

    if (client) {
      client.write(
        `data: ${JSON.stringify({
          type: type || "tool",
          ...event,
        })}\n\n`
      );
    }

    await axios.post(`${dbEndpoint}/events/save`, {
      type: event.type || event.tool,
      body: event.message,
      agentInstance: threadId,
    });
  }
}

export const sseManager = SSEManager.getInstance();
