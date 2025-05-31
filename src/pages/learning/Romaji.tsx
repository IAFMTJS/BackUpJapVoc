import React, { useState, useEffect, useCallback } from 'react';
import { playAudio } from '../../utils/audio';
import { romajiWords, romajiSentences, romajiStories } from '../../data/romajiWords';
import Confetti from 'react-confetti';
import VirtualTeacherPanel from '../../components/VirtualTeacherPanel';
import { useProgress } from '../../context/ProgressContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Link } from 'react-router-dom';
import { convertToRomaji } from '../../utils/kuroshiro';

const TABS = ['Words', 'Sentences', 'Stories', 'Practice', 'Games'] as const;

type Tab = typeof TABS[number];

const PRACTICE_TYPES = [
  { key: 'romajiWord', label: 'Romaji for Word' },
  { key: 'romajiSentence', label: 'Romaji for Sentence' },
  { key: 'matching', label: 'Matching' },
  { key: 'englishWord', label: 'English for Word' },
  { key: 'timed', label: 'Timed' },
  { key: 'listening', label: 'Listening' },
] as const;
type PracticeType = typeof PRACTICE_TYPES[number]['key'];

// --- LocalStorage Utility Functions (for future Firebase migration) ---
function getRomajiProgress() {
  try {
    return JSON.parse(localStorage.getItem('romajiProgress') || '{}');
  } catch {
    return {};
  }
}
function setRomajiProgress(progress: any) {
  localStorage.setItem('romajiProgress', JSON.stringify(progress));
}
function getRomajiSetting(key: string, defaultValue: boolean) {
  const val = localStorage.getItem(key);
  if (val === null) return defaultValue;
  return val === 'true';
}
function setRomajiSetting(key: string, value: boolean) {
  localStorage.setItem(key, String(value));
}
function getRomajiStreak() {
  try {
    return JSON.parse(localStorage.getItem('romajiStreak') || '{"count":0,"lastDate":""}');
  } catch {
    return { count: 0, lastDate: '' };
  }
}
function setRomajiStreak(streak: any) {
  localStorage.setItem('romajiStreak', JSON.stringify(streak));
}
// --- End LocalStorage Utility Functions ---

// --- Add Romaji Level Progress Utility ---
function getRomajiUnlockedLevels() {
  try {
    return JSON.parse(localStorage.getItem('romajiUnlockedLevels') || '[1]');
  } catch {
    return [1];
  }
}
function setRomajiUnlockedLevels(levels: number[]) {
  localStorage.setItem('romajiUnlockedLevels', JSON.stringify(levels));
}
function getRomajiCurrentLevel() {
  const val = localStorage.getItem('romajiCurrentLevel');
  return val ? Number(val) : 1;
}
function setRomajiCurrentLevel(level: number) {
  localStorage.setItem('romajiCurrentLevel', String(level));
}
// --- End Romaji Level Progress Utility ---

// --- Speech Recognition Utility ---
function useSpeechRecognition({ onResult, onEnd }: { onResult: (text: string) => void, onEnd?: () => void }) {
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'ja-JP';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognitionRef.current.onend = () => {
      setListening(false);
      if (onEnd) onEnd();
    };
    recognitionRef.current.onerror = () => {
      setListening(false);
      if (onEnd) onEnd();
    };
  }, [onResult, onEnd]);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };
  return { listening, startListening, stopListening };
}

const RomajiSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('Words');
  // Practice state
  const [practiceType, setPracticeType] = useState<PracticeType>('romajiWord');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [showRomaji, setShowRomaji] = useState(() => getRomajiSetting('romajiShowRomaji', true));
  const [showKanji, setShowKanji] = useState(() => getRomajiSetting('romajiShowKanji', false));
  const [showHiragana, setShowHiragana] = useState(() => getRomajiSetting('romajiShowHiragana', true));
  const [showEnglish, setShowEnglish] = useState(() => getRomajiSetting('romajiShowEnglish', true));
  const [audioAutoPlay, setAudioAutoPlay] = useState(() => getRomajiSetting('romajiAudioAutoPlay', false));
  const [showConfetti, setShowConfetti] = useState(false);
  const [hiraganaCache, setHiraganaCache] = useState<Record<string, string>>({});
  const [katakanaCache, setKatakanaCache] = useState<Record<string, string>>({});
  const currentWord = romajiWords[practiceIndex % romajiWords.length];
  const currentSentence = romajiSentences[practiceIndex % romajiSentences.length];
  // For matching
  const [matchOptions, setMatchOptions] = useState(() => {
    const options = romajiWords.slice(0, 4);
    return options.sort(() => 0.5 - Math.random());
  });
  const [matchSelected, setMatchSelected] = useState<number | null>(null);
  const [matchResult, setMatchResult] = useState<null | boolean>(null);
  const [streak, setStreak] = useState(getRomajiStreak);
  // Timed mode state
  const [timedActive, setTimedActive] = useState(false);
  const [timedTime, setTimedTime] = useState(60);
  const [timedScore, setTimedScore] = useState(0);
  const [timedCurrent, setTimedCurrent] = useState(() => Math.floor(Math.random() * romajiWords.length));
  // Listening mode state
  const [listeningIndex, setListeningIndex] = useState(0);
  const listeningWord = romajiWords[listeningIndex % romajiWords.length];
  const [level, setLevel] = useState(() => getRomajiCurrentLevel());
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(getRomajiUnlockedLevels);
  // For speech recognition feedback
  const [speechResult, setSpeechResult] = useState<string | null>(null);
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  // Filtered data by level
  const levelWords = romajiWords.filter(w => w.level === level);
  const levelSentences = romajiSentences.filter(s => s.level === level);
  const levelStories = romajiStories.filter(s => s.level === level);

  const { progress: globalProgress, updateProgress } = useProgress();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  // Persist progress and settings
  React.useEffect(() => {
    setRomajiSetting('romajiShowRomaji', showRomaji);
  }, [showRomaji]);
  React.useEffect(() => {
    setRomajiSetting('romajiShowKanji', showKanji);
  }, [showKanji]);
  React.useEffect(() => {
    setRomajiSetting('romajiShowEnglish', showEnglish);
  }, [showEnglish]);
  React.useEffect(() => {
    setRomajiSetting('romajiAudioAutoPlay', audioAutoPlay);
  }, [audioAutoPlay]);

  // Auto-play audio on word/sentence change if enabled
  React.useEffect(() => {
    if (audioAutoPlay && tab === 'Words' && showKanji) playAudio(currentWord.japanese);
    if (audioAutoPlay && tab === 'Sentences' && showKanji) playAudio(romajiSentences[0].japanese);
    // eslint-disable-next-line
  }, [tab, practiceIndex, audioAutoPlay]);

  // Progress bar and summary logic
  const getPracticeItems = () => {
    if (practiceType === 'romajiWord' || practiceType === 'englishWord') return romajiWords;
    if (practiceType === 'romajiSentence') return romajiSentences;
    if (practiceType === 'matching') return romajiWords;
    return [];
  };
  const getProgressKey = (item: any) => {
    if (practiceType === 'englishWord') return item.japanese + '-eng';
    return item.japanese;
  };
  const items = getPracticeItems();
  const masteredCount = items.filter(item => globalProgress[getProgressKey(item)]).length;
  const allMastered = masteredCount === items.length && items.length > 0;

  // Confetti animation when all mastered
  React.useEffect(() => {
    if (allMastered) {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [allMastered, practiceType]);

  // Streak logic
  React.useEffect(() => {
    if (tab === 'Practice' && result === true) {
      const today = getToday();
      if (streak.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const ymd = yesterday.toISOString().slice(0, 10);
        setStreak(s => {
          const newStreak = {
            count: s.lastDate === ymd ? s.count + 1 : 1,
            lastDate: today
          };
          setRomajiStreak(newStreak);
          return newStreak;
        });
      }
    }
    // eslint-disable-next-line
  }, [result]);

  // Badge logic
  const badge10 = masteredCount >= 10;
  const badgeAll = allMastered;

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  // Timed mode timer effect
  React.useEffect(() => {
    if (practiceType !== 'timed' || !timedActive) return;
    if (timedTime === 0) {
      setTimedActive(false);
      return;
    }
    const timer = setTimeout(() => setTimedTime(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [practiceType, timedActive, timedTime]);

  // Get available levels
  const allLevels = Array.from(new Set([...romajiWords, ...romajiSentences, ...romajiStories].map(x => x.level))).sort((a, b) => a - b);

  // Mastery calculation for current level
  const masteredInLevel = levelWords.filter(word => globalProgress[word.japanese]).length;
  const masteryThreshold = Math.max(1, Math.floor(levelWords.length * 0.8)); // 80% or at least 1
  const levelMastered = masteredInLevel >= masteryThreshold && levelWords.length > 0;
  // Unlock next level if mastered
  React.useEffect(() => {
    if (levelMastered) {
      const nextLevel = level + 1;
      if (!unlockedLevels.includes(nextLevel) && romajiWords.some(w => w.level === nextLevel)) {
        const newUnlocked = [...unlockedLevels, nextLevel];
        setUnlockedLevels(newUnlocked);
        setRomajiUnlockedLevels(newUnlocked);
      }
    }
  }, [levelMastered, level, unlockedLevels]);
  // Persist current level
  React.useEffect(() => {
    setRomajiCurrentLevel(level);
  }, [level]);

  // Helper: simple similarity score
  function similarity(a: string, b: string) {
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();
    if (!a || !b) return 0;
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    return Math.round((matches / Math.max(a.length, b.length)) * 100);
  }

  // Calculate practiced sentences and listening count for quests
  const practicedSentences = romajiSentences.filter(s => globalProgress[s.japanese]).length;
  // For listening, you could track a key in progress or use a placeholder for now
  const listeningCount = Object.keys(globalProgress).filter(k => k.startsWith('listening-')).length;

  // Dummy values for timedScore and reviewCount (replace with real tracking if available)
  // const timedScore = 0; // TODO: integrate with timed practice score
  const reviewCount = 0; // TODO: integrate with review tracking

  // Handler for VirtualTeacherPanel navigation
  function handleGoToSection(section: string) {
    if (section === 'Practice') setTab('Practice');
    else if (section === 'Words') setTab('Words');
    else if (section === 'Sentences') setTab('Sentences');
    else if (section === 'Stories') setTab('Stories');
    else if (section === 'Games') setTab('Games');
  }

  // Convert kanji to hiragana/katakana
  const getHiragana = async (text: string) => {
    if (hiraganaCache[text]) {
      return hiraganaCache[text];
    }
    try {
      const hiragana = await convertToRomaji(text, { to: 'hiragana' });
      setHiraganaCache(prev => ({ ...prev, [text]: hiragana }));
      return hiragana;
    } catch (error) {
      console.error('Error converting to hiragana:', error);
      return text;
    }
  };

  const getKatakana = async (text: string) => {
    if (katakanaCache[text]) {
      return katakanaCache[text];
    }
    try {
      const katakana = await convertToRomaji(text, { to: 'katakana' });
      setKatakanaCache(prev => ({ ...prev, [text]: katakana }));
      return katakana;
    } catch (error) {
      console.error('Error converting to katakana:', error);
      return text;
    }
  };

  // Convert all words/sentences/stories to hiragana/katakana on mount
  useEffect(() => {
    const convertAllToKana = async () => {
      const allTexts = [
        ...romajiWords.map(w => w.japanese),
        ...romajiSentences.map(s => s.japanese),
        ...romajiStories.map(s => s.japanese)
      ];
      
      const uniqueTexts = [...new Set(allTexts)];
      const results = await Promise.all(
        uniqueTexts.map(async text => {
          const [hiragana, katakana] = await Promise.all([
            getHiragana(text),
            getKatakana(text)
          ]);
          return [text, hiragana, katakana];
        })
      );
      
      const hiraganaResults = Object.fromEntries(results.map(([text, hiragana]) => [text, hiragana]));
      const katakanaResults = Object.fromEntries(results.map(([text, _, katakana]) => [text, katakana]));
      
      setHiraganaCache(hiraganaResults);
      setKatakanaCache(katakanaResults);
    };

    convertAllToKana();
  }, []);

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      <h1 className="text-3xl font-bold mb-6 text-center">Romaji Learning</h1>
      {/* Virtual Teacher Panel */}
      <VirtualTeacherPanel
        masteredWords={masteredInLevel}
        practicedSentences={practicedSentences}
        listeningCount={listeningCount}
        timedScore={timedScore}
        reviewCount={reviewCount}
        onGoToSection={handleGoToSection}
      />
      {/* Level selector */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <label className="flex items-center gap-2">
          <span className="font-semibold">Level:</span>
          <select value={level} onChange={e => {
            const newLevel = Number(e.target.value);
            if (unlockedLevels.includes(newLevel)) setLevel(newLevel);
          }} className="border rounded px-2 py-1">
            {allLevels.map(lvl => (
              <option key={lvl} value={lvl} disabled={!unlockedLevels.includes(lvl)}>
                Level {lvl} {unlockedLevels.includes(lvl) ? (lvl < Math.max(...unlockedLevels) ? '✓' : '') : '🔒'}
              </option>
            ))}
          </select>
        </label>
        {!unlockedLevels.includes(level) && (
          <span className="text-red-500 ml-2" title="Master previous level to unlock">🔒 Locked</span>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showKanji} onChange={() => setShowKanji(v => !v)} /> Kanji
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showHiragana} onChange={() => setShowHiragana(v => !v)} /> Hiragana
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showRomaji} onChange={() => setShowRomaji(v => !v)} /> Romaji
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showEnglish} onChange={() => setShowEnglish(v => !v)} /> English
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={audioAutoPlay} onChange={() => setAudioAutoPlay(v => !v)} /> Audio Auto-Play
        </label>
      </div>
      {/* Streak and badges */}
      <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
        <div className="flex items-center gap-2 bg-yellow-100 rounded px-3 py-1">
          <span role="img" aria-label="fire">🔥</span>
          <span className="font-semibold">Streak:</span>
          <span>{streak.count} day{streak.count === 1 ? '' : 's'}</span>
        </div>
        {badge10 && (
          <div className="flex items-center gap-2 bg-green-100 rounded px-3 py-1">
            <span role="img" aria-label="badge">🏅</span>
            <span>10 Mastered!</span>
          </div>
        )}
        {badgeAll && (
          <div className="flex items-center gap-2 bg-blue-100 rounded px-3 py-1">
            <span role="img" aria-label="trophy">🏆</span>
            <span>All Mastered!</span>
          </div>
        )}
      </div>
      {/* Progress bar and summary */}
      {tab === 'Practice' && (
        <>
          <div className="w-full max-w-md mx-auto mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{masteredCount} / {items.length} mastered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-green-500"
                style={{ width: `${(items.length ? (masteredCount / items.length) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>
        </>
      )}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            className={`px-4 py-2 rounded-lg border ${tab === t ? 'bg-blue-500 text-white' : 'bg-dark-lighter border-dark-border hover:bg-dark-lightest'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bg-dark-lighter rounded-lg shadow-md p-6 min-h-[300px]">
        {tab === 'Words' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levelWords.map((word, i) => (
              <div key={i} className="p-4 border rounded flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {showKanji && <span className="text-2xl font-bold">{word.japanese}</span>}
                  {showHiragana && <span className="text-2xl">{hiraganaCache[word.japanese] || word.japanese}</span>}
                  <button onClick={() => playAudio(word.japanese)} title="Play Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                </div>
                {showRomaji && <span className="text-lg text-blue-700">{word.romaji}</span>}
                {showEnglish && <span className="text-gray-600">{word.english}</span>}
              </div>
            ))}
          </div>
        )}
        {tab === 'Sentences' && (
          <div className="space-y-4">
            {levelSentences.map((sentence, i) => (
              <div key={i} className="p-4 border rounded flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {showKanji && <span className="font-bold">{sentence.japanese}</span>}
                  {showHiragana && <span className="font-bold">{hiraganaCache[sentence.japanese] || sentence.japanese}</span>}
                  <button onClick={() => playAudio(sentence.japanese)} title="Play Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                </div>
                {showRomaji && <span className="text-blue-700">{sentence.romaji}</span>}
                {showEnglish && <span className="text-gray-600">{sentence.english}</span>}
              </div>
            ))}
          </div>
        )}
        {tab === 'Stories' && (
          <div className="space-y-6">
            {levelStories.map((story, i) => (
              <div key={i} className="p-4 border rounded flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg">{story.title}</span>
                  <button onClick={() => playAudio(story.japanese)} title="Play Story Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                </div>
                <div className="mb-2">
                  {showKanji && <span className="block font-medium">{story.japanese}</span>}
                  {showHiragana && <span className="block font-medium">{hiraganaCache[story.japanese] || story.japanese}</span>}
                  {showRomaji && <span className="block text-blue-700">{story.romaji}</span>}
                  {showEnglish && <span className="block text-gray-600">{story.english}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'Practice' && (
          <div className="max-w-md mx-auto flex flex-col gap-6 items-center">
            <h2 className="text-xl font-bold">Practice</h2>
            <div className="flex gap-2 mb-4">
              {PRACTICE_TYPES.map(pt => (
                <button
                  key={pt.key}
                  className={`px-3 py-1 rounded ${practiceType === pt.key ? 'bg-blue-500 text-white' : 'bg-dark-lighter text-text-primary'}`}
                  onClick={() => {
                    setPracticeType(pt.key);
                    setPracticeIndex(0);
                    setInput('');
                    setResult(null);
                    setMatchSelected(null);
                    setMatchResult(null);
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>
            {/* Fill-in-the-blank: Romaji for Word */}
            {practiceType === 'romajiWord' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{currentWord.japanese}</span>
                  <button onClick={() => playAudio(currentWord.japanese)} title="Play Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                  {globalProgress[`romaji-${currentWord.japanese}`]?.correct > 0 && <span title="Mastered" className="text-green-500 text-xl">✔️</span>}
                  {/* Speech button */}
                  <SpeechButton
                    target={currentWord.romaji}
                    setSpeechResult={setSpeechResult}
                    setSpeechScore={setSpeechScore}
                    setSpeechFeedback={setSpeechFeedback}
                  />
                </div>
                <input
                  className="border px-4 py-2 rounded text-lg"
                  placeholder="Type the romaji..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={result !== null}
                  autoFocus
                />
                {result !== null && (
                  <div className={`text-lg font-semibold ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${currentWord.romaji})`}</div>
                )}
                {/* Speech feedback */}
                {speechResult && (
                  <div className="mt-2 text-sm">
                    <b>Heard:</b> {speechResult}<br />
                    <b>Score:</b> {speechScore}%<br />
                    <span className={speechScore && speechScore >= 80 ? 'text-green-600' : 'text-red-600'}>{speechFeedback}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  {result === null ? (
                    <button
                      className="px-4 py-2 rounded bg-blue-500 text-white"
                      onClick={() => {
                        const correct = input.trim().toLowerCase() === currentWord.romaji.toLowerCase();
                        setResult(correct);
                        if (correct) updateProgress('romaji', currentWord.japanese, true);
                      }}
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded bg-green-500 text-white"
                      onClick={() => {
                        setPracticeIndex(i => i + 1);
                        setInput('');
                        setResult(null);
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
            {/* Fill-in-the-blank: Romaji for Sentence */}
            {practiceType === 'romajiSentence' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{currentSentence.japanese}</span>
                  <button onClick={() => playAudio(currentSentence.japanese)} title="Play Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                  {globalProgress[`romaji-${currentSentence.japanese}`]?.correct > 0 && <span title="Mastered" className="text-green-500 text-xl">✔️</span>}
                  {/* Speech button */}
                  <SpeechButton
                    target={currentSentence.romaji}
                    setSpeechResult={setSpeechResult}
                    setSpeechScore={setSpeechScore}
                    setSpeechFeedback={setSpeechFeedback}
                  />
                </div>
                <input
                  className="border px-4 py-2 rounded text-lg"
                  placeholder="Type the romaji..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={result !== null}
                  autoFocus
                />
                {result !== null && (
                  <div className={`text-lg font-semibold ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${currentSentence.romaji})`}</div>
                )}
                {/* Speech feedback */}
                {speechResult && (
                  <div className="mt-2 text-sm">
                    <b>Heard:</b> {speechResult}<br />
                    <b>Score:</b> {speechScore}%<br />
                    <span className={speechScore && speechScore >= 80 ? 'text-green-600' : 'text-red-600'}>{speechFeedback}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  {result === null ? (
                    <button
                      className="px-4 py-2 rounded bg-blue-500 text-white"
                      onClick={() => {
                        const correct = input.trim().toLowerCase() === currentSentence.romaji.toLowerCase();
                        setResult(correct);
                        if (correct) updateProgress('romaji', currentSentence.japanese, true);
                      }}
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded bg-green-500 text-white"
                      onClick={() => {
                        setPracticeIndex(i => i + 1);
                        setInput('');
                        setResult(null);
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
            {/* Matching: Romaji to Japanese */}
            {practiceType === 'matching' && (
              <>
                <div className="mb-2">Match the romaji to the correct Japanese word:</div>
                <div className="flex flex-col gap-2 w-full">
                  {matchOptions.map((opt, i) => (
                    <button
                      key={i}
                      className={`px-4 py-2 rounded border ${matchSelected === i ? (opt.romaji === matchOptions[0].romaji ? 'bg-green-200' : 'bg-red-200') : 'bg-dark-lighter'}`}
                      onClick={() => {
                        setMatchSelected(i);
                        const correct = opt.romaji === matchOptions[0].romaji;
                        setMatchResult(correct);
                        if (correct) updateProgress('romaji', opt.japanese, true);
                      }}
                      disabled={matchSelected !== null}
                    >
                      <span>{opt.japanese}</span>
                      <span className="text-blue-700">{opt.romaji}</span>
                      {globalProgress[`romaji-${opt.japanese}`]?.correct > 0 && <span title="Mastered" className="text-green-500 text-xl ml-2">✔️</span>}
                    </button>
                  ))}
                </div>
                {matchResult !== null && (
                  <div className={`text-lg font-semibold ${matchResult ? 'text-green-600' : 'text-red-600'}`}>{matchResult ? 'Correct!' : 'Wrong!'}</div>
                )}
                {matchResult !== null && (
                  <button
                    className="mt-4 px-4 py-2 rounded bg-green-500 text-white"
                    onClick={() => {
                      // Shuffle new options
                      const options = [romajiWords[practiceIndex % romajiWords.length], ...romajiWords.filter((_, i) => i !== (practiceIndex % romajiWords.length)).sort(() => 0.5 - Math.random()).slice(0, 3)];
                      setMatchOptions(options.sort(() => 0.5 - Math.random()));
                      setPracticeIndex(i => i + 1);
                      setMatchSelected(null);
                      setMatchResult(null);
                    }}
                  >
                    Next
                  </button>
                )}
              </>
            )}
            {/* Typing English for Word */}
            {practiceType === 'englishWord' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{currentWord.japanese}</span>
                  <button onClick={() => playAudio(currentWord.japanese)} title="Play Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                  {globalProgress[`romaji-${currentWord.japanese}-eng`]?.correct > 0 && <span title="Mastered" className="text-green-500 text-xl">✔️</span>}
                </div>
                <input
                  className="border px-4 py-2 rounded text-lg"
                  placeholder="Type the English..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={result !== null}
                  autoFocus
                />
                {result !== null && (
                  <div className={`text-lg font-semibold ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${currentWord.english})`}</div>
                )}
                <div className="flex gap-4">
                  {result === null ? (
                    <button
                      className="px-4 py-2 rounded bg-blue-500 text-white"
                      onClick={() => {
                        const correct = input.trim().toLowerCase() === currentWord.english.toLowerCase();
                        setResult(correct);
                        if (correct) updateProgress('romaji', currentWord.japanese + '-eng', true);
                      }}
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded bg-green-500 text-white"
                      onClick={() => {
                        setPracticeIndex(i => i + 1);
                        setInput('');
                        setResult(null);
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
            {/* Timed Practice */}
            {practiceType === 'timed' && (
              <div className="w-full flex flex-col items-center gap-4">
                {!timedActive ? (
                  <button
                    className="px-6 py-2 rounded bg-blue-500 text-white text-lg"
                    onClick={() => {
                      setTimedActive(true);
                      setTimedTime(60);
                      setTimedScore(0);
                      setTimedCurrent(Math.floor(Math.random() * romajiWords.length));
                      setInput('');
                      setResult(null);
                    }}
                  >
                    Start 60s Timed Practice
                  </button>
                ) : (
                  <>
                    <div className="text-lg font-bold">Time Left: {timedTime}s</div>
                    <div className="flex items-center gap-2 mb-2">
                      {showKanji && <span className="text-2xl font-bold">{romajiWords[timedCurrent].japanese}</span>}
                      {showHiragana && <span className="text-2xl">{hiraganaCache[romajiWords[timedCurrent].japanese] || romajiWords[timedCurrent].japanese}</span>}
                      <button onClick={() => playAudio(romajiWords[timedCurrent].japanese)} title="Play Audio" className="p-1 rounded-full hover:bg-gray-200">🔊</button>
                    </div>
                    {showRomaji && <div className="text-blue-700">{romajiWords[timedCurrent].romaji}</div>}
                    {showEnglish && <div className="text-gray-600">{romajiWords[timedCurrent].english}</div>}
                    <input
                      className="border px-4 py-2 rounded text-lg"
                      placeholder="Type the romaji..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      disabled={result !== null}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter' && result === null) {
                          const correct = input.trim().toLowerCase() === romajiWords[timedCurrent].romaji.toLowerCase();
                          setResult(correct);
                          if (correct) setTimedScore(s => s + 1);
                        }
                      }}
                    />
                    {result !== null && (
                      <div className={`text-lg font-semibold ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${romajiWords[timedCurrent].romaji})`}</div>
                    )}
                    <div className="flex gap-4">
                      {result === null ? (
                        <button
                          className="px-4 py-2 rounded bg-blue-500 text-white"
                          onClick={() => {
                            const correct = input.trim().toLowerCase() === romajiWords[timedCurrent].romaji.toLowerCase();
                            setResult(correct);
                            if (correct) setTimedScore(s => s + 1);
                          }}
                        >
                          Check
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 rounded bg-green-500 text-white"
                          onClick={() => {
                            setTimedCurrent(Math.floor(Math.random() * romajiWords.length));
                            setInput('');
                            setResult(null);
                          }}
                        >
                          Next
                        </button>
                      )}
                    </div>
                    <div className="text-lg font-bold mt-2">Score: {timedScore}</div>
                  </>
                )}
              </div>
            )}
            {/* Listening Practice */}
            {practiceType === 'listening' && (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    className="px-4 py-2 rounded bg-blue-500 text-white"
                    onClick={() => playAudio(listeningWord.japanese)}
                  >
                    🔊 Play Audio
                  </button>
                </div>
                <input
                  className="border px-4 py-2 rounded text-lg"
                  placeholder="Type the romaji you hear..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={result !== null}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && result === null) {
                      const correct = input.trim().toLowerCase() === listeningWord.romaji.toLowerCase();
                      setResult(correct);
                    }
                  }}
                />
                {result !== null && (
                  <div className={`text-lg font-semibold ${result ? 'text-green-600' : 'text-red-600'}`}>{result ? 'Correct!' : `Wrong! (${listeningWord.romaji})`}</div>
                )}
                <div className="flex gap-4">
                  {result === null ? (
                    <button
                      className="px-4 py-2 rounded bg-blue-500 text-white"
                      onClick={() => {
                        const correct = input.trim().toLowerCase() === listeningWord.romaji.toLowerCase();
                        setResult(correct);
                      }}
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded bg-green-500 text-white"
                      onClick={() => {
                        setListeningIndex(i => i + 1);
                        setInput('');
                        setResult(null);
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'Games' && (
          <div className="flex flex-col gap-8 items-center">
            {/* Memory Match Game */}
            <div className="w-full max-w-md p-4 border rounded shadow bg-dark-lighter">
              <h2 className="text-lg font-bold mb-2">Memory Match</h2>
              <MemoryMatchGame words={levelWords} />
            </div>
            {/* Multiple Choice Game */}
            <div className="w-full max-w-md p-4 border rounded shadow bg-dark-lighter">
              <h2 className="text-lg font-bold mb-2">Multiple Choice</h2>
              <MultipleChoiceGame words={levelWords} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Memory Match Game component
function MemoryMatchGame({ words }) {
  const [cards, setCards] = React.useState(() => {
    const pairs = words.slice(0, 6).flatMap(word => [
      { id: word.japanese, value: word.japanese, match: word.romaji, type: 'japanese' },
      { id: word.romaji, value: word.romaji, match: word.japanese, type: 'romaji' },
    ]);
    return pairs.sort(() => 0.5 - Math.random());
  });
  const [flipped, setFlipped] = React.useState([]);
  const [matched, setMatched] = React.useState([]);
  const [moves, setMoves] = React.useState(0);
  React.useEffect(() => {
    setCards(cards => cards.sort(() => 0.5 - Math.random()));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }, [words]);
  const handleFlip = idx => {
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
              className={`w-20 h-12 border rounded flex items-center justify-center text-lg font-bold ${isFlipped ? 'bg-blue-100' : 'bg-gray-200'}`}
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
}

// Multiple Choice Game component
function MultipleChoiceGame({ words }) {
  const [qIndex, setQIndex] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  if (words.length < 4) return <div>Need at least 4 words for this game.</div>;
  const word = words[qIndex % words.length];
  const options = React.useMemo(() => {
    const others = words.filter(w => w.japanese !== word.japanese);
    const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [...shuffled, word].sort(() => 0.5 - Math.random());
    return all;
  }, [qIndex, words]);
  return (
    <div className="flex flex-col items-center">
      <div className="text-lg mb-4">What is the romaji for: <b>{word.japanese}</b>?</div>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded border ${selected === i ? (opt.romaji === word.romaji ? 'bg-green-200' : 'bg-red-200') : 'bg-dark-lighter'}`}
            onClick={() => setSelected(i)}
            disabled={selected !== null}
          >
            {opt.romaji}
          </button>
        ))}
      </div>
      {selected !== null && (
        <button className="mt-4 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => { setQIndex(i => i + 1); setSelected(null); }}>Next</button>
      )}
    </div>
  );
}

// Add SpeechButton component at the bottom:
function SpeechButton({ target, setSpeechResult, setSpeechScore, setSpeechFeedback }: { target: string, setSpeechResult: (s: string) => void, setSpeechScore: (n: number) => void, setSpeechFeedback: (s: string) => void }) {
  const { listening, startListening } = useSpeechRecognition({
    onResult: (text) => {
      setSpeechResult(text);
      const score = similarity(text, target);
      setSpeechScore(score);
      setSpeechFeedback(score >= 80 ? 'Great pronunciation!' : 'Try again!');
    }
  });
  return (
    <button
      type="button"
      className={`ml-2 px-2 py-1 rounded ${listening ? 'bg-blue-200' : 'bg-gray-200'} text-sm`}
      onClick={startListening}
      title="Speak"
      disabled={listening}
    >
      {listening ? 'Listening...' : '🎤 Speak'}
    </button>
  );
}

export default RomajiSection; 