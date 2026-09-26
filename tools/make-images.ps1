# Generates promo banner + ice product images (System.Drawing).
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

function SolidBrush([int]$r, [int]$g, [int]$b) { New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($r, $g, $b)) }
function IcePen([int]$a) { New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($a, 127, 199, 232)), 3 }

function RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $r, $r, 180, 90)
  $p.AddArc(($x + $w - $r), $y, $r, $r, 270, 90)
  $p.AddArc(($x + $w - $r), ($y + $h - $r), $r, $r, 0, 90)
  $p.AddArc($x, ($y + $h - $r), $r, $r, 90, 90)
  $p.CloseFigure()
  return $p
}

# ============================== PROMO BANNER ==============================
$bw = 780; $bh = 480
$banner = New-Object System.Drawing.Bitmap($bw, $bh)
$gfx = [System.Drawing.Graphics]::FromImage($banner)
$gfx.SmoothingMode = 'AntiAlias'

$rect = New-Object System.Drawing.Rectangle(0, 0, $bw, $bh)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 25, 184, 216), [System.Drawing.Color]::FromArgb(255, 11, 60, 122), 55)
$gfx.FillRectangle($grad, $rect)

$rand = New-Object System.Random(7)
for ($i = 0; $i -lt 16; $i++) {
  $x = $rand.Next($bw); $y = $rand.Next($bh); $d = $rand.Next(14, 70)
  $bubBrush = SolidBrush 255 255 255
  $bubBrush.Color = [System.Drawing.Color]::FromArgb($rand.Next(18, 55), 255, 255, 255)
  $gfx.FillEllipse($bubBrush, $x, $y, $d, $d)
  $bubBrush.Dispose()
}

$cardX = 46; $cardY = 56; $cardW = $bw - 92; $cardH = $bh - 112
$cardPath = RoundedPath $cardX $cardY $cardW $cardH 30
$whiteBrush = SolidBrush 255 255 255
$gfx.FillPath($whiteBrush, $cardPath)

$ribbonBrush = SolidBrush 255 203 36
$gfx.FillRectangle($ribbonBrush, ($cardX + 34), ($cardY + 34), 190, 54)
$fontRibbon = New-Object System.Drawing.Font('Arial', 21, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sAction, $fontRibbon, (SolidBrush 11 60 122), ($cardX + 46), ($cardY + 44))

$fontBig = New-Object System.Drawing.Font('Arial', 46, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sFrom, $fontBig, (SolidBrush 14 147 180), ($cardX + 40), ($cardY + 120))
$gfx.DrawString('180', $fontBig, (SolidBrush 11 60 122), ($cardX + 130), ($cardY + 120))
$fontMid = New-Object System.Drawing.Font('Arial', 30, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sGrn, $fontMid, (SolidBrush 11 60 122), ($cardX + 300), ($cardY + 140))
$fontSmall = New-Object System.Drawing.Font('Arial', 19)
$gfx.DrawString($sWater, $fontSmall, (SolidBrush 90 113 132), ($cardX + 40), ($cardY + 205))

$penLine = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 220, 235, 245)), 2
$gfx.DrawLine($penLine, ($cardX + 40), ($cardY + 260), ($cardX + $cardW - 40), ($cardY + 260))
$fontDeliv = New-Object System.Drawing.Font('Arial', 19, [System.Drawing.FontStyle]::Bold)
$gfx.DrawString($sFreeDeliv, $fontDeliv, (SolidBrush 25 184 216), ($cardX + 40), ($cardY + 290))

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

# ============================== ICE PRODUCT IMAGES ========================
if (-not (Test-Path $iceDir)) { New-Item -ItemType Directory -Path $iceDir | Out-Null }

$w = 640; $h = 480

