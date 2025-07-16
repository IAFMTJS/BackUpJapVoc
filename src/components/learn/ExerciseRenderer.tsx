import React, { useState, useEffect } from 'react';
import { Check, X, Volume2, Lightbulb } from 'lucide-react';
import type { ExerciseBlock, ExerciseItem, ExerciseResult } from '../../types/learn';

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

  const currentItem = exercise.items[currentItemIndex];
  const isLastItem = currentItemIndex === exercise.items.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
    setUserAnswer('');
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
    setIsPlaying(false);
  }, [currentItemIndex]);

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

  const renderExerciseContent = () => {
    switch (exercise.exerciseType) {
      case 'multipleChoice':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                <span>🎯</span>
                <span>Meerkeuze</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {currentItem.question}
              </h3>
              {currentItem.audio && (
                <button 
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlaying ? '🔊 Afspelen...' : '🔊 Luister'}</span>
                </button>
              )}
            </div>
            
            <div className="grid gap-4 max-w-2xl mx-auto">
              {currentItem.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMultipleChoice(option)}
                  disabled={selectedOption !== null}
                  className={`p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 font-medium ${
                    selectedOption === option
                      ? isCorrect
                        ? 'border-green-600 bg-green-600 text-white shadow-lg'
                        : 'border-red-600 bg-red-600 text-white shadow-lg'
                      : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-100 hover:shadow-md text-gray-900'
                  } ${selectedOption !== null ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedOption === option
                          ? isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                      </div>
                      <span className="font-medium text-lg">{option}</span>
                    </div>
                    {selectedOption === option && (
                      <div className="flex items-center space-x-2">
                        {isCorrect ? (
                          <div className="flex items-center space-x-1">
                            <Check className="w-6 h-6 text-green-600" />
                            <span className="text-green-600 font-bold">✅ Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <X className="w-6 h-6 text-red-600" />
                            <span className="text-red-600 font-bold">❌ Fout</span>
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
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium mb-4">
                <span>⌨️</span>
                <span>Typ het antwoord</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {currentItem.question}
              </h3>
              {currentItem.hint && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>💡 Toon hint</span>
                  </button>
                  {showHint && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 italic">
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
                  className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all bg-white text-gray-900 placeholder-gray-500 !text-gray-900 !bg-white"
                  disabled={isCorrect !== null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {userAnswer.trim() && (
                    <span className="text-gray-400">↵</span>
                  )}
                </div>
              </div>
              
              {isCorrect !== null && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {isCorrect ? (
                      <div className="flex items-center space-x-2">
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="text-green-800 font-bold">✅ Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <X className="w-6 h-6 text-red-600" />
                        <span className="text-red-800 font-bold">
                          ❌ Fout. Het juiste antwoord is: <span className="underline">{currentItem.answer}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={handleTypeAnswer}
                  disabled={!userAnswer.trim() || isCorrect !== null}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                >
                  {isCorrect !== null ? 'Antwoord ingediend' : '📝 Indien antwoord'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'memoryGame':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium mb-4">
                <span>🧠</span>
                <span>Geheugenspel</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Onthoud de volgorde
              </h3>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <p className="text-2xl font-bold text-purple-800 mb-2">
                  {currentItem.question}
                </p>
                <p className="text-purple-600">
                  📝 Kijk goed naar de volgorde en typ het na
                </p>
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
                  className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all bg-white text-gray-900 placeholder-gray-500 !text-gray-900 !bg-white"
                  disabled={isCorrect !== null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {userAnswer.trim() && (
                    <span className="text-purple-400">🧠</span>
                  )}
                </div>
              </div>
              
              {isCorrect !== null && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {isCorrect ? (
                      <div className="flex items-center space-x-2">
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="text-green-800 font-bold">🎉 Perfect! Je hebt het onthouden!</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <X className="w-6 h-6 text-red-600" />
                        <span className="text-red-800 font-bold">
                          ❌ Niet helemaal goed. De juiste volgorde is: <span className="underline">{currentItem.answer}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={handleMemoryGame}
                  disabled={!userAnswer.trim() || isCorrect !== null}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                >
                  {isCorrect !== null ? 'Antwoord ingediend' : '🧠 Controleer antwoord'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'audioListen':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-medium mb-4">
                <span>🎧</span>
                <span>Luisteroefening</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {currentItem.question}
              </h3>
              <div className="mb-6">
                <button 
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className="inline-flex items-center space-x-3 px-6 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 font-semibold text-lg"
                >
                  <Volume2 className="w-6 h-6" />
                  <span>{isPlaying ? '🔊 Afspelen...' : '🔊 Klik om te luisteren'}</span>
                </button>
              </div>
            </div>
            
            <div className="grid gap-4 max-w-2xl mx-auto">
              {currentItem.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAudioListen(option)}
                  disabled={selectedOption !== null}
                  className={`p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 font-medium ${
                    selectedOption === option
                      ? isCorrect
                        ? 'border-green-600 bg-green-600 text-white shadow-lg'
                        : 'border-red-600 bg-red-600 text-white shadow-lg'
                      : 'border-gray-300 hover:border-orange-500 hover:bg-orange-100 hover:shadow-md text-gray-900'
                  } ${selectedOption !== null ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedOption === option
                          ? isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                      </div>
                      <span className="font-medium text-lg">{option}</span>
                    </div>
                    {selectedOption === option && (
                      <div className="flex items-center space-x-2">
                        {isCorrect ? (
                          <div className="flex items-center space-x-1">
                            <Check className="w-6 h-6 text-green-600" />
                            <span className="text-green-600 font-bold">✅ Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <X className="w-6 h-6 text-red-600" />
                            <span className="text-red-600 font-bold">❌ Fout</span>
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
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium mb-4">
                <span>📝</span>
                <span>Grammatica</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Vul het ontbrekende woord in
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                {currentItem.question}
              </p>
              {currentItem.hint && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>💡 Toon hint</span>
                  </button>
                  {showHint && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 italic">
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
                  className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 transition-all bg-white text-gray-900 placeholder-gray-500 !text-gray-900 !bg-white"
                  disabled={isCorrect !== null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {userAnswer.trim() && (
                    <span className="text-teal-400">📝</span>
                  )}
                </div>
              </div>
              
              {isCorrect !== null && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {isCorrect ? (
                      <div className="flex items-center space-x-2">
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="text-green-800 font-bold">✅ Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <X className="w-6 h-6 text-red-600" />
                        <span className="text-red-800 font-bold">
                          ❌ Fout. Het juiste antwoord is: <span className="underline">{currentItem.answer}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={handleTypeAnswer}
                  disabled={!userAnswer.trim() || isCorrect !== null}
                  className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                >
                  {isCorrect !== null ? 'Antwoord ingediend' : '📝 Controleer antwoord'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
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
    <div className="p-8">
      {/* Exercise header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {exercise.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {exercise.instruction}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Question {currentItemIndex + 1} of {exercise.items.length}
          </span>
          <span>
            {exercise.pointsPerItem} points per question
          </span>
        </div>
      </div>

      {/* Exercise content */}
      <div className="mb-8">
        {renderExerciseContent()}
      </div>

      {/* Navigation */}
      {isCorrect !== null && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 font-semibold text-lg shadow-lg"
          >
            {isLastItem ? (
              <div className="flex items-center space-x-2">
                <span>🎉</span>
                <span>Oefening voltooien</span>
                <span>🎉</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
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