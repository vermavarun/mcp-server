# MCP Examples

This directory contains practical examples demonstrating how to use and extend the Notes MCP Server.

## 📁 Files

### [client-example.ts](client-example.ts)
A complete MCP client implementation that demonstrates:
- Connecting to an MCP server
- Discovering tools, resources, and prompts
- Calling tools with various parameters
- Reading resources
- Using prompts

**Usage:**
```bash
# Make sure the server is built
npm run build

# Install client dependencies (if not already done)
npm install

# Build the example
npx tsc examples/client-example.ts --module nodenext --moduleResolution nodenext --target es2022

# Run the example
node examples/client-example.js
```

## 🎓 Learning Examples

### Example 1: Basic Note Creation

```typescript
import { NotesClient } from './client-example.js';

const client = new NotesClient();
await client.connect('./build/index.js');

// Create a simple note
await client.createNote(
  'My First Note',
  'This is the content of my first note'
);
```

### Example 2: Organizing Notes with Tags

```typescript
// Create work-related notes
await client.createNote('Sprint Planning', 'Plan Q1 sprint', ['work', 'planning']);
await client.createNote('Bug Review', 'Review critical bugs', ['work', 'bugs']);

// Create personal notes
await client.createNote('Vacation Ideas', 'Places to visit', ['personal', 'travel']);

// List only work notes
await client.listNotes('work');
```

### Example 3: Searching and Filtering

```typescript
// Create notes about different topics
await client.createNote('TypeScript Tips', 'Use strict mode', ['programming']);
await client.createNote('Python Guide', 'Virtual environments', ['programming']);
await client.createNote('Recipe Ideas', 'Pasta carbonara', ['cooking']);

// Search for programming-related content
await client.searchNotes('programming');

// Or filter by tag
await client.listNotes('cooking');
```

### Example 4: Using Resources

```typescript
// Get a summary of all notes
await client.readResource('notes://summary');

// Get all notes as structured data
await client.readResource('notes://all');
```

### Example 5: Working with Prompts

```typescript
// Create several notes first
await client.createNote('ML Project', 'Train image classifier', ['ai', 'work']);
await client.createNote('API Design', 'REST vs GraphQL', ['programming', 'work']);
await client.createNote('Team Meeting', 'Retrospective Q1', ['work']);

// Use a prompt to get organized suggestions
await client.getPrompt('organize_notes');

// Summarize work-related notes
await client.getPrompt('summarize_notes', { tag: 'work' });
```

## 🔄 Integration Examples

### Example 6: Command-Line Interface

Create a CLI tool that uses the MCP server:

```typescript
#!/usr/bin/env node
import { NotesClient } from './client-example.js';
import { parseArgs } from 'node:util';

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      command: { type: 'string', short: 'c' },
      title: { type: 'string', short: 't' },
      content: { type: 'string' },
      tags: { type: 'string' },
    },
    allowPositionals: true,
  });

  const client = new NotesClient();
  await client.connect('./build/index.js');

  switch (values.command) {
    case 'create':
      const tags = values.tags ? values.tags.split(',') : [];
      await client.createNote(values.title!, values.content!, tags);
      break;
    case 'list':
      await client.listNotes();
      break;
    case 'search':
      await client.searchNotes(positionals[0]);
      break;
  }

  await client.disconnect();
}

main();
```

### Example 7: Web API Wrapper

Create an HTTP API that exposes MCP functionality:

```typescript
import express from 'express';
import { NotesClient } from './client-example.js';

const app = express();
app.use(express.json());

const client = new NotesClient();
await client.connect('./build/index.js');

app.post('/api/notes', async (req, res) => {
  const { title, content, tags } = req.body;
  await client.createNote(title, content, tags);
  res.json({ success: true });
});

app.get('/api/notes', async (req, res) => {
  const { tag } = req.query;
  const notes = await client.listNotes(tag as string);
  res.json(notes);
});

app.listen(3000, () => {
  console.log('Notes API running on http://localhost:3000');
});
```

## 🧪 Testing Examples

### Example 8: Unit Testing Tools

```typescript
import { describe, it, expect } from 'vitest';
import { NotesClient } from './client-example.js';

describe('Notes MCP Server', () => {
  let client: NotesClient;

  beforeEach(async () => {
    client = new NotesClient();
    await client.connect('./build/index.js');
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('should create a note', async () => {
    const response = await client.createNote('Test', 'Content');
    expect(response).toContain('Note created');
  });

  it('should list notes', async () => {
    await client.createNote('Note 1', 'Content 1');
    await client.createNote('Note 2', 'Content 2');
    const notes = await client.listNotes();
    expect(notes.length).toBeGreaterThanOrEqual(2);
  });

  it('should search notes', async () => {
    await client.createNote('TypeScript', 'Typed JavaScript');
    const results = await client.searchNotes('TypeScript');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## 🎯 Advanced Patterns

### Example 9: Batch Operations

```typescript
async function batchCreateNotes(notes: Array<{title: string, content: string, tags: string[]}>) {
  const client = new NotesClient();
  await client.connect('./build/index.js');

  const results = [];
  for (const note of notes) {
    const result = await client.createNote(note.title, note.content, note.tags);
    results.push(result);
  }

  await client.disconnect();
  return results;
}

// Usage
await batchCreateNotes([
  { title: 'Note 1', content: 'Content 1', tags: ['work'] },
  { title: 'Note 2', content: 'Content 2', tags: ['personal'] },
  { title: 'Note 3', content: 'Content 3', tags: ['ideas'] },
]);
```

### Example 10: Event-Driven Architecture

```typescript
import { EventEmitter } from 'events';

class NotesEventClient extends NotesClient {
  private events = new EventEmitter();

  async createNote(title: string, content: string, tags: string[] = []) {
    this.events.emit('note:creating', { title, content, tags });
    const result = await super.createNote(title, content, tags);
    this.events.emit('note:created', { title, result });
    return result;
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.events.on(event, listener);
  }
}

// Usage
const client = new NotesEventClient();
client.on('note:created', (data) => {
  console.log('Note created:', data.title);
});
```

## 🚀 Next Steps

1. **Try the examples**: Run each example and observe the output
2. **Modify the code**: Change parameters and see what happens
3. **Create your own**: Build a custom client for your use case
4. **Extend the server**: Add new tools and try them with the client

## 📚 Resources

- [Main README](../README.md)
- [Core Concepts](../docs/concepts.md)
- [Architecture Guide](../docs/architecture.md)
- [Usage Guide](../docs/usage.md)
