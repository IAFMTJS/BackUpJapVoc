import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
}

interface WritingCanvasProps {
  character: string;
  strokeOrder?: string[];  // Array of SVG paths for stroke order
  showOverlay?: boolean;
  showGrid?: boolean;
  onStrokeComplete?: (stroke: Stroke) => void;
  onComplete?: () => void;
  width?: number;
  height?: number;
}

const WritingCanvas: React.FC<WritingCanvasProps> = ({
  character,
  strokeOrder = [],
  showOverlay = false,
  showGrid = true,
  onStrokeComplete,
  onComplete,
  width = 300,
  height = 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { theme, isDarkMode } = useTheme();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState(isDarkMode ? '#ffffff' : '#000000');

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');
    if (!ctx || !overlayCtx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    overlay.width = width;
    overlay.height = height;

    // Clear canvases
    ctx.clearRect(0, 0, width, height);
    overlayCtx.clearRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, width, height);
    }

    // Draw overlay if enabled
    if (showOverlay) {
      drawOverlay(overlayCtx, character, width, height);
    }

    // Draw stroke order if enabled
    if (showStrokeOrder && strokeOrder.length > 0) {
      drawStrokeOrder(overlayCtx, strokeOrder, currentStrokeIndex);
    }
  }, [width, height, showGrid, showOverlay, character, strokeOrder, showStrokeOrder, currentStrokeIndex, isDarkMode]);

  // Draw grid lines
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = isDarkMode ? '#333333' : '#e0e0e0';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= width; x += width / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += height / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Draw character overlay
  const drawOverlay = (ctx: CanvasRenderingContext2D, char: string, width: number, height: number) => {
    ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.font = `${height * 0.8}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, width / 2, height / 2);
  };

  // Draw stroke order
  const drawStrokeOrder = (ctx: CanvasRenderingContext2D, strokeOrder: string[], currentIndex: number) => {
    strokeOrder.forEach((path, index) => {
      ctx.strokeStyle = index === currentIndex 
        ? (isDarkMode ? '#4CAF50' : '#2E7D32')
        : (isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.stroke(new Path2D(path));
    });
  };

  // Redraw all strokes
  const redrawStrokes = (ctx: CanvasRenderingContext2D) => {
    if (showGrid) {
      drawGrid(ctx, width, height);
    }
    strokes.forEach(stroke => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  // Redraw all strokes whenever strokes or brushSize changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    redrawStrokes(ctx);
  }, [strokes, brushSize, showGrid, width, height, isDarkMode]);

  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPointFromEvent(e, canvas);
    setIsDrawing(true);
    setCurrentStroke([point]);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start drawing the new stroke
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPointFromEvent(e, canvas);
    setCurrentStroke(prev => [...prev, point]);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Continue drawing the current stroke
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      const newStroke: Stroke = {
        points: [...currentStroke],
        color: brushColor
      };
      setStrokes(prev => [...prev, newStroke]);
      onStrokeComplete?.(newStroke);
    }
    setCurrentStroke([]);
  };

  // Get point coordinates from mouse or touch event
  const getPointFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw everything
    ctx.clearRect(0, 0, width, height);
    if (showGrid) {
      drawGrid(ctx, width, height);
    }
    setStrokes([]);
    setCurrentStrokeIndex(0);
  };

  // Undo last stroke
  const undoStroke = () => {
    if (strokes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw everything except the last stroke
    ctx.clearRect(0, 0, width, height);
    if (showGrid) {
      drawGrid(ctx, width, height);
    }

    // Redraw all strokes except the last one
    strokes.slice(0, -1).forEach(stroke => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    setStrokes(prev => prev.slice(0, -1));
    setCurrentStrokeIndex(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border rounded-lg touch-none"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            borderColor: isDarkMode ? '#333333' : '#e0e0e0'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        <canvas
          ref={overlayRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: `${width}px`,
            height: `${height}px`
          }}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={clearCanvas}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-dark-hover text-white' : 'bg-gray-100 text-gray-800'
          }`}
        >
          Clear
        </button>
        <button
          onClick={undoStroke}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-dark-hover text-white' : 'bg-gray-100 text-gray-800'
          }`}
          disabled={strokes.length === 0}
        >
          Undo
        </button>
        <button
          onClick={() => setShowStrokeOrder(!showStrokeOrder)}
          className={`px-4 py-2 rounded-lg ${
            showStrokeOrder
              ? 'bg-primary text-white'
              : isDarkMode
              ? 'bg-dark-hover text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {showStrokeOrder ? 'Hide Stroke Order' : 'Show Stroke Order'}
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <span>Brush Size:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Color:</span>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

export default WritingCanvas; 