# osc-mcp

MCP server for Open Sound Control (OSC). Send and receive OSC messages over UDP from any MCP client.

## Tools

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
| `OSC_REMOTE_PORT` | `57110` | UDP send port |

## Usage

Add to your MCP client config:

```json
{
  "mcpServers": {
    "osc": {
      "command": "bunx",
      "args": ["@daanrongen/osc-mcp"],
      "env": {
        "OSC_REMOTE_PORT": "57110"
      }
    }
  }
}
```

## Development

```sh
bun install
bun test
bun run lint
bun run typecheck
bun run build
```

## License

MIT
