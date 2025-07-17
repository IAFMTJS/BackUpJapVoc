import React, { useState, useEffect } from 'react';
import { Check, X, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import type { ExerciseBlock, ExerciseItem, ExerciseResult } from '../../types/learn';
import { useAudio } from '../../context/AudioContext';
import { useProgress } from '../../context/ProgressContext';
import HybridMascots from '../ui/HybridMascots';

// Add kana data for the selector
const hiraganaList = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん'
];

const katakanaList = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヲ', 'ン'
];

// Group kana by rows for better organization
const hiraganaRows = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', '', '', 'を'],
  ['ん']
];

const katakanaRows = [
  ['ア', 'イ', 'ウ', 'エ', 'オ'],
  ['カ', 'キ', 'ク', 'ケ', 'コ'],
  ['サ', 'シ', 'ス', 'セ', 'ソ'],
  ['タ', 'チ', 'ツ', 'テ', 'ト'],
  ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  ['マ', 'ミ', 'ム', 'メ', 'モ'],
  ['ヤ', '', 'ユ', '', 'ヨ'],
  ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  ['ワ', '', '', '', 'ヲ'],
  ['ン']
];

interface ExerciseRendererProps {
  exercise: ExerciseBlock;
  exerciseIndex: number;
  onComplete: (results: ExerciseResult[]) => void;
  onNext: () => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  exerciseIndex,
  onComplete,
  onNext
}) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  const currentItem = exercise.items[currentItemIndex];
  const isLastItem = currentItemIndex === exercise.items.length - 1;

  // Text-to-Speech functionality
  const speakText = (text: string, lang: string = 'ja-JP') => {
    if ('speechSynthesis' in window) {
      // Stop any currently playing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8; // Slightly slower for better pronunciation
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a Japanese voice if available
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => 
        voice.lang.includes('ja') || voice.lang.includes('JP')
      );
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }
      
      utterance.onstart = () => setIsTTSPlaying(true);
      utterance.onend = () => setIsTTSPlaying(false);
      utterance.onerror = () => setIsTTSPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  };

  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTTSPlaying(false);
    }
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, []);

  // Safety check: if currentItem is undefined, show error state
  if (!currentItem) {
    // If currentItemIndex is out of bounds, reset it to 0
    if (currentItemIndex >= exercise.items.length) {
      setCurrentItemIndex(0);
      return null; // Return null to trigger re-render
    }
    
    return (
      <div className="p-8">
        <div className="text-center text-text-muted dark:text-text-dark-muted">
          <div className="bg-red-50 border border-red-200 rounded-card p-6">
            <p className="text-lg font-medium text-red-800">
              ⚠️ Oefening niet gevonden
            </p>
            <p className="text-sm text-red-600 mt-2">
              Vraag {currentItemIndex + 1} bestaat niet in deze oefening.
            </p>
            <button
              onClick={() => setCurrentItemIndex(0)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-card hover:bg-red-700 transition-colors"
            >
              Terug naar eerste vraag
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset state when moving to a new item within the same exercise
  useEffect(() => {
    setStartTime(Date.now());
    setUserAnswer('');
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
    setIsPlaying(false);
  }, [currentItemIndex, exerciseIndex]);

  const handleMultipleChoice = (option: string) => {
    setSelectedOption(option);
    const correct = option === currentItem.answer;
    setIsCorrect(correct);
    
    const result: ExerciseResult = {
      exerciseIndex,
      itemIndex: currentItemIndex,
      correct,
      userAnswer: option,
      correctAnswer: currentItem.answer,
      timeSpent: Date.now() - startTime
    };
    
    setResults(prev => [...prev, result]);
  };

  const handleTypeAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const correct = userAnswer.trim().toLowerCase() === currentItem.answer.toLowerCase();
    setIsCorrect(correct);
    
    const result: ExerciseResult = {
      exerciseIndex,
      itemIndex: currentItemIndex,
      correct,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentItem.answer,
      timeSpent: Date.now() - startTime
    };
    
    setResults(prev => [...prev, result]);
  };

  const handleMemoryGame = () => {
    // For memory game, we'll use a simple input approach
    // In a real implementation, this would be more interactive
    if (!userAnswer.trim()) return;
    
    const correct = userAnswer.trim() === currentItem.answer;
    setIsCorrect(correct);
    
    const result: ExerciseResult = {
      exerciseIndex,
      itemIndex: currentItemIndex,
      correct,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentItem.answer,
      timeSpent: Date.now() - startTime
    };
    
    setResults(prev => [...prev, result]);
  };

  const handleResetMemoryGame = () => {
    setUserAnswer('');
    setIsCorrect(null);
  };

  const handleAudioListen = (option: string) => {
    setSelectedOption(option);
    const correct = option === currentItem.answer;
    setIsCorrect(correct);
    
    const result: ExerciseResult = {
      exerciseIndex,
      itemIndex: currentItemIndex,
      correct,
      userAnswer: option,
      correctAnswer: currentItem.answer,
      timeSpent: Date.now() - startTime
    };
    
    setResults(prev => [...prev, result]);
  };

  const handlePlayTTS = () => {
    if (currentItem.answer) {
      setIsPlaying(true);
      speakText(currentItem.answer);
      
      // Set a timeout to reset the playing state after TTS finishes
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000); // Approximate time for TTS to finish
    }
  };

  const handlePlayAudio = () => {
    if (currentItem.audio) {
      setIsPlaying(true);
      
      // Try to play the audio file
      try {
        const audio = new Audio(currentItem.audio);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.warn(`Audio file not found: ${currentItem.audio}`);
          setIsPlaying(false);
          // Show a fallback message
          alert('Audio file not available. Please try the exercise without audio.');
        };
        audio.play().catch(() => {
          console.warn(`Could not play audio: ${currentItem.audio}`);
          setIsPlaying(false);
          alert('Audio playback failed. Please try the exercise without audio.');
        });
      } catch (error) {
        console.error('Audio error:', error);
        setIsPlaying(false);
        alert('Audio not available. Please continue with the exercise.');
      }
    } else {
      // No audio file specified
      alert('No audio file specified for this exercise.');
    }
  };

  const handleNext = () => {
    if (isLastItem) {
      onComplete(results);
    } else {
      setCurrentItemIndex(prev => prev + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (exercise.exerciseType === 'typeAnswer') {
        handleTypeAnswer();
      } else if (exercise.exerciseType === 'memoryGame') {
        handleMemoryGame();
      } else if (exercise.exerciseType === 'grammarFill') {
        handleTypeAnswer();
      }
    }
  };

  const handleResetTypeAnswer = () => {
    setUserAnswer('');
    setIsCorrect(null);
  };

  const handleResetGrammarFill = () => {
    setUserAnswer('');
    setIsCorrect(null);
  };

  // Function to detect if the exercise is asking for kana
  const isKanaExercise = (question: string, answer: string): boolean => {
    const kanaRegex = /[\u3040-\u309F\u30A0-\u30FF]/; // Hiragana and Katakana ranges
    const questionLower = question.toLowerCase();
    const answerLower = answer.toLowerCase();
    
    // Check if the answer contains kana characters
    if (kanaRegex.test(answer)) {
      return true;
    }
    
    // Check if the question explicitly mentions kana
    if (questionLower.includes('hiragana') || 
        questionLower.includes('katakana') ||
        questionLower.includes('kana')) {
      return true;
    }
    
    // Check if the question asks to type specific kana sounds
    const kanaSounds = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'si', 'shi', 'su', 'se', 'so', 'ta', 'ti', 'chi', 'tu', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'n'];
    
    return kanaSounds.some(sound => 
      questionLower.includes(`'${sound}'`) || 
      questionLower.includes(`"${sound}"`) ||
      questionLower.includes(` ${sound} `) ||
      questionLower.includes(`${sound}.`) ||
      questionLower.includes(`${sound},`)
    );
  };

  // Function to get the appropriate kana list and rows
  const getKanaData = (question: string, answer: string): { list: string[], rows: string[][] } => {
    const katakanaRegex = /[\u30A0-\u30FF]/;
    if (katakanaRegex.test(answer) || question.toLowerCase().includes('katakana')) {
      return { list: katakanaList, rows: katakanaRows };
    }
    return { list: hiraganaList, rows: hiraganaRows };
  };

  // Function to handle kana selection
  const handleKanaSelect = (kana: string) => {
    setUserAnswer(prev => prev + kana);
  };

  const renderExerciseContent = () => {
    switch (exercise.exerciseType) {
      case 'multipleChoice':
        return (
          <div className="space-y-6 relative">
            {/* Background Mascot */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-15 sm:opacity-20 pointer-events-none">
              <HybridMascots
                type="emotions"
                size="small"
                variant="confident"
                context="quiz"
                mood="positive"
              />
            </div>
            
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium mb-4">
                <span>🎯</span>
                <span>Meerkeuze</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary">
                  {currentItem.question}
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => speakText(currentItem.question)}
                    disabled={isTTSPlaying}
                    className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 text-blue-700 rounded-nav hover:bg-blue-200 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                    title="Hoor de vraag"
                  >
                    {isTTSPlaying ? (
                      <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>{isTTSPlaying ? '🔊 Spreekt...' : '🔊 Hoor vraag'}</span>
                  </button>
                  {currentItem.audio && (
                    <button 
                      onClick={handlePlayAudio}
                      disabled={isPlaying}
                      className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-100 text-green-700 rounded-nav hover:bg-green-200 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                      title="Luister naar audio"
                    >
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{isPlaying ? '🔊 Afspelen...' : '🔊 Luister'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-4 max-w-2xl mx-auto">
              {currentItem.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMultipleChoice(option)}
                  disabled={selectedOption !== null}
                  className={`p-4 sm:p-6 text-left rounded-card border-2 transition-all duration-200 transform hover:scale-105 font-medium ${
                    selectedOption === option
                      ? isCorrect
                        ? 'border-green-600 bg-green-600 text-text-primary dark:text-text-dark-primary shadow-lg'
                        : 'border-red-600 bg-red-600 text-text-primary dark:text-text-dark-primary shadow-lg'
                      : 'border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium hover:border-indigo-500 hover:bg-indigo-100 hover:shadow-card dark:shadow-dark-card text-text-primary dark:text-text-dark-primary'
                  } ${selectedOption !== null ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                        selectedOption === option
                          ? isCorrect
                            ? 'bg-status-success text-text-primary dark:text-text-dark-primary'
                            : 'bg-status-error text-text-primary dark:text-text-dark-primary'
                          : 'bg-gray-600 text-text-primary dark:text-text-dark-primary'
                      }`}>
                        {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                      </div>
                      <span className="font-medium text-base sm:text-lg">{option}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(option);
                        }}
                        disabled={isTTSPlaying}
                        className="ml-1 sm:ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="Hoor deze optie"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    {selectedOption === option && (
                      <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2">
                        {isCorrect ? (
                          <div className="flex items-center space-x-1">
                            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            <span className="text-green-600 font-bold text-sm sm:text-base">✅ Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                            <span className="text-red-600 font-bold text-sm sm:text-base">❌ Fout</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'typeAnswer':
        const isKana = isKanaExercise(currentItem.question, currentItem.answer);
        const kanaData = isKana ? getKanaData(currentItem.question, currentItem.answer) : { list: [], rows: [] };
        
        return (
          <div className="space-y-6 relative">
            {/* Background Mascot */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-15 sm:opacity-20 pointer-events-none">
              <HybridMascots
                type="emotions"
                size="small"
                variant="determination"
                context="study"
                mood="positive"
              />
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-text-primary dark:text-text-dark-primary rounded-full text-xs sm:text-sm font-medium mb-4">
                <span>⌨️</span>
                <span>Typ het antwoord</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary">
                  {currentItem.question}
                </h3>
                <button
                  onClick={() => speakText(currentItem.question)}
                  disabled={isTTSPlaying}
                  className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 text-blue-700 rounded-nav hover:bg-blue-200 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                  title="Hoor de vraag"
                >
                  {isTTSPlaying ? (
                    <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span>{isTTSPlaying ? '🔊 Spreekt...' : '🔊 Hoor vraag'}</span>
                </button>
              </div>
              {currentItem.hint && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 bg-yellow-600 text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-yellow-700 transition-colors text-xs sm:text-sm"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>💡 Toon hint</span>
                  </button>
                  {showHint && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-nav">
                      <p className="text-xs sm:text-sm text-yellow-800 italic">
                        💡 {currentItem.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Typ je antwoord hier..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl border-2 border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium rounded-card focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all bg-white dark:bg-dark-elevated text-text-primary dark:text-text-dark-primary placeholder-gray-500 !text-text-primary dark:text-text-dark-primary !bg-white dark:bg-dark-elevated"
                  disabled={isCorrect !== null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {userAnswer.trim() && (
                    <span className="text-gray-400">↵</span>
                  )}
                </div>
              </div>
              
              {/* Kana Selector for kana exercises */}
              {isKana && (
                <div className="mt-4 kana-selector bg-pattern-sakura">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <p className="text-xs sm:text-sm text-text-primary dark:text-text-dark-primary text-center sm:text-left flex-1">
                      💡 Klik op de kana om ze toe te voegen aan je antwoord
                    </p>
                    <button
                      onClick={() => setUserAnswer('')}
                      disabled={isCorrect !== null || !userAnswer}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-enhanced"
                      title="Wis invoerveld"
                    >
                      🗑️ Wis
                    </button>
                  </div>
                  <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                    {kanaData.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        {row.map((kana, kanaIndex) => (
                          <button
                            key={`${rowIndex}-${kanaIndex}`}
                            onClick={() => kana && handleKanaSelect(kana)}
                            disabled={isCorrect !== null || !kana}
                            className={`kana-button ${
                              kana 
                                ? 'hover:shadow-lg focus-enhanced' 
                                : 'bg-transparent border-transparent'
                            }`}
                          >
                            {kana}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isCorrect !== null && (
                <div className={`mt-4 p-3 sm:p-4 rounded-card border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {isCorrect ? (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          <span className="text-green-800 font-bold text-sm sm:text-base">✅ Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          <span className="text-red-800 font-bold text-sm sm:text-base">
                            ❌ Fout. Het juiste antwoord is: <span className="underline">{currentItem.answer}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Result Mascot */}
                    <div className="flex justify-center sm:ml-4">
                      <HybridMascots
                        type="emotions"
                        size="small"
                        variant={isCorrect ? "goodJob" : "disappointed"}
                        context="quiz"
                        mood={isCorrect ? "positive" : "negative"}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                {isCorrect !== null && !isCorrect && (
                  <button
                    onClick={handleResetTypeAnswer}
                    className="w-full px-4 sm:px-6 py-3 bg-yellow-600 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-yellow-700 transition-colors font-semibold text-base sm:text-lg"
                  >
                    🔄 Probeer opnieuw
                  </button>
                )}
                <button
                  onClick={handleTypeAnswer}
                  disabled={!userAnswer.trim() || isCorrect !== null}
                  className="w-full px-4 sm:px-6 py-3 bg-indigo-600 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-base sm:text-lg"
                >
                  {isCorrect !== null ? 'Antwoord ingediend' : '📝 Indien antwoord'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'memoryGame':
        const isMemoryKana = isKanaExercise(currentItem.question, currentItem.answer);
        const memoryKanaData = isMemoryKana ? getKanaData(currentItem.question, currentItem.answer) : { list: [], rows: [] };
        
        return (
          <div className="space-y-6 relative">
            {/* Background Mascot */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-15 sm:opacity-20 pointer-events-none">
              <HybridMascots
                type="emotions"
                size="small"
                variant="determination"
                context="quiz"
                mood="positive"
              />
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-text-primary dark:text-text-dark-primary rounded-full text-xs sm:text-sm font-medium mb-4">
                <span>🧠</span>
                <span>Geheugenoefening</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
                Onthoud de volgorde
              </h3>
              <p className="text-text-muted dark:text-text-dark-muted mb-4 text-base sm:text-lg">
                {currentItem.question}
              </p>
              <div className="mb-6">
                <button
                  onClick={() => speakText(currentItem.question)}
                  disabled={isTTSPlaying}
                  className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-purple-100 text-purple-700 rounded-nav hover:bg-purple-200 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                  title="Hoor de vraag"
                >
                  {isTTSPlaying ? (
                    <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span>{isTTSPlaying ? '🔊 Spreekt...' : '🔊 Hoor vraag'}</span>
                </button>
                {currentItem.audio && (
                  <button 
                    onClick={handlePlayAudio}
                    disabled={isPlaying}
                    className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-100 text-green-700 rounded-nav hover:bg-green-200 transition-colors disabled:opacity-50 text-xs sm:text-sm ml-2"
                    title="Luister naar audio"
                  >
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{isPlaying ? '🔊 Afspelen...' : '🔊 Luister'}</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Typ de volgorde hier..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl border-2 border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium rounded-card focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all bg-white dark:bg-dark-elevated text-text-primary dark:text-text-dark-primary placeholder-gray-500 !text-text-primary dark:text-text-dark-primary !bg-white dark:bg-dark-elevated"
                  disabled={isCorrect !== null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {userAnswer.trim() && (
                    <span className="text-purple-400">🧠</span>
                  )}
                </div>
              </div>
              
              {/* Kana Selector for memory exercises that need kana */}
              {isMemoryKana && (
                <div className="mt-4 kana-selector bg-pattern-sakura">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <p className="text-xs sm:text-sm text-text-primary dark:text-text-dark-primary text-center sm:text-left flex-1">
                      💡 Klik op de kana om ze toe te voegen aan je antwoord
                    </p>
                    <button
                      onClick={() => setUserAnswer('')}
                      disabled={isCorrect !== null || !userAnswer}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-enhanced"
                      title="Wis invoerveld"
                    >
                      🗑️ Wis
                    </button>
                  </div>
                  <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                    {memoryKanaData.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        {row.map((kana, kanaIndex) => (
                          <button
                            key={`${rowIndex}-${kanaIndex}`}
                            onClick={() => kana && handleKanaSelect(kana)}
                            disabled={isCorrect !== null || !kana}
                            className={`kana-button ${
                              kana 
                                ? 'hover:shadow-lg focus-enhanced' 
                                : 'bg-transparent border-transparent'
                            }`}
                          >
                            {kana}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isCorrect !== null && (
                <div className={`mt-4 p-3 sm:p-4 rounded-card border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {isCorrect ? (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          <span className="text-green-800 font-bold text-sm sm:text-base">🎉 Perfect! Je hebt het onthouden!</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          <span className="text-red-800 font-bold text-sm sm:text-base">
                            ❌ Niet helemaal goed. De juiste volgorde is: <span className="underline">{currentItem.answer}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Result Mascot */}
                    <div className="flex justify-center sm:ml-4">
                      <HybridMascots
                        type="emotions"
                        size="small"
                        variant={isCorrect ? "veryGoodJob" : "disappointed"}
                        context="quiz"
                        mood={isCorrect ? "positive" : "negative"}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                {isCorrect !== null && !isCorrect && (
                  <button
                    onClick={handleResetMemoryGame}
                    className="w-full px-4 sm:px-6 py-3 bg-yellow-600 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-yellow-700 transition-colors font-semibold text-base sm:text-lg"
                  >
                    🔄 Probeer opnieuw
                  </button>
                )}
                <button
                  onClick={handleMemoryGame}
                  disabled={!userAnswer.trim() || isCorrect !== null}
                  className="w-full px-4 sm:px-6 py-3 bg-purple-600 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-base sm:text-lg"
                >
                  {isCorrect !== null ? 'Antwoord ingediend' : '🧠 Controleer antwoord'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'audioListen':
        return (
          <div className="space-y-6 relative">
            {/* Background Mascot */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-15 sm:opacity-20 pointer-events-none">
              <HybridMascots
                type="emotions"
                size="small"
                variant="happy"
                context="study"
                mood="positive"
              />
            </div>
            
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-600 text-text-primary dark:text-text-dark-primary rounded-full text-xs sm:text-sm font-medium mb-4">
                <span>🎧</span>
                <span>Luisteroefening</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
                {currentItem.question}
              </h3>
              <div className="mb-6">
                <button 
                  onClick={handlePlayTTS}
                  disabled={isPlaying || isTTSPlaying}
                  className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-orange-500 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-orange-600 transition-colors disabled:opacity-50 font-semibold text-base sm:text-lg"
                >
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{isPlaying || isTTSPlaying ? '🔊 Spreekt...' : '🔊 Klik om te luisteren'}</span>
                </button>
                <p className="text-xs sm:text-sm text-text-muted dark:text-text-dark-muted mt-2">
                  Luister naar de uitspraak en kies het juiste hiragana karakter
                </p>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-4 max-w-2xl mx-auto">
              {currentItem.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAudioListen(option)}
                  disabled={selectedOption !== null}
                  className={`exercise-card p-4 sm:p-6 text-left border-2 transition-all duration-300 transform hover:scale-105 font-medium ${
                    selectedOption === option
                      ? isCorrect
                        ? 'correct border-green-600 bg-green-600 text-text-primary dark:text-text-dark-primary shadow-lg'
                        : 'incorrect border-red-600 bg-red-600 text-text-primary dark:text-text-dark-primary shadow-lg'
                      : 'border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium hover:border-orange-500 hover:bg-orange-100 hover:shadow-card dark:shadow-dark-card text-text-primary dark:text-text-dark-primary'
                  } ${selectedOption !== null ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                        selectedOption === option
                          ? isCorrect
                            ? 'bg-status-success text-text-primary dark:text-text-dark-primary'
                            : 'bg-status-error text-text-primary dark:text-text-dark-primary'
                          : 'bg-gray-600 text-text-primary dark:text-text-dark-primary'
                      }`}>
                        {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                      </div>
                      <span className="font-medium text-base sm:text-lg">{option}</span>
                    </div>
                    {selectedOption === option && (
                      <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2">
                        {isCorrect ? (
                          <div className="flex items-center space-x-1">
                            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            <span className="text-green-600 font-bold text-sm sm:text-base">✅ Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                            <span className="text-red-600 font-bold text-sm sm:text-base">❌ Fout</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'grammarFill':
        const isGrammarKana = isKanaExercise(currentItem.question, currentItem.answer);
        const grammarKanaData = isGrammarKana ? getKanaData(currentItem.question, currentItem.answer) : { list: [], rows: [] };
        
        return (
          <div className="space-y-6 relative">
            {/* Background Mascot */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-15 sm:opacity-20 pointer-events-none">
              <HybridMascots
                type="emotions"
                size="small"
                variant="supportive"
                context="study"
                mood="positive"
              />
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-teal-600 text-text-primary dark:text-text-dark-primary rounded-full text-xs sm:text-sm font-medium mb-4">
                <span>📝</span>
                <span>Grammatica</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
                Vul het ontbrekende woord in
              </h3>
              <p className="text-text-muted dark:text-text-dark-muted mb-4 text-base sm:text-lg">
                {currentItem.question}
              </p>
              {currentItem.hint && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1 bg-yellow-600 text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-yellow-700 transition-colors text-xs sm:text-sm"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>💡 Toon hint</span>
                  </button>
                  {showHint && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-nav">
                      <p className="text-xs sm:text-sm text-yellow-800 italic">
                        💡 {currentItem.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Typ het ontbrekende woord..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl border-2 border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium rounded-card focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 transition-all bg-white dark:bg-dark-elevated text-text-primary dark:text-text-dark-primary placeholder-gray-500 !text-text-primary dark:text-text-dark-primary !bg-white dark:bg-dark-elevated"
                  disabled={isCorrect !== null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {userAnswer.trim() && (
                    <span className="text-teal-400">📝</span>
                  )}
                </div>
              </div>
              
              {/* Kana Selector for grammar exercises that need kana */}
              {isGrammarKana && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left flex-1">
                      💡 Klik op de kana om ze toe te voegen aan je antwoord
                    </p>
                    <button
                      onClick={() => setUserAnswer('')}
                      disabled={isCorrect !== null || !userAnswer}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Wis invoerveld"
                    >
                      🗑️ Wis
                    </button>
                  </div>
                  <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                    {grammarKanaData.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        {row.map((kana, kanaIndex) => (
                          <button
                            key={`${rowIndex}-${kanaIndex}`}
                            onClick={() => kana && handleKanaSelect(kana)}
                            disabled={isCorrect !== null || !kana}
                            className={`w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg font-medium border rounded transition-colors ${
                              kana 
                                ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                                : 'bg-transparent border-transparent'
                            }`}
                          >
                            {kana}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isCorrect !== null && (
                <div className={`mt-4 p-3 sm:p-4 rounded-card border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {isCorrect ? (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          <span className="text-green-800 font-bold text-sm sm:text-base">✅ Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          <span className="text-red-800 font-bold text-sm sm:text-base">
                            ❌ Fout. Het juiste antwoord is: <span className="underline">{currentItem.answer}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Result Mascot */}
                    <div className="flex justify-center sm:ml-4">
                      <HybridMascots
                        type="emotions"
                        size="small"
                        variant={isCorrect ? "goodJob" : "disappointed"}
                        context="study"
                        mood={isCorrect ? "positive" : "negative"}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                {isCorrect !== null && !isCorrect && (
                  <button
                    onClick={handleResetGrammarFill}
                    className="w-full px-4 sm:px-6 py-3 bg-yellow-600 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-yellow-700 transition-colors font-semibold text-base sm:text-lg"
                  >
                    🔄 Probeer opnieuw
                  </button>
                )}
                <button
                  onClick={handleTypeAnswer}
                  disabled={!userAnswer.trim() || isCorrect !== null}
                  className="w-full px-4 sm:px-6 py-3 bg-teal-600 text-text-primary dark:text-text-dark-primary rounded-card hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-base sm:text-lg"
                >
                  {isCorrect !== null ? 'Antwoord ingediend' : '📝 Controleer antwoord'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-text-muted dark:text-text-dark-muted">
            <div className="bg-yellow-50 border border-yellow-200 rounded-card p-6">
              <p className="text-lg font-medium text-yellow-800">
                ⚠️ Deze oefeningstype is nog niet beschikbaar
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                We werken hard om alle oefeningen beschikbaar te maken!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Exercise header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          {exercise.title}
        </h2>
        <p className="text-text-muted dark:text-text-dark-muted mb-4 text-sm sm:text-base">
          {exercise.instruction}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-text-muted dark:text-text-dark-muted gap-2">
          <span>
            Question {currentItemIndex + 1} of {exercise.items.length}
          </span>
          <span>
            {exercise.pointsPerItem} points per question
          </span>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="mt-4 w-full bg-light-tertiary dark:bg-dark-tertiary rounded-full h-3 overflow-hidden">
          <div 
            className="progress-bar-enhanced h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentItemIndex + 1) / exercise.items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise content */}
      <div className="mb-6 sm:mb-8">
        {renderExerciseContent()}
      </div>

      {/* Navigation */}
      {isCorrect !== null && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={handleNext}
            className="btn-enhanced w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-text-primary dark:text-text-dark-primary rounded-card hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-semibold text-base sm:text-lg shadow-lg"
          >
            {isLastItem ? (
              <div className="flex items-center justify-center space-x-2">
                <span>🎉</span>
                <span>Oefening voltooien</span>
                <span>🎉</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>⏭️</span>
                <span>Volgende vraag</span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}; 