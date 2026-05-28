# 🔑 Guia de Configuração de Credenciais

Este documento detalha como obter todas as credenciais necessárias para executar a plataforma de streaming.

## 📋 Checklist de Credenciais

- [ ] Google OAuth (Client ID + Client Secret)
- [ ] Neon.tech PostgreSQL (DATABASE_URL + DIRECT_URL)
- [ ] Cloudflare R2 (Account ID + Access Keys + Bucket)
- [ ] NextAuth Secret

---

## 1. Google OAuth Credentials

### Passo a Passo:

1. **Acesse o Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Crie ou Selecione um Projeto**
   - Clique em "Select a project" no topo
   - Clique em "New Project"
   - Nome: "StreamPlatform" (ou qualquer nome)
   - Clique em "Create"

3. **Configure OAuth Consent Screen**
   - Menu → **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → Click "Create"
   - Preencha:
     - App name: StreamPlatform
     - User support email: seu@email.com
     - Developer contact: seu@email.com
   - Clique em "Save and Continue"
   - Scopes: Clique em "Add or Remove Scopes"
     - Selecione: `.../auth/userinfo.email` e `.../auth/userinfo.profile`
   - Clique em "Save and Continue"
   - Test users: Adicione seu email para testes
   - Clique em "Save and Continue"

4. **Crie Credentials**
   - Menu → **APIs & Services** → **Credentials**
   - Clique em "**+ CREATE CREDENTIALS**" → **OAuth client ID**
   - Application type: **Web application**
   - Name: "StreamPlatform Web Client"
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-production-domain.com/api/auth/callback/google
     ```
   - Clique em "CREATE"

5. **Copie as Credenciais**
   ```
   GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
   ```

---

## 2. Neon.tech PostgreSQL Database

### Passo a Passo:

1. **Crie uma Conta**
   - URL: https://neon.tech/
   - Clique em "Sign Up" e faça login com GitHub ou Email

2. **Crie um Novo Projeto**
   - Dashboard → "Create Project"
   - Project name: "streaming-platform"
   - Region: Escolha o mais próximo (ex: US East)
   - Postgres Version: Deixe a padrão (16)
   - Clique em "Create Project"

3. **Obtenha as Connection Strings**
   - Na página do projeto, vá em **Connection Details**
   - Copie duas strings:
   
   **Pooled Connection** (para aplicação):
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
   
   **Direct Connection** (para Prisma CLI):
   ```
   DIRECT_URL="postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

4. **Importante**: 
   - A senha está incluída nas strings
   - Mantenha essas credenciais seguras
   - Nunca commite no Git

---

## 3. Cloudflare R2 Storage

### Passo a Passo:

1. **Crie uma Conta Cloudflare**
   - URL: https://dash.cloudflare.com/sign-up
   - Complete o cadastro

2. **Acesse R2 Object Storage**
   - Dashboard → **R2 Object Storage**
   - Clique em "Purchase R2 Plan" ou "Enable R2" (tem plano gratuito)

3. **Crie um Bucket**
   - Clique em "Create bucket"
   - Bucket name: `video-storage` (ou qualquer nome único)
   - Location: Automatic
   - Clique em "Create bucket"

4. **Configure Public Access (para streaming)**
   - Clique no bucket criado
   - Vá em **Settings** tab
   - Em "Public Access":
     - Opção 1: **Public Development URL**
       - Clique em "Enable"
       - Confirme digitando "allow"
       - Copie a URL: `https://pub-xxxxx.r2.dev`
     - Opção 2: **Custom Domain** (recomendado para produção)
       - Clique em "Connect Domain"
       - Digite seu domínio: `cdn.seudominio.com`
       - Siga as instruções de DNS

5. **Crie API Token**
   - Volte para R2 dashboard
   - Clique em "Manage R2 API Tokens"
   - Clique em "Create API Token"
   - Token name: "streaming-platform-token"
   - Permissions: **Object Read & Write**
   - Apply to specific buckets only: Selecione `video-storage`
   - Clique em "Create API Token"

