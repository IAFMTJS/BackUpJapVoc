import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaStop, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import AudioService from '../services/AudioService';

interface AudioPlayerProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  useTTS?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  onPlay?: () => void;
  onStop?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  className = '',
  autoPlay = false,
  showControls = true,
  useTTS,
  voice,
  rate,
  pitch,
  onPlay,
  onStop,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioService = AudioService.getInstance();

  useEffect(() => {
    if (autoPlay) {
      playAudio();
    }
    return () => {
      audioService.stopAudio();
    };
  }, [text, autoPlay]);

  const playAudio = useCallback(async () => {
    try {
      setIsPlaying(true);
      onPlay?.();
      await audioService.playAudio(text, { useTTS, voice, rate, pitch });
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
      onStop?.();
    }
  }, [text, useTTS, voice, rate, pitch, onPlay, onStop]);

  const stopAudio = useCallback(() => {
    audioService.stopAudio();
    setIsPlaying(false);
    onStop?.();
  }, [onStop]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    // TODO: Implement actual muting functionality
  }, [isMuted]);

  if (!showControls) {
    return null;
  }

  return (
    <div className={`audio-player flex items-center gap-2 ${className}`}>
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? (
          <FaStop className="w-4 h-4" />
        ) : (
          <FaPlay className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={toggleMute}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <FaVolumeMute className="w-4 h-4" />
        ) : (
          <FaVolumeUp className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default AudioPlayer; 