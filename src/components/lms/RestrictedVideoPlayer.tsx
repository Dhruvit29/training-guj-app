import React, { useRef, useEffect, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ReplayIcon from '@mui/icons-material/Replay';

interface RestrictedVideoPlayerProps {
  videoUrl: string;
  durationMinutes: number;
  maxWatchedSeconds: number;
  onProgress: (currentSeconds: number) => void;
  onComplete: () => void;
  className?: string;
}

const RestrictedVideoPlayer: React.FC<RestrictedVideoPlayerProps> = ({
  videoUrl, durationMinutes, maxWatchedSeconds, onProgress, onComplete,
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
    if (current > maxWatchedRef.current + 2) { video.currentTime = maxWatchedRef.current; return; }
    if (current > maxWatchedRef.current) maxWatchedRef.current = current;
    onProgress(maxWatchedRef.current);
    const totalDuration = durationMinutes * 60;
    if (totalDuration > 0 && maxWatchedRef.current >= totalDuration * 0.90) onComplete();
  }, [durationMinutes, onProgress, onComplete]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxWatchedRef.current + 2) video.currentTime = maxWatchedRef.current;
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      if (maxWatchedRef.current > 0 && maxWatchedRef.current < video.duration) video.currentTime = maxWatchedRef.current;
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setIsPlaying(true); } else { video.pause(); setIsPlaying(false); }
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
    if (document.fullscreenElement) document.exitFullscreen();
    else video.requestFullscreen();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const targetTime = pct * duration;
    if (targetTime <= maxWatchedRef.current) video.currentTime = targetTime;
  };

  const restart = () => {
    const video = videoRef.current;
    if (video) { video.currentTime = 0; video.play(); setIsPlaying(true); }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isStream) {
    return (
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: '#000' }}>
        <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen title="Video Player" allow="autoplay" />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <Typography variant="caption" sx={{ color: '#fff', opacity: 0.7 }}>
            Stream embed — completion tracking requires manual confirmation
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: '#000', cursor: 'pointer', '&:hover .video-controls': { opacity: 1 } }}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (maxWatchedRef.current >= durationMinutes * 60 * 0.90) onComplete();
        }}
        playsInline
      />

      {/* Play overlay */}
      {!isPlaying && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
            <PlayArrowIcon sx={{ fontSize: 32, color: '#fff', ml: 0.5 }} />
          </Box>
        </Box>
      )}

      {/* Controls */}
      <Box
        className="video-controls"
        onClick={e => e.stopPropagation()}
        sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
        }}
      >
        {/* Progress bar */}
        <Box onClick={handleProgressClick} sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3, mb: 1, cursor: 'pointer', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: `${(maxWatchedRef.current / duration) * 100}%` }} />
          <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', bgcolor: 'primary.light', borderRadius: 3, width: `${(currentTime / duration) * 100}%`, transition: 'width 0.1s' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={togglePlay}>
            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={restart}><ReplayIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={toggleMute}>
            {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
          </IconButton>
          <Typography variant="caption" sx={{ color: '#fff', ml: 0.5 }}>{formatTime(currentTime)} / {formatTime(duration)}</Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" sx={{ color: '#fff' }} onClick={toggleFullscreen}><FullscreenIcon fontSize="small" /></IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RestrictedVideoPlayer;
