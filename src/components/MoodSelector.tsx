import React from 'react';
import { 
  Box, Typography, Chip, Tooltip, IconButton, Popover, Button,
  Paper, Grid, Fade, Zoom, Grow, useTheme
} from '@mui/material';
import { EmotionalCategory, EMOTIONAL_CATEGORIES } from '../types/mood';
import MoodIcon from '@mui/icons-material/Mood';
import FilterListIcon from '@mui/icons-material/FilterList';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface MoodSelectorProps {
  selectedMoods: EmotionalCategory[];
  onMoodSelect: (moods: EmotionalCategory[]) => void;
  className?: string;
}

const moodGroups = [
  {
    name: "Romantic & Love",
    icon: <SentimentSatisfiedIcon />,
    moods: [
      "love",
      "romantic"
    ] as EmotionalCategory[]
  },
  {
    name: "Anger & Frustration",
    icon: <SentimentDissatisfiedIcon />,
    moods: [
      "anger",
      "angry",
      "annoyed"
    ] as EmotionalCategory[]
  },
  {
    name: "Positive Emotions",
    icon: <EmojiEmotionsIcon />,
    moods: [
      "happiness",
      "positive",
      "playful"
    ] as EmotionalCategory[]
  },
  {
    name: "Social & Respect",
    icon: <PsychologyIcon />,
    moods: [
      "empathy",
      "empathetic",
      "respect"
    ] as EmotionalCategory[]
  },
  {
    name: "Motivation & Determination",
    icon: <SentimentSatisfiedIcon />,
    moods: [
      "determination",
      "motivational"
    ] as EmotionalCategory[]
  },
  {
    name: "Neutral & Indifferent",
    icon: <SentimentDissatisfiedIcon />,
    moods: [
      "neutral",
      "indifferent"
    ] as EmotionalCategory[]
  },
  {
    name: "Fear & Anxiety",
    icon: <SentimentDissatisfiedIcon />,
    moods: [
      "fear"
    ] as EmotionalCategory[]
  },
  {
    name: "Surprise & Disgust",
    icon: <SentimentDissatisfiedIcon />,
    moods: [
      "surprise",
      "disgust"
    ] as EmotionalCategory[]
  },
  {
    name: "Sadness & Grief",
    icon: <SentimentDissatisfiedIcon />,
    moods: [
      "sadness"
    ] as EmotionalCategory[]
  },
  {
    name: "Gratitude & Appreciation",
    icon: <SentimentSatisfiedIcon />,
    moods: [
      "gratitude"
    ] as EmotionalCategory[]
  }
];

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMoods, onMoodSelect, className }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [hoveredGroup, setHoveredGroup] = React.useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMoodToggle = (mood: EmotionalCategory) => {
    const newMoods = selectedMoods.includes(mood)
      ? selectedMoods.filter(m => m !== mood)
      : [...selectedMoods, mood];
    onMoodSelect(newMoods);
  };

  const handleGroupSelect = (moods: EmotionalCategory[]) => {
    // If all moods in the group are selected, deselect them
    const allSelected = moods.every(mood => selectedMoods.includes(mood));
    if (allSelected) {
      onMoodSelect(selectedMoods.filter(mood => !moods.includes(mood)));
    } else {
      // Otherwise, add any unselected moods from the group
      const newMoods = [...selectedMoods];
      moods.forEach(mood => {
        if (!newMoods.includes(mood)) {
          newMoods.push(mood);
        }
      });
      onMoodSelect(newMoods);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box className={className}>
      <Tooltip title="Select moods to filter expressions">
        <Button
          variant="contained"
          onClick={handleClick}
          startIcon={<MoodIcon />}
          endIcon={<FilterListIcon />}
          sx={{
            backgroundColor: selectedMoods.length > 0 ? 'primary.main' : 'primary.light',
            color: selectedMoods.length > 0 ? 'white' : 'primary.main',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.1rem',
            boxShadow: 3,
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'translateY(-2px)',
              boxShadow: 6,
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {selectedMoods.length > 0 
            ? `${selectedMoods.length} Mood${selectedMoods.length > 1 ? 's' : ''} Selected`
            : 'Select Moods'}
        </Button>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 3,
            maxWidth: 800,
            maxHeight: '80vh',
            borderRadius: 3,
            boxShadow: 6,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            How are you feeling?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            Select one or more moods to find the perfect expressions
          </Typography>

          {/* Quick Select Groups */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {moodGroups.map((group) => (
              <Grid item xs={6} sm={3} key={group.name}>
                <Paper
                  onMouseEnter={() => setHoveredGroup(group.name)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  onClick={() => handleGroupSelect(group.moods)}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: group.moods.every(mood => selectedMoods.includes(mood))
                      ? 'primary.light'
                      : 'background.paper',
                    transform: hoveredGroup === group.name ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredGroup === group.name ? 6 : 1,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box sx={{ mb: 1 }}>{group.icon}</Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                    {group.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {group.moods.length} moods
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Individual Mood Selection */}
          <Grid container spacing={1}>
            {Object.entries(EMOTIONAL_CATEGORIES).map(([category, { name, emoji, description }]) => (
              <Grid item key={category}>
                <Tooltip title={description}>
                  <Chip
                    label={name}
                    onClick={() => handleMoodToggle(category as EmotionalCategory)}
                    icon={<span>{emoji}</span>}
                    sx={{
                      backgroundColor: selectedMoods.includes(category as EmotionalCategory)
                        ? `${emoji}20`
                        : 'background.paper',
                      border: `1px solid ${emoji}`,
                      '&:hover': {
                        backgroundColor: `${emoji}30`
                      }
                    }}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
};

export default MoodSelector; 