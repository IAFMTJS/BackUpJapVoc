import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import DarkThemeWelcome from '../components/ui/DarkThemeWelcome';

const DarkThemeDemo: React.FC = () => {
  const { theme, toggleTheme, getThemeClasses } = useTheme();
  const classes = getThemeClasses();
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <div className={`${classes.container} min-h-screen p-6`}>
      {/* Theme Toggle Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className={`${classes.card} flex items-center justify-between`}>
          <div>
            <h1 className={`${classes.title} text-2xl mb-2`}>
              Dark Theme Demo - Japanese Learning Platform
            </h1>
            <p className={`${classes.subtitle}`}>
              Test de nieuwe dark theme styling en componenten
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`${classes.button.primary} flex items-center gap-2`}
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Demo Sections */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section Toggle */}
        <div className={`${classes.card} text-center`}>
          <h2 className={`${classes.title} text-xl mb-4`}>
            Dark Theme Welcome Component
          </h2>
          <button
            onClick={() => setShowWelcome(!showWelcome)}
            className={`${classes.button.secondary}`}
          >
            {showWelcome ? 'Hide' : 'Show'} Dark Theme Welcome
          </button>
        </div>

        {showWelcome && (
          <div className="border-2 border-dashed border-border-light dark:border-border-dark-light rounded-card p-4">
            <DarkThemeWelcome
              userName="Demo User"
              currentLevel={5}
              dailyGoal={{ completed: 2, total: 3 }}
              onContinue={() => alert('Continue clicked!')}
            />
          </div>
        )}

        {/* Component Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons */}
          <div className={`${classes.card}`}>
            <h3 className={`${classes.title} text-lg mb-4`}>Buttons</h3>
            <div className="space-y-3">
              <button className={`${classes.button.primary} w-full`}>
                Primary Button
              </button>
              <button className={`${classes.button.secondary} w-full`}>
                Secondary Button
              </button>
              <button className="bg-accent-yellow dark:bg-accent-yellow-dark text-white rounded-button px-4 py-2 w-full">
                Accent Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className={`${classes.card}`}>
            <h3 className={`${classes.title} text-lg mb-4`}>Cards</h3>
            <div className="space-y-3">
              <div className={`${classes.card} p-4`}>
                <h4 className={`${classes.title} text-sm`}>Card Title</h4>
                <p className={`${classes.subtitle} text-sm`}>Card content goes here</p>
              </div>
              <div className="bg-light-secondary dark:bg-dark-secondary border border-border-light dark:border-border-dark-light rounded-card p-4">
                <h4 className={`${classes.title} text-sm`}>Secondary Card</h4>
                <p className={`${classes.subtitle} text-sm`}>With different styling</p>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className={`${classes.card}`}>
            <h3 className={`${classes.title} text-lg mb-4`}>Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={classes.text.secondary}>Level Progress</span>
                  <span className={classes.text.primary}>75%</span>
                </div>
                <div className="w-full bg-light-tertiary dark:bg-dark-tertiary rounded-full h-2">
                  <div className="bg-accent-orange dark:bg-accent-orange-dark h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={classes.text.secondary}>Daily Goal</span>
                  <span className={classes.text.primary}>2/3</span>
                </div>
                <div className="w-full bg-light-tertiary dark:bg-dark-tertiary rounded-full h-2">
                  <div className="bg-accent-yellow dark:bg-accent-yellow-dark h-2 rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className={`${classes.card}`}>
            <h3 className={`${classes.title} text-lg mb-4`}>Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-status-success rounded-full"></div>
                <span className={classes.text.primary}>Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-status-warning rounded-full"></div>
                <span className={classes.text.primary}>Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-status-error rounded-full"></div>
                <span className={classes.text.primary}>Error</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-status-info rounded-full"></div>
                <span className={classes.text.primary}>Info</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className={`${classes.card}`}>
          <h3 className={`${classes.title} text-lg mb-4`}>Typography</h3>
          <div className="space-y-2">
            <h1 className={`${classes.title} text-3xl`}>Heading 1 - Main Title</h1>
            <h2 className={`${classes.title} text-2xl`}>Heading 2 - Section Title</h2>
            <h3 className={`${classes.title} text-xl`}>Heading 3 - Subsection</h3>
            <p className={`${classes.text.primary}`}>
              This is primary text with good contrast and readability.
            </p>
            <p className={`${classes.text.secondary}`}>
              This is secondary text for supporting information.
            </p>
            <p className={`${classes.text.muted}`}>
              This is muted text for less important details.
            </p>
            <p className="text-japanese-red dark:text-japanese-red">
              This is Japanese red text for accents and links.
            </p>
          </div>
        </div>

        {/* Form Elements */}
        <div className={`${classes.card}`}>
          <h3 className={`${classes.title} text-lg mb-4`}>Form Elements</h3>
          <div className="space-y-4">
            <div>
              <label className={`${classes.text.primary} block text-sm font-medium mb-2`}>
                Input Field
              </label>
              <input
                type="text"
                placeholder="Enter some text..."
                className={`${classes.input} w-full`}
              />
            </div>
            <div>
              <label className={`${classes.text.primary} block text-sm font-medium mb-2`}>
                Textarea
              </label>
              <textarea
                placeholder="Enter longer text..."
                rows={3}
                className={`${classes.input} w-full`}
              />
            </div>
            <div>
              <label className={`${classes.text.primary} block text-sm font-medium mb-2`}>
                Select
              </label>
              <select className={`${classes.input} w-full`}>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Demo */}
        <div className={`${classes.card}`}>
          <h3 className={`${classes.title} text-lg mb-4`}>Navigation</h3>
          <nav className={`${classes.nav.background} rounded-card p-4`}>
            <div className="flex space-x-6">
              <a href="#" className={`${classes.nav.link.active}`}>
                Active Link
              </a>
              <a href="#" className={`${classes.nav.link.default}`}>
                Regular Link
              </a>
              <a href="#" className={`${classes.nav.link.default}`}>
                Another Link
              </a>
            </div>
          </nav>
        </div>

        {/* Cultural Elements */}
        <div className={`${classes.card}`}>
          <h3 className={`${classes.title} text-lg mb-4`}>Japanese Cultural Elements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-japanese-red rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                鳥
              </div>
              <span className={`${classes.text.secondary} text-sm`}>Torii</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-japanese-earth-light dark:bg-japanese-earth-dark-light rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                桜
              </div>
              <span className={`${classes.text.secondary} text-sm`}>Sakura</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-yellow dark:bg-accent-yellow-dark rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                折
              </div>
              <span className={`${classes.text.secondary} text-sm`}>Origami</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-japanese-earth-medium dark:bg-japanese-earth-dark-medium rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                茶
              </div>
              <span className={`${classes.text.secondary} text-sm`}>Tea</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkThemeDemo; 