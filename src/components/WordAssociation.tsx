import React, { useState, useEffect } from 'react';
import { quizWords, Category } from '../data/quizData';
import { playAudio, playDynamicAudio } from '../utils/audio';

interface GameState {
  currentWord: typeof quizWords[0] | null;
  options: string[];
  score: number;
  totalQuestions: number;
  currentQuestion: number;
  selectedCategory: Category;
  showHint: boolean;
  isCorrect: boolean | null;
}

const WordAssociation: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    options: [],
    score: 0,
    totalQuestions: 10,
    currentQuestion: 0,
    selectedCategory: 'all',
    showHint: false,
    isCorrect: null,
  });

  const getRandomWords = (count: number, excludeWord?: typeof quizWords[0]): typeof quizWords => {
    const filteredWords = quizWords.filter(word => 
      (gameState.selectedCategory === 'all' || word.category === gameState.selectedCategory) &&
      word !== excludeWord
    );
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const startNewRound = () => {
    const currentWord = getRandomWords(1)[0];
    const wrongOptions = getRandomWords(3, currentWord).map(word => word.english);
    const options = [...wrongOptions, currentWord.english].sort(() => Math.random() - 0.5);

    setGameState(prev => ({
      ...prev,
      currentWord,
      options,
      showHint: false,
      isCorrect: null,
    }));
  };

  useEffect(() => {
    if (gameState.currentQuestion < gameState.totalQuestions) {
      startNewRound();
    }
  }, [gameState.currentQuestion, gameState.selectedCategory]);

  const handleAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === gameState.currentWord?.english;
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      isCorrect,
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }, 1500);
  };

  const handleRestart = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      currentQuestion: 0,
      isCorrect: null,
    }));
  };

  const handleCategoryChange = (category: Category) => {
    setGameState(prev => ({
      ...prev,
      selectedCategory: category,
      currentQuestion: 0,
      score: 0,
    }));
  };

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  if (gameState.currentQuestion >= gameState.totalQuestions) {
    return (
      <div className="max-w-xl mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-4">
          Your score: {gameState.score} / {gameState.totalQuestions}
        </p>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-japanese-red text-text-primary dark:text-text-dark-primary rounded hover:bg-japanese-redLight transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Word Association</h2>
      
      <div className="mb-4">
        <label className="mr-2">Category:</label>
        <select
          value={gameState.selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value as Category)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Categories</option>
          <option value="food">Food</option>
          <option value="animals">Animals</option>
          <option value="colors">Colors</option>
          <option value="numbers">Numbers</option>
          <option value="family">Family</option>
          <option value="weather">Weather</option>
          <option value="time">Time</option>
          <option value="transportation">Transportation</option>
          <option value="clothing">Clothing</option>
          <option value="body">Body</option>
          <option value="emotions">Emotions</option>
          <option value="school">School</option>
          <option value="work">Work</option>
          <option value="hobbies">Hobbies</option>
          <option value="nature">Nature</option>
          <option value="house">House</option>
          <option value="city">City</option>
          <option value="technology">Technology</option>
          <option value="health">Health</option>
        </select>
      </div>

      <div className="mb-4">
        <div className="text-lg mb-2">
          Question {gameState.currentQuestion + 1} of {gameState.totalQuestions}
        </div>
        <div className="text-lg mb-2">
          Score: {gameState.score}
        </div>
      </div>

      {gameState.currentWord && (
        <>
          <div className="text-3xl font-bold mb-6 text-center">
            {gameState.currentWord.japanese}
          </div>

          {gameState.showHint && (
            <div className="mb-4 p-3 bg-yellow-200 border border-yellow-300 rounded text-yellow-900 font-medium">
              Hint: {gameState.currentWord.hint}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            {gameState.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={gameState.isCorrect !== null}
                className={`p-4 text-lg rounded-nav transition-all duration-200 font-medium ${
                  gameState.isCorrect === null
                    ? 'bg-japanese-red text-text-primary dark:text-text-dark-primary hover:bg-japanese-redLight'
                    : option === gameState.currentWord?.english
                    ? 'bg-green-600 text-text-primary dark:text-text-dark-primary'
                    : option === gameState.currentWord?.english && gameState.isCorrect === false
                    ? 'bg-red-600 text-text-primary dark:text-text-dark-primary'
                    : 'bg-gray-300 text-text-secondary dark:text-text-dark-secondary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={() => setGameState(prev => ({ ...prev, showHint: !prev.showHint }))}
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            {gameState.showHint ? 'Hide Hint' : 'Show Hint'}
          </button>

          <button
            onClick={() => handlePlayAudio(gameState.currentWord?.japanese || '')}
            className="ml-2 p-2 rounded-full hover:bg-opacity-10"
            title="Play Audio"
          >
            🔊
          </button>
        </>
      )}
    </div>
  );
};

export default WordAssociation; 