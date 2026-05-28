import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'StreamPlatform - Plataforma de Streaming',
  description: 'Plataforma moderna de streaming com HLS, NextAuth, Prisma e Cloudflare R2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}