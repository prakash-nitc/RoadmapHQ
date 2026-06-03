@echo off
REM ──────────────────────────────────────────────────────────────
REM  DSA Mission Control — daily launcher
REM  Double-click this file (or pin to Start) to start the dev
REM  server and open the dashboard in your browser.
REM ──────────────────────────────────────────────────────────────

cd /d "%~dp0"

echo.
echo ============================================================
echo   DSA Mission Control
echo   Starting dev server at http://localhost:3000
echo ============================================================
echo.

REM Open the browser after a short delay so the server is ready.
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

REM Run Next.js dev server in this window. Closing the window stops it.
call npm run dev

REM Pause on exit so you can see any error output.
echo.
echo Dev server stopped. Press any key to close...
pause >nul
