import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Card, CardContent, Avatar, Chip, IconButton, Collapse } from '@mui/material';
import { School, Lightbulb, Celebration, Help, Close, VolumeUp } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export interface SenseiMessage {
  id: string;
  type: 'greeting' | 'instruction' | 'encouragement' | 'correction' | 'celebration' | 'hint';
  message: string;
  context?: string;
  action?: string;
  timestamp: Date;
}

interface VirtualSenseiProps {
  isVisible: boolean;
  onToggle: () => void;
  currentLesson?: string;
  userProgress?: any;
  onShowLesson?: (lessonId: string) => void;
}

const VirtualSensei: React.FC<VirtualSenseiProps> = ({
  isVisible,
  onToggle,
  currentLesson,
  userProgress,
  onShowLesson
}) => {
  const [messages, setMessages] = useState<SenseiMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<SenseiMessage | null>(null);

  // Sensei personality and responses
  const senseiResponses = {
    greeting: [
      "こんにちは！I'm your virtual sensei. Ready to learn some Japanese?",
      "Welcome back! Let's continue your Japanese journey together!",
      "Hello there! I'm here to guide you through your learning path."
    ],
    encouragement: [
      "Excellent work! You're making great progress!",
      "Keep it up! Every step brings you closer to fluency.",
      "You're doing wonderfully! Don't give up!"
    ],
    hint: [
      "Here's a little hint to help you along...",
      "Let me give you a clue...",
      "Think about it this way..."
    ]
  };

  // Add a new message
  const addMessage = useCallback((type: SenseiMessage['type'], message: string, context?: string) => {
    const newMessage: SenseiMessage = {
      id: Date.now().toString(),
      type,
      message,
      context,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage(newMessage);
  }, []);

  // Get random response
  const getRandomResponse = (type: keyof typeof senseiResponses) => {
    const responses = senseiResponses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Initialize sensei
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      addMessage('greeting', getRandomResponse('greeting'));
    }
  }, [isVisible, messages.length, addMessage]);

  // Handle user progress updates
  useEffect(() => {
    if (userProgress?.recentAchievement) {
      addMessage('celebration', `🎉 Congratulations! You've mastered ${userProgress.recentAchievement}!`);
    }
  }, [userProgress?.recentAchievement, addMessage]);

  const handleQuickQuestion = () => {
    addMessage('instruction', "What would you like to know? You can ask me about:\n• Word meanings\n• Grammar explanations\n• Pronunciation help\n• Learning tips");
  };

  const handleStartLesson = (lessonId: string) => {
    if (onShowLesson) {
      onShowLesson(lessonId);
    }
  };

  const getSenseiAvatar = (type: SenseiMessage['type']) => {
    const avatarStyle = {
      width: 60,
      height: 60,
      backgroundColor: type === 'celebration' ? '#ffd700' : 
                      type === 'encouragement' ? '#4caf50' : 
                      type === 'correction' ? '#ff9800' : '#2196f3'
    };

    return (
      <Avatar
        src={process.env.PUBLIC_URL + '/sensai.png'}
        alt="Virtual Sensei"
        sx={{ width: 80, height: 80, boxShadow: 3, border: '2px solid #fff', background: '#fff' }}
      />
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            maxWidth: 350
          }}
        >
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              {/* Header */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  {currentMessage && getSenseiAvatar(currentMessage.type)}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Virtual Sensei
                    </Typography>
                    <Chip 
                      label="Online" 
                      size="small" 
                      color="success" 
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
                <IconButton size="small" onClick={onToggle}>
                  <Close />
                </IconButton>
              </Box>

              {/* Current Message */}
              {currentMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      whiteSpace: 'pre-line',
                      backgroundColor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {currentMessage.message}
                  </Typography>
                </motion.div>
              )}

              {/* Quick Actions */}
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Help />}
                  onClick={handleQuickQuestion}
                >
                  Ask Question
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<School />}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Hide' : 'Show'} Lessons
                </Button>
              </Box>

              {/* Lesson List */}
              <Collapse in={isExpanded}>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Lessons:
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {[
                      { id: 'numbers', title: 'Numbers & Counting', difficulty: 1 },
                      { id: 'greetings', title: 'Basic Greetings', difficulty: 1 },
                      { id: 'pronouns', title: 'Simple Pronouns', difficulty: 2 },
                      { id: 'verbs', title: 'Essential Verbs', difficulty: 2 },
                      { id: 'family', title: 'Family & People', difficulty: 2 },
                      { id: 'time', title: 'Time & Days', difficulty: 3 },
                      { id: 'adjectives', title: 'Basic Adjectives', difficulty: 3 },
                      { id: 'questions', title: 'Simple Questions', difficulty: 3 },
                      { id: 'activities', title: 'Daily Activities', difficulty: 4 },
                      { id: 'kanji', title: 'Basic Kanji', difficulty: 4 }
                    ].map((lesson) => (
                      <Button
                        key={lesson.id}
                        size="small"
                        variant="text"
                        onClick={() => handleStartLesson(lesson.id)}
                        sx={{ 
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          textTransform: 'none'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {lesson.title}
                          </Typography>
                          <Chip 
                            label={`Level ${lesson.difficulty}`} 
                            size="small" 
                            color={lesson.difficulty <= 2 ? 'success' : lesson.difficulty <= 3 ? 'warning' : 'error'}
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        </Box>
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualSensei; 