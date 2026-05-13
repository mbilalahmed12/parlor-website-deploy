@echo off
echo ========================================
echo Clearing Next.js cache...
echo ========================================
rmdir /s /q .next 2>nul
echo ✓ Cache cleared

echo.
echo ========================================
echo Stopping any existing dev servers...
echo ========================================
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak

echo.
echo ========================================
echo Starting fresh dev server...
echo ========================================
call npm run dev

pause
