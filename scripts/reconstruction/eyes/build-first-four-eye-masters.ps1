param()

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "DISABLED: synthetic vector redraw is not valid for Holofoil canon reconstruction." -ForegroundColor Red
Write-Host "Reason: it deviates from source IP geometry and can create fake-looking mint assets." -ForegroundColor Yellow
Write-Host "Use execute-forensic-eye-reconstruction.ps1 instead." -ForegroundColor Green
Write-Host ""
exit 2
