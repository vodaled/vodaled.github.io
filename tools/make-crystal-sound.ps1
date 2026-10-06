# Генерація assets/crystal.wav — короткий дзвінкий «звук кришталю»
# для наведення на картки льоду. Синтезуємо його самі (у проєкті немає
# аудіоредактора), щоб не тягнути зовнішні залежності.
#
# Ідея: дзвін кришталю = негармонічні обертоні (як у келиху/дзвіночка)
# зі швидким затуханням + коротка «іскра» на початку.
# Формат: WAV PCM 16-bit моно, 44100 Гц, ~1.0 с.

$ErrorActionPreference = 'Stop'

$rate    = 44100
$seconds = 1.0
$samples = [int]($rate * $seconds)

# Базовий тон C6 і негармонічні обертоні «скла»
$base    = 1046.50
$partial = @(
  @{ mul = 1.00; amp = 1.00; dec = 0.55 }
  @{ mul = 2.00; amp = 0.62; dec = 0.38 }
  @{ mul = 3.01; amp = 0.44; dec = 0.28 }
  @{ mul = 4.17; amp = 0.30; dec = 0.20 }
  @{ mul = 5.43; amp = 0.19; dec = 0.14 }
  @{ mul = 6.79; amp = 0.11; dec = 0.10 }
)

$attack = 0.0035   # с — м'який старт, щоб не було клацання
$pcm    = New-Object 'System.Int16[]' $samples
$rand   = New-Object 'System.Random' 12345

for ($i = 0; $i -lt $samples; $i++) {
  $t = $i / $rate
  $v = 0.0

  foreach ($p in $partial) {
    $env = [Math]::Exp(-6.0 * $t / $p.dec)
    $v  += $p.amp * $env * [Math]::Sin(2 * [Math]::PI * $base * $p.mul * $t)
  }

  # Коротка «іскра» кришталю: високий шум, гасне за ~45 мс
  if ($t -lt 0.045) {
    $sparkEnv = [Math]::Exp(-70.0 * $t)
    $v += 0.28 * $sparkEnv * ($rand.NextDouble() * 2.0 - 1.0)
  }

  # Атака
  if ($t -lt $attack) { $v *= $t / $attack }

  # Загальний хвост наприкінці, щоб файл завершувався в нуль
  if ($t -gt ($seconds - 0.12)) {
    $v *= ($seconds - $t) / 0.12
  }

  $val = $v * 0.42          # загальна гучність — звук має бути тихим
  if ($val -gt  1.0) { $val =  1.0 }
  if ($val -lt -1.0) { $val = -1.0 }
  $pcm[$i] = [int16]($val * 32767)
}

$dataLen = $samples * 2
$out = Join-Path $PSScriptRoot '..\assets\crystal.wav'
$out = [System.IO.Path]::GetFullPath($out)

$fs = [System.IO.File]::Create($out)
$bw = New-Object System.IO.BinaryWriter $fs
try {
  $bw.Write([System.Text.Encoding]::ASCII.GetBytes('RIFF'))
  $bw.Write([int](36 + $dataLen))          # розмір файлу - 8
  $bw.Write([System.Text.Encoding]::ASCII.GetBytes('WAVE'))
  $bw.Write([System.Text.Encoding]::ASCII.GetBytes('fmt '))
  $bw.Write([int]16)                       # розмір fmt-блока
  $bw.Write([int16]1)                      # PCM
  $bw.Write([int16]1)                      # моно
  $bw.Write([int]$rate)
  $bw.Write([int]($rate * 2))              # byteRate
  $bw.Write([int16]2)                      # blockAlign
  $bw.Write([int16]16)                     # bitsPerSample
  $bw.Write([System.Text.Encoding]::ASCII.GetBytes('data'))
  $bw.Write([int]$dataLen)
  foreach ($s in $pcm) { $bw.Write([int16]$s) }
} finally {
  $bw.Dispose(); $fs.Dispose()
}

'crystal.wav -> ' + $out + ' (' + (Get-Item $out).Length + ' bytes)'