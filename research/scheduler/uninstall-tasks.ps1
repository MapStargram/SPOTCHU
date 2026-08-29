# SPOTCHU Research — scheduler UNINSTALLER. Removes the SPOTCHU\Research-* tasks.
# DRY-RUN by default; pass -Remove to actually delete.
[CmdletBinding()]
param([switch]$Remove)
$ErrorActionPreference = "Continue"
$names = @("SPOTCHU\Research-Daily-JP", "SPOTCHU\Research-Daily-KR", "SPOTCHU\Research-Global", "SPOTCHU\Research-QA")
Write-Output "SPOTCHU scheduler uninstaller  mode: $(if ($Remove) {'REMOVE'} else {'DRY-RUN'})`n"
foreach ($n in $names) {
  if (-not $Remove) {
    Write-Output "  would delete: schtasks /Delete /TN `"$n`" /F"
  } else {
    & schtasks.exe /Delete /TN $n /F
    Write-Output "  delete $n -> exit $LASTEXITCODE"
  }
}
if (-not $Remove) { Write-Output "`nDRY-RUN — nothing removed. Re-run with -Remove to delete." }
