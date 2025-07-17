import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { triviaTopics } from '../data/triviaContent';
import { playAudio } from '../utils/audio';

type DisplayMode = 'japanese' | 'romaji' | 'english';

const TriviaSection: React.FC = () => {
  const location = useLocation();
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [activeTab, setActiveTab] = useState(0);
  const [displayModes, setDisplayModes] = useState<DisplayMode[]>(['japanese', 'romaji', 'english']);

  // Handle tab state from navigation
  useEffect(() => {
    const tabIndex = location.state?.activeTab;
    if (typeof tabIndex === 'number' && tabIndex >= 0 && tabIndex < triviaTopics.length) {
      setActiveTab(tabIndex);
    }
  }, [location.state]);

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleDisplayMode = (mode: DisplayMode) => {
    setDisplayModes(prev => {
      // Don't allow removing the last active language
      if (prev.length === 1 && prev.includes(mode)) {
        return prev;
      }
      return prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode];
    });
  };

  const renderLanguageText = (text: { [key in DisplayMode]: string }) => {
    return displayModes.map((mode, index) => (
      <React.Fragment key={mode}>
        <div className="flex items-center gap-2">
          <span className={`block mb-2 ${
            mode === 'japanese' 
              ? theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'
              : theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'
          } ${mode === 'romaji' ? 'italic' : ''}`}>
            {text[mode]}
          </span>
          {mode === 'japanese' && (
            <button
              onClick={() => playAudio(text[mode])}
              className={`p-1 rounded-full transition-colors duration-200 ${
                theme === 'dark' ? 'text-japanese-red hover:text-japanese-red-dark' : 'text-japanese-red hover:text-japanese-red-dark'
              }`}
            >
              🔊
            </button>
          )}
        </div>
      </React.Fragment>
    ));
  };

  const renderContent = () => {
    const topic = triviaTopics[activeTab];
    return (
      <div className="mt-6">
        {topic.content.map((item, index) => (
          <div 
            key={index} 
            className={`p-6 rounded-2xl mb-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
              theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
            }`}
          >
            <div className="flex items-start mb-4">
              <div className={`w-12 h-12 rounded-nav flex items-center justify-center mr-4 text-white text-xl ${
                theme === 'dark' ? 'bg-japanese-red' : 'bg-japanese-red'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                {renderLanguageText(item.title)}
              </div>
            </div>
            
            <div className="mb-4">
              {renderLanguageText(item.description)}
            </div>

            <div className={`p-4 rounded-nav mb-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              {renderLanguageText(item.details)}
            </div>

            {item.examples && (
              <div className="mt-6">
                <h4 className={`font-bold mb-3 ${
                  theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'
                }`}>
                  Examples:
                </h4>
                <div className="space-y-3">
                  {item.examples.map((example, idx) => (
                    <div key={idx} className={`p-4 rounded-nav ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      {renderLanguageText(example)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInteractiveSections = () => (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
        Interactive Learning Sections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Anime & Manga', icon: '🎬', path: '/anime', color: 'japanese-purple' },
          { title: 'Video Games', icon: '🎮', path: '/games', color: 'japanese-green' },
          { title: 'Shinto & Religion', icon: '⛩️', path: '/culture', color: 'japanese-earth' },
          { title: 'History', icon: '📜', path: '/culture', color: 'japanese-orange' },
          { title: 'Food & Cuisine', icon: '🍜', path: '/culture', color: 'japanese-red' },
          { title: 'Learning Games', icon: '🎯', path: '/games', color: 'japanese-blue' }
        ].map((section, index) => (
          <Link key={section.title} to={section.path}>
            <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
              theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white text-xl ${
                  section.color === 'japanese-red' ? 'bg-japanese-red' :
                  section.color === 'japanese-blue' ? 'bg-japanese-blue' :
                  section.color === 'japanese-green' ? 'bg-japanese-green' :
                  section.color === 'japanese-orange' ? 'bg-japanese-orange' :
                  section.color === 'japanese-purple' ? 'bg-japanese-purple' :
                  'bg-japanese-earth'
                }`}>
                  {section.icon}
                </div>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {section.title}
                </h3>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Explore {section.title.toLowerCase()} and learn related vocabulary
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Japanese Trivia
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Discover fascinating facts about Japanese culture, anime, games, and more
              </p>
            </div>
            <Link
              to="/"
              className={`px-6 py-3 border-2 border-japanese-red text-japanese-red rounded-nav font-semibold hover:bg-japanese-red hover:text-white transition-colors duration-300 flex items-center gap-2`}
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Display Mode Controls */}
        <div className={`p-6 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            Display Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['japanese', 'romaji', 'english'] as DisplayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => toggleDisplayMode(mode)}
                className={`px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  displayModes.includes(mode)
                    ? 'bg-japanese-red text-white'
                    : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {mode === 'japanese' ? '🇯🇵 Japanese' :
                 mode === 'romaji' ? '📝 Romaji' :
                 '🇺🇸 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1 overflow-x-auto">
            {triviaTopics.map((topic, index) => (
              <button
                key={topic.title}
                onClick={() => handleTabChange(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  activeTab === index
                    ? 'bg-japanese-red text-white'
                    : `${theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'}`
                }`}
              >
                <span className="mr-2">{topic.icon}</span>
                {topic.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Interactive Sections */}
        {renderInteractiveSections()}
      </div>
    </div>
  );
};

export default TriviaSection; 