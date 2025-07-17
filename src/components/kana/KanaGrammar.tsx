import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface GrammarRule {
  title: string;
  description: string;
  examples: string[];
  notes?: string[];
}

const grammarRules: GrammarRule[] = [
  {
    title: 'Hiragana Usage',
    description: 'Hiragana is used for native Japanese words, grammatical particles, and to indicate the pronunciation of kanji (furigana).',
    examples: [
      'わたし (watashi) - I, me',
      'です (desu) - to be (copula)',
      'が (ga) - subject marker',
      'を (wo) - object marker',
      'に (ni) - location/direction marker'
    ],
    notes: [
      'Hiragana is essential for writing grammatical elements',
      'It\'s often used for words that don\'t have kanji',
      'Children\'s books are written primarily in hiragana'
    ]
  },
  {
    title: 'Katakana Usage',
    description: 'Katakana is used for foreign words, onomatopoeia, emphasis, and technical terms.',
    examples: [
      'コーヒー (kōhī) - coffee',
      'パソコン (pasokon) - personal computer',
      'ドキドキ (dokidoki) - heartbeat sound',
      'アメリカ (Amerika) - America',
      'メール (mēru) - email'
    ],
    notes: [
      'Katakana is commonly used for loanwords',
      'It\'s used for emphasis, similar to italics in English',
      'Technical terms and brand names often use katakana'
    ]
  },
  {
    title: 'Yōon (Combined Sounds)',
    description: 'Yōon are combined sounds created by adding small や, ゆ, or よ to certain kana.',
    examples: [
      'きょう (kyō) - today',
      'しゃしん (shashin) - photograph',
      'りょこう (ryokō) - travel',
      'ひゃく (hyaku) - hundred',
      'みょうじ (myōji) - surname'
    ],
    notes: [
      'The small kana is written at half the normal size',
      'Yōon are common in both native and loan words',
      'They represent a single syllable despite using two characters'
    ]
  },
  {
    title: 'Dakuon and Handakuon',
    description: 'Dakuon (voiced sounds) and handakuon (semi-voiced sounds) are created by adding diacritical marks to basic kana.',
    examples: [
      'がっこう (gakkō) - school',
      'ざっし (zasshi) - magazine',
      'でんわ (denwa) - telephone',
      'ぱん (pan) - bread',
      'ぴん (pin) - pin'
    ],
    notes: [
      'Dakuon (゛) changes k→g, s→z, t→d, h→b',
      'Handakuon (゜) changes h→p',
      'These marks are called dakuten and handakuten',
      'They can be combined with yōon'
    ]
  },
  {
    title: 'Long Vowels',
    description: 'Long vowels in Japanese are represented differently in hiragana and katakana.',
    examples: [
      'おばあさん (obāsan) - grandmother',
      'おじいさん (ojīsan) - grandfather',
      'コーヒー (kōhī) - coffee',
      'ケーキ (kēki) - cake',
      'スーパー (sūpā) - supermarket'
    ],
    notes: [
      'In hiragana, long vowels are written with an extra vowel kana',
      'In katakana, long vowels are written with a horizontal line (ー)',
      'Long vowels are held for approximately twice the length of short vowels'
    ]
  },
  {
    title: 'Small つ (Sokuon)',
    description: 'The small つ (っ) is used to indicate a geminate consonant (double consonant) sound.',
    examples: [
      'がっこう (gakkō) - school',
      'きって (kitte) - stamp',
      'ざっし (zasshi) - magazine',
      'みっつ (mittsu) - three (things)',
      'はっぱ (happa) - leaf'
    ],
    notes: [
      'The small つ creates a pause before the following consonant',
      'It\'s written at half the normal size',
      'Common in both native and loan words',
      'In katakana, it\'s written as ッ'
    ]
  },
  {
    title: 'Particles and Grammar',
    description: 'Hiragana is used for grammatical particles that indicate the function of words in a sentence.',
    examples: [
      'わたしは学生です (Watashi wa gakusei desu) - I am a student',
      '本を読みます (Hon wo yomimasu) - I read a book',
      '学校に行きます (Gakkō ni ikimasu) - I go to school',
      '友達と話します (Tomodachi to hanashimasu) - I talk with friends',
      '日本語が好きです (Nihongo ga suki desu) - I like Japanese'
    ],
    notes: [
      'は (wa) marks the topic of the sentence',
      'を (wo) marks the direct object',
      'に (ni) indicates direction, location, or time',
      'と (to) means "with" or "and"',
      'が (ga) marks the subject or indicates ability/desire'
    ]
  }
];

const KanaGrammar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-text-primary dark:text-text-dark-primary' : 'text-text-primary dark:text-text-dark-primary'}`}>
          Kana Grammar and Usage
        </Typography>

        <Paper className={`p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white dark:bg-dark-elevated'}`}>
          <Typography variant="body1" className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}>
            Understanding how to use hiragana and katakana correctly is essential for learning Japanese. 
            This section covers the main rules and patterns for using kana in Japanese writing.
          </Typography>
        </Paper>

        {grammarRules.map((rule, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            className={`mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white dark:bg-dark-elevated'}`}
          >
            <AccordionSummary
              expandIcon={<ExpandMore className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'} />}
              className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-primary dark:text-text-dark-primary'}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                {rule.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box className="space-y-4">
                <Typography variant="body1" className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}>
                  {rule.description}
                </Typography>

                <Box>
                  <Typography variant="subtitle2" className={`mb-2 ${isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}`}>
                    Examples:
                  </Typography>
                  <List dense>
                    {rule.examples.map((example, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={example}
                          className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {rule.notes && (
                  <Box>
                    <Typography variant="subtitle2" className={`mb-2 ${isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}`}>
                      Notes:
                    </Typography>
                    <List dense>
                      {rule.notes.map((note, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={note}
                            className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-nav">
          <Typography variant="body1" className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-secondary dark:text-text-dark-secondary'}>
            <strong>Practice Tips:</strong>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pay attention to when hiragana and katakana are used in real Japanese text</li>
              <li>Practice writing sentences using the correct particles</li>
              <li>Learn common words that use yōon and dakuon</li>
              <li>Practice reading and writing long vowels correctly</li>
              <li>Use the writing practice section to master stroke order</li>
            </ul>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KanaGrammar; 