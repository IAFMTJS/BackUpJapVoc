import React, { useState, useEffect } from 'react';
import { DictionaryItem, SimpleDictionaryItem } from '../types/dictionary';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Collapse,
  Paper
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { playAudio } from '../utils/audio';

// Type guard to check if an item is a DictionaryItem
const isDictionaryItem = (item: DictionaryItem | SimpleDictionaryItem): item is DictionaryItem => {
  return 'learningStatus' in item;
};

interface WordCardProps {
  word: DictionaryItem | SimpleDictionaryItem;
  onMarkAsLearned?: (wordId: string) => void;
  isLearned?: boolean;
  showMeaning?: boolean;
  onToggleMeaning?: () => void;
  onMarkAsRead?: (wordId: string) => void;
  isRead?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ 
  word, 
  onMarkAsLearned, 
  isLearned, 
  showMeaning, 
  onToggleMeaning,
  onMarkAsRead,
  isRead 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [localShowMeaning, setLocalShowMeaning] = useState(showMeaning || false);

  const handlePlayAudio = async () => {
    try {
      await playAudio(word.japanese);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const handleMarkAsLearned = () => {
    if (onMarkAsLearned) {
      onMarkAsLearned(word.id);
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(word.id);
    }
  };

  // Determine if we should show the learned/read status
  const showStatus = isLearned !== undefined || isRead !== undefined;
  const isItemLearned = isLearned || isRead;

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        },
        position: 'relative',
        ...(showStatus && isItemLearned && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '100%',
            backgroundColor: 'success.main',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px'
          }
        })
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              {word.japanese}
              {word.kanji && word.kanji !== word.japanese && (
                <Typography 
                  component="span" 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({word.kanji})
                </Typography>
              )}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {word.romaji}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Play pronunciation">
              <IconButton onClick={handlePlayAudio} size="small">
                <VolumeUpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <IconButton onClick={toggleFavorite} size="small">
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            {onMarkAsLearned && (
              <Tooltip title={isLearned ? "Mark as unlearned" : "Mark as learned"}>
                <IconButton 
                  onClick={handleMarkAsLearned} 
                  size="small"
                  color={isLearned ? "success" : "default"}
                >
                  {isLearned ? <CheckIcon /> : <CloseIcon />}
                </IconButton>
              </Tooltip>
            )}
            {onMarkAsRead && (
              <Tooltip title={isRead ? "Mark as unread" : "Mark as read"}>
                <IconButton 
                  onClick={handleMarkAsRead} 
                  size="small"
                  color={isRead ? "success" : "default"}
                >
                  {isRead ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {localShowMeaning ? (
          <Typography variant="body1" gutterBottom>
            {word.english}
          </Typography>
        ) : (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setLocalShowMeaning(true)}
            sx={{ mb: 2 }}
          >
            Show Meaning
          </Button>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {word.category && (
            <Chip 
              icon={<CategoryIcon />} 
              label={word.category} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
          {word.level && (
            <Chip 
              icon={<SchoolIcon />} 
              label={`Level ${word.level}`} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          )}
          {word.jlptLevel && (
            <Chip 
              icon={<StarIcon />} 
              label={`JLPT ${word.jlptLevel}`} 
              size="small" 
              color="info" 
              variant="outlined" 
            />
          )}
        </Stack>

        {isDictionaryItem(word) && word.examples && word.examples.length > 0 && (
          <Box>
            <Button
              endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={{ mb: 1 }}
            >
              {isExpanded ? 'Hide Examples' : 'Show Examples'}
            </Button>
            <Collapse in={isExpanded}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                {word.examples.map((example, index) => (
                  <Box key={index} sx={{ mb: index < word.examples.length - 1 ? 2 : 0 }}>
                    <Typography variant="body2" gutterBottom>
                      {example.japanese}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {example.romaji}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {example.english}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Collapse>
          </Box>
        )}

        {!isDictionaryItem(word) && word.examples && word.examples.length > 0 && (
          <Box>
            <Button
              endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={{ mb: 1 }}
            >
              {isExpanded ? 'Hide Examples' : 'Show Examples'}
            </Button>
            <Collapse in={isExpanded}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                {word.examples.map((example, index) => (
                  <Box key={index} sx={{ mb: index < word.examples.length - 1 ? 2 : 0 }}>
                    <Typography variant="body2" gutterBottom>
                      {example}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WordCard; 