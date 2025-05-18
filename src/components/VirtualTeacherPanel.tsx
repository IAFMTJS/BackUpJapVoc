import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

// Utility to get today's date as YYYY-MM-DD
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Utility to get/set quest progress in localStorage
function getQuestProgress() {
  try {
    return JSON.parse(localStorage.getItem('virtualTeacherQuest') || '{}');
  } catch {
    return {};
  }
}
function setQuestProgress(progress: any) {
  localStorage.setItem('virtualTeacherQuest', JSON.stringify(progress));
}
function getQuestStreak() {
  try {
    return Number(localStorage.getItem('virtualTeacherQuestStreak') || '0');
  } catch {
    return 0;
  }
}
function setQuestStreak(streak: number) {
  localStorage.setItem('virtualTeacherQuestStreak', String(streak));
}
function getPanelMinimized() {
  return localStorage.getItem('virtualTeacherPanelMinimized') === 'true';
}
function setPanelMinimized(val: boolean) {
  localStorage.setItem('virtualTeacherPanelMinimized', String(val));
}

const QUESTS = [
  {
    key: 'master5words',
    description: 'Master 5 new words today',
    type: 'words',
    target: 5,
    section: 'Practice',
  },
  {
    key: 'practiceSentences',
    description: 'Practice 3 sentences',
    type: 'sentences',
    target: 3,
    section: 'Practice',
  },
  {
    key: 'listening',
    description: 'Complete 2 listening practices',
    type: 'listening',
    target: 2,
    section: 'Practice',
  },
  {
    key: 'timedGame',
    description: 'Score 10 points in Timed Practice',
    type: 'timed',
    target: 10,
    section: 'Practice',
  },
  {
    key: 'review10',
    description: 'Review 10 old words',
    type: 'review',
    target: 10,
    section: 'Words',
  },
  {
    key: 'streak3',
    description: 'Maintain a 3-day quest streak',
    type: 'streak',
    target: 3,
    section: 'Practice',
  },
];

const encouragements = [
  "Keep going! You're almost there!",
  "Great job! Consistency is key.",
  "You're making amazing progress!",
  "Don't forget to take a break and come back refreshed!",
  "Every step counts. Well done!",
  "You're only {remaining} away from your goal!"
];

