# Generates favicon set (multi-size ICO + PNG + apple-touch) and an
# Open Graph / messenger card image (1200x630) from brand assets.
# ASCII-only; Ukrainian strings built from [char] codes (safe for PS 5.1).

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot '..\assets'
$logoPath = Join-Path $assetsDir 'logo.png'
$logo = [System.Drawing.Bitmap]::FromFile($logoPath)

function Uk([int[]]$c) { -join ($c | ForEach-Object { [char]$_ }) }

# "Вода та лід з доставкою по Києву"
$sTag = Uk @(0x0412,0x043E,0x0434,0x0430,0x0020,0x0442,0x0430,0x0020,0x043B,0x0456,0x0434,0x0020,0x0437,0x0020,0x0434,0x043E,0x0441,0x0442,0x0430,0x0432,0x043A,0x043E,0x044E,0x0020,0x043F,0x043E,0x0020,0x041A,0x0438,0x0454,0x0432,0x0443)
# "Вода 18,9 л" • "Лід" • "Доставка за 2 години"
$dot = [char]0x2022
$sL3 = (Uk @(0x0412,0x043E,0x0434,0x0430,0x0020,0x0031,0x0038,0x002C,0x0039,0x0020,0x043B)) + " $dot " + (Uk @(0x041B,0x0456,0x0434)) + " $dot " + (Uk @(0x0414,0x043E,0x0441,0x0442,0x0430,0x0432,0x043A,0x0430,0x0020,0x0437,0x0430,0x0020,0x0032,0x0020,0x0433,0x043E,0x0434,0x0438,0x043D,0x0438))
# "Замовити доставку"
$sCta = Uk @(0x0417,0x0430,0x043C,0x043E,0x0432,0x0438,0x0442,0x0438,0x0020,0x0434,0x043E,0x0441,0x0442,0x0430,0x0432,0x043A,0x0443)

# Square source rect (center crop) of the logo
$sside = [Math]::Min($logo.Width, $logo.Height)
$sx = [int](($logo.Width - $sside) / 2)
$sy = [int](($logo.Height - $sside) / 2)
$srcRect = New-Object System.Drawing.Rectangle($sx, $sy, $sside, $sside)

function New-LogoFrame([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($logo, (New-Object System.Drawing.Rectangle(0, 0, $size, $size)), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  # leading comma prevents PowerShell from unrolling byte[] into the pipeline
  return ,$ms.ToArray()
}

# ================================ FAVICONS ================================
$frames = @{}
foreach ($s in 16, 32, 48) { $frames[$s] = New-LogoFrame $s }

# Multi-size ICO (PNG-compressed frames - supported by all modern browsers)
$icoPath = Join-Path $assetsDir 'favicon.ico'
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]3)
$offset = 6 + 16 * 3
foreach ($s in 16, 32, 48) {
  $b = $frames[$s]
  $bw.Write([byte]($s % 256)); $bw.Write([byte]($s % 256))
  $bw.Write([byte]0); $bw.Write([byte]0)
  $bw.Write([uint16]1); $bw.Write([uint16]32)
  $bw.Write([uint32]$b.Length); $bw.Write([uint32]$offset)
  $offset += $b.Length
}
foreach ($s in 16, 32, 48) { $bw.Write($frames[$s]) }
$bw.Flush(); $bw.Close()
Write-Output ("OK favicon.ico (" + (Get-Item $icoPath).Length + " bytes)")

[System.IO.File]::WriteAllBytes((Join-Path $assetsDir 'favicon-32.png'), $frames[32])
[System.IO.File]::WriteAllBytes((Join-Path $assetsDir 'favicon-16.png'), $frames[16])
Write-Output "OK favicon-32.png, favicon-16.png"

# apple-touch-icon 180x180 on white (iOS hates transparency)
$at = 180
$bmp = New-Object System.Drawing.Bitmap($at, $at)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($logo, (New-Object System.Drawing.Rectangle(14, 14, 152, 152)), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$bmp.Save((Join-Path $assetsDir 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "OK apple-touch-icon.png"

# ============================= OG IMAGE 1200x630 ===========================
$w = 1200; $h = 630
$img = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($img)
$g.SmoothingMode = 'AntiAlias'

# Icy sky gradient (same family as the mobile hero)
$bg = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bg, [System.Drawing.Color]::FromArgb(255, 242, 250, 254), [System.Drawing.Color]::FromArgb(255, 169, 216, 241), 90)
$g.FillRectangle($grad, $bg)
$grad.Dispose()

# Soft bubbles
$rand = New-Object System.Random(9)
for ($i = 0; $i -lt 18; $i++) {
  $x = $rand.Next($w); $y = $rand.Next($h); $d = $rand.Next(20, 90)
  $bub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($rand.Next(15, 50), 255, 255, 255))
  $g.FillEllipse($bub, $x, $y, $d, $d)
  $bub.Dispose()
}

function SolidBrush([int]$a, [int]$r, [int]$gg, [int]$b) { New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($a, $r, $gg, $b)) }
function RoundedPath([float]$x, [float]$y, [float]$w2, [float]$h2, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $r, $r, 180, 90)
  $p.AddArc(($x + $w2 - $r), $y, $r, $r, 270, 90)
  $p.AddArc(($x + $w2 - $r), ($y + $h2 - $r), $r, $r, 0, 90)
  $p.AddArc($x, ($y + $h2 - $r), $r, $r, 90, 90)
  $p.CloseFigure()
  return $p
}

