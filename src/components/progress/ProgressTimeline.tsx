import React from 'react';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'achievement' | 'milestone' | 'study' | 'review';
  value?: number;
}

interface ProgressTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ events, className = '' }) => {
  const { theme } = useTheme();

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'milestone':
        return '🎯';
      case 'study':
        return '📚';
      case 'review':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'achievement':
        return 'japanese-purple';
      case 'milestone':
        return 'japanese-green';
      case 'study':
        return 'japanese-blue';
      case 'review':
        return 'japanese-orange';
      default:
        return 'japanese-earth';
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className={`text-4xl mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          📅
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          No Timeline Events
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          Start learning to see your progress timeline here!
        </p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Timeline line */}
        <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-border-dark-light' : 'bg-border-light'}`}></div>
        
        <div className="space-y-6">
          {sortedEvents.map((event, index) => {
            const eventColor = getEventColor(event.type);
            const eventIcon = getEventIcon(event.type);
            
            return (
              <div key={event.id} className="relative flex items-start">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-3 h-3 rounded-full border-2 border-white transform -translate-x-1.5 mt-2 bg-${eventColor}`}></div>
                
                {/* Event content */}
                <div className="ml-12 flex-1">
                  <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{eventIcon}</span>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                          {event.title}
                        </h4>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full text-white bg-${eventColor}`}>
                        {format(event.date, 'MMM dd')}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      {event.description}
                    </p>
                    
                    {event.value !== undefined && (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-nav text-xs font-medium bg-${eventColor}/10 text-${eventColor}`}>
                        <span>{event.value}</span>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      {format(event.date, 'MMM dd, yyyy • HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline; 