// Videos list page
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';

export default async function VideosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Fetch videos from API
  const videos: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vídeos</h1>
            <p className="text-muted-foreground">Gerencie seus vídeos na plataforma</p>
          </div>
          <Link href="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Novo Upload
            </Button>
          </Link>
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Video className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum vídeo encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não enviou nenhum vídeo. Comece fazendo seu primeiro upload!
              </p>
              <Link href="/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video: any) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                    {video.status === 'READY' && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Pronto
                      </Badge>
                    )}
                    {video.status === 'TRANSCODING' && (
                      <Badge variant="secondary" className="ml-2">
                        <Clock className="mr-1 h-3 w-3" />
                        Processando
                      </Badge>
                    )}
                    {video.status === 'FAILED' && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Erro
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {video.description || 'Sem descrição'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/videos/${video.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
