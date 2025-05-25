import * as d3 from 'd3';
import { DictionaryItem, WordRelationship } from '../types/dictionary';

interface LearningPathNode {
  id: string;
  word: string;
  type: 'word' | 'milestone' | 'category';
  level: number;
  progress: number;
  mastery?: number;
  prerequisites: string[];
  x?: number;
  y?: number;
}

interface LearningPathLink {
  source: string;
  target: string;
  type: 'prerequisite' | 'related' | 'category';
  strength: number;
  label?: string;
}

interface LearningPathData {
  nodes: LearningPathNode[];
  links: LearningPathLink[];
}

interface LearningPathOptions {
  width: number;
  height: number;
  nodeRadius: number;
  levelSpacing: number;
  nodeSpacing: number;
  colors: {
    background: string;
    nodes: {
      word: string;
      milestone: string;
      category: string;
    };
    links: {
      prerequisite: string;
      related: string;
      category: string;
    };
    text: string;
    progress: {
      background: string;
      fill: string;
    };
  };
  fontSize: {
    node: number;
    link: number;
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

const DEFAULT_OPTIONS: LearningPathOptions = {
  width: 1000,
  height: 600,
  nodeRadius: 30,
  levelSpacing: 150,
  nodeSpacing: 100,
  colors: {
    background: '#ffffff',
    nodes: {
      word: '#4CAF50',
      milestone: '#2196F3',
      category: '#9C27B0'
    },
    links: {
      prerequisite: '#F44336',
      related: '#FF9800',
      category: '#9C27B0'
    },
    text: '#000000',
    progress: {
      background: '#E0E0E0',
      fill: '#4CAF50'
    }
  },
  fontSize: {
    node: 14,
    link: 12
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

export class LearningPathVisualization {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  private options: LearningPathOptions;
  private data: LearningPathData;
  private simulation: d3.Simulation<LearningPathNode, LearningPathLink>;
  private nodes: d3.Selection<SVGGElement, LearningPathNode, SVGGElement, unknown>;
  private links: d3.Selection<SVGLineElement, LearningPathLink, SVGGElement, unknown>;

  constructor(
    container: HTMLElement,
    data: LearningPathData,
    options: Partial<LearningPathOptions> = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.data = data;

    // Create SVG container
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .append('g')
      .attr('transform', `translate(${this.options.nodeRadius * 2},${this.options.nodeRadius * 2})`);

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

    // Initialize force simulation
    this.simulation = d3.forceSimulation<LearningPathNode>()
      .force('link', d3.forceLink<LearningPathNode, LearningPathLink>()
        .id(d => d.id)
        .distance(this.options.nodeSpacing)
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('x', d3.forceX(d => d.level * this.options.levelSpacing).strength(1))
      .force('y', d3.forceY(this.options.height / 2).strength(0.1))
      .force('collision', d3.forceCollide().radius(this.options.nodeRadius * 1.5));

    this.initializeVisualization();
  }

  private initializeVisualization(): void {
    // Create links
    this.links = this.svg.append('g')
      .selectAll('line')
      .data(this.data.links)
      .enter()
      .append('line')
      .attr('stroke', d => this.options.colors.links[d.type])
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Add arrow marker
    this.svg.append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', this.options.nodeRadius)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create link labels
    this.svg.append('g')
      .selectAll('text')
      .data(this.data.links.filter(d => d.label))
      .enter()
      .append('text')
      .attr('dy', -3)
      .style('font-size', `${this.options.fontSize.link}px`)
      .style('text-anchor', 'middle')
      .text(d => d.label);

    // Create nodes
    this.nodes = this.svg.append('g')
      .selectAll('g')
      .data(this.data.nodes)
      .enter()
      .append('g')
      .call(d3.drag<SVGGElement, LearningPathNode>()
        .on('start', this.dragStarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragEnded.bind(this)));

    // Add circles to nodes
    this.nodes.append('circle')
      .attr('r', this.options.nodeRadius)
      .attr('fill', d => this.options.colors.nodes[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add progress circles
    this.nodes.append('circle')
      .attr('r', d => this.options.nodeRadius * 0.8)
      .attr('fill', 'none')
      .attr('stroke', this.options.colors.progress.background)
      .attr('stroke-width', 4);

    this.nodes.append('circle')
      .attr('r', d => this.options.nodeRadius * 0.8)
      .attr('fill', 'none')
      .attr('stroke', this.options.colors.progress.fill)
      .attr('stroke-width', 4)
      .attr('stroke-dasharray', d => {
        const circumference = 2 * Math.PI * this.options.nodeRadius * 0.8;
        return `${circumference * d.progress} ${circumference}`;
      })
      .attr('stroke-dashoffset', d => {
        const circumference = 2 * Math.PI * this.options.nodeRadius * 0.8;
        return circumference * (1 - d.progress);
      });

    // Add text labels to nodes
    this.nodes.append('text')
      .attr('dy', 4)
      .style('font-size', `${this.options.fontSize.node}px`)
      .style('text-anchor', 'middle')
      .style('fill', this.options.colors.text)
      .text(d => d.word);

    // Add tooltips
    if (this.options.tooltip.enabled) {
      this.nodes.append('title')
        .text(d => {
          const details = [
            `Word: ${d.word}`,
            `Type: ${d.type}`,
            `Level: ${d.level}`,
            `Progress: ${Math.round(d.progress * 100)}%`,
            d.mastery ? `Mastery: ${d.mastery}%` : '',
            d.prerequisites.length ? `Prerequisites: ${d.prerequisites.join(', ')}` : ''
          ].filter(Boolean).join('\n');
          return details;
        });
    }

    // Update positions on simulation tick
    this.simulation
      .nodes(this.data.nodes)
      .on('tick', () => {
        this.links
          .attr('x1', d => (d.source as LearningPathNode).x!)
          .attr('y1', d => (d.source as LearningPathNode).y!)
          .attr('x2', d => (d.target as LearningPathNode).x!)
          .attr('y2', d => (d.target as LearningPathNode).y!);

        this.nodes.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    // Add links to simulation
    this.simulation.force<d3.ForceLink<LearningPathNode, LearningPathLink>>('link')!
      .links(this.data.links);
  }

  private dragStarted(event: d3.D3DragEvent<SVGGElement, LearningPathNode, LearningPathNode>, d: LearningPathNode): void {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: d3.D3DragEvent<SVGGElement, LearningPathNode, LearningPathNode>, d: LearningPathNode): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(event: d3.D3DragEvent<SVGGElement, LearningPathNode, LearningPathNode>, d: LearningPathNode): void {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  public updateData(newData: LearningPathData): void {
    this.data = newData;
    this.svg.selectAll('*').remove();
    this.initializeVisualization();
  }

  public updateOptions(newOptions: Partial<LearningPathOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.svg.selectAll('*').remove();
    this.initializeVisualization();
  }

  public resize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${this.options.nodeRadius * 2},${this.options.nodeRadius * 2})`);
    this.simulation.force('y', d3.forceY(height / 2).strength(0.1));
    this.simulation.alpha(0.3).restart();
  }

  public destroy(): void {
    this.simulation.stop();
    this.svg.remove();
    if (this.options.tooltip.enabled) {
      this.tooltip.remove();
    }
  }
}

// Helper functions for data transformation
export const createLearningPathData = (
  words: DictionaryItem[],
  relationships: WordRelationship[],
  milestones: Array<{
    id: string;
    name: string;
    level: number;
    words: string[];
  }> = []
): LearningPathData => {
  const nodes: LearningPathNode[] = [];
  const links: LearningPathLink[] = [];
  const nodeMap = new Map<string, LearningPathNode>();

  // Add milestone nodes
  milestones.forEach(milestone => {
    const node: LearningPathNode = {
      id: milestone.id,
      word: milestone.name,
      type: 'milestone',
      level: milestone.level,
      progress: 0,
      prerequisites: []
    };
    nodes.push(node);
    nodeMap.set(milestone.id, node);

    // Link milestone to its words
    milestone.words.forEach(wordId => {
      if (nodeMap.has(wordId)) {
        links.push({
          source: milestone.id,
          target: wordId,
          type: 'category',
          strength: 0.8,
          label: 'contains'
        });
      }
    });
  });

  // Add word nodes
  words.forEach(word => {
    const node: LearningPathNode = {
      id: word.id,
      word: word.japanese,
      type: 'word',
      level: word.level,
      progress: word.mastery?.level ? word.mastery.level / 100 : 0,
      mastery: word.mastery?.level,
      prerequisites: []
    };
    nodes.push(node);
    nodeMap.set(word.id, node);
  });

  // Add relationship links
  relationships.forEach(rel => {
    if (nodeMap.has(rel.sourceId) && nodeMap.has(rel.targetId)) {
      const sourceNode = nodeMap.get(rel.sourceId)!;
      const targetNode = nodeMap.get(rel.targetId)!;

      // Add prerequisite relationship
      if (rel.type === 'prerequisite') {
        sourceNode.prerequisites.push(rel.targetId);
        links.push({
          source: rel.sourceId,
          target: rel.targetId,
          type: 'prerequisite',
          strength: 0.9,
          label: 'requires'
        });
      }
      // Add related word relationship
      else if (rel.type === 'related') {
        links.push({
          source: rel.sourceId,
          target: rel.targetId,
          type: 'related',
          strength: 0.5,
          label: 'related to'
        });
      }
    }
  });

  return { nodes, links };
};

// Export visualization options type for external use
export type { LearningPathOptions }; 