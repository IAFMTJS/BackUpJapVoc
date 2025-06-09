import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress as useProgressContext } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { Box, Typography, Stack, Chip, Button, LinearProgress, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { format, addDays, subDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSync } from '../hooks/useSync';
import { useOffline } from '../hooks/useOffline';
import { useNotifications } from '../hooks/useNotifications';
import { useAchievements } from '../hooks/useAchievements';
import { useGoals } from '../hooks/useGoals';
import { useChallenges } from '../hooks/useChallenges';
import { useRewards } from '../hooks/useRewards';
import { useStatistics } from '../hooks/useStatistics';
import { useCalendar } from '../hooks/useCalendar';
import { useLearningPath } from '../hooks/useLearningPath';
import { useSkillTree } from '../hooks/useSkillTree';
import { useMilestones } from '../hooks/useMilestones';
import { usePredictions } from '../hooks/usePredictions';
import { useRecommendations } from '../hooks/useRecommendations';
import { useSharing } from '../hooks/useSharing';
import { useExport } from '../hooks/useExport';
import { useBackup } from '../hooks/useBackup';
import { useComparison } from '../hooks/useComparison';
import { useAnimations } from '../hooks/useAnimations';
import { useBadges } from '../hooks/useBadges';
import { useTrophies } from '../hooks/useTrophies';
import { useHeatmaps } from '../hooks/useHeatmaps';
import { useTimelines } from '../hooks/useTimelines';
import { useGraphs } from '../hooks/useGraphs';
import { useMaps } from '../hooks/useMaps';
import { useAvatars } from '../hooks/useAvatars';
import safeLocalStorage from '../utils/safeLocalStorage';

// Types for Achievement System
type AchievementCategory = 'learning' | 'mastery' | 'streak' | 'challenge' | 'social' | 'special';
type AchievementDifficulty = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
type AchievementStatus = 'locked' | 'unlocked' | 'in_progress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  status: AchievementStatus;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  icon: string;
  points: number;
  requirements: {
    type: string;
    value: number;
  }[];
  rewards: {
    type: string;
    value: number | string;
  }[];
}

// Types for Learning Calendar
interface CalendarDay {
  date: Date;
  studyTime: number;
  wordsLearned: number;
  wordsMastered: number;
  quizzesCompleted: number;
  streakDay: boolean;
  achievements: Achievement[];
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  notes?: string;
}

interface CalendarStreak {
  current: number;
  longest: number;
  startDate: Date;
  lastDate: Date;
  history: {
    start: Date;
    end: Date;
    length: number;
  }[];
}

// Types for Statistics
interface LearningStatistics {
  totalStudyTime: number;
  averageStudyTimePerDay: number;
  totalWordsLearned: number;
  totalWordsMastered: number;
  totalQuizzesCompleted: number;
  averageQuizScore: number;
  masteryRate: number;
  retentionRate: number;
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  categoryDistribution: {
    [key: string]: number;
  };
  difficultyDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  progressOverTime: {
    date: Date;
    wordsLearned: number;
    wordsMastered: number;
    studyTime: number;
  }[];
}

// Types for Learning Path
interface LearningNode {
  id: string;
  type: 'word' | 'kanji' | 'grammar' | 'skill';
  level: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  prerequisites: string[];
  dependencies: string[];
  content: any;
  progress: number;
  mastery: number;
}

interface LearningPath {
  nodes: LearningNode[];
  connections: {
    from: string;
    to: string;
    type: 'prerequisite' | 'dependency' | 'related';
  }[];
  currentPosition: string;
  completedNodes: string[];
  availableNodes: string[];
  lockedNodes: string[];
}

// Types for Skill Tree
interface SkillNode {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  maxLevel: number;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  status: 'locked' | 'available' | 'in_progress' | 'maxed';
  prerequisites: string[];
  effects: {
    type: string;
    value: number;
  }[];
  icon: string;
  color: string;
}

interface SkillTree {
  nodes: SkillNode[];
  connections: {
    from: string;
    to: string;
    type: 'prerequisite' | 'dependency';
  }[];
  totalExperience: number;
  availablePoints: number;
  maxLevel: number;
}

// Types for Milestones
interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'word_count' | 'study_time' | 'streak' | 'mastery' | 'achievement' | 'custom';
  target: number;
  progress: number;
  status: 'locked' | 'in_progress' | 'completed';
  completedAt?: Date;
  rewards: {
    type: string;
    value: number | string;
  }[];
  icon: string;
}

// Types for Learning Goals
interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed';
  category: 'words' | 'kanji' | 'grammar' | 'study_time' | 'quizzes' | 'custom';
  priority: 'low' | 'medium' | 'high';
  reminders: boolean;
  notifications: boolean;
}

// Types for Progress Predictions
interface Prediction {
  type: 'word_mastery' | 'study_time' | 'achievement' | 'goal_completion';
  target: number;
  current: number;
  predicted: number;
  confidence: number;
  date: Date;
  factors: {
    name: string;
    impact: number;
  }[];
}

// Types for Progress Notifications
interface Notification {
  id: string;
  type: 'achievement' | 'milestone' | 'goal' | 'streak' | 'challenge' | 'reward' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  action?: {
    type: string;
    data: any;
  };
}

// Types for Progress Sharing
interface ShareableProgress {
  achievements: Achievement[];
  statistics: LearningStatistics;
  milestones: Milestone[];
  goals: Goal[];
  streaks: CalendarStreak;
  skillTree: SkillTree;
  learningPath: LearningPath;
  predictions: Prediction[];
}

// Types for Progress Export
interface ExportFormat {
  type: 'json' | 'csv' | 'pdf' | 'excel';
  data: any;
  metadata: {
    version: string;
    exportDate: Date;
    user: string;
  };
}

