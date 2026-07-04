param([string]$InstallDir = "$env:USERPROFILE\.zor")
$ErrorActionPreference = "Stop"
$BinDir = Join-Path $InstallDir "bin"

New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

# Install Bun if missing
$bun = Get-Command "bun" -ErrorAction SilentlyContinue
if (-not $bun) {
  $bunPath = "$env:USERPROFILE\.bun\bin\bun.exe"
  if (-not (Test-Path $bunPath)) {
    Write-Host "Installing Bun..." -ForegroundColor Cyan
    irm https://bun.sh/install.ps1 | iex
  }
}

# Install Zor Code via npm
Write-Host "Installing Zor Code..." -ForegroundColor Cyan
bun install -g zor-code@latest

# Create launcher
$wrapper = Join-Path $BinDir "zor-code.cmd"
@"
@echo off
bun run zor-code %*
"@ | Out-File -FilePath $wrapper -Encoding ASCII

$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$BinDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$currentPath;$BinDir", "User")
  Write-Host "Added $BinDir to User PATH" -ForegroundColor Yellow
}

$version = & bun zor-code --version 2>$null
if (-not $version) { $version = "latest" }
Write-Host @"

Zor Code installed! ($version)

Quick start:
  zor-code keys set opencode <your-key>
  zor-code

Type /help inside Zor Code for commands.
"@ -ForegroundColor Green
