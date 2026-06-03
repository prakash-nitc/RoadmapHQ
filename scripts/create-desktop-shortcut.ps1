# ─────────────────────────────────────────────────────────────
#  Create a "DSA Mission Control" shortcut on the Windows desktop
#  pointing at dev.bat. Run once:
#    powershell -ExecutionPolicy Bypass -File scripts\create-desktop-shortcut.ps1
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$batPath  = Join-Path $repoRoot "dev.bat"
$iconPath = Join-Path $repoRoot "public\icon.svg"  # Windows can't use SVG as .lnk icon, fallback below
$desktop  = [Environment]::GetFolderPath("Desktop")
$linkPath = Join-Path $desktop "DSA Mission Control.lnk"

if (-not (Test-Path $batPath)) {
    Write-Host "dev.bat not found at $batPath" -ForegroundColor Red
    exit 1
}

$shell = New-Object -ComObject WScript.Shell
$sc = $shell.CreateShortcut($linkPath)
$sc.TargetPath       = $batPath
$sc.WorkingDirectory = $repoRoot
$sc.Description      = "Launch DSA Mission Control"
$sc.WindowStyle      = 1  # Normal window
# Fall back to a generic Windows icon — replace with your own .ico if you make one.
$sc.IconLocation     = "shell32.dll,137"
$sc.Save()

Write-Host "Shortcut created at: $linkPath" -ForegroundColor Green
Write-Host "Double-click it to start the dev server and open the dashboard."
