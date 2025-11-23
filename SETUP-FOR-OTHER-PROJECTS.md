# Using Telegram Bridge in Other Claude Projects

## Quick Setup (Recommended)

### Option 1: Global Installation (Use Anywhere)

Install once, use in any Claude project:

```bash
# Install globally
cd /path/to/claude-telegram-bridge
pnpm install
pnpm build

# Start the bridge (leave running)
pnpm daemon
```

Then in **any project**, add to MCP config:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/path/to/claude-telegram-bridge/dist/mcp-server.js"]
    }
  }
}
```

### Option 2: Per-Project Installation

Install as a dependency in your project:

```bash
# In your project directory
cd your-project
pnpm add github:RichardDillman/claude-telegram-bridge

# The bridge needs to run separately
cd node_modules/claude-telegram-bridge
pnpm daemon
```

Add to your project's `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["./node_modules/claude-telegram-bridge/dist/mcp-server.js"]
    }
  }
}
```

### Option 3: Environment Variable (Most Flexible)

Set an environment variable once:

```bash
# Add to your ~/.bashrc or ~/.zshrc
export TELEGRAM_BRIDGE_PATH="/path/to/claude-telegram-bridge"
```

Then in any project's MCP config:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["$TELEGRAM_BRIDGE_PATH/dist/mcp-server.js"]
    }
  }
}
```

## MCP Configuration Locations

Depending on where you're using Claude:

### Claude Code (CLI)
Create `.claude/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/absolute/path/to/claude-telegram-bridge/dist/mcp-server.js"],
      "env": {
        "TELEGRAM_BRIDGE_URL": "http://localhost:3456"
      }
    }
  }
}
```

### Claude Desktop (Global)
Edit `~/.config/claude-code/settings/mcp.json`

### VS Code Extension
Edit workspace `.vscode/mcp.json`

## The Bridge Must Be Running!

**Important:** The HTTP bridge must be running for the MCP server to work:

```bash
# Start once, use from all projects
cd /path/to/claude-telegram-bridge
pnpm daemon

# Check it's running
curl http://localhost:3456/health
```

## Available Tools in Any Project

Once configured, Claude in **any project** can use:

- `telegram_notify` - Send notifications
- `telegram_ask` - Ask questions and wait for answers
- `telegram_get_messages` - Check for messages
- `telegram_reply` - Reply to messages
- `telegram_check_health` - Verify bridge is working

## Example: Using in Multiple Projects

```
~/projects/
├── claude-telegram-bridge/     ← Install once
│   └── pnpm daemon              ← Keep running
│
├── project-a/
│   └── .claude/mcp.json         ← Points to bridge
│
├── project-b/
│   └── .claude/mcp.json         ← Points to same bridge
│
└── project-c/
    └── .claude/mcp.json         ← Points to same bridge
```

All three projects share the **same** Telegram bridge instance!

## Testing the Setup

In any project with the MCP configured, tell Claude:

> "Send me a test notification via Telegram"

Claude will automatically discover and use the `telegram_notify` tool.

## Pro Tip: Project-Specific MCP Configs

Create `.claude/mcp.json` in each project that needs Telegram:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/Users/you/claude-telegram-bridge/dist/mcp-server.js"]
    }
  }
}
```

Add `.claude/` to your `.gitignore` if you don't want to commit MCP configs.

## Troubleshooting

**"Telegram bridge not available"**
- Is the bridge running? `curl http://localhost:3456/health`
- Is the path correct in mcp.json? Use `pwd` to verify

**"Tool not found"**
- Restart Claude Code after adding MCP config
- Check: `ls /path/to/claude-telegram-bridge/dist/mcp-server.js`

**"Connection refused"**
- Start the bridge: `pnpm daemon`
- Verify: `pnpm logs`
