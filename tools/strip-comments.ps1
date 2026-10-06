# Removes essay-style (multi-line) comments from site code.
# RULES:
#   CSS/JS : a /* ... */ block is removed if it spans lines or is longer than 120 chars.
#            Short single-line notes and section banners (-----) are kept.
#   HTML   : only multi-line <!-- ... --> comments are removed; one-line labels are kept.
# INVARIANTS (checked before/after per file): counts of { } ( ) :// <script <style must match.
# UTF-8 (no BOM) output; line endings untouched (files are CRLF).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools/strip-comments.ps1

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path   # ...\vodaled\tools
$root = Split-Path -Parent $here                          # ...\vodaled

$files = @(
  'css/style.css',
  'js/main.js',
  'index.html',
  'components/header.html',
  'components/footer.html'
)

function Count-All([string]$s, [string]$pattern) {
  return [regex]::Matches($s, [regex]::Escape($pattern)).Count
}

function Collapse-BlankLines([string]$s) {
  $s = [regex]::Replace($s, '[ \t]+(?=\r?\n)', '')                         # trailing spaces
  $s = [regex]::Replace($s, '(\r?\n)[ \t]*(\r?\n(?:[ \t]*\r?\n)+)', '$1$1') # 2+ blanks -> 1
  $s = $s.TrimStart([char[]]@(13, 10, 32, 9))
  $s = $s -replace '(\r?\n)+$', "`r`n"                                      # single EOL at EOF
  return $s
}

foreach ($rel in $files) {
  $path = Join-Path $root $rel
  if (-not (Test-Path $path)) { Write-Output "SKIP (missing): $rel"; continue }

  $s = [IO.File]::ReadAllText($path)
  $linesBefore = ([regex]::Matches($s, '\r?\n')).Count + 1

  $marks = @('{', '}', '(', ')', '://', '<script', '</script', '<style', '</style')
  $before = @{}
  foreach ($m in $marks) { $before[$m] = Count-All $s $m }

  # 1) find all comment matches, split into kept / removed
  $kept = New-Object System.Collections.Generic.List[string]
  $removed = New-Object System.Collections.Generic.List[string]
  if ($rel -like '*.html') {
    # multi-line HTML comments go; one-line labels stay
    [regex]::Matches($s, '<!--.*?-->', 'Singleline') | ForEach-Object {
      if ($_.Value -match '\r|\n') { $removed.Add($_.Value) } else { $kept.Add($_.Value) }
    }
  }
  else {
    # multi-line and long /* */ go; short one-line notes stay
    [regex]::Matches($s, '/\*.*?\*/', 'Singleline') | ForEach-Object {
      if ($_.Value -match '\r|\n' -or $_.Value.Length -gt 120) { $removed.Add($_.Value) } else { $kept.Add($_.Value) }
    }
  }

  # 2) remove them
  $removedConcat = ($removed -join "`n")
  $s2 = [regex]::Replace($s, '<!--.*?-->', { param($m) if ($m.Value -match '\r|\n') { '' } else { $m.Value } }, 'Singleline')
  if ($rel -notlike '*.html') {
    $s2 = [regex]::Replace($s2, '/\*.*?\*/', { param($m) if ($m.Value -match '\r|\n' -or $m.Value.Length -gt 120) { '' } else { $m.Value } }, 'Singleline')
  }

  $s2 = Collapse-BlankLines $s2

  # 3) every disappearance must be accounted for inside removed comments
  #    (the count itself is EXPECTED to drop: comments contain braces/parens too)
  $ok = $true
  foreach ($m in $marks) {
    $a = Count-All $s2 $m
    $inRemoved = Count-All $removedConcat $m
    if (($before[$m] - $a) -ne $inRemoved) {
      Write-Output ("  !! INVARIANT BROKEN in {0}: '{1}' was {2}, now {3}, inside removed comments {4}" -f $rel, $m, $before[$m], $a, $inRemoved)
      $ok = $false
    }
  }

  if ($ok) {
    [IO.File]::WriteAllText($path, $s2, [Text.UTF8Encoding]::new($false))
    $linesAfter = ([regex]::Matches($s2, '\r?\n')).Count + 1
    Write-Output ("OK  {0}: {1} -> {2} lines (-{3}); comments kept {4}, removed {5}" -f $rel, $linesBefore, $linesAfter, ($linesBefore - $linesAfter), $kept.Count, $removed.Count)
  }
  else {
    Write-Output "FAIL $rel : file NOT written"
  }
}
