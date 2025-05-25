import React from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

// Styled components
const StyledCard = styled(Card)`
  background: ${props => props.theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const MasteryIndicatorContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 8px;
  background: ${props => props.theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 4px;
  overflow: hidden;
`;

const MasteryProgress = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, 
    ${props => props.theme.palette.primary.main}, 
    ${props => props.theme.palette.secondary.main}
  );
  border-radius: 4px;
`;

interface DailyChallengeCardProps {
  date: Date;
  characters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  bonusPoints: number;
  timeLimit: number;
  completed: boolean;
  score: number;
  onStart?: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  date,
  characters,
  difficulty,
  theme,
  bonusPoints,
  timeLimit,
  completed,
  score,
  onStart
}) => {
  const difficultyColors = {
    easy: '#4caf50',
    medium: '#ff9800',
    hard: '#f44336'
  };

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Daily Challenge
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {new Date(date).toLocaleDateString()}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Theme: {theme}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Characters: {characters.join(' ')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Difficulty: <span style={{ color: difficultyColors[difficulty] }}>{difficulty}</span>
          </Typography>
          <Typography variant="body2" gutterBottom>
            Bonus Points: {bonusPoints}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Time Limit: {timeLimit} seconds
          </Typography>
          {completed && (
            <Typography variant="body2" color="primary">
              Score: {score}
            </Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

interface CharacterDecompositionViewProps {
  character: string;
  components: string[];
  meanings: string[];
  readings: string[];
  strokeCount: number;
  radicals: string[];
}

export const CharacterDecompositionView: React.FC<CharacterDecompositionViewProps> = ({
  character,
  components,
  meanings,
  readings,
  strokeCount,
  radicals
}) => {
  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          {character}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Components</Typography>
            <Typography variant="body2">{components.join(' ')}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Meanings</Typography>
            <Typography variant="body2">{meanings.join(', ')}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Readings</Typography>
            <Typography variant="body2">{readings.join(', ')}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Stroke Count</Typography>
            <Typography variant="body2">{strokeCount}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Radicals</Typography>
            <Typography variant="body2">{radicals.join(' ')}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

interface MasteryIndicatorProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  progress: number;
}

export const MasteryIndicator: React.FC<MasteryIndicatorProps> = ({ level, progress }) => {
  const levelColors = {
    beginner: '#4caf50',
    intermediate: '#2196f3',
    advanced: '#9c27b0',
    master: '#f44336'
  };

  const levelThresholds = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    master: 100
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tooltip title={`${level}: ${progress}%`}>
        <MasteryIndicatorContainer>
          <MasteryProgress
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: levelColors[level] }}
          />
        </MasteryIndicatorContainer>
      </Tooltip>
      <Typography variant="caption" color="textSecondary" align="center">
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Typography>
    </Box>
  );
};

interface PracticeGridProps {
  items: Array<{
    character: string;
    progress: number;
    lastPracticed?: Date;
  }>;
  onSelect: (character: string) => void;
}

export const PracticeGrid: React.FC<PracticeGridProps> = ({ items, onSelect }) => {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={4} sm={3} md={2} key={item.character}>
          <StyledCard onClick={() => onSelect(item.character)}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                {item.character}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={item.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              {item.lastPracticed && (
                <Typography variant="caption" color="textSecondary" align="center" display="block">
                  Last: {new Date(item.lastPracticed).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
}; 