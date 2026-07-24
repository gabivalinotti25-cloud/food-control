@echo off
echo ========================================
echo   Food Control - Iniciando servidores
echo ========================================
echo.

cd /d "%~dp0backend"
start "Food Control - Backend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

cd /d "%~dp0frontend"
start "Food Control - Frontend" cmd /k "npm run dev"

echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Espera unos segundos y abre http://localhost:5173
pause
