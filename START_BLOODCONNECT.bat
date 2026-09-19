\
@echo off
setlocal
title BloodConnect

cd /d "%~dp0"

echo.
echo ================================================
echo              BLOODCONNECT
echo ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Please install Node.js LTS and run this file again.
  pause
  exit /b 1
)

if not exist ".env" (
  echo The root .env file is missing.
  echo Please restore it from the ZIP.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing root package...
  call npm install
  if errorlevel 1 goto install_error
)

if not exist "server\node_modules" (
  echo Installing server and client packages...
  call npm run install-all
  if errorlevel 1 goto install_error
)

if not exist "client\node_modules" (
  echo Installing client packages...
  call npm run install-all
  if errorlevel 1 goto install_error
)

echo.
echo Starting BloodConnect...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Keep this window open while using the application.
echo.

call npm run dev
goto done

:install_error
echo.
echo Package installation failed.
echo Check your internet connection and Node.js installation.
pause
exit /b 1

:done
endlocal
