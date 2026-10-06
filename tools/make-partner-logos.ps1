# Generates solid partner logo tiles as SVG: 120x60 px, gradient background,
# white line icon centered. NO text letters.
# ASCII-safe for Windows PowerShell 5.1.
$ErrorActionPreference = 'Stop'
$dir = Join-Path $PSScriptRoot '..\assets\partners'
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

# name, file, bg gradient colors, icon path (24x24 viewBox)
$logos = @(
  @{ n = 'Barman UA';     f = 'barman-ua.svg';    c1 = '#1a2340'; c2 = '#2e4a8f'; icon = '<path d="M6 3h12l-6 8.5zM12 11.5V19M8 21h8" stroke="white" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' },
  @{ n = 'Fresh Market';  f = 'fresh-market.svg'; c1 = '#1b5e20'; c2 = '#43a047'; icon = '<path d="M12 21c-4-3-7-6.2-7-9.8A6.6 6.6 0 0 1 12 5a6.6 6.6 0 0 1 7 6.2c0 3.6-3 6.8-7 9.8z" fill="none" stroke="white" stroke-width="1.8"/><path d="M12 21V9m0 3 2.4-2.4M12 14l-2.8-2.8" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round"/>' },
  @{ n = 'Sushi Master';  f = 'sushi-master.svg'; c1 = '#b71c1c'; c2 = '#e53935'; icon = '<circle cx="8.5" cy="14" r="3.2" fill="none" stroke="white" stroke-width="1.7"/><circle cx="15.5" cy="14" r="3.2" fill="none" stroke="white" stroke-width="1.7"/><path d="M5.5 8h13" stroke="white" stroke-width="1.7" stroke-linecap="round"/>' },
  @{ n = 'Kyiv Catering'; f = 'kyiv-catering.svg';c1 = '#4a148c'; c2 = '#7e57c2'; icon = '<circle cx="12" cy="7" r="2.6" fill="none" stroke="white" stroke-width="1.7"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0z" fill="none" stroke="white" stroke-width="1.7" stroke-linejoin="round"/>' },
  @{ n = 'Ice Bar';       f = 'ice-bar.svg';      c1 = '#063a6b'; c2 = '#0e93b4'; icon = '<path d="M12 2 4 6.5v11L12 22l8-4.5v-11z" fill="none" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 2v20M4 6.5 12 11l8-4.5" stroke="white" stroke-width="1.4" fill="none"/>' }
)

foreach ($p in $logos) {
  # Tile: 120x60, radius 10. Icon 36x36 centered: translate((120-36)/2 (60-36)/2) scale(36/24)
  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" width="120" height="60">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="$($p.c1)"/>
      <stop offset="1" stop-color="$($p.c2)"/>
    </linearGradient>
  </defs>
  <rect width="120" height="60" rx="10" fill="url(#g)"/>
  <g transform="translate(42 12) scale(1.5)">$($p.icon)</g>
</svg>
"@
  [System.IO.File]::WriteAllText((Join-Path $dir $p.f), $svg, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ("OK " + $p.f)
}
