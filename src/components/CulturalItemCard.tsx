import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { playAudio } from '../utils/audio';

interface CulturalItemProps {
  title: {
    japanese: string;
    romaji: string;
    english: string;
  };
  description: {
    japanese: string;
    romaji: string;
    english: string;
  };
  details: {
    japanese: string;
    romaji: string;
    english: string;
  };
  examples?: {
    japanese: string;
    romaji: string;
    english: string;
  }[];
  showRomaji: boolean;
  showEnglish: boolean;
}

const CulturalItemCard: React.FC<CulturalItemProps> = ({
  title,
  description,
  details,
  examples,
  showRomaji,
  showEnglish
}) => {
  const handlePlayAudio = async (text: string) => {
    try {
      await playAudio(text);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const renderText = (text: { japanese: string; romaji: string; english: string }) => (
    <>
      <Typography variant="body1">
        {text.japanese}
        {showRomaji && (
          <Typography component="div" variant="subtitle2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {text.romaji}
          </Typography>
        )}
        {showEnglish && (
          <Typography component="div" variant="subtitle2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {text.english}
          </Typography>
        )}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={() => handlePlayAudio(text.japanese)} size="small">
          <VolumeUpIcon />
        </IconButton>
      </Box>
    </>
  );

  return (
    <Accordion sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title.japanese}
            {showRomaji && (
              <Typography component="span" variant="subtitle2" sx={{ ml: 1, color: 'text.secondary' }}>
                ({title.romaji})
              </Typography>
            )}
            {showEnglish && (
              <Typography component="span" variant="subtitle2" sx={{ ml: 1, color: 'text.secondary' }}>
                - {title.english}
              </Typography>
            )}
          </Typography>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handlePlayAudio(title.japanese);
            }}
            size="small"
            sx={{ ml: 1 }}
          >
            <VolumeUpIcon />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          {renderText(description)}
        </Box>
        <Divider sx={{ my: 2 }} />
        {renderText(details)}
        {examples && examples.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Examples:
            </Typography>
            {examples.map((example, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                {renderText(example)}
              </Box>
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default CulturalItemCard; 