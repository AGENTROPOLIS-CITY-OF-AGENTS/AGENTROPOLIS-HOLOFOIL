param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [string]$WorkspaceRoot = "projects"
)

$ErrorActionPreference = "Stop"
$ProjectId = "hood-terps"

Write-Host ""
Write-Host "HOLOFOIL :: HOOD TERPS EYE RECONSTRUCTION PROOF" -ForegroundColor Cyan
Write-Host "Project IP: Hood Terps"
Write-Host "System: Holofoil"
Write-Host "Vault target: ARCANA54 project state"
Write-Host "Production promotion: OFF"
Write-Host ""

& "$PSScriptRoot/prepare-eye-reference-cells.ps1" -InputPath $InputPath -ProjectId $ProjectId -WorkspaceRoot $WorkspaceRoot
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$projectRoot = Join-Path $WorkspaceRoot $ProjectId
$proofRoot = Join-Path $projectRoot "reconstruction/proof-set/eyes"
New-Item -ItemType Directory -Force -Path $proofRoot | Out-Null

$proofs = @(
  @{ style="classic"; color="green" },
  @{ style="x_eyes"; color="green" },
  @{ style="drip"; color="green" },
  @{ style="spiral"; color="green" }
)

$queue = @()
foreach ($proof in $proofs) {
  $reference = Join-Path $projectRoot ("reconstruction/reference_cells/eyes/{0}/eyes__{0}__{1}__pair_reference_v001.png" -f $proof.style,$proof.color)
  $queue += [pscustomobject]@{
    project_id = $ProjectId
    style = $proof.style
    color = $proof.color
    source_reference = $reference
    required_outputs = @("PAIR","CLASSIFICATION","LEFT_RIGHT_IF_ALLOWED","COMPARISON","TRANSPARENCY_CHECK","RECEIPT","QC")
    pair_mode = "UNCLASSIFIED"
    epistemic_state = "OBSERVED_REFERENCE"
    human_approval_required = $true
    production_approved = $false
    status = "READY_FOR_RECONSTRUCTION_RUNTIME"
  }
}

$queuePath = Join-Path $proofRoot "proof-queue.json"
$queue | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $queuePath

Write-Host ""
Write-Host "REFERENCE PREP COMPLETE. FOUR-PROOF QUEUE CREATED." -ForegroundColor Green
Write-Host "Queue: $queuePath"
Write-Host ""
Write-Host "STOP GATE: no asset may enter canonical/traits until reconstruction runtime + QC + human approval complete." -ForegroundColor Yellow
Write-Host "Founder delivery ZIP is generated only from approved canonical project state." -ForegroundColor Yellow
