@echo off
echo Adding Windows Defender exclusions for better performance...
echo.
echo Run this as Administrator to exclude your project from antivirus scanning:
echo.
echo powershell -Command "Add-MpPreference -ExclusionPath '%CD%'"
echo powershell -Command "Add-MpPreference -ExclusionPath '%CD%\.next'"
echo powershell -Command "Add-MpPreference -ExclusionPath '%CD%\node_modules'"
echo.
echo Copy and run the above commands in an Administrator PowerShell window.
echo.
pause