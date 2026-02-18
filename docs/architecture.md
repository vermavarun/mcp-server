# MCP Architecture Guide

This document provides a deep dive into the Model Context Protocol architecture and how this server implements it.

## 🏛️ Overall Architecture

```mermaid
graph TB
    subgraph "MCP Client (e.g., Claude Desktop)"
        Client[Client Application]
        ClientSDK[MCP Client SDK]
    end

    subgraph "Transport Layer"
        STDIO[stdio Transport]
    end

    subgraph "MCP Server (Notes Server)"
        ServerSDK[MCP Server SDK]
        Handler[Request Handlers]
        Logic[Business Logic]
        Storage[(In-Memory Storage)]
    end

    Client -->|Uses| ClientSDK
    ClientSDK <-->|JSON-RPC Messages| STDIO
    STDIO <-->|stdin/stdout| ServerSDK
    ServerSDK -->|Dispatches| Handler
    Handler -->|Executes| Logic
    Logic <-->|CRUD Operations| Storage

    style Client fill:#e1f5ff
    style ServerSDK fill:#fff4e1
    style Storage fill:#f0f0f0
```

## 🔄 Communication Flow

### 1. Server Initialization

```mermaid
sequenceDiagram
    participant Process as Parent Process
    participant Server as MCP Server
    participant Transport as stdio Transport

    Process->>Server: Start (node build/index.js)
    Server->>Server: Initialize Server instance
    Server->>Server: Register request handlers
    Server->>Transport: Create stdio transport
    Server->>Transport: Connect to transport
    Transport-->>Process: Ready (listening on stdio)

    Note over Server,Transport: Server is now ready to receive requests
```

### 2. Tool Discovery Flow

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Handler as Tool Handler

    Client->>Server: ListToolsRequest
    Note over Client,Server: JSON-RPC over stdio

    Server->>Handler: Route to ListToolsRequestSchema handler
    Handler->>Handler: Build tools list
    Handler-->>Server: Return tools array
    Server-->>Client: ListToolsResponse

    Note over Client: Client now knows available tools:<br/>create_note, list_notes, etc.
```

### 3. Tool Execution Flow

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Handler as Tool Handler
    participant Logic as Business Logic
    participant Storage as Data Store

    Client->>Server: CallToolRequest<br/>{name: "create_note", args: {...}}

    Server->>Handler: Route to CallToolRequestSchema handler
    Handler->>Handler: Validate tool name
    Handler->>Logic: Execute create_note function
    Logic->>Logic: Create Note object
    Logic->>Storage: Store note in Map
    Storage-->>Logic: Success
    Logic-->>Handler: Return result
    Handler-->>Server: Format response
    Server-->>Client: CallToolResponse<br/>{content: "Note created..."}
```

### 4. Resource Reading Flow

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Handler as Resource Handler
    participant Storage as Data Store

    Client->>Server: ReadResourceRequest<br/>{uri: "notes://all"}

    Server->>Handler: Route to ReadResourceRequestSchema handler
    Handler->>Handler: Parse URI
    Handler->>Storage: Fetch all notes
    Storage-->>Handler: Return notes array
    Handler->>Handler: Format as JSON
    Handler-->>Server: Build response
    Server-->>Client: ReadResourceResponse<br/>{contents: [...]}
```

## 🧱 Component Architecture

### Server Core

```mermaid
graph LR
    subgraph "Server Instance"
        Config[Server Config<br/>name, version]
        Caps[Capabilities<br/>tools, resources, prompts]
        Handlers[Request Handlers]
    end

    subgraph "SDK Features"
        Protocol[JSON-RPC Protocol]
        Validation[Schema Validation]
        Transport[Transport Layer]
    end

    Config --> Server
    Caps --> Server
    Handlers --> Server
    Server --> Protocol
    Protocol --> Validation
    Validation --> Transport

    style Server fill:#fff4e1
    style Transport fill:#e1f5ff
