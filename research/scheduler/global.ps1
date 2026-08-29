# SPOTCHU Research — scheduled GLOBAL discovery (real backend, budget-limited).
# Finds new countries/cities/viral spots into research/backlog (does NOT project app leads).
[CmdletBinding()]
param(
  [int]$Budget = 8,   # candidate budget cap for global discovery
  [string]$RepoRoot = ""
)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $d = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $PSCommandPath }; $RepoRoot = (Get-Item $d).Parent.Parent.FullName }
Set-Location $RepoRoot

$date = Get-Date -Format "yyyy-MM-dd"
$logDir = Join-Path $RepoRoot "research\logs\$date"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "global.log"
function Log($m) { "$([DateTime]::Now.ToString('s')) [global] $m" | Tee-Object -FilePath $log -Append }

Log "=== global discovery start (budget=$Budget) ==="
& (Join-Path $PSScriptRoot "preflight.ps1") -RepoRoot $RepoRoot *>> $log
if ($LASTEXITCODE -ne 0) { Log "ABORT: preflight failed — not started."; exit 1 }

$env:RESEARCH_BACKEND = "real"
$env:RESEARCH_GLOBAL_TARGET = "$Budget"

& npm run --silent research:global *>> $log
$code = $LASTEXITCODE
Log "=== global discovery done (exit=$code) ==="
exit $code
