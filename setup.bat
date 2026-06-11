@echo off
REM Setup script for Windows
echo ========================================
echo   MyHomeFlix - Setup para Windows
echo ========================================
echo.

REM Detect package manager
where yarn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PKG_MANAGER=yarn
    set PKG_INSTALL=yarn install
    set PKG_RUN=yarn
) else (
    set PKG_MANAGER=npm
    set PKG_INSTALL=npm install
    set PKG_RUN=npm run
)

echo Usando: %PKG_MANAGER%
echo.

REM Check if .env exists
if not exist .env (
    echo [1/5] Criando arquivo .env...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANTE: Configure o arquivo .env com suas credenciais!
    echo    Abra o arquivo .env e preencha os valores necessarios.
    echo.
    pause
) else (
    echo [1/5] Arquivo .env ja existe ✓
)

echo.
echo [2/5] Instalando dependencias...
call %PKG_INSTALL%
if errorlevel 1 (
    echo ❌ Erro ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [3/5] Gerando Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Erro ao gerar Prisma Client
    pause
    exit /b 1
)

echo.
echo [4/5] Sincronizando schema com banco de dados...
call npx prisma db push
if errorlevel 1 (
    echo ⚠️  Aviso: Verifique se o DATABASE_URL esta configurado corretamente no .env
    pause
)

echo.
echo ========================================
echo   ✅ Setup concluido!
echo ========================================
echo.
echo Proximo passo:
echo   Execute: dev.bat
echo.
pause
