import React from 'react';
import {
  Paper,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays, subMonths, subYears, isWithinInterval } from 'date-fns';
import type { DailyProgress } from '../../../types/progress';

interface DailyProgressChartProps {
  data: { [date: string]: DailyProgress };
  timeRange: 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'year') => void;
}

export const DailyProgressChart: React.FC<DailyProgressChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange
}) => {
  const theme = useTheme();

  const getDateRange = () => {
    const end = new Date();
    let start: Date;

    switch (timeRange) {
      case 'week':
        start = subDays(end, 7);
        break;
      case 'month':
        start = subMonths(end, 1);
        break;
      case 'year':
        start = subYears(end, 1);
        break;
      default:
        start = subDays(end, 7);
    }

    return { start, end };
  };

  const getChartData = () => {
    const { start, end } = getDateRange();
    const chartData: any[] = [];

    // Create a map of all dates in the range
    const dateMap = new Map<string, any>();
    let currentDate = start;
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dateMap.set(dateStr, {
        date: format(currentDate, 'MMM d'),
        wordsStudied: 0,
        timeSpent: 0,
        accuracy: 0,
        masteryGained: 0
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Fill in actual data
    Object.entries(data).forEach(([date, progress]) => {
      if (isWithinInterval(new Date(date), { start, end })) {
        dateMap.set(date, {
          date: format(new Date(date), 'MMM d'),
          wordsStudied: progress.wordsStudied,
          timeSpent: progress.timeSpent / 60, // Convert to minutes
          accuracy: progress.accuracy * 100, // Convert to percentage
          masteryGained: progress.masteryGained * 100 // Convert to percentage
        });
      }
    });

    return Array.from(dateMap.values());
  };

  const chartData = getChartData();

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Daily Progress
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, value) => value && onTimeRangeChange(value)}
          size="small"
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              yAxisId="left"
              stroke={theme.palette.primary.main}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={theme.palette.secondary.main}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wordsStudied"
              name="Words Studied"
              stroke={theme.palette.primary.main}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="timeSpent"
              name="Study Time (min)"
              stroke={theme.palette.secondary.main}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              name="Accuracy (%)"
              stroke={theme.palette.success.main}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="masteryGained"
              name="Mastery Gained (%)"
              stroke={theme.palette.warning.main}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}; 