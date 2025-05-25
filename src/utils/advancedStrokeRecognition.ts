import { Point, StrokeData, StrokeType } from '../types/stroke';

// Constants for advanced stroke recognition
const STROKE_RECOGNITION = {
  MIN_POINTS: 3,
  MAX_POINTS: 100,
  DIRECTION_TOLERANCE: 15,
  CURVE_TOLERANCE: 0.3,
  LENGTH_TOLERANCE: 0.2,
  CURVE_SMOOTHING: 0.5,
  DIRECTION_WEIGHT: 0.4,
  LENGTH_WEIGHT: 0.3,
  CURVE_WEIGHT: 0.3,
  CONFIDENCE_THRESHOLD: 0.8
};

// Stroke type definitions with expected characteristics
const STROKE_PATTERNS: Record<StrokeType, {
  expectedDirection: number[];
  expectedLength: number;
  expectedCurvature: number;
  allowedVariations: number[];
}> = {
  horizontal: {
    expectedDirection: [0, 180],
    expectedLength: 1,
    expectedCurvature: 0,
    allowedVariations: [-5, 5]
  },
  vertical: {
    expectedDirection: [90, 270],
    expectedLength: 1,
    expectedCurvature: 0,
    allowedVariations: [85, 95]
  },
  diagonal: {
    expectedDirection: [45, 135, 225, 315],
    expectedLength: 1.414,
    expectedCurvature: 0,
    allowedVariations: [30, 60]
  },
  curve: {
    expectedDirection: [0, 360],
    expectedLength: 1.5,
    expectedCurvature: 0.5,
    allowedVariations: [0, 360]
  }
};

// Preprocess points to reduce noise and normalize
const preprocessPoints = (points: Point[]): Point[] => {
  if (points.length < STROKE_RECOGNITION.MIN_POINTS) {
    return points;
  }

  // Remove duplicate points
  const uniquePoints = points.filter((point, index, self) =>
    index === self.findIndex(p => p.x === point.x && p.y === point.y)
  );

  // Apply smoothing if too many points
  if (uniquePoints.length > STROKE_RECOGNITION.MAX_POINTS) {
    return smoothPoints(uniquePoints);
  }

  return uniquePoints;
};

// Apply smoothing to reduce noise
const smoothPoints = (points: Point[]): Point[] => {
  const smoothed: Point[] = [];
  const windowSize = Math.ceil(points.length / STROKE_RECOGNITION.MAX_POINTS);

  for (let i = 0; i < points.length; i += windowSize) {
    const window = points.slice(i, i + windowSize);
    const avgX = window.reduce((sum, p) => sum + p.x, 0) / window.length;
    const avgY = window.reduce((sum, p) => sum + p.y, 0) / window.length;
    smoothed.push({ x: avgX, y: avgY, timestamp: points[i].timestamp });
  }

  return smoothed;
};

// Calculate stroke characteristics with improved accuracy
export const analyzeStrokeAdvanced = (points: Point[]): StrokeData => {
  const processedPoints = preprocessPoints(points);
  
  // Calculate basic stroke properties
  const startPoint = processedPoints[0];
  const endPoint = processedPoints[processedPoints.length - 1];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const direction = Math.atan2(dy, dx) * (180 / Math.PI);

  // Calculate curvature using Bézier curve approximation
  const curvature = calculateCurvature(processedPoints);
  
  // Determine stroke type with improved accuracy
  const type = determineStrokeTypeAdvanced(direction, length, curvature, processedPoints);

  return {
    type,
    direction,
    length,
    curvature,
    points: processedPoints
  };
};

// Calculate curvature using Bézier curve approximation
const calculateCurvature = (points: Point[]): number => {
  if (points.length < 3) return 0;

  let totalCurvature = 0;
  const segments = Math.max(1, Math.floor(points.length / 3));

  for (let i = 0; i < segments; i++) {
    const start = Math.floor(i * points.length / segments);
    const end = Math.floor((i + 1) * points.length / segments);
    const segment = points.slice(start, end);

    if (segment.length < 3) continue;

    // Calculate control points for Bézier curve
    const p0 = segment[0];
    const p2 = segment[segment.length - 1];
    const p1 = segment[Math.floor(segment.length / 2)];

    // Calculate curvature at control point
    const dx1 = p1.x - p0.x;
    const dy1 = p1.y - p0.y;
    const dx2 = p2.x - p1.x;
    const dy2 = p2.y - p1.y;
    
    const angle1 = Math.atan2(dy1, dx1);
    const angle2 = Math.atan2(dy2, dx2);
    const angleDiff = Math.abs(angle2 - angle1);
    
    totalCurvature += angleDiff;
  }

  return totalCurvature / segments;
};

// Determine stroke type with improved accuracy
const determineStrokeTypeAdvanced = (
  direction: number,
  length: number,
  curvature: number,
  points: Point[]
): StrokeType => {
  // Check for curve first using improved detection
  if (points.length >= STROKE_RECOGNITION.MIN_POINTS && 
      curvature > STROKE_RECOGNITION.CURVE_TOLERANCE) {
    return 'curve';
  }

  // Normalize direction to 0-360
  const normalizedDirection = ((direction % 360) + 360) % 360;

  // Check each stroke type with improved pattern matching
  for (const [type, pattern] of Object.entries(STROKE_PATTERNS)) {
    if (pattern.expectedDirection.some(expectedDir => {
      const diff = Math.abs(normalizedDirection - expectedDir);
      return diff <= STROKE_RECOGNITION.DIRECTION_TOLERANCE ||
             pattern.allowedVariations.some(v => Math.abs(diff - v) <= STROKE_RECOGNITION.DIRECTION_TOLERANCE);
    })) {
      return type as StrokeType;
    }
  }

  // Default to curve if no other type matches
  return 'curve';
};

