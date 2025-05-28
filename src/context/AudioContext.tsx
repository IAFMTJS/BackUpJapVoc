import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AudioService from '../services/AudioService';

interface AudioSettings {
  useTTS: boolean;
  preferredVoice: string;
  rate: number;
  pitch: number;
  autoPlay: boolean;
  volume: number;
}

interface AudioContextType {
  settings: AudioSettings;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  playAudio: (text: string) => Promise<void>;
  stopAudio: () => void;
  isPlaying: boolean;
  availableVoices: SpeechSynthesisVoice[];
}

const defaultSettings: AudioSettings = {
  useTTS: true,
  preferredVoice: '',
  rate: 1,
  pitch: 1,
  autoPlay: false,
  volume: 1,
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem('audioSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioService = AudioService.getInstance();

  useEffect(() => {
    // Load available voices
    const voices = audioService.getAvailableVoices();
    setAvailableVoices(voices);
    
    // Set default voice if not set
    if (!settings.preferredVoice && voices.length > 0) {
      const japaneseVoice = voices.find(v => v.lang.includes('ja')) || voices[0];
      updateSettings({ preferredVoice: japaneseVoice.name });
    }
  }, []);

  const updateSettings = (newSettings: Partial<AudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('audioSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const playAudio = async (text: string) => {
    try {
      setIsPlaying(true);
      await audioService.playAudio(text, {
        useTTS: settings.useTTS,
        voice: settings.preferredVoice,
        rate: settings.rate,
        pitch: settings.pitch
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    audioService.stopAudio();
    setIsPlaying(false);
  };

  const value = {
    settings,
    updateSettings,
    playAudio,
    stopAudio,
    isPlaying,
    availableVoices,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext; 