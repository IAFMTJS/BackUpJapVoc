import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SRSManager from '../components/SRSManager';

const SRSPage: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [showInfo, setShowInfo] = useState(true);

  const renderInfo = () => (
    <div className={themeClasses.card}>
      <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text.secondary}`}>
        What is SRS?
      </h2>
      <p className={themeClasses.text.primary}>
        Spaced Repetition System (SRS) is a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material to exploit the psychological spacing effect.
      </p>

      <h2 className={`text-xl font-semibold mt-8 mb-4 ${themeClasses.text.secondary}`}>
        How it works:
      </h2>
      <ul className={`list-disc pl-6 space-y-2 ${themeClasses.text.primary}`}>
        <li>Review words at optimal intervals</li>
        <li>Focus on difficult items more frequently</li>
        <li>Review mastered items less often</li>
        <li>Track your progress and retention</li>
      </ul>

      <div className="mt-8">
        <p className={themeClasses.text.primary}>
          Start using SRS to optimize your Japanese learning journey!
        </p>
        <div className="mt-6 flex gap-4">
          <button 
            className={themeClasses.button.primary}
            onClick={() => setShowInfo(false)}
          >
            Start Learning
          </button>
          <button 
            className={themeClasses.button.secondary}
            onClick={() => window.open('https://en.wikipedia.org/wiki/Spaced_repetition', '_blank')}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              Spaced Repetition System
            </h1>
          </div>
          {!showInfo && (
            <button 
              className={themeClasses.button.secondary}
              onClick={() => setShowInfo(true)}
            >
              View Info
            </button>
          )}
        </div>

        {showInfo ? renderInfo() : <SRSManager onComplete={() => setShowInfo(true)} />}
      </div>
    </div>
  );
};

export default SRSPage; 