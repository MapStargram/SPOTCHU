# SPOTCHU Research — scheduled daily QA SUMMARY.
# Aggregates the day's task ledger into research/reports/summary-<date>.md. Read-only; no secrets.
[CmdletBinding()]
param(
  [string]$Date = (Get-Date -Format "yyyy-MM-dd"),
  [string]$RepoRoot = ""
)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $d = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $PSCommandPath }; $RepoRoot = (Get-Item $d).Parent.Parent.FullName }
Set-Location $RepoRoot

$logDir = Join-Path $RepoRoot "research\logs\$Date"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "qa.log"
function Log($m) { "$([DateTime]::Now.ToString('s')) [qa] $m" | Tee-Object -FilePath $log -Append }

Log "=== daily QA summary for $Date ==="
& npm run --silent research:summary -- $Date *>> $log
$code = $LASTEXITCODE
Log "=== QA summary done (exit=$code) → research/reports/summary-$Date.md ==="
exit $code
