import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWordLevel } from '../context/WordLevelContext';
import { wordLevels } from '../data/wordLevels';
import { JapaneseWord } from '../data/types';
import { playAudio } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import HybridMascots from '../components/ui/HybridMascots';

const GAME_TITLES = [
  'Flashcards',
  'Multiple Choice',
  'Typing Practice',
  'Audio Match',
  'Memory Match',
  'Fill in the Blank'
];

const GamesPage: React.FC = () => {
  const { unlockedLevels } = useWordLevel();
  const [activeGame, setActiveGame] = useState(0);
  const { theme } = useTheme();
  const { availableWords } = useApp();

  // Get all words from unlocked levels
  const availableWordsMemo = useMemo(() => {
    return wordLevels
      .filter(level => unlockedLevels.includes(level.level))
      .flatMap(level => level.words);
  }, [unlockedLevels]);

  // --- Game 1: Flashcard Flip ---
  const FlashcardFlip = () => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    if (availableWordsMemo.length === 0) return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        No words available.
      </div>
    );
    const word = availableWordsMemo[index];
    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-64 h-40 flex items-center justify-center border rounded-nav shadow-card hover:shadow-hover transition-all duration-300 text-2xl cursor-pointer ${
            theme === 'dark' 
              ? flipped 
                ? 'bg-dark-tertiary border-border-dark-medium' 
                : 'bg-dark-secondary border-border-dark-light'
              : flipped 
                ? 'bg-light-tertiary border-border-medium' 
                : 'bg-light-secondary border-border-light'
          }`}
          onClick={() => setFlipped(f => !f)}
        >
          {flipped ? word.english : word.japanese}
        </div>
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => { setIndex(i => (i - 1 + availableWordsMemo.length) % availableWordsMemo.length); setFlipped(false); }}
            className={`px-4 py-2 rounded-nav transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border border-border-dark-light'
                : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border border-border-light'
            }`}
          >
            Prev
          </button>
          <button 
            onClick={() => { setIndex(i => (i + 1) % availableWordsMemo.length); setFlipped(false); }}
            className={`px-4 py-2 rounded-nav transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border border-border-dark-light'
                : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border border-border-light'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // --- Game 2: Multiple Choice Quiz ---
  const MultipleChoiceQuiz = () => {
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    if (availableWordsMemo.length < 4) return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        Need at least 4 words.
      </div>
    );
    const word = availableWordsMemo[qIndex % availableWordsMemo.length];
    // Pick 3 random other words
    const options = useMemo(() => {
      const others = availableWordsMemo.filter(w => w.japanese !== word.japanese);
      const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
      const all = [...shuffled, word].sort(() => 0.5 - Math.random());
      return all;
    }, [qIndex, availableWordsMemo]);
    return (
      <div className="flex flex-col items-center">
        <div className={`text-2xl mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          What is the meaning of: <b>{word.japanese}</b>?
        </div>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-nav border transition-all duration-300 ${
                selected === i 
                  ? (opt.english === word.english 
                      ? 'bg-japanese-green text-white border-japanese-green' 
                      : 'bg-japanese-red text-white border-japanese-red')
                  : theme === 'dark'
                    ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border-border-dark-light'
                    : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border-border-light'
              }`}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
            >
              {opt.english}
            </button>
          ))}
        </div>
        {selected !== null && (
          <button 
            className="mt-4 px-4 py-2 bg-japanese-blue text-white rounded-nav hover:bg-japanese-blue/80 transition-all duration-300"
            onClick={() => { setQIndex(i => i + 1); setSelected(null); }}
          >
            Next
          </button>
        )}
      </div>
    );
  };

  // --- Game 3: Typing Practice ---
  const TypingPractice = () => {
    const [index, setIndex] = useState(0);
    const [input, setInput] = useState('');
    const [result, setResult] = useState<null | boolean>(null);
    if (availableWordsMemo.length === 0) return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        No words available.
      </div>
    );
    const word = availableWordsMemo[index];
    return (
      <div className="flex flex-col items-center">
        <div className={`text-2xl mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          Type the English for: <b>{word.japanese}</b>
        </div>
        <input
          className={`border px-4 py-2 rounded-input transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-dark-elevated border-border-dark-light text-text-dark-primary focus:border-japanese-red'
              : 'bg-white border-border-light text-text-primary focus:border-japanese-red'
          }`}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={result !== null}
        />
        {result !== null && (
          <div className={`mt-2 ${result ? 'text-japanese-green' : 'text-japanese-red'}`}>
            {result ? 'Correct!' : `Wrong! (${word.english})`}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {result === null ? (
            <button 
              className="px-4 py-2 bg-japanese-blue text-white rounded-nav hover:bg-japanese-blue/80 transition-all duration-300"
              onClick={() => setResult(input.trim().toLowerCase() === word.english.toLowerCase())}
            >
              Check
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-japanese-green text-white rounded-nav hover:bg-japanese-green/80 transition-all duration-300"
              onClick={() => { setIndex(i => (i + 1) % availableWordsMemo.length); setInput(''); setResult(null); }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  };

  // --- Game 4: Audio Match ---
  const AudioMatch = () => {
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    if (availableWordsMemo.length < 4) return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        Need at least 4 words.
      </div>
    );
    const word = availableWordsMemo[qIndex % availableWordsMemo.length];
    // Pick 3 random other words
    const options = useMemo(() => {
      const others = availableWordsMemo.filter(w => w.japanese !== word.japanese);
      const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
      const all = [...shuffled, word].sort(() => 0.5 - Math.random());
      return all;
    }, [qIndex, availableWordsMemo]);
    const handlePlayAudio = (text: string) => {
      playAudio(text);
    };
    return (
      <div className="flex flex-col items-center">
        <button 
          className={`mb-4 text-2xl p-4 rounded-nav transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border border-border-dark-light'
              : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border border-border-light'
          }`}
          onClick={() => handlePlayAudio(word.japanese)}
        >
          🔊 Play Audio
        </button>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-nav border transition-all duration-300 ${
                selected === i 
                  ? (opt.japanese === word.japanese 
                      ? 'bg-japanese-green text-white border-japanese-green' 
                      : 'bg-japanese-red text-white border-japanese-red')
                  : theme === 'dark'
                    ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border-border-dark-light'
                    : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border-border-light'
              }`}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
            >
              {opt.japanese}
            </button>
          ))}
        </div>
        {selected !== null && (
          <button 
            className="mt-4 px-4 py-2 bg-japanese-blue text-white rounded-nav hover:bg-japanese-blue/80 transition-all duration-300"
            onClick={() => { setQIndex(i => i + 1); setSelected(null); }}
          >
            Next
          </button>
        )}
      </div>
    );
  };

  // --- Game 5: Memory Match ---
  const MemoryMatch = () => {
    // Prepare pairs: each word as Japanese and English
    const pairs = useMemo(() => {
      return availableWordsMemo.slice(0, 8).flatMap(word => [
        { id: word.japanese, value: word.japanese, match: word.english, type: 'japanese' },
        { id: word.english, value: word.english, match: word.japanese, type: 'english' },
      ]);
    }, [availableWordsMemo]);
    const shuffled = useMemo(() => pairs.sort(() => 0.5 - Math.random()), [pairs]);
    const [cards, setCards] = useState(shuffled);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);

    const handleFlip = (idx: number) => {
      if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
      setFlipped(f => [...f, idx]);
    };
    React.useEffect(() => {
      if (flipped.length === 2) {
        setMoves(m => m + 1);
        const [i, j] = flipped;
        if (
          cards[i].type !== cards[j].type &&
          (cards[i].value === cards[j].match || cards[j].value === cards[i].match)
        ) {
          setTimeout(() => {
            setMatched(m => [...m, i, j]);
            setFlipped([]);
          }, 700);
        } else {
          setTimeout(() => setFlipped([]), 900);
        }
      }
    }, [flipped, cards]);
    const isComplete = matched.length === cards.length && cards.length > 0;
    return (
      <div className="flex flex-col items-center">
        <div className={`mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          Moves: {moves}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            return (
              <button
                key={idx}
                className={`w-16 h-16 rounded-nav border transition-all duration-300 ${
                  isFlipped
                    ? matched.includes(idx)
                      ? 'bg-japanese-green text-white border-japanese-green'
                      : theme === 'dark'
                        ? 'bg-dark-tertiary border-border-dark-medium'
                        : 'bg-light-tertiary border-border-medium'
                    : theme === 'dark'
                      ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border-border-dark-light'
                      : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border-border-light'
                }`}
                onClick={() => handleFlip(idx)}
                disabled={isFlipped}
              >
                {isFlipped ? card.value : '?'}
              </button>
            );
          })}
        </div>
        {isComplete && (
          <div className="mt-4 text-japanese-green font-bold">
            🎉 Complete! Moves: {moves}
          </div>
        )}
      </div>
    );
  };

  // --- Game 6: Fill in the Blank ---
  const FillInBlank = () => {
    // Simple sentence templates
    const templates = [
      'I like to {word}.',
      'Can you {word} this?',
      'Let\'s go to the {word}.',
      'Do you have a {word}?',
      'She will {word} soon.',
      'This is my {word}.',
      'He wants to {word}.',
      'Where is the {word}?',
    ];
    const [qIndex, setQIndex] = useState(0);
    const [input, setInput] = useState('');
    const [result, setResult] = useState<null | boolean>(null);
    if (availableWordsMemo.length === 0) return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        No words available.
      </div>
    );
    // Pick a random word and template
    const word = availableWordsMemo[qIndex % availableWordsMemo.length];
    const template = templates[qIndex % templates.length];
    const sentence = template.replace('{word}', '____');
    return (
      <div className="flex flex-col items-center">
        <div className={`text-xl mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          {sentence}
        </div>
        <input
          className={`border px-4 py-2 rounded-input transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-dark-elevated border-border-dark-light text-text-dark-primary focus:border-japanese-red'
              : 'bg-white border-border-light text-text-primary focus:border-japanese-red'
          }`}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={result !== null}
        />
        {result !== null && (
          <div className={`mt-2 ${result ? 'text-japanese-green' : 'text-japanese-red'}`}>
            {result ? 'Correct!' : `Wrong! (${word.english})`}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {result === null ? (
            <button 
              className="px-4 py-2 bg-japanese-blue text-white rounded-nav hover:bg-japanese-blue/80 transition-all duration-300"
              onClick={() => setResult(input.trim().toLowerCase() === word.english.toLowerCase())}
            >
              Check
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-japanese-green text-white rounded-nav hover:bg-japanese-green/80 transition-all duration-300"
              onClick={() => { setQIndex(i => i + 1); setInput(''); setResult(null); }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  };

  const gameComponents = [
    <FlashcardFlip key="flashcard" />,
    <MultipleChoiceQuiz key="mcq" />,
    <TypingPractice key="typing" />,
    <AudioMatch key="audio" />,
    <MemoryMatch key="memory" />,
    <FillInBlank key="fill" />,
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Mascot */}
        <div className="text-center mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-center">
            <div className="flex-1">
              <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                🎮 Japanese Learning Games
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Practice your Japanese vocabulary with fun interactive games
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <HybridMascots
                type="emotions"
                size="large"
                variant={activeGame === 0 ? "confident" : activeGame === 1 ? "thinking" : activeGame === 2 ? "focused" : activeGame === 3 ? "listening" : activeGame === 4 ? "concentrated" : "curious"}
                context="game"
                mood="positive"
              />
            </div>
          </div>
        </div>

        {/* Game Selection */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            Choose a Game
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {GAME_TITLES.map((title, index) => (
              <button
                key={index}
                onClick={() => setActiveGame(index)}
                className={`p-4 rounded-card transition-all duration-300 ${
                  activeGame === index
                    ? 'bg-japanese-red text-white shadow-button'
                    : theme === 'dark'
                      ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary border border-border-dark-light'
                      : 'bg-light-secondary text-text-primary hover:bg-light-tertiary border border-border-light'
                }`}
              >
                <div className="text-2xl mb-2">
                  {index === 0 && '🃏'}
                  {index === 1 && '❓'}
                  {index === 2 && '⌨️'}
                  {index === 3 && '🔊'}
                  {index === 4 && '🧠'}
                  {index === 5 && '📝'}
                </div>
                <div className="text-sm font-medium">{title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Display */}
        <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              {GAME_TITLES[activeGame]}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {availableWordsMemo.length} words available
            </p>
          </div>
          
          {availableWordsMemo.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">No Words Available</h3>
              <p className="mb-4">You need to unlock some word levels first to play games.</p>
              <Link 
                to="/learn" 
                className={`px-6 py-3 bg-japanese-red text-white rounded-button hover:bg-japanese-redLight shadow-button hover:shadow-button-hover transition-all duration-300`}
              >
                Start Learning
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              {gameComponents[activeGame]}
            </div>
          )}
        </div>

        {/* Mascot Section */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center space-x-8 mb-4">
            <HybridMascots
              type="emotions"
              size="medium"
              variant="excited"
              context="game"
            />
            <HybridMascots
              type="emotions"
              size="medium"
              variant="supportive"
              context="study"
            />
            <HybridMascots
              type="emotions"
              size="medium"
              variant="cheering"
              context="achievement"
            />
          </div>
          <p className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            Have fun learning Japanese! 🎮
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamesPage; 