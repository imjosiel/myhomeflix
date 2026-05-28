// Upload page
'use client';

import { useState } from 'react';
import { MainNav } from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Film, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UploadState = 'idle' | 'requestingUrl' | 'uploading' | 'done' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFiles, setSubtitleFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<UploadState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setProgress(0);

    if (!videoFile) {
      setMessage('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    if (!title.trim()) {
      setMessage('Por favor, insira um título para o vídeo.');
      return;
    }

    try {
      setStatus('requestingUrl');
      setProgress(10);

      // Request presigned URL for video
      const urlRes = await fetch('/api/r2/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: videoFile.name,
          contentType: videoFile.type || 'video/mp4',
          kind: 'video_master',
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!urlRes.ok) {
        const error = await urlRes.json();
        throw new Error(error.error || 'Falha ao obter URL de upload');
      }

      const { uploadUrl, key, videoId } = await urlRes.json();
      setProgress(20);

      // Upload video to R2
      setStatus('uploading');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': videoFile.type || 'video/mp4',
        },
        body: videoFile,
      });

      if (!uploadRes.ok) {
        throw new Error('Falha ao enviar vídeo para o armazenamento');
      }

      setProgress(60);

      // Mark upload as complete
      const completeRes = await fetch('/api/videos/mark-upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, sourceKey: key }),
      });

      if (!completeRes.ok) {
        throw new Error('Falha ao marcar upload como completo');
      }

      setProgress(80);

      // Upload subtitle files if any
      if (subtitleFiles.length > 0) {
        for (let i = 0; i < subtitleFiles.length; i++) {
          const file = subtitleFiles[i];
          const subtitleRes = await fetch('/api/r2/get-upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: 'text/plain',
              kind: 'subtitle',
              videoId,
              languageCode: 'pt', // TODO: Allow user to select language
              label: 'Português',
            }),
          });

          if (subtitleRes.ok) {
            const { uploadUrl: subtitleUrl } = await subtitleRes.json();
            await fetch(subtitleUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'text/plain' },
              body: file,
            });
          }
        }
      }

      setProgress(100);
      setStatus('done');
      setMessage(`Upload concluído com sucesso! ID do vídeo: ${videoId}`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus('error');
      setMessage(err.message || 'Ocorreu um erro durante o upload.');
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload de Vídeo</h1>
          <p className="text-muted-foreground">
            Envie seus vídeos para a plataforma de streaming
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Vídeo</CardTitle>
            <CardDescription>
              Preencha as informações e selecione o arquivo de vídeo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Digite o título do vídeo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={status === 'uploading' || status === 'requestingUrl'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Adicione uma descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={status === 'uploading' || status === 'requestingUrl'}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Arquivo de Vídeo *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setVideoFile(file ?? null);
                    }}
                    disabled={status === 'uploading' || status === 'requestingUrl'}
                    className="cursor-pointer"
                  />
                  {videoFile && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selecionado: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitles">Legendas (SRT) - Opcional</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <Input
                    id="subtitles"
                    type="file"
                    accept=".srt"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setSubtitleFiles(files);
                    }}
                    disabled={status === 'uploading' || status === 'requestingUrl'}
                    className="cursor-pointer"
                  />
                  {subtitleFiles.length > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {subtitleFiles.length} arquivo(s) de legenda selecionado(s)
                    </p>
                  )}
                </div>
              </div>

              {(status === 'uploading' || status === 'requestingUrl') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso do upload</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {message && (
                <div
                  className={`p-4 rounded-md flex items-start gap-3 ${
                    status === 'error'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {status === 'error' ? (
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={status === 'uploading' || status === 'requestingUrl' || status === 'done'}
              >
                {status === 'uploading' || status === 'requestingUrl' ? (
                  <>
                    <Upload className="mr-2 h-5 w-5 animate-pulse" />
                    Enviando...
                  </>
                ) : status === 'done' ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Concluído!
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
