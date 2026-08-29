# SPOTCHU Research — scheduler INSTALLER.
# Validates the runner, generates concrete task XML from the templates (injecting the CURRENT repo
# path so nothing is hardcoded), and by DEFAULT only DRY-RUNS. It registers for real ONLY with
# -Register, and even then uses `schtasks /RP *` so the OPERATOR types the account password — this
# script never sees, stores, or logs any credential.
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$User,   # runner Windows account, e.g. "RUNNERPC\spotchu" (see README §Task Scheduler security)
  [switch]$Register,                             # omit = dry-run (default). Present = actually register.
  [string]$JpTime = "03:00",
  [string]$KrTime = "03:30",
  [string]$GlobalTime = "04:30",
  [string]$QaTime = "06:00",
  [string]$RepoRoot = ""
)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $d = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $PSCommandPath }; $RepoRoot = (Get-Item $d).Parent.Parent.FullName }
Set-Location $RepoRoot
Write-Output "SPOTCHU scheduler installer  (repo: $RepoRoot)  mode: $(if ($Register) {'REGISTER'} else {'DRY-RUN'})`n"

# ---- 1) validate runner ----
function Need($cond, $msg) { if (-not $cond) { Write-Error "VALIDATION FAILED: $msg"; exit 1 } else { Write-Output "  ok: $msg" } }
Write-Output "Validating runner:"
Need (Test-Path (Join-Path $RepoRoot "package.json")) "repository present at $RepoRoot"
Need ([bool](Get-Command node -ErrorAction SilentlyContinue)) "node on PATH"
Need ([bool](Get-Command npm  -ErrorAction SilentlyContinue)) "npm on PATH"
Write-Output "  running research:doctor (agy/codex presence + auth + contracts + config)..."
$doctor = & npm run --silent research:doctor 2>&1 | Out-String
if ($doctor -notmatch "Real Backend Ready\s+YES") {
  Write-Output $doctor
  Write-Error "research:doctor did not report 'Real Backend Ready YES'. Fix the failing gate (see above) before installing."
  exit 1
}
Write-Output "  ok: research:doctor → Real Backend Ready YES`n"

# ---- 2) generate concrete task XML from templates ----
$genDir = Join-Path $PSScriptRoot "generated"
New-Item -ItemType Directory -Force -Path $genDir | Out-Null
$plan = @(
  @{ Name = "SPOTCHU\Research-Daily-JP"; Tpl = "daily.xml";  Time = $JpTime;     Country = "JP" },
  @{ Name = "SPOTCHU\Research-Daily-KR"; Tpl = "daily.xml";  Time = $KrTime;     Country = "KR" },
  @{ Name = "SPOTCHU\Research-Global";   Tpl = "global.xml"; Time = $GlobalTime; Country = "" },
  @{ Name = "SPOTCHU\Research-QA";       Tpl = "qa.xml";     Time = $QaTime;     Country = "" }
)
$generated = @()
foreach ($t in $plan) {
  $xml = Get-Content (Join-Path $PSScriptRoot "tasks\$($t.Tpl)") -Raw
  $xml = $xml.Replace("{{USER}}", $User).Replace("{{REPO}}", $RepoRoot).Replace("{{TIME}}", $t.Time).Replace("{{COUNTRY}}", $t.Country)
  $safe = ($t.Name -replace '[\\/]', '_')
  $outXml = Join-Path $genDir "$safe.xml"
  # Task Scheduler XML must be UTF-16
  [System.IO.File]::WriteAllText($outXml, $xml, [System.Text.Encoding]::Unicode)
  $generated += @{ Name = $t.Name; Xml = $outXml; Time = $t.Time }
  Write-Output "  generated: $($t.Name)  @ $($t.Time)  -> $outXml"
}

# ---- 3) register (or dry-run) ----
Write-Output ""
if (-not $Register) {
  Write-Output "DRY-RUN — nothing was registered. Would create these Task Scheduler tasks as '$User':"
  foreach ($g in $generated) { Write-Output "  schtasks /Create /TN `"$($g.Name)`" /XML `"$($g.Xml)`" /RU `"$User`" /RP * /F   (runs daily @ $($g.Time))" }
  Write-Output "`nTo register for real, re-run with -Register (you will be prompted for the account password by schtasks)."
  exit 0
}

Write-Warning "REGISTER mode: creating scheduled tasks. schtasks will prompt for '$User' password (LogonType=Password, needed for Credential Manager access)."
foreach ($g in $generated) {
  Write-Output "Registering $($g.Name)..."
  & schtasks.exe /Create /TN $g.Name /XML $g.Xml /RU $User /RP * /F
  if ($LASTEXITCODE -ne 0) { Write-Error "Failed to register $($g.Name) (exit $LASTEXITCODE)"; exit 1 }
}
Write-Output "`nAll SPOTCHU research tasks registered. Verify with: schtasks /Query /TN SPOTCHU\Research-Daily-JP /V /FO LIST"
