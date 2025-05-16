import React, { useState, useEffect } from 'react';
import { useWordLevel } from '../context/WordLevelContext';
import { JapaneseWord, wordLevels, WordLevel, UserProgress, calculateWordMastery, getWordsForLevel } from '../data/wordLevels';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Checkbox,
  Tab,
  Tabs
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle as CheckCircleIconLucide, Lock as LockIconLucide, AlertTriangle as AlertIcon } from 'lucide-react';
import { playAudio, playDynamicAudio } from '../utils/audio';

interface WordLevelManagerProps {
  userProgress: UserProgress;
  onLevelUp: (newLevel: number) => void;
}

const WordLevelManager: React.FC<WordLevelManagerProps> = ({
  userProgress,
  onLevelUp,
}) => {
  const {
    currentLevel,
    unlockedLevels,
    settings,
    updateSettings,
    unlockLevel,
    getLevelProgress,
    getWordProgress,
    getLevelRequirements,
    canAdvanceToNextLevel
  } = useWordLevel();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWordDetails, setShowWordDetails] = useState<JapaneseWord | null>(null);
  const [currentLevelData, setCurrentLevelData] = useState<WordLevel | null>(null);
  const [wordMastery, setWordMastery] = useState<{
    masteredWords: number;
    totalWords: number;
    masteryPercentage: number;
    meetsRequirements: boolean;
  }>({
    masteredWords: 0,
    totalWords: 0,
    masteryPercentage: 0,
    meetsRequirements: false
  });
  const [activeTab, setActiveTab] = useState<'words' | 'practice' | 'exam'>('words');

  useEffect(() => {
    // Get current level data
    const level = wordLevels.find(l => l.level === userProgress.currentLevel);
    if (level) {
      setCurrentLevelData(level);
      // Calculate word mastery
      const mastery = calculateWordMastery(level.level, userProgress);
      setWordMastery(mastery);
    }
  }, [userProgress]);

  const handleLevelClick = (level: number) => {
    if (unlockedLevels.includes(level)) {
      setSelectedLevel(level);
    }
  };

  const handleUnlockLevel = (level: number) => {
    unlockLevel(level);
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleWordClick = (word: JapaneseWord) => {
    setShowWordDetails(word);
  };

  const canAdvanceLevel = () => {
    if (!currentLevelData) return false;
    
    // Check if all requirements are met
    const allRequirementsMet = currentLevelData.requirements.every(req => req.completed);
    
    // Check word mastery requirements
    const meetsWordMastery = wordMastery.meetsRequirements;
    
    return allRequirementsMet && meetsWordMastery;
  };

  const handleLevelUp = () => {
    if (canAdvanceLevel() && currentLevelData) {
      onLevelUp(currentLevelData.level + 1);
    }
  };

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  const renderLevelRequirements = (level: number) => {
    const requirements = getLevelRequirements(level);
    if (!requirements.length) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Level Requirements
        </Typography>
        <Stack spacing={1}>
          {requirements.map((req, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={req.completed}
                disabled
                sx={{ '&.Mui-disabled': { color: req.completed ? 'success.main' : 'action.disabled' } }}
              />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {req.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {req.current} / {req.target}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  const renderLevelCard = (level: number) => {
    const levelData = wordLevels.find(l => l.level === level);
    const levelProgress = getLevelProgress(level);
    const isUnlocked = unlockedLevels.includes(level);
    const isCompleted = levelProgress?.completed;
    const canAdvance = canAdvanceToNextLevel(level);

    if (!levelData || !levelProgress) return null;

    const progress = (levelProgress.wordsMastered / levelProgress.totalWords) * 100;

    return (
      <Card
        key={level}
        sx={{
          mb: 2,
          cursor: isUnlocked ? 'pointer' : 'default',
          opacity: isUnlocked ? 1 : 0.7,
          position: 'relative',
          '&:hover': {
            boxShadow: isUnlocked ? 3 : 1
          }
        }}
        onClick={() => handleLevelClick(level)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Level {level}
            </Typography>
            {isCompleted && (
              <Tooltip title="Level Completed">
                <CheckCircleIcon color="success" />
              </Tooltip>
            )}
            {!isUnlocked && (
              <Tooltip title="Level Locked">
                <LockIcon color="action" />
              </Tooltip>
            )}
            {isUnlocked && !isCompleted && (
              <Tooltip title="Level Unlocked">
                <LockOpenIcon color="primary" />
              </Tooltip>
            )}
          </Box>

          <Typography color="text.secondary" gutterBottom>
            {levelData.description}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {levelProgress.wordsMastered} / {levelProgress.totalWords} words
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 1, height: 8, borderRadius: 4 }}
            />
          </Box>

          {renderLevelRequirements(level)}

          {!isUnlocked && canAdvance && (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                unlockLevel(level + 1);
              }}
              sx={{ mt: 2 }}
            >
              Unlock Next Level
            </Button>
          )}

          {!isUnlocked && !canAdvance && (
            <Button
              variant="outlined"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleUnlockLevel(level);
              }}
              sx={{ mt: 2 }}
            >
              Unlock Level
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWordList = (level: number) => {
    const levelData = wordLevels.find(l => l.level === level);
    if (!levelData) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Words in Level {level}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {levelData.words.map((word) => {
            const wordProgress = getWordProgress(word.id);
            const isMastered = wordProgress?.mastered;

            return (
              <Box key={word.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                    border: isMastered ? '2px solid #4caf50' : 'none'
                  }}
                  onClick={() => handleWordClick(word)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {word.japanese}
                      </Typography>
                      {isMastered && (
                        <Tooltip title="Word Mastered">
                          <StarIcon color="primary" />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography color="text.secondary">
                      {word.english}
                    </Typography>
                    {settings.showRomaji && (
                      <Typography variant="body2" color="text.secondary">
                        {word.romaji}
                      </Typography>
                    )}
                    {wordProgress && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={`${wordProgress.correctAttempts} correct`}
                          color="success"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={`${wordProgress.incorrectAttempts} incorrect`}
                          color="error"
                        />
                      </Box>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(word.japanese);
                      }}
                      className="ml-2 p-2 rounded-full hover:bg-opacity-10"
                      title="Play Audio"
                    >
                      🔊
                    </button>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderWordDetails = (word: JapaneseWord) => {
    const wordProgress = getWordProgress(word.id);

    return (
      <Dialog
        open={!!showWordDetails}
        onClose={() => setShowWordDetails(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {word.japanese}
            </Typography>
            {wordProgress?.mastered && (
              <Tooltip title="Word Mastered">
                <StarIcon color="primary" />
              </Tooltip>
            )}
            <Chip
              label={word.difficulty}
              color={
                word.difficulty === 'beginner' ? 'success' :
                word.difficulty === 'intermediate' ? 'warning' :
                'error'
              }
              size="small"
            />
            {word.jlptLevel && (
              <Chip
                label={word.jlptLevel}
                color="primary"
                size="small"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Basic Information
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>English:</strong> {word.english}
                </Typography>
                {settings.showRomaji && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Romaji:</strong> {word.romaji}
                  </Typography>
                )}
                {settings.showHiragana && word.hiragana && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Hiragana:</strong> {word.hiragana}
                  </Typography>
                )}
                {settings.showKanji && word.kanji && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Kanji:</strong> {word.kanji}
                  </Typography>
                )}
                <Typography variant="body1" gutterBottom>
                  <strong>Category:</strong> {word.category}
                </Typography>
              </Box>
            </Box>

            {/* Example Sentences */}
            {word.examples && word.examples.length > 0 && (
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Example Sentences
                </Typography>
                <Stack spacing={2}>
                  {word.examples.map((example, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="body1" gutterBottom>
                        {example.japanese}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {example.romaji}
                      </Typography>
                      <Typography variant="body1">
                        {example.english}
                      </Typography>
                      {example.notes && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, fontStyle: 'italic' }}
                        >
                          Note: {example.notes}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Notes */}
            {word.notes && (
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Additional Notes
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">{word.notes}</Typography>
                </Box>
              </Box>
            )}

            {/* Progress */}
            {wordProgress && (
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Learning Progress
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={`${wordProgress.correctAttempts} correct`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`${wordProgress.incorrectAttempts} incorrect`}
                      color="error"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Last practiced: {new Date(wordProgress.lastPracticed).toLocaleDateString()}
                  </Typography>
                  {wordProgress.mastered && (
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <StarIcon fontSize="small" />
                      Word Mastered
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWordDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderSettings = () => (
    <Dialog
      open={settingsOpen}
      onClose={handleSettingsToggle}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Word Level Settings
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoUnlock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings({ autoUnlock: e.target.checked })}
              />
            }
            label="Auto-unlock next level upon completion"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showRomaji}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings({ showRomaji: e.target.checked })}
              />
            }
            label="Show Romaji"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showHiragana}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings({ showHiragana: e.target.checked })}
              />
            }
            label="Show Hiragana"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showKanji}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings({ showKanji: e.target.checked })}
              />
            }
            label="Show Kanji"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSettingsToggle}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  if (!currentLevelData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Japanese Word Levels
        </Typography>
        <Tooltip title="Settings">
          <IconButton onClick={handleSettingsToggle}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Typography variant="h6" gutterBottom>
            Available Levels
          </Typography>
          {wordLevels.map((level) => renderLevelCard(level.level))}
        </Box>
        <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
          {selectedLevel && (
            <>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ mb: 2 }}
              >
                <Tab label="Words" value="words" />
                <Tab label="Practice" value="practice" />
                <Tab label="Exam" value="exam" />
              </Tabs>
              {activeTab === 'words' && renderWordList(selectedLevel)}
              {activeTab === 'practice' && (
                <Box sx={{ p: 2 }}>
                  {/* Practice component or logic here */}
                  <Typography>Practice mode coming soon!</Typography>
                </Box>
              )}
              {activeTab === 'exam' && (
                <Box sx={{ p: 2 }}>
                  {/* Exam UI scaffold */}
                  {/* ExamSection component removed */}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {showWordDetails && renderWordDetails(showWordDetails)}
      {renderSettings()}

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Level {currentLevelData.level}</h2>
          {currentLevelData.unlocked ? (
            <span className="text-green-500 flex items-center gap-2">
              <CheckCircleIconLucide className="w-5 h-5" />
              Unlocked
            </span>
          ) : (
            <span className="text-yellow-500 flex items-center gap-2">
              <LockIconLucide className="w-5 h-5" />
              Locked
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Word Mastery Progress</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Mastered Words: {wordMastery.masteredWords}/{wordMastery.totalWords}</span>
              <span>{wordMastery.masteryPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={wordMastery.masteryPercentage} 
              className={wordMastery.meetsRequirements ? "bg-green-100" : "bg-yellow-100"}
            />
            <p className="text-sm text-gray-600">
              Required: {currentLevelData.requiredWordMastery.minWords} words and {currentLevelData.requiredWordMastery.masteryThreshold}% mastery
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Level Requirements</h3>
          <div className="space-y-2">
            {currentLevelData.requirements.map((req, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{req.description}</span>
                <span className={`text-sm ${req.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                  {req.current}/{req.target}
                </span>
              </div>
            ))}
          </div>
        </div>

        {!canAdvanceLevel() && (
          <Alert variant="warning">
            <AlertIcon className="h-4 w-4" />
            <AlertTitle>Requirements Not Met</AlertTitle>
            <AlertDescription>
              {!wordMastery.meetsRequirements ? (
                <p>You need to master more words before advancing to the next level.</p>
              ) : (
                <p>Complete all level requirements to advance.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleLevelUp}
          disabled={!canAdvanceLevel()}
          className="w-full"
          variant={canAdvanceLevel() ? "contained" : "outlined"}
        >
          {canAdvanceLevel() ? "Advance to Next Level" : "Requirements Not Met"}
        </Button>
      </Card>
    </Box>
  );
};

export default WordLevelManager; 