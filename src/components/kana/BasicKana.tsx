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

interface KanaCharacter {
  hiragana: string;
  katakana: string;
  romaji: string;
  audio?: string;
}

const basicKana: KanaCharacter[] = [
  // Vowels
  { hiragana: 'あ', katakana: 'ア', romaji: 'a' },
  { hiragana: 'い', katakana: 'イ', romaji: 'i' },
  { hiragana: 'う', katakana: 'ウ', romaji: 'u' },
  { hiragana: 'え', katakana: 'エ', romaji: 'e' },
  { hiragana: 'お', katakana: 'オ', romaji: 'o' },
  
  // K series
  { hiragana: 'か', katakana: 'カ', romaji: 'ka' },
  { hiragana: 'き', katakana: 'キ', romaji: 'ki' },
  { hiragana: 'く', katakana: 'ク', romaji: 'ku' },
  { hiragana: 'け', katakana: 'ケ', romaji: 'ke' },
  { hiragana: 'こ', katakana: 'コ', romaji: 'ko' },
  
  // S series
  { hiragana: 'さ', katakana: 'サ', romaji: 'sa' },
  { hiragana: 'し', katakana: 'シ', romaji: 'shi' },
  { hiragana: 'す', katakana: 'ス', romaji: 'su' },
  { hiragana: 'せ', katakana: 'セ', romaji: 'se' },
  { hiragana: 'そ', katakana: 'ソ', romaji: 'so' },
  
  // T series
  { hiragana: 'た', katakana: 'タ', romaji: 'ta' },
  { hiragana: 'ち', katakana: 'チ', romaji: 'chi' },
  { hiragana: 'つ', katakana: 'ツ', romaji: 'tsu' },
  { hiragana: 'て', katakana: 'テ', romaji: 'te' },
  { hiragana: 'と', katakana: 'ト', romaji: 'to' },
  
  // N series
  { hiragana: 'な', katakana: 'ナ', romaji: 'na' },
  { hiragana: 'に', katakana: 'ニ', romaji: 'ni' },
  { hiragana: 'ぬ', katakana: 'ヌ', romaji: 'nu' },
  { hiragana: 'ね', katakana: 'ネ', romaji: 'ne' },
  { hiragana: 'の', katakana: 'ノ', romaji: 'no' },
  
  // H series
  { hiragana: 'は', katakana: 'ハ', romaji: 'ha' },
  { hiragana: 'ひ', katakana: 'ヒ', romaji: 'hi' },
  { hiragana: 'ふ', katakana: 'フ', romaji: 'fu' },
  { hiragana: 'へ', katakana: 'ヘ', romaji: 'he' },
  { hiragana: 'ほ', katakana: 'ホ', romaji: 'ho' },
  
  // M series
  { hiragana: 'ま', katakana: 'マ', romaji: 'ma' },
  { hiragana: 'み', katakana: 'ミ', romaji: 'mi' },
  { hiragana: 'む', katakana: 'ム', romaji: 'mu' },
  { hiragana: 'め', katakana: 'メ', romaji: 'me' },
  { hiragana: 'も', katakana: 'モ', romaji: 'mo' },
  
  // Y series
  { hiragana: 'や', katakana: 'ヤ', romaji: 'ya' },
  { hiragana: 'ゆ', katakana: 'ユ', romaji: 'yu' },
  { hiragana: 'よ', katakana: 'ヨ', romaji: 'yo' },
  
  // R series
  { hiragana: 'ら', katakana: 'ラ', romaji: 'ra' },
  { hiragana: 'り', katakana: 'リ', romaji: 'ri' },
  { hiragana: 'る', katakana: 'ル', romaji: 'ru' },
  { hiragana: 'れ', katakana: 'レ', romaji: 're' },
  { hiragana: 'ろ', katakana: 'ロ', romaji: 'ro' },
  
  // W series
  { hiragana: 'わ', katakana: 'ワ', romaji: 'wa' },
  { hiragana: 'を', katakana: 'ヲ', romaji: 'wo' },
  
  // N
  { hiragana: 'ん', katakana: 'ン', romaji: 'n' },
];

export { basicKana };

const BasicKana: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [displayMode, setDisplayMode] = useState<'both' | 'hiragana' | 'katakana'>('both');
  const [showRomaji, setShowRomaji] = useState(true);

  // Preload audio when component mounts
  useEffect(() => {
    preloadKanaAudio().catch(console.error);
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
    await playKanaAudio(romaji);
  };

  return (
    <Box>
      <Box className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Typography variant="h6" className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          Basic Kana Characters
        </Typography>
        
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
        </Box>
      </Box>

      <Grid container spacing={2}>
        {basicKana.map((kana) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={kana.romaji}>
            <Card className={`h-full ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <CardContent className="p-2">
                <Box className="flex flex-col items-center">
                  {displayMode !== 'katakana' && (
                    <Typography 
                      variant="h4" 
                      className={`mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {kana.hiragana}
                    </Typography>
                  )}
                  
                  {displayMode !== 'hiragana' && (
                    <Typography 
                      variant="h4" 
                      className={`mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {kana.katakana}
                    </Typography>
                  )}
                  
                  {showRomaji && (
                    <Typography 
                      variant="body2" 
                      className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                    >
                      {kana.romaji}
                    </Typography>
                  )}
                  
                  <Tooltip title="Play pronunciation">
                    <IconButton
                      onClick={() => handlePlayAudio(kana.romaji)}
                      size="small"
                      className="mt-1"
                    >
                      <VolumeUpIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <Typography variant="body1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          <strong>Tips:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Practice writing each character while saying its pronunciation</li>
            <li>Focus on the stroke order and direction</li>
            <li>Use the audio button to practice pronunciation</li>
            <li>Try to recognize characters without looking at romaji</li>
            <li>Practice both reading and writing regularly</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default BasicKana; 