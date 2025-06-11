import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { playKanaAudio, preloadKanaAudio } from '../../utils/kanaAudio';

interface YōonCharacter {
  hiragana: string;
  katakana: string;
  romaji: string;
  base: string;
  combination: string;
  audio?: string;
}

const yōonKana: YōonCharacter[] = [
  // K series
  { hiragana: 'きゃ', katakana: 'キャ', romaji: 'kya', base: 'き', combination: 'ゃ' },
  { hiragana: 'きゅ', katakana: 'キュ', romaji: 'kyu', base: 'き', combination: 'ゅ' },
  { hiragana: 'きょ', katakana: 'キョ', romaji: 'kyo', base: 'き', combination: 'ょ' },
  
  // S series
  { hiragana: 'しゃ', katakana: 'シャ', romaji: 'sha', base: 'し', combination: 'ゃ' },
  { hiragana: 'しゅ', katakana: 'シュ', romaji: 'shu', base: 'し', combination: 'ゅ' },
  { hiragana: 'しょ', katakana: 'ショ', romaji: 'sho', base: 'し', combination: 'ょ' },
  
  // T series
  { hiragana: 'ちゃ', katakana: 'チャ', romaji: 'cha', base: 'ち', combination: 'ゃ' },
  { hiragana: 'ちゅ', katakana: 'チュ', romaji: 'chu', base: 'ち', combination: 'ゅ' },
  { hiragana: 'ちょ', katakana: 'チョ', romaji: 'cho', base: 'ち', combination: 'ょ' },
  
  // N series
  { hiragana: 'にゃ', katakana: 'ニャ', romaji: 'nya', base: 'に', combination: 'ゃ' },
  { hiragana: 'にゅ', katakana: 'ニュ', romaji: 'nyu', base: 'に', combination: 'ゅ' },
  { hiragana: 'にょ', katakana: 'ニョ', romaji: 'nyo', base: 'に', combination: 'ょ' },
  
  // H series
  { hiragana: 'ひゃ', katakana: 'ヒャ', romaji: 'hya', base: 'ひ', combination: 'ゃ' },
  { hiragana: 'ひゅ', katakana: 'ヒュ', romaji: 'hyu', base: 'ひ', combination: 'ゅ' },
  { hiragana: 'ひょ', katakana: 'ヒョ', romaji: 'hyo', base: 'ひ', combination: 'ょ' },
  
  // M series
  { hiragana: 'みゃ', katakana: 'ミャ', romaji: 'mya', base: 'み', combination: 'ゃ' },
  { hiragana: 'みゅ', katakana: 'ミュ', romaji: 'myu', base: 'み', combination: 'ゅ' },
  { hiragana: 'みょ', katakana: 'ミョ', romaji: 'myo', base: 'み', combination: 'ょ' },
  
  // R series
  { hiragana: 'りゃ', katakana: 'リャ', romaji: 'rya', base: 'り', combination: 'ゃ' },
  { hiragana: 'りゅ', katakana: 'リュ', romaji: 'ryu', base: 'り', combination: 'ゅ' },
  { hiragana: 'りょ', katakana: 'リョ', romaji: 'ryo', base: 'り', combination: 'ょ' },
];

export { yōonKana };

const YōonKana: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [displayMode, setDisplayMode] = useState<'both' | 'hiragana' | 'katakana'>('both');
  const [showRomaji, setShowRomaji] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Preload audio when component mounts
  useEffect(() => {
    if (preloadKanaAudio && typeof preloadKanaAudio === 'function') {
      preloadKanaAudio().catch(console.error);
    }
  }, []);

  const handleDisplayModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'both' | 'hiragana' | 'katakana',
  ) => {
    if (newMode !== null) {
      setDisplayMode(newMode);
    }
  };

  const handlePlayAudio = async (romaji: string) => {
    try {
      if (playKanaAudio && typeof playKanaAudio === 'function') {
        await playKanaAudio(romaji);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Yōon (拗音) - Combined Sounds
        </Typography>
        <Typography variant="body1" className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Yōon are combined sounds created by adding a small や (ya), ゆ (yu), or よ (yo) to certain kana.
          This creates new sounds like きゃ (kya), しゅ (shu), and ちょ (cho).
        </Typography>
      </Box>

      <Box className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Box className="flex flex-col sm:flex-row gap-4">
          <ToggleButtonGroup
            value={displayMode}
            exclusive
            onChange={handleDisplayModeChange}
            aria-label="kana display mode"
            size="small"
          >
            <ToggleButton value="both" aria-label="show both">
              Both
            </ToggleButton>
            <ToggleButton value="hiragana" aria-label="show hiragana">
              Hiragana
            </ToggleButton>
            <ToggleButton value="katakana" aria-label="show katakana">
              Katakana
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowRomaji(!showRomaji)}
          >
            {showRomaji ? 'Hide' : 'Show'} Romaji
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? 'Hide' : 'Show'} Breakdown
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {yōonKana.map((kana) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={kana.romaji}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {displayMode !== 'katakana' && (
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {kana.hiragana}
                  </Typography>
                )}
                {displayMode !== 'hiragana' && (
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {kana.katakana}
                  </Typography>
                )}
                {showRomaji && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {kana.romaji}
                  </Typography>
                )}
                {showBreakdown && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {kana.base} + {kana.combination}
                  </Typography>
                )}
                <Tooltip title="Play pronunciation">
                  <IconButton
                    onClick={() => handlePlayAudio(kana.romaji)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    <VolumeUpIcon />
                  </IconButton>
                </Tooltip>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <Typography variant="body1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          <strong>Tips for Yōon:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Notice how the small や, ゆ, and よ combine with the base character</li>
            <li>Practice writing both the base character and the small character</li>
            <li>Pay attention to the size difference between the base and small characters</li>
            <li>Common words using yōon: きょう (today), しゃしん (photo), りょこう (travel)</li>
            <li>Try to recognize yōon combinations in real Japanese text</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default YōonKana; 