# VodaLed - local static server (no external deps)
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1 8123
# Then open http://localhost:8123

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
  '.gif'  = 'image/gif'
  '.mp4'  = 'video/mp4'
  '.xml'  = 'application/xml; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.wav'  = 'audio/wav'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
}

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

while ($listener.IsListening) {
  $ctx  = $listener.GetContext()
  $req  = $ctx.Request
  $path = $req.Url.AbsolutePath

  try {
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
