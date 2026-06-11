# MyHomeFlix - Windows Setup Guide

## 🚀 Início Rápido no Windows

### 1. Pré-requisitos

✅ Node.js 18+ ([Download](https://nodejs.org/))
✅ Git ([Download](https://git-scm.com/download/win))
✅ Yarn (instale com `npm install -g yarn`)

### 2. Clone o Repositório

```powershell
git clone https://github.com/imjosiel/myhomeflix.git
cd myhomeflix
```

### 3. Configure as Credenciais

Copie o arquivo de exemplo:
```powershell
Copy-Item .env.example .env
```

Edite o `.env` e preencha suas credenciais:
- DATABASE_URL (Neon.tech)
- GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
- R2 credentials (Cloudflare)
- NEXTAUTH_SECRET
- PROCESSOR_API_KEY

**Gerar secrets no PowerShell:**
```powershell
# NEXTAUTH_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# PROCESSOR_API_KEY
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
```

### 4. Setup Automático (Recomendado)

**Opção A: Duplo clique no arquivo**
```
setup.bat
```

**Opção B: PowerShell**
```powershell
.\setup.bat
```

Isso vai:
- ✅ Criar arquivo .env
- ✅ Instalar dependências
- ✅ Gerar Prisma Client
- ✅ Sincronizar banco de dados

### 5. Iniciar Servidor

**Opção A: Duplo clique no arquivo**
```
dev.bat
```

**Opção B: PowerShell**
```powershell
.\dev.bat
```

**Opção C: Comando direto**
```powershell
yarn dev
```

Acesse: http://localhost:3000

---

## 📝 Comandos Úteis

### Desenvolvimento
```powershell
yarn dev              # Inicia servidor de desenvolvimento
yarn build            # Build para produção
yarn start            # Inicia servidor de produção
```

### Banco de Dados
```powershell
yarn db:generate      # Gera Prisma Client
yarn db:push          # Sincroniza schema com banco
yarn db:studio        # Abre Prisma Studio (interface visual)
```

### Setup
```powershell
yarn setup            # Instala dependências e gera Prisma Client
```

---

## 🔧 Troubleshooting Windows

### Erro: "yarn não é reconhecido"
```powershell
npm install -g yarn
```

### Erro: "Não é possível executar scripts"
Execute como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "NODE_OPTIONS não é reconhecido"
Já está corrigido! Usamos `cross-env` agora.

### Erro: "Prisma não consegue conectar"
- Verifique se `DATABASE_URL` está correto no `.env`
- Use `DIRECT_URL` para Prisma CLI (Neon.tech)
- Certifique-se que termina com `?sslmode=require`

### Porta 3000 já em uso
```powershell
# Mate o processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <numero_do_pid> /F

# Ou use outra porta
yarn dev --port 3001
```

---

## 📦 Estrutura de Pastas

```
myhomeflix/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── upload/            # Upload page
│   └── videos/            # Videos pages
├── components/            # React components
├── lib/                   # Utilities
├── prisma/                # Database schema
├── scripts/               # Video processor
├── .github/workflows/     # GitHub Actions
├── setup.bat             # Setup para Windows
├── dev.bat               # Iniciar dev server
└── .env                  # Suas credenciais (não commitado)
```

---

## 🎬 Video Processor

Veja `PROCESSOR_SETUP.md` para configurar o processamento automático de vídeos via GitHub Actions.

---

## 🆘 Precisa de Ajuda?

1. Veja `CREDENTIALS.md` - Guia completo de credenciais
2. Veja `PROCESSOR_SETUP.md` - Setup do video processor
3. Veja `README.md` - Documentação completa

---

**Desenvolvido com ❤️ para Windows, macOS e Linux**
