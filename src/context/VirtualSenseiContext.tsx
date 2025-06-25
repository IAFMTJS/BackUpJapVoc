import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

export interface SenseiMessage {
  id: string;
  type: 'greeting' | 'instruction' | 'encouragement' | 'correction' | 'celebration' | 'hint';
  message: string;
  context?: string;
  action?: string;
  timestamp: Date;
}

export interface VirtualSenseiState {
  isVisible: boolean;
  currentLesson?: string;
  messages: SenseiMessage[];
  userProgress: {
    completedLessons: number;
    recentAchievement?: string;
    currentStreak: number;
    totalStudyTime: number;
  };
  settings: {
    autoGreeting: boolean;
    showHints: boolean;
    voiceEnabled: boolean;
    lessonReminders: boolean;
  };
}

interface VirtualSenseiContextType {
  state: VirtualSenseiState;
  toggleVisibility: () => void;
  setVisibility: (visible: boolean) => void;
  addMessage: (type: SenseiMessage['type'], message: string, context?: string) => void;
  setCurrentLesson: (lessonId?: string) => void;
  updateProgress: (progress: Partial<VirtualSenseiState['userProgress']>) => void;
  updateSettings: (settings: Partial<VirtualSenseiState['settings']>) => void;
  clearMessages: () => void;
  getRandomResponse: (type: keyof typeof senseiResponses) => string;
}

const defaultState: VirtualSenseiState = {
  isVisible: false,
  messages: [],
  userProgress: {
    completedLessons: 0,
    currentStreak: 0,
    totalStudyTime: 0,
  },
  settings: {
    autoGreeting: true,
    showHints: true,
    voiceEnabled: true,
    lessonReminders: true,
  },
};

// Sensei personality and responses
const senseiResponses = {
  greeting: [
    "こんにちは！I'm your virtual sensei. Ready to learn some Japanese?",
    "Welcome back! Let's continue your Japanese journey together!",
    "Hello there! I'm here to guide you through your learning path.",
    "おはようございます！Ready for today's lesson?",
    "Welcome! I'm excited to help you learn Japanese!"
  ],
  encouragement: [
    "Excellent work! You're making great progress!",
    "Keep it up! Every step brings you closer to fluency.",
    "You're doing wonderfully! Don't give up!",
    "素晴らしい！You're learning so well!",
    "Keep practicing! 頑張って！"
  ],
  hint: [
    "Here's a little hint to help you along...",
    "Let me give you a clue...",
    "Think about it this way...",
    "Try to remember...",
    "Consider this..."
  ],
  correction: [
    "Almost there! Let me help you with that...",
    "Good try! Here's the correct way...",
    "Not quite, but you're close!",
    "Let me show you the right answer...",
    "Almost! Here's what you need to know..."
  ],
  celebration: [
    "🎉 Congratulations! You've mastered this!",
    "🎊 Excellent! You're making amazing progress!",
    "🌟 Wonderful! You're getting so good at this!",
    "🏆 Fantastic work! You're a natural!",
    "🎯 Perfect! You're on fire today!"
  ]
};

const VirtualSenseiContext = createContext<VirtualSenseiContextType | undefined>(undefined);

export const VirtualSenseiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VirtualSenseiState>(() => {
    try {
      const savedState = safeLocalStorage.getItem('virtualSenseiState');
      return savedState ? JSON.parse(savedState) : defaultState;
    } catch (error) {
      console.error('Error loading Virtual Sensei state:', error);
      return defaultState;
    }
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      safeLocalStorage.setItem('virtualSenseiState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving Virtual Sensei state:', error);
    }
  }, [state]);

  const toggleVisibility = () => {
    setState(prev => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const setVisibility = (visible: boolean) => {
    setState(prev => ({ ...prev, isVisible: visible }));
  };

  const addMessage = (type: SenseiMessage['type'], message: string, context?: string) => {
    const newMessage: SenseiMessage = {
      id: Date.now().toString(),
      type,
      message,
      context,
      timestamp: new Date()
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const setCurrentLesson = (lessonId?: string) => {
    setState(prev => ({ ...prev, currentLesson: lessonId }));
  };

  const updateProgress = (progress: Partial<VirtualSenseiState['userProgress']>) => {
    setState(prev => ({
      ...prev,
      userProgress: { ...prev.userProgress, ...progress }
    }));
  };

  const updateSettings = (settings: Partial<VirtualSenseiState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  const clearMessages = () => {
    setState(prev => ({ ...prev, messages: [] }));
  };

  const getRandomResponse = (type: keyof typeof senseiResponses): string => {
    const responses = senseiResponses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Auto-greeting when sensei becomes visible
  useEffect(() => {
    if (state.isVisible && state.settings.autoGreeting && state.messages.length === 0) {
      addMessage('greeting', getRandomResponse('greeting'));
    }
  }, [state.isVisible, state.settings.autoGreeting, state.messages.length]);

  const contextValue: VirtualSenseiContextType = {
    state,
    toggleVisibility,
    setVisibility,
    addMessage,
    setCurrentLesson,
    updateProgress,
    updateSettings,
    clearMessages,
    getRandomResponse,
  };

  return (
    <VirtualSenseiContext.Provider value={contextValue}>
      {children}
    </VirtualSenseiContext.Provider>
  );
};

export const useVirtualSensei = (): VirtualSenseiContextType => {
  const context = useContext(VirtualSenseiContext);
  if (context === undefined) {
    throw new Error('useVirtualSensei must be used within a VirtualSenseiProvider');
  }
  return context;
}; 