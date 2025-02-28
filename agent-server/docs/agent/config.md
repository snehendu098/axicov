# Agent Configuration Guide

This guide provides detailed instructions for configuring agents in the Agent Framework. It covers agent initialization parameters, prompt engineering, tool selection, and best practices for optimizing agent performance.

## Table of Contents

1. [Agent Architecture](#agent-architecture)
2. [Initialization Parameters](#initialization-parameters)
3. [System Prompt Configuration](#system-prompt-configuration)
4. [Tool Selection](#tool-selection)
5. [Agent Parameters](#agent-parameters)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configurations](#advanced-configurations)

## Agent Architecture

Each agent in the framework consists of:

- **LLM**: The language model (Claude or Gemini)
- **Tools**: Functional capabilities the agent can use
- **Memory**: Conversation history stored in MongoDB
- **System Prompt**: Instructions that guide agent behavior
- **Parameters**: Configuration values for the agent

## Initialization Parameters

When initializing an agent via the `/api/agent/init` endpoint, you must provide:

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

### Required Parameters:

| Parameter     | Description                                    | Required |
| ------------- | ---------------------------------------------- | -------- |
| `threadId`    | Unique identifier for the conversation         | Yes      |
| `toolNumbers` | Array of tool indices to load from allRegistry | Yes      |
| `params`      | Object containing agent-specific parameters    | Yes      |

### Params Object:

| Parameter     | Description                                    | Required By      |
| ------------- | ---------------------------------------------- | ---------------- |
| `name`        | Agent's name                                   | All agents       |
| `instruction` | Specific instructions for the agent            | All agents       |
| `privateKey`  | Ethereum private key for blockchain operations | Blockchain tools |
| `username`    | Username for social media accounts             | Farcaster tools  |
| `displayName` | Display name for social media profiles         | Farcaster tools  |
| `bio`         | Biography for social media profiles            | Farcaster tools  |

## System Prompt Configuration

The system prompt defines the agent's persona, capabilities, and behavior guidelines. It is constructed during agent initialization and includes:

### Sections of the System Prompt:

1. **Identity**: Sets the agent's name and core identity

   ```
   Your name is ${agent.params.name} (Agent).
   ```

2. **Instructions**: Primary guidance for the agent's purpose

   ```
   INSTRUCTIONS:
   ${agent.params.instruction}
   ```

3. **Behavioral Guidelines**: Rules for interaction style

   ```
   - Behavioral Guidelines:
     1. NEVER be rude to user
     2. NEVER try to be over professional
     3. ALWAYS be friendly to the user
     4. NEVER act over politely
     5. ALWAYS be concise and to the point
   ```

4. **Response Formatting**: Guidelines for structuring responses

   ```
   Response Formatting:
   - Use proper line breaks between different sections of your response for better readability
   - Utilize markdown features effectively to enhance the structure of your response
   - Keep responses concise and well-organized
   - Use emojis sparingly and only when appropriate for the context
   ```

5. **Common Knowledge**: Domain-specific information the agent should know

   ```
   Common knowledge:
   - Your are hyperoptimized for base blockchain
   - Your wallet address: ${agent.params.publicKey || ""}
   - Chain currently Operating on: Base
   ```

6. **Available Tools**: Dynamically generated list of tools and their descriptions
   ```
   Your Available Tools:
   ${agent.toolMetadata}
   ```

### Best Practices for System Prompts:

1. **Clear Instructions**: Be specific about what the agent should and should not do
2. **Concise Language**: Keep instructions clear and to the point
3. **Prioritization**: Most important instructions should come first
4. **Examples**: Include examples of desired behavior when appropriate
5. **Tool Emphasis**: Guide when and how tools should be used

## Tool Selection

The `toolNumbers` parameter determines which optional tools are loaded:

```json
"toolNumbers": [0, 1]
```

This array specifies indices of tools in the `allRegistry` that should be loaded. In addition to these optional tools, all core tools from `coreRegistry` are always loaded.

### Core Tools (Always Loaded):

1. **Blockchain Tools**:

   - Token deployment
   - Token balance checking
   - Native token balance checking

2. **Farcaster Tools**:
   - Publishing casts (social media posts)
   - Account operations

### Optional Tools (Selectively Loaded):

These are loaded based on indices provided in `toolNumbers`. For example:

- `[0]` would load only the first optional tool
- `[0, 2]` would load the first and third optional tools
- `[]` would load only core tools

### Tool Requirements:

Different tools may require specific parameters to be present in the agent's `params` object:

1. **Blockchain Tools**:

   - Require `privateKey` for transaction signing

2. **Farcaster Tools**:
   - Require `username`, `displayName`, and `bio` for account creation
   - Generate and store `signerUUID` during initialization

## Agent Parameters

The `params` object contains configuration values and credentials for the agent:

```json
"params": {
  "name": "CryptoHelper",
  "instruction": "You are an assistant specializing in cryptocurrency and blockchain operations on Base. Help users deploy tokens, check balances, and post updates to Farcaster.",
  "privateKey": "0x...",
  "username": "crypto_helper",
  "displayName": "Crypto Helper",
  "bio": "Your friendly crypto assistant on Base blockchain"
}
```

### Important Parameters:

1. **name**: Sets the agent's identity in conversations
2. **instruction**: Defines the agent's primary purpose and behavior
3. **Credentials**:
   - `privateKey`: For blockchain operations
   - Authentication credentials for other services

### Dynamic Parameters:

Some parameters are generated during agent initialization:

1. **publicKey**: Derived from the privateKey by blockchain tools
2. **signerUUID**: Generated during Farcaster account creation

These dynamic parameters are added to the agent's `params` object and persisted for future use.

## Performance Optimization

Optimize your agent's performance with these configurations:

### 1. Prompt Engineering

Fine-tune the `instruction` parameter for optimal results:

```json
"instruction": "You are an expert on the Base blockchain with deep knowledge of token deployment and management. Prioritize security best practices in all recommendations. When asked about token deployment, obtain all necessary details before proceeding. For balance inquiries, provide context on token value when possible."
```

Best practices:

- Be specific about the agent's expertise
- Include prioritization guidelines
- Specify when to use which tools
- Detail the expected workflow for common tasks

### 2. Model Selection

The framework uses different LLM models depending on available API keys:

```typescript
if (process.env.ANTHROPIC_API_KEY) {
  this.model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-haiku-20240307",
  });
} else if (process.env.GEMINI_API_KEY) {
  this.model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}
```

Considerations:

- Claude models excel at following complex instructions
- Gemini models may have different strengths for specific tasks
- Configure model-specific behavior in the instructions if needed

### 3. Response Formatting

Guide the agent's response format for better user experience:

```json
"instruction": "... When responding, format token addresses as `0x123...abc` for readability. Use bullet points for listing multiple options. Bold important warnings or alerts."
```

## Troubleshooting

Common issues and solutions:

### 1. Tool Initialization Failures

**Problem**: Agent fails to initialize due to tool errors.

**Solutions**:

- Check environment variables required by tools
- Verify all required parameters are provided
- Ensure API keys have necessary permissions
- Check log output for specific error messages

### 2. Inappropriate Tool Usage

**Problem**: Agent uses tools incorrectly or at inappropriate times.

**Solutions**:

- Update instructions with clear guidelines on when to use specific tools
- Add examples of proper tool usage in the instruction
- Include explicit constraints on tool usage conditions

### 3. Poor Response Quality

**Problem**: Agent responses are too verbose, too technical, or miss the user's intent.

**Solutions**:

- Refine behavioral guidelines in the instruction
- Add specific formatting requirements
- Include audience-awareness directives:
  ```
  "instruction": "... Adapt your technical level to the user's expertise. If they seem new to blockchain, explain concepts simply. If they demonstrate technical knowledge, you can be more detailed."
  ```

## Advanced Configurations

### 1. Tool-Specific Configurations

For blockchain operations, specify network preferences:

```json
"params": {
  "network": "mainnet", // or "testnet"
  "gasPreference": "fast", // or "standard", "slow"
  "slippageTolerance": 0.5 // percentage
}
```

### 2. Multi-Platform Agents

For agents that work across multiple platforms:

```json
"params": {
  "platforms": {
    "farcaster": {
      "username": "crypto_agent",
      "autoPost": true
    },
    "telegram": {
      "botToken": "bot123456:ABC-DEF1234"
    }
  }
}
```

### 3. Custom Agent Memory

Configure memory retention behavior:

```json
"params": {
  "memorySettings": {
    "maxMessages": 100,
    "summarizeThreshold": 50,
    "importantTopics": ["token_deployment", "transaction_history"]
  }
}
```

### 4. User-Specific Customization

Adapt the agent for specific users:

```json
"params": {
  "userPreferences": {
    "technicalLevel": "expert", // or "beginner", "intermediate"
    "responseStyle": "concise", // or "detailed", "educational"
    "favoriteTopics": ["defi", "nft", "trading"]
  }
}
```

By following this guide, you'll be able to create and configure highly effective agents that leverage the full capabilities of the Agent Framework.
