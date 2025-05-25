import React from 'react';
import { format, startOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { Box, Tooltip, useTheme } from '@mui/material';

interface CalendarHeatmapProps {
  data: Array<{
    date: string;
    value: number;
    count?: number;
  }>;
  startDate: Date;
  endDate: Date;
  colorScale?: (value: number) => string;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data,
  startDate,
  endDate,
  colorScale = (value) => {
    if (value === 0) return '#ebedf0';
    if (value < 3) return '#9be9a8';
    if (value < 6) return '#40c463';
    if (value < 9) return '#30a14e';
    return '#216e39';
  }
}) => {
  const theme = useTheme();
  const weeks = [];
  let currentDate = startOfWeek(startDate);
  
  while (currentDate <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentDate, i);
      const dayData = data.find(d => isSameDay(new Date(d.date), day));
      const value = dayData?.value || 0;
      
      week.push({
        date: day,
        value,
        count: dayData?.count || 0
      });
    }
    weeks.push(week);
    currentDate = addDays(currentDate, 7);
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2px',
      width: '100%',
      overflowX: 'auto'
    }}>
      {weeks.map((week, weekIndex) => (
        <Box key={weekIndex} sx={{ display: 'flex', gap: '2px' }}>
          {week.map((day, dayIndex) => {
            const isCurrentMonth = isSameMonth(day.date, new Date());
            return (
              <Tooltip
                key={dayIndex}
                title={`${format(day.date, 'MMM d, yyyy')}: ${day.value} activities (${day.count} total)`}
                arrow
              >
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: colorScale(day.value),
                    borderRadius: '2px',
                    opacity: isCurrentMonth ? 1 : 0.5,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.2)',
                      zIndex: 1
                    }
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default CalendarHeatmap; 