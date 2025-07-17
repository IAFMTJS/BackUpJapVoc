import React, { useState, useEffect } from 'react';
import { quizWords } from '../data/quizData';
import { playAudio, playDynamicAudio } from '../utils/audio';

interface Card {
  id: number;
  value: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const getShuffledCards = (mode: 'japanese' | 'japanese-english', count: number): Card[] => {
  const selected = quizWords.slice(0, count);
  let cards: Card[] = [];
  if (mode === 'japanese') {
    // Match identical Japanese words
    cards = selected.flatMap((word, idx) => [
      { id: idx * 2, value: word.japanese, pairId: idx, isFlipped: false, isMatched: false },
      { id: idx * 2 + 1, value: word.japanese, pairId: idx, isFlipped: false, isMatched: false },
    ]);
  } else {
    // Match Japanese with English
    cards = selected.flatMap((word, idx) => [
      { id: idx * 2, value: word.japanese, pairId: idx, isFlipped: false, isMatched: false },
      { id: idx * 2 + 1, value: word.english, pairId: idx, isFlipped: false, isMatched: false },
    ]);
  }
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

const MemoryGame: React.FC = () => {
  const [mode, setMode] = useState<'japanese' | 'japanese-english'>('japanese');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setCards(getShuffledCards(mode, 8));
    setFlipped([]);
    setMatches(0);
    setAttempts(0);
    setGameOver(false);
  }, [mode]);

  useEffect(() => {
    if (matches === 8) setGameOver(true);
  }, [matches]);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || cards[idx].isFlipped || cards[idx].isMatched) return;
    const newFlipped = [...flipped, idx];
    const newCards = cards.map((card, i) => i === idx ? { ...card, isFlipped: true } : card);
    setCards(newCards);
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setTimeout(() => {
        const [i1, i2] = newFlipped;
        if (newCards[i1].pairId === newCards[i2].pairId) {
          setCards(cards => cards.map((card, i) =>
            i === i1 || i === i2 ? { ...card, isMatched: true } : card
          ));
          setMatches(m => m + 1);
        } else {
          setCards(cards => cards.map((card, i) =>
            i === i1 || i === i2 ? { ...card, isFlipped: false } : card
          ));
        }
        setAttempts(a => a + 1);
        setFlipped([]);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setCards(getShuffledCards(mode, 8));
    setFlipped([]);
    setMatches(0);
    setAttempts(0);
    setGameOver(false);
  };

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Memory Game</h2>
      <div className="mb-4">
        <label className="mr-2">Mode:</label>
        <select value={mode} onChange={e => setMode(e.target.value as 'japanese' | 'japanese-english')}>
          <option value="japanese">Match Japanese Pairs</option>
          <option value="japanese-english">Match Japanese & English</option>
        </select>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            className={`h-20 w-full rounded-nav border text-lg font-bold flex items-center justify-center transition-all duration-200 ${card.isMatched ? 'bg-green-200' : card.isFlipped ? 'bg-blue-100' : 'bg-gray-200'}`}
            onClick={() => {
              handleFlip(idx);
              handlePlayAudio(card.value as string);
            }}
            disabled={card.isFlipped || card.isMatched || flipped.length === 2}
          >
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </button>
        ))}
      </div>
      <div className="mb-2">Matches: {matches} / 8</div>
      <div className="mb-2">Attempts: {attempts}</div>
      {gameOver && (
        <div className="mb-4 text-green-700 font-semibold">Game Over! You found all pairs in {attempts} attempts.</div>
      )}
      <button onClick={handleRestart} className="mt-2 px-4 py-2 bg-japanese-red text-text-primary dark:text-text-dark-primary rounded hover:bg-japanese-redLight">Restart</button>
    </div>
  );
};

export default MemoryGame; 