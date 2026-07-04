# Zor

Open-source AI coding agent that runs in your terminal. Works with 27 LLM providers including Anthropic, OpenAI, Google Gemini, DeepSeek — plus local models via Ollama.

## Features

- **Multi-provider**: Switch between 27 AI providers on the fly
- **Local models**: Run with Ollama for fully offline use
- **Session persistence**: Auto-saves context, fork branches, continue later
- **Auto-compaction**: Stays within context windows without losing important context
- **Permission gates**: 3-tier security (auto/confirm/deny) for destructive commands
- **MCP support**: Connect to MCP servers for custom tool integrations
- **Sub-agents**: Spawn isolated agents for exploration, review, debugging, building
- **Slash commands**: `/effort`, `/model`, `/keys`, `/providers`, `/ollama`, `/compact`, and more
- **Sandbox mode**: Optional WSL2/Lima/Docker isolation for bash execution

## Quick Start

```bash
# Install via script
curl -fsSL https://raw.githubusercontent.com/zor-ai/zor/main/install.sh | sh

# Or build from source
bun install
bun run compile

# Set your API key
zor-code keys set anthropic sk-ant-xxxxxxxxxxxx

# Run
zor-code
```

## API Keys

Set keys via environment variables or the `/keys` command:

```bash
# Environment variables (recommended for CI)
export ANTHROPIC_API_KEY=sk-ant-xxxx
export OPENAI_API_KEY=sk-xxxx
export GOOGLE_API_KEY=xxxx
export DEEPSEEK_API_KEY=sk-xxxx
export GROQ_API_KEY=gsk_xxxx
export COHERE_API_KEY=xxxx

# Or store securely (stored in ~/.zor/keys.json)
zor-code keys set anthropic sk-ant-xxxx
zor-code keys list
zor-code keys remove openai
```

## Configuration

Create a `zor.json` in your project root or `~/.zor/zor.json`:

```json
{
  "model": "anthropic/claude-sonnet-4-20250514",
  "effort": "high",
  "permissions": "confirm",
  "session": {
    "dir": "./.zor/sessions",
    "compactThreshold": 160000
  },
  "mcp": {
    "servers": []
  }
}
```

### Switching Models

Use `provider/model` format:

```bash
# In TUI:
/model anthropic/claude-sonnet-4-20250514
/model openai/gpt-5
/model google/gemini-2.5-pro
/model deepseek/deepseek-chat
/model ollama/qwen2.5-coder:14b
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/effort <level>` | Set thinking effort (off/low/medium/high/xhigh) |
| `/model <target>` | Switch model (provider/model format) |
| `/keys list` | Show API key status for all providers |
| `/keys set <p> <k>` | Store an API key |
| `/keys remove <p>` | Remove a stored key |
| `/providers` | List all supported providers |
| `/models` | List all available models |
| `/ollama` | Check Ollama status and local models |
| `/fork` | Branch current session |
| `/tree` | Show session tree |
| `/cost` | Show token usage |
| `/compact` | Force context compaction |
| `/status` | Show current model, effort, and tools |
| `/clear` | Clear screen |
| `/help` | Show help |

## Supported Providers

| Provider | API Type | Env Variable |
|----------|----------|-------------|
| Anthropic | anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | openai | `OPENAI_API_KEY` |
| Google Gemini | google | `GOOGLE_API_KEY` |
| DeepSeek | openai | `DEEPSEEK_API_KEY` |
| OpenRouter | openai | `OPENROUTER_API_KEY` |
| Groq | openai | `GROQ_API_KEY` |
| Mistral | openai | `MISTRAL_API_KEY` |
| xAI (Grok) | openai | `XAI_API_KEY` |
| Together | openai | `TOGETHER_API_KEY` |
| Perplexity | openai | `PERPLEXITY_API_KEY` |
| Cohere | openai | `COHERE_API_KEY` |
| Cerebras | openai | `CEREBRAS_API_KEY` |
| Fireworks | openai | `FIREWORKS_API_KEY` |
| DeepInfra | openai | `DEEPINFRA_API_KEY` |
| NVIDIA NIM | openai | `NVIDIA_API_KEY` |
| Novita | openai | `NOVITA_API_KEY` |
| MiniMax | openai | `MINIMAX_API_KEY` |
| Ollama (local) | ollama | - |

## Local Models (Ollama)

```bash
# Install Ollama: https://ollama.com
ollama pull qwen2.5-coder:14b

# Run Zor Code (auto-detects Ollama)
zor-code

# In TUI:
/ollama    # List local models
/model ollama/qwen2.5-coder:14b
```

## MCP Servers

Configure MCP servers in `zor.json`:

```json
{
  "mcp": {
    "servers": [
      "{\"transport\": \"stdio\", \"command\": \"npx\", \"args\": [\"@modelcontextprotocol/server-filesystem\", \".\"]}"
    ]
  }
}
```

## Development

```bash
git clone https://github.com/zor-ai/zor
cd zor/packages/zor-code
bun install

# Run in dev mode
bun run dev

# Build JavaScript bundle
bun run build

# Compile to single binary
bun run compile

# Type-check
npx tsc --noEmit
```

## Architecture

```
zor-code/
├── src/
│   ├── main.tsx                Ink TUI entry point
│   ├── config.ts               Config schema + defaults
│   ├── config/loader.ts        Load zor.json
│   ├── agent/
│   │   ├── create.ts           Agent factory
│   │   ├── tools.ts            Tool registry (core + MCP + sub-agent)
│   │   ├── tools/search.ts     Web search lazy tool
│   │   ├── subagent.ts         Task sub-agent system
│   │   └── system-prompt.ts    Cache-optimized system prompt
│   ├── commands/
│   │   └── slash-commands.ts   /commands implementation
│   ├── llm/
│   │   ├── providers.ts          27 provider registry
│   │   ├── keys.ts             API key management
│   │   ├── resolve.ts          Model resolution
│   │   └── ollama.ts           Ollama client
│   ├── mcp/
│   │   └── client.ts           MCP client (stdio/SSE)
│   ├── session/
│   │   ├── manager.ts          JSON session persistence
│   │   └── compact.ts          Context compaction
│   ├── permissions/
│   │   └── gate.ts             3-tier permission gate
│   └── sandbox/
│       └── sandbox.ts          WSL2/Lima/Docker isolation
├── dist/                       Build output
├── zor.json                    Default config
└── install.sh                  Unix installer
```

## License

MIT
