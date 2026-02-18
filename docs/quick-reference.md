# MCP Quick Reference

A quick reference guide for the Model Context Protocol and the Notes MCP Server.

## 🚀 Quick Start Commands

```bash
# Install
npm install

# Build
npm run build

# Development (watch mode)
npm run watch

# Run directly
npm run dev
```

## 📋 JSON-RPC Methods

### Tools

| Method | Purpose | Parameters |
|--------|---------|------------|
| `tools/list` | List available tools | None |
| `tools/call` | Execute a tool | `{name, arguments}` |

### Resources

| Method | Purpose | Parameters |
|--------|---------|------------|
| `resources/list` | List available resources | None |
| `resources/read` | Read a resource | `{uri}` |

### Prompts

| Method | Purpose | Parameters |
|--------|---------|------------|
| `prompts/list` | List available prompts | None |
| `prompts/get` | Get a prompt | `{name, arguments}` |

## 🛠️ Available Tools

### create_note
Create a new note.

**Parameters:**
- `title` (string, required) - The title of the note
- `content` (string, required) - The content/body
- `tags` (string[], optional) - Tags for categorization

**Example:**
```json
{
  "name": "create_note",
  "arguments": {
    "title": "Meeting Notes",
    "content": "Quarterly planning session",
    "tags": ["work", "meetings"]
  }
}
```

### list_notes
List all notes, optionally filtered by tag.

**Parameters:**
- `tag` (string, optional) - Filter by this tag

**Example:**
```json
{
  "name": "list_notes",
  "arguments": {
    "tag": "work"
  }
}
```

### get_note
Get a specific note by ID.

**Parameters:**
- `id` (string, required) - The note ID

**Example:**
```json
{
  "name": "get_note",
  "arguments": {
    "id": "1234567890"
  }
}
```

### update_note
Update an existing note.

**Parameters:**
- `id` (string, required) - The note ID
- `title` (string, optional) - New title
- `content` (string, optional) - New content
- `tags` (string[], optional) - New tags

**Example:**
```json
{
  "name": "update_note",
  "arguments": {
    "id": "1234567890",
    "content": "Updated content"
  }
}
```

### delete_note
Delete a note by ID.

**Parameters:**
- `id` (string, required) - The note ID

**Example:**
```json
{
  "name": "delete_note",
  "arguments": {
    "id": "1234567890"
  }
}
```

### search_notes
Search notes by keyword.

**Parameters:**
- `query` (string, required) - Search query

**Example:**
```json
{
  "name": "search_notes",
  "arguments": {
    "query": "meeting"
  }
}
```

## 📊 Available Resources

### notes://all
Complete list of all notes in JSON format.

**MIME Type:** `application/json`

### notes://summary
Statistical summary of notes in plain text.

**MIME Type:** `text/plain`

## 💬 Available Prompts

### summarize_notes
Create a summary of notes.

**Arguments:**
- `tag` (optional) - Filter notes by tag

### organize_notes
Get suggestions for organizing notes.

**Arguments:** None

## 🔄 Request/Response Format

### Request Structure
```json
{
  "jsonrpc": "2.0",
  "method": "METHOD_NAME",
  "params": {
    // method-specific parameters
  },
  "id": 1
}
```

### Success Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    // method-specific result
  },
  "id": 1
}
```

### Error Response
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Error description"
  },
  "id": 1
}
```

## 🎯 Common Patterns

### Create and List
```typescript
// Create
await callTool('create_note', {
  title: 'My Note',
  content: 'Note content',
  tags: ['tag1']
});

// List
await callTool('list_notes', {});
```

### Search and Update
```typescript
// Search
const results = await callTool('search_notes', {
  query: 'keyword'
});

// Update first result
await callTool('update_note', {
  id: results[0].id,
  content: 'New content'
});
```

### Read and Analyze
```typescript
// Read resource
const summary = await readResource('notes://summary');

// Use prompt
const prompt = await getPrompt('organize_notes');
```

## 🔐 Error Codes

| Code | Meaning |
|------|---------|
| -32700 | Parse error |
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |

## 📦 Data Structures

### Note Object
```typescript
{
  id: string;           // Unique identifier (timestamp)
  title: string;        // Note title
  content: string;      // Note content
  tags: string[];       // Array of tags
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

### Tool Response
```typescript
{
  content: [
    {
      type: 'text',
      text: string      // The result message
    }
  ],
  isError?: boolean    // True if error occurred
}
```

### Resource Content
```typescript
{
  uri: string;          // Resource URI
  mimeType: string;     // Content type
  text: string;         // Content data
}
```

### Prompt Message
```typescript
{
  role: 'user' | 'assistant',
  content: {
    type: 'text',
    text: string        // Prompt text
  }
}
```

## 🎨 Usage Patterns

### Pattern 1: CRUD Operations
```
Create → List → Update → Delete
```

### Pattern 2: Search and Modify
```
Search → Filter Results → Update → Verify
```

### Pattern 3: Organize Workflow
```
List → Analyze → Tag → Summarize
```

### Pattern 4: Batch Processing
```
Loop(Create) → List All → Apply Tags
```

## 🧪 Testing Snippets

### Test Tool Discovery
```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node build/index.js
```

### Test Create Note
```bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"create_note","arguments":{"title":"Test","content":"Content"}},"id":2}' | node build/index.js
```

### Test Resource Reading
```bash
echo '{"jsonrpc":"2.0","method":"resources/read","params":{"uri":"notes://summary"},"id":3}' | node build/index.js
```

## 🔗 Configuration (Claude Desktop)

**macOS:**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"]
    }
  }
}
```

**Windows:**
```json
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["C:\\path\\to\\build\\index.js"]
    }
  }
}
```

## 📚 Additional Resources

- [Full Documentation](../README.md)
- [Core Concepts](./concepts.md)
- [Architecture](./architecture.md)
- [Usage Examples](./usage.md)
- [MCP Specification](https://spec.modelcontextprotocol.io)

## 💡 Tips

1. **Always build before running**: `npm run build`
2. **Use absolute paths** in configuration files
3. **Check logs** in stderr (stdout is for protocol)
4. **Validate JSON** before sending requests
5. **Handle errors** gracefully in production
6. **Use TypeScript** for type safety

## 🐛 Quick Debugging

```typescript
// Add to server for debugging
console.error('Debug:', JSON.stringify(data, null, 2));

// Test with verbose logging
DEBUG=* node build/index.js
```

## 🎓 Learning Path

1. ✅ Read [concepts.md](./concepts.md)
2. ✅ Try [examples](../examples/)
3. ✅ Review [src/index.ts](../src/index.ts)
4. ✅ Build your own tools
5. ✅ Create a custom client
