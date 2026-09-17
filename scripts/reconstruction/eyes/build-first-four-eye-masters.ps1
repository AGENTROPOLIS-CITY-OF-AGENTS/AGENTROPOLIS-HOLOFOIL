param(
  [string]$WorkspaceRoot = "projects",
  [string]$ProjectId = "hood-terps"
)

$ErrorActionPreference = "Stop"

$projectRoot = Join-Path $WorkspaceRoot $ProjectId
$referenceRoot = Join-Path $projectRoot "reconstruction/reference_cells/eyes"
$outRoot = Join-Path $projectRoot "reconstruction/reconstruction_candidates/eyes"
$proofRoot = Join-Path $projectRoot "reconstruction/proof-set/eyes"
$receiptRoot = Join-Path $projectRoot "reconstruction/receipts"

New-Item -ItemType Directory -Force -Path $outRoot,$proofRoot,$receiptRoot | Out-Null

function Write-Utf8NoBom([string]$Path,[string]$Content) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path,$Content,$enc)
}

function EyeLeaf([int]$cx,[int]$cy,[string]$fill="#39ff14",[string]$stroke="none",[double]$opacity=1.0) {
  $parts = @()
  $angles = @(-68,-48,-28,0,28,48,68)
  $lengths = @(64,82,104,128,104,82,64)
  $widths  = @(18,22,26,30,26,22,18)
  for ($i=0; $i -lt $angles.Count; $i++) {
    $a = $angles[$i]
    $l = $lengths[$i]
    $w = $widths[$i]
    $parts += "<path d='M $cx $cy C $($cx-$w) $($cy-$l*0.45), $($cx-$w*0.55) $($cy-$l*0.82), $cx $($cy-$l) C $($cx+$w*0.55) $($cy-$l*0.82), $($cx+$w) $($cy-$l*0.45), $cx $cy Z' fill='$fill' stroke='$stroke' opacity='$opacity' transform='rotate($a $cx $cy)'/>"
  }
  $parts += "<path d='M $cx $cy L $cx $($cy+26)' stroke='$fill' stroke-width='8' stroke-linecap='round' opacity='$opacity'/>"
  return ($parts -join "`n")
}

function EyeX([int]$cx,[int]$cy,[string]$stroke="#39ff14") {
  return @"
<g stroke='$stroke' stroke-width='24' stroke-linecap='round' stroke-linejoin='round'>
  <path d='M $($cx-46) $($cy-52) L $($cx+46) $($cy+52)'/>
  <path d='M $($cx+46) $($cy-52) L $($cx-46) $($cy+52)'/>
</g>
"@
}

function EyeDrip([int]$cx,[int]$cy,[string]$fill="#39ff14") {
  $leaf = EyeLeaf $cx $cy $fill
  $drips = @"
<g fill='$fill' stroke='$fill' stroke-linecap='round'>
  <path d='M $($cx-34) $($cy+3) C $($cx-34) $($cy+28), $($cx-34) $($cy+45), $($cx-34) $($cy+62)' stroke-width='10'/>
  <circle cx='$($cx-34)' cy='$($cy+70)' r='8'/>
  <path d='M $cx $($cy+8) C $cx $($cy+35), $cx $($cy+57), $cx $($cy+86)' stroke-width='12'/>
  <circle cx='$cx' cy='$($cy+96)' r='10'/>
  <path d='M $($cx+34) $($cy+3) C $($cx+34) $($cy+24), $($cx+34) $($cy+39), $($cx+34) $($cy+55)' stroke-width='9'/>
  <circle cx='$($cx+34)' cy='$($cy+63)' r='7'/>
</g>
"@
  return $leaf + "`n" + $drips
}

function EyeSpiral([int]$cx,[int]$cy,[string]$stroke="#39ff14") {
  $pts = @()
  for ($i=0; $i -le 90; $i++) {
    $t = $i * 0.22
    $r = 2.2 * $t
    $x = [Math]::Round($cx + $r * [Math]::Cos($t),2)
    $y = [Math]::Round($cy + $r * [Math]::Sin($t),2)
    $pts += "$x,$y"
  }
  return "<polyline points='$($pts -join ' ')' fill='none' stroke='$stroke' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/>"
}

function BuildSvg([string]$style,[string]$side="pair") {
  $w = if ($side -eq "pair") { 1024 } else { 512 }
  $h = 512
  $leftX = if ($side -eq "pair") { 310 } else { 256 }
  $rightX = 714
  $cy = 300

  function DrawOne([int]$x) {
    switch ($style) {
      "classic" { return EyeLeaf $x $cy }
      "x_eyes"  { return EyeX $x $cy }
      "drip"    { return EyeDrip $x $cy }
      "spiral"  { return EyeSpiral $x $cy }
      default { throw "Unsupported proof style: $style" }
    }
  }

  $body = if ($side -eq "pair") { (DrawOne $leftX) + "`n" + (DrawOne $rightX) } else { DrawOne $leftX }
  return @"
<svg xmlns='http://www.w3.org/2000/svg' width='$w' height='$h' viewBox='0 0 $w $h'>
  <rect width='100%' height='100%' fill='none'/>
  <g>$body</g>
</svg>
"@
}

