import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWordLevel } from '../context/WordLevelContext';
import { wordLevels } from '../data/wordLevels';
import { JapaneseWord } from '../data/types';
import { playAudio } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

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
  const { getThemeClasses } = useTheme();
  const { availableWords } = useApp();
  const themeClasses = getThemeClasses();

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
    if (availableWordsMemo.length === 0) return <div>No words available.</div>;
    const word = availableWordsMemo[index];
    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-64 h-40 flex items-center justify-center border rounded-lg shadow-lg text-2xl cursor-pointer bg-dark-lighter ${flipped ? 'bg-dark-lightest' : ''}`}
          onClick={() => setFlipped(f => !f)}
        >
          {flipped ? word.english : word.japanese}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => { setIndex(i => (i - 1 + availableWordsMemo.length) % availableWordsMemo.length); setFlipped(false); }}>Prev</button>
          <button onClick={() => { setIndex(i => (i + 1) % availableWordsMemo.length); setFlipped(false); }}>Next</button>
        </div>
      </div>
    );
  };

  // --- Game 2: Multiple Choice Quiz ---
  const MultipleChoiceQuiz = () => {
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    if (availableWordsMemo.length < 4) return <div>Need at least 4 words.</div>;
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
        <div className="text-2xl mb-4">What is the meaning of: <b>{word.japanese}</b>?</div>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded border ${selected === i ? (opt.english === word.english ? 'bg-green-200' : 'bg-red-200') : 'bg-dark-lighter'}`}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
            >
              {opt.english}
            </button>
          ))}
        </div>
        {selected !== null && (
          <button className="mt-4" onClick={() => { setQIndex(i => i + 1); setSelected(null); }}>Next</button>
        )}
      </div>
    );
  };

  // --- Game 3: Typing Practice ---
  const TypingPractice = () => {
    const [index, setIndex] = useState(0);
    const [input, setInput] = useState('');
    const [result, setResult] = useState<null | boolean>(null);
    if (availableWordsMemo.length === 0) return <div>No words available.</div>;
    const word = availableWordsMemo[index];
    return (
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-4">Type the English for: <b>{word.japanese}</b></div>
        <input
          className="border px-2 py-1 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={result !== null}
        />
        {result !== null && (
          <div className={`mt-2 ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${word.english})`}</div>
        )}
        <div className="mt-4 flex gap-2">
          {result === null ? (
            <button onClick={() => setResult(input.trim().toLowerCase() === word.english.toLowerCase())}>Check</button>
          ) : (
            <button onClick={() => { setIndex(i => (i + 1) % availableWordsMemo.length); setInput(''); setResult(null); }}>Next</button>
          )}
        </div>
      </div>
    );
  };

  // --- Game 4: Audio Match ---
  const AudioMatch = () => {
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    if (availableWordsMemo.length < 4) return <div>Need at least 4 words.</div>;
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
        <button className="mb-4 text-2xl" onClick={() => handlePlayAudio(word.japanese)}>🔊 Play Audio</button>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded border ${selected === i ? (opt.japanese === word.japanese ? 'bg-green-200' : 'bg-red-200') : 'bg-dark-lighter'}`}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
            >
              {opt.japanese}
            </button>
          ))}
        </div>
        {selected !== null && (
          <button className="mt-4" onClick={() => { setQIndex(i => i + 1); setSelected(null); }}>Next</button>
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
        <div className="mb-4">Moves: {moves}</div>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            return (
              <button
                key={idx}
                className={`w-24 h-16 border rounded flex items-center justify-center text-lg font-bold ${isFlipped ? 'bg-blue-100' : 'bg-gray-200'}`}
                onClick={() => handleFlip(idx)}
                disabled={isFlipped}
              >
                {isFlipped ? card.value : '?'}
              </button>
            );
          })}
        </div>
        {isComplete && <div className="mt-4 text-green-600 font-bold">You matched all pairs!</div>}
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
    if (availableWordsMemo.length === 0) return <div>No words available.</div>;
    // Pick a random word and template
    const word = availableWordsMemo[qIndex % availableWordsMemo.length];
    const template = templates[qIndex % templates.length];
    const sentence = template.replace('{word}', '____');
    return (
      <div className="flex flex-col items-center">
        <div className="text-xl mb-4">{sentence}</div>
        <input
          className="border px-2 py-1 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={result !== null}
        />
        {result !== null && (
          <div className={`mt-2 ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${word.english})`}</div>
        )}
        <div className="mt-4 flex gap-2">
          {result === null ? (
            <button onClick={() => setResult(input.trim().toLowerCase() === word.english.toLowerCase())}>Check</button>
          ) : (
            <button onClick={() => { setQIndex(i => i + 1); setInput(''); setResult(null); }}>Next</button>
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
    <FillInBlank key="blank" />,
  ];

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              Interactive Games
            </h1>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {GAME_TITLES.map((title, i) => (
            <button
              key={title}
              onClick={() => setActiveGame(i)}
              className={`px-4 py-2 rounded-lg ${
                activeGame === i
                  ? themeClasses.button.primary
                  : themeClasses.button.secondary
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        <div className={themeClasses.card}>
          <div className="min-h-[300px] flex flex-col items-center">
            {gameComponents[activeGame]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage; 