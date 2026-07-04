# Security Policy

## Reporting a Vulnerability

Report security vulnerabilities to:

- **GitHub Issues**: [Create a security advisory](https://github.com/zor-ai/zor/security/advisories/new)

**Response time**: 48 hours for initial acknowledgment. Target fix within 7 days for critical issues.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | Yes |
| All previous | No |

**Only the latest commit on `main` receives security patches.** Tags and releases are cut from main.

## Scope

In-scope:
- API key storage (`~/.zor/keys.json`, `~/.zor/last-session.json`)
- Session file security (`~/.zor/sessions/`)
- Remote code execution via agent tools (bash, write, edit)
- MCP server communication security
- Dependency supply chain

Out-of-scope:
- Attacks requiring physical machine access
- Social engineering
- Issues in LLM provider APIs themselves

## Security Features

- **Key storage**: `~/.zor/keys.json` stored with `0o600`. Encryption at rest added in v0.2.0+
- **Session storage**: `~/.zor/sessions/*.jsonl` stored with `0o700` directory. Encrypted at rest.
- **Permission gate**: Three-tier (`auto/confirm/deny`) for destructive tools. Dangerous shell patterns (`rm -rf`, `mkfs`, `curl|sh`) always blocked.
- **Path traversal protection**: All file writes/reads validated to stay within project root.
- **SSRF protection**: MCP SSE URLs validated against internal/private networks.
- **Command allowlist**: Only `npx`, `node`, `python`, `python3`, `uvx`, `bun` allowed for MCP stdio servers.
- **Rate limiting**: Sliding window token bucket (60 req/min default).
- **Circuit breaker**: Per-provider failure tracking, auto-open on 3+ failures in 30s window.

## Disclosure

We follow responsible disclosure. Please give us reasonable time to fix before publishing.
