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

interface DakuonCharacter {
  hiragana: string;
  katakana: string;
  romaji: string;
  base: string;
  type: 'dakuon' | 'handakuon';
  audio?: string;
}

const dakuonKana: DakuonCharacter[] = [
  // Dakuon (Voiced Sounds)
  // G series
  { hiragana: 'が', katakana: 'ガ', romaji: 'ga', base: 'か', type: 'dakuon' },
  { hiragana: 'ぎ', katakana: 'ギ', romaji: 'gi', base: 'き', type: 'dakuon' },
  { hiragana: 'ぐ', katakana: 'グ', romaji: 'gu', base: 'く', type: 'dakuon' },
  { hiragana: 'げ', katakana: 'ゲ', romaji: 'ge', base: 'け', type: 'dakuon' },
  { hiragana: 'ご', katakana: 'ゴ', romaji: 'go', base: 'こ', type: 'dakuon' },
  
  // Z series
  { hiragana: 'ざ', katakana: 'ザ', romaji: 'za', base: 'さ', type: 'dakuon' },
  { hiragana: 'じ', katakana: 'ジ', romaji: 'ji', base: 'し', type: 'dakuon' },
  { hiragana: 'ず', katakana: 'ズ', romaji: 'zu', base: 'す', type: 'dakuon' },
  { hiragana: 'ぜ', katakana: 'ゼ', romaji: 'ze', base: 'せ', type: 'dakuon' },
  { hiragana: 'ぞ', katakana: 'ゾ', romaji: 'zo', base: 'そ', type: 'dakuon' },
  
  // D series
  { hiragana: 'だ', katakana: 'ダ', romaji: 'da', base: 'た', type: 'dakuon' },
  { hiragana: 'ぢ', katakana: 'ヂ', romaji: 'ji', base: 'ち', type: 'dakuon' },
  { hiragana: 'づ', katakana: 'ヅ', romaji: 'zu', base: 'つ', type: 'dakuon' },
  { hiragana: 'で', katakana: 'デ', romaji: 'de', base: 'て', type: 'dakuon' },
  { hiragana: 'ど', katakana: 'ド', romaji: 'do', base: 'と', type: 'dakuon' },
  
  // B series
  { hiragana: 'ば', katakana: 'バ', romaji: 'ba', base: 'は', type: 'dakuon' },
  { hiragana: 'び', katakana: 'ビ', romaji: 'bi', base: 'ひ', type: 'dakuon' },
  { hiragana: 'ぶ', katakana: 'ブ', romaji: 'bu', base: 'ふ', type: 'dakuon' },
  { hiragana: 'べ', katakana: 'ベ', romaji: 'be', base: 'へ', type: 'dakuon' },
  { hiragana: 'ぼ', katakana: 'ボ', romaji: 'bo', base: 'ほ', type: 'dakuon' },
  
  // Handakuon (Semi-voiced Sounds)
  // P series
  { hiragana: 'ぱ', katakana: 'パ', romaji: 'pa', base: 'は', type: 'handakuon' },
  { hiragana: 'ぴ', katakana: 'ピ', romaji: 'pi', base: 'ひ', type: 'handakuon' },
  { hiragana: 'ぷ', katakana: 'プ', romaji: 'pu', base: 'ふ', type: 'handakuon' },
  { hiragana: 'ぺ', katakana: 'ペ', romaji: 'pe', base: 'へ', type: 'handakuon' },
  { hiragana: 'ぽ', katakana: 'ポ', romaji: 'po', base: 'ほ', type: 'handakuon' },
];

export { dakuonKana };

const DakuonKana: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [displayMode, setDisplayMode] = useState<'both' | 'hiragana' | 'katakana'>('both');
  const [showRomaji, setShowRomaji] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'dakuon' | 'handakuon'>('all');

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

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'all' | 'dakuon' | 'handakuon',
  ) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
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

  const filteredKana = dakuonKana.filter(kana => 
    filterType === 'all' || kana.type === filterType
  );

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-text-primary dark:text-text-dark-primary' : 'text-text-primary dark:text-text-dark-primary'}`}>
          Dakuon (濁音) and Handakuon (半濁音)
        </Typography>
        <Typography variant="body1" className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-muted dark:text-text-dark-muted'}>
          Dakuon are voiced sounds marked with ゛ (dakuten), while handakuon are semi-voiced sounds 
          marked with ゜ (handakuten). These marks change the pronunciation of the base kana.
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

          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            aria-label="kana type filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="show all">
              All
            </ToggleButton>
            <ToggleButton value="dakuon" aria-label="show dakuon">
              Dakuon
            </ToggleButton>
            <ToggleButton value="handakuon" aria-label="show handakuon">
              Handakuon
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
        {filteredKana.map((kana) => (
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
                    {kana.base} ({kana.type})
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

      <Box className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-nav">
        <Typography variant="body1" className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}>
          <strong>Tips for Dakuon and Handakuon:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Dakuon (゛) changes k→g, s→z, t→d, h→b</li>
            <li>Handakuon (゜) changes h→p</li>
            <li>Common words using dakuon: がっこう (school), ざっし (magazine), でんわ (telephone)</li>
            <li>Common words using handakuon: ぱん (bread), ぴん (pin), ぺん (pen)</li>
            <li>Practice writing both the base character and the dakuten/handakuten marks</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default DakuonKana; 