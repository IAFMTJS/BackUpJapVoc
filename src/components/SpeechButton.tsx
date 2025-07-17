import React, { useState } from 'react';

interface SpeechButtonProps {
  target: string;
  setSpeechResult: (result: string | null) => void;
  setSpeechScore: (score: number | null) => void;
  setSpeechFeedback: (feedback: string | null) => void;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({ 
  target, 
  setSpeechResult, 
  setSpeechScore, 
  setSpeechFeedback 
}) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechResult(null);
      setSpeechScore(null);
      setSpeechFeedback(null);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpeechResult(transcript);
      
      // Simple similarity calculation
      const similarity = calculateSimilarity(transcript.toLowerCase(), target.toLowerCase());
      setSpeechScore(similarity);
      
      if (similarity >= 80) {
        setSpeechFeedback('Excellent pronunciation!');
      } else if (similarity >= 60) {
        setSpeechFeedback('Good effort, try again!');
      } else {
        setSpeechFeedback('Try speaking more clearly');
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setSpeechFeedback('Error: ' + event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const calculateSimilarity = (a: string, b: string) => {
    if (!a || !b) return 0;
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    return Math.round((matches / Math.max(a.length, b.length)) * 100);
  };

  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className={`p-2 rounded-full ${
        isListening 
          ? 'bg-status-error text-text-primary dark:text-text-dark-primary animate-pulse' 
          : 'bg-japanese-red text-text-primary dark:text-text-dark-primary hover:bg-japanese-red'
      }`}
      title={isListening ? 'Listening...' : 'Click to speak'}
    >
      {isListening ? '🎤' : '🎤'}
    </button>
  );
};

export default SpeechButton; 