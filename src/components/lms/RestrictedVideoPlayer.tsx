import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface RestrictedVideoPlayerProps {
  videoUrl: string;
  durationMinutes: number;
  maxWatchedSeconds: number;
  onProgress: (currentSeconds: number) => void;
  onComplete: () => void;
  className?: string;
}

const RestrictedVideoPlayer: React.FC<RestrictedVideoPlayerProps> = ({
  videoUrl,
  durationMinutes,
  maxWatchedSeconds,
  onProgress,
  onComplete,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedRef = useRef(maxWatchedSeconds);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationMinutes * 60);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const isStream = videoUrl.includes('sharepoint.com') || videoUrl.includes('microsoftstream.com');

  useEffect(() => {
    maxWatchedRef.current = Math.max(maxWatchedRef.current, maxWatchedSeconds);
  }, [maxWatchedSeconds]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    setCurrentTime(current);

    // Prevent seeking beyond max watched
    if (current > maxWatchedRef.current + 2) {
      video.currentTime = maxWatchedRef.current;
      return;
    }

    // Update max watched
    if (current > maxWatchedRef.current) {
      maxWatchedRef.current = current;
    }

    onProgress(maxWatchedRef.current);

    // Check completion (95% threshold) — always use configured durationMinutes
    // to avoid premature completion when video file is shorter than configured length
    const totalDuration = durationMinutes * 60;
    if (totalDuration > 0 && maxWatchedRef.current >= totalDuration * 0.95) {
      onComplete();
    }
  }, [durationMinutes, onProgress, onComplete]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxWatchedRef.current + 2) {
      video.currentTime = maxWatchedRef.current;
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      if (maxWatchedRef.current > 0 && maxWatchedRef.current < video.duration) {
        video.currentTime = maxWatchedRef.current;
      }
    }
  }, []);

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
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    const targetTime = pct * duration;
    // Only allow seeking to already-watched content
    if (targetTime <= maxWatchedRef.current) {
      video.currentTime = targetTime;
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
      setIsPlaying(true);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isStream) {
    return (
      <div className={cn('relative w-full aspect-video bg-foreground/5 rounded-lg overflow-hidden', className)}>
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          title="Video Player"
          allow="autoplay"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent">
          <p className="text-primary-foreground text-xs opacity-75">
            Stream embed — completion tracking requires manual confirmation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full aspect-video bg-foreground/5 rounded-lg overflow-hidden group cursor-pointer',
        className
      )}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain bg-foreground/95"
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); onComplete(); }}
        playsInline
      />

      {/* Play overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </div>
        </div>
      )}

      {/* Custom controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-primary-foreground/20 rounded-full mb-3 cursor-pointer relative group/progress"
          onClick={handleProgressClick}
        >
          {/* Max watched indicator */}
          <div
            className="absolute top-0 left-0 h-full bg-primary-foreground/30 rounded-full"
            style={{ width: `${(maxWatchedRef.current / duration) * 100}%` }}
          />
          {/* Current position */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-foreground rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={restart}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={toggleMute}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <span className="text-primary-foreground text-xs ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={toggleFullscreen}>
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestrictedVideoPlayer;
