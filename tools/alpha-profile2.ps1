Add-Type -AssemblyName System.Drawing
[string[]] $lines = @()
$bmp = New-Object System.Drawing.Bitmap((Join-Path $PSScriptRoot '..\assets\botle-ice.png'))
$w = $bmp.Width; $h = $bmp.Height
$cols = 48
for ($i = 0; $i -lt $cols; $i++) {
  $x = [int](($w - 1) * $i / ($cols - 1))
  $op = 0; $first = -1; $last = -1
  for ($y = 0; $y -lt $h; $y += 3) {
    if ($bmp.GetPixel($x, $y).A -gt 24) {
      $op++; if ($first -lt 0) { $first = $y }
      $last = $y
    }
  }
  $fx = [math]::Round($x / $w, 3)
  $fy1 = if ($first -ge 0) { [math]::Round($first / $h, 2) } else { '-' }
  $fy2 = if ($last -ge 0) { [math]::Round($last / $h, 2) } else { '-' }
  $lines += "x=$fx frac=$($op/($h/3)) y=[$fy1..$fy2]"
}
$bmp.Dispose()
$lines | Out-Host