```

### Request Handler Architecture

```mermaid
graph TD
    Request[Incoming Request] --> Router{Request Type?}

    Router -->|ListTools| ListToolsHandler
    Router -->|CallTool| CallToolHandler
    Router -->|ListResources| ListResourcesHandler
    Router -->|ReadResource| ReadResourceHandler
    Router -->|ListPrompts| ListPromptsHandler
    Router -->|GetPrompt| GetPromptHandler

    ListToolsHandler --> Response[Format Response]
    CallToolHandler --> Execute[Execute Function]
    ListResourcesHandler --> Response
    ReadResourceHandler --> FetchData[Fetch Data]
    ListPromptsHandler --> Response
    GetPromptHandler --> BuildPrompt[Build Prompt]

    Execute --> Response
    FetchData --> Response
    BuildPrompt --> Response

    Response --> Return[Return to Client]

    style Router fill:#fff4e1
    style Response fill:#e1ffe1
```

## 📊 Data Flow

### Tool Invocation Data Flow

```mermaid
flowchart TD
    Start([User asks AI to create a note]) --> ClientParse[Client parses intent]
    ClientParse --> ToolSelect{Select appropriate tool}
    ToolSelect --> CreateNote[create_note]

    CreateNote --> BuildRequest[Build CallToolRequest]
    BuildRequest --> Validate[Validate against inputSchema]
    Validate --> Send[Send JSON-RPC message]

    Send --> ServerReceive[Server receives request]
    ServerReceive --> ServerValidate[Validate request format]
    ServerValidate --> Dispatch[Dispatch to handler]

    Dispatch --> Switch{Switch on tool name}
    Switch --> ExecuteCreate[Execute create_note logic]

    ExecuteCreate --> CreateID[Generate ID]
    CreateID --> BuildNote[Build Note object]
    BuildNote --> Store[Store in Map]
    Store --> BuildResponse[Build success response]

    BuildResponse --> SendResponse[Return response]
    SendResponse --> ClientReceive[Client receives response]
    ClientReceive --> Display([Display result to user])

    style Start fill:#e1f5ff
    style Display fill:#e1ffe1
    style ServerReceive fill:#fff4e1
```

## 🔌 Protocol Details

### JSON-RPC Message Format

MCP uses JSON-RPC 2.0 for all communication:

```mermaid
graph LR
    subgraph "Request"
        ReqJSON["{<br/>  'jsonrpc': '2.0',<br/>  'method': 'tools/call',<br/>  'params': {...},<br/>  'id': 1<br/>}"]
    end

    subgraph "Response"
        ResJSON["{<br/>  'jsonrpc': '2.0',<br/>  'result': {...},<br/>  'id': 1<br/>}"]
    end

    ReqJSON -->|stdio| ResJSON

    style ReqJSON fill:#fff4e1
    style ResJSON fill:#e1ffe1
```

### Tool Schema Structure

```mermaid
graph TD
    Tool[Tool Definition] --> Name[name: string]
    Tool --> Desc[description: string]
    Tool --> Schema[inputSchema: JSONSchema]

    Schema --> Type[type: object]
    Schema --> Props[properties: {...}]
    Schema --> Req[required: string[]]

    Props --> Prop1[title: string]
    Props --> Prop2[content: string]
    Props --> Prop3[tags: string[]]

    style Tool fill:#fff4e1
    style Schema fill:#e1f5ff
```

## 🏗️ Implementation Layers

```mermaid
graph TD
    subgraph "Layer 1: Protocol"
        JSONRPC[JSON-RPC 2.0]
        Schemas[Request/Response Schemas]
    end

    subgraph "Layer 2: SDK"
        Server[Server Class]
        Transport[Transport Interface]
        Handlers[Handler Registration]
    end

    subgraph "Layer 3: Application"
        Tools[Tool Implementations]
        Resources[Resource Providers]
        Prompts[Prompt Templates]
    end

    subgraph "Layer 4: Business Logic"
        NoteLogic[Note CRUD Operations]
        Search[Search Functionality]
        Validation[Data Validation]
    end

    subgraph "Layer 5: Storage"
        Memory[In-Memory Map]
        State[Application State]
    end

    JSONRPC --> Server
    Schemas --> Server
    Server --> Handlers
    Transport --> Server

    Handlers --> Tools
    Handlers --> Resources
    Handlers --> Prompts

    Tools --> NoteLogic
    Resources --> NoteLogic
    Prompts --> NoteLogic
    NoteLogic --> Search
    NoteLogic --> Validation

    NoteLogic --> Memory
    Search --> Memory
    Memory --> State

    style JSONRPC fill:#f0f0f0
    style Server fill:#fff4e1
    style Tools fill:#e1f5ff
    style NoteLogic fill:#ffe1e1
    style Memory fill:#e1ffe1
