# SPOTCHU Research — scheduled DAILY country research (real backend).
# One country per invocation (staggered tasks avoid overlap). Preflight-gated. Logs to research/logs.
# A failure here is isolated to this country's task and never corrupts other countries' data.
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Country,   # e.g. JP or KR
  [int]$TargetCount = 4,        # initial volume: 3-5 candidates/country/day
  [int]$Concurrency = 2,        # conservative; set 1 to serialize
  [int]$MaxFollowups = 2,
  [string]$RepoRoot = ""
)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $d = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $PSCommandPath }; $RepoRoot = (Get-Item $d).Parent.Parent.FullName }
Set-Location $RepoRoot

$date = Get-Date -Format "yyyy-MM-dd"
$logDir = Join-Path $RepoRoot "research\logs\$date"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "daily.log"
function Log($m) { "$([DateTime]::Now.ToString('s')) [$Country] $m" | Tee-Object -FilePath $log -Append }

Log "=== daily research start (country=$Country target=$TargetCount concurrency=$Concurrency) ==="

# Preflight gate — do not research if the backend is not ready.
& (Join-Path $PSScriptRoot "preflight.ps1") -RepoRoot $RepoRoot *>> $log
if ($LASTEXITCODE -ne 0) { Log "ABORT: preflight failed — not started (see log above)."; exit 1 }

# Real backend for scheduled runs; repo default stays mock.
$env:RESEARCH_BACKEND = "real"
$env:RESEARCH_TARGET_COUNT = "$TargetCount"
$env:RESEARCH_CONCURRENCY = "$Concurrency"
$env:RESEARCH_MAX_FOLLOWUPS = "$MaxFollowups"

& npm run --silent research:country -- $Country *>> $log
$code = $LASTEXITCODE
Log "=== daily research done (exit=$code) ==="
exit $code
