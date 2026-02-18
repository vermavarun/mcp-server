#!/usr/bin/env node

/**
 * Notes MCP Server
 *
 * This is a simple Model Context Protocol (MCP) server that demonstrates
 * how to create and use MCP servers. It provides functionality to manage notes.
 *
 * Key Concepts:
 * - Tools: Functions that can be called by the client
 * - Resources: Static or dynamic data that can be read
 * - Prompts: Reusable prompt templates with arguments
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// In-memory storage for notes (in a real app, you'd use a database)
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const notes: Map<string, Note> = new Map();

/**
 * Initialize the MCP server
 * The Server class handles the core protocol communication
 */
const server = new Server(
  {
    name: 'notes-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},      // This server provides tools (functions)
      resources: {},  // This server provides resources (data)
      prompts: {},    // This server provides prompts (templates)
    },
  }
);

/**
 * TOOLS SECTION
 * Tools are functions that the MCP client (like Claude or an IDE) can call.
 * Each tool has:
 * - name: unique identifier
 * - description: what it does
 * - inputSchema: JSON Schema describing the parameters
 */

// Register the list of available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_note',
        description: 'Create a new note with a title, content, and optional tags',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the note',
            },
            content: {
              type: 'string',
              description: 'The content/body of the note',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional tags to categorize the note',
            },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'list_notes',
        description: 'List all notes, optionally filtered by tag',
        inputSchema: {
          type: 'object',
          properties: {
            tag: {
              type: 'string',
              description: 'Optional tag to filter notes by',
            },
          },
        },
      },
      {
        name: 'get_note',
        description: 'Get a specific note by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the note to retrieve',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_note',
        description: 'Update an existing note',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the note to update',
            },
            title: {
              type: 'string',
              description: 'New title (optional)',
            },
            content: {
              type: 'string',
              description: 'New content (optional)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'New tags (optional)',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_note',
        description: 'Delete a note by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the note to delete',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'search_notes',
        description: 'Search notes by keyword in title or content',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to match against note titles and content',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_note': {
        const id = Date.now().toString();
        const note: Note = {
          id,
          title: args?.title as string,
          content: args?.content as string,
          tags: (args?.tags as string[]) || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        notes.set(id, note);

        return {
          content: [
            {
              type: 'text',
              text: `Note created successfully with ID: ${id}`,
            },
          ],
        };
      }

      case 'list_notes': {
        const tag = args?.tag as string | undefined;
        let filteredNotes = Array.from(notes.values());

        if (tag) {
          filteredNotes = filteredNotes.filter((note) =>
            note.tags.includes(tag)
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(filteredNotes, null, 2),
            },
          ],
        };
      }

      case 'get_note': {
        const id = args?.id as string;
        const note = notes.get(id);

        if (!note) {
          throw new Error(`Note with ID ${id} not found`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(note, null, 2),
            },
          ],
        };
      }

      case 'update_note': {
        const id = args?.id as string;
        const note = notes.get(id);

        if (!note) {
          throw new Error(`Note with ID ${id} not found`);
        }

        if (args?.title) note.title = args.title as string;
        if (args?.content) note.content = args.content as string;
        if (args?.tags) note.tags = args.tags as string[];
        note.updatedAt = new Date().toISOString();

        notes.set(id, note);

        return {
          content: [
            {
              type: 'text',
              text: `Note ${id} updated successfully`,
            },
          ],
        };
      }

      case 'delete_note': {
        const id = args?.id as string;

        if (!notes.has(id)) {
          throw new Error(`Note with ID ${id} not found`);
        }

        notes.delete(id);

        return {
          content: [
            {
              type: 'text',
              text: `Note ${id} deleted successfully`,
            },
          ],
        };
      }

      case 'search_notes': {
        const query = (args?.query as string).toLowerCase();
        const results = Array.from(notes.values()).filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * RESOURCES SECTION
 * Resources are data that can be read by the client.
 * They can be static files, database content, API responses, etc.
 */

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'notes://all',
        mimeType: 'application/json',
        name: 'All Notes',
        description: 'Complete list of all notes in the system',
      },
      {
        uri: 'notes://summary',
        mimeType: 'text/plain',
        name: 'Notes Summary',
        description: 'A summary of notes with statistics',
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'notes://all':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(Array.from(notes.values()), null, 2),
          },
        ],
      };

    case 'notes://summary': {
      const allNotes = Array.from(notes.values());
      const totalNotes = allNotes.length;
      const allTags = new Set(allNotes.flatMap((note) => note.tags));
      const summary = `
Notes Summary
=============
Total notes: ${totalNotes}
Unique tags: ${allTags.size}
Tags: ${Array.from(allTags).join(', ') || 'none'}
      `.trim();

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: summary,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

/**
 * PROMPTS SECTION
 * Prompts are reusable templates that can be filled with arguments.
 * They help standardize common interactions.
 */

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'summarize_notes',
        description: 'Create a summary of notes, optionally filtered by tag',
        arguments: [
          {
            name: 'tag',
            description: 'Optional tag to filter notes',
            required: false,
          },
        ],
      },
      {
        name: 'organize_notes',
        description: 'Get suggestions for organizing and categorizing notes',
      },
    ],
  };
});

// Handle prompt retrieval
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'summarize_notes': {
      const tag = args?.tag as string | undefined;
      let filteredNotes = Array.from(notes.values());

      if (tag) {
        filteredNotes = filteredNotes.filter((note) => note.tags.includes(tag));
      }

      const notesText = filteredNotes
        .map((note) => `- ${note.title}: ${note.content}`)
        .join('\n');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please summarize the following notes${tag ? ` tagged with "${tag}"` : ''}:\n\n${notesText}`,
            },
          },
        ],
      };
    }

    case 'organize_notes': {
      const allNotes = Array.from(notes.values());
      const notesText = allNotes
        .map((note) => `ID: ${note.id}\nTitle: ${note.title}\nContent: ${note.content}\nTags: ${note.tags.join(', ')}\n`)
        .join('\n---\n');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Here are all my notes:\n\n${notesText}\n\nPlease suggest:\n1. Better tags for organization\n2. Notes that could be merged\n3. Missing categories or topics`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

/**
 * START THE SERVER
 * Use stdio transport for communication (standard input/output)
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with the protocol
  console.error('Notes MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
