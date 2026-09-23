# Generates a water-drop "bloop" sound (WAV, 8kHz, 16-bit mono, ~0.4s).
# Sound design: a sine whose pitch SLIDES DOWN (1400 -> 450 Hz) with a rising-
# then-falling envelope and slight vibrato - the classic cartoon "bloop/bul".
# Also writes base64 to bloop.b64.txt (consumed by main.js).
# ASCII-only script (safe for Windows PowerShell 5.1).

$ErrorActionPreference = 'Stop'

$sr = 8000
$n  = 3200   # samples (~0.40 s)

$data = New-Object byte[] (44 + $n * 2)

function Put-Str([byte[]]$dst, [int]$off, [string]$s) {
  [System.Text.Encoding]::ASCII.GetBytes($s).CopyTo($dst, $off)
}
function Put-I32([byte[]]$dst, [int]$off, [int]$v) {
  $dst[$off]   = $v -band 0xFF
  $dst[$off+1] = ($v -shr 8)  -band 0xFF
  $dst[$off+2] = ($v -shr 16) -band 0xFF
  $dst[$off+3] = ($v -shr 24) -band 0xFF
}
function Put-I16([byte[]]$dst, [int]$off, [int]$v) {
  $dst[$off]   = $v -band 0xFF
  $dst[$off+1] = ($v -shr 8) -band 0xFF
}

# ---- WAV header ----
Put-Str $data 0  'RIFF'
Put-I32 $data 4  (36 + $n * 2)
Put-Str $data 8  'WAVE'
Put-Str $data 12 'fmt '
Put-I32 $data 16 16
Put-I16 $data 20 1
Put-I16 $data 22 1
Put-I32 $data 24 $sr
Put-I32 $data 28 ($sr * 2)
Put-I16 $data 32 2
Put-I16 $data 34 16
Put-Str $data 36 'data'
Put-I32 $data 40 ($n * 2)

# ---- "bloop": pitch falls fast then settles, phase integrated numerically ----
$f0 = 1400.0    # start pitch (Hz)
$f1 = 450.0     # end pitch (Hz)
$fall = 60.0    # how fast pitch falls (1/s)
$vibF = 28.0    # vibrato rate (Hz)
$vibD = 0.02    # vibrato depth (0..1)

$phase = 0.0
for ($i = 0; $i -lt $n; $i++) {
  $t = $i / $sr

  # falling pitch: f = f1 + (f0-f1)*exp(-fall*t)
  $fall_ = [Math]::Exp(-$fall * $t)
  $f = $f1 + ($f0 - $f1) * $fall_

  # vibrato, strongest in the middle
  $vib = 1.0 + $vibD * $fall_ * [Math]::Sin(2 * [Math]::PI * $vibF * $t)

  # envelope: quick attack, smooth release
  $attack = 1.0 - [Math]::Exp(-320 * $t)
  $release = [Math]::Exp(-6.5 * $t)
  $env = $attack * $release

  # integrate phase with current (vibrato-modulated) frequency
  $phase += 2 * [Math]::PI * $f * $vib / $sr

  $v = [Math]::Sin($phase) * $env * 0.85
  $b = [int][Math]::Round($v * 32767)
  if ($b -gt 32767)  { $b = 32767 }
  if ($b -lt -32768) { $b = -32768 }
  Put-I16 $data (44 + $i * 2) $b
}

$out = Join-Path $PSScriptRoot '..\assets\drop.wav'
[System.IO.File]::WriteAllBytes($out, $data)
Write-Output ("WAV written: " + $out + " (" + (Get-Item $out).Length + " bytes)")

$b64 = [Convert]::ToBase64String($data)
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'bloop.b64.txt'), $b64)
Write-Output ("base64 length: " + $b64.Length)