# Shared helpers for the 640x480 canvas
function New-Canvas {
  $img = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($img)
  $g.SmoothingMode = 'AntiAlias'
  # vertical gradient: white -> icy blue
  $bg = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bg, [System.Drawing.Color]::FromArgb(255, 255, 255, 255), [System.Drawing.Color]::FromArgb(255, 223, 240, 250), 90)
  $g.FillRectangle($g2, $bg)
  # sparkles
  $r2 = New-Object System.Random(11)
  for ($i = 0; $i -lt 14; $i++) {
    $sx = $r2.Next(30, $w - 30); $sy = $r2.Next(30, $h - 60); $sd = $r2.Next(3, 8)
    $sp = SolidBrush 255 255 255
    $sp.Color = [System.Drawing.Color]::FromArgb(120, 255, 255, 255)
    $g.FillEllipse($sp, $sx, $sy, $sd, $sd)
    $sp.Dispose()
  }
  # soft shadow under the subject
  $sh = SolidBrush 255 255 255
  $sh.Color = [System.Drawing.Color]::FromArgb(45, 11, 60, 122)
  $g.FillEllipse($sh, ($w / 2 - 170), ($h - 92), 340, 44)
  $sh.Dispose()
  return @{ img = $img; g = $g }
}

function Draw-Cube($g, [float]$x, [float]$y, [float]$s, [int]$alpha) {
  $p = RoundedPath $x $y $s $s ([float]($s * 0.18))
  $fill = SolidBrush 255 255 255
  $fill.Color = [System.Drawing.Color]::FromArgb($alpha, 190, 227, 245)
  $g.FillPath($fill, $p)
  $pen = IcePen 255
  $g.DrawPath($pen, $p)
  # top-left shine
  $hl = SolidBrush 255 255 255
  $hl.Color = [System.Drawing.Color]::FromArgb(170, 255, 255, 255)
  $g.FillRectangle($hl, ($x + $s * 0.14), ($y + $s * 0.14), ($s * 0.3), ($s * 0.12))
  # inner reflection line
  $pen2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 255, 255, 255)), 3
  $g.DrawLine($pen2, ($x + $s * 0.72), ($y + $s * 0.2), ($x + $s * 0.72), ($y + $s * 0.6))
  $p.Dispose()
}

