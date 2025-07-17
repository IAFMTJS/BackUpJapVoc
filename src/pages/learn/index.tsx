import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LearnLayout } from '../../components/learn/LearnLayout';
import { LockOverlay } from '../../components/learn/LockOverlay';
import { LevelCard } from '../../components/learn/LevelCard';
import { learnService } from '../../services/learnService';
import { levels, getLevelById } from '../../data/levels';
import { 
  Award,
  Flame
} from 'lucide-react';
import type { UserProgress, Level } from '../../types/learn';

const LearnIndex: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [userStats, setUserStats] = useState({
    totalLevelsCompleted: 0,
    totalScore: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedLockedLevel, setSelectedLockedLevel] = useState<Level | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const userId = currentUser?.uid || null;
        const progress = await learnService.getUserProgress(userId);
        const stats = await learnService.getUserStats(userId);
        
        setUserProgress(progress);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();

    // Subscribe to real-time updates (only for authenticated users)
    const userId = currentUser?.uid || null;
    const unsubscribe = learnService.subscribeToProgress(userId, (progress) => {
      setUserProgress(progress);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getLevelStatus = (levelId: number) => {
    const levelKey = `level_${levelId}`;
    const progress = userProgress[levelKey];
    
    if (!progress) {
      return levelId === 1 ? 'unlocked' : 'locked';
    }
    
    if (progress.passed) return 'completed';
    if (progress.unlocked) return 'unlocked';
    return 'locked';
  };

  const getLevelScore = (levelId: number) => {
    const levelKey = `level_${levelId}`;
    const progress = userProgress[levelKey];
    return progress?.score || 0;
  };

  const isLevelUnlocked = (level: Level) => {
    if (level.id === 1) return true;
    
    return level.nextUnlocks.every(requiredLevelId => {
      const levelKey = `level_${requiredLevelId}`;
      const progress = userProgress[levelKey];
      return progress && progress.passed;
    });
  };

  const handleLevelClick = (level: Level) => {
    if (isLevelUnlocked(level)) {
      navigate(`/learn/${level.id}`);
    } else {
      setSelectedLockedLevel(level);
    }
  };

  const getRequiredLevels = (level: Level): Level[] => {
    return level.nextUnlocks
      .map(id => getLevelById(id))
      .filter((level): level is Level => level !== undefined);
  };

  if (loading) {
    return (
      <LearnLayout title="Loading..." showBackButton={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-japanese-red"></div>
        </div>
      </LearnLayout>
    );
  }

  const totalProgress = Math.round((userStats.totalLevelsCompleted / levels.length) * 100);

  return (
    <>
      <LearnLayout title="Learning Path" showBackButton={false}>
        {/* Hero Section with Progress */}
        <div className={`bg-gradient-to-br from-japanese-red via-japanese-orange to-japanese-yellow text-white`}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Learning Journey</h1>
              <p className="text-xl opacity-95">Master Japanese step by step</p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">Progress</span>
                <span className="text-sm font-bold">{userStats.totalLevelsCompleted}/{levels.length} Levels</span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-dark-elevated/30' : 'bg-white/30'} rounded-full h-3`}>
                <div 
                  className={`${theme === 'dark' ? 'bg-dark-elevated' : 'bg-white'} h-3 rounded-full transition-all duration-500 ease-out shadow-lg`}
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className={`text-center ${theme === 'dark' ? 'bg-dark-elevated/20' : 'bg-white/20'} rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30`}>
                <div className="text-3xl font-bold mb-1">{userStats.totalLevelsCompleted}</div>
                <div className="text-sm font-medium">Completed</div>
              </div>
              <div className={`text-center ${theme === 'dark' ? 'bg-dark-elevated/20' : 'bg-white/20'} rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30`}>
                <div className="text-3xl font-bold mb-1">{userStats.averageScore}%</div>
                <div className="text-sm font-medium">Avg Score</div>
              </div>
              <div className={`text-center ${theme === 'dark' ? 'bg-dark-elevated/20' : 'bg-white/20'} rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30`}>
                <div className="text-3xl font-bold mb-1">{levels.length - userStats.totalLevelsCompleted}</div>
                <div className="text-sm font-medium">Remaining</div>
              </div>
              <div className={`text-center ${theme === 'dark' ? 'bg-dark-elevated/20' : 'bg-white/20'} rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30`}>
                <div className="text-3xl font-bold mb-1 flex items-center justify-center">
                  <Flame className="w-6 h-6 mr-1 text-orange-300" />
                  {Math.floor(Math.random() * 7) + 3}
                </div>
                <div className="text-sm font-medium">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className={`${theme === 'dark' ? 'bg-dark' : 'bg-light'} min-h-screen`}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>Available Levels</h2>
              <div className={`flex items-center space-x-2 text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-japanese-green rounded-full"></div>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-japanese-red rounded-full"></div>
                  <span className="font-medium">Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-light-tertiary'} rounded-full`}></div>
                  <span className="font-medium">Locked</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {levels.map((level) => {
                const status = getLevelStatus(level.id);
                const score = getLevelScore(level.id);
                const unlocked = isLevelUnlocked(level);
                
                return (
                  <LevelCard
                    key={level.id}
                    level={level}
                    status={status}
                    score={score}
                    unlocked={unlocked}
                    onClick={handleLevelClick}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </LearnLayout>

      {/* Locked Level Modal */}
      {selectedLockedLevel && (
        <LockOverlay
          level={selectedLockedLevel}
          requiredLevels={getRequiredLevels(selectedLockedLevel)}
          onClose={() => setSelectedLockedLevel(null)}
        />
      )}
    </>
  );
};

export default LearnIndex; 