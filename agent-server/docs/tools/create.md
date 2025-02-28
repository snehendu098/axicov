# Tool Creation Guide

This guide provides detailed instructions for creating new tools for the Agent Framework. By following these patterns, you'll ensure your tools integrate seamlessly with the system and maintain consistent error handling, initialization, and event communication.

## Table of Contents

1. [Tool Structure](#tool-structure)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [Error Handling](#error-handling)
4. [Event Communication](#event-communication)
5. [Testing Your Tool](#testing-your-tool)
6. [Registration Process](#registration-process)
7. [Templates](#templates)

## Tool Structure

Each tool consists of several components:

```
src/tools/your-tool/
├── index.ts       # Main export and registration
├── client.ts      # External API integration
├── types.ts       # Type definitions
└── utils.ts       # Helper functions (optional)
```

### Component Responsibilities

1. **index.ts**

   - Exports the tool registration function
   - Creates and initializes the tool manager
   - Sets up event listeners
   - Defines the LangChain tools

2. **client.ts**

   - Implements the client for external service
   - Handles authentication and API requests
   - Transforms data between formats

3. **types.ts**
   - Defines TypeScript interfaces
   - Documents parameter structures
   - Ensures type safety

## Step-by-Step Implementation

### 1. Set Up Tool Directory

```bash
mkdir -p src/tools/your-tool
touch src/tools/your-tool/index.ts
touch src/tools/your-tool/client.ts
touch src/tools/your-tool/types.ts
```

### 2. Define Tool Types

In `types.ts`:

```typescript
export interface YourToolConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface YourToolParams {
  param1: string;
  param2: number;
}

export interface YourToolResponse {
  id: string;
  status: string;
  result: any;
}
```

### 3. Implement Client Class

In `client.ts`:

```typescript
import axios from "axios";
import { YourToolConfig, YourToolParams, YourToolResponse } from "./types";
import { AppError } from "../../utils/errorHandler";

export class YourToolClient {
  private apiKey: string;
  private baseUrl: string;

  constructor({
    apiKey,
    baseUrl = "https://api.default-service.com",
  }: YourToolConfig) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/status`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.status !== 200) {
        throw new AppError("API connection test failed", 500);
      }

      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new AppError("Invalid API key", 401);
      }

      throw new AppError(`API connection failed: ${error.message}`, 500);
    }
  }

  async performOperation(params: YourToolParams): Promise<YourToolResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/operation`, params, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new AppError("Rate limit exceeded", 429);
      }

      throw new AppError(`Operation failed: ${error.message}`, 500);
    }
  }
}
```

### 4. Create Tool Manager Class

In `index.ts`:

```typescript
import { EventEmitter } from "events";
import { Agent } from "../../agent";
import { tool } from "@langchain/core/tools";
import { AppError } from "../../utils/errorHandler";
import { sseManager } from "../../utils/eventManager";
import { YourToolClient } from "./client";
import { yourToolSchema } from "../schema";

class YourToolManager extends EventEmitter {
  private client: YourToolClient;
  private agent: Agent;
  private isInitialized: boolean = false;

  constructor({ apiKey, agent }: { apiKey: string; agent: Agent }) {
    super();

    // Validate constructor parameters
    if (!agent) {
      throw new AppError("Agent instance is required", 400);
    }

    if (!apiKey) {
      throw new AppError("API key is required", 400);
    }

    this.agent = agent;
    this.client = new YourToolClient({ apiKey });
  }

  async initialize(): Promise<boolean> {
    try {
      // Validate agent parameters
      if (!this.agent.params.requiredParam) {
        throw new AppError("requiredParam is required in agent params", 400);
      }

      // Test API connection
      await this.client.testConnection();

      // Update agent parameters if needed
      this.agent.params.toolSpecificParam = "some-generated-value";

      this.isInitialized = true;
      return true;
    } catch (error: any) {
      this.isInitialized = false;
      throw new AppError(`Tool initialization failed: ${error.message}`, 500);
    }
  }

  async performOperation(param1: string, param2: number) {
    this.checkInitialized();

    try {
      this.emit("tool", {
        tool: "yourTool",
        status: "PROCESSING",
        message: `Processing operation with ${param1}`,
        timestamp: new Date().toISOString(),
      });

      const result = await this.client.performOperation({ param1, param2 });

      this.emit("tool", {
        tool: "yourTool",
        status: "COMPLETE",
        message: `Operation completed successfully`,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error: any) {
      this.emit("tool", {
        tool: "yourTool",
        status: "ERROR",
        message: `Operation failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      });

      throw new AppError(`Operation failed: ${error.message}`, 500);
    }
  }

  private checkInitialized() {
    if (!this.isInitialized) {
      throw new AppError("Tool not initialized", 400);
    }
  }
}

