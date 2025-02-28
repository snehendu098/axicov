# Agent Framework Documentation

## Overview

This project is an extensible agent framework built on Express.js that enables the creation, management, and operation of AI agents with tool integrations. The system allows agents to interact with various external services (like blockchain networks and social platforms) through a unified API interface. It's designed to be fault-tolerant with comprehensive error handling and uses server-sent events (SSE) for real-time communication.

## System Architecture

### Core Components

1. **Express Server (`src/index.ts`)**

   - Main entry point that sets up the Express application
   - Configures global error handlers and middleware
   - Manages process-level error capture to prevent crashes

2. **Agent Router (`src/api/routes.ts`)**

   - Provides REST API endpoints for agent operations
   - Handles agent initialization, messaging, and cleanup
   - Manages agent lifecycle events through SSE connections

3. **Agent Class (`src/agent/index.ts`)**

   - Core agent implementation with AI model integration
   - Manages agent state, tools, and conversation history
   - Handles agent initialization and message processing

4. **Tool Registry (`src/tools/registry/index.ts`)**

   - Manages tool registration and loading
   - Provides metadata for agent prompts
   - Handles tool initialization errors

5. **Tool Implementations**

   - Blockchain tools (`src/tools/blockchain/index.ts`)
   - Farcaster integration (`src/tools/farcaster/index.ts`)
   - Other tool modules (expandable architecture)

6. **Error Handling System (`src/utils/errorHandler.ts`)**

   - Provides standardized error handling across the application
   - Custom error classes for different error types
   - Global error middleware for consistent error responses

7. **Event System (`src/utils/eventManager.ts`)**
   - Manages SSE connections for real-time updates
   - Broadcasts tool and agent events to clients
   - Handles client connection management

### Data Flow

1. **Agent Initialization:**

   ```
   Client -> API Routes -> Agent Class -> Tool Registry -> Tool Implementations
   ```

2. **Agent Messaging:**

   ```
   Client -> API Routes -> Agent Class -> LLM -> Tool Execution -> SSE Events -> Client
   ```

3. **Error Handling:**
   ```
   Error Source -> AppError -> Global Error Handler -> Error Response -> Client
   ```

## API Endpoints

### Agent Management

#### Initialize Agent

```
POST /api/agent/init
```

Creates a new agent with specified tool integrations.

**Request Body:**

```json
{
  "threadId": "unique-thread-id",
  "toolNumbers": [0, 1],
  "params": {
    "name": "Agent Name",
    "instruction": "Agent instructions",
    "privateKey": "0x...",
    "username": "agent_username",
    "displayName": "Display Name",
    "bio": "Agent bio"
  }
}
```

> **Note on toolNumbers**: The `toolNumbers` array specifies which optional tools from `allRegistry` should be loaded in addition to the core tools. For example, `[0, 1]` would load the first and second tools from `allRegistry` along with all core tools.

````

**Response:**
```json
{
  "status": "success",
  "message": "Agent initialized",
  "threadId": "unique-thread-id"
}
````

#### Send Message to Agent

```
POST /api/agent/:threadId/message
```

Sends a message to an existing agent.

**Request Body:**

```json
{
  "message": "Hello agent"
}
```

**Response:**

```json
{
  "response": "Agent response message"
}
```

#### Get Agent Events

```
GET /api/agent/:threadId/events
```

Establishes SSE connection for real-time agent events.

**SSE Event Types:**

- `user`: User messages
- `agent`: Agent responses
- `tool`: Tool operation events

#### Delete Agent

```
DELETE /api/agent/:threadId
```

Removes an agent and cleans up resources.

**Response:**

```json
{
  "status": "success",
  "message": "Agent cleaned up"
}
```

## Tool Integration

### Tool Structure

Each tool module follows a consistent structure:

1. **Tool Manager Class**

   - Handles tool initialization and operations
   - Emits events for operation status
   - Manages external service connections

2. **Tool Client**

   - Interfaces with external APIs
   - Handles authentication and data transformation
   - Isolates service-specific error handling

3. **Tool Registration Function**
   - Exports tools to the agent system
   - Validates environment and parameters
   - Sets up event listeners

### Tool Registry System

The framework uses a dual-registry system for managing tools:

1. **Core Registry (`coreRegistry`)**

   - Contains essential tools that are always loaded (Blockchain, Farcaster)
   - These tools provide fundamental capabilities needed by all agents
   - Always initialized regardless of toolNumbers parameter

2. **Optional Registry (`allRegistry`)**
   - Contains additional/specialized tools that can be selectively loaded
   - Tools are referenced by their index in the registry via toolNumbers
   - Only initialized when specifically requested in agent initialization

When an agent is initialized with `toolNumbers` parameter, the system:

1. Always loads all core tools from `coreRegistry`
2. Additionally loads tools from `allRegistry` whose indices match the provided toolNumbers
3. Combines all loaded tools and makes them available to the agent

### Available Tools

#### Blockchain Tools

- Deploy tokens on Base blockchain
- Check token balances
- Get native token balances

#### Farcaster Tools

- Create Farcaster accounts
- Publish casts (posts)
- Update account information

### Adding New Tools

To add a new tool:

1. Create a new directory in `src/tools/`
2. Implement tool manager, client, and registration function
3. Add tool schema definitions
4. Register the tool in the tool registry

## Error Handling

The system uses a comprehensive error handling approach:

1. **AppError Class**

   - Custom error class with status codes and operational flags
   - Standardized error formatting

2. **AsyncHandler**

   - Wrapper for async route handlers
   - Eliminates repetitive try-catch blocks

3. **Global Error Handler**

   - Catches and formats all errors
   - Provides consistent error responses

4. **Process-Level Handlers**
   - Captures uncaught exceptions and unhandled rejections
   - Prevents server crashes

## Event System

The SSE event system provides real-time updates:

1. **SSE Manager**

   - Manages client connections by threadId
   - Emits formatted events to clients
   - Handles connection cleanup

2. **Event Types**
   - User messages
   - Agent responses
   - Tool operation status updates

## Configuration

### Environment Variables

```
# AI Model APIs
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key

