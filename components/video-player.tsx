// Video Player component with HLS.js support
'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface Subtitle {
  id: string;
  languageCode: string;
  label: string;
  key: string;
}

interface VideoPlayerProps {
  manifestUrl: string;
  subtitles?: Subtitle[];
  poster?: string;
}

export default function VideoPlayer({ manifestUrl, subtitles = [], poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed successfully');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', event, data);
        if (data.fatal) {
          setError('Erro ao carregar o vídeo');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = manifestUrl;
      video.addEventListener('loadedmetadata', () => {
        console.log('Video loaded (native HLS)');
      });
    } else {
      setError('HLS não é suportado neste navegador');
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [manifestUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-400">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          controls
          className="w-full aspect-video"
          crossOrigin="anonymous"
          poster={poster}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          {subtitles.map((track) => (
            <track
              key={track.id}
              label={track.label}
              kind="subtitles"
              srcLang={track.languageCode}
              src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''}/${track.key}`}
              default={track.languageCode === 'pt'}
            />
          ))}
        </video>

        {/* Custom controls overlay (optional) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <div className="flex-1" />

          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