# ---- 1. KUB: classic pyramid of cubes ------------------------------------
$c = New-Canvas; $g = $c.g
Draw-Cube $g 200 190 120 255
Draw-Cube $g 330 190 120 255
Draw-Cube $g 265 90 120 255
$g.Dispose(); $c.img.Save((Join-Path $iceDir 'kub.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK kub.png"

# ---- 2. PREMIUM: crystal cube + mint leaf ---------------------------------
$c = New-Canvas; $g = $c.g
Draw-Cube $g 250 160 150 235
# crystal facet lines
$penF = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(150, 255, 255, 255)), 4
$g.DrawLine($penF, 250, 235, 400, 235)
$g.DrawLine($penF, 325, 160, 325, 310)
$g.DrawLine($penF, 250, 160, 400, 310)
# mint leaf
$st = $g.Save()
$g.TranslateTransform(420, 140)
$g.RotateTransform(35)
$leaf = SolidBrush 255 255 255
$leaf.Color = [System.Drawing.Color]::FromArgb(230, 67, 160, 71)
$leafPath = RoundedPath 0 0 46 24 12
$g.FillPath($leaf, $leafPath)
$penLeaf = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 27, 94, 32)), 2
$g.DrawLine($penLeaf, 4, 12, 42, 12)
$g.Restore($st)
$g.Dispose(); $c.img.Save((Join-Path $iceDir 'premium.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK premium.png"

# ---- 3. KRASH: mound of crushed shards ------------------------------------
$c = New-Canvas; $g = $c.g
$r3 = New-Object System.Random(5)
for ($i = 0; $i -lt 46; $i++) {
  $t = $i / 46.0
  $ang = $r3.NextDouble() * [Math]::PI * 2
  $rad = $r3.NextDouble() * 150
  $cxk = 320 + [Math]::Cos($ang) * $rad * 1.25
  $cyk = 250 + [Math]::Sin($ang) * $rad * 0.55
  $sz = $r3.Next(18, 46)
  $pts = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF(($cxk - $sz / 2), ($cyk + $sz / 4))),
    (New-Object System.Drawing.PointF($cxk, ($cyk - $sz / 2))),
    (New-Object System.Drawing.PointF(($cxk + $sz / 2), ($cyk + $sz / 5))),
    (New-Object System.Drawing.PointF($cxk, ($cyk + $sz / 2)))
  )
  $br = SolidBrush 255 255 255
  $br.Color = [System.Drawing.Color]::FromArgb($r3.Next(180, 250), 190, 227, 245)
  $g.FillPolygon($br, $pts)
  $pen3 = IcePen 140
  $g.DrawPolygon($pen3, $pts)
  $br.Dispose()
}
$g.Dispose(); $c.img.Save((Join-Path $iceDir 'krash.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK krash.png"

# ---- 4. KUB 1KG: retail bag -----------------------------------------------
$c = New-Canvas; $g = $c.g
# bag body
$bagX = 200; $bagY = 130; $bagW = 240; $bagH = 260
$bagPath = RoundedPath $bagX $bagY $bagW $bagH 26
$bagFill = SolidBrush 255 255 255
$bagFill.Color = [System.Drawing.Color]::FromArgb(235, 214, 236, 246)
$g.FillPath($bagFill, $bagPath)
$penBag = IcePen 255
$penBag.Width = 4
$g.DrawPath($penBag, $bagPath)
# crimped top
$crimp = SolidBrush 255 255 255
$crimp.Color = [System.Drawing.Color]::FromArgb(255, 168, 212, 235)
$g.FillRectangle($crimp, ($bagX + 26), ($bagY - 18), ($bagW - 52), 26)
$g.DrawLine($penBag, ($bagX + 26), ($bagY - 18), ($bagX + $bagW - 26), ($bagY - 18))
# cubes inside (visible through bag)
Draw-Cube $g ($bagX + 40) ($bagY + 90) 70 150
Draw-Cube $g ($bagX + 125) ($bagY + 100) 70 150
# white label
$lblPath = RoundedPath ($bagX + 45) ($bagY + 32) ($bagW - 90) 46 12
$g.FillPath((SolidBrush 255 255 255), $lblPath)
$fontLbl = New-Object System.Drawing.Font('Arial', 17, [System.Drawing.FontStyle]::Bold)
$lblRect = New-Object System.Drawing.RectangleF(($bagX + 45), ($bagY + 40), ($bagW - 90), 30)
$fmt2 = New-Object System.Drawing.StringFormat
$fmt2.Alignment = 'Center'
$g.DrawString('VodaLed', $fontLbl, (SolidBrush 22 104 179), $lblRect, $fmt2)
# 1 kg ribbon
$ribPath = RoundedPath ($bagX + 70) ($bagY + 195) ($bagW - 140) 40 10
$g.FillPath((SolidBrush 22 104 179), $ribPath)
$ribRect = New-Object System.Drawing.RectangleF(($bagX + 70), ($bagY + 201), ($bagW - 140), 28)
$g.DrawString('1 kg', $fontLbl, (SolidBrush 255 255 255), $ribRect, $fmt2)
$g.Dispose(); $c.img.Save((Join-Path $iceDir 'kub-1kg.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK kub-1kg.png"

# ========================= ACCESSORY ILLUSTRATIONS =========================
$accDir = Join-Path $assetsDir 'accessories'
if (-not (Test-Path $accDir)) { New-Item -ItemType Directory -Path $accDir | Out-Null }

# Спільний фон + тінь (як в льоду), 640x480
function New-AccCanvas {
  $img = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($img)
  $g.SmoothingMode = 'AntiAlias'
  $bg = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bg, [System.Drawing.Color]::FromArgb(255, 255, 255, 255), [System.Drawing.Color]::FromArgb(255, 223, 240, 250), 90)
  $g.FillRectangle($g2, $bg)
  $sh = SolidBrush 255 255 255
  $sh.Color = [System.Drawing.Color]::FromArgb(45, 11, 60, 122)
  $g.FillEllipse($sh, ($w / 2 - 180), ($h - 80), 360, 40)
  $sh.Dispose()
  return @{ img = $img; g = $g }
}

$blue = [System.Drawing.Color]::FromArgb(255, 22, 104, 179)
$deep = [System.Drawing.Color]::FromArgb(255, 11, 60, 122)
$iceC = [System.Drawing.Color]::FromArgb(255, 168, 212, 235)

# ---- 1. Бутель 18,9 л ------------------------------------------------------
$c = New-AccCanvas; $g = $c.g
$bx = 260; $by = 90
# корпус
$bodyPath = RoundedPath $bx ($by + 50) 120 270 40
$g.FillPath((SolidBrush 168 212 235), $bodyPath)
$penB = New-Object System.Drawing.Pen $deep, 5
$g.DrawPath($penB, $bodyPath)
# шия
$g.FillRectangle((SolidBrush 168 212 235), ($bx + 40), $by, 40, 60)
$g.DrawRectangle($penB, ($bx + 40), $by, 40, 60)
# кришка
$capPath = RoundedPath ($bx + 34) ($by - 26) 52 30 8
$g.FillPath((SolidBrush 22 104 179), $capPath)
# вода всередині (нижні 60%)
$waterPath = RoundedPath ($bx + 10) ($by + 160) 100 150 30
$wf = SolidBrush 255 255 255
$wf.Color = [System.Drawing.Color]::FromArgb(150, 70, 170, 220)
$g.FillPath($wf, $waterPath)
# етикетка
$lbl = RoundedPath ($bx + 8) ($by + 150) 104 70 10
$g.FillPath((SolidBrush 255 255 255), $lbl)
$g.DrawString('VodaLed', (New-Object System.Drawing.Font('Arial', 15, [System.Drawing.FontStyle]::Bold)), (SolidBrush 22 104 179), (New-Object System.Drawing.RectangleF(($bx + 8), ($by + 172), 104, 26)), (New-Object System.Drawing.StringFormat))
# блиск
$gl = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(150, 255, 255, 255)), 8
$g.DrawLine($gl, ($bx + 24), ($by + 90), ($bx + 24), ($by + 250))
$g.Dispose(); $c.img.Save((Join-Path $accDir 'bottle.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK accessories/bottle.png"

# ---- 2. Помпа механічна (на бутлі) ----------------------------------------
$c = New-AccCanvas; $g = $c.g
$bx = 265; $by = 130
# бутель (спрощено)
$bodyPath = RoundedPath $bx ($by + 40) 110 230 36
$g.FillPath((SolidBrush 168 212 235), $bodyPath)
$penB = New-Object System.Drawing.Pen $deep, 4
$g.DrawPath($penB, $bodyPath)
# головка помпи
$headPath = RoundedPath ($bx + 15) ($by - 60) 80 90 16
$g.FillPath((SolidBrush 22 104 179), $headPath)
# носик
$g.FillRectangle((SolidBrush 22 104 179), ($bx + 90), ($by - 40), 55, 16)
# ручка (вгору-праворуч)
$penHandle = New-Object System.Drawing.Pen $deep, 14
$penHandle.StartCap = 'Round'; $penHandle.EndCap = 'Round'
$g.DrawLine($penHandle, ($bx + 40), ($by - 40), ($bx + 110), ($by - 105))
$g.FillEllipse((SolidBrush 11 60 122), ($bx + 92), ($by - 122), 40, 26)
$g.Dispose(); $c.img.Save((Join-Path $accDir 'pump-mech.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK accessories/pump-mech.png"

# ---- 3. Помпа електрична ---------------------------------------------------
$c = New-AccCanvas; $g = $c.g
$bx = 270; $by = 130
$bodyPath = RoundedPath $bx ($by + 40) 100 230 32
$g.FillPath((SolidBrush 168 212 235), $bodyPath)
$penB = New-Object System.Drawing.Pen $deep, 4
$g.DrawPath($penB, $bodyPath)
# електрична головка
$headPath = RoundedPath ($bx + 5) ($by - 62) 90 95 18
$g.FillPath((SolidBrush 11 60 122), $headPath)
# кнопка
$g.FillEllipse((SolidBrush 25 184 216), ($bx + 35), ($by - 40), 30, 30)
# USB-кабель
$penU = New-Object System.Drawing.Pen $deep, 5
$penU.DashStyle = 'Dash'
$g.DrawBezier($penU, ($bx + 95), ($by - 20), ($bx + 170), ($by + 40), ($bx + 140), ($by + 160), ($bx + 185), ($by + 230))
$g.Dispose(); $c.img.Save((Join-Path $accDir 'pump-electric.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK accessories/pump-electric.png"

# ---- 4. Кулер настільний ---------------------------------------------------
$c = New-AccCanvas; $g = $c.g
$bx = 250; $by = 200
# бутель зверху
$btl = RoundedPath ($bx + 25) 80 90 120 24
$g.FillPath((SolidBrush 168 212 235), $btl)
$penB = New-Object System.Drawing.Pen $deep, 4
$g.DrawPath($penB, $btl)
# корпус
$bodyPath = RoundedPath $bx $by 140 170 14
$g.FillPath((SolidBrush 255 255 255), $bodyPath)
$g.DrawPath($penB, $bodyPath)
# краники
$g.FillRectangle((SolidBrush 22 104 179), ($bx + 40), ($by + 70), 18, 26)
$g.FillRectangle((SolidBrush 25 184 216), ($bx + 82), ($by + 70), 18, 26)
$g.Dispose(); $c.img.Save((Join-Path $accDir 'cooler-desk.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK accessories/cooler-desk.png"

# ---- 5. Кулер підлоговий ---------------------------------------------------
$c = New-AccCanvas; $g = $c.g
$bx = 255; $by = 120
# бутель
$btl = RoundedPath ($bx + 20) 60 100 130 26
$g.FillPath((SolidBrush 168 212 235), $btl)
$penB = New-Object System.Drawing.Pen $deep, 4
$g.DrawPath($penB, $btl)
# шафка
$bodyPath = RoundedPath $bx $by 140 290 14
$g.FillPath((SolidBrush 255 255 255), $bodyPath)
$g.DrawPath($penB, $bodyPath)
# краники
$g.FillRectangle((SolidBrush 22 104 179), ($bx + 42), ($by + 55), 18, 26)
$g.FillRectangle((SolidBrush 25 184 216), ($bx + 82), ($by + 55), 18, 26)
# шафка-дверцята
$door = RoundedPath ($bx + 30) ($by + 120) 80 130 8
$g.DrawPath($penB, $door)
$g.Dispose(); $c.img.Save((Join-Path $accDir 'cooler-floor.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK accessories/cooler-floor.png"

# ---- 6. Холодильник для льоду ----------------------------------------------
$c = New-AccCanvas; $g = $c.g
$bx = 230; $by = 80
$penB = New-Object System.Drawing.Pen $deep, 5
# корпус
$bodyPath = RoundedPath $bx $by 180 320 18
$g.FillPath((SolidBrush 214 236 248), $bodyPath)
$g.DrawPath($penB, $bodyPath)
# кришка (морозильне відділення)
$g.DrawLine($penB, $bx, ($by + 90), ($bx + 180), ($by + 90))
$g.FillRectangle((SolidBrush 22 104 179), ($bx + 20), ($by + 25), 140, 14)
# сніжинка на дверцятах
$penS = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 14, 147, 180)), 5
$penS.StartCap = 'Round'; $penS.EndCap = 'Round'
$cx2 = $bx + 90; $cy2 = $by + 200
foreach ($a in 0, 60, 120) {
  $rad = $a * [Math]::PI / 180
  $g.DrawLine($penS, ($cx2 - [Math]::Cos($rad) * 34), ($cy2 - [Math]::Sin($rad) * 34), ($cx2 + [Math]::Cos($rad) * 34), ($cy2 + [Math]::Sin($rad) * 34))
}
$g.Dispose(); $c.img.Save((Join-Path $accDir 'freezer.png'), [System.Drawing.Imaging.ImageFormat]::Png); $c.img.Dispose()
Write-Output "OK accessories/freezer.png"
