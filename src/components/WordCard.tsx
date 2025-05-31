import React, { useState, useEffect } from 'react';
import { DictionaryItem } from '../types/dictionary';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface WordCardProps {
  word: DictionaryItem;
  onMarkAsLearned?: (wordId: string) => void;
  isLearned?: boolean;
  showMeaning?: boolean;
  onToggleMeaning?: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
  word,
  onMarkAsLearned,
  isLearned = false,
  showMeaning = true,
  onToggleMeaning
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [localShowMeaning, setLocalShowMeaning] = useState(showMeaning);

  useEffect(() => {
    if (word.audioUrl) {
      const audioElement = new Audio(word.audioUrl);
      setAudio(audioElement);
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [word.audioUrl]);

  const handlePlayAudio = () => {
    if (audio) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleToggleMeaning = () => {
    if (onToggleMeaning) {
      onToggleMeaning();
    } else {
      setLocalShowMeaning(!localShowMeaning);
    }
  };

  const displayMeaning = onToggleMeaning ? showMeaning : localShowMeaning;

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      },
      opacity: isLearned ? 0.7 : 1
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h5" component="div">
            {word.word}
          </Typography>
          <Box>
            {word.audioUrl && (
              <Tooltip title="Play audio">
                <IconButton onClick={handlePlayAudio} size="small">
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <IconButton onClick={toggleFavorite} size="small">
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            {onMarkAsLearned && (
              <Tooltip title={isLearned ? "Mark as unlearned" : "Mark as learned"}>
                <IconButton 
                  onClick={() => onMarkAsLearned(word.id)} 
                  size="small"
                  color={isLearned ? "success" : "default"}
                >
                  {isLearned ? <CheckIcon /> : <CloseIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {word.reading}
        </Typography>
        
        {displayMeaning ? (
          <Typography variant="body1" paragraph>
            {word.meaning}
          </Typography>
        ) : (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleToggleMeaning}
            sx={{ mb: 2 }}
          >
            Show Meaning
          </Button>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {word.jlptLevel && (
            <Chip 
              label={`JLPT ${word.jlptLevel}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {word.level && (
            <Chip 
              label={`Level ${word.level}`} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
          )}
          {word.category && (
            <Chip 
              label={word.category} 
              size="small" 
              color="info" 
              variant="outlined"
            />
          )}
        </Stack>

        {word.example && displayMeaning && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Example: {word.example}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default WordCard; 