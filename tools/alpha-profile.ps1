Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $PSScriptRoot '..\assets\botle-ice.png'))
$w = $bmp.Width; $h = $bmp.Height
Write-Host "size $w x $h"
$cols = 40
for ($i = 0; $i -lt $cols; $i++) {
  $x = [int](($w - 1) * $i / ($cols - 1))
  $opaque = 0; $first = -1; $last = -1
  for ($y = 0; $y -lt $h; $y += 4) {
    if ($bmp.GetPixel($x, $y).A -gt 24) {
      $opaque++
      if ($first -lt 0) { $first = $y }
      $last = $y
    }
  }
  $samples = [int]($h / 4)
  $frac = [math]::Round($opaque / $samples, 2)
  $fx = [math]::Round($x / $w, 3)
  $fy1 = if ($first -ge 0) { [math]::Round($first / $h, 2) } else { -1 }
  $fy2 = if ($last -ge 0) { [math]::Round($last / $h, 2) } else { -1 }
  Write-Host ("x=$fx opaque=$frac y=[$fy1..$fy2]")
}
$bmp.Dispose()