const getContextualEncouragement = (remaining: number) => {
  if (remaining === 1) return "You're only 1 away from your goal!";
  if (remaining > 1) return `You're only ${remaining} away from your goal!`;
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

const getQuestHistory = (progress: any) => {
  const days = Object.keys(progress).sort().reverse().slice(0, 7);
  return days.map(day => ({
    date: day,
    quest: progress[day]?.quest?.description || '',
    completed: progress[day]?.completed || false,
  }));
};

const VirtualTeacherPanel: React.FC<{
  masteredWords: number;
  practicedSentences: number;
  listeningCount: number;
  timedScore?: number;
  reviewCount?: number;
  onGoToSection?: (section: string) => void;
}> = ({ masteredWords, practicedSentences, listeningCount, timedScore = 0, reviewCount = 0, onGoToSection }) => {
  const [quest, setQuest] = useState<any>(null);
  const [progress, setProgress] = useState<any>(getQuestProgress);
  const [encouragement, setEncouragement] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreakState] = useState(getQuestStreak());
  const [showHistory, setShowHistory] = useState(false);
  const [minimized, setMinimized] = useState(getPanelMinimized());

  // Personalized quest selection
  function pickQuest() {
    // Prioritize weakest area
    const stats = [
      { type: 'words', value: masteredWords },
      { type: 'sentences', value: practicedSentences },
      { type: 'listening', value: listeningCount },
      { type: 'timed', value: timedScore },
      { type: 'review', value: reviewCount },
      { type: 'streak', value: streak },
    ];
    stats.sort((a, b) => a.value - b.value);
    const weakest = stats[0].type;
    const candidates = QUESTS.filter(q => q.type === weakest);
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
    return QUESTS[Math.floor(Math.random() * QUESTS.length)];
  }

  // Pick a quest for today
  useEffect(() => {
    const today = getToday();
    let questForToday = progress[today]?.quest;
    if (!questForToday) {
      questForToday = pickQuest();
      setProgress((prev: any) => {
        const updated = { ...prev, [today]: { quest: questForToday, completed: false } };
        setQuestProgress(updated);
        return updated;
      });
    }
    setQuest(questForToday);
  }, []);

  // Update quest completion and streak
  useEffect(() => {
    if (!quest) return;
    const today = getToday();
    let completed = false;
    let current = 0;
    if (quest.type === 'words') { current = masteredWords; completed = masteredWords >= quest.target; }
    if (quest.type === 'sentences') { current = practicedSentences; completed = practicedSentences >= quest.target; }
    if (quest.type === 'listening') { current = listeningCount; completed = listeningCount >= quest.target; }
    if (quest.type === 'timed') { current = timedScore; completed = timedScore >= quest.target; }
    if (quest.type === 'review') { current = reviewCount; completed = reviewCount >= quest.target; }
    if (quest.type === 'streak') { current = streak; completed = streak >= quest.target; }
    setProgress((prev: any) => {
      const updated = { ...prev, [today]: { ...prev[today], completed } };
      setQuestProgress(updated);
      return updated;
    });
    // Streak logic
    if (completed && !progress[today]?.completed) {
      // Check yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const ymd = yesterday.toISOString().slice(0, 10);
      const prevStreak = getQuestStreak();
      const newStreak = progress[ymd]?.completed ? prevStreak + 1 : 1;
      setQuestStreak(newStreak);
      setStreakState(newStreak);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [quest, masteredWords, practicedSentences, listeningCount, timedScore, reviewCount, streak]);

  // Contextual encouragement
  useEffect(() => {
    if (!quest) return;
    let current = 0;
    if (quest.type === 'words') current = masteredWords;
    if (quest.type === 'sentences') current = practicedSentences;
    if (quest.type === 'listening') current = listeningCount;
    if (quest.type === 'timed') current = timedScore;
    if (quest.type === 'review') current = reviewCount;
    if (quest.type === 'streak') current = streak;
    const remaining = Math.max(0, quest.target - current);
    setEncouragement(getContextualEncouragement(remaining));
  }, [quest, masteredWords, practicedSentences, listeningCount, timedScore, reviewCount, streak]);

  // Responsive confetti
  const [windowSize, setWindowSize] = useState({ width: 400, height: 200 });
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Accessibility: focus on panel when unminimized
  useEffect(() => {
    if (!minimized) {
      const el = document.getElementById('virtual-teacher-panel');
      if (el) el.focus();
    }
  }, [minimized]);

  const today = getToday();
  const questCompleted = progress[today]?.completed;
  const questHistory = getQuestHistory(progress);

  if (minimized) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg z-50"
        aria-label="Show Virtual Teacher Panel"
        onClick={() => { setMinimized(false); setPanelMinimized(false); }}
      >
        👩‍🏫
      </button>
    );
  }

  return (
    <div
      id="virtual-teacher-panel"
      tabIndex={0}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 shadow flex flex-col gap-2 max-w-md mx-auto relative"
      aria-label="Virtual Teacher Panel"
      style={{ minWidth: 280 }}
    >
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <button
        className="absolute top-2 right-2 text-blue-400 hover:text-blue-700 text-lg"
        aria-label="Minimize Virtual Teacher Panel"
        onClick={() => { setMinimized(true); setPanelMinimized(true); }}
      >
        –
      </button>
      <div className="font-bold text-lg flex items-center gap-2">
        <span role="img" aria-label="teacher">👩‍🏫</span> Virtual Teacher
        <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Streak: {streak} days</span>
      </div>
      <div>
        {questCompleted ? (
          <span className="text-green-600 font-semibold">Quest complete! 🎉</span>
        ) : quest ? (
          <span>Today's Quest: <b>{quest.description}</b></span>
        ) : (
          <span>Loading quest...</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          Progress:
          <progress
            className="w-full h-2 align-middle mx-2"
            value={(() => {
              if (!quest) return 0;
              if (quest.type === 'words') return masteredWords;
              if (quest.type === 'sentences') return practicedSentences;
              if (quest.type === 'listening') return listeningCount;
              if (quest.type === 'timed') return timedScore;
              if (quest.type === 'review') return reviewCount;
              if (quest.type === 'streak') return streak;
              return 0;
            })()}
            max={quest?.target || 1}
            aria-valuenow={(() => {
              if (!quest) return 0;
              if (quest.type === 'words') return masteredWords;
              if (quest.type === 'sentences') return practicedSentences;
              if (quest.type === 'listening') return listeningCount;
              if (quest.type === 'timed') return timedScore;
              if (quest.type === 'review') return reviewCount;
              if (quest.type === 'streak') return streak;
              return 0;
            })()}
            aria-valuemax={quest?.target || 1}
          />
        </div>
        <span className="text-sm">{(() => {
          if (!quest) return null;
          if (quest.type === 'words') return `${masteredWords} / ${quest.target}`;
          if (quest.type === 'sentences') return `${practicedSentences} / ${quest.target}`;
          if (quest.type === 'listening') return `${listeningCount} / ${quest.target}`;
          if (quest.type === 'timed') return `${timedScore} / ${quest.target}`;
          if (quest.type === 'review') return `${reviewCount} / ${quest.target}`;
          if (quest.type === 'streak') return `${streak} / ${quest.target}`;
          return null;
        })()}</span>
      </div>
      <div className="italic text-blue-700">{encouragement}</div>
      {onGoToSection && quest && (
        <button
          className="mt-2 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring"
          onClick={() => onGoToSection(quest.section)}
        >
          Go to {quest.section}
        </button>
      )}
      <button
        className="mt-2 text-blue-600 underline text-sm self-start"
        onClick={() => setShowHistory(h => !h)}
        aria-expanded={showHistory}
      >
        {showHistory ? 'Hide Quest History' : 'Show Quest History'}
      </button>
      {showHistory && (
        <div className="mt-2 bg-white rounded p-2 border text-xs max-h-40 overflow-y-auto">
          <div className="font-semibold mb-1">Last 7 Quests</div>
          <ul>
            {questHistory.map((q, i) => (
              <li key={i} className={q.completed ? 'text-green-700' : 'text-gray-700'}>
                {q.date}: {q.quest} {q.completed ? '✓' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VirtualTeacherPanel; 