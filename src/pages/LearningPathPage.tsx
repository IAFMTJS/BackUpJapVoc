import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  LinearProgress, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  School, 
  CheckCircle, 
  Lock, 
  PlayArrow, 
  Star,
  TrendingUp,
  EmojiEvents,
  Timer
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { senseiLessons, getLessonById, getPrerequisitesMet } from '../data/senseiLessons';
import VirtualSensei from '../components/VirtualSensei';

const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress } = useProgress();
  
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [senseiVisible, setSenseiVisible] = useState(true);

  // Get user's completed lessons from progress
  const completedLessons = Object.keys(progress?.words || {})
    .filter(wordId => {
      const wordProgress = progress.words[wordId];
      return wordProgress?.masteryLevel >= 3; // Consider mastered if level 3+
    })
    .map(wordId => {
      // Map word IDs to lesson IDs (this is a simplified mapping)
      // In a real implementation, you'd have a proper mapping
      return 'numbers'; // Placeholder
    });

  // Calculate overall progress
  const totalLessons = senseiLessons.length;
  const completedCount = completedLessons.length;
  const progressPercentage = (completedCount / totalLessons) * 100;

  // Get current level based on completed lessons
  const getCurrentLevel = () => {
    if (completedCount >= 8) return 4;
    if (completedCount >= 6) return 3;
    if (completedCount >= 3) return 2;
    return 1;
  };

  const handleLessonClick = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    if (!lesson) return;

    // Check if prerequisites are met
    if (!getPrerequisitesMet(lessonId, completedLessons)) {
      alert('Complete the prerequisite lessons first!');
      return;
    }

    setSelectedLesson(lessonId);
    setShowLessonDialog(true);
  };

  const handleStartLesson = () => {
    if (selectedLesson) {
      setShowLessonDialog(false);
      // Navigate to lesson page or start lesson component
      navigate(`/learning-path/lesson/${selectedLesson}`);
    }
  };

  const getLessonStatus = (lessonId: string) => {
    // First lesson should always be available
    if (lessonId === 'numbers') {
      if (completedLessons.includes(lessonId)) {
        return 'completed';
      }
      return 'available';
    }
    
    // For other lessons, check prerequisites
    if (completedLessons.includes(lessonId)) {
      return 'completed';
    }
    if (getPrerequisitesMet(lessonId, completedLessons)) {
      return 'available';
    }
    return 'locked';
  };

  const getLessonCard = (lesson: any, index: number) => {
    const status = getLessonStatus(lesson.id);
    const isCompleted = status === 'completed';
    const isAvailable = status === 'available';
    const isLocked = status === 'locked';

    return (
      <motion.div
        key={lesson.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card 
          sx={{ 
            mb: 2, 
            cursor: isLocked ? 'not-allowed' : 'pointer',
            opacity: isLocked ? 0.6 : 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isLocked ? 'none' : 'translateY(-2px)',
              boxShadow: isLocked ? 1 : 3
            }
          }}
          onClick={() => !isLocked && handleLessonClick(lesson.id)}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                {isCompleted ? (
                  <CheckCircle color="success" />
                ) : isLocked ? (
                  <Lock color="disabled" />
                ) : (
                  <School color="primary" />
                )}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {lesson.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lesson.description}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Chip 
                  label={`Level ${lesson.difficulty}`} 
                  color={lesson.difficulty <= 2 ? 'success' : lesson.difficulty <= 3 ? 'warning' : 'error'}
                  size="small"
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {lesson.estimatedTime} min
                </Typography>
              </Box>
            </Box>

            {isCompleted && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Star color="warning" fontSize="small" />
                <Typography variant="body2" color="success.main">
                  Completed!
                </Typography>
              </Box>
            )}

            {isAvailable && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <PlayArrow color="primary" fontSize="small" />
                <Typography variant="body2" color="primary">
                  Ready to start
                </Typography>
              </Box>
            )}

            {isLocked && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Lock color="disabled" fontSize="small" />
                <Typography variant="body2" color="text.disabled">
                  Complete prerequisites first
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header with VSensei branding */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4, 
          p: 3, 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: 3,
          backdropFilter: 'blur(10px)'
        }}>
          <img 
            src="/sensai.png" 
            alt="VSensei" 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              marginRight: 24,
              border: '3px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }} 
          />
          <Box>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              VSensei Learning Path
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Your personal Japanese learning journey with AI guidance
            </Typography>
          </Box>
        </Box>

        {/* Progress Overview */}
        <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Your Progress Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {completedLessons.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Lessons Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="secondary" gutterBottom>
                    {Math.round((completedLessons.length / senseiLessons.length) * 100)}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Overall Progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    {senseiLessons.length - completedLessons.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Lessons Remaining
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Curriculum Blocks */}
        <Typography variant="h4" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
          Your Learning Curriculum
        </Typography>
        
        <Grid container spacing={3}>
          {senseiLessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const prerequisitesMet = getPrerequisitesMet(lesson.prerequisites, completedLessons);
            const isLocked = !prerequisitesMet;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={lesson.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: isCompleted 
                        ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                        : isLocked
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: isCompleted ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.2)',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      '&:hover': !isLocked ? {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                        transition: 'all 0.3s ease'
                      } : {},
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => !isLocked && handleLessonClick(lesson.id)}
                  >
                    {isCompleted && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10,
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        p: 0.5
                      }}>
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
                      </Box>
                    )}
                    
                    {isLocked && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10,
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        p: 0.5
                      }}>
                        <Lock sx={{ color: '#666', fontSize: 24 }} />
                      </Box>
                    )}

                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: isCompleted ? '#4caf50' : isLocked ? '#666' : '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {index + 1}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: isCompleted ? 'white' : isLocked ? 'rgba(255,255,255,0.6)' : 'text.primary',
                            fontWeight: 'bold'
                          }}
                        >
                          {lesson.title}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isCompleted ? 'rgba(255,255,255,0.8)' : isLocked ? 'rgba(255,255,255,0.4)' : 'text.secondary',
                          mb: 2,
                          minHeight: 40
                        }}
                      >
                        {lesson.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Star sx={{ fontSize: 16, mr: 0.5, color: isCompleted ? 'white' : '#ffc107' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isCompleted ? 'rgba(255,255,255,0.8)' : isLocked ? 'rgba(255,255,255,0.4)' : 'text.secondary'
                          }}
                        >
                          Difficulty: {lesson.difficulty}/5
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Timer sx={{ fontSize: 16, mr: 0.5, color: isCompleted ? 'white' : '#666' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isCompleted ? 'rgba(255,255,255,0.8)' : isLocked ? 'rgba(255,255,255,0.4)' : 'text.secondary'
                          }}
                        >
                          {lesson.estimatedTime} min
                        </Typography>
                      </Box>

                      {!isLocked && (
                        <Button
                          variant={isCompleted ? "outlined" : "contained"}
                          fullWidth
                          startIcon={isCompleted ? <CheckCircle /> : <PlayArrow />}
                          sx={{ 
                            mt: 2,
                            color: isCompleted ? 'white' : 'white',
                            borderColor: isCompleted ? 'white' : 'transparent',
                            '&:hover': {
                              borderColor: isCompleted ? 'white' : 'transparent',
                              background: isCompleted ? 'rgba(255,255,255,0.1)' : 'primary.dark'
                            }
                          }}
                        >
                          {isCompleted ? 'Completed' : 'Start Lesson'}
                        </Button>
                      )}

                      {isLocked && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', mt: 2 }}>
                          Complete previous lessons first
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* VSensei Guidance */}
        <Card sx={{ mt: 4, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img 
                src="/sensai.png" 
                alt="VSensei" 
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  marginRight: 16,
                  border: '2px solid #3b82f6'
                }} 
              />
              <Typography variant="h6" color="primary">
                VSensei's Tip
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Start with the Numbers lesson to build a strong foundation. Each lesson builds upon the previous ones, 
              so take your time and practice regularly. I'm here to guide you through every step of your Japanese learning journey!
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Lesson Dialog */}
      <Dialog 
        open={showLessonDialog} 
        onClose={() => setShowLessonDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLesson && getLessonById(selectedLesson)?.title}
        </DialogTitle>
        <DialogContent>
          {selectedLesson && (
            <Box>
              <Typography variant="body1" paragraph>
                {getLessonById(selectedLesson)?.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estimated time: {getLessonById(selectedLesson)?.estimatedTime} minutes
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLessonDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStartLesson}
            startIcon={<PlayArrow />}
            disabled={selectedLesson && !getPrerequisitesMet(selectedLesson, completedLessons)}
          >
            Start Lesson
          </Button>
        </DialogActions>
        {selectedLesson && !getPrerequisitesMet(selectedLesson, completedLessons) && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Typography color="error" variant="body2">
              You must complete the prerequisite lessons before starting this lesson.
            </Typography>
          </Box>
        )}
      </Dialog>

      {/* Virtual Sensei */}
      <VirtualSensei
        isVisible={senseiVisible}
        onToggle={() => setSenseiVisible(!senseiVisible)}
        currentLesson={selectedLesson}
        userProgress={{ completedLessons: completedCount }}
        onShowLesson={handleLessonClick}
      />
    </Box>
  );
};

export default LearningPathPage; 