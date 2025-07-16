import React, { useState } from 'react';
import { ExerciseRenderer } from './ExerciseRenderer';
import type { ExerciseBlock, ExerciseResult } from '../../types/learn';

const testExercises: ExerciseBlock[] = [
  {
    title: "Test Multiple Choice",
    instruction: "Test multiple choice exercise",
    exerciseType: "multipleChoice",
    pointsPerItem: 1,
    items: [
      {
        question: "What is 1 + 1?",
        options: ["1", "2", "3", "4"],
        answer: "2"
      },
      {
        question: "What color is the sky?",
        options: ["Red", "Blue", "Green", "Yellow"],
        answer: "Blue"
      }
    ]
  },
  {
    title: "Test Type Answer",
    instruction: "Test type answer exercise",
    exerciseType: "typeAnswer",
    pointsPerItem: 2,
    items: [
      {
        question: "Type 'hello'",
        answer: "hello"
      },
      {
        question: "Type 'world'",
        answer: "world",
        hint: "Think of the planet we live on"
      }
    ]
  },
  {
    title: "Test Memory Game",
    instruction: "Test memory game exercise",
    exerciseType: "memoryGame",
    pointsPerItem: 3,
    items: [
      {
        question: "ABC",
        answer: "ABC"
      },
      {
        question: "123",
        answer: "123"
      }
    ]
  },
  {
    title: "Test Audio Listen",
    instruction: "Test audio listening exercise",
    exerciseType: "audioListen",
    pointsPerItem: 2,
    items: [
      {
        question: "Which character did you hear?",
        audio: "audio/a.mp3",
        options: ["あ", "い", "う"],
        answer: "あ"
      },
      {
        question: "Which character did you hear?",
        audio: "audio/u.mp3",
        options: ["う", "え", "お"],
        answer: "う"
      }
    ]
  },
  {
    title: "Test Grammar Fill",
    instruction: "Test grammar fill exercise",
    exerciseType: "grammarFill",
    pointsPerItem: 2,
    items: [
      {
        question: "I ___ a student.",
        answer: "am",
        hint: "First person singular of 'to be'"
      },
      {
        question: "She ___ to school.",
        answer: "goes",
        hint: "Third person singular present tense"
      }
    ]
  }
];

export const ExerciseTest: React.FC = () => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [allResults, setAllResults] = useState<ExerciseResult[]>([]);
  const [testComplete, setTestComplete] = useState(false);

  const handleExerciseComplete = (results: ExerciseResult[]) => {
    setAllResults(prev => [...prev, ...results]);
    
    if (currentExerciseIndex < testExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setTestComplete(true);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < testExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const resetTest = () => {
    setCurrentExerciseIndex(0);
    setAllResults([]);
    setTestComplete(false);
  };

  if (testComplete) {
    const totalQuestions = allResults.length;
    const correctAnswers = allResults.filter(r => r.correct).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🎉 Test Complete!</h2>
          <div className="text-lg text-green-700 mb-4">
            <p>Score: {score}% ({correctAnswers}/{totalQuestions} correct)</p>
          </div>
          <button
            onClick={resetTest}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Run Test Again
          </button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Detailed Results:</h3>
          <div className="space-y-2">
            {allResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Question {index + 1}: {result.correct ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Your answer: "{result.userAnswer}" | Correct: "{result.correctAnswer}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">Exercise Type Test</h1>
        <p className="text-blue-700">
          Testing exercise {currentExerciseIndex + 1} of {testExercises.length}: {testExercises[currentExerciseIndex].title}
        </p>
        <div className="mt-4 flex gap-4">
          {testExercises.map((exercise, index) => (
            <div
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                index === currentExerciseIndex
                  ? 'bg-blue-600 text-white'
                  : index < currentExerciseIndex
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <ExerciseRenderer
        exercise={testExercises[currentExerciseIndex]}
        exerciseIndex={currentExerciseIndex}
        onComplete={handleExerciseComplete}
        onNext={handleNext}
      />
    </div>
  );
}; 