// Validate stroke with improved accuracy
export const validateStrokeAdvanced = (
  stroke: StrokeData,
  expectedType: StrokeType,
  tolerance: number = STROKE_RECOGNITION.LENGTH_TOLERANCE
): {
  isCorrect: boolean;
  accuracy: number;
  feedback: string[];
  suggestions: string[];
} => {
  const pattern = STROKE_PATTERNS[expectedType];
  
  // Calculate direction match with improved accuracy
  const directionMatch = pattern.expectedDirection.some(expectedDir => {
    const diff = Math.abs(stroke.direction - expectedDir);
    return diff <= STROKE_RECOGNITION.DIRECTION_TOLERANCE ||
           pattern.allowedVariations.some(v => Math.abs(diff - v) <= STROKE_RECOGNITION.DIRECTION_TOLERANCE);
  });

  // Calculate length match with improved accuracy
  const lengthRatio = stroke.length / pattern.expectedLength;
  const lengthMatch = Math.abs(lengthRatio - 1) <= tolerance;

  // Calculate curvature match for curves
  const curvatureMatch = expectedType !== 'curve' ||
                        Math.abs(stroke.curvature - pattern.expectedCurvature) <= STROKE_RECOGNITION.CURVE_TOLERANCE;

  // Calculate overall confidence with weighted components
  const confidence = (
    (directionMatch ? STROKE_RECOGNITION.DIRECTION_WEIGHT : 0) +
    (lengthMatch ? STROKE_RECOGNITION.LENGTH_WEIGHT : 0) +
    (curvatureMatch ? STROKE_RECOGNITION.CURVE_WEIGHT : 0)
  );

  // Generate detailed feedback
  const feedback = generateDetailedFeedback(stroke, expectedType, confidence);
  const suggestions = generateStrokeSuggestions(stroke, expectedType);

  return {
    isCorrect: confidence >= STROKE_RECOGNITION.CONFIDENCE_THRESHOLD,
    accuracy: confidence,
    feedback,
    suggestions
  };
};

// Generate detailed feedback for stroke validation
const generateDetailedFeedback = (
  stroke: StrokeData,
  expectedType: StrokeType,
  confidence: number
): string[] => {
  const feedback: string[] = [];
  const pattern = STROKE_PATTERNS[expectedType];

  if (confidence < STROKE_RECOGNITION.CONFIDENCE_THRESHOLD) {
    if (stroke.type !== expectedType) {
      feedback.push(`Expected a ${expectedType} stroke, but drew a ${stroke.type} stroke`);
    }

    const directionMatch = pattern.expectedDirection.some(expectedDir => {
      const diff = Math.abs(stroke.direction - expectedDir);
      return diff <= STROKE_RECOGNITION.DIRECTION_TOLERANCE;
    });

    if (!directionMatch) {
      feedback.push('The stroke direction is incorrect');
    }

    const lengthRatio = stroke.length / pattern.expectedLength;
    if (Math.abs(lengthRatio - 1) > STROKE_RECOGNITION.LENGTH_TOLERANCE) {
      feedback.push('The stroke length is incorrect');
    }

    if (expectedType === 'curve' && 
        Math.abs(stroke.curvature - pattern.expectedCurvature) > STROKE_RECOGNITION.CURVE_TOLERANCE) {
      feedback.push('The curve shape is incorrect');
    }
  }

  return feedback;
};

// Generate specific suggestions for improvement
const generateStrokeSuggestions = (
  stroke: StrokeData,
  expectedType: StrokeType
): string[] => {
  const suggestions: string[] = [];
  const pattern = STROKE_PATTERNS[expectedType];

  if (stroke.type !== expectedType) {
    suggestions.push(`Try to draw a ${expectedType} stroke instead of a ${stroke.type} stroke`);
  }

  const directionMatch = pattern.expectedDirection.some(expectedDir => {
    const diff = Math.abs(stroke.direction - expectedDir);
    return diff <= STROKE_RECOGNITION.DIRECTION_TOLERANCE;
  });

  if (!directionMatch) {
    const closestDirection = pattern.expectedDirection.reduce((closest, dir) => {
      const diff = Math.abs(stroke.direction - dir);
      return diff < Math.abs(stroke.direction - closest) ? dir : closest;
    });
    const direction = stroke.direction > closestDirection ? 'less' : 'more';
    suggestions.push(`Adjust the angle to be ${direction} horizontal`);
  }

  const lengthRatio = stroke.length / pattern.expectedLength;
  if (Math.abs(lengthRatio - 1) > STROKE_RECOGNITION.LENGTH_TOLERANCE) {
    const length = lengthRatio > 1 ? 'shorter' : 'longer';
    suggestions.push(`Make the stroke ${length}`);
  }

  if (expectedType === 'curve') {
    const curvatureDiff = Math.abs(stroke.curvature - pattern.expectedCurvature);
    if (curvatureDiff > STROKE_RECOGNITION.CURVE_TOLERANCE) {
      const curve = stroke.curvature > pattern.expectedCurvature ? 'less' : 'more';
      suggestions.push(`Make the curve ${curve} pronounced`);
    }
  }

  return suggestions;
};

// Calculate stroke order score with improved accuracy
export const calculateStrokeOrderScoreAdvanced = (
  strokes: StrokeData[],
  expectedOrder: StrokeType[]
): number => {
  if (strokes.length !== expectedOrder.length) {
    return 0;
  }

  let totalConfidence = 0;
  for (let i = 0; i < strokes.length; i++) {
    const validation = validateStrokeAdvanced(strokes[i], expectedOrder[i]);
    totalConfidence += validation.accuracy;
  }

  return totalConfidence / expectedOrder.length;
}; 