# VodaLed - local static server with admin API (no external deps)
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1 8123
# Then open http://localhost:8123  (admin: http://localhost:8123/admin.html)
#
# API (localhost only):
#   POST /api/config  - body: raw JSON  -> saves config.json (+ .bak)
#   POST /api/image?name=x.png - body: raw bytes -> saves into assets/ (or assets/ice/)

param([int]$Port = 8123)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.webp' = 'image/webp'
  '.wav'  = 'audio/wav'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
}

# Allowed image names for upload (no arbitrary file writes)
$allowedImages = @(
  'promo-banner.png',
  'ice/kub.png', 'ice/premium.png', 'ice/krash.png', 'ice/kub-1kg.png'
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
try {
  $listener.Start()
} catch {
  Write-Host "Cannot bind port $Port (maybe already in use)." -ForegroundColor Red
  exit 1
}
Write-Host "VodaLed server -> http://localhost:$Port  (Ctrl+C to stop)" -ForegroundColor Cyan

function Send-Bytes($ctx, [byte[]]$bytes, $type, $code = 200) {
  $ctx.Response.StatusCode = $code
  $ctx.Response.ContentType = $type
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.AddHeader('Cache-Control','no-cache')
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.OutputStream.Close()
}

function Send-Text($ctx, [string]$text, $code = 200) {
  Send-Bytes $ctx ([System.Text.Encoding]::UTF8.GetBytes($text)) 'text/plain; charset=utf-8' $code
}

function Send-Json($ctx, [object]$obj, $code = 200) {
  $json = $obj | ConvertTo-Json -Compress
  Send-Bytes $ctx ([System.Text.Encoding]::UTF8.GetBytes($json)) 'application/json; charset=utf-8' $code
}

while ($listener.IsListening) {
  $ctx  = $listener.GetContext()
  $req  = $ctx.Request
  $path = $req.Url.AbsolutePath

  try {
    # ---------------- API: save config ----------------
    if ($req.HttpMethod -eq 'POST' -and $path -eq '/api/config') {
      # Always decode body as UTF-8 regardless of the declared charset
      # (some clients omit or misstate it, which mangles Cyrillic)
      $body = (New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)).ReadToEnd()
      try {
        $null = $body | ConvertFrom-Json   # validate
      } catch {
        Send-Json $ctx @{ ok = $false; error = "Invalid JSON: $($_.Exception.Message)" } 400
        continue
      }
      $cfgPath = Join-Path $root 'config.json'
      if (Test-Path $cfgPath) { Copy-Item $cfgPath ($cfgPath + '.bak') -Force }
      [System.IO.File]::WriteAllText($cfgPath, $body, (New-Object System.Text.UTF8Encoding($false)))
      Send-Json $ctx @{ ok = $true; saved = 'config.json'; backup = 'config.json.bak' }
      continue
    }

    # ---------------- API: upload image ----------------
    if ($req.HttpMethod -eq 'POST' -and $path -eq '/api/image') {
      $name = [System.Web.HttpUtility]::UrlDecode(($req.QueryString['name'] -as [string]))
      if (-not $name -or ($allowedImages -notcontains $name)) {
        Send-Json $ctx @{ ok = $false; error = 'name not allowed'; allowed = $allowedImages } 400
        continue
      }
      $dest = Join-Path (Join-Path $root 'assets') ($name -replace '/', '\')
      $dir = Split-Path -Parent $dest
      if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
      if (Test-Path $dest) { Copy-Item $dest ($dest + '.bak') -Force }
      $ms = New-Object System.IO.MemoryStream
      $req.InputStream.CopyTo($ms)
      [System.IO.File]::WriteAllBytes($dest, $ms.ToArray())
      Send-Json $ctx @{ ok = $true; saved = ('assets/' + $name); bytes = $ms.Length }
      continue
    }

    # ---------------- static files ----------------
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root ($path -replace '/', '\')

    if ((Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path.StartsWith($root))) {
      $ext  = [System.IO.Path]::GetExtension($file).ToLower()
      $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      Send-Bytes $ctx $bytes $type
    } else {
      Send-Text $ctx '404 Not Found' 404
    }
  } catch {
    Write-Host ("Request error " + $path + ": " + $_.Exception.Message) -ForegroundColor Yellow
    try { Send-Text $ctx ('500: ' + $_.Exception.Message) 500 } catch {}
  }
}
