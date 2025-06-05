import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';

interface Goal {
  id: string;
  type: 'daily_words' | 'weekly_words' | 'mastery' | 'streak' | 'study_time';
  target: number;
  current: number;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
}

interface GoalProgress {
  dailyWords: number;
  weeklyWords: number;
  mastery: number;
  streak: number;
  studyTime: number;
}

const LearningGoals: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<Goal['type']>('daily_words');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({
    dailyWords: 0,
    weeklyWords: 0,
    mastery: 0,
    streak: 0,
    studyTime: 0
  });

  // Calculate current progress
  useEffect(() => {
    if (progress) {
      const words = Object.values(progress.words || {});
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const dailyWords = words.filter(w => 
        w.lastAttempted && w.lastAttempted.startsWith(today)
      ).length;

      const weeklyWords = words.filter(w => 
        w.lastAttempted && new Date(w.lastAttempted) >= weekAgo
      ).length;

      const mastery = words.length > 0
        ? words.reduce((sum, w) => sum + (w.masteryLevel || 0), 0) / words.length
        : 0;

      setGoalProgress({
        dailyWords,
        weeklyWords,
        mastery: mastery * 100,
        streak: progress.statistics?.currentStreak || 0,
        studyTime: progress.statistics?.totalStudyTime || 0
      });
    }
  }, [progress]);

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      type: selectedGoalType,
      target: Number(goalTarget),
      current: goalProgress[selectedGoalType],
      deadline: goalDeadline ? new Date(goalDeadline) : undefined,
      completed: false,
      createdAt: new Date()
    };

    setGoals([...goals, newGoal]);
    setOpenDialog(false);
    setGoalTarget('');
    setGoalDeadline('');
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const getGoalProgress = (goal: Goal) => {
    const current = goalProgress[goal.type];
    return Math.min((current / goal.target) * 100, 100);
  };

  const getGoalTypeLabel = (type: Goal['type']) => {
    switch (type) {
      case 'daily_words': return 'Daily Words';
      case 'weekly_words': return 'Weekly Words';
      case 'mastery': return 'Mastery Level';
      case 'streak': return 'Study Streak';
      case 'study_time': return 'Study Time';
    }
  };

  const getGoalTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'daily_words':
      case 'weekly_words':
        return <SchoolIcon />;
      case 'mastery':
        return <TrendingUpIcon />;
      case 'streak':
        return <TrophyIcon />;
      case 'study_time':
        return <TimerIcon />;
    }
  };

  const formatGoalValue = (type: Goal['type'], value: number) => {
    switch (type) {
      case 'daily_words':
      case 'weekly_words':
        return `${value} words`;
      case 'mastery':
        return `${Math.round(value)}%`;
      case 'streak':
        return `${value} days`;
      case 'study_time':
        const hours = Math.floor(value / 60);
        const minutes = Math.round(value % 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Learning Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Goal
        </Button>
      </Box>

      {/* Active Goals */}
      <Grid container spacing={2}>
        {goals.map(goal => (
          <Grid item xs={12} md={6} key={goal.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getGoalTypeIcon(goal.type)}
                  <Typography variant="subtitle1">
                    {getGoalTypeLabel(goal.type)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteGoal(goal.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Target: {formatGoalValue(goal.type, goal.target)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current: {formatGoalValue(goal.type, goalProgress[goal.type])}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getGoalProgress(goal)}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
                {goal.deadline && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Deadline: {goal.deadline.toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add Goal Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={selectedGoalType}
                label="Goal Type"
                onChange={(e) => setSelectedGoalType(e.target.value as Goal['type'])}
              >
                <MenuItem value="daily_words">Daily Words</MenuItem>
                <MenuItem value="weekly_words">Weekly Words</MenuItem>
                <MenuItem value="mastery">Mastery Level</MenuItem>
                <MenuItem value="streak">Study Streak</MenuItem>
                <MenuItem value="study_time">Study Time</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Target"
              type="number"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              sx={{ mb: 2 }}
              helperText={`Current: ${formatGoalValue(selectedGoalType, goalProgress[selectedGoalType])}`}
            />

            <TextField
              fullWidth
              label="Deadline (optional)"
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddGoal}
            disabled={!goalTarget || isNaN(Number(goalTarget))}
          >
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Insights */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Analytics Insights
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Learning Patterns
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  • Best study time: Morning (8-10 AM)
                </Typography>
                <Typography variant="body2">
                  • Most productive day: Monday
                </Typography>
                <Typography variant="body2">
                  • Average session duration: {formatGoalValue('study_time', goalProgress.studyTime / (progress?.statistics?.studySessions?.length || 1))}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Performance Metrics
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  • Daily learning rate: {Math.round(goalProgress.weeklyWords / 7)} words/day
                </Typography>
                <Typography variant="body2">
                  • Mastery improvement: +{Math.round((goalProgress.mastery - (progress?.statistics?.averageMastery || 0) * 100) / 7)}% per week
                </Typography>
                <Typography variant="body2">
                  • Retention rate: {Math.round((Object.values(progress?.words || {}).filter(w => w.masteryLevel >= 0.8).length / Object.keys(progress?.words || {}).length) * 100)}%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LearningGoals; 