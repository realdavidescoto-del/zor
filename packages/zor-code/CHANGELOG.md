# Changelog

## 0.4.0 — 2026-07-09

### Added
- **Theme System** — 5 built-in themes (light, dark, monokai, solarized-dark, solarized-light), `ThemeProvider` wrapping App, `useThemeStyles()` hook used everywhere, hot-reload via config sync
- **Export Command** — `/export html|json|md` slash command, HTML template with light/dark CSS, session JSON serialization
- **Smart Steering** — Enter → interrupt, Alt+Enter → follow-up, footer hints showing keybindings
- **Status Bar** — `StatusBar` component with left/center/right slots, built-in overlays (context %, git branch, MCP status, token count), configurable via `statusBar` schema
- **Skills System** — `~/.zor/skills/*.md` with YAML frontmatter + `{{var}}` variable substitution, `/skill` command to load and execute
- **Custom Providers** — `~/.zor/models.json` merges into provider list, `getAllProviders()` lazy-loads custom provider configs
- **RPC Mode** — `--rpc` flag enables JSON-RPC 2.0 over stdin/stdout with 6 methods (initialize, prompt, interrupt, getStatus, setConfig, listTools)
- **Keybinding Presets** — 3 presets (default/vim/emacs), `loadKeybindings()` + `resolveKeybinding()` in `useInput`, file overrides via `~/.zor/keys.json`
- **Extension System** — `ExtensionHost` class with 7 registries (tools, commands, overlays, themes, keybindings, skills, providers), `loadExtensions()` from `~/.zor/extensions/*/manifest.json`, `mergeContributions()`
- **Spec-Kit Integration** — `/speckit.*` slash commands for spec-driven development workflow
- **Telemetry & Logging** — `FileSink` with rotation (by size + time, max N files), `configureLogger()`, `logging` config section in schema with level/file options
- **Auth/OAuth Token Storage** — `src/llm/auth.ts` with `getToken`/`setToken`/`removeToken`, token cache in `~/.zor/tokens.json` with `chmod 600`, resolved via `resolveAuthToken()` before env fallback
- **Sandbox Isolation** — `checkPathAccess()` + `checkHostAccess()` in dedicated module, `sandbox.allowPaths`/`denyPaths`/`allowHosts`/`denyHosts` config, wired to Read/Write/Edit/Ls/Glob/Grep/WebFetch tools
- **Session Replay** — `/replay <sessionId> [--strict]` command, loads session from manager, replays against original model, compares messages, reports diffs or passes
- **Config Validation** — TypeBox `Value.Check` + `Value.Errors` validate user config at load time
- **CI Typecheck Step** — added `bun run typecheck` to GitHub Actions CI workflow

### Changed
- All API key env var references hardened — keys resolved via auth cache → env → config
- Slash commands refactored: `/keys` command now supports `list`/`set`/`remove`, improved `/cost` token display
- Session storage now encrypted with AES-256-GCM
- `.gitignore` hardened — added `*.err`, `.opencode/` patterns
- Removed unused circuit-breaker, rate-limiter, retry utilities (moved to provider-level handling)
- `bun.lock` updated with latest dependency resolutions

### Fixed
- Google API key removed from `opencode.json` (replaced with `{env:GOOGLE_API_KEY}`)
- Nested git repo issue resolved — project repo is now standalone
- `err.txt` empty debris file deleted
- CRLF line endings normalized across source files
- `setRawMode` failures on Windows terminals silently caught

## 0.3.0 — 2026-07-06

### Added
- /speckit.* slash commands for spec-driven development

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