```

## 🔐 Security Considerations

```mermaid
graph TD
    Request[Incoming Request] --> Validate1{Valid JSON-RPC?}
    Validate1 -->|No| Reject1[Reject]
    Validate1 -->|Yes| Validate2{Known Method?}

    Validate2 -->|No| Reject2[Reject]
    Validate2 -->|Yes| Validate3{Valid Schema?}

    Validate3 -->|No| Reject3[Reject]
    Validate3 -->|Yes| Validate4{Authorized?}

    Validate4 -->|No| Reject4[Reject]
    Validate4 -->|Yes| Execute[Execute Handler]

    Execute --> TryCatch{Try/Catch}
    TryCatch -->|Error| ErrorResponse[Error Response]
    TryCatch -->|Success| SuccessResponse[Success Response]

    Reject1 --> ErrorResponse
    Reject2 --> ErrorResponse
    Reject3 --> ErrorResponse
    Reject4 --> ErrorResponse

    style Validate1 fill:#fff4e1
    style Validate2 fill:#fff4e1
    style Validate3 fill:#fff4e1
    style Validate4 fill:#fff4e1
    style ErrorResponse fill:#ffe1e1
    style SuccessResponse fill:#e1ffe1
```

## 🎯 Design Patterns Used

### 1. Handler Pattern
Each request type has a dedicated handler function registered with the SDK.

### 2. Schema Validation
JSON Schema validates all inputs before processing.

### 3. Error Boundaries
Try-catch blocks prevent crashes and return proper error responses.

### 4. Separation of Concerns
- Protocol layer (SDK)
- Business logic (our code)
- Data storage (Map)

### 5. Type Safety
TypeScript ensures type correctness throughout the codebase.

## 📈 Scaling Considerations

```mermaid
graph LR
    subgraph "Current: Single Process"
        Client1[Client] --> Server1[Server Process]
        Server1 --> Memory1[In-Memory Storage]
    end

    subgraph "Future: Distributed"
        Client2[Client] --> Server2[Server Process]
        Server2 --> Database[(Database)]
        Server2 --> Cache[(Redis Cache)]
        Server2 --> Queue[Message Queue]
    end

    style Memory1 fill:#fff4e1
    style Database fill:#e1f5ff
    style Cache fill:#e1ffe1
```

## 🔄 State Management

```mermaid
stateDiagram-v2
    [*] --> Idle: Server starts
    Idle --> Processing: Request received
    Processing --> Executing: Handler invoked
    Executing --> UpdateState: Modify data
    UpdateState --> BuildResponse: Create response
    BuildResponse --> Idle: Send response

    Processing --> Error: Invalid request
    Executing --> Error: Execution failed
    Error --> Idle: Send error response

    Idle --> [*]: Server stops
```

## 🧪 Testing Architecture

```mermaid
graph TD
    subgraph "Test Layers"
        Unit[Unit Tests<br/>Individual functions]
        Integration[Integration Tests<br/>Handler workflows]
        E2E[E2E Tests<br/>Full client-server]
    end

    subgraph "Test Tools"
        Mock[Mock Data]
        Client[Test Client]
        Assertions[Assertions]
    end

    Unit --> Mock
    Integration --> Client
    E2E --> Client

    Unit --> Assertions
    Integration --> Assertions
    E2E --> Assertions

    style Unit fill:#fff4e1
    style Integration fill:#e1f5ff
    style E2E fill:#e1ffe1
```

---

**Next**: Check out [concepts.md](concepts.md) for detailed explanations of MCP concepts, or [usage.md](usage.md) for practical examples!
