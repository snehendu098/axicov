import { EventEmitter } from "events";

// Define the structure of a tool event
interface ToolEvent {
  tool: string;
  status: string;
  message: string;
  timestamp: string;
}

// Define the events this tool can emit
interface ToolEvents {
  toolEvent: (event: ToolEvent) => void;
}

// Extend EventEmitter with our custom events
export class BaseTool extends EventEmitter {
  protected name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  // Override emit to provide type safety
  emit<K extends keyof ToolEvents>(
    eventName: K,
    ...args: Parameters<ToolEvents[K]>
  ): boolean {
    return super.emit(eventName, ...args);
  }

  // Override on/addListener to provide type safety
  on<K extends keyof ToolEvents>(eventName: K, listener: ToolEvents[K]): this {
    return super.on(eventName, listener);
  }

  addListener<K extends keyof ToolEvents>(
    eventName: K,
    listener: ToolEvents[K]
  ): this {
    return super.addListener(eventName, listener);
  }

  protected emitToolEvent(status: string, message: string): void {
    this.emit("toolEvent", {
      tool: this.name,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  getName(): string {
    return this.name;
  }
}
