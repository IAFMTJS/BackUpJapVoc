import React, { useEffect, useRef } from 'react';
import { WordCloudVisualization, WordCloudOptions } from '../utils/wordCloudVisualization';
import { DictionaryItem } from '../types/dictionary';

interface WordCloudProps {
  data: DictionaryItem[];
  options?: Partial<WordCloudOptions>;
  width?: number;
  height?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ 
  data, 
  options = {}, 
  width = 800, 
  height = 600 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<WordCloudVisualization | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create visualization instance
    visualizationRef.current = new WordCloudVisualization(
      containerRef.current,
      data.map(item => ({
        word: 'japanese' in item ? item.japanese : item.character,
        weight: item.frequency?.rank || 1,
        relationships: 0, // This will be updated when relationships are available
        category: item.category,
        level: item.level,
        mastery: item.mastery?.level
      })),
      {
        width,
        height,
        ...options
      }
    );

    // Cleanup
    return () => {
      if (visualizationRef.current) {
        visualizationRef.current.destroy();
        visualizationRef.current = null;
      }
    };
  }, [data, options, width, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (visualizationRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        visualizationRef.current.resize(containerWidth, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: `${height}px`,
        position: 'relative'
      }}
    />
  );
};

export default WordCloud; 