6. **Copie as Credenciais** (APARECEM APENAS UMA VEZ!)
   ```
   R2_ACCOUNT_ID="xxxxx"
   R2_ACCESS_KEY_ID="xxxxx"
   R2_SECRET_ACCESS_KEY="xxxxx"
   R2_BUCKET_NAME="video-storage"
   R2_PUBLIC_BASE_URL="https://pub-xxxxx.r2.dev"
   ```

---

## 4. NextAuth Secret

### Gere o Secret:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Online:**
- https://generate-secret.vercel.app/32

Copie o resultado:
```env
NEXTAUTH_SECRET="abc123xyz789..."
```

---

## 5. URLs da Aplicação

### Desenvolvimento:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Produção (Vercel exemplo):
```env
NEXTAUTH_URL="https://sua-app.vercel.app"
NEXT_PUBLIC_BASE_URL="https://sua-app.vercel.app"
```

---

## ✅ Arquivo .env Final

Depois de coletar todas as credenciais, seu `.env` deve ficar assim:

```env
# Database (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="w8J9x2K5mN7pQ3rT6vY9zA2bC5dF8gH1jK4lM7nP0qR3sT6uV9wX2yZ5aB8cD1eF"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc123xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"

# Cloudflare R2
R2_ACCOUNT_ID="abc123def456ghi789"
R2_ACCESS_KEY_ID="abc123def456ghi789jkl012"
R2_SECRET_ACCESS_KEY="abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
R2_BUCKET_NAME="video-storage"
R2_PUBLIC_BASE_URL="https://pub-abc123xyz789.r2.dev"

# App Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 🔒 Segurança

### ⚠️ NUNCA faça:
- ❌ Commitar `.env` no Git
- ❌ Compartilhar credenciais publicamente
- ❌ Usar credenciais de produção em desenvolvimento
- ❌ Expor API keys no frontend (usar NEXT_PUBLIC_ apenas quando necessário)

### ✅ SEMPRE faça:
- ✅ Use `.env.local` para desenvolvimento
- ✅ Configure variáveis de ambiente na plataforma de deploy (Vercel/Netlify)
- ✅ Rotacione credenciais periodicamente
- ✅ Use diferentes credenciais para dev/staging/production
- ✅ Adicione `.env` no `.gitignore`

---

## 🧪 Testando as Credenciais

Após configurar, teste cada serviço:

### 1. Teste o Banco de Dados:
```bash
npx prisma db push
npx prisma studio
```

### 2. Teste o Google OAuth:
- Acesse http://localhost:3000/login
- Clique em "Continuar com Google"
- Deve redirecionar para Google e voltar autenticado

### 3. Teste o Cloudflare R2:
- Tente fazer upload de um vídeo
- Verifique no dashboard do R2 se o arquivo apareceu

---

## 🆘 Problemas Comuns

### "redirect_uri_mismatch" no Google OAuth
- **Solução**: Verifique se a URL no Google Console está EXATAMENTE igual:
  ```
  http://localhost:3000/api/auth/callback/google
  ```

### Erro de conexão com Neon
- **Solução**: 
  - Verifique se copiou a string completa com `?sslmode=require`
  - Verifique se o projeto no Neon está ativo
  - Tente gerar uma nova senha

### R2 Access Denied
- **Solução**:
  - Verifique se o token tem permissões "Object Read & Write"
  - Verifique se o token está aplicado ao bucket correto
  - Regenere o token se necessário

### NextAuth Session não funciona
- **Solução**:
  - Verifique se `NEXTAUTH_SECRET` está definido
  - Limpe cookies do navegador
  - Reinicie o servidor Next.js

---

## 📞 Suporte

Se precisar de ajuda:

1. Google OAuth: https://support.google.com/cloud/
2. Neon.tech: https://neon.tech/docs
3. Cloudflare R2: https://developers.cloudflare.com/r2/
4. NextAuth.js: https://next-auth.js.org/

---

**Última atualização**: 2024
