@echo off
REM Development server script for Windows
echo ========================================
echo   MyHomeFlix - Servidor de Desenvolvimento
echo ========================================
echo.
echo Iniciando servidor em http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Detect package manager
where yarn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call yarn dev
) else (
    call npm run dev
)
