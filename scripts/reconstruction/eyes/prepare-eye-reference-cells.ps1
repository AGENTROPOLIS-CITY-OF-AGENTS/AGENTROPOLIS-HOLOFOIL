param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [string]$ProjectId = "hood-terps",
  [string]$WorkspaceRoot = "projects"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$styles = @("classic","glow","sleepy","x_eyes","angry","drip","outline","spiral")
$colors = @("green","lime","yellow","orange","red","pink","purple","blue","ice_blue","teal","white","gold","multi_color")

if (-not (Test-Path $InputPath)) { throw "Input reference sheet not found: $InputPath" }

$projectRoot = Join-Path $WorkspaceRoot $ProjectId
$intakeRoot = Join-Path $projectRoot "intake/reference_only"
$outputRoot = Join-Path $projectRoot "reconstruction/reference_cells/eyes"
$receiptRoot = Join-Path $projectRoot "reconstruction/receipts"

New-Item -ItemType Directory -Force -Path $intakeRoot,$outputRoot,$receiptRoot | Out-Null

$sourceName = Split-Path -Leaf $InputPath
$vaultSource = Join-Path $intakeRoot $sourceName
Copy-Item -Force $InputPath $vaultSource

$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path $vaultSource))
try {
  $dataLeft = [int][Math]::Round($img.Width * 0.1126)
  $dataRight = [int][Math]::Round($img.Width * 0.9915)
  $dataTop = [int][Math]::Round($img.Height * 0.1270)
  $dataBottom = [int][Math]::Round($img.Height * 0.9580)
  $cellW = ($dataRight - $dataLeft) / 13.0
  $cellH = ($dataBottom - $dataTop) / 8.0

  $manifest = @()

  for ($r = 0; $r -lt 8; $r++) {
    for ($c = 0; $c -lt 13; $c++) {
      $style = $styles[$r]
      $color = $colors[$c]
      $cellX = [int][Math]::Round($dataLeft + ($c * $cellW))
      $cellY = [int][Math]::Round($dataTop + ($r * $cellH))
      $cw = [int][Math]::Round($cellW)
      $ch = [int][Math]::Round($cellH)

      $innerX = $cellX + [int][Math]::Round($cw * 0.08)
      $innerY = $cellY + [int][Math]::Round($ch * 0.06)
      $innerW = [int][Math]::Round($cw * 0.84)
      $innerH = [int][Math]::Round($ch * 0.56)
      $rect = New-Object System.Drawing.Rectangle($innerX,$innerY,$innerW,$innerH)

      $dir = Join-Path $outputRoot $style
      New-Item -ItemType Directory -Force -Path $dir | Out-Null
      $out = Join-Path $dir ("eyes__{0}__{1}__pair_reference_v001.png" -f $style,$color)

      $crop = New-Object System.Drawing.Bitmap($rect.Width,$rect.Height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $g = [System.Drawing.Graphics]::FromImage($crop)
        try { $g.DrawImage($img,0,0,$rect,[System.Drawing.GraphicsUnit]::Pixel) }
        finally { $g.Dispose() }
        $crop.Save($out,[System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $crop.Dispose() }

      $manifest += [pscustomobject]@{
        project_id = $ProjectId
        style = $style
        color = $color
        reference = $out
        epistemic_state = "OBSERVED_REFERENCE"
        pair_mode = "UNCLASSIFIED"
        allowed_pair_modes = @("INDEPENDENT","PAIRED","SPLITTABLE_PAIR")
        source = $vaultSource
        reconstruction_required = $true
        human_classification_required = $true
        production_approved = $false
      }
    }
  }

  $manifestPath = Join-Path $outputRoot "eye-reference-manifest.json"
  $manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $manifestPath

  $receipt = [pscustomobject]@{
    project_id = $ProjectId
    operation = "PREPARE_EYE_REFERENCE_CELLS"
    source_original = $InputPath
    source_vault_copy = $vaultSource
    output_root = $outputRoot
    cells = 104
    left_right_split_performed = $false
    state = "OBSERVED_REFERENCE"
    next_gate = "CLASSIFY_PAIR_MODE_AND_RECONSTRUCT"
  }
  $receiptPath = Join-Path $receiptRoot "eye-reference-prep-receipt.json"
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $receiptPath

  Write-Host ""
  Write-Host "HOLOFOIL WHOLE-CELL EYE REFERENCE PASS COMPLETE" -ForegroundColor Green
  Write-Host "Project: $ProjectId"
  Write-Host "Vault copy: $vaultSource"
  Write-Host "Whole reference cells: 104"
  Write-Host "Output: $outputRoot"
  Write-Host "Manifest: $manifestPath"
  Write-Host "Receipt: $receiptPath"
  Write-Host "NO LEFT/RIGHT SPLIT WAS PERFORMED." -ForegroundColor Cyan
}
finally { $img.Dispose() }
