import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Mascots from './Mascots';

interface DarkThemeWelcomeProps {
  userName?: string;
  currentLevel?: number;
  dailyGoal?: { completed: number; total: number };
  onContinue?: () => void;
}

const DarkThemeWelcome: React.FC<DarkThemeWelcomeProps> = ({
  userName = 'Janosh',
  currentLevel = 3,
  dailyGoal = { completed: 1, total: 1 },
  onContinue
}) => {
  const { theme, getThemeClasses } = useTheme();
  const classes = getThemeClasses();

  const isGoalAchieved = dailyGoal.completed >= dailyGoal.total;
  const progressPercentage = (dailyGoal.completed / dailyGoal.total) * 100;

  return (
    <div className={`${classes.container} bg-dark-background-gradient min-h-screen p-6`}>
      {/* Navigation Bar */}
      <nav className={`${classes.nav.background} mb-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8">
              <a href="#" className={`${classes.nav.link.active} text-lg font-semibold`}>
                Home
              </a>
              <a href="#" className={`${classes.nav.link.default} text-lg`}>
                Leren
              </a>
              <a href="#" className={`${classes.nav.link.default} text-lg`}>
                Woordenboek
              </a>
              <a href="#" className={`${classes.nav.link.default} text-lg`}>
                Instellingen
              </a>
            </div>
            <button className={`${classes.button.secondary} ${classes.text.primary}`}>
              Log Uit
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="space-y-4">
              <h1 className={`${classes.title} text-4xl lg:text-5xl font-bold`}>
                Welkom terug, {userName}!
              </h1>
              <p className={`${classes.subtitle} text-xl`}>
                Doorgaan met uw reis door Japans leren
              </p>
            </div>

            {/* Call to Action Button */}
            <button 
              onClick={onContinue}
              className={`${classes.button.primary} text-lg px-8 py-4 flex items-center gap-3`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Vervolg je pad
            </button>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Current Level Card */}
              <div className={`${classes.card} text-center`}>
                <h3 className={`${classes.text.secondary} text-sm font-medium mb-2`}>
                  Huidig Niveau
                </h3>
                <div className={`${classes.text.primary} text-3xl font-bold mb-3`}>
                  {currentLevel}
                </div>
                <div className="w-full bg-dark-tertiary rounded-full h-2">
                  <div 
                    className="bg-accent-orange-dark h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((currentLevel / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Daily Goal Card */}
              <div className={`${classes.card} text-center`}>
                <h3 className={`${classes.text.secondary} text-sm font-medium mb-2`}>
                  Dagdoel
                </h3>
                <div className={`${classes.text.primary} text-2xl font-bold mb-1`}>
                  {dailyGoal.completed}/{dailyGoal.total}
                </div>
                <div className={`text-sm ${isGoalAchieved ? 'text-status-success' : classes.text.muted}`}>
                  {isGoalAchieved ? 'Behaald' : 'In progress'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Mascots */}
          <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
            <Mascots 
              variant="welcome"
              size="large"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkThemeWelcome; 