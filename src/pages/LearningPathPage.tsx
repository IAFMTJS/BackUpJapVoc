import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogContent,
  Alert
} from '@mui/material';
import { School, Lock, CheckCircle, PlayArrow, Star, Timer } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { senseiLessons, getPrerequisitesMet } from '../data/senseiLessons';
import LessonComponent from '../components/LessonNumbers';
import VirtualSensei from '../components/VirtualSensei';

const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress, getCompletedLessons, isLessonCompleted } = useProgress();
  
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [senseiVisible, setSenseiVisible] = useState(true);

  // Get user's completed lessons from proper lesson tracking
  const completedLessons = getCompletedLessons();

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
    const status = getLessonStatus(lessonId);
    if (status === 'locked') {
      setSelectedLesson(lessonId);
      setShowLessonDialog(true);
    } else {
      setSelectedLesson(lessonId);
      setShowLessonDialog(true);
    }
  };

  const handleCloseLesson = () => {
    setSelectedLesson(null);
    setShowLessonDialog(false);
  };

  const getLessonStatus = (lessonId: string) => {
    // First lesson should always be available
    if (lessonId === 'numbers') {
      if (isLessonCompleted(lessonId)) {
        return 'completed';
      }
      return 'available';
    }
    
    // For other lessons, check prerequisites
    if (isLessonCompleted(lessonId)) {
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
      <Box
        key={lesson.id}
        sx={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
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
      </Box>
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
            const isCompleted = isLessonCompleted(lesson.id);
            const prerequisitesMet = getPrerequisitesMet(lesson.id, completedLessons);
            const isLocked = !prerequisitesMet;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={lesson.id}>
                <Box
                  sx={{
                    opacity: 1,
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease'
                  }}
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
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* VSensei Guidance */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎯 Your Learning Journey
          </Typography>
          <Typography variant="body1" paragraph>
            {completedCount === 0 
              ? "Start with the Numbers lesson to begin your Japanese learning adventure!"
              : completedCount === 1
              ? "Great start! You've completed your first lesson. Ready for the next challenge?"
              : `Excellent progress! You've completed ${completedCount} lessons. Keep going!`
            }
          </Typography>
          
          {completedCount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Completed Lessons: {completedLessons.join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Next Available: {senseiLessons.find(lesson => 
                  !isLessonCompleted(lesson.id) && getPrerequisitesMet(lesson.id, completedLessons)
                )?.title || 'All lessons completed!'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Lesson Dialog */}
      <Dialog 
        open={showLessonDialog} 
        onClose={handleCloseLesson}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedLesson && (
            <LessonComponent 
              lessonId={selectedLesson} 
              onBack={handleCloseLesson}
            />
          )}
        </DialogContent>
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