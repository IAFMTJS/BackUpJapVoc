import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { DictionaryItem, WordRelationship } from '../types/dictionary';

interface WordCloudItem {
  word: string;
  weight: number;
  relationships: number;
  category?: string;
  level?: number;
  mastery?: number;
  x?: number;
  y?: number;
  rotation?: number;
}

interface WordCloudOptions {
  width: number;
  height: number;
  padding: number;
  fontSize: {
    min: number;
    max: number;
  };
  colors: {
    background: string;
    text: string[];
    highlight: string;
  };
  rotation: {
    enabled: boolean;
    angles: number[];
  };
  animation: {
    enabled: boolean;
    duration: number;
  };
  tooltip: {
    enabled: boolean;
    offset: number;
  };
}

const DEFAULT_OPTIONS: WordCloudOptions = {
  width: 800,
  height: 600,
  padding: 5,
  fontSize: {
    min: 12,
    max: 60
  },
  colors: {
    background: '#ffffff',
    text: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
    highlight: '#ff0000'
  },
  rotation: {
    enabled: true,
    angles: [-90, -45, 0, 45, 90]
  },
  animation: {
    enabled: true,
    duration: 1000
  },
  tooltip: {
    enabled: true,
    offset: 10
  }
};

export class WordCloudVisualization {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  private options: WordCloudOptions;
  private data: WordCloudItem[];
  private layout: d3.CloudLayout<WordCloudItem>;
  private words: d3.Selection<SVGGElement, WordCloudItem, SVGGElement, unknown>;

  constructor(
    container: HTMLElement,
    data: WordCloudItem[],
    options: Partial<WordCloudOptions> = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.data = this.normalizeData(data);

    // Create SVG container
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .append('g')
      .attr('transform', `translate(${this.options.width / 2},${this.options.height / 2})`);

    // Create tooltip
    if (this.options.tooltip.enabled) {
      this.tooltip = d3.select(container)
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '14px')
        .style('pointer-events', 'none');
    }

    // Initialize cloud layout
    this.layout = cloud<WordCloudItem>()
      .size([this.options.width, this.options.height])
      .words(this.data)
      .padding(this.options.padding)
      .rotate(() => this.options.rotation.enabled
        ? this.options.rotation.angles[Math.floor(Math.random() * this.options.rotation.angles.length)]
        : 0)
      .font('Arial')
      .fontSize(d => this.scaleFontSize(d.weight))
      .on('end', () => this.draw());

    this.initializeVisualization();
  }

  private normalizeData(data: WordCloudItem[]): WordCloudItem[] {
    const maxWeight = Math.max(...data.map(d => d.weight));
    const minWeight = Math.min(...data.map(d => d.weight));

    return data.map(item => ({
      ...item,
      weight: (item.weight - minWeight) / (maxWeight - minWeight)
    }));
  }

  private scaleFontSize(weight: number): number {
    const { min, max } = this.options.fontSize;
    return min + (max - min) * weight;
  }

  private initializeVisualization(): void {
    // Start the layout
    this.layout.start();

    // Create a group for words
    this.words = this.svg.append('g')
      .selectAll('g')
      .data(this.data)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`);

    // Add text elements
    this.words.append('text')
      .style('font-size', d => `${this.scaleFontSize(d.weight)}px`)
      .style('font-family', 'Arial')
      .style('fill', (_, i) => this.options.colors.text[i % this.options.colors.text.length])
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(d => d.word);

    // Add interactivity
    if (this.options.tooltip.enabled) {
      this.words
        .on('mouseover', (event, d) => {
          const details = [
            `Word: ${d.word}`,
            d.category ? `Category: ${d.category}` : '',
            d.level ? `Level: ${d.level}` : '',
            d.mastery ? `Mastery: ${d.mastery}%` : '',
            `Relationships: ${d.relationships}`
          ].filter(Boolean).join('\n');

          this.tooltip
            .style('visibility', 'visible')
            .html(details)
            .style('left', `${event.pageX + this.options.tooltip.offset}px`)
            .style('top', `${event.pageY + this.options.tooltip.offset}px`);

          d3.select(event.currentTarget)
            .select('text')
            .style('fill', this.options.colors.highlight);
        })
        .on('mouseout', (event) => {
          this.tooltip.style('visibility', 'hidden');
          d3.select(event.currentTarget)
            .select('text')
            .style('fill', (_, i) => this.options.colors.text[i % this.options.colors.text.length]);
        });
    }
  }

  private draw(): void {
    if (this.options.animation.enabled) {
      this.words
        .transition()
        .duration(this.options.animation.duration)
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`);
    } else {
      this.words.attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`);
    }
  }

  public updateData(newData: WordCloudItem[]): void {
    this.data = this.normalizeData(newData);
    this.layout.words(this.data);
    this.layout.start();
  }

  public updateOptions(newOptions: Partial<WordCloudOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.layout
      .size([this.options.width, this.options.height])
      .padding(this.options.padding)
      .rotate(() => this.options.rotation.enabled
        ? this.options.rotation.angles[Math.floor(Math.random() * this.options.rotation.angles.length)]
        : 0)
      .fontSize(d => this.scaleFontSize(d.weight));

    this.svg
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .attr('transform', `translate(${this.options.width / 2},${this.options.height / 2})`);

    this.layout.start();
  }

  public resize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
    this.layout.size([width, height]);
    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${width / 2},${height / 2})`);
    this.layout.start();
  }

  public destroy(): void {
    this.svg.remove();
    if (this.options.tooltip.enabled) {
      this.tooltip.remove();
    }
  }
}

// Helper functions for data transformation
export const createWordCloudData = (
  words: DictionaryItem[],
  relationships: WordRelationship[]
): WordCloudItem[] => {
  const wordMap = new Map<string, WordCloudItem>();

  // Process words and their relationships
  words.forEach(word => {
    const relationshipsCount = relationships.filter(
      rel => rel.sourceId === word.id || rel.targetId === word.id
    ).length;

    wordMap.set(word.id, {
      word: word.japanese,
      weight: (word.frequency?.rank || 0) * 0.7 + relationshipsCount * 0.3,
      relationships: relationshipsCount,
      category: word.category,
      level: word.level,
      mastery: word.mastery?.level
    });
  });

  return Array.from(wordMap.values());
};

export const createCategoryWordCloudData = (
  words: DictionaryItem[],
  relationships: WordRelationship[],
  category: string
): WordCloudItem[] => {
  const categoryWords = words.filter(word => word.category === category);
  return createWordCloudData(categoryWords, relationships);
};

// Export visualization options type for external use
export type { WordCloudOptions }; 