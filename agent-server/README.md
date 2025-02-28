# Agent Framework

An extensible framework for building AI agents with tool integrations for blockchain, social media, and more.

## Features

- 🤖 **AI-Powered Agents**: Create LLM-based agents that can interact with external services
- 🛠️ **Extensible Tool System**: Easily add new tools and capabilities to agents
- 🔄 **Real-time Updates**: Server-sent events for live agent interactions
- 🔒 **Robust Error Handling**: Prevents server crashes and provides detailed error information

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

## Available Endpoints

- `POST /api/agent/init` - Initialize a new agent
- `POST /api/agent/:threadId/message` - Send message to agent
- `GET /api/agent/:threadId/events` - Get SSE events for an agent
- `DELETE /api/agent/:threadId` - Cleanup agent

## Documentation

### Main Documentation

The complete documentation for the project is available in the `docs` directory:

- [Project Overview](docs/README.md) - Complete system documentation

### Guides

We provide several guides to help you understand and extend the system:

- [Tool Creation Guide](docs/tools/create.md) - Step-by-step instructions for creating new tools
- [Agent Configuration Guide](docs/agent/config.md) - Details on configuring agent parameters
- [Deployment Guide](docs/deployment.md) - Instructions for deploying the system

## Tool System

The framework includes a dual-registry system for tools:

- **Core Tools**: Essential tools that are always loaded

  - Blockchain operations (token deployment, balance checking)
  - Farcaster social media integration

- **Optional Tools**: Additional tools that can be selectively loaded
  - Add your own tools by following the [Tool Creation Guide](docs/tools/create.md)

## Environment Variables

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
```

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
