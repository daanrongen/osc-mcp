# osc-mcp

MCP server for Open Sound Control (OSC). Send and receive OSC messages over UDP from any MCP client.

## Installation

```sh
bunx @daanrongen/osc-mcp
```

## Tools (4)

| Tool | Description |
|---|---|
| `send` | Send an OSC message to the configured remote address |
| `send_bundle` | Send a timed OSC bundle containing multiple messages |
| `listen` | Listen for incoming OSC messages on an address pattern |
| `status` | Get the current connection status |

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `OSC_LOCAL_ADDRESS` | `127.0.0.1` | UDP listen address |
| `OSC_LOCAL_PORT` | `57121` | UDP listen port |
| `OSC_REMOTE_ADDRESS` | `127.0.0.1` | UDP send address |
| `OSC_REMOTE_PORT` | `57110` | UDP send port (SuperCollider default) |

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "osc": {
      "command": "bunx",
      "args": ["@daanrongen/osc-mcp"],
      "env": {
        "OSC_REMOTE_ADDRESS": "127.0.0.1",
        "OSC_REMOTE_PORT": "57110"
      }
    }
  }
}
```

### Claude Code CLI

```sh
claude mcp add osc -- bunx @daanrongen/osc-mcp
```

## Development

```sh
bun install          # install dependencies
bun test             # run tests
bun run lint         # lint with biome
bun run format       # format with biome
bun run typecheck    # type-check with tsc
bun run build        # compile to dist/
bun run dev          # watch mode
```

## Inspecting locally

```sh
bun run build
bun run inspect      # opens MCP Inspector at localhost:5173
```

## Architecture

```
src/
├── config.ts                  # Effect Config: OSC env vars with defaults
├── main.ts                    # Entry point: wires MCP server + OSC layer
├── domain/
│   ├── errors.ts              # Tagged domain errors (OscError, ParseError)
│   ├── errors.test.ts
│   ├── models.ts              # OSC message and bundle schemas (Effect Schema)
│   ├── models.test.ts
│   ├── OscClient.ts           # OscClient service tag (port)
│   └── OscClient.test.ts
├── infra/
│   ├── OscClientLive.ts       # Live UDP adapter (osc npm package)
│   ├── OscClientTest.ts       # In-memory test adapter
│   └── OscClientTest.test.ts
├── mcp/
│   ├── server.ts              # MCP server setup (@modelcontextprotocol/sdk)
│   └── tools/
│       ├── listen.ts          # listen tool handler
│       ├── send.ts            # send + send_bundle tool handlers
│       └── status.ts          # status tool handler
└── types/
    └── osc.d.ts               # Type declarations for the osc npm package
```

## License

MIT
