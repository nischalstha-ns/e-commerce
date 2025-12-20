@echo off
echo Deploying Firestore rules...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Deploy only Firestore rules
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo Firestore rules deployed successfully!
) else (
    echo Failed to deploy Firestore rules. Please check your configuration.
    exit /b 1
)

pause