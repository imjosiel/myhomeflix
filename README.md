# 🎬 StreamPlatform - Plataforma de Streaming Moderna

Uma plataforma completa de streaming de vídeos construída com **Next.js 14**, **NextAuth.js**, **Prisma**, **PostgreSQL (Neon.tech)**, **Cloudflare R2** e **shadcn/ui**.

## ✨ Funcionalidades

- 🔐 **Autenticação com Google OAuth** via NextAuth.js (JWT Strategy)
- 👥 **Sistema de Roles** (admin, moderador, editor)
- 📹 **Upload de Vídeos** direto para Cloudflare R2 com presigned URLs
- 🎥 **Streaming HLS** com múltiplas qualidades (1080p, 720p, 480p)
- 📝 **Suporte a Legendas SRT**
- 🎨 **UI Moderna** com shadcn/ui e Tailwind CSS
- 🔒 **APIs REST Seguras** com controle de acesso baseado em roles
- 📊 **Dashboard de Gerenciamento**
- ⚡ **Performance Otimizada** com Cloudflare CDN

## 🏗️ Arquitetura

```
Frontend (Next.js)
    ↓
Backend APIs (/api/*)
    ↓
┌──────────────────┬──────────────────────┐
│ PostgreSQL       │ Cloudflare R2        │
│ (Neon.tech)      │ (Video Storage)      │
│ - Users          │ - Videos             │
│ - Videos         │ - HLS Playlists      │
│ - Qualities      │ - Subtitles          │
│ - Subtitles      │                      │
└──────────────────┴──────────────────────┘
```

## 📋 Pré-requisitos

### 1. Google OAuth Credentials

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copie o **Client ID** e **Client Secret**

### 2. Neon.tech PostgreSQL Database

