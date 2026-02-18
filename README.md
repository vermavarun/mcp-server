# Notes MCP Server - Learning Guide

Welcome! This project is designed to help you understand **Model Context Protocol (MCP)** servers - how they work, how to build them, and how to use them.

## 📚 What is MCP?

**Model Context Protocol (MCP)** is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). Think of it as a way for AI assistants to access tools, data, and capabilities from your applications.

### Key Benefits:
- **Standardized Interface**: One protocol for all integrations
- **Extensible**: Easy to add new capabilities
- **Secure**: Controlled access to your data and functions
- **Modular**: Mix and match different MCP servers

## 🏗️ Project Structure

```
mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── docs/
│   ├── architecture.md   # Detailed architecture and diagrams
│   ├── concepts.md       # Core MCP concepts explained
│   └── usage.md          # How to use the server
├── examples/
│   └── client-example.ts # Example MCP client
├── package.json          # Node.js dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the server (for testing)
npm run dev
```

### Using the Server

MCP servers communicate via stdio (standard input/output). They're typically configured in an MCP client like Claude Desktop or an IDE.

**Example Configuration (Claude Desktop):**

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/path/to/mcp-server/build/index.js"]
    }
  }
}
```

## 🧩 What This Server Does

This is a **Notes Management Server** that provides:

### Tools (Functions)
- `create_note` - Create a new note
- `list_notes` - List all notes (with optional tag filter)
- `get_note` - Get a specific note by ID
- `update_note` - Update an existing note
- `delete_note` - Delete a note
- `search_notes` - Search notes by keyword

### Resources (Data)
- `notes://all` - Access all notes as JSON
- `notes://summary` - Get a summary with statistics

### Prompts (Templates)
- `summarize_notes` - Generate a summary of notes
- `organize_notes` - Get organization suggestions

## 📖 Learning Path

1. **Start Here**: Read [Core Concepts](docs/concepts.md) to understand MCP fundamentals
2. **Dive Deeper**: Review [Architecture](docs/architecture.md) to see how everything connects
3. **Get Practical**: Check [Usage Guide](docs/usage.md) for hands-on examples
4. **Explore Code**: Read through [src/index.ts](src/index.ts) - it's heavily commented!

## 🎯 Key Concepts Illustrated

This server demonstrates:

✅ **Request/Response Pattern**: How MCP uses JSON-RPC for communication
✅ **Tool Implementation**: Defining and executing functions
✅ **Resource Management**: Exposing data through URIs
✅ **Prompt Templates**: Creating reusable prompt patterns
✅ **Error Handling**: Proper error responses
✅ **Type Safety**: Using TypeScript for robust code

## 🔄 How It Works (Simple View)

```
┌─────────────┐                    ┌─────────────┐
│             │   JSON-RPC over    │             │
│  MCP Client │ ←─────────────────→│  MCP Server │
│  (Claude)   │      stdio         │   (Notes)   │
│             │                    │             │
└─────────────┘                    └─────────────┘
       │                                  │
       │  1. "List available tools"       │
       │ ─────────────────────────────────→
       │                                  │
       │  2. Returns: create_note,        │
       │     list_notes, etc.             │
       │ ←─────────────────────────────────
       │                                  │
       │  3. "Call create_note with..."   │
       │ ─────────────────────────────────→
       │                                  │
       │  4. Executes & returns result    │
       │ ←─────────────────────────────────
```

## 🛠️ Development

### Watch Mode
```bash
npm run watch
```

### Testing
The server communicates via stdio, so direct testing requires an MCP client. See [examples/](examples/) for a sample client implementation.

## 📚 Additional Resources

- [MCP Official Documentation](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [MCP SDK Repository](https://github.com/modelcontextprotocol/sdk)

## 🤝 Contributing

This is an educational project! Feel free to:
- Add more features to practice
- Improve documentation
- Create additional examples
- Ask questions via issues

## 📝 License

MIT - Feel free to use this for learning and experimentation!

---

**Next Steps**: Head to [docs/concepts.md](docs/concepts.md) to learn about MCP fundamentals!
