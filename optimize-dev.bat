@echo off
echo Optimizing development environment for Windows...

REM Clean Next.js cache
if exist ".next" (
    echo Cleaning .next directory...
    rmdir /s /q ".next" 2>nul
)

REM Clean node_modules cache
if exist "node_modules\.cache" (
    echo Cleaning node_modules cache...
    rmdir /s /q "node_modules\.cache" 2>nul
)

REM Clean Turbo cache
if exist ".turbo" (
    echo Cleaning Turbo cache...
    rmdir /s /q ".turbo" 2>nul
)

REM Set environment variables for better performance
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096
set WATCHPACK_POLLING=false
set NEXT_PRIVATE_STANDALONE=true

echo.
echo Optimization complete!
echo.
echo Available commands:
echo   npm run dev       - Standard Turbopack mode
echo   npm run dev:fast  - Optimized Turbopack mode
echo   npm run dev:webpack - Webpack fallback mode
echo.
echo For even better performance, run 'antivirus-exclude.bat' as Administrator
echo to exclude this project from Windows Defender scanning.
echo.
pause