// Types for Progress Backup
interface BackupData {
  id: string;
  timestamp: Date;
  data: {
    achievements: Achievement[];
    statistics: LearningStatistics;
    milestones: Milestone[];
    goals: Goal[];
    streaks: CalendarStreak;
    skillTree: SkillTree;
    learningPath: LearningPath;
    predictions: Prediction[];
    settings: any;
  };
  metadata: {
    version: string;
    user: string;
    device: string;
    size: number;
  };
}

// Types for Progress Comparison
interface ComparisonData {
  current: {
    statistics: LearningStatistics;
    achievements: Achievement[];
    milestones: Milestone[];
    goals: Goal[];
  };
  previous: {
    statistics: LearningStatistics;
    achievements: Achievement[];
    milestones: Milestone[];
    goals: Goal[];
  };
  changes: {
    statistics: {
      [key: string]: {
        current: number;
        previous: number;
        change: number;
        percentage: number;
      };
    };
    achievements: {
      unlocked: Achievement[];
      inProgress: Achievement[];
    };
    milestones: {
      completed: Milestone[];
      inProgress: Milestone[];
    };
    goals: {
      completed: Goal[];
      inProgress: Goal[];
      failed: Goal[];
    };
  };
}

// Types for Progress Recommendations
interface Recommendation {
  id: string;
  type: 'word' | 'kanji' | 'grammar' | 'practice' | 'review' | 'challenge';
  priority: 'low' | 'medium' | 'high';
  reason: string;
  content: any;
  confidence: number;
  basedOn: {
    type: string;
    data: any;
  }[];
}

// Types for Progress Challenges
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  requirements: {
    type: string;
    value: number;
  }[];
  rewards: {
    type: string;
    value: number | string;
  }[];
  participants: number;
  leaderboard: {
    userId: string;
    progress: number;
    rank: number;
  }[];
}

// Types for Progress Rewards
interface Reward {
  id: string;
  type: 'achievement' | 'milestone' | 'challenge' | 'streak' | 'special';
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number | string;
  unlockedAt: Date;
  icon: string;
  animation: string;
  status: 'available' | 'claimed';
  requirementsMet: boolean;
  requirements: string;
  points: number;
  badges: string[];
  unlocks: string[];
  claimedAt?: Date;
  progress: {
    current: number;
    target: number;
    nextReward?: {
      target: number;
      title: string;
    };
  };
}

