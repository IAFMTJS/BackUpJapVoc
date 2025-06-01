import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, useTheme, Chip, LinearProgress } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Psychology as PsychologyIcon,
  AutoGraph as AutoGraphIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'achievement' | 'goal' | 'milestone' | 'insight';
  status: 'completed' | 'in-progress' | 'upcoming' | 'locked';
  progress?: number;
  icon: React.ReactNode;
  prerequisite?: string; // ID of the milestone that needs to be completed first
}

const LearningPath: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();

  const milestones = useMemo(() => {
    const words = progress.words || {};
    const sessions = progress.statistics?.studySessions || [];
    const totalWords = Object.keys(words).length;
    const masteredWords = Object.values(words).filter((word: any) => word.mastery >= 0.8).length;
    const learningWords = Object.values(words).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
    
    // Define detailed learning stages with their prerequisites
    const stages = {
      // Kana Mastery (New)
      kanaMastery: {
        threshold: 0,
        title: 'Kana Mastery',
        description: 'Master both hiragana and katakana before proceeding to vocabulary. Each kana must be answered correctly twice in a row to be considered mastered.',
        prerequisite: null,
        learningGoals: [
          'Master all hiragana characters',
          'Master all katakana characters',
          'Achieve 100% accuracy in kana recognition',
          'Complete two consecutive correct answers for each kana'
        ],
        successMetrics: {
          masteryThreshold: 1.0, // 100% mastery required
          requiredWords: 0,
          requiredKanji: 0,
          requiredGrammar: [],
          assessmentCriteria: [
            'Can read and write all hiragana characters',
            'Can read and write all katakana characters',
            'Has answered each kana correctly twice in a row',
            'Can recognize kana instantly without hesitation'
          ]
        }
      },

      // Beginner Levels (Modified to require kana mastery)
      gettingStarted: { 
        threshold: 0, 
        title: 'First Steps', 
        description: 'Begin your Japanese vocabulary journey by learning your first words. Focus on basic greetings like こんにちは (hello) and ありがとう (thank you).',
        prerequisite: 'kanaMastery', // Modified to require kana mastery
        learningGoals: [
          'Learn basic greetings and introductions',
          'Understand basic word structure',
          'Start building vocabulary foundation'
        ],
        successMetrics: {
          masteryThreshold: 0.8,
          requiredWords: 0,
          requiredKanji: 0,
          requiredGrammar: ['Basic sentence structure'],
          assessmentCriteria: [
            'Can pronounce basic greetings correctly',
            'Understands basic word order',
            'Can read and write learned words in kana'
          ]
        }
      },
      basicGreetings: {
        threshold: 20,
        title: 'Basic Greetings',
        description: 'Master essential greetings and daily expressions. Learn to introduce yourself and handle basic social interactions.',
        prerequisite: 'gettingStarted',
        learningGoals: [
          'Learn 20+ essential greetings and expressions',
          'Practice proper pronunciation and intonation',
          'Understand basic politeness levels (です/ます form)'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 20,
          requiredKanji: 0,
          requiredGrammar: ['です/ます form', 'Basic particles (は、が、を)'],
          assessmentCriteria: [
            'Can use 20+ greetings and expressions correctly',
            'Proper pronunciation of all learned words',
            'Can form simple polite sentences',
            'Understands basic politeness levels'
          ]
        }
      },
      dailyEssentials: {
        threshold: 50,
        title: 'Daily Essentials',
        description: 'Build your foundation with common words used in daily life. Focus on practical vocabulary for everyday situations.',
        prerequisite: 'basicGreetings',
        learningGoals: [
          'Learn 50+ essential daily words',
          'Master numbers and counting',
          'Understand basic time expressions',
          'Learn common verbs for daily activities'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 50,
          requiredKanji: 5,
          requiredGrammar: ['Numbers and counters', 'Time expressions', 'Basic verb conjugation'],
          assessmentCriteria: [
            'Can use 50+ daily words correctly',
            'Can count and use numbers properly',
            'Can express time and dates',
            'Can conjugate basic verbs'
          ]
        }
      },
      basicVocabulary: { 
        threshold: 100, 
        title: 'Basic Vocabulary', 
        description: 'Expand your vocabulary with essential words and phrases for everyday communication. Start forming simple sentences.',
        prerequisite: 'dailyEssentials',
        learningGoals: [
          'Learn 100+ essential words and phrases',
          'Master basic sentence patterns',
          'Understand simple verb conjugations',
          'Learn common adjectives and adverbs'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 100,
          requiredKanji: 15,
          requiredGrammar: ['Basic verb tenses', 'Adjectives (い/な)', 'Basic adverbs'],
          assessmentCriteria: [
            'Can use 100+ words in context',
            'Can form basic sentences with correct grammar',
            'Can conjugate verbs in present and past tense',
            'Can use adjectives and adverbs correctly'
          ]
        }
      },

      // Elementary Levels
      elementaryStart: {
        threshold: 150,
        title: 'Elementary Foundation',
        description: 'Build a solid foundation of common vocabulary. Start learning kanji and more complex sentence structures.',
        prerequisite: 'basicVocabulary',
        learningGoals: [
          'Learn 150+ words including basic kanji',
          'Master basic verb conjugations',
          'Understand simple compound sentences',
          'Learn common particles and their uses'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 150,
          requiredKanji: 30,
          requiredGrammar: ['Compound sentences', 'Common particles', 'Basic verb forms'],
          assessmentCriteria: [
            'Can read and write 30+ basic kanji',
            'Can form compound sentences',
            'Can use particles correctly',
            'Can conjugate verbs in various forms'
          ]
        }
      },
      elementaryExpansion: {
        threshold: 250,
        title: 'Elementary Expansion',
        description: 'Expand your vocabulary with more everyday terms and start understanding basic grammar patterns.',
        prerequisite: 'elementaryStart',
        learningGoals: [
          'Learn 250+ words including common kanji',
          'Master past tense and negative forms',
          'Understand basic honorific language',
          'Learn common expressions and idioms'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 250,
          requiredKanji: 50,
          requiredGrammar: ['Past tense', 'Negative forms', 'Basic honorifics'],
          assessmentCriteria: [
            'Can read and write 50+ kanji',
            'Can use past and negative forms correctly',
            'Can use basic honorific language',
            'Can understand and use common expressions'
          ]
        }
      },
      elementaryMastery: {
        threshold: 350,
        title: 'Elementary Mastery',
        description: 'Master a wide range of elementary vocabulary and start understanding more complex language patterns.',
        prerequisite: 'elementaryExpansion',
        learningGoals: [
          'Learn 350+ words with kanji compounds',
          'Master various verb forms and tenses',
          'Understand basic conditional expressions',
          'Learn to express opinions and preferences'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 350,
          requiredKanji: 80,
          requiredGrammar: ['Conditional forms', 'Various verb forms', 'Opinion expressions'],
          assessmentCriteria: [
            'Can read and write 80+ kanji',
            'Can use various verb forms correctly',
            'Can express conditions and opinions',
            'Can understand basic compound sentences'
          ]
        }
      },

      // Intermediate Levels
      intermediateStart: {
        threshold: 450,
        title: 'Intermediate Beginning',
        description: 'Start building intermediate vocabulary and understanding more complex grammar structures.',
        prerequisite: 'elementaryMastery',
        learningGoals: [
          'Learn 450+ words including intermediate kanji',
          'Master complex verb forms',
          'Understand passive and causative forms',
          'Learn to express hypothetical situations'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 450,
          requiredKanji: 120,
          requiredGrammar: ['Passive voice', 'Causative forms', 'Hypothetical expressions'],
          assessmentCriteria: [
            'Can read and write 120+ kanji',
            'Can use passive and causative forms',
            'Can express hypothetical situations',
            'Can understand intermediate grammar patterns'
          ]
        }
      },
      intermediateCore: {
        threshold: 600,
        title: 'Intermediate Core',
        description: 'Develop a strong intermediate vocabulary base and start understanding nuanced expressions.',
        prerequisite: 'intermediateStart',
        learningGoals: [
          'Learn 600+ words with kanji compounds',
          'Master honorific and humble language',
          'Understand complex sentence structures',
          'Learn to express abstract concepts'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 600,
          requiredKanji: 180,
          requiredGrammar: ['Honorific language', 'Complex sentences', 'Abstract expressions'],
          assessmentCriteria: [
            'Can read and write 180+ kanji',
            'Can use honorific and humble language',
            'Can form complex sentences',
            'Can express abstract ideas'
          ]
        }
      },
      intermediateAdvanced: {
        threshold: 750,
        title: 'Advanced Intermediate',
        description: 'Expand into more complex vocabulary and start understanding subtle language nuances.',
        prerequisite: 'intermediateCore',
        learningGoals: [
          'Learn 750+ words including advanced kanji',
          'Master formal and informal speech',
          'Understand complex grammatical patterns',
          'Learn to express emotions and attitudes'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 750,
          requiredKanji: 250,
          requiredGrammar: ['Formal/informal speech', 'Complex patterns', 'Emotional expressions'],
          assessmentCriteria: [
            'Can read and write 250+ kanji',
            'Can switch between formal and informal speech',
            'Can use complex grammatical patterns',
            'Can express emotions and attitudes'
          ]
        }
      },

      // Upper Intermediate Levels
      upperIntermediateStart: {
        threshold: 900,
        title: 'Upper Intermediate Start',
        description: 'Begin upper intermediate vocabulary and start understanding sophisticated language patterns.',
        prerequisite: 'intermediateAdvanced',
        learningGoals: [
          'Learn 900+ words with complex kanji',
          'Master advanced verb forms',
          'Understand literary expressions',
          'Learn to express abstract ideas'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 900,
          requiredKanji: 350,
          requiredGrammar: ['Advanced verb forms', 'Literary expressions', 'Abstract concepts'],
          assessmentCriteria: [
            'Can read and write 350+ kanji',
            'Can use advanced verb forms',
            'Can understand literary expressions',
            'Can express abstract ideas'
          ]
        }
      },
      upperIntermediateCore: {
        threshold: 1100,
        title: 'Upper Intermediate Core',
        description: 'Build a comprehensive upper intermediate vocabulary and understand nuanced expressions.',
        prerequisite: 'upperIntermediateStart',
        learningGoals: [
          'Learn 1100+ words including rare kanji',
          'Master complex honorific language',
          'Understand formal writing styles',
          'Learn to express complex thoughts'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 1100,
          requiredKanji: 450,
          requiredGrammar: ['Complex honorifics', 'Formal writing', 'Complex thoughts'],
          assessmentCriteria: [
            'Can read and write 450+ kanji',
            'Can use complex honorific language',
            'Can write in formal style',
            'Can express complex thoughts'
          ]
        }
      },
      upperIntermediateMastery: {
        threshold: 1300,
        title: 'Upper Intermediate Mastery',
        description: 'Master upper intermediate vocabulary and start approaching advanced language proficiency.',
        prerequisite: 'upperIntermediateCore',
        learningGoals: [
          'Learn 1300+ words with advanced compounds',
          'Master literary and formal expressions',
          'Understand subtle language nuances',
          'Learn to express complex relationships'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 1300,
          requiredKanji: 550,
          requiredGrammar: ['Literary expressions', 'Formal language', 'Complex relationships'],
          assessmentCriteria: [
            'Can read and write 550+ kanji',
            'Can use literary expressions',
            'Can understand subtle nuances',
            'Can express complex relationships'
          ]
        }
      },

      // Advanced Levels
      advancedStart: {
        threshold: 1500,
        title: 'Advanced Beginning',
        description: 'Start learning advanced vocabulary and understanding sophisticated language patterns.',
        prerequisite: 'upperIntermediateMastery',
        learningGoals: [
          'Learn 1500+ words including specialized terms',
          'Master advanced grammatical structures',
          'Understand classical Japanese elements',
          'Learn to express complex ideas'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 1500,
          requiredKanji: 700,
          requiredGrammar: ['Advanced structures', 'Classical elements', 'Complex ideas'],
          assessmentCriteria: [
            'Can read and write 700+ kanji',
            'Can use advanced grammatical structures',
            'Can understand classical elements',
            'Can express complex ideas'
          ]
        }
      },
      advancedCore: {
        threshold: 1800,
        title: 'Advanced Core',
        description: 'Develop a strong advanced vocabulary base and understand complex language nuances.',
        prerequisite: 'advancedStart',
        learningGoals: [
          'Learn 1800+ words with specialized kanji',
          'Master advanced honorific language',
          'Understand academic writing styles',
          'Learn to express abstract concepts'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 1800,
          requiredKanji: 850,
          requiredGrammar: ['Advanced honorifics', 'Academic writing', 'Abstract concepts'],
          assessmentCriteria: [
            'Can read and write 850+ kanji',
            'Can use advanced honorific language',
            'Can write in academic style',
            'Can express abstract concepts'
          ]
        }
      },
      advancedMastery: {
        threshold: 2100,
        title: 'Advanced Mastery',
        description: 'Master advanced vocabulary and expressions, approaching near-native proficiency.',
        prerequisite: 'advancedCore',
        learningGoals: [
          'Learn 2100+ words including rare compounds',
          'Master complex literary styles',
          'Understand subtle cultural nuances',
          'Learn to express sophisticated ideas'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 2100,
          requiredKanji: 1000,
          requiredGrammar: ['Complex literary styles', 'Cultural nuances', 'Sophisticated ideas'],
          assessmentCriteria: [
            'Can read and write 1000+ kanji',
            'Can use complex literary styles',
            'Can understand cultural nuances',
            'Can express sophisticated ideas'
          ]
        }
      },

      // Expert Levels
      expertStart: {
        threshold: 2400,
        title: 'Expert Beginning',
        description: 'Begin expert-level vocabulary and start understanding highly sophisticated language patterns.',
        prerequisite: 'advancedMastery',
        learningGoals: [
          'Learn 2400+ words including expert terms',
          'Master classical Japanese elements',
          'Understand complex literary styles',
          'Learn to express nuanced meanings'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 2400,
          requiredKanji: 1200,
          requiredGrammar: ['Classical Japanese', 'Complex styles', 'Nuanced meanings'],
          assessmentCriteria: [
            'Can read and write 1200+ kanji',
            'Can understand classical Japanese',
            'Can use complex literary styles',
            'Can express nuanced meanings'
          ]
        }
      },
      expertCore: {
        threshold: 2800,
        title: 'Expert Core',
        description: 'Build comprehensive expert vocabulary and understand highly nuanced expressions.',
        prerequisite: 'expertStart',
        learningGoals: [
          'Learn 2800+ words with expert kanji',
          'Master advanced literary styles',
          'Understand cultural subtleties',
          'Learn to express complex emotions'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 2800,
          requiredKanji: 1500,
          requiredGrammar: ['Advanced literary styles', 'Cultural subtleties', 'Complex emotions'],
          assessmentCriteria: [
            'Can read and write 1500+ kanji',
            'Can use advanced literary styles',
            'Can understand cultural subtleties',
            'Can express complex emotions'
          ]
        }
      },
      expertMastery: {
        threshold: 3200,
        title: 'Expert Mastery',
        description: 'Master expert-level vocabulary and approach native-like proficiency.',
        prerequisite: 'expertCore',
        learningGoals: [
          'Learn 3200+ words including rare terms',
          'Master highly formal language',
          'Understand complex cultural contexts',
          'Learn to express subtle nuances'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 3200,
          requiredKanji: 1800,
          requiredGrammar: ['Highly formal language', 'Complex contexts', 'Subtle nuances'],
          assessmentCriteria: [
            'Can read and write 1800+ kanji',
            'Can use highly formal language',
            'Can understand complex contexts',
            'Can express subtle nuances'
          ]
        }
      },

      // Mastery Levels
      masteryStart: {
        threshold: 3600,
        title: 'Mastery Beginning',
        description: 'Begin the path to vocabulary mastery with highly specialized and rare terms.',
        prerequisite: 'expertMastery',
        learningGoals: [
          'Learn 3600+ words including rare compounds',
          'Master classical Japanese',
          'Understand complex cultural references',
          'Learn to express profound ideas'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 3600,
          requiredKanji: 2100,
          requiredGrammar: ['Classical Japanese', 'Cultural references', 'Profound ideas'],
          assessmentCriteria: [
            'Can read and write 2100+ kanji',
            'Can understand classical Japanese',
            'Can understand cultural references',
            'Can express profound ideas'
          ]
        }
      },
      masteryCore: {
        threshold: 4000,
        title: 'Mastery Core',
        description: 'Develop near-native vocabulary proficiency and understand highly sophisticated language.',
        prerequisite: 'masteryStart',
        learningGoals: [
          'Learn 4000+ words with mastery-level kanji',
          'Master literary and classical styles',
          'Understand cultural depth',
          'Learn to express complex philosophies'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 4000,
          requiredKanji: 2400,
          requiredGrammar: ['Literary styles', 'Cultural depth', 'Complex philosophies'],
          assessmentCriteria: [
            'Can read and write 2400+ kanji',
            'Can use literary and classical styles',
            'Can understand cultural depth',
            'Can express complex philosophies'
          ]
        }
      },
      ultimateMastery: {
        threshold: 4500,
        title: 'Ultimate Mastery',
        description: 'Achieve complete Japanese vocabulary mastery with comprehensive understanding of the language.',
        prerequisite: 'masteryCore',
        learningGoals: [
          'Learn 4500+ words including all common terms',
          'Master all aspects of Japanese language',
          'Understand cultural and historical context',
          'Express ideas with native-like proficiency'
        ],
        successMetrics: {
          masteryThreshold: 0.85,
          requiredWords: 4500,
          requiredKanji: 2700,
          requiredGrammar: ['All aspects of Japanese', 'Cultural context', 'Native-like proficiency'],
          assessmentCriteria: [
            'Can read and write 2700+ kanji',
            'Can use all aspects of Japanese language',
            'Can understand cultural and historical context',
            'Can express ideas with native-like proficiency'
          ]
        }
      }
    };

    // Generate all milestones including future goals
    const allMilestones: LearningMilestone[] = [];

    // Add kana mastery milestone first
    const kanaWords = Object.entries(words).filter(([_, word]: [string, any]) => 
      word.category === 'hiragana' || word.category === 'katakana'
    );
    const totalKana = kanaWords.length;
    const masteredKana = kanaWords.filter(([_, word]: [string, any]) => 
      word.masteryLevel >= 5 && word.consecutiveCorrect >= 2
    ).length;

    allMilestones.push({
      id: 'kana-mastery',
      title: 'Kana Mastery',
      description: (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Master both hiragana and katakana before proceeding to vocabulary. Each kana must be answered correctly twice in a row to be considered mastered.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Progress:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hiragana: {kanaWords.filter(([_, word]: [string, any]) => 
                word.category === 'hiragana' && word.masteryLevel >= 5 && word.consecutiveCorrect >= 2
              ).length} / {kanaWords.filter(([_, word]: [string, any]) => 
                word.category === 'hiragana'
              ).length} mastered
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Katakana: {kanaWords.filter(([_, word]: [string, any]) => 
                word.category === 'katakana' && word.masteryLevel >= 5 && word.consecutiveCorrect >= 2
              ).length} / {kanaWords.filter(([_, word]: [string, any]) => 
                word.category === 'katakana'
              ).length} mastered
            </Typography>
          </Box>
        </Box>
      ),
      date: new Date(),
      type: 'milestone',
      status: masteredKana === totalKana ? 'completed' : 'in-progress',
      progress: totalKana > 0 ? (masteredKana / totalKana) * 100 : 0,
      icon: <SchoolIcon />
    });

    // Add current status milestone first
    allMilestones.push({
      id: 'current-status',
      title: 'Current Progress',
      description: (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Word Mastery
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {masteredWords}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / {totalWords} words mastered
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(masteredWords / (totalWords || 1)) * 100}
                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Learning Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
                    {learningWords}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    words in progress
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(learningWords / (totalWords || 1)) * 100}
                  color="info"
                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                mt: 1, 
                p: 1.5, 
                bgcolor: 'background.default', 
                borderRadius: 1,
                border: 1,
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Study Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Current Streak
                    </Typography>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {progress.statistics?.currentStreak || 0} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Sessions
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {sessions.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Best Streak
                    </Typography>
                    <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {progress.statistics?.bestStreak || 0} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Mastery Rate
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {totalWords ? Math.round((masteredWords / totalWords) * 100) : 0}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ),
      date: new Date(),
      type: 'milestone',
      status: 'in-progress',
      progress: (masteredWords / (totalWords || 1)) * 100,
      icon: <AutoGraphIcon />
    });

    // Add streak achievements if there's an active streak
    const currentStreak = progress.statistics?.currentStreak || 0;
    if (currentStreak > 0) {
      const streakMilestones = [
        { days: 7, title: '7-Day Streak', description: 'Maintained a consistent 7-day study streak' },
        { days: 30, title: 'Monthly Master', description: 'Achieved a 30-day study streak' },
        { days: 100, title: 'Century Streak', description: 'Reached an impressive 100-day study streak' },
        { days: 365, title: 'Year of Dedication', description: 'Maintained a study streak for an entire year' }
      ];

      streakMilestones.forEach(({ days, title, description }, index) => {
        const prerequisite = index === 0 ? 'current-status' : 
                          `streak-${streakMilestones[index - 1].days}`;
        const isCompleted = currentStreak >= days;
        const prerequisiteCompleted = !prerequisite || 
          allMilestones.find(m => m.id === prerequisite)?.status === 'completed';

        if (currentStreak >= days || (index === 0 && currentStreak > 0)) {
          allMilestones.push({
            id: `streak-${days}`,
            title,
            description,
            date: new Date(),
            type: 'achievement',
            status: isCompleted ? 'completed' : 'in-progress',
            prerequisite,
            progress: isCompleted ? 100 : (currentStreak / days) * 100,
            icon: <TrophyIcon />
          });
        }
      });
    }

    // Add learning stage milestones
    Object.entries(stages).forEach(([stageKey, stage]) => {
      const isCompleted = stageKey === 'kanaMastery' ? 
        masteredKana === totalKana : 
        masteredWords >= stage.threshold;
      const prerequisiteCompleted = !stage.prerequisite || 
        (stage.prerequisite === 'kanaMastery' ? masteredKana === totalKana :
         allMilestones.find(m => m.id === stage.prerequisite)?.status === 'completed');
      
      const status = isCompleted ? 'completed' : 
                    prerequisiteCompleted ? 'in-progress' : 'locked';

      if (isCompleted || prerequisiteCompleted || 
          (stageKey === 'gettingStarted' && totalWords === 0)) {
        let icon = <PsychologyIcon />;
        if (stageKey.includes('gettingStarted') || stageKey.includes('basic')) {
          icon = <SchoolIcon />;
        } else if (stageKey.includes('mastery') || stageKey.includes('expert')) {
          icon = <StarIcon />;
        } else if (stageKey.includes('advanced')) {
          icon = <AutoGraphIcon />;
        }

        allMilestones.push({
          id: stageKey,
          title: stage.title,
          description: (
            <>
              {stage.description}
              {stage.learningGoals && (
                <Box sx={{ mt: 1, pl: 1, borderLeft: 2, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Learning Goals:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                    {stage.learningGoals.map((goal, index) => (
                      <li key={index}>
                        <Typography variant="body2" color="text.secondary">
                          {goal}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
              {stage.successMetrics && (
                <Box sx={{ mt: 1, pl: 1, borderLeft: 2, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Success Metrics:
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      • Required Words: {stage.successMetrics.requiredWords}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Required Kanji: {stage.successMetrics.requiredKanji}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Mastery Threshold: {(stage.successMetrics.masteryThreshold * 100)}%
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Required Grammar:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                    {stage.successMetrics.requiredGrammar.map((grammar, index) => (
                      <li key={index}>
                        <Typography variant="body2" color="text.secondary">
                          {grammar}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
                    Assessment Criteria:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                    {stage.successMetrics.assessmentCriteria.map((criterion, index) => (
                      <li key={index}>
                        <Typography variant="body2" color="text.secondary">
                          {criterion}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </>
          ),
          date: new Date(),
          type: 'milestone',
          status,
          prerequisite: stage.prerequisite,
          progress: isCompleted ? 100 : (masteredWords / stage.threshold) * 100,
          icon
        });
      }
    });

    // Sort milestones by:
    // 1. Status (completed first, then in-progress, then locked)
    // 2. Stage progression
    // 3. Date
    return allMilestones.sort((a, b) => {
      const statusOrder = { 'completed': 0, 'in-progress': 1, 'locked': 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // For locked items, sort by stage progression
      if (a.status === 'locked' && b.status === 'locked') {
        const stageOrder = Object.keys(stages);
        return stageOrder.indexOf(a.id) - stageOrder.indexOf(b.id);
      }

      return a.date.getTime() - b.date.getTime();
    });
  }, [progress.words, progress.statistics?.studySessions, progress.statistics?.currentStreak]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'in-progress':
        return theme.palette.primary.main;
      case 'locked':
        return theme.palette.grey[400];
      case 'upcoming':
        return theme.palette.grey[500];
      default:
        return theme.palette.primary.main;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Paper 
      sx={{ 
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimelineIcon sx={{ fontSize: 28, mr: 1.5 }} />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Learning Path
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your personalized learning journey, showing your progress through different stages of Japanese vocabulary mastery.
      </Typography>

      <Timeline 
        position="alternate" 
        sx={{ 
          flex: 1,
          '& .MuiTimelineItem-root': {
            minHeight: '90px',
            mb: 2
          },
          '& .MuiTimelineContent-root': {
            py: 2,
            px: 3
          },
          '& .MuiTimelineDot-root': {
            width: 20,
            height: 20,
            boxShadow: 1
          },
          '& .MuiTimelineConnector-root': {
            width: 2
          }
        }}
      >
        {milestones.map((milestone, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot 
                sx={{ 
                  bgcolor: getStatusColor(milestone.status),
                  width: 20,
                  height: 20,
                  opacity: milestone.status === 'locked' ? 0.5 : 1
                }}
              >
                {milestone.icon}
              </TimelineDot>
              {index < milestones.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Paper 
                elevation={milestone.status === 'locked' ? 0 : 1}
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: milestone.status === 'completed' ? 'success.light' : 
                          milestone.status === 'in-progress' ? 'primary.light' : 
                          milestone.status === 'locked' ? 'grey.100' :
                          'background.paper',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: milestone.status === 'locked' ? 0.7 : 1,
                  '&:hover': {
                    transform: milestone.status === 'locked' ? 'none' : 'translateY(-2px)',
                    boxShadow: milestone.status === 'locked' ? 0 : 2
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="subtitle1"
                    component="h3" 
                    sx={{ 
                      flex: 1, 
                      fontWeight: 'bold',
                      color: milestone.status === 'locked' ? 'text.disabled' : 'text.primary'
                    }}
                  >
                    {milestone.title}
                    {milestone.status === 'locked' && ' 🔒'}
                  </Typography>
                  <Chip 
                    label={milestone.status} 
                    color={milestone.status === 'completed' ? 'success' : 
                           milestone.status === 'in-progress' ? 'primary' : 
                           milestone.status === 'locked' ? 'default' :
                           'default'}
                    size="small"
                    sx={{ 
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      px: 0.5,
                      height: 24,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2"
                  color={milestone.status === 'locked' ? 'text.disabled' : 'text.secondary'} 
                  sx={{ mb: 1 }}
                >
                  {milestone.description}
                  {milestone.status === 'locked' && milestone.prerequisite && (
                    <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.8em', fontStyle: 'italic' }}>
                      Complete previous milestone to unlock
                    </Box>
                  )}
                </Typography>
                {milestone.progress !== undefined && milestone.status !== 'locked' && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={milestone.progress} 
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3
                        }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {Math.round(milestone.progress)}% Complete
                    </Typography>
                  </Box>
                )}
                {milestone.date && (
                  <Typography 
                    variant="caption" 
                    color={milestone.status === 'locked' ? 'text.disabled' : 'text.secondary'} 
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {formatDate(milestone.date)}
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default LearningPath; 