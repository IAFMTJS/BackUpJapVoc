import React from 'react';
import { EmotionalCategory, EMOTIONAL_CATEGORIES } from '../types/mood';
import { useTheme } from '../context/ThemeContext';

interface MoodSelectorProps {
  selectedMoods: EmotionalCategory[];
  onMoodSelect: (moods: EmotionalCategory[]) => void;
  className?: string;
}

const moodGroups = [
  {
    name: "Romantic & Love",
    icon: "💕",
    moods: [
      "love",
      "romantic"
    ] as EmotionalCategory[]
  },
  {
    name: "Anger & Frustration",
    icon: "😠",
    moods: [
      "anger",
      "angry",
      "annoyed"
    ] as EmotionalCategory[]
  },
  {
    name: "Positive Emotions",
    icon: "😊",
    moods: [
      "happiness",
      "positive",
      "playful"
    ] as EmotionalCategory[]
  },
  {
    name: "Social & Respect",
    icon: "🤝",
    moods: [
      "empathy",
      "empathetic",
      "respect"
    ] as EmotionalCategory[]
  },
  {
    name: "Motivation & Determination",
    icon: "💪",
    moods: [
      "determination",
      "motivational"
    ] as EmotionalCategory[]
  },
  {
    name: "Neutral & Indifferent",
    icon: "😐",
    moods: [
      "neutral",
      "indifferent"
    ] as EmotionalCategory[]
  },
  {
    name: "Fear & Anxiety",
    icon: "😨",
    moods: [
      "fear"
    ] as EmotionalCategory[]
  },
  {
    name: "Surprise & Disgust",
    icon: "😲",
    moods: [
      "surprise",
      "disgust"
    ] as EmotionalCategory[]
  },
  {
    name: "Sadness & Grief",
    icon: "😢",
    moods: [
      "sadness"
    ] as EmotionalCategory[]
  },
  {
    name: "Gratitude & Appreciation",
    icon: "🙏",
    moods: [
      "gratitude"
    ] as EmotionalCategory[]
  }
];

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMoods, onMoodSelect, className }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredGroup, setHoveredGroup] = React.useState<string | null>(null);

  const handleMoodToggle = (mood: EmotionalCategory) => {
    const newMoods = selectedMoods.includes(mood)
      ? selectedMoods.filter(m => m !== mood)
      : [...selectedMoods, mood];
    onMoodSelect(newMoods);
  };

  const handleGroupSelect = (moods: EmotionalCategory[]) => {
    // If all moods in the group are selected, deselect them
    const allSelected = moods.every(mood => selectedMoods.includes(mood));
    if (allSelected) {
      onMoodSelect(selectedMoods.filter(mood => !moods.includes(mood)));
    } else {
      // Otherwise, add any unselected moods from the group
      const newMoods = [...selectedMoods];
      moods.forEach(mood => {
        if (!newMoods.includes(mood)) {
          newMoods.push(mood);
        }
      });
      onMoodSelect(newMoods);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-nav font-semibold transition-all duration-300 flex items-center gap-2 ${
          selectedMoods.length > 0
            ? 'bg-japanese-red text-white shadow-button'
            : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        title="Select moods to filter expressions"
      >
        <span>😊</span>
        <span>
          {selectedMoods.length > 0 
            ? `${selectedMoods.length} Mood${selectedMoods.length > 1 ? 's' : ''} Selected`
            : 'Select Moods'}
        </span>
        <span>🔽</span>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-2xl shadow-lg z-50 ${
          theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
        }`}>
          <div className="p-4">
            <h3 className={`text-lg font-bold mb-2 text-center ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              How are you feeling?
            </h3>
            <p className={`text-sm text-center mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              Select one or more moods to find the perfect expressions
            </p>

            {/* Quick Select Groups */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {moodGroups.map((group) => (
                <div
                  key={group.name}
                  onMouseEnter={() => setHoveredGroup(group.name)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  onClick={() => handleGroupSelect(group.moods)}
                  className={`p-3 rounded-nav cursor-pointer transition-all duration-200 text-center ${
                    group.moods.every(mood => selectedMoods.includes(mood))
                      ? 'bg-japanese-red text-white'
                      : theme === 'dark' ? 'bg-dark-tertiary hover:bg-gray-600' : 'bg-light-tertiary hover:bg-gray-200'
                  } ${hoveredGroup === group.name ? 'transform -translate-y-1 shadow-lg' : ''}`}
                >
                  <div className="text-2xl mb-1">{group.icon}</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    {group.name}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {group.moods.length} moods
                  </div>
                </div>
              ))}
            </div>

            {/* Individual Mood Selection */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(EMOTIONAL_CATEGORIES).map(([category, { name, emoji, description }]) => (
                <button
                  key={category}
                  onClick={() => handleMoodToggle(category as EmotionalCategory)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedMoods.includes(category as EmotionalCategory)
                      ? 'bg-japanese-red text-white'
                      : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={description}
                >
                  <span>{emoji}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSelector; 