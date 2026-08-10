@echo off
cd /d "%~dp0"
echo.
echo Nefeli Hadjipitta Website - Local Server
echo -----------------------------------------
echo Opening http://localhost:8000
echo Press CTRL+C in this window to stop the server.
echo.
start "" "http://localhost:8000"
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
