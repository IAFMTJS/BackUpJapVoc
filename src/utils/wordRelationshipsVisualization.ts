import * as d3 from 'd3';
import { WordRelationship, DictionaryItem } from '../types/dictionary';

interface GraphNode {
  id: string;
  word: string;
  type: 'word' | 'kanji' | 'category';
  level?: number;
  frequency?: number;
  mastery?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength: number;
  label?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface VisualizationOptions {
  width: number;
  height: number;
  nodeRadius: number;
  linkDistance: number;
  chargeStrength: number;
  fontSize: number;
  colors: {
    word: string;
    kanji: string;
    category: string;
    links: { [key: string]: string };
  };
}

const DEFAULT_OPTIONS: VisualizationOptions = {
  width: 800,
  height: 600,
  nodeRadius: 20,
  linkDistance: 100,
  chargeStrength: -100,
  fontSize: 12,
  colors: {
    word: '#4CAF50',
    kanji: '#2196F3',
    category: '#9C27B0',
    links: {
      synonym: '#4CAF50',
      antonym: '#F44336',
      compound: '#FF9800',
      related: '#9E9E9E',
      category: '#9C27B0'
    }
  }
};

export class WordRelationshipsVisualization {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<GraphNode, GraphLink>;
  private options: VisualizationOptions;
  private data: GraphData;

  constructor(
    container: HTMLElement,
    data: GraphData,
    options: Partial<VisualizationOptions> = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.data = data;

    // Create SVG container
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .append('g')
      .attr('transform', `translate(${this.options.width / 2},${this.options.height / 2})`);

    // Initialize force simulation
    this.simulation = d3.forceSimulation<GraphNode>()
      .force('link', d3.forceLink<GraphNode, GraphLink>()
        .id(d => d.id)
        .distance(this.options.linkDistance)
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody()
        .strength(this.options.chargeStrength))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide()
        .radius(this.options.nodeRadius * 1.5));

    this.initializeVisualization();
  }

  private initializeVisualization(): void {
    // Create links
    const link = this.svg.append('g')
      .selectAll('line')
      .data(this.data.links)
      .enter()
      .append('line')
      .attr('stroke', d => this.options.colors.links[d.type] || this.options.colors.links.related)
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2)
      .attr('stroke-opacity', 0.6);

    // Create link labels
    const linkLabels = this.svg.append('g')
      .selectAll('text')
      .data(this.data.links.filter(d => d.label))
      .enter()
      .append('text')
      .attr('dy', -3)
      .style('font-size', `${this.options.fontSize}px`)
      .style('text-anchor', 'middle')
      .text(d => d.label);

    // Create nodes
    const node = this.svg.append('g')
      .selectAll('g')
      .data(this.data.nodes)
      .enter()
      .append('g')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', this.dragStarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragEnded.bind(this)));

    // Add circles to nodes
    node.append('circle')
      .attr('r', this.options.nodeRadius)
      .attr('fill', d => this.options.colors[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Add text labels to nodes
    node.append('text')
      .attr('dy', 4)
      .style('font-size', `${this.options.fontSize}px`)
      .style('text-anchor', 'middle')
      .text(d => d.word);

    // Add tooltips
    node.append('title')
      .text(d => {
        const details = [
          `Type: ${d.type}`,
          d.level ? `Level: ${d.level}` : '',
          d.frequency ? `Frequency: ${d.frequency}` : '',
          d.mastery ? `Mastery: ${d.mastery}%` : ''
        ].filter(Boolean).join('\n');
        return details;
      });

    // Update positions on simulation tick
    this.simulation
      .nodes(this.data.nodes)
      .on('tick', () => {
        link
          .attr('x1', d => (d.source as GraphNode).x!)
          .attr('y1', d => (d.source as GraphNode).y!)
          .attr('x2', d => (d.target as GraphNode).x!)
          .attr('y2', d => (d.target as GraphNode).y!);

        linkLabels
          .attr('x', d => {
            const source = d.source as GraphNode;
            const target = d.target as GraphNode;
            return (source.x! + target.x!) / 2;
          })
          .attr('y', d => {
            const source = d.source as GraphNode;
            const target = d.target as GraphNode;
            return (source.y! + target.y!) / 2;
          });

        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    // Add links to simulation
    this.simulation.force<d3.ForceLink<GraphNode, GraphLink>>('link')!
      .links(this.data.links);
  }

  private dragStarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode): void {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode): void {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  public updateData(newData: GraphData): void {
    this.data = newData;
    this.svg.selectAll('*').remove();
    this.initializeVisualization();
  }

  public updateOptions(newOptions: Partial<VisualizationOptions>): void {
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
      .attr('transform', `translate(${width / 2},${height / 2})`);
  }

  public destroy(): void {
    this.simulation.stop();
    this.svg.remove();
  }
}

// Helper functions for data transformation
export const createGraphData = (
  words: DictionaryItem[],
  relationships: WordRelationship[]
): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();

  // Create nodes for words
  words.forEach(word => {
    const node: GraphNode = {
      id: word.id,
      word: word.japanese,
      type: 'word',
      level: word.level,
      frequency: word.frequency?.rank,
      mastery: word.mastery?.level
    };
    nodes.push(node);
    nodeMap.set(word.id, node);

    // Add kanji nodes for compound words
    if (word.type === 'compound') {
      word.kanji.forEach(kanji => {
        const kanjiId = `kanji-${kanji}`;
        if (!nodeMap.has(kanjiId)) {
          const kanjiNode: GraphNode = {
            id: kanjiId,
            word: kanji,
            type: 'kanji'
          };
          nodes.push(kanjiNode);
          nodeMap.set(kanjiId, kanjiNode);
        }
        links.push({
          source: word.id,
          target: kanjiId,
          type: 'compound',
          strength: 0.8,
          label: 'contains'
        });
      });
    }
  });

  // Add relationship links
  relationships.forEach(rel => {
    if (nodeMap.has(rel.sourceId) && nodeMap.has(rel.targetId)) {
      links.push({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        strength: rel.strength,
        label: rel.type
      });
    }
  });

  return { nodes, links };
};

export const createCategoryGraphData = (
  words: DictionaryItem[],
  relationships: WordRelationship[],
  categories: string[]
): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();

  // Create category nodes
  categories.forEach(category => {
    const categoryId = `category-${category}`;
    const categoryNode: GraphNode = {
      id: categoryId,
      word: category,
      type: 'category'
    };
    nodes.push(categoryNode);
    nodeMap.set(categoryId, categoryNode);
  });

  // Create word nodes and link to categories
  words.forEach(word => {
    const node: GraphNode = {
      id: word.id,
      word: word.japanese,
      type: 'word',
      level: word.level,
      frequency: word.frequency?.rank,
      mastery: word.mastery?.level
    };
    nodes.push(node);
    nodeMap.set(word.id, node);

    // Link word to its category
    if (word.category && nodeMap.has(`category-${word.category}`)) {
      links.push({
        source: word.id,
        target: `category-${word.category}`,
        type: 'category',
        strength: 0.5,
        label: 'belongs to'
      });
    }
  });

  // Add relationship links
  relationships.forEach(rel => {
    if (nodeMap.has(rel.sourceId) && nodeMap.has(rel.targetId)) {
      links.push({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        strength: rel.strength,
        label: rel.type
      });
    }
  });

  return { nodes, links };
};

// Export visualization options type for external use
export type { VisualizationOptions }; 