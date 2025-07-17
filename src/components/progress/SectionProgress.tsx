import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SectionData {
  id: string;
  name: string;
  totalWords: number;
  masteredWords: number;
  inProgressWords: number;
  notStartedWords: number;
  averageMastery: number;
  lastStudied?: Date;
}

interface SectionProgressProps {
  sections: SectionData[];
  className?: string;
}

const SectionProgress: React.FC<SectionProgressProps> = ({ sections, className = '' }) => {
  const { theme } = useTheme();

  const getProgressColor = (mastery: number) => {
    if (mastery >= 0.8) return 'japanese-green';
    if (mastery >= 0.5) return 'japanese-blue';
    if (mastery >= 0.2) return 'japanese-orange';
    return 'japanese-red';
  };

  const getProgressIcon = (mastery: number) => {
    if (mastery >= 0.8) return '🎓';
    if (mastery >= 0.5) return '📚';
    if (mastery >= 0.2) return '📖';
    return '📝';
  };

  if (!sections || sections.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className={`text-4xl mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          📚
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          No Sections Available
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          Learning sections will appear here as you progress.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section) => {
        const progressColor = getProgressColor(section.averageMastery);
        const progressIcon = getProgressIcon(section.averageMastery);
        const masteryPercentage = Math.round(section.averageMastery * 100);
        
        return (
          <div
            key={section.id}
            className={`p-4 rounded-2xl transition-all duration-300 hover:shadow-lg ${
              theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg bg-${progressColor}`}>
                  {progressIcon}
                </div>
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    {section.name}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {section.totalWords} words total
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold text-${progressColor}`}>
                  {masteryPercentage}%
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  Mastery
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-dark-primary' : 'bg-light-primary'}`}>
                <div
                  className={`h-full rounded-full bg-${progressColor} transition-all duration-500`}
                  style={{ width: `${masteryPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Word counts */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`text-center p-2 rounded-nav ${theme === 'dark' ? 'bg-japanese-green/10' : 'bg-japanese-green/5'}`}>
                <div className="font-semibold text-japanese-green">{section.masteredWords}</div>
                <div className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>Mastered</div>
              </div>
              <div className={`text-center p-2 rounded-nav ${theme === 'dark' ? 'bg-japanese-blue/10' : 'bg-japanese-blue/5'}`}>
                <div className="font-semibold text-japanese-blue">{section.inProgressWords}</div>
                <div className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>In Progress</div>
              </div>
              <div className={`text-center p-2 rounded-nav ${theme === 'dark' ? 'bg-japanese-earth/10' : 'bg-japanese-earth/5'}`}>
                <div className="font-semibold text-japanese-earth">{section.notStartedWords}</div>
                <div className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>Not Started</div>
              </div>
            </div>

            {section.lastStudied && (
              <div className={`text-xs mt-3 pt-2 border-t ${theme === 'dark' ? 'border-border-dark-light text-text-dark-secondary' : 'border-border-light text-text-secondary'}`}>
                Last studied: {section.lastStudied.toLocaleDateString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SectionProgress; 