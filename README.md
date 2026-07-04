# Zor

Open-source AI coding agent for the terminal. Part of the Zor ecosystem: **Code** (terminal agent), **Cowork** (IDE integration), **Chat** (web UI).

27 LLM providers. Local models via Ollama. MCP support. Sub-agents.

## Quick Start

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/zor-ai/zor/main/install.sh | sh

# Set key
zor-code keys set opencode <your-api-key>

# Run
zor-code
```

## Providers

anthropic, openai, google, deepseek, openrouter, groq, mistral, xai, together, perplexity, cohere, cerebras, novita, nvidia, fireworks, deepinfra, minimax, moonshotai, zai, cloudflare, github-copilot, amazon-bedrock, azure-openai, google-vertex, ollama, opencode-go, opencode

## Slash Commands

| Command | Description |
|---|---|
| `/model <p/m>` | Switch model |
| `/use` | Interactive model picker |
| `/effort <l>` | Set effort (off/minimal/low/medium/high/xhigh) |
| `/keys list\|set\|remove` | Manage API keys |
| `/providers` | List providers |
| `/models` | List models |
| `/ollama` | Check Ollama |
| `/fork` | Branch session |
| `/tree` | Session tree |
| `/compact` | Force compaction |
| `/cost` | Token usage |
| `/status` | Active state |
| `/clear` | Clear screen |
| `/help` | Help |
| `/exit` | Exit |

## Build from Source

```bash
bun install
bun run build
bun run compile
```

## License

MIT