1. Crie uma conta em [Neon.tech](https://neon.tech/)
2. Crie um novo projeto
3. Copie as connection strings:
   - **Pooled Connection** → `DATABASE_URL`
   - **Direct Connection** → `DIRECT_URL`

### 3. Cloudflare R2 Storage

1. Crie uma conta na [Cloudflare](https://dash.cloudflare.com/)
2. Vá em **R2 Object Storage**
3. Crie um novo bucket (ex: `video-storage`)
4. Em **Settings** → **R2 API Tokens**:
   - Clique em **Create API Token**
   - Selecione **Object Read & Write**
   - Aplique ao bucket específico
   - Copie: Account ID, Access Key ID, Secret Access Key
5. Configure **Public Bucket** (opcional para streaming):
   - Settings → **Public Development URL** → Enable
   - Ou configure um **Custom Domain**

## 🚀 Configuração

### Início Rápido

#### **Windows** 🪟
Veja o guia completo: [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

```powershell
# 1. Clone o repositório
git clone https://github.com/imjosiel/myhomeflix.git
cd myhomeflix

# 2. Execute o setup automático (duplo clique ou via PowerShell)
.\setup.bat

# 3. Configure o .env com suas credenciais
# Edite o arquivo .env

# 4. Inicie o servidor (duplo clique ou via PowerShell)
.\dev.bat
```

#### **macOS / Linux** 🐧

```bash
cd /app
yarn install
```

### 1. Clone e Instale Dependências

```bash
cd /app
yarn install
```

### 2. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://user:password@host.region.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host.region.neon.tech/dbname?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Gere com: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudflare R2
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="video-storage"
R2_PUBLIC_BASE_URL="https://your-bucket.r2.dev"

# App Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Gere o NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 4. Configure o Banco de Dados

```bash
# Sincronizar schema com Neon
npx prisma db push

# Gerar Prisma Client
npx prisma generate

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 5. Inicie o Servidor

```bash
yarn dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
/app
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth endpoints
│   │   ├── r2/
│   │   │   └── get-upload-url/     # Gerar presigned URLs
│   │   └── videos/
│   │       ├── route.ts            # Listar vídeos
│   │       ├── [id]/route.ts       # Detalhes do vídeo
│   │       ├── [id]/update/        # Atualizar vídeo
│   │       ├── [id]/delete/        # Deletar vídeo
│   │       └── mark-upload-complete/ # Marcar upload completo
│   ├── dashboard/                  # Dashboard page
│   ├── login/                      # Login page
│   ├── upload/                     # Upload page
│   ├── videos/
│   │   ├── page.tsx               # Lista de vídeos
│   │   └── [id]/page.tsx          # Player de vídeo
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page
│   └── providers.tsx               # Context providers
├── components/
│   ├── main-nav.tsx               # Navigation
│   ├── video-player.tsx           # HLS video player
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── prisma.ts                  # Prisma client
│   ├── r2.ts                      # R2 S3 client
│   ├── r2-presign.ts             # Presigned URLs
│   ├── video-service.ts          # Video business logic
│   └── auth-utils.ts             # Authorization helpers
├── prisma/
│   └── schema.prisma             # Database schema
├── auth.ts                        # NextAuth configuration
├── middleware.ts                  # Route protection
└── types/
    └── next-auth.d.ts            # TypeScript types
```

## 🔌 API Endpoints

### Autenticação

- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/auth/session` - Obter sessão atual

### Vídeos

- `GET /api/videos` - Listar vídeos
  - Query params: `userId`, `status`, `limit`, `offset`
- `GET /api/videos/[id]` - Detalhes do vídeo
- `PUT /api/videos/[id]/update` - Atualizar vídeo
- `DELETE /api/videos/[id]/delete` - Deletar vídeo

### Upload

- `POST /api/r2/get-upload-url` - Gerar presigned URL
  - Body: `{ filename, contentType, kind, title, description }`
- `POST /api/videos/mark-upload-complete` - Marcar upload completo
  - Body: `{ videoId, sourceKey }`

## 👥 Sistema de Roles

### Admin
- Acesso total à plataforma
- Pode gerenciar todos os vídeos
- Pode modificar roles de usuários

### Moderador
- Pode fazer upload de vídeos
- Pode editar/deletar próprios vídeos
- Pode ver todos os vídeos

### Editor
- Pode fazer upload de vídeos
- Pode editar/deletar próprios vídeos
- Acesso padrão para novos usuários

## 🎥 Fluxo de Upload e Streaming

### Upload

1. **Frontend** solicita presigned URL (`/api/r2/get-upload-url`)
2. **Backend** cria registro no banco e gera presigned URL
3. **Frontend** faz upload direto para Cloudflare R2
4. **Frontend** notifica conclusão (`/api/videos/mark-upload-complete`)
5. **Backend** marca vídeo como pronto para transcodificação

### Transcodificação (Futuro Worker)

1. Worker detecta vídeo na fila (`QUEUED_FOR_TRANSCODE`)
2. Baixa vídeo source do R2
3. Usa **ffmpeg** para gerar HLS:
   - Múltiplas qualidades (1080p, 720p, 480p)
   - Playlists `.m3u8`
   - Segments `.ts` ou `.m4s`
4. Upload de volta para R2
5. Atualiza registro com status `READY`

### Streaming

1. **Frontend** obtém `masterPlaylistKey` do vídeo
2. **VideoPlayer** usa `hls.js` para carregar `.m3u8`
3. Player adapta qualidade baseado na conexão
4. Legendas carregadas via `<track>` element

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Auth**: NextAuth.js v5 (JWT Strategy)
- **Database**: PostgreSQL (Neon.tech) + Prisma ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Video**: HLS.js, ffmpeg (para transcodificação)
- **Deployment**: Vercel, Cloudflare Workers

## 🔐 Segurança

- ✅ Autenticação JWT com NextAuth.js
- ✅ Presigned URLs para upload seguro
- ✅ Controle de acesso baseado em roles
- ✅ Middleware de proteção de rotas
- ✅ Variáveis de ambiente server-side
- ✅ Validação de permissões em todas as APIs

## 📝 Próximos Passos

- [ ] Implementar worker de transcodificação com ffmpeg
- [ ] Adicionar sistema de visualizações e analytics
- [ ] Implementar comentários e likes
- [ ] Adicionar busca e filtros avançados
- [ ] Sistema de notificações
- [ ] Upload com progress bar detalhado
- [ ] Suporte a thumbnails personalizadas
- [ ] Playlist e categorias
- [ ] Admin panel para gerenciar usuários
- [ ] Testes automatizados

## 🤝 Contribuindo

Este projeto foi criado como MVP. Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique as credenciais no `.env`
2. Confira os logs do servidor
3. Teste as APIs com curl/Postman
4. Revise a documentação das integrações

---

**Construído com ❤️ usando Next.js, Prisma, Cloudflare R2 e NextAuth.js**
