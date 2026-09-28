# 1) Samples promo-banner.jpg colors (gradient endpoints, title text colors).
# 2) Makes assets/logo.png background transparent (white -> alpha).
# ASCII-only output labels (console mangles Cyrillic).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetsDir = Join-Path $PSScriptRoot '..\assets'

function Hex([System.Drawing.Color]$c) { '{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B }
function Px([System.Drawing.Bitmap]$bmp, [int]$x, [int]$y) { Hex $bmp.GetPixel($x, $y) }

# ---------------- 1. Banner sampling ----------------
$bannerPath = Join-Path $assetsDir 'promo-banner.jpg'
$bmp = New-Object System.Drawing.Bitmap($bannerPath)
Write-Output ("SIZE " + $bmp.Width + "x" + $bmp.Height)
# Background gradient: top-left vs bottom-right (avoid logo/bubbles)
Write-Output ("BG-TL " + (Px $bmp 8 8))
Write-Output ("BG-BR " + (Px $bmp ($bmp.Width - 8) ($bmp.Height - 8)))
Write-Output ("BG-MID " + (Px $bmp ($bmp.Width - 8) ([int]($bmp.Height / 2))))
# "Voda" (deep blue) and "Led" (light blue) in the big title, and the subtitle
$probe = @(
  @{ n = 'ROW1'; y = 340 },
  @{ n = 'ROW2'; y = 400 }
)
foreach ($p in $probe) {
  $line = $p.n
  foreach ($x in 130, 170, 220, 260, 300, 340, 380, 420) {
    $line += " " + (Px $bmp $x $p.y)
  }
  Write-Output $line
}
$bmp.Dispose()

# ---------------- 2. Logo transparency ----------------
$logoPath = Join-Path $assetsDir 'logo.png'
$logo = New-Object System.Drawing.Bitmap($logoPath)
Write-Output ("LOGO " + $logo.Width + "x" + $logo.Height)
$corner = $logo.GetPixel(0, 0)
Write-Output ("LOGO-BG " + (Hex $corner))
Write-Output ("LOGO-CENTER " + (Hex $logo.GetPixel([int]($logo.Width / 2), [int]($logo.Height / 2))))

$w = $logo.Width; $h = $logo.Height
$out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $c = $logo.GetPixel($x, $y)
    # distance from the corner background color
    $d = [Math]::Abs($c.R - $corner.R) + [Math]::Abs($c.G - $corner.G) + [Math]::Abs($c.B - $corner.B)
    if ($d -le 12) {
      $transparent = [System.Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B)
      $out.SetPixel($x, $y, $transparent)
    } elseif ($d -le 45) {
      # soften edges: scale alpha with distance
      $a = [int](255 * ($d - 12) / 33)
      if ($a -gt $c.A) { $a = $c.A }
      $soft = [System.Drawing.Color]::FromArgb($a, $c.R, $c.G, $c.B)
      $out.SetPixel($x, $y, $soft)
    } else {
      $out.SetPixel($x, $y, $c)
    }
  }
}
$backup = Join-Path $assetsDir 'logo-original.png'
if (-not (Test-Path $backup)) { $logo.Save($backup, [System.Drawing.Imaging.ImageFormat]::Png) }
$logo.Dispose()   # unlock the original file before overwriting it
$out.Save($logoPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "LOGO-DONE saved transparent version; original backed up to logo-original.png"
$out.Dispose()
