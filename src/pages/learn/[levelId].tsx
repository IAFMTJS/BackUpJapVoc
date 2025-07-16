import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LearnLayout } from '../../components/learn/LearnLayout';
import { ExerciseRenderer } from '../../components/learn/ExerciseRenderer';
import { ScoreSummary } from '../../components/learn/ScoreSummary';
import { learnService } from '../../services/learnService';
import { getLevelById } from '../../data/levels';
import { 
  Play, 
  Target, 
  Clock, 
  Star, 
  BookOpen,
  AlertCircle
} from 'lucide-react';
import type { Level, LevelResult, ExerciseResult } from '../../types/learn';

const LevelPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [level, setLevel] = useState<Level | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [allResults, setAllResults] = useState<ExerciseResult[]>([]);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (!levelId) return;

    const loadLevel = () => {
      const levelData = getLevelById(parseInt(levelId));
      if (!levelData) {
        setError('Level not found');
        setLoading(false);
        return;
      }
      setLevel(levelData);
      setLoading(false);
    };

    loadLevel();
  }, [levelId]);

  const handleStartLevel = () => {
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const handleExerciseComplete = (results: ExerciseResult[]) => {
    setAllResults(prev => [...prev, ...results]);
    
    if (currentExerciseIndex < (level?.exercises.length || 0) - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // All exercises completed, calculate final result
      calculateLevelResult();
    }
  };

  const calculateLevelResult = () => {
    if (!level) return;

    const totalPoints = allResults.reduce((sum, result) => {
      const exercise = level.exercises[result.exerciseIndex];
      return sum + (result.correct ? exercise.pointsPerItem : 0);
    }, 0);

    const maxPoints = level.exercises.reduce((sum, exercise) => {
      return sum + (exercise.pointsPerItem * exercise.items.length);
    }, 0);

    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const passed = percentage >= level.minScore;
    const timeSpent = Date.now() - startTime;

    const result: LevelResult = {
      levelId: level.id,
      score: totalPoints,
      totalPoints,
      maxPoints,
      passed,
      completedAt: new Date().toISOString(),
      exerciseResults: allResults,
      timeSpent
    };

    setLevelResult(result);
    setIsCompleted(true);

    // Save result to Firebase or localStorage
    saveLevelResult(result);
  };

  const saveLevelResult = async (result: LevelResult) => {
    const userId = currentUser?.uid || null;

    try {
      await learnService.saveLevelResult(userId, result);
      
      // If passed, unlock next levels
      if (result.passed) {
        await learnService.unlockNextLevels(userId, result.levelId);
      }
    } catch (error) {
      console.error('Error saving level result:', error);
    }
  };

  const handleContinue = () => {
    if (levelResult?.passed) {
      // Navigate to next level or back to level selection
      const nextLevelId = level?.nextUnlocks[0];
      if (nextLevelId) {
        navigate(`/learn/${nextLevelId}`);
      } else {
        navigate('/learn');
      }
    } else {
      navigate('/learn');
    }
  };

  const handleRetry = () => {
    setCurrentExerciseIndex(0);
    setAllResults([]);
    setLevelResult(null);
    setIsCompleted(false);
    setIsStarted(false);
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
        return <Target className="w-5 h-5" />;
      case 'mixed':
        return <Star className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'kana':
        return 'bg-blue-600 text-white';
      case 'vocab':
        return 'bg-green-600 text-white';
      case 'kanji':
        return 'bg-purple-600 text-white';
      case 'grammar':
        return 'bg-orange-600 text-white';
      case 'mixed':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <LearnLayout title="Loading..." showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">🔄 Level wordt geladen...</p>
          </div>
        </div>
      </LearnLayout>
    );
  }

  if (error || !level) {
    return (
      <LearnLayout title="Error" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">😔 Level Niet Gevonden</h2>
            <p className="text-gray-600 mb-4">{error || 'Het opgevraagde level kon niet worden gevonden.'}</p>
            <button
              onClick={() => navigate('/learn')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            >
              🔙 Terug naar Levels
            </button>
          </div>
        </div>
      </LearnLayout>
    );
  }

  if (isCompleted && levelResult) {
    return (
      <LearnLayout title={`Level ${level.id} - Results`} showBackButton={false}>
        <ScoreSummary
          levelResult={levelResult}
          onContinue={handleContinue}
          onRetry={handleRetry}
        />
      </LearnLayout>
    );
  }

  if (isStarted) {
    const currentExercise = level.exercises[currentExerciseIndex];
    
    return (
      <LearnLayout title={`Level ${level.id} - Exercise ${currentExerciseIndex + 1}`} showBackButton={false}>
        <div className="p-6">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(level.category)}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{level.title}</h2>
                  <p className="text-sm text-gray-600">Exercise {currentExerciseIndex + 1} of {level.exercises.length}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{Math.round(((currentExerciseIndex) / level.exercises.length) * 100)}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentExerciseIndex) / level.exercises.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Exercise */}
          <ExerciseRenderer
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            exerciseIndex={currentExerciseIndex}
          />
        </div>
      </LearnLayout>
    );
  }

  return (
    <LearnLayout title={`Level ${level.id} - ${level.title}`} showBackButton={true}>
      <div className="p-6">
        {/* Level Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {getCategoryIcon(level.category)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(level.category)}`}>
              {level.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{level.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{level.description}</p>
        </div>

        {/* Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{level.exercises.length}</div>
                <div className="text-sm text-gray-500">Exercises</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{level.estimatedTime}</div>
                <div className="text-sm text-gray-500">Estimated Time</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{level.minScore}%</div>
                <div className="text-sm text-gray-500">Min Score to Pass</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Preview */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll learn:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {level.exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{exercise.type}</span>
                </div>
                <p className="text-sm text-gray-600">{exercise.instructions}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartLevel}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg flex items-center space-x-2 mx-auto"
          >
            <Play className="w-6 h-6" />
            <span>Start Level</span>
          </button>
        </div>
      </div>
    </LearnLayout>
  );
};

export default LevelPage; 