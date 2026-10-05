@echo off
setlocal

echo Stopping Veriq local Node server...
taskkill /FI "WINDOWTITLE eq Veriq Backend" /T /F >nul 2>nul
if errorlevel 1 (
  echo No Veriq Backend window was found.
) else (
  echo Veriq server stopped.
)
echo.
pause
