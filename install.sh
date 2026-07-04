#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${HOME}/.zor"
BIN_DIR="${INSTALL_DIR}/bin"
mkdir -p "${BIN_DIR}"

# Install Bun if missing
if ! command -v bun &>/dev/null; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="${HOME}/.bun"
  export PATH="${BUN_INSTALL}/bin:${PATH}"
fi

# Install Zor Code via npm
echo "Installing Zor Code..."
bun install -g zor-code@latest

# Create launcher
WRAPPER="${BIN_DIR}/zor-code"
cat > "${WRAPPER}" << 'EOF'
#!/usr/bin/env bash
bun run zor-code "$@"
EOF
chmod +x "${WRAPPER}"

SHELL_NAME="$(basename "${SHELL}")"
case "${SHELL_NAME}" in
  zsh)  RC="${HOME}/.zshrc" ;;
  bash) RC="${HOME}/.bashrc" ;;
  fish) RC="${HOME}/.config/fish/config.fish" ;;
  *)    RC="${HOME}/.profile" ;;
esac

if [ "${SHELL_NAME}" = "fish" ]; then
  if ! grep -q "${BIN_DIR}" "${RC}" 2>/dev/null; then
    echo "set -gx PATH \$PATH ${BIN_DIR}" >> "${RC}"
  fi
else
  if ! grep -q "${BIN_DIR}" "${RC}" 2>/dev/null; then
    echo "export PATH=\"\$PATH:${BIN_DIR}\"" >> "${RC}"
  fi
fi

echo ""
echo "Zor Code installed!"
VERSION=$(bun zor-code --version 2>/dev/null || echo "latest")
echo "Version: $VERSION"
echo "Restart terminal or run: source ${RC}"
echo ""
echo "Quick start:"
echo "  zor-code keys set opencode <your-key>"
echo "  zor-code"
