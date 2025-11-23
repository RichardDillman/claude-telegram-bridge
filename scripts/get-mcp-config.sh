#!/bin/bash
# Quick script to generate MCP config for this bridge

BRIDGE_PATH=$(cd "$(dirname "$0")/.." && pwd)

cat <<EOF
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": [
        "$BRIDGE_PATH/dist/mcp-server.js"
      ],
      "env": {
        "TELEGRAM_BRIDGE_URL": "http://localhost:3456"
      }
    }
  }
}
EOF
