import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface LearningStats {
  date: string;
  mastered: number;
  attempted: number;
  accuracy: number;
}

interface ProgressData {
  [key: string]: LearningStats[];
}

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const LearningProgress: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { progress } = useProgress();
  const [stats, setStats] = useState<ProgressData>({
    hiragana: [],
    katakana: [],
    kanji: []
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const processProgressData = () => {
      const now = new Date();
      const ranges = {
        week: 7,
        month: 30,
        year: 365
      };
      const days = ranges[timeRange];
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const newStats: ProgressData = {
        hiragana: [],
        katakana: [],
        kanji: []
      };

      // Generate date range
      const dates: string[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Process data for each mode
      ['hiragana', 'katakana', 'kanji'].forEach(mode => {
        const modeProgress = progress[mode];
        if (!modeProgress) {
          newStats[mode] = dates.map(date => ({
            date,
            mastered: 0,
            attempted: 0,
            accuracy: 0
          }));
          return;
        }

        // Calculate daily stats
        const dailyStats = dates.map(date => {
          const mastered = modeProgress.masteredIds?.size || 0;
          const attempted = modeProgress.totalQuestions || 0;
          const accuracy = modeProgress.totalQuestions > 0
            ? (modeProgress.correctAnswers / modeProgress.totalQuestions) * 100
            : 0;

          return {
            date,
            mastered,
            attempted,
            accuracy
          };
        });

        newStats[mode] = dailyStats;
      });

      setStats(newStats);
    };

    processProgressData();
  }, [progress, timeRange]);

  const renderLineChart = (mode: string, data: LearningStats[]) => (
    <div className="h-64 mb-8">
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-text-primary dark:text-text-dark-primary' : 'text-gray-800'}`}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)} Progress
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4a5568' : '#e2e8f0'} />
          <XAxis 
            dataKey="date" 
            stroke={isDarkMode ? '#a0aec0' : '#4a5568'}
            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke={isDarkMode ? '#a0aec0' : '#4a5568'} />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
              color: isDarkMode ? '#ffffff' : '#2d3748'
            }}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="mastered" 
            name="Mastered Items" 
            stroke="#0088FE" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="attempted" 
            name="Attempted Today" 
            stroke="#00C49F" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            name="Accuracy %" 
            stroke="#FFBB28" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPieChart = () => {
    const data: PieChartData[] = [
      {
        name: 'Hiragana',
        value: stats.hiragana[stats.hiragana.length - 1]?.mastered || 0
      },
      {
        name: 'Katakana',
        value: stats.katakana[stats.katakana.length - 1]?.mastered || 0
      },
      {
        name: 'Kanji',
        value: stats.kanji[stats.kanji.length - 1]?.mastered || 0
      }
    ];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieChartLabelProps) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill={isDarkMode ? '#ffffff' : '#000000'}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <div className="h-64">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-text-primary dark:text-text-dark-primary' : 'text-gray-800'}`}>
          Mastery Distribution
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
                color: isDarkMode ? '#ffffff' : '#2d3748'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-text-primary dark:text-text-dark-primary' : 'text-gray-800'}`}>
          Learning Progress
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
          className={`px-4 py-2 rounded-nav border ${
            isDarkMode 
              ? 'bg-gray-700 text-text-primary dark:text-text-dark-primary border-gray-600' 
              : 'bg-white dark:bg-dark-elevated text-gray-800 border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium'
          } focus:outline-none focus:ring-2 focus:ring-japanese-red`}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="space-y-8">
        {renderLineChart('hiragana', stats.hiragana)}
        {renderLineChart('katakana', stats.katakana)}
        {renderLineChart('kanji', stats.kanji)}
        {renderPieChart()}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['hiragana', 'katakana', 'kanji'].map(mode => {
          const latest = stats[mode][stats[mode].length - 1];
          return (
            <div
              key={mode}
              className={`p-4 rounded-nav ${
                isDarkMode ? 'bg-gray-800' : 'bg-white dark:bg-dark-elevated'
              } shadow-card dark:shadow-dark-card`}
            >
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-text-primary dark:text-text-dark-primary' : 'text-gray-800'
              }`}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Summary
              </h3>
              <div className="space-y-2">
                <p className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-muted dark:text-text-dark-muted'}>
                  Mastered Items: {latest?.mastered || 0}
                </p>
                <p className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-muted dark:text-text-dark-muted'}>
                  Attempted Today: {latest?.attempted || 0}
                </p>
                <p className={isDarkMode ? 'text-text-secondary dark:text-text-dark-secondary' : 'text-text-muted dark:text-text-dark-muted'}>
                  Accuracy: {latest?.accuracy.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningProgress; 