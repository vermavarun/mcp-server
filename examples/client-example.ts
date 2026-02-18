#!/usr/bin/env node

/**
 * Example MCP Client
 *
 * This demonstrates how to build a client that connects to an MCP server.
 * In real applications, MCP clients are typically built into:
 * - AI assistants (like Claude Desktop)
 * - IDEs (like VS Code)
 * - Custom applications
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class NotesClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;

  constructor() {
    this.client = new Client(
      {
        name: 'notes-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  /**
   * Connect to the MCP server
   */
  async connect(serverPath: string) {
    console.log('🔌 Connecting to Notes MCP Server...\n');

    this.transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
    });

    await this.client.connect(this.transport);
    console.log('✅ Connected!\n');
  }

  /**
   * List all available tools
   */
  async listTools() {
    console.log('📋 Listing available tools:\n');

    const response = await this.client.request(
      { method: 'tools/list' },
      { method: 'tools/list', params: {} }
    );

    console.log('Available tools:');
    response.tools.forEach((tool: any) => {
      console.log(`  • ${tool.name}`);
      console.log(`    ${tool.description}`);
    });
    console.log();
  }

  /**
   * Create a new note
   */
  async createNote(title: string, content: string, tags: string[] = []) {
    console.log(`📝 Creating note: "${title}"\n`);

    const response = await this.client.request(
      { method: 'tools/call' },
      {
        method: 'tools/call',
        params: {
          name: 'create_note',
          arguments: { title, content, tags },
        },
      }
    );

    console.log('Response:', response.content[0].text);
    console.log();
  }

  /**
   * List all notes
   */
  async listNotes(tag?: string) {
    console.log(tag ? `📚 Listing notes tagged "${tag}":\n` : '📚 Listing all notes:\n');

    const response = await this.client.request(
      { method: 'tools/call' },
      {
        method: 'tools/call',
        params: {
          name: 'list_notes',
          arguments: tag ? { tag } : {},
        },
      }
    );

    const notes = JSON.parse(response.content[0].text);
    if (notes.length === 0) {
      console.log('No notes found.\n');
    } else {
      notes.forEach((note: any) => {
        console.log(`[${note.id}] ${note.title}`);
        console.log(`   ${note.content}`);
        console.log(`   Tags: ${note.tags.join(', ') || 'none'}`);
        console.log();
      });
    }
  }

  /**
   * Search notes
   */
  async searchNotes(query: string) {
    console.log(`🔍 Searching for: "${query}"\n`);

    const response = await this.client.request(
      { method: 'tools/call' },
      {
        method: 'tools/call',
        params: {
          name: 'search_notes',
          arguments: { query },
        },
      }
    );

    const notes = JSON.parse(response.content[0].text);
    if (notes.length === 0) {
      console.log('No matching notes found.\n');
    } else {
      console.log(`Found ${notes.length} note(s):\n`);
      notes.forEach((note: any) => {
        console.log(`[${note.id}] ${note.title}`);
        console.log(`   ${note.content}`);
        console.log();
      });
    }
  }

  /**
   * List available resources
   */
  async listResources() {
    console.log('📊 Listing available resources:\n');

    const response = await this.client.request(
      { method: 'resources/list' },
      { method: 'resources/list', params: {} }
    );

    console.log('Available resources:');
    response.resources.forEach((resource: any) => {
      console.log(`  • ${resource.uri}`);
      console.log(`    ${resource.description}`);
    });
    console.log();
  }

  /**
   * Read a resource
   */
  async readResource(uri: string) {
    console.log(`📖 Reading resource: ${uri}\n`);

    const response = await this.client.request(
      { method: 'resources/read' },
      {
        method: 'resources/read',
        params: { uri },
      }
    );

    console.log('Content:');
    console.log(response.contents[0].text);
    console.log();
  }

  /**
   * List available prompts
   */
  async listPrompts() {
    console.log('💬 Listing available prompts:\n');

    const response = await this.client.request(
      { method: 'prompts/list' },
      { method: 'prompts/list', params: {} }
    );

    console.log('Available prompts:');
    response.prompts.forEach((prompt: any) => {
      console.log(`  • ${prompt.name}`);
      console.log(`    ${prompt.description}`);
      if (prompt.arguments && prompt.arguments.length > 0) {
        console.log(`    Arguments: ${prompt.arguments.map((a: any) => a.name).join(', ')}`);
      }
    });
    console.log();
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, args?: any) {
    console.log(`💬 Getting prompt: ${name}\n`);

    const response = await this.client.request(
      { method: 'prompts/get' },
      {
        method: 'prompts/get',
        params: { name, arguments: args },
      }
    );

    console.log('Prompt messages:');
    response.messages.forEach((message: any) => {
      console.log(`[${message.role}]:`);
      console.log(message.content.text);
      console.log();
    });
  }

  /**
   * Disconnect from the server
   */
  async disconnect() {
    if (this.transport) {
      await this.client.close();
      console.log('👋 Disconnected from server\n');
    }
  }
}

/**
 * Example usage
 */
async function main() {
  // Path to the built server
  const serverPath = './build/index.js';

  const client = new NotesClient();

  try {
    // Connect to server
    await client.connect(serverPath);

    // Discover capabilities
    await client.listTools();
    await client.listResources();
    await client.listPrompts();

    // Create some notes
    await client.createNote(
      'Project Ideas',
      'Build an MCP server for note management',
      ['work', 'programming']
    );

    await client.createNote(
      'Grocery List',
      'Milk, eggs, bread, coffee',
      ['personal']
    );

    await client.createNote(
      'Learning Goals',
      'Learn TypeScript, study MCP protocol, practice system design',
      ['education', 'programming']
    );

    // List all notes
    await client.listNotes();

    // List notes by tag
    await client.listNotes('programming');

    // Search notes
    await client.searchNotes('MCP');

    // Read resources
    await client.readResource('notes://summary');

    // Get a prompt
    await client.getPrompt('summarize_notes', { tag: 'programming' });

    // Disconnect
    await client.disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { NotesClient };