# ---- Right side: bottle + ice --------------------------------------------
$deep = [System.Drawing.Color]::FromArgb(255, 11, 60, 122)
$penB = New-Object System.Drawing.Pen $deep, 6
# shadow
$g.FillEllipse((SolidBrush 45 11 60 122), 800, 555, 300, 36)
# body
$bodyPath = RoundedPath 840 210 220 330 40
$g.FillPath((SolidBrush 255 191 224 242), $bodyPath)
$g.DrawPath($penB, $bodyPath)
# neck
$neckRect = New-Object System.Drawing.Rectangle(915, 150, 70, 70)
$g.FillRectangle((SolidBrush 255 191 224 242), $neckRect)
$g.DrawRectangle($penB, $neckRect)
# cap
$capPath = RoundedPath 905 110 90 46 8
$g.FillPath((SolidBrush 255 22 104 179), $capPath)
# water inside
$waterPath = RoundedPath 860 340 180 180 30
$g.FillPath((SolidBrush 150 70 170 220), $waterPath)
# label
$lblPath = RoundedPath 855 296 190 88 12
$g.FillPath((SolidBrush 255 255 255 255), $lblPath)
$fLbl1 = New-Object System.Drawing.Font('Arial', 30, [System.Drawing.FontStyle]::Bold)
$lblRect1 = New-Object System.Drawing.RectangleF(855, 306, 190, 40)
$fmtC = New-Object System.Drawing.StringFormat
$fmtC.Alignment = 'Center'
$g.DrawString('VodaLed', $fLbl1, (SolidBrush 255 22 104 179), $lblRect1, $fmtC)
$fLbl2 = New-Object System.Drawing.Font('Arial', 15, [System.Drawing.FontStyle]::Italic)
$lblRect2 = New-Object System.Drawing.RectangleF(855, 348, 190, 24)
$g.DrawString('Water & Ice', $fLbl2, (SolidBrush 255 90 113 132), $lblRect2, $fmtC)
# ice cubes
function Draw-Cube([float]$x, [float]$y, [float]$s) {
  $p = RoundedPath $x $y $s $s ([float]($s * 0.2))
  $g.FillPath((SolidBrush 235 190 227 245), $p)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 127, 199, 232)), 3
  $g.DrawPath($pen, $p)
  $g.FillRectangle((SolidBrush 170 255 255 255), ($x + $s * 0.15), ($y + $s * 0.15), ($s * 0.3), ($s * 0.12))
  $p.Dispose()
}
Draw-Cube 780 500 64
Draw-Cube 852 520 56
Draw-Cube 1046 498 68

# ---- Left side: text block ------------------------------------------------
$fBrand = New-Object System.Drawing.Font('Arial', 72, [System.Drawing.FontStyle]::Bold)
$g.DrawString('VodaLed', $fBrand, (SolidBrush 255 11 60 122), 70, 118)
$fTag = New-Object System.Drawing.Font('Arial', 33, [System.Drawing.FontStyle]::Bold)
$g.DrawString($sTag, $fTag, (SolidBrush 255 22 104 179), 74, 240)
$penL = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 22, 104, 179)), 2
$g.DrawLine($penL, 74, 318, 640, 318)
$fPhone = New-Object System.Drawing.Font('Arial', 40, [System.Drawing.FontStyle]::Bold)
$g.DrawString('093 360 24 24', $fPhone, (SolidBrush 255 11 60 122), 74, 348)
$fSmall = New-Object System.Drawing.Font('Arial', 22)
$g.DrawString($sL3, $fSmall, (SolidBrush 255 90 113 132), 74, 436)
# CTA pill (brand red, like the order button)
$ctaPath = RoundedPath 74 496 396 66 33
$g.FillPath((SolidBrush 255 227 53 44), $ctaPath)
$fCta = New-Object System.Drawing.Font('Arial', 24, [System.Drawing.FontStyle]::Bold)
$ctaRect = New-Object System.Drawing.RectangleF(74, 511, 396, 38)
$g.DrawString($sCta, $fCta, (SolidBrush 255 255 255 255), $ctaRect, $fmtC)

$g.Dispose()

$ogPath = Join-Path $assetsDir 'og-image.jpg'
try {
  $jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]88)
  $img.Save($ogPath, $jpgCodec, $ep)
} catch {
  $img.Save($ogPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
}
$img.Dispose()
Write-Output ("OK og-image.jpg (" + (Get-Item $ogPath).Length + " bytes)")

$logo.Dispose()