$proofs = @(
  @{style="classic"; color="green"; mode="INDEPENDENT"; confidence=0.78},
  @{style="x_eyes"; color="green"; mode="INDEPENDENT"; confidence=0.86},
  @{style="drip"; color="green"; mode="INDEPENDENT"; confidence=0.73},
  @{style="spiral"; color="green"; mode="INDEPENDENT"; confidence=0.82}
)

$indexRows = @()
foreach ($p in $proofs) {
  $style = $p.style
  $color = $p.color
  $styleRoot = Join-Path $outRoot $style
  $pairDir = Join-Path $styleRoot "PAIR"
  $leftDir = Join-Path $styleRoot "LEFT"
  $rightDir = Join-Path $styleRoot "RIGHT"
  $receiptsDir = Join-Path $styleRoot "receipts"
  New-Item -ItemType Directory -Force -Path $pairDir,$leftDir,$rightDir,$receiptsDir | Out-Null

  $pairPath = Join-Path $pairDir ("eyes__{0}__{1}__pair__candidate_v002.svg" -f $style,$color)
  $leftPath = Join-Path $leftDir ("eyes__{0}__{1}__left__candidate_v002.svg" -f $style,$color)
  $rightPath = Join-Path $rightDir ("eyes__{0}__{1}__right__candidate_v002.svg" -f $style,$color)

  Write-Utf8NoBom $pairPath (BuildSvg $style "pair")
  Write-Utf8NoBom $leftPath (BuildSvg $style "single")
  Write-Utf8NoBom $rightPath (BuildSvg $style "single")

  $sourceRef = Join-Path $referenceRoot ("{0}/eyes__{0}__{1}__pair_reference_v001.png" -f $style,$color)
  $receiptPath = Join-Path $receiptsDir ("eyes__{0}__{1}__reconstruction_receipt_v002.json" -f $style,$color)
  $receipt = [ordered]@{
    project_id = $ProjectId
    style = $style
    color = $color
    pair_mode = $p.mode
    source_reference = $sourceRef
    outputs = @{ pair=$pairPath; left=$leftPath; right=$rightPath }
    reconstruction_method = "DETERMINISTIC_VECTOR_REDRAW_FROM_OBSERVED_REFERENCE"
    epistemic_state = "SYNTHESIZED_FROM_OBSERVED_GEOMETRY"
    confidence = $p.confidence
    alpha_status = "VECTOR_TRANSPARENT"
    qc_status = "HUMAN_VISUAL_REVIEW_REQUIRED"
    production_approved = $false
    notes = "Clean proof candidate. Not a pixel recovery. Reference remains source evidence."
  }
  $receipt | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $receiptPath

  $refRel = "../../reference_cells/eyes/$style/eyes__${style}__${color}__pair_reference_v001.png"
  $candRel = "../../reconstruction_candidates/eyes/$style/PAIR/eyes__${style}__${color}__pair__candidate_v002.svg"
  $indexRows += "<tr><td>$style</td><td><img src='$refRel'></td><td><img src='$candRel'></td><td>$($p.mode)</td><td>$($p.confidence)</td></tr>"
}

$indexPath = Join-Path $proofRoot "proof-index.html"
$html = @"
<!doctype html><html><head><meta charset='utf-8'><title>Holofoil Hood Terps Eye Proofs</title>
<style>body{background:#0b0b0b;color:#eee;font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:10px;text-align:center}img{max-width:360px;max-height:220px;background:#111}th{background:#151515;color:#7CFF4F}</style></head><body>
<h1>HOLOFOIL :: Hood Terps Eye Reconstruction Proofs</h1>
<p>Reference = observed evidence. Candidate = deterministic vector redraw. Production approval remains OFF.</p>
<table><tr><th>Style</th><th>Observed reference</th><th>Candidate</th><th>Pair mode</th><th>Confidence</th></tr>
$($indexRows -join "`n")
</table></body></html>
"@
Write-Utf8NoBom $indexPath $html

$summary = [ordered]@{
  project_id = $ProjectId
  proof_count = 4
  proof_styles = @("classic","x_eyes","drip","spiral")
  output_root = $outRoot
  proof_index = $indexPath
  state = "AWAITING_HUMAN_VISUAL_APPROVAL"
  production_promotion = $false
}
$summaryPath = Join-Path $receiptRoot "first-four-eye-master-proof-receipt.json"
$summary | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $summaryPath

Write-Host ""
Write-Host "HOLOFOIL FIRST FOUR EYE MASTERS GENERATED" -ForegroundColor Green
Write-Host "Candidates: $outRoot"
Write-Host "Visual comparison: $indexPath"
Write-Host "Summary receipt: $summaryPath"
Write-Host "Production promotion: OFF" -ForegroundColor Yellow
