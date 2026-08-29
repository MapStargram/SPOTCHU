# SPOTCHU Research — scheduler PREFLIGHT.
# Runs `npm run research:doctor` and gates on "Real Backend Ready YES". No auto-retry, no auto-login.
# Exit 0 = safe to research. Exit 1 = do NOT start (reason printed: AUTH_REQUIRED / DOCTOR_FAIL).
[CmdletBinding()]
param([string]$RepoRoot = "")
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $d = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $PSCommandPath }; $RepoRoot = (Get-Item $d).Parent.Parent.FullName }
Set-Location $RepoRoot

$doctor = & npm run --silent research:doctor 2>&1 | Out-String
Write-Output $doctor

if ($doctor -match "Real Backend Ready\s+YES") {
  Write-Output "PREFLIGHT: PASS"
  exit 0
}

# Classify the failure so the operator knows whether a one-time interactive login is needed.
$reason = "DOCTOR_FAIL"
if ($doctor -match "Antigravity Auth\s+(UNKNOWN|FAIL)" -or $doctor -match "Codex Auth\s+FAIL") {
  $reason = "AUTH_REQUIRED"
}
Write-Warning "PREFLIGHT: FAIL ($reason) — research NOT started. No automatic retry or login."
if ($reason -eq "AUTH_REQUIRED") {
  Write-Warning "Operator action: run 'agy' once and sign in with Google (populates Windows Credential Manager), and/or 'codex login'. Then re-run."
}
exit 1
