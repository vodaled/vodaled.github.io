Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
  Where-Object { $_.CommandLine -match 'serve\.ps1' } |
  ForEach-Object { "PID $($_.ProcessId): $($_.CommandLine)" }
