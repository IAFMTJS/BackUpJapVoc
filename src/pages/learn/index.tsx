import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </LearnLayout>
    );
  }

  const totalProgress = Math.round((userStats.totalLevelsCompleted / levels.length) * 100);

  return (
    <>
      <LearnLayout title="Learning Path" showBackButton={false}>
        {/* Hero Section with Progress */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-text-primary dark:text-text-dark-primary">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary dark:text-text-dark-primary">Your Learning Journey</h1>
              <p className="text-xl text-text-primary dark:text-text-dark-primary opacity-95">Master Japanese step by step</p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-text-primary dark:text-text-dark-primary">Progress</span>
                <span className="text-sm font-bold text-text-primary dark:text-text-dark-primary">{userStats.totalLevelsCompleted}/{levels.length} Levels</span>
              </div>
              <div className="w-full bg-white dark:bg-dark-elevated bg-opacity-30 rounded-full h-3">
                <div 
                  className="bg-white dark:bg-dark-elevated h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center bg-white dark:bg-dark-elevated bg-opacity-20 rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30">
                <div className="text-3xl font-bold mb-1 text-text-primary dark:text-text-dark-primary">{userStats.totalLevelsCompleted}</div>
                <div className="text-sm text-text-primary dark:text-text-dark-primary font-medium">Completed</div>
              </div>
              <div className="text-center bg-white dark:bg-dark-elevated bg-opacity-20 rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30">
                <div className="text-3xl font-bold mb-1 text-text-primary dark:text-text-dark-primary">{userStats.averageScore}%</div>
                <div className="text-sm text-text-primary dark:text-text-dark-primary font-medium">Avg Score</div>
              </div>
              <div className="text-center bg-white dark:bg-dark-elevated bg-opacity-20 rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30">
                <div className="text-3xl font-bold mb-1 text-text-primary dark:text-text-dark-primary">{levels.length - userStats.totalLevelsCompleted}</div>
                <div className="text-sm text-text-primary dark:text-text-dark-primary font-medium">Remaining</div>
              </div>
              <div className="text-center bg-white dark:bg-dark-elevated bg-opacity-20 rounded-card p-4 backdrop-blur-sm border border-white border-opacity-30">
                <div className="text-3xl font-bold mb-1 flex items-center justify-center text-text-primary dark:text-text-dark-primary">
                  <Flame className="w-6 h-6 mr-1 text-orange-300" />
                  {Math.floor(Math.random() * 7) + 3}
                </div>
                <div className="text-sm text-text-primary dark:text-text-dark-primary font-medium">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="bg-light dark:bg-dark min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">Available Levels</h2>
              <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-japanese-red rounded-full"></div>
                  <span className="font-medium">Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-light0 rounded-full"></div>
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

          {/* Achievements Section */}
          {currentUser && (
            <div className="max-w-7xl mx-auto px-6 pb-12">
              <div className="bg-white dark:bg-dark-elevated rounded-card shadow-lg p-8">
                <h3 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-yellow-600" />
                  Your Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-card border border-blue-300">
                    <div className="text-3xl font-bold text-blue-800 mb-2">
                      {userStats.totalLevelsCompleted}
                    </div>
                    <div className="text-blue-900 font-bold">Levels Mastered</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-card border border-green-300">
                    <div className="text-3xl font-bold text-green-800 mb-2">
                      {userStats.averageScore}%
                    </div>
                    <div className="text-green-900 font-bold">Average Performance</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-card border border-purple-300">
                    <div className="text-3xl font-bold text-purple-800 mb-2">
                      {levels.length - userStats.totalLevelsCompleted}
                    </div>
                    <div className="text-purple-900 font-bold">Levels Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </LearnLayout>

      {/* Lock Overlay */}
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