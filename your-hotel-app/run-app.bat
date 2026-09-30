@echo off
setlocal enabledelayedexpansion
title Grand Horizon Hotel Management — Startup Launcher

echo ========================================================
echo   GRAND HORIZON LUXURY HOTEL MANAGEMENT SYSTEM
echo ========================================================
echo.

:: 1. Check for .NET 8 SDK
echo [1/4] Checking .NET Core 8 SDK...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] .NET 8 SDK is required. Please install .NET 8.
    pause
    exit /b 1
)
echo       .NET 8 SDK detected.

:: 2. Check for Node.js
echo [2/4] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required. Please install Node.js 18+.
    pause
    exit /b 1
)
echo       Node.js detected.

:: 3. Start Backend in separate window
echo [3/4] Launching ASP.NET Core 8 Web API (Port 5000)...
start "Grand Horizon Web API" cmd /k "cd src\server && dotnet run --urls http://localhost:5000"

:: 4. Start Frontend in separate window
echo [4/4] Launching React 18 + Vite Frontend (Port 5174)...
start "Grand Horizon Frontend" cmd /k "cd src\client && npm run dev"

echo.
echo ========================================================
echo   SERVICES INITIATED SUCCESSFULLY!
echo   - Web API:       http://localhost:5000/swagger
echo   - Web Client:    http://localhost:5174
echo.
echo   Opening browser in 4 seconds...
echo ========================================================

timeout /t 4 /nobreak >nul
start http://localhost:5174

echo Press any key to close this launcher window.
pause >nul
