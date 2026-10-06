# Generates a NEW water "bloop" sound (WAV, 11.025kHz, 16-bit mono, ~0.55s).
# Sound design: TWO descending blips ("bul-bul") - the first higher and short,
# the second lower and deeper, like a heavy drop falling into a full bottle.
# Writes assets/drop.wav (consumed by main.js). ASCII-only script (PS 5.1).

$ErrorActionPreference = 'Stop'

$sr = 11025
$n  = 6000   # samples (~0.545 s)

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

# ---- two blips, incremental phase integration (O(n) total) ----
# bul #1: starts t=0     (higher, short):   f0 950 -> f1 520, fall 45, rel 16
# bul #2: starts t=0.16  (lower, deeper):   f0 700 -> f1 300, fall 38, rel 9.5
$t2 = 0.16
$ph1 = 0.0; $on1 = $false
$ph2 = 0.0; $on2 = $false
$dt = 1.0 / $sr
$twoPi = 2 * [Math]::PI

for ($i = 0; $i -lt $n; $i++) {
  $t = $i * $dt
  $v = 0.0

  if ($on1) {
    $f = 520.0 + (950.0 - 520.0) * [Math]::Exp(-45.0 * $t)
    $ph1 += $twoPi * $f * $dt
    $attack  = 1.0 - [Math]::Exp(-380.0 * $t)
    $release = [Math]::Exp(-16.0 * $t)
    $v += [Math]::Sin($ph1) * $attack * $release
  } elseif ($t -ge 0) { $on1 = $true }

  if ($on2) {
    $t2l = $t - $t2
    $f = 300.0 + (700.0 - 300.0) * [Math]::Exp(-38.0 * $t2l)
    $ph2 += $twoPi * $f * $dt
    $attack  = 1.0 - [Math]::Exp(-380.0 * $t2l)
    $release = [Math]::Exp(-9.5 * $t2l)
    $v += [Math]::Sin($ph2) * $attack * $release * 1.15
  } elseif ($t -ge $t2) { $on2 = $true }

  # gentle soft-clip to avoid harsh digital edges
  $v = [Math]::Tanh($v * 1.4) * 0.82

  $b = [int][Math]::Round($v * 32767)
  if ($b -gt 32767)  { $b = 32767 }
  if ($b -lt -32768) { $b = -32768 }
  Put-I16 $data (44 + $i * 2) $b
}

$out = Join-Path $PSScriptRoot '..\assets\drop.wav'
[System.IO.File]::WriteAllBytes($out, $data)
Write-Output ("WAV written: " + $out + " (" + (Get-Item $out).Length + " bytes)")
