// Home page
import { MainNav } from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Upload, Users, Shield, Zap, Globe } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              Plataforma de Streaming Moderna
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Compartilhe Seus Vídeos com o Mundo
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Uma plataforma profissional de streaming com suporte a HLS, múltiplas qualidades, 
            legendas e controle de acesso baseado em roles.
          </p>
          <div className="flex gap-4 justify-center">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8">
                    Ir para Dashboard
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    <Upload className="mr-2 h-5 w-5" />
                    Fazer Upload
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8">
                    Começar Agora
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Saiba Mais
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Poderosos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tudo que você precisa para criar uma plataforma de streaming profissional
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Streaming HLS</CardTitle>
                <CardDescription>
                  Streaming adaptativo com HLS para melhor qualidade e performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Múltiplas qualidades (1080p, 720p, 480p)</li>
                  <li>• Adaptação automática de bitrate</li>
                  <li>• Compatibilidade universal</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Upload className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Upload Direto</CardTitle>
                <CardDescription>
                  Upload seguro e rápido direto para Cloudflare R2
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Presigned URLs para segurança</li>
                  <li>• Upload de grandes arquivos</li>
                  <li>• Processamento automático</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Legendas</CardTitle>
                <CardDescription>
                  Suporte completo a legendas em formato SRT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Múltiplos idiomas</li>
                  <li>• Formato SRT padrão</li>
                  <li>• Sincronização perfeita</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Controle de Acesso</CardTitle>
                <CardDescription>
                  Sistema de roles com admin, moderadores e editores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Autenticação com Google OAuth</li>
                  <li>• Roles personalizados</li>
                  <li>• Segurança JWT</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Gerenciamento</CardTitle>
                <CardDescription>
                  Dashboard completo para gerenciar seus vídeos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visualização de estatísticas</li>
                  <li>• Edição de metadados</li>
                  <li>• Controle total</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Alta Performance</CardTitle>
                <CardDescription>
                  Otimizado com Next.js 14 e Cloudflare R2
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CDN global da Cloudflare</li>
                  <li>• Sem custos de egress</li>
                  <li>• Máxima velocidade</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Entre na plataforma e comece a compartilhar seus vídeos hoje mesmo.
            </p>
            {!session && (
              <Link href="/login">
                <Button size="lg" className="text-lg px-8">
                  Entrar Agora
                </Button>
              </Link>
            )}
            {session && (
              <Link href="/upload">
                <Button size="lg" className="text-lg px-8">
                  <Upload className="mr-2 h-5 w-5" />
                  Fazer Primeiro Upload
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 StreamPlatform. Construído com Next.js, Prisma, Cloudflare R2 e NextAuth.</p>
        </div>
      </footer>
    </div>
  );
}