export const exportYourTool = async (agent: Agent) => {
  try {
    // Environment validation
    if (!process.env.YOUR_TOOL_API_KEY) {
      throw new AppError(
        "YOUR_TOOL_API_KEY environment variable is required",
        500
      );
    }

    // Create and initialize tool manager
    const toolManager = new YourToolManager({
      apiKey: process.env.YOUR_TOOL_API_KEY,
      agent,
    });

    // Initialize the tool
    await toolManager.initialize();

    // Set up event listeners
    toolManager.addListener("tool", (event) => {
      if (global.currentThreadId) {
        sseManager.emitToolEvent(global.currentThreadId, event);
      }
    });

    // Define available tools
    const tools = {
      performOperation: tool(async (input) => {
        return await toolManager.performOperation(input.param1, input.param2);
      }, yourToolSchema.operationSchema),
    };

    // Return tools and schema
    return {
      tools: Object.values(tools),
      schema: yourToolSchema,
    };
  } catch (error: any) {
    console.error("Failed to export tool functionality:", error);
    throw new AppError(`Tool export failed: ${error.message}`, 500);
  }
};
```

### 5. Define Tool Schema

In `src/tools/schema.ts`, add your tool schema:

```typescript
import { z } from "zod";

export const yourToolSchema = {
  operationSchema: {
    name: "yourOperation",
    description: "Performs a specific operation with the provided parameters",
    schema: z.object({
      param1: z.string().describe("Description of parameter 1"),
      param2: z.number().describe("Description of parameter 2"),
    }),
    requiresApproval: false,
  },
};
```

## Error Handling

Implement proper error handling at each level:

### 1. Parameter Validation

Always validate required parameters in constructor and method calls:

```typescript
if (!apiKey) {
  throw new AppError("API key is required", 400);
}
```

### 2. External API Calls

Wrap all external API calls in try-catch blocks:

```typescript
try {
  const response = await axios.get(url);
  return response.data;
} catch (error: any) {
  // Handle specific error cases
  if (error.response?.status === 401) {
    throw new AppError("Authentication failed", 401);
  }
  throw new AppError(`API call failed: ${error.message}`, 500);
}
```

### 3. Initialization Checks

Always check if the tool is properly initialized before operations:

```typescript
private checkInitialized() {
  if (!this.isInitialized) {
    throw new AppError('Tool not initialized', 400);
  }
}
```

## Event Communication

Use a consistent event emission pattern:

```typescript
// Start of operation
this.emit("tool", {
  tool: "yourTool",
  status: "PROCESSING",
  message: `Starting operation with ${param}`,
  timestamp: new Date().toISOString(),
});

// Successful completion
this.emit("tool", {
  tool: "yourTool",
  status: "COMPLETE",
  message: `Operation completed successfully`,
  timestamp: new Date().toISOString(),
});

// Error
this.emit("tool", {
  tool: "yourTool",
  status: "ERROR",
  message: `Operation failed: ${error.message}`,
  timestamp: new Date().toISOString(),
});
```

## Testing Your Tool

### 1. Basic Testing

Create a simple test script to verify your tool works:

```typescript
// test-your-tool.ts
import dotenv from "dotenv";
dotenv.config();

import { Agent } from "../../agent";
import { exportYourTool } from "./index";

async function testTool() {
  try {
    // Create a mock agent
    const agent = new Agent({
      threadId: "test-thread",
      params: {
        requiredParam: "test-value",
      },
    });

    // Initialize and export the tool
    const { tools, schema } = await exportYourTool(agent);

    console.log("Tool exported successfully");
    console.log(
      "Available tools:",
      tools.map((t) => t.name)
    );

    // Test an operation
    const operationTool = tools.find((t) => t.name === "performOperation");
    if (operationTool) {
      const result = await operationTool.call({
        param1: "test",
        param2: 123,
      });

      console.log("Operation result:", result);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testTool();
```

Run the test with:

```bash
ts-node test-your-tool.ts
```

## Registration Process

### 1. Register Your Tool

Add your tool to the allRegistry in `src/tools/registry/index.ts`:

```typescript
import { exportYourTool } from "../your-tool";

const allRegistry: ((agent: Agent) => Promise<{
  tools: any[];
  schema: Tools;
}>)[] = [
  exportYourTool, // Add your tool here
  // ... other optional tools
];
```

### 2. Update Environment Variables

Add required environment variables to `.env`:

```
YOUR_TOOL_API_KEY=your_api_key_here
```

## Templates

### Basic Tool Template

```typescript
// index.ts
import { EventEmitter } from "events";
import { Agent } from "../../agent";
import { tool } from "@langchain/core/tools";
import { AppError } from "../../utils/errorHandler";
import { sseManager } from "../../utils/eventManager";

class ToolManager extends EventEmitter {
  private agent: Agent;
  private isInitialized: boolean = false;

  constructor({ agent }: { agent: Agent }) {
    super();

    if (!agent) {
      throw new AppError("Agent instance is required", 400);
    }

    this.agent = agent;
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialization logic
      this.isInitialized = true;
      return true;
    } catch (error: any) {
      throw new AppError(`Tool initialization failed: ${error.message}`, 500);
    }
  }

  async operation(param: string) {
    if (!this.isInitialized) {
      throw new AppError("Tool not initialized", 400);
    }

    try {
      this.emit("tool", {
        tool: "toolName",
        status: "PROCESSING",
        message: `Processing with ${param}`,
        timestamp: new Date().toISOString(),
      });

      // Operation logic
      const result = { success: true, data: param };

      this.emit("tool", {
        tool: "toolName",
        status: "COMPLETE",
        message: "Operation completed",
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error: any) {
      this.emit("tool", {
        tool: "toolName",
        status: "ERROR",
        message: `Operation failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      });

      throw new AppError(`Operation failed: ${error.message}`, 500);
    }
  }
}

export const exportTool = async (agent: Agent) => {
  try {
    const toolManager = new ToolManager({ agent });
    await toolManager.initialize();

    toolManager.addListener("tool", (event) => {
      if (global.currentThreadId) {
        sseManager.emitToolEvent(global.currentThreadId, event);
      }
    });

    const tools = {
      operation: tool(
        async (input) => {
          return await toolManager.operation(input.param);
        },
        {
          name: "operation",
          description: "Performs an operation",
          parameters: {
            type: "object",
            properties: {
              param: {
                type: "string",
                description: "Parameter description",
              },
            },
            required: ["param"],
          },
        }
      ),
    };

    return {
      tools: Object.values(tools),
      schema: {
        operation: {
          name: "operation",
          description: "Performs an operation",
          parameters: {
            type: "object",
            properties: {
              param: {
                type: "string",
                description: "Parameter description",
              },
            },
            required: ["param"],
          },
          requiresApproval: false,
        },
      },
    };
  } catch (error: any) {
    throw new AppError(`Tool export failed: ${error.message}`, 500);
  }
};
```

By following this guide, you'll create tools that integrate seamlessly with the Agent Framework and maintain consistent patterns for initialization, error handling, and event communication.
