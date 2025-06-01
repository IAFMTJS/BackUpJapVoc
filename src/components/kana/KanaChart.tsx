import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';

interface KanaChartProps {
  type: 'hiragana' | 'katakana';
  onSelectKana?: (kana: string) => void;
}

interface KanaData {
  kana: string;
  romaji: string;
  row: number;
  column: number;
}

// Define the complete kana data structure
export const kanaData = {
  hiragana: {
    gojuon: [
      { row: 'あ行', kana: ['あ', 'い', 'う', 'え', 'お'], romaji: ['a', 'i', 'u', 'e', 'o'] },
      { row: 'か行', kana: ['か', 'き', 'く', 'け', 'こ'], romaji: ['ka', 'ki', 'ku', 'ke', 'ko'] },
      { row: 'さ行', kana: ['さ', 'し', 'す', 'せ', 'そ'], romaji: ['sa', 'shi', 'su', 'se', 'so'] },
      { row: 'た行', kana: ['た', 'ち', 'つ', 'て', 'と'], romaji: ['ta', 'chi', 'tsu', 'te', 'to'] },
      { row: 'な行', kana: ['な', 'に', 'ぬ', 'ね', 'の'], romaji: ['na', 'ni', 'nu', 'ne', 'no'] },
      { row: 'は行', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'], romaji: ['ha', 'hi', 'fu', 'he', 'ho'] },
      { row: 'ま行', kana: ['ま', 'み', 'む', 'め', 'も'], romaji: ['ma', 'mi', 'mu', 'me', 'mo'] },
      { row: 'や行', kana: ['や', '', 'ゆ', '', 'よ'], romaji: ['ya', '', 'yu', '', 'yo'] },
      { row: 'ら行', kana: ['ら', 'り', 'る', 'れ', 'ろ'], romaji: ['ra', 'ri', 'ru', 're', 'ro'] },
      { row: 'わ行', kana: ['わ', '', '', '', 'を'], romaji: ['wa', '', '', '', 'wo'] },
      { row: 'ん', kana: ['ん'], romaji: ['n'] }
    ],
    dakuon: [
      { row: 'が行', kana: ['が', 'ぎ', 'ぐ', 'げ', 'ご'], romaji: ['ga', 'gi', 'gu', 'ge', 'go'] },
      { row: 'ざ行', kana: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'], romaji: ['za', 'ji', 'zu', 'ze', 'zo'] },
      { row: 'だ行', kana: ['だ', 'ぢ', 'づ', 'で', 'ど'], romaji: ['da', 'ji', 'zu', 'de', 'do'] },
      { row: 'ば行', kana: ['ば', 'び', 'ぶ', 'べ', 'ぼ'], romaji: ['ba', 'bi', 'bu', 'be', 'bo'] }
    ],
    handakuon: [
      { row: 'ぱ行', kana: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'], romaji: ['pa', 'pi', 'pu', 'pe', 'po'] }
    ],
    yoon: [
      { row: 'きゃ行', kana: ['きゃ', 'きゅ', 'きょ'], romaji: ['kya', 'kyu', 'kyo'] },
      { row: 'しゃ行', kana: ['しゃ', 'しゅ', 'しょ'], romaji: ['sha', 'shu', 'sho'] },
      { row: 'ちゃ行', kana: ['ちゃ', 'ちゅ', 'ちょ'], romaji: ['cha', 'chu', 'cho'] },
      { row: 'にゃ行', kana: ['にゃ', 'にゅ', 'にょ'], romaji: ['nya', 'nyu', 'nyo'] },
      { row: 'ひゃ行', kana: ['ひゃ', 'ひゅ', 'ひょ'], romaji: ['hya', 'hyu', 'hyo'] },
      { row: 'みゃ行', kana: ['みゃ', 'みゅ', 'みょ'], romaji: ['mya', 'myu', 'myo'] },
      { row: 'りゃ行', kana: ['りゃ', 'りゅ', 'りょ'], romaji: ['rya', 'ryu', 'ryo'] },
      { row: 'ぎゃ行', kana: ['ぎゃ', 'ぎゅ', 'ぎょ'], romaji: ['gya', 'gyu', 'gyo'] },
      { row: 'じゃ行', kana: ['じゃ', 'じゅ', 'じょ'], romaji: ['ja', 'ju', 'jo'] },
      { row: 'びゃ行', kana: ['びゃ', 'びゅ', 'びょ'], romaji: ['bya', 'byu', 'byo'] },
      { row: 'ぴゃ行', kana: ['ぴゃ', 'ぴゅ', 'ぴょ'], romaji: ['pya', 'pyu', 'pyo'] }
    ]
  },
  katakana: {
    gojuon: [
      { row: 'ア行', kana: ['ア', 'イ', 'ウ', 'エ', 'オ'], romaji: ['a', 'i', 'u', 'e', 'o'] },
      { row: 'カ行', kana: ['カ', 'キ', 'ク', 'ケ', 'コ'], romaji: ['ka', 'ki', 'ku', 'ke', 'ko'] },
      { row: 'サ行', kana: ['サ', 'シ', 'ス', 'セ', 'ソ'], romaji: ['sa', 'shi', 'su', 'se', 'so'] },
      { row: 'タ行', kana: ['タ', 'チ', 'ツ', 'テ', 'ト'], romaji: ['ta', 'chi', 'tsu', 'te', 'to'] },
      { row: 'ナ行', kana: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'], romaji: ['na', 'ni', 'nu', 'ne', 'no'] },
      { row: 'ハ行', kana: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'], romaji: ['ha', 'hi', 'fu', 'he', 'ho'] },
      { row: 'マ行', kana: ['マ', 'ミ', 'ム', 'メ', 'モ'], romaji: ['ma', 'mi', 'mu', 'me', 'mo'] },
      { row: 'ヤ行', kana: ['ヤ', '', 'ユ', '', 'ヨ'], romaji: ['ya', '', 'yu', '', 'yo'] },
      { row: 'ラ行', kana: ['ラ', 'リ', 'ル', 'レ', 'ロ'], romaji: ['ra', 'ri', 'ru', 're', 'ro'] },
      { row: 'ワ行', kana: ['ワ', '', '', '', 'ヲ'], romaji: ['wa', '', '', '', 'wo'] },
      { row: 'ン', kana: ['ン'], romaji: ['n'] }
    ],
    dakuon: [
      { row: 'ガ行', kana: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'], romaji: ['ga', 'gi', 'gu', 'ge', 'go'] },
      { row: 'ザ行', kana: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'], romaji: ['za', 'ji', 'zu', 'ze', 'zo'] },
      { row: 'ダ行', kana: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'], romaji: ['da', 'ji', 'zu', 'de', 'do'] },
      { row: 'バ行', kana: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'], romaji: ['ba', 'bi', 'bu', 'be', 'bo'] }
    ],
    handakuon: [
      { row: 'パ行', kana: ['パ', 'ピ', 'プ', 'ペ', 'ポ'], romaji: ['pa', 'pi', 'pu', 'pe', 'po'] }
    ],
    yoon: [
      { row: 'キャ行', kana: ['キャ', 'キュ', 'キョ'], romaji: ['kya', 'kyu', 'kyo'] },
      { row: 'シャ行', kana: ['シャ', 'シュ', 'ショ'], romaji: ['sha', 'shu', 'sho'] },
      { row: 'チャ行', kana: ['チャ', 'チュ', 'チョ'], romaji: ['cha', 'chu', 'cho'] },
      { row: 'ニャ行', kana: ['ニャ', 'ニュ', 'ニョ'], romaji: ['nya', 'nyu', 'nyo'] },
      { row: 'ヒャ行', kana: ['ヒャ', 'ヒュ', 'ヒョ'], romaji: ['hya', 'hyu', 'hyo'] },
      { row: 'ミャ行', kana: ['ミャ', 'ミュ', 'ミョ'], romaji: ['mya', 'myu', 'myo'] },
      { row: 'リャ行', kana: ['リャ', 'リュ', 'リョ'], romaji: ['rya', 'ryu', 'ryo'] },
      { row: 'ギャ行', kana: ['ギャ', 'ギュ', 'ギョ'], romaji: ['gya', 'gyu', 'gyo'] },
      { row: 'ジャ行', kana: ['ジャ', 'ジュ', 'ジョ'], romaji: ['ja', 'ju', 'jo'] },
      { row: 'ビャ行', kana: ['ビャ', 'ビュ', 'ビョ'], romaji: ['bya', 'byu', 'byo'] },
      { row: 'ピャ行', kana: ['ピャ', 'ピュ', 'ピョ'], romaji: ['pya', 'pyu', 'pyo'] }
    ]
  }
};

const KanaChart: React.FC<KanaChartProps> = ({ type, onSelectKana }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { playAudio } = useAudio();
  const [selectedKana, setSelectedKana] = useState<string | null>(null);
  const [showRomaji, setShowRomaji] = useState(true);

  const handleKanaClick = (kana: string, romaji: string) => {
    setSelectedKana(kana);
    if (onSelectKana) {
      onSelectKana(kana);
    }
    // Play audio for the kana
    playAudio(romaji);
  };

  const handlePracticeClick = (kana: string) => {
    // TODO: Implement practice mode
    console.log('Practice mode for:', kana);
  };

  const renderKanaSection = (title: string, data: typeof kanaData.hiragana.gojuon) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {data.map((row, rowIndex) => (
          <Grid item xs={12} key={rowIndex}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                {row.row}
              </Typography>
              <Grid container spacing={1}>
                {row.kana.map((kana, index) => (
                  <Grid item key={index}>
                    <Paper
                      elevation={kana === selectedKana ? 4 : 1}
                      sx={{
                        p: 1,
                        minWidth: 60,
                        textAlign: 'center',
                        cursor: kana ? 'pointer' : 'default',
                        backgroundColor: kana === selectedKana 
                          ? theme.palette.primary.main 
                          : theme.palette.background.paper,
                        color: kana === selectedKana 
                          ? theme.palette.primary.contrastText 
                          : theme.palette.text.primary,
                        '&:hover': kana ? {
                          backgroundColor: theme.palette.action.hover,
                          transform: 'scale(1.05)',
                          transition: 'all 0.2s ease-in-out'
                        } : {}
                      }}
                      onClick={() => kana && handleKanaClick(kana, row.romaji[index])}
                    >
                      <Typography variant="h5" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                        {kana}
                      </Typography>
                      {showRomaji && kana && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {row.romaji[index]}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          minWidth: isMobile ? '100%' : '800px'
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            {type === 'hiragana' ? 'Hiragana' : 'Katakana'} Chart
          </Typography>
          <Tooltip title={showRomaji ? "Hide Romaji" : "Show Romaji"}>
            <IconButton onClick={() => setShowRomaji(!showRomaji)}>
              <CheckIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {type === 'hiragana' ? (
          <>
            {renderKanaSection('Gojuon (Basic)', kanaData.hiragana.gojuon)}
            {renderKanaSection('Dakuon (Voiced)', kanaData.hiragana.dakuon)}
            {renderKanaSection('Handakuon (Semi-voiced)', kanaData.hiragana.handakuon)}
            {renderKanaSection('Yoon (Contracted)', kanaData.hiragana.yoon)}
          </>
        ) : (
          <>
            {renderKanaSection('Gojuon (Basic)', kanaData.katakana.gojuon)}
            {renderKanaSection('Dakuon (Voiced)', kanaData.katakana.dakuon)}
            {renderKanaSection('Handakuon (Semi-voiced)', kanaData.katakana.handakuon)}
            {renderKanaSection('Yoon (Contracted)', kanaData.katakana.yoon)}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default KanaChart; 