# Database
MONGO_URI=your_mongodb_connection_string

# Tool APIs
THIRDWEB_SECRET=your_thirdweb_secret
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEYNAR_API_KEY=your_neynar_api_key

# Network Configuration
NETWORK=testnet  # or mainnet

# Server
DB_ENDPOINT=http://localhost:3000  # Backend server endpoint
```

## Development Workflow

### Running the Server

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build and run production server
npm run build
npm start
```

### Adding a New Tool

1. Create tool directory and files:

   ```
   src/tools/your-tool/
   ├── index.ts      # Main export
   ├── client.ts     # API client
   └── types.ts      # Type definitions
   ```

2. Implement the tool manager and client classes following the standard pattern

3. Register the tool in the appropriate registry:

   ```typescript
   // in src/tools/registry/index.ts
   import { exportYourTool } from "../your-tool";

   // For essential tools that should always be available
   const coreRegistry = [exportBlockchainTools, exportFarcasterTools];

   // For optional tools that can be selectively loaded by index
   const allRegistry = [
     exportYourTool, // Add your optional tool here (accessible via toolNumbers)
   ];
   ```

4. Add the tool schema in the schema file:
   ```typescript
   // in src/tools/schema.ts
   export const yourToolSchema = {
     operationName: {
       name: "operationName",
       description: "Description of operation",
       parameters: {
         type: "object",
         properties: {
           param1: { type: "string", description: "Parameter description" },
         },
         required: ["param1"],
       },
       requiresApproval: false,
     },
   };
   ```

### Error Handling Best Practices

1. Use `AppError` for all errors with proper status codes
2. Wrap async route handlers with `asyncHandler`
3. Always validate parameters before operation
4. Use try-catch blocks for external API calls
5. Emit events for operation status changes

## Deployment

### Production Considerations

1. **Environment Variables**

   - Secure storage of API keys and credentials
   - Different configurations for dev/prod environments

2. **MongoDB**

   - Production MongoDB instance with proper authentication
   - Backup strategy for conversation history

3. **Monitoring**

   - Error logging and monitoring
   - Performance tracking for API endpoints

4. **Scaling**
   - Horizontal scaling strategies
   - Load balancing for multiple instances

## Guides

### Available Guides

The project includes several guides to help developers understand and extend the system:

1. **Tool Creation Guide**

   - Location: `docs/tools/create.md`
   - Provides step-by-step instructions for creating new tools
   - Includes templates and best practices for tool implementation
   - Covers error handling, event emission, and testing

2. **Agent Configuration Guide**

   - Location: `docs/agent/config.md`
   - Details on configuring agent parameters and behaviors
   - Instructions for optimizing prompts and tool interactions

3. **Deployment Guide**
   - Location: `docs/deployment.md`
   - Instructions for deploying the system to various environments
   - Configuration recommendations for production use

### Using the Guides

Refer to these guides when:

- Developing new tool integrations
- Configuring agents for specific use cases
- Preparing the system for production deployment

The guides complement this main documentation and provide more detailed, task-specific instructions.

## Troubleshooting

### Common Issues

1. **Agent Initialization Failures**

   - Check required environment variables
   - Verify tool-specific parameters
   - Review MongoDB connection

2. **Tool Operation Errors**

   - Check API credentials for the specific tool
   - Verify network connectivity to external services
   - Review tool-specific parameters

3. **Server Crashes**
   - Check for uncaught exceptions in logs
   - Verify error handling in custom code
   - Review memory and CPU usage

## Future Enhancements

1. **Tool Expansion**

   - Additional blockchain networks
   - More social media integrations
   - Data processing tools

2. **Agent Capabilities**

   - Multi-step workflows
   - Enhanced memory and context management
   - Tool prioritization and selection

3. **Monitoring and Analytics**
   - Dashboard for agent activities
   - Usage metrics and performance analytics
   - Error tracking and alerting
