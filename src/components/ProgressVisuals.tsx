import React, { useState, useEffect } from 'react';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Avatar,
  LinearProgress,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  useMediaQuery
} from '@mui/material';
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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { 
  EmojiEvents as TrophyIcon,
  Star as BadgeIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  BarChart as GraphIcon,
  CalendarToday as CalendarIcon,
  Person as AvatarIcon
} from '@mui/icons-material';
import styled from '@emotion/styled';
import CalendarHeatmap from './CalendarHeatmap';

// Styled components
const VisualCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 16px rgba(0, 247, 255, 0.2), 0 0 32px rgba(0, 247, 255, 0.1)' 
      : '0 8px 16px rgba(0, 0, 0, 0.1)'
  }
}));

const ProgressBadge = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  border: `2px solid ${theme.palette.primary.main}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.5,
    zIndex: -1
  }
}));

const TrophyContainer = styled(motion.div)({
  position: 'relative',
  width: '120px',
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    width: '100%',
    height: '20px',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 80%)',
    filter: 'blur(5px)'
  }
});

const HeatmapContainer = styled('div')({
  width: '100%',
  height: '200px',
  overflowX: 'auto',
  padding: '1rem'
});

const TimelineContainer = styled('div')({
  width: '100%',
  maxHeight: '400px',
  overflowY: 'auto',
  padding: '1rem'
});

const GraphContainer = styled('div')({
  width: '100%',
  height: '300px',
  padding: '1rem'
});

const AvatarContainer = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  width: '120px',
  height: '120px',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.5,
    zIndex: -1
  }
}));

// Animation variants
const badgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  hover: { 
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const trophyVariants = {
  initial: { y: 50, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  hover: { 
    y: -10,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const ProgressVisuals: React.FC = () => {
  const { isDarkMode, getThemeClasses } = useCustomTheme();
  const muiTheme = useMuiTheme();
  const { progress, currentStreak, bestStreak } = useProgress();
  const { achievements, unlockedAchievements } = useAchievements();
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isNeonMode = muiTheme.palette.mode === 'dark' && muiTheme.palette.primary.main === '#00f7ff';

  // Generate heatmap data
  const generateHeatmapData = () => {
    const today = new Date();
    const startDate = subDays(today, 365);
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    return days.map(date => {
      const dayProgress = Object.values(progress).filter(p => 
        isSameDay(new Date(p.lastAttempted), date)
      );
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        value: dayProgress.length,
        count: dayProgress.reduce((acc, p) => acc + p.correct + p.incorrect, 0)
      };
    });
  };

  // Generate timeline data
  const generateTimelineData = () => {
    const timelineEvents = [
      ...Object.values(progress).map(p => ({
        date: new Date(p.lastAttempted),
        type: 'progress',
        title: `${p.section} Progress`,
        description: `Completed ${p.correct} correct and ${p.incorrect} incorrect answers`
      })),
      ...unlockedAchievements.map(a => ({
        date: new Date(a.unlockedAt),
        type: 'achievement',
        title: `Unlocked: ${a.title}`,
        description: a.description
      }))
    ].filter(event => !isNaN(event.date.getTime()))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return timelineEvents;
  };

  // Generate graph data
  const generateGraphData = () => {
    const categories = ['vocabulary', 'kanji', 'grammar'];
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    return last30Days.map(date => {
      const dayData: any = { date: format(date, 'MM/dd') };
      categories.forEach(category => {
        const categoryProgress = Object.values(progress).filter(p => 
          p.section === category && isSameDay(new Date(p.lastAttempted), date)
        );
        dayData[category] = categoryProgress.reduce((acc, p) => acc + p.correct, 0);
      });
      return dayData;
    });
  };

  // Generate avatar level based on progress
  const calculateAvatarLevel = () => {
    const totalProgress = Object.values(progress).reduce((acc, p) => acc + p.correct, 0);
    return Math.floor(totalProgress / 100) + 1;
  };

  const avatarLevel = calculateAvatarLevel();
  const heatmapData = generateHeatmapData();
  const timelineData = generateTimelineData();
  const graphData = generateGraphData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            color: isNeonMode ? 'rgba(0, 247, 255, 0.7)' : undefined,
            '&.Mui-selected': {
              color: isNeonMode ? '#00f7ff' : undefined,
              textShadow: isNeonMode ? '0 0 8px #00f7ff' : undefined
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: isNeonMode ? '#00f7ff' : undefined,
            boxShadow: isNeonMode ? '0 0 8px #00f7ff' : undefined
          }
        }}
      >
        <Tab icon={<BadgeIcon />} label="Badges" />
        <Tab icon={<TrophyIcon />} label="Trophies" />
        <Tab icon={<CalendarIcon />} label="Heatmap" />
        <Tab icon={<TimelineIcon />} label="Timeline" />
        <Tab icon={<GraphIcon />} label="Graphs" />
        <Tab icon={<AvatarIcon />} label="Avatar" />
      </Tabs>

      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Grid container spacing={3}>
              {achievements.map((achievement, index) => (
                <Grid item xs={6} sm={4} md={3} key={achievement.id}>
                  <Tooltip title={achievement.description}>
                    <ProgressBadge
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      custom={index}
                    >
                      <Typography variant="h4">
                        {achievement.icon}
                      </Typography>
                      {achievement.unlockedAt && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <BadgeIcon color="primary" />
                        </motion.div>
                      )}
                    </ProgressBadge>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Grid container spacing={3} justifyContent="center">
              {['bronze', 'silver', 'gold', 'platinum'].map((tier, index) => {
                const tierAchievements = achievements.filter(a => a.tier === tier);
                const unlockedCount = tierAchievements.filter(a => a.unlockedAt).length;
                
                return (
                  <Grid item xs={6} sm={3} key={tier}>
                    <TrophyContainer
                      variants={trophyVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      custom={index}
                    >
                      <VisualCard>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h1" sx={{ mb: 1 }}>
                            {tier === 'bronze' ? '🥉' : 
                             tier === 'silver' ? '🥈' : 
                             tier === 'gold' ? '🥇' : '🏆'}
                          </Typography>
                          <Typography variant="h6" gutterBottom>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {unlockedCount} / {tierAchievements.length}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(unlockedCount / tierAchievements.length) * 100}
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </VisualCard>
                    </TrophyContainer>
                  </Grid>
                );
              })}
            </Grid>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <HeatmapContainer>
              <CalendarHeatmap
                data={heatmapData}
                startDate={subDays(new Date(), 365)}
                endDate={new Date()}
              />
            </HeatmapContainer>
          </motion.div>
        )}

        {activeTab === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TimelineContainer>
              <Timeline>
                {timelineData.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      {format(event.date, 'MMM d, yyyy')}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={event.type === 'achievement' ? 'primary' : 'grey'}>
                        {event.type === 'achievement' ? <TrophyIcon /> : <BadgeIcon />}
                      </TimelineDot>
                      {index < timelineData.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="h6">{event.title}</Typography>
                      <Typography>{event.description}</Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </TimelineContainer>
          </motion.div>
        )}

        {activeTab === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <VisualCard>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        color: isNeonMode ? '#00f7ff' : undefined,
                        textShadow: isNeonMode ? '0 0 8px #00f7ff' : undefined
                      }}
                    >
                      Daily Progress (Last 30 Days)
                    </Typography>
                    <GraphContainer>
                      <ResponsiveContainer>
                        <LineChart data={graphData}>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={isNeonMode ? 'rgba(0, 247, 255, 0.2)' : undefined}
                          />
                          <XAxis 
                            dataKey="date" 
                            stroke={isNeonMode ? '#00f7ff' : undefined}
                          />
                          <YAxis 
                            stroke={isNeonMode ? '#00f7ff' : undefined}
                          />
                          <RechartsTooltip 
                            contentStyle={isNeonMode ? {
                              backgroundColor: 'rgba(10, 10, 35, 0.9)',
                              border: '1px solid #00f7ff',
                              boxShadow: '0 0 16px rgba(0, 247, 255, 0.2)'
                            } : undefined}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="vocabulary" 
                            stroke={isNeonMode ? '#00f7ff' : '#8884d8'}
                            strokeWidth={isNeonMode ? 2 : 1}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="kanji" 
                            stroke={isNeonMode ? '#ff3afc' : '#82ca9d'}
                            strokeWidth={isNeonMode ? 2 : 1}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="grammar" 
                            stroke={isNeonMode ? '#9c00ff' : '#ffc658'}
                            strokeWidth={isNeonMode ? 2 : 1}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </GraphContainer>
                  </CardContent>
                </VisualCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <VisualCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Achievement Distribution
                    </Typography>
                    <GraphContainer>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Bronze', value: achievements.filter(a => a.tier === 'bronze' && a.unlockedAt).length },
                              { name: 'Silver', value: achievements.filter(a => a.tier === 'silver' && a.unlockedAt).length },
                              { name: 'Gold', value: achievements.filter(a => a.tier === 'gold' && a.unlockedAt).length },
                              { name: 'Platinum', value: achievements.filter(a => a.tier === 'platinum' && a.unlockedAt).length }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </GraphContainer>
                  </CardContent>
                </VisualCard>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeTab === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <AvatarContainer
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Avatar
                    sx={{
                      width: '100%',
                      height: '100%',
                      fontSize: '3rem',
                      bgcolor: 'primary.main'
                    }}
                  >
                    {avatarLevel}
                  </Avatar>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  >
                    <Typography variant="h6" align="center">
                      Level {avatarLevel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {currentStreak} day streak
                    </Typography>
                  </motion.div>
                </AvatarContainer>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ProgressVisuals; 