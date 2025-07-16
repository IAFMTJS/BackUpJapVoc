import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LearnLayout } from '../../components/learn/LearnLayout';
import { LockOverlay } from '../../components/learn/LockOverlay';
import { learnService } from '../../services/learnService';
import { levels, getLevelById } from '../../data/levels';
import { 
  BookOpen, 
  Lock, 
  CheckCircle, 
  Star, 
  Clock, 
  Target,
  Trophy,
  TrendingUp
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kana':
        return <BookOpen className="w-5 h-5" />;
      case 'vocab':
        return <Target className="w-5 h-5" />;
      case 'kanji':
        return <Star className="w-5 h-5" />;
      case 'grammar':
        return <TrendingUp className="w-5 h-5" />;
      case 'mixed':
        return <Trophy className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'kana':
        return 'bg-blue-100 text-blue-600';
      case 'vocab':
        return 'bg-green-100 text-green-600';
      case 'kanji':
        return 'bg-purple-100 text-purple-600';
      case 'grammar':
        return 'bg-orange-100 text-orange-600';
      case 'mixed':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
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

  return (
    <>
      <LearnLayout title="Learning Path" showBackButton={false}>
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Your Learning Journey</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.totalLevelsCompleted}</div>
                <div className="text-sm opacity-90">Levels Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.averageScore}%</div>
                <div className="text-sm opacity-90">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{levels.length}</div>
                <div className="text-sm opacity-90">Total Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round((userStats.totalLevelsCompleted / levels.length) * 100)}%</div>
                <div className="text-sm opacity-90">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Levels</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {levels.map((level) => {
                const status = getLevelStatus(level.id);
                const score = getLevelScore(level.id);
                const unlocked = isLevelUnlocked(level);
                
                return (
                  <div
                    key={level.id}
                    onClick={() => handleLevelClick(level)}
                    className={`relative bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                      status === 'completed' 
                        ? 'border-green-500 bg-green-50' 
                        : unlocked 
                        ? 'border-gray-200 hover:border-indigo-300' 
                        : 'border-gray-300 opacity-60'
                    }`}
                  >
                    {/* Level Number Badge */}
                    <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : unlocked 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {level.id}
                    </div>

                    {/* Status Icon */}
                    <div className="absolute top-3 right-3">
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : !unlocked ? (
                        <Lock className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Star className="w-6 h-6 text-indigo-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-8">
                      <div className="flex items-center space-x-2 mb-3">
                        {getCategoryIcon(level.category)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(level.category)}`}>
                          {level.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{level.description}</p>
                      
                      {/* Progress Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Difficulty:</span>
                          <div className="flex space-x-1">
                            {[...Array(level.difficulty)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Exercises:</span>
                          <span className="font-medium">{level.exercises.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Min Score:</span>
                          <span className="font-medium">{level.minScore}%</span>
                        </div>
                        
                        {status === 'completed' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Your Score:</span>
                            <span className="font-medium text-green-600">{score}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Section - Only show for authenticated users */}
          {currentUser && (
            <div className="mt-12 bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {userStats.totalLevelsCompleted}
                  </div>
                  <div className="text-gray-600">Levels Mastered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {userStats.averageScore}%
                  </div>
                  <div className="text-gray-600">Average Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {levels.length - userStats.totalLevelsCompleted}
                  </div>
                  <div className="text-gray-600">Levels Remaining</div>
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