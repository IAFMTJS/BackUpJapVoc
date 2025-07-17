import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';

interface DayData {
  date: Date;
  practiceCount: number;
  accuracy: number;
  hiraganaPractice: boolean;
  katakanaPractice: boolean;
}

const StreakCalendar: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { progress } = useProgress();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<DayData[]>([]);

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        card: 'bg-charcoal-700 hover:bg-charcoal-600',
        border: 'border-charcoal-600',
        calendar: {
          header: 'bg-charcoal-800',
          cell: 'bg-charcoal-700',
          today: 'bg-sage-600/20',
          streak: 'bg-sage-700/20',
          empty: 'bg-charcoal-900/20',
        },
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      card: 'bg-ivory-50 hover:bg-sage-50',
      border: 'border-sage-200',
      calendar: {
        header: 'bg-ivory-100',
        cell: 'bg-ivory-50',
        today: 'bg-sage-500/20',
        streak: 'bg-sage-100',
        empty: 'bg-charcoal-100/20',
      },
    };
  };

  const themeClasses = getThemeClasses();

  useEffect(() => {
    const generateCalendarData = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      
      const data: DayData[] = [];
      
      // Add padding for days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        const date = new Date(year, month, -i);
        data.unshift({
          date,
          practiceCount: 0,
          accuracy: 0,
          hiraganaPractice: false,
          katakanaPractice: false
        });
      }
      
      // Add days of the current month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if there was practice on this day
        const hiraganaLastAttempt = new Date(progress.hiragana.lastAttempt).toISOString().split('T')[0];
        const katakanaLastAttempt = new Date(progress.katakana.lastAttempt).toISOString().split('T')[0];
        
        const hiraganaPractice = hiraganaLastAttempt === dateStr;
        const katakanaPractice = katakanaLastAttempt === dateStr;
        
        data.push({
          date,
          practiceCount: (hiraganaPractice ? 1 : 0) + (katakanaPractice ? 1 : 0),
          accuracy: hiraganaPractice && katakanaPractice
            ? (progress.hiragana.correctAnswers + progress.katakana.correctAnswers) /
              (progress.hiragana.totalQuestions + progress.katakana.totalQuestions) * 100
            : hiraganaPractice
            ? (progress.hiragana.correctAnswers / progress.hiragana.totalQuestions) * 100
            : katakanaPractice
            ? (progress.katakana.correctAnswers / progress.katakana.totalQuestions) * 100
            : 0,
          hiraganaPractice,
          katakanaPractice
        });
      }
      
      // Add padding for days after the last day of the month
      const totalDays = 42; // 6 rows of 7 days
      const remainingDays = totalDays - data.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        data.push({
          date,
          practiceCount: 0,
          accuracy: 0,
          hiraganaPractice: false,
          katakanaPractice: false
        });
      }
      
      setCalendarData(data);
    };

    generateCalendarData();
  }, [currentMonth, progress]);

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getDayName = (day: number) => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isInCurrentMonth = (date: Date) => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const getCellClass = (day: DayData) => {
    const today = new Date();
    const isToday = day.date.toDateString() === today.toDateString();
    
    if (!isInCurrentMonth(day.date)) {
      return themeClasses.calendar.empty;
    }
    
    if (isToday) {
      return themeClasses.calendar.today;
    }
    
    if (day.practiceCount > 0) {
      return themeClasses.calendar.streak;
    }
    
    return themeClasses.calendar.cell;
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`mb-8 ${themeClasses.container} rounded-card shadow-soft p-8`}>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 rounded-nav transition-colors ${
              isDarkMode 
                ? 'text-ivory-300 hover:bg-charcoal-700 hover:text-ivory-100' 
                : 'text-charcoal-600 hover:bg-sage-50 hover:text-sage-700'
            }`}
          >
            ←
          </button>
          <h2 className={`text-2xl font-serif font-medium ${themeClasses.text}`}>
            {getMonthName(currentMonth)}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 rounded-nav transition-colors ${
              isDarkMode 
                ? 'text-ivory-300 hover:bg-charcoal-700 hover:text-ivory-100' 
                : 'text-charcoal-600 hover:bg-sage-50 hover:text-sage-700'
            }`}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className={`text-center py-2 font-medium ${themeClasses.text} ${themeClasses.calendar.header}`}
            >
              {day}
            </div>
          ))}
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`p-2 rounded-nav text-center transition-colors ${
                getCellClass(day)
              } ${!isInCurrentMonth(day.date) ? 'opacity-50' : ''}`}
            >
              <div className={`text-sm ${themeClasses.text}`}>
                {day.date.getDate()}
              </div>
              {day.practiceCount > 0 && (
                <div className={`text-xs mt-1 ${
                  isDarkMode ? 'text-sage-300' : 'text-sage-600'
                }`}>
                  {day.practiceCount} {day.practiceCount === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar; 