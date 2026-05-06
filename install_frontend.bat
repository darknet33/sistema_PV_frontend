@echo off
echo ==============================================
echo   Instalación Frontend - Sistema RHINO 3.0
echo ==============================================
echo.

cd frontend

echo Instalando dependencias de Node.js...
call npm install --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo ERROR: Falló la instalación de dependencias
    echo Intenta manualmente: cd frontend && npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo ==============================================
echo   ¡FRONTEND INSTALADO CORRECTAMENTE!
echo ==============================================
echo.
echo Para ejecutar el servidor de desarrollo:
echo   cd frontend
echo   npm run dev
echo.
echo Accede a: http://localhost:3000
echo.
pause
