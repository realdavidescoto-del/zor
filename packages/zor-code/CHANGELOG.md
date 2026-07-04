# Changelog

## 0.2.0 — 2026-07-03

### Added
- Sub-agents now have tools: explorer/reviewer/debugger get read-only tools, builder gets full tools
- Interactive permission confirm mode: y/n prompts in TUI for destructive tool calls
- Sandbox isolation wired to Bash tool (opt-in via `"sandbox": true` in zor.json)
- 5 Git tools: GitStatus, GitDiff, GitLog, GitAdd, GitCommit
- `.zorrules` support: reads `~/.zor/rules.md`, `./.zor/rules.md`, `./ZOR.md`, `./.zorrules`
- Real tokenizer (tiktoken, cl100k_base encoder) for accurate token counting
- Website: favicon, Open Graph / Twitter Card meta tags, robots.txt, canonical URL

### Changed
- System prompt trimmed (~200 tokens saved), Git awareness + rules added to tool list
- Context compaction: extracts task, file changes, errors, key actions instead of static placeholder
- Install scripts: dynamic version detection instead of hardcoded `v0.1.0`
- All `zor.dev` references updated to `zor-ai.github.io/zor`
- Root README: install URL fixed, provider count corrected (19+ → 27)

### Fixed
- `install.ps1` missing `https://` on bun.sh install URL

## 0.1.0 — 2026-07-02

### Added
- 27 LLM providers: Anthropic, OpenAI, Google, DeepSeek, OpenRouter, Groq, Mistral, xAI, Together, Perplexity, Cohere, Cerebras, Novita, NVIDIA, Fireworks, DeepInfra, MiniMax, Moonshot AI, Hugging Face, Zhipu AI, Cloudflare, GitHub Copilot, Amazon Bedrock, Azure OpenAI, Google Vertex, Ollama, OpenCode Go
- Interactive TUI with Ink (React terminal)
- Slash commands: /model, /use, /keys, /providers, /models, /ollama, /effort, /fork, /tree, /cost, /compact, /status, /clear, /more, /help, /exit
- Session persistence with fork/tree branching
- Context compaction for long conversations
- MCP stdio + SSE client with SSRF protection
- Permission gate (auto/confirm/deny) for destructive operations
- Sub-agents: explorer, reviewer, debugger, builder
- Provider aliases: sonnet, opus, gpt5, flash, etc.
- Fuzzy model matching in /model
- Provider health ping
- Circuit breaker per provider
- Retry with exponential backoff
- Structured JSON logging
- Encrypted key + session storage (AES-256-GCM)
- WebSearch (Brave) + WebFetch tools
- Windows + Unix install scripts
- GitHub Actions CI (typecheck, build, test, compile) across 3 platforms
- GitHub Actions release workflow (auto on tag push)
