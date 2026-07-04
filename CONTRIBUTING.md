# Contributing to Zor

## Setup

```bash
git clone https://github.com/zor-ai/zor.git
cd zor
bun install
```

## Development

```bash
# Run TUI (watch mode)
bun run --filter zor-code dev

# Run tests
bun run --filter zor-code test

# Watch tests
bun run --filter zor-code test:watch

# Type check
bun run --filter zor-code typecheck

# Build
bun run --filter zor-code build

# Compile to binary
bun run --filter zor-code compile
```

## Project Structure

```
zor/
├── packages/
│   └── zor-code/           # Core application
│       └── src/
│           ├── main.tsx    # TUI entry point (Ink)
│           ├── agent/      # Agent factory, system prompt, tools, sub-agents
│           ├── commands/   # Slash command implementations
│           ├── config/     # Config loader, schema
│           ├── llm/        # Providers, keys, model resolution, session state, Ollama
│           ├── mcp/        # MCP client (stdio + SSE)
│           ├── permissions/# Permission gate (auto/confirm/deny)
│           ├── sandbox/    # Sandbox exec (WSL2/Lima/Docker)
│           ├── session/    # Session manager, compaction
│           ├── utils/      # Logger, rate limiter, retry, circuit breaker
│           └── __tests__/  # Unit tests + E2E tests
├── .github/workflows/      # CI + release workflows
├── install.sh              # Unix installer
├── install.ps1             # Windows installer
└── build.ts                # Root build script
```

## Code Style

- TypeScript
- No comments (code should be self-documenting)
- Use `@earendil-works/pi-agent-core` and `@earendil-works/pi-ai` APIs, not raw HTTP
- Follow existing patterns for tool definitions, provider configs, and TUI components
- Prefer `async/await` over promises

## Testing

- **Vitest** for all tests
- Test files: `src/**/__tests__/**/*.test.ts`
- Mock external dependencies (`fs`, `child_process`, `pi-agent-core`, `pi-ai`)
- E2E tests: `src/__tests__/e2e/`

## Adding a Provider

1. Add entry to `src/llm/providers.ts` `PROVIDERS` array
2. Add provider ID to `knownProviders` in `src/agent/create.ts`
3. Update provider count test in `src/__tests__/providers.test.ts`

## Pull Requests

- Branch from `main`
- Run `bun run --filter zor-code test` before pushing
- Keep PR scope small (one feature/fix per PR)
- No code comments unless explaining a non-obvious workaround

## Commit Format

```
feat: add multi-provider fallback on failure
fix: Windows stdin raw-mode echo after readline
docs: add MCP configuration guide
test: E2E session lifecycle tests
refactor: extract logger to shared utility
```

## Questions

Open an issue on GitHub or start a discussion.
