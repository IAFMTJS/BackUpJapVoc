import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AudioService from '../services/AudioService';
import safeLocalStorage from '../utils/safeLocalStorage';

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
  if (context === undefined) {
    console.warn('[useAudio] Context is undefined, returning default values');
    // Return default context values instead of throwing an error
    return {
      playAudio: async () => {},
      stopAudio: () => {},
      isPlaying: false,
      currentAudio: null,
      volume: 1,
      setVolume: () => {},
      isLoading: false,
      error: null
    };
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    try {
      const saved = safeLocalStorage.getItem('audioSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (error) {
      console.error('Error loading audio settings:', error);
      return defaultSettings;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioService = AudioService.getInstance();

  useEffect(() => {
    try {
      // Load available voices
      const voices = audioService.getAvailableVoices();
      setAvailableVoices(voices);
      
      // Set default voice if not set
      if (!settings.preferredVoice && voices.length > 0) {
        // Prioritize Japanese voices for better pronunciation
        const japaneseVoice = voices.find(v => 
          v.lang.includes('ja') || 
          v.lang.includes('JP') ||
          v.name.toLowerCase().includes('kyoko') ||
          v.name.toLowerCase().includes('haruka')
        ) || voices[0];
        
        updateSettings({ preferredVoice: japaneseVoice.name });
        console.log(`Auto-selected voice: ${japaneseVoice.name} (${japaneseVoice.lang})`);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio provider:', error);
      // Continue with default settings
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Load saved audio settings
    const saved = safeLocalStorage.getItem('audioSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing audio settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AudioSettings>) => {
    try {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        safeLocalStorage.setItem('audioSettings', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error updating audio settings:', error);
      // Update state without persisting to localStorage
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  };

  const playAudio = async (text: string) => {
    if (!isInitialized) {
      console.warn('Audio provider not fully initialized');
      return;
    }

    try {
      setIsPlaying(true);
      await audioService.playAudio(text, {
        useTTS: settings.useTTS,
        voice: settings.preferredVoice,
        rate: settings.rate || 0.9,  // Default to slightly slower for better clarity
        pitch: settings.pitch || 1
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    try {
      audioService.stopAudio();
    } catch (error) {
      console.error('Error stopping audio:', error);
    } finally {
      setIsPlaying(false);
    }
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