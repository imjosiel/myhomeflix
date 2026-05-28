// Individual video page with player
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import VideoPlayer from '@/components/video-player';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import { getVideoForPlayback } from '@/lib/video-service';
import { R2_PUBLIC_BASE_URL } from '@/lib/r2';

interface PageProps {
  params: { id: string };
}

export default async function VideoPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const video = await getVideoForPlayback(params.id);

  if (!video) {
    notFound();
  }

  // Check if video is ready for playback
  const isReady = video.status === 'READY' && video.masterPlaylistKey;
  const manifestUrl = isReady
    ? `${R2_PUBLIC_BASE_URL}/${video.masterPlaylistKey}`
    : '';

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video player and info */}
          <div className="lg:col-span-2 space-y-6">
            {isReady ? (
              <VideoPlayer
                manifestUrl={manifestUrl}
                subtitles={video.subtitles}
                poster={video.thumbnailKey ? `${R2_PUBLIC_BASE_URL}/${video.thumbnailKey}` : undefined}
              />
            ) : (
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {video.status === 'TRANSCODING' && (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-lg font-medium">Processando vídeo...</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Seu vídeo está sendo transcodificado. Isso pode levar alguns minutos.
                      </p>
                    </>
                  )}
                  {video.status === 'QUEUED_FOR_TRANSCODE' && (
                    <>
                      <div className="h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-lg font-medium">Na fila para processamento</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Seu vídeo será processado em breve.
                      </p>
                    </>
                  )}
                  {video.status === 'FAILED' && (
                    <>
                      <p className="text-lg font-medium text-destructive">Erro ao processar vídeo</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Ocorreu um erro durante o processamento. Entre em contato com o suporte.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {new Date(video.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {video.duration && (
                      <span>• {Math.floor(video.duration / 60)} minutos</span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    video.status === 'READY'
                      ? 'default'
                      : video.status === 'FAILED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {video.status === 'READY' && 'Pronto'}
                  {video.status === 'TRANSCODING' && 'Processando'}
                  {video.status === 'QUEUED_FOR_TRANSCODE' && 'Na fila'}
                  {video.status === 'FAILED' && 'Erro'}
                  {video.status === 'UPLOADING' && 'Enviando'}
                </Badge>
              </div>

              {video.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{video.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar with details */}
          <div className="space-y-6">
            {/* Uploader info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enviado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={video.user.image ?? undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{video.user.name}</p>
                    <p className="text-sm text-muted-foreground">{video.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video qualities */}
            {video.qualities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Qualidades Disponíveis</CardTitle>
                  <CardDescription>
                    {video.qualities.length} opção(ões) de qualidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {video.qualities.map((quality) => (
                      <div
                        key={quality.id}
                        className="flex items-center justify-between text-sm p-2 rounded-md bg-muted"
                      >
                        <span className="font-medium">{quality.label}</span>
                        <span className="text-muted-foreground">
                          {quality.width}x{quality.height} @ {Math.round(quality.bitrate / 1000)}Mbps
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subtitles */}
            {video.subtitles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legendas</CardTitle>
                  <CardDescription>
                    {video.subtitles.length} idioma(s) disponível(is)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {video.subtitles.map((subtitle) => (
                      <div
                        key={subtitle.id}
                        className="flex items-center justify-between text-sm p-2 rounded-md bg-muted"
                      >
                        <span className="font-medium">{subtitle.label}</span>
                        <Badge variant="outline">{subtitle.languageCode}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
