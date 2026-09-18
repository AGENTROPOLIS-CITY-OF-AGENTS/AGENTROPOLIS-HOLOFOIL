param(
    [Parameter(Mandatory = $true)]
    [string]$ReferenceCellsRoot,

    [string]$WorkspaceRoot = '.\projects',
    [string]$Project = 'hood-terps',
    [string]$PythonExe = 'python'
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$PyScript = Join-Path $RepoRoot 'scripts\reconstruction\eyes\python\forensic_reconstruct_eyes.py'

if (!(Test-Path $PyScript)) {
    throw "Missing python script: $PyScript"
}

$ReconstructionRoot = Join-Path $WorkspaceRoot "$Project\reconstruction"
$CandidateRoot = Join-Path $ReconstructionRoot 'forensic_candidates\eyes'
$QcRoot = Join-Path $ReconstructionRoot 'qc\eyes'
$ReceiptRoot = Join-Path $ReconstructionRoot 'receipts'

New-Item -ItemType Directory -Force $CandidateRoot | Out-Null
New-Item -ItemType Directory -Force $QcRoot | Out-Null
New-Item -ItemType Directory -Force $ReceiptRoot | Out-Null

Write-Host ''
Write-Host 'HOLOFOIL :: FORENSIC EYE RECONSTRUCTION' -ForegroundColor Cyan
Write-Host 'System: Holofoil'
Write-Host 'Vault target: ARCANA54 project state'
Write-Host "Project payload: $Project"
Write-Host 'Mode: source-faithful extraction'
Write-Host 'Synthetic redraw: OFF'
Write-Host 'Production promotion: OFF'
Write-Host ''

& $PythonExe $PyScript `
    --input-root $ReferenceCellsRoot `
    --candidate-root $CandidateRoot `
    --qc-root $QcRoot `
    --receipt-root $ReceiptRoot `
    --project $Project

if ($LASTEXITCODE -ne 0) {
    throw "Python reconstruction failed with exit code $LASTEXITCODE"
}

Write-Host ''
Write-Host 'STOP GATE ACTIVE' -ForegroundColor Yellow
Write-Host 'No asset may enter canonical traits until human QC approves it.'
Write-Host 'Founder ZIP may only be generated from approved canonical state.'
Write-Host ''
Write-Host "Candidates: $CandidateRoot"
Write-Host "QC proofs:  $QcRoot"
Write-Host "Receipts:   $ReceiptRoot"