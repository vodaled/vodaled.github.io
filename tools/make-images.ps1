# Generates promo banner + ice product placeholder images (System.Drawing).
# Ukrainian strings are built from [char] codes (script is ASCII-only, safe for PS 5.1).

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot '..\assets'
$iceDir = Join-Path $assetsDir 'ice'

function Uk([int[]]$c) { -join ($c | ForEach-Object { [char]$_ }) }

$sAction    = Uk @(0x0410,0x041A,0x0426,0x0406,0x042F,0x21)
$sWater     = Uk @(0x0412,0x043E,0x0434,0x0430,0x0020,0x0031,0x0038,0x002C,0x0039,0x0020,0x043B)
$sFrom      = Uk @(0x0432,0x0456,0x0434)
$sGrn       = Uk @(0x0433,0x0440,0x043D)
$sFreeDeliv = Uk @(0x0411,0x0435,0x0437,0x043A,0x043E,0x0448,0x0442,0x043E,0x0432,0x043D,0x0430,0x0020,0x0434,0x043E,0x0441,0x0442,0x0430,0x0432,0x043A,0x0430,0x0020,0x0432,0x0456,0x0434,0x0020,0x0032,0x0020,0x0431,0x0443,0x0442,0x043B,0x0456,0x0432)
$sIce       = Uk @(0x041B,0x0456,0x0434)

function SolidBrush([int]$r, [int]$g, [int]$b) { New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($r, $g, $b)) }

# ============================== PROMO BANNER ==============================
$bw = 780; $bh = 480
$banner = New-Object System.Drawing.Bitmap($bw, $bh)
$gfx = [System.Drawing.Graphics]::FromImage($banner)
$gfx.SmoothingMode = 'AntiAlias'

# background: diagonal cyan -> blue gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $bw, $bh)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 25, 184, 216), [System.Drawing.Color]::FromArgb(255, 11, 60, 122), 55)
$gfx.FillRectangle($grad, $rect)

# decorative bubbles
$rand = New-Object System.Random(7)
for ($i = 0; $i -lt 16; $i++) {
  $x = $rand.Next($bw); $y = $rand.Next($bh); $d = $rand.Next(14, 70)
  $bubBrush = SolidBrush 255 255 255
  $bubBrush.Color = [System.Drawing.Color]::FromArgb($rand.Next(18, 55), 255, 255, 255)
  $gfx.FillEllipse($bubBrush, $x, $y, $d, $d)
  $bubBrush.Dispose()
}

# white rounded card
$cardX = 46; $cardY = 56; $cardW = $bw - 92; $cardH = $bh - 112
$cardPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 30
$cardPath.AddArc($cardX, $cardY, $r, $r, 180, 90)
$cardPath.AddArc(($cardX + $cardW - $r), $cardY, $r, $r, 270, 90)
$cardPath.AddArc(($cardX + $cardW - $r), ($cardY + $cardH - $r), $r, $r, 0, 90)
$cardPath.AddArc($cardX, ($cardY + $cardH - $r), $r, $r, 90, 90)
$cardPath.CloseFigure()
$whiteBrush = SolidBrush 255 255 255
$gfx.FillPath($whiteBrush, $cardPath)

# ACCIIA! ribbon
$ribbonBrush = SolidBrush 255 203 36
$gfx.FillRectangle($ribbonBrush, ($cardX + 34), ($cardY + 34), 190, 54)
$fontRibbon = New-Object System.Drawing.Font('Arial', 21, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sAction, $fontRibbon, (SolidBrush 11 60 122), ($cardX + 46), ($cardY + 44))

# big price
$fontBig = New-Object System.Drawing.Font('Arial', 46, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sFrom, $fontBig, (SolidBrush 14 147 180), ($cardX + 40), ($cardY + 120))
$gfx.DrawString('180', $fontBig, (SolidBrush 11 60 122), ($cardX + 130), ($cardY + 120))
$fontMid = New-Object System.Drawing.Font('Arial', 30, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sGrn, $fontMid, (SolidBrush 11 60 122), ($cardX + 300), ($cardY + 140))
$fontSmall = New-Object System.Drawing.Font('Arial', 19)
$gfx.DrawString($sWater, $fontSmall, (SolidBrush 90 113 132), ($cardX + 40), ($cardY + 205))

# divider + free delivery line
$penLine = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 220, 235, 245)), 2
$gfx.DrawLine($penLine, ($cardX + 40), ($cardY + 260), ($cardX + $cardW - 40), ($cardY + 260))
$fontDeliv = New-Object System.Drawing.Font('Arial', 19, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sFreeDeliv, $fontDeliv, (SolidBrush 25 184 216), ($cardX + 40), ($cardY + 290))

# bottle pictogram (simple)
$bx = $cardX + $cardW - 150; $by = $cardY + 90
$penBottle = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 22, 104, 179)), 5
$gfx.DrawArc($penBottle, ($bx + 18), ($by + 30), 44, 60, 0, 360)
$gfx.FillRectangle((SolidBrush 22 104 179), ($bx + 30), $by, 20, 34)
$neckBrush = SolidBrush 127 199 232
$gfx.FillRectangle($neckBrush, ($bx + 30), ($by + 60), 20, 90)

$bannerPath = Join-Path $assetsDir 'promo-banner.png'
$banner.Save($bannerPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose(); $banner.Dispose()
Write-Output ("Banner: " + $bannerPath)

# ============================== ICE PLACEHOLDERS ==========================
if (-not (Test-Path $iceDir)) { New-Item -ItemType Directory -Path $iceDir | Out-Null }

$variants = @(
  @{ name = 'kub.png';    size = 10 },
  @{ name = 'premium.png'; size = 10 },
  @{ name = 'krash.png';  size = 10 },
  @{ name = 'kub-1kg.png'; size = 1 }
)

foreach ($v in $variants) {
  $w = 640; $h = 480
  $img = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($img)
  $g.SmoothingMode = 'AntiAlias'

  $bg = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g.FillRectangle((SolidBrush 234 246 252), $bg)

  # ice cube pile
  $cx = 210; $cy = 150
  for ($row = 0; $row -lt 3; $row++) {
    for ($col = 0; $col -lt (3 - $row); $col++) {
      $cubeX = $cx + $col * 92 + $row * 46
      $cubeY = $cy + $row * 78
      $cubeBrush = SolidBrush 197 231 246
      $g.FillRectangle($cubeBrush, $cubeX, $cubeY, 84, 70)
      $penCube = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 127, 199, 232)), 3
      $g.DrawRectangle($penCube, $cubeX, $cubeY, 84, 70)
      # highlight
      $hlBrush = SolidBrush 255 255 255
      $hlBrush.Color = [System.Drawing.Color]::FromArgb(140, 255, 255, 255)
      $g.FillRectangle($hlBrush, ($cubeX + 8), ($cubeY + 8), 26, 14)
    }
  }

  # weight badge
  $badgeBrush = SolidBrush 11 60 122
  $g.FillEllipse($badgeBrush, ($w - 130), 26, 96, 96)
  $fontBadge = New-Object System.Drawing.Font('Arial', 26, [System.Drawing.FontStyle]::Bold)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
  $badgeRect = New-Object System.Drawing.RectangleF(($w - 130), 26, 96, 96)
  $g.DrawString(([string]$v.size + ' kg'), $fontBadge, (SolidBrush 255 255 255), $badgeRect, $fmt)

  $p = Join-Path $iceDir $v.name
  $img.Save($p, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $img.Dispose()
  Write-Output ("Ice: " + $p)
}

Write-Output "DONE"
