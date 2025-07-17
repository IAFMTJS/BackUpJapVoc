import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import CulturalItemCard from '../components/CulturalItemCard';
import TabPanel from '../components/TabPanel';
import { culturalTopics, languageRules, CulturalTopic } from '../data/culturalContent';

type DisplayMode = {
  romaji: boolean;
  english: boolean;
};

type TabType = 'cultural' | 'language';

const CultureAndRules: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>({
    romaji: true,
    english: true
  });

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleDisplayMode = (mode: keyof DisplayMode) => {
    setDisplayMode(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  };

  const renderContent = (topics: CulturalTopic[]) => (
    <div className="space-y-6">
      {topics.map((topic, index) => (
        <div key={index} className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">{topic.icon}</div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              {topic.title}
            </h2>
          </div>
          <div className="space-y-4">
            {topic.content.map((item, itemIndex) => (
              <div key={itemIndex}>
                <CulturalItemCard
                  {...item}
                  showRomaji={displayMode.romaji}
                  showEnglish={displayMode.english}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className={`relative overflow-hidden rounded-2xl mb-8 p-8 ${theme === 'dark' ? 'bg-gradient-to-br from-japanese-earth/20 to-japanese-earth-dark/20 border border-border-dark-light' : 'bg-gradient-to-br from-japanese-earth/10 to-japanese-earth-dark/10 border border-border-light'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative z-10 text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              Japanese Culture & Language Rules
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              Explore the rich cultural traditions and linguistic nuances of Japan
            </p>
          </div>
        </div>

        {/* Language Display Controls */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1">
            <button
              onClick={() => toggleDisplayMode('romaji')}
              className={`px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                displayMode.romaji
                  ? 'bg-japanese-blue text-white'
                  : theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📝 Romaji
            </button>
            <button
              onClick={() => toggleDisplayMode('english')}
              className={`px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                displayMode.english
                  ? 'bg-japanese-green text-white'
                  : theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📚 English
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1">
            {[
              { label: 'Cultural Topics', icon: '📚', value: 0 },
              { label: 'Language Rules', icon: '🎓', value: 1 }
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.value
                    ? 'bg-japanese-red text-white'
                    : `${theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'}`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <TabPanel value={activeTab} index={0}>
          {renderContent(culturalTopics)}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {renderContent(languageRules)}
        </TabPanel>
      </div>
    </div>
  );
};

export default CultureAndRules; 