// Types for Visual Elements
interface Badge {
  id: string;
  title: string;
  description: string;
  category: string;
  level: number;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface Trophy {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  unlockedAt?: Date;
  animation: string;
}

interface HeatmapData {
  date: Date;
  value: number;
  color: string;
}

interface TimelineEvent {
  id: string;
  type: 'achievement' | 'milestone' | 'goal' | 'challenge' | 'streak' | 'reward';
  title: string;
  description: string;
  date: Date;
  icon: string;
  color: string;
}

interface GraphData {
  type: 'line' | 'area' | 'bar' | 'pie';
  data: any[];
  options: {
    xAxis: string;
    yAxis: string;
    colors: string[];
    animation: boolean;
  };
}

interface MapData {
  type: 'skill' | 'learning' | 'achievement';
  nodes: {
    id: string;
    position: { x: number; y: number };
    data: any;
  }[];
  connections: {
    from: string;
    to: string;
    type: string;
  }[];
}

interface Avatar {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  customization: {
    body: string;
    hair: string;
    eyes: string;
    mouth: string;
    clothes: string;
    accessories: string[];
  };
  achievements: Achievement[];
  badges: Badge[];
  trophies: Trophy[];
}

// Main Progress State Interface
interface ProgressState {
  achievements: Achievement[];
  calendar: {
    days: CalendarDay[];
    streak: CalendarStreak;
  };
  statistics: LearningStatistics;
  learningPath: LearningPath;
  skillTree: SkillTree;
  milestones: Milestone[];
  goals: Goal[];
  predictions: Prediction[];
  notifications: Notification[];
  shareableProgress: ShareableProgress;
  exports: ExportFormat[];
  backups: BackupData[];
  comparisons: ComparisonData[];
  recommendations: Recommendation[];
  challenges: Challenge[];
  rewards: Reward[];
  badges: Badge[];
  trophies: Trophy[];
  heatmaps: HeatmapData[];
  timelines: TimelineEvent[];
  graphs: GraphData[];
  maps: MapData[];
  avatar: Avatar;
  settings: {
    notifications: boolean;
    sharing: boolean;
    export: boolean;
    backup: boolean;
    comparison: boolean;
    recommendations: boolean;
    challenges: boolean;
    rewards: boolean;
    animations: boolean;
    badges: boolean;
    trophies: boolean;
    heatmaps: boolean;
    timelines: boolean;
    graphs: boolean;
    maps: boolean;
    avatar: boolean;
  };
  rewardProgress: {
    [category: string]: {
      current: number;
      target: number;
      nextReward?: {
        target: number;
        title: string;
      };
    };
  };
}

type Tab = 'overview' | 'achievements' | 'statistics' | 'calendar' | 'learning-path' | 'skill-tree' | 'goals' | 'challenges' | 'rewards';

interface ProgressProps {
  detailed?: boolean;
}

const Progress: React.FC = () => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress: contextProgress } = useProgressContext();
  const { currentLevel, unlockedLevels } = useWordLevel();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContextReady, setIsContextReady] = useState(false);

  // Check if all required contexts are ready
  useEffect(() => {
    const checkContexts = () => {
      try {
        // Verify that all required context values are available
        if (contextProgress !== undefined && currentLevel !== undefined && unlockedLevels !== undefined) {
          setIsContextReady(true);
        }
      } catch (err) {
        console.error('Error checking contexts:', err);
        setError('Failed to initialize required data. Please try refreshing the page.');
      }
    };

    checkContexts();
  }, [contextProgress, currentLevel, unlockedLevels]);

  // Show loading state while contexts are initializing
  if (!isContextReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading progress data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Custom hooks for different features
  const { isOnline } = useOffline();
  const { sync, isSyncing } = useSync();
  const { notifications, addNotification, markAsRead } = useNotifications();
  const { achievements, unlockAchievement, updateProgress } = useAchievements();
  const { goals, createGoal, updateGoal, completeGoal } = useGoals();
  const { challenges, joinChallenge, updateProgress: updateChallengeProgress } = useChallenges();
  const { rewards, unlockReward, handleClaimReward } = useRewards();
  const { statistics, updateStatistics } = useStatistics();
  const { calendar, updateCalendar, updateStreak } = useCalendar();
  const { learningPath, updateLearningPath } = useLearningPath();
  const { skillTree, updateSkillTree } = useSkillTree();
  const { milestones, updateMilestone } = useMilestones();
  const { predictions, generatePredictions } = usePredictions();
  const { recommendations, generateRecommendations } = useRecommendations();
  const { shareProgress } = useSharing();
  const { exportProgress } = useExport();
  const { backupProgress, restoreBackup } = useBackup();
  const { compareProgress } = useComparison();
  const { badges, unlockBadge } = useBadges();
  const { trophies, unlockTrophy } = useTrophies();
  const { heatmaps, updateHeatmap } = useHeatmaps();
  const { timelines, addTimelineEvent } = useTimelines();
  const { graphs, updateGraph } = useGraphs();
  const { maps, updateMap } = useMaps();
  const { avatar, updateAvatar } = useAvatars();

  // State for progress tracking
  const [progressState, setProgressState] = useState<ProgressState>({
    achievements: [],
    calendar: {
      days: [],
      streak: {
        current: 0,
        longest: 0,
        startDate: new Date(),
        lastDate: new Date(),
        history: []
      }
    },
    statistics: {
      totalStudyTime: 0,
      averageStudyTimePerDay: 0,
      totalWordsLearned: 0,
      totalWordsMastered: 0,
      totalQuizzesCompleted: 0,
      averageQuizScore: 0,
      masteryRate: 0,
      retentionRate: 0,
      timeDistribution: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      categoryDistribution: {},
      difficultyDistribution: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      },
      progressOverTime: []
    },
    learningPath: {
      nodes: [],
      connections: [],
      currentPosition: '',
      completedNodes: [],
      availableNodes: [],
      lockedNodes: []
    },
    skillTree: {
      nodes: [],
      connections: [],
      totalExperience: 0,
      availablePoints: 0,
      maxLevel: 0
    },
    milestones: [],
    goals: [],
    predictions: [],
    notifications: [],
    shareableProgress: {
      achievements: [],
      statistics: {
        totalStudyTime: 0,
        averageStudyTimePerDay: 0,
        totalWordsLearned: 0,
        totalWordsMastered: 0,
        totalQuizzesCompleted: 0,
        averageQuizScore: 0,
        masteryRate: 0,
        retentionRate: 0,
        timeDistribution: {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0
        },
        categoryDistribution: {},
        difficultyDistribution: {
          beginner: 0,
          intermediate: 0,
          advanced: 0
        },
        progressOverTime: []
      },
      milestones: [],
      goals: [],
      streaks: {
        current: 0,
        longest: 0,
        startDate: new Date(),
        lastDate: new Date(),
        history: []
      },
      skillTree: {
        nodes: [],
        connections: [],
        totalExperience: 0,
        availablePoints: 0,
        maxLevel: 0
      },
      learningPath: {
        nodes: [],
        connections: [],
        currentPosition: '',
        completedNodes: [],
        availableNodes: [],
        lockedNodes: []
      },
      predictions: []
    },
    exports: [],
    backups: [],
    comparisons: [],
    recommendations: [],
    challenges: [],
    rewards: [],
    badges: [],
    trophies: [],
    heatmaps: [],
    timelines: [],
    graphs: [],
    maps: [],
    avatar: {
      id: 'default',
      name: 'Learner',
      level: 1,
      experience: 0,
      experienceToNext: 100,
      customization: {
        body: 'default',
        hair: 'default',
        eyes: 'default',
        mouth: 'default',
        clothes: 'default',
        accessories: []
      },
      achievements: [],
      badges: [],
      trophies: []
    },
    settings: {
      notifications: true,
      sharing: true,
      export: true,
      backup: true,
      comparison: true,
      recommendations: true,
      challenges: true,
      rewards: true,
      animations: true,
      badges: true,
      trophies: true,
      heatmaps: true,
      timelines: true,
      graphs: true,
      maps: true,
      avatar: true
    },
    rewardProgress: {}
  });

  // Load progress data on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        
        // Load data from local storage
        const savedProgress = safeLocalStorage.getItem('progress_state');
        if (savedProgress) {
          setProgressState(JSON.parse(savedProgress));
        }

        // Load data from context
        if (contextProgress) {
          // Update statistics
          const updatedStatistics = {
            ...progressState.statistics,
            totalWordsLearned: Object.keys(contextProgress).length,
            totalWordsMastered: Object.values(contextProgress).filter(p => p.correct >= 3).length,
            masteryRate: Object.values(contextProgress).filter(p => p.correct >= 3).length / Object.keys(contextProgress).length
          };
          setProgressState(prev => ({
            ...prev,
            statistics: updatedStatistics
          }));

          // Update learning path
          const updatedLearningPath = {
            ...progressState.learningPath,
            completedNodes: Object.entries(contextProgress)
              .filter(([_, p]) => p.correct >= 3)
              .map(([id]) => id)
          };
          setProgressState(prev => ({
            ...prev,
            learningPath: updatedLearningPath
          }));

          // Update skill tree
          const totalExperience = Object.values(contextProgress)
            .reduce((sum, p) => sum + (p.correct * 10), 0);
          setProgressState(prev => ({
            ...prev,
            skillTree: {
              ...prev.skillTree,
              totalExperience
            }
          }));
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading progress:', err);
        setError('Failed to load progress data. Please try again later.');
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [contextProgress]);

  // Save progress data when it changes
  useEffect(() => {
    if (!isLoading) {
      safeLocalStorage.setItem('progress_state', JSON.stringify(progressState));
    }
  }, [progressState, isLoading]);

  // Update shareable progress when relevant data changes
  useEffect(() => {
    setProgressState(prev => ({
      ...prev,
      shareableProgress: {
        achievements: prev.achievements,
        statistics: prev.statistics,
        milestones: prev.milestones,
        goals: prev.goals,
        streaks: prev.calendar.streak,
        skillTree: prev.skillTree,
        learningPath: prev.learningPath,
        predictions: prev.predictions
      }
    }));
  }, [
    progressState.achievements,
    progressState.statistics,
    progressState.milestones,
    progressState.goals,
    progressState.calendar.streak,
    progressState.skillTree,
    progressState.learningPath,
    progressState.predictions
  ]);

  // Handle achievement unlocking
  const handleAchievementUnlock = useCallback(async (achievement: Achievement) => {
    try {
      await unlockAchievement(achievement);
      addNotification({
        id: uuidv4(),
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `You've unlocked the "${achievement.title}" achievement!`,
        priority: 'high',
        read: false,
        createdAt: new Date()
      });
      addTimelineEvent({
        id: uuidv4(),
        type: 'achievement',
        title: achievement.title,
        description: achievement.description,
        date: new Date(),
        icon: achievement.icon,
        color: getAchievementColor(achievement.difficulty)
      });
    } catch (err) {
      console.error('Error unlocking achievement:', err);
      setError('Failed to unlock achievement. Please try again.');
    }
  }, [unlockAchievement, addNotification, addTimelineEvent]);

  // Handle goal completion
  const handleGoalComplete = useCallback(async (goal: Goal) => {
    try {
      await completeGoal(goal);
      addNotification({
        id: uuidv4(),
        type: 'goal',
        title: 'Goal Completed!',
        message: `You've completed the "${goal.title}" goal!`,
        priority: 'medium',
        read: false,
        createdAt: new Date()
      });
      addTimelineEvent({
        id: uuidv4(),
        type: 'goal',
        title: goal.title,
        description: goal.description,
        date: new Date(),
        icon: '🎯',
        color: '#4CAF50'
      });
    } catch (err) {
      console.error('Error completing goal:', err);
      setError('Failed to complete goal. Please try again.');
    }
  }, [completeGoal, addNotification, addTimelineEvent]);

  // Handle challenge progress
  const handleChallengeProgress = useCallback(async (challenge: Challenge, progress: number) => {
    try {
      await updateChallengeProgress(challenge, progress);
      if (progress >= 100) {
        addNotification({
          id: uuidv4(),
          type: 'challenge',
          title: 'Challenge Completed!',
          message: `You've completed the "${challenge.title}" challenge!`,
          priority: 'high',
          read: false,
          createdAt: new Date()
        });
        addTimelineEvent({
          id: uuidv4(),
          type: 'challenge',
          title: challenge.title,
          description: challenge.description,
          date: new Date(),
          icon: '🏆',
          color: '#FFC107'
        });
      }
    } catch (err) {
      console.error('Error updating challenge progress:', err);
      setError('Failed to update challenge progress. Please try again.');
    }
  }, [updateChallengeProgress, addNotification, addTimelineEvent]);

  // Handle reward unlocking
  const handleRewardUnlock = useCallback(async (reward: Reward) => {
    try {
      await unlockReward(reward);
      addNotification({
        id: uuidv4(),
        type: 'reward',
        title: 'Reward Unlocked!',
        message: `You've unlocked the "${reward.title}" reward!`,
        priority: 'high',
        read: false,
        createdAt: new Date()
      });
      addTimelineEvent({
        id: uuidv4(),
        type: 'reward',
        title: reward.title,
        description: reward.description,
        date: new Date(),
        icon: reward.icon,
        color: getRewardColor(reward.rarity)
      });
    } catch (err) {
      console.error('Error unlocking reward:', err);
      setError('Failed to unlock reward. Please try again.');
    }
  }, [unlockReward, addNotification, addTimelineEvent]);

  // Handle progress sharing
  const handleShareProgress = useCallback(async () => {
    try {
      const shareableData = await shareProgress(progressState.shareableProgress);
      addNotification({
        id: uuidv4(),
        type: 'sharing',
        title: 'Progress Shared!',
        message: 'Your progress has been shared successfully.',
        priority: 'low',
        read: false,
        createdAt: new Date()
      });
      return shareableData;
    } catch (err) {
      console.error('Error sharing progress:', err);
      setError('Failed to share progress. Please try again.');
      return null;
    }
  }, [shareProgress, progressState.shareableProgress, addNotification]);

  // Handle progress export
  const handleExportProgress = useCallback(async (format: ExportFormat['type']) => {
    try {
      const exportData = await exportProgress(progressState, format);
      addNotification({
        id: uuidv4(),
        type: 'export',
        title: 'Progress Exported!',
        message: `Your progress has been exported as ${format.toUpperCase()}.`,
        priority: 'low',
        read: false,
        createdAt: new Date()
      });
      return exportData;
    } catch (err) {
      console.error('Error exporting progress:', err);
      setError('Failed to export progress. Please try again.');
      return null;
    }
  }, [exportProgress, progressState, addNotification]);

  // Handle progress backup
  const handleBackupProgress = useCallback(async () => {
    try {
      const backupData = await backupProgress(progressState);
      addNotification({
        id: uuidv4(),
        type: 'backup',
        title: 'Progress Backed Up!',
        message: 'Your progress has been backed up successfully.',
        priority: 'low',
        read: false,
        createdAt: new Date()
      });
      return backupData;
    } catch (err) {
      console.error('Error backing up progress:', err);
      setError('Failed to backup progress. Please try again.');
      return null;
    }
  }, [backupProgress, progressState, addNotification]);

  // Handle progress comparison
  const handleCompareProgress = useCallback(async (timeframe: 'week' | 'month' | 'year') => {
    try {
      const comparisonData = await compareProgress(progressState, timeframe);
      addNotification({
        id: uuidv4(),
        type: 'comparison',
        title: 'Progress Compared!',
        message: `Your progress has been compared for the last ${timeframe}.`,
        priority: 'low',
        read: false,
        createdAt: new Date()
      });
      return comparisonData;
    } catch (err) {
      console.error('Error comparing progress:', err);
      setError('Failed to compare progress. Please try again.');
      return null;
    }
  }, [compareProgress, progressState, addNotification]);

  // Utility functions for colors and styling
  const getAchievementColor = (difficulty: AchievementDifficulty): string => {
    switch (difficulty) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#000000';
    }
  };

  const getRewardColor = (rarity: Reward['rarity']): string => {
    switch (rarity) {
      case 'common': return '#9E9E9E';
      case 'uncommon': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFD700';
      default: return '#000000';
    }
  };

  return (
    <div className={`${themeClasses.container} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['overview', 'achievements', 'statistics', 'calendar', 'learning-path', 'skill-tree', 'goals', 'challenges', 'rewards'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Overview Card */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overview</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Current Streak</h3>
                      <p className="text-2xl font-bold text-blue-500">{progressState.calendar.streak.current} days</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Total Study Time</h3>
                      <p className="text-2xl font-bold text-green-500">{Math.round(progressState.statistics.totalStudyTime / 60)} hours</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Words Mastered</h3>
                      <p className="text-2xl font-bold text-purple-500">{progressState.statistics.totalWordsMastered}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Mastery Rate</h3>
                      <p className="text-2xl font-bold text-yellow-500">{Math.round(progressState.statistics.masteryRate * 100)}%</p>
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Achievements</h2>
                  <div className="space-y-2">
                    {progressState.achievements.slice(0, 3).map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-2 rounded ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`text-2xl mr-2 ${getAchievementColor(achievement.difficulty)}`}>
                            {achievement.icon}
                          </span>
                          <div>
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{achievement.title}</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Goals */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Active Goals</h2>
                  <div className="space-y-2">
                    {progressState.goals
                      .filter(goal => !goal.completed)
                      .slice(0, 3)
                      .map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-2 rounded ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{goal.title}</h3>
                              <p className="text-sm text-gray-500">{goal.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {goal.currentValue} / {goal.targetValue}
                              </p>
                              <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: `${(goal.currentValue / goal.targetValue) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Current Challenges */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Current Challenges</h2>
                  <div className="space-y-2">
                    {progressState.challenges
                      .filter(challenge => !challenge.completed)
                      .slice(0, 3)
                      .map((challenge) => (
                        <div
                          key={challenge.id}
                          className={`p-2 rounded ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{challenge.title}</h3>
                              <p className="text-sm text-gray-500">{challenge.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {challenge.currentProgress} / {challenge.targetProgress}
                              </p>
                              <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${(challenge.currentProgress / challenge.targetProgress) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Learning Path Progress */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Learning Path</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Current Position</h3>
                      <p className="text-xl font-bold text-indigo-500">
                        {progressState.learningPath.currentPosition || 'Not started'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Completed Nodes</h3>
                      <p className="text-xl font-bold text-green-500">
                        {progressState.learningPath.completedNodes.length}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Available Nodes</h3>
                      <p className="text-xl font-bold text-blue-500">
                        {progressState.learningPath.availableNodes.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skill Tree Progress */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Skill Tree</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Total Experience</h3>
                      <p className="text-xl font-bold text-yellow-500">
                        {progressState.skillTree.totalExperience} XP
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Available Points</h3>
                      <p className="text-xl font-bold text-purple-500">
                        {progressState.skillTree.availablePoints}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Max Level</h3>
                      <p className="text-xl font-bold text-red-500">
                        {progressState.skillTree.maxLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressState.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg shadow ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } transition-transform hover:scale-105`}
                  >
                    <div className="flex items-center mb-4">
                      <span className={`text-4xl mr-4 ${getAchievementColor(achievement.difficulty)}`}>
                        {achievement.icon}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold">{achievement.title}</h3>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Difficulty:</span>
                        <span className="font-medium">{achievement.difficulty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">
                          {achievement.currentValue} / {achievement.targetValue}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(achievement.currentValue / achievement.targetValue) * 100}%`
                          }}
                        />
                      </div>
                      {achievement.completed && (
                        <div className="mt-2 text-center">
                          <span className="inline-block px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded">
                            Completed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="space-y-6">
                {/* Study Time Distribution */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Study Time Distribution</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(progressState.statistics.timeDistribution).map(([time, value]) => (
                      <div key={time} className="text-center">
                        <h3 className="text-lg font-semibold capitalize">{time}</h3>
                        <p className="text-2xl font-bold text-blue-500">{Math.round(value / 60)} hours</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Category Distribution</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(progressState.statistics.categoryDistribution).map(([category, count]) => (
                      <div key={category} className="text-center">
                        <h3 className="text-lg font-semibold capitalize">{category}</h3>
                        <p className="text-2xl font-bold text-green-500">{count} words</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Distribution */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Difficulty Distribution</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(progressState.statistics.difficultyDistribution).map(([difficulty, count]) => (
                      <div key={difficulty} className="text-center">
                        <h3 className="text-lg font-semibold capitalize">{difficulty}</h3>
                        <p className="text-2xl font-bold text-purple-500">{count} words</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Over Time */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Progress Over Time</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressState.statistics.progressOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => format(new Date(date), 'MMM d')}
                        />
                        <YAxis />
                        <RechartsTooltip
                          labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                          formatter={(value, name) => [
                            name === 'wordsLearned' ? `${value} words learned` :
                            name === 'wordsMastered' ? `${value} words mastered` :
                            `${Math.round(value / 60)} hours studied`,
                            name === 'wordsLearned' ? 'Words Learned' :
                            name === 'wordsMastered' ? 'Words Mastered' :
                            'Study Time'
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="wordsLearned"
                          stroke="#4CAF50"
                          name="Words Learned"
                        />
                        <Line
                          type="monotone"
                          dataKey="wordsMastered"
                          stroke="#2196F3"
                          name="Words Mastered"
                        />
                        <Line
                          type="monotone"
                          dataKey="studyTime"
                          stroke="#9C27B0"
                          name="Study Time"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning-path' && (
              <div className="space-y-6">
                {/* Learning Path Visualization */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Learning Path</h2>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <svg>
                        {/* Draw connections */}
                        {progressState.learningPath.connections.map((connection, index) => {
                          const fromNode = progressState.learningPath.nodes.find(n => n.id === connection.from);
                          const toNode = progressState.learningPath.nodes.find(n => n.id === connection.to);
                          if (!fromNode || !toNode) return null;

                          const fromX = (index % 3) * 200 + 100;
                          const fromY = Math.floor(index / 3) * 150 + 100;
                          const toX = ((index + 1) % 3) * 200 + 100;
                          const toY = Math.floor((index + 1) / 3) * 150 + 100;

                          return (
                            <g key={`connection-${connection.from}-${connection.to}`}>
                              <line
                                x1={fromX}
                                y1={fromY}
                                x2={toX}
                                y2={toY}
                                stroke={connection.type === 'prerequisite' ? '#4CAF50' : '#2196F3'}
                                strokeWidth={2}
                                strokeDasharray={connection.type === 'related' ? '5,5' : 'none'}
                              />
                              <circle
                                cx={fromX}
                                cy={fromY}
                                r={20}
                                fill={fromNode.status === 'completed' ? '#4CAF50' :
                                      fromNode.status === 'in_progress' ? '#FFC107' :
                                      fromNode.status === 'available' ? '#2196F3' : '#9E9E9E'}
                                stroke="#000"
                                strokeWidth={1}
                              />
                              <text
                                x={fromX}
                                y={fromY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize="12"
                              >
                                {fromNode.type.charAt(0).toUpperCase()}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Current Node Details */}
                {progressState.learningPath.currentPosition && (
                  <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className="text-xl font-bold mb-4">Current Node</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Position</h3>
                        <p className="text-xl font-bold text-indigo-500">
                          {progressState.learningPath.currentPosition}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Next Available Nodes</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                          {progressState.learningPath.availableNodes.map((nodeId) => {
                            const node = progressState.learningPath.nodes.find(n => n.id === nodeId);
                            if (!node) return null;

                            return (
                              <div
                                key={node.id}
                                className={`p-3 rounded ${
                                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center mb-2">
                                  <span className={`text-lg mr-2 ${
                                    node.type === 'word' ? 'text-blue-500' :
                                    node.type === 'kanji' ? 'text-green-500' :
                                    node.type === 'grammar' ? 'text-purple-500' :
                                    'text-yellow-500'
                                  }`}>
                                    {node.type.charAt(0).toUpperCase()}
                                  </span>
                                  <h4 className="font-semibold">{node.content.title || node.id}</h4>
                                </div>
                                <p className="text-sm text-gray-500">{node.content.description}</p>
                                <div className="mt-2">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress:</span>
                                    <span>{Math.round(node.progress * 100)}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${node.progress * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Mastery:</span>
                                    <span>{Math.round(node.mastery * 100)}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div
                                      className="h-full bg-green-500 rounded-full"
                                      style={{ width: `${node.mastery * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skill-tree' && (
              <div className="space-y-6">
                {/* Skill Tree Visualization */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Skill Tree</h2>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <svg>
                        {/* Draw skill tree connections */}
                        {progressState.skillTree.nodes.map((node, index) => {
                          const level = node.level;
                          const x = (index % 4) * 200 + 100;
                          const y = level * 150 + 100;

                          return (
                            <g key={node.id}>
                              {/* Draw connections to prerequisites */}
                              {node.prerequisites.map((prereqId) => {
                                const prereqNode = progressState.skillTree.nodes.find(n => n.id === prereqId);
                                if (!prereqNode) return null;

                                const prereqIndex = progressState.skillTree.nodes.findIndex(n => n.id === prereqId);
                                const prereqX = (prereqIndex % 4) * 200 + 100;
                                const prereqY = prereqNode.level * 150 + 100;

                                return (
                                  <line
                                    key={`connection-${prereqId}-${node.id}`}
                                    x1={prereqX}
                                    y1={prereqY}
                                    x2={x}
                                    y2={y}
                                    stroke={prereqNode.status === 'unlocked' ? '#4CAF50' : '#9E9E9E'}
                                    strokeWidth={2}
                                    strokeDasharray={prereqNode.status === 'unlocked' ? 'none' : '5,5'}
                                  />
                                );
                              })}

                              {/* Draw skill node */}
                              <circle
                                cx={x}
                                cy={y}
                                r={25}
                                fill={node.status === 'unlocked' ? '#4CAF50' :
                                      node.status === 'available' ? '#2196F3' :
                                      node.status === 'locked' ? '#9E9E9E' : '#FFC107'}
                                stroke="#000"
                                strokeWidth={1}
                              />
                              <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize="14"
                                fontWeight="bold"
                              >
                                {node.type.charAt(0).toUpperCase()}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Available Skills */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Available Skills</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Skill Points:</span>
                      <span className="text-lg font-bold text-indigo-500">
                        {progressState.skillTree.availablePoints}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressState.skillTree.nodes
                      .filter(node => node.status === 'available')
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className={`text-lg mr-2 ${
                                node.type === 'reading' ? 'text-blue-500' :
                                node.type === 'writing' ? 'text-green-500' :
                                node.type === 'listening' ? 'text-purple-500' :
                                node.type === 'speaking' ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                                {node.type.charAt(0).toUpperCase()}
                              </span>
                              <h3 className="font-semibold">{node.name}</h3>
                            </div>
                            <span className="text-sm text-gray-500">
                              Level {node.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{node.description}</p>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Cost:</span>
                                <span className="font-semibold">{node.cost} points</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Prerequisites:</span>
                                <span className="text-gray-500">
                                  {node.prerequisites.length > 0
                                    ? node.prerequisites.join(', ')
                                    : 'None'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnlockSkill(node.id)}
                              disabled={progressState.skillTree.availablePoints < node.cost}
                              className={`w-full py-2 px-4 rounded ${
                                progressState.skillTree.availablePoints >= node.cost
                                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Unlock Skill
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Unlocked Skills */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Unlocked Skills</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressState.skillTree.nodes
                      .filter(node => node.status === 'unlocked')
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className={`text-lg mr-2 ${
                                node.type === 'reading' ? 'text-blue-500' :
                                node.type === 'writing' ? 'text-green-500' :
                                node.type === 'listening' ? 'text-purple-500' :
                                node.type === 'speaking' ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                                {node.type.charAt(0).toUpperCase()}
                              </span>
                              <h3 className="font-semibold">{node.name}</h3>
                            </div>
                            <span className="text-sm text-gray-500">
                              Level {node.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{node.description}</p>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Mastery:</span>
                                <span>{Math.round(node.mastery * 100)}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${node.mastery * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Benefits:</span>
                                <span className="text-green-500">+{node.benefits}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6">
                {/* Create New Goal */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newGoal: Goal = {
                      id: Date.now().toString(),
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      type: formData.get('type') as Goal['type'],
                      target: Number(formData.get('target')),
                      deadline: formData.get('deadline') as string,
                      progress: 0,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      completedAt: null,
                      rewards: {
                        points: Number(formData.get('points')),
                        badges: formData.get('badges') ? (formData.get('badges') as string).split(',') : [],
                        unlocks: formData.get('unlocks') ? (formData.get('unlocks') as string).split(',') : []
                      }
                    };
                    handleCreateGoal(newGoal);
                    e.currentTarget.reset();
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          name="title"
                          required
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          name="type"
                          required
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="words_learned">Words Learned</option>
                          <option value="words_mastered">Words Mastered</option>
                          <option value="study_time">Study Time</option>
                          <option value="streak">Streak</option>
                          <option value="challenges_completed">Challenges Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Target</label>
                        <input
                          type="number"
                          name="target"
                          required
                          min="1"
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          required
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          name="description"
                          required
                          rows={3}
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Rewards</label>
                        <div className="space-y-2">
                          <input
                            type="number"
                            name="points"
                            placeholder="Points"
                            min="0"
                            className={`w-full p-2 rounded border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                          <input
                            type="text"
                            name="badges"
                            placeholder="Badges (comma-separated)"
                            className={`w-full p-2 rounded border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                          <input
                            type="text"
                            name="unlocks"
                            placeholder="Unlocks (comma-separated)"
                            className={`w-full p-2 rounded border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      Create Goal
                    </button>
                  </form>
                </div>

                {/* Active Goals */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Active Goals</h2>
                  <div className="space-y-4">
                    {progressState.goals
                      .filter(goal => goal.status === 'active')
                      .map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <span className={`text-sm px-2 py-1 rounded ${
                              goal.type === 'words_learned' ? 'bg-blue-100 text-blue-800' :
                              goal.type === 'words_mastered' ? 'bg-green-100 text-green-800' :
                              goal.type === 'study_time' ? 'bg-purple-100 text-purple-800' :
                              goal.type === 'streak' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {goal.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{goal.description}</p>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress:</span>
                                <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Target: {goal.target}</span>
                              <span>Current: {goal.progress}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                              <span>Rewards: {goal.rewards.points} points</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Completed Goals */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Completed Goals</h2>
                  <div className="space-y-4">
                    {progressState.goals
                      .filter(goal => goal.status === 'completed')
                      .map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm px-2 py-1 rounded ${
                                goal.type === 'words_learned' ? 'bg-blue-100 text-blue-800' :
                                goal.type === 'words_mastered' ? 'bg-green-100 text-green-800' :
                                goal.type === 'study_time' ? 'bg-purple-100 text-purple-800' :
                                goal.type === 'streak' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {goal.type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-sm text-green-500">
                                Completed {new Date(goal.completedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{goal.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Target: {goal.target}</span>
                              <span>Achieved: {goal.progress}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Rewards Earned:</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-green-500">+{goal.rewards.points} points</span>
                                {goal.rewards.badges.length > 0 && (
                                  <span className="text-yellow-500">
                                    {goal.rewards.badges.length} badges
                                  </span>
                                )}
                                {goal.rewards.unlocks.length > 0 && (
                                  <span className="text-blue-500">
                                    {goal.rewards.unlocks.length} unlocks
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="space-y-6">
                {/* Create New Challenge */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Create New Challenge</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newChallenge: Challenge = {
                      id: Date.now().toString(),
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      type: formData.get('type') as Challenge['type'],
                      difficulty: formData.get('difficulty') as Challenge['difficulty'],
                      words: (formData.get('words') as string).split(',').map(w => w.trim()),
                      timeLimit: formData.get('timeLimit') ? Number(formData.get('timeLimit')) : null,
                      progress: 0,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      completedAt: null,
                      rewards: {
                        points: Number(formData.get('points')),
                        badges: formData.get('badges') ? (formData.get('badges') as string).split(',') : [],
                        unlocks: formData.get('unlocks') ? (formData.get('unlocks') as string).split(',') : []
                      }
                    };
                    handleCreateChallenge(newChallenge);
                    e.currentTarget.reset();
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          name="title"
                          required
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          name="type"
                          required
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="quiz">Quiz</option>
                          <option value="typing">Typing</option>
                          <option value="matching">Matching</option>
                          <option value="listening">Listening</option>
                          <option value="writing">Writing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                          name="difficulty"
                          required
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                        <input
                          type="number"
                          name="timeLimit"
                          min="0"
                          placeholder="Optional"
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Words (comma-separated)</label>
                        <input
                          type="text"
                          name="words"
                          required
                          placeholder="word1, word2, word3"
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          name="description"
                          required
                          rows={3}
                          className={`w-full p-2 rounded border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Rewards</label>
                        <div className="space-y-2">
                          <input
                            type="number"
                            name="points"
                            placeholder="Points"
                            min="0"
                            required
                            className={`w-full p-2 rounded border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                          <input
                            type="text"
                            name="badges"
                            placeholder="Badges (comma-separated)"
                            className={`w-full p-2 rounded border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                          <input
                            type="text"
                            name="unlocks"
                            placeholder="Unlocks (comma-separated)"
                            className={`w-full p-2 rounded border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      Create Challenge
                    </button>
                  </form>
                </div>

                {/* Active Challenges */}
                {/* Claimed Rewards */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Claimed Rewards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressState.rewards
                      .filter(reward => reward.status === 'claimed')
                      .map((reward) => (
                        <div
                          key={reward.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{reward.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm px-2 py-1 rounded ${
                                reward.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                                reward.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                                reward.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                                reward.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reward.rarity.toUpperCase()}
                              </span>
                              <span className="text-sm text-green-500">
                                Claimed {new Date(reward.claimedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{reward.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Rewards Earned:</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-green-500">+{reward.points} points</span>
                                {reward.badges.length > 0 && (
                                  <span className="text-yellow-500">
                                    {reward.badges.length} badges
                                  </span>
                                )}
                                {reward.unlocks.length > 0 && (
                                  <span className="text-blue-500">
                                    {reward.unlocks.length} unlocks
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6">
                {/* Available Rewards */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Available Rewards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressState.rewards
                      .filter(reward => reward.status === 'available')
                      .map((reward) => (
                        <div
                          key={reward.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{reward.title}</h3>
                            <span className={`text-sm px-2 py-1 rounded ${
                              reward.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                              reward.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                              reward.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              reward.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reward.rarity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{reward.description}</p>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Requirements:</span>
                                <span className="font-medium">{reward.requirements}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Rewards:</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-green-500">+{reward.points} points</span>
                                  {reward.badges.length > 0 && (
                                    <span className="text-yellow-500">
                                      {reward.badges.length} badges
                                    </span>
                                  )}
                                  {reward.unlocks.length > 0 && (
                                    <span className="text-blue-500">
                                      {reward.unlocks.length} unlocks
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleClaimReward(reward.id)}
                              disabled={!reward.requirementsMet}
                              className={`w-full py-2 px-4 rounded ${
                                reward.requirementsMet
                                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {reward.requirementsMet ? 'Claim Reward' : 'Requirements Not Met'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Claimed Rewards */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Claimed Rewards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressState.rewards
                      .filter(reward => reward.status === 'claimed')
                      .map((reward) => (
                        <div
                          key={reward.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{reward.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm px-2 py-1 rounded ${
                                reward.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                                reward.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                                reward.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                                reward.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reward.rarity.toUpperCase()}
                              </span>
                              <span className="text-sm text-green-500">
                                Claimed {new Date(reward.claimedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{reward.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Rewards Earned:</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-green-500">+{reward.points} points</span>
                                {reward.badges.length > 0 && (
                                  <span className="text-yellow-500">
                                    {reward.badges.length} badges
                                  </span>
                                )}
                                {reward.unlocks.length > 0 && (
                                  <span className="text-blue-500">
                                    {reward.unlocks.length} unlocks
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Reward Progress */}
                <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-bold mb-4">Reward Progress</h2>
                  <div className="space-y-4">
                    {Object.entries(progressState.rewardProgress).map(([category, progress]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold capitalize">{category.replace('_', ' ')}</h3>
                          <span className="text-sm text-gray-500">
                            {progress.current} / {progress.target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(progress.current / progress.target) * 100}%` }}
                          />
                        </div>
                        {progress.nextReward && (
                          <div className="mt-2 text-sm text-gray-500">
                            Next reward at {progress.nextReward.target}: {progress.nextReward.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Progress; 