#!/usr/bin/env node

// List all available MCP tools from the Telegram bridge

const tools = [
  {
    name: 'telegram_notify',
    description: 'Send a notification to the user via Telegram. Use this to keep the user informed about progress, completion, warnings, or errors.',
    parameters: {
      message: 'string (required) - The notification message to send. Supports Markdown formatting.',
      priority: 'string (optional) - Priority level: info, success, warning, error, question. Default: info',
    }
  },
  {
    name: 'telegram_ask',
    description: 'Ask the user a question via Telegram and wait for their answer. This blocks until the user responds.',
    parameters: {
      question: 'string (required) - The question to ask the user. Supports Markdown formatting.',
      timeout: 'number (optional) - Timeout in milliseconds. Default: 300000 (5 minutes)',
    }
  },
  {
    name: 'telegram_get_messages',
    description: 'Retrieve unread messages from the user. Use this to check if the user has sent any messages.',
    parameters: {}
  },
  {
    name: 'telegram_reply',
    description: 'Send a reply to a user message via Telegram. Use after getting messages to respond to the user.',
    parameters: {
      message: 'string (required) - The reply message. Supports Markdown formatting.',
    }
  },
  {
    name: 'telegram_check_health',
    description: 'Check the health and status of the Telegram bridge. Returns connection status, unread message count, and pending questions.',
    parameters: {}
  },
];

console.log('📡 Telegram Bridge MCP Tools\n');
console.log('═'.repeat(60));

tools.forEach((tool, i) => {
  console.log(`\n${i + 1}. ${tool.name}`);
  console.log('   ' + tool.description);

  const paramKeys = Object.keys(tool.parameters);
  if (paramKeys.length > 0) {
    console.log('\n   Parameters:');
    paramKeys.forEach(key => {
      console.log(`   • ${key}: ${tool.parameters[key]}`);
    });
  } else {
    console.log('\n   Parameters: none');
  }
  console.log('');
});

console.log('═'.repeat(60));
console.log('\n💡 Usage: Claude automatically discovers these tools when');
console.log('   the MCP server is configured in your project.\n');
