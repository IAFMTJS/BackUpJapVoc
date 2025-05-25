import { Point, StrokeData, StrokeFeedback, StrokeType } from '../types';

// Constants for stroke validation
const STROKE_TOLERANCE = 0.2;
const DIRECTION_TOLERANCE = 15; // degrees
const CURVE_TOLERANCE = 0.3;
const MIN_POINTS_FOR_CURVE = 5;

// Stroke type definitions with expected characteristics
const STROKE_DEFINITIONS: Record<StrokeType, {
  expectedDirection: number;
  expectedLength: number;
  expectedCurvature: number;
  allowedVariations: number[];
}> = {
  horizontal: {
    expectedDirection: 0,
    expectedLength: 1,
    expectedCurvature: 0,
    allowedVariations: [-5, 5]
  },
  vertical: {
    expectedDirection: 90,
    expectedLength: 1,
    expectedCurvature: 0,
    allowedVariations: [85, 95]
  },
  diagonal: {
    expectedDirection: 45,
    expectedLength: 1.414, // √2
    expectedCurvature: 0,
    allowedVariations: [30, 60]
  },
  curve: {
    expectedDirection: 0,
    expectedLength: 1.5,
    expectedCurvature: 0.5,
    allowedVariations: [0, 360]
  }
};

// Calculate stroke characteristics
export const analyzeStroke = (points: Point[]): StrokeData => {
  if (points.length < 2) {
    throw new Error('Stroke must have at least 2 points');
  }

  // Calculate basic stroke properties
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const direction = Math.atan2(dy, dx) * (180 / Math.PI);

  // Calculate curvature
  let curvature = 0;
  if (points.length >= MIN_POINTS_FOR_CURVE) {
    const totalAngle = points.reduce((sum, point, i) => {
      if (i === 0 || i === points.length - 1) return sum;
      const prev = points[i - 1];
      const next = points[i + 1];
      const angle = Math.atan2(next.y - point.y, next.x - point.x) -
                   Math.atan2(point.y - prev.y, point.x - prev.x);
      return sum + Math.abs(angle);
    }, 0);
    curvature = totalAngle / (points.length - 2);
  }

  // Determine stroke type
  const type = determineStrokeType(direction, length, curvature, points);

  return {
    type,
    direction,
    length,
    curvature,
    points
  };
};

// Determine stroke type based on characteristics
const determineStrokeType = (
  direction: number,
  length: number,
  curvature: number,
  points: Point[]
): StrokeType => {
  // Check for curve first
  if (points.length >= MIN_POINTS_FOR_CURVE && curvature > CURVE_TOLERANCE) {
    return 'curve';
  }

  // Normalize direction to 0-360
  const normalizedDirection = ((direction % 360) + 360) % 360;

  // Check for horizontal
  if (Math.abs(normalizedDirection) <= DIRECTION_TOLERANCE ||
      Math.abs(normalizedDirection - 180) <= DIRECTION_TOLERANCE) {
    return 'horizontal';
  }

  // Check for vertical
  if (Math.abs(normalizedDirection - 90) <= DIRECTION_TOLERANCE ||
      Math.abs(normalizedDirection - 270) <= DIRECTION_TOLERANCE) {
    return 'vertical';
  }

  // Check for diagonal
  if (Math.abs(normalizedDirection - 45) <= DIRECTION_TOLERANCE ||
      Math.abs(normalizedDirection - 135) <= DIRECTION_TOLERANCE ||
      Math.abs(normalizedDirection - 225) <= DIRECTION_TOLERANCE ||
      Math.abs(normalizedDirection - 315) <= DIRECTION_TOLERANCE) {
    return 'diagonal';
  }

  // Default to curve if no other type matches
  return 'curve';
};

// Validate stroke against expected characteristics
export const validateStroke = (
  stroke: StrokeData,
  expectedType: StrokeType,
  tolerance: number = STROKE_TOLERANCE
): StrokeFeedback => {
  const definition = STROKE_DEFINITIONS[expectedType];
  const typeMatch = stroke.type === expectedType;
  
  // Calculate direction match
  const directionDiff = Math.abs(stroke.direction - definition.expectedDirection);
  const directionMatch = directionDiff <= DIRECTION_TOLERANCE ||
                        definition.allowedVariations.some(v => 
                          Math.abs(directionDiff - v) <= DIRECTION_TOLERANCE
                        );

  // Calculate length match
  const lengthRatio = stroke.length / definition.expectedLength;
  const lengthMatch = Math.abs(lengthRatio - 1) <= tolerance;

  // Calculate curvature match for curves
  const curvatureMatch = expectedType !== 'curve' ||
                        Math.abs(stroke.curvature - definition.expectedCurvature) <= CURVE_TOLERANCE;

  // Calculate overall confidence
  const confidence = (
    (typeMatch ? 0.4 : 0) +
    (directionMatch ? 0.3 : 0) +
    (lengthMatch ? 0.2 : 0) +
    (curvatureMatch ? 0.1 : 0)
  );

  // Generate feedback
  const feedback: StrokeFeedback = {
    isCorrect: confidence > 0.8,
    message: generateFeedbackMessage(stroke, expectedType, confidence),
    expectedStroke: expectedType,
    actualStroke: stroke.type,
    confidence,
    suggestions: confidence < 0.8 ? generateSuggestions(stroke, expectedType) : undefined
  };

  return feedback;
};

// Generate detailed feedback message
const generateFeedbackMessage = (
  stroke: StrokeData,
  expectedType: StrokeType,
  confidence: number
): string => {
  if (confidence > 0.8) {
    return 'Correct stroke!';
  }

  const messages: string[] = [];
  
  if (stroke.type !== expectedType) {
    messages.push(`Expected a ${expectedType} stroke, but drew a ${stroke.type} stroke`);
  }

  const definition = STROKE_DEFINITIONS[expectedType];
  const directionDiff = Math.abs(stroke.direction - definition.expectedDirection);
  if (directionDiff > DIRECTION_TOLERANCE) {
    messages.push('The stroke direction is incorrect');
  }

  const lengthRatio = stroke.length / definition.expectedLength;
  if (Math.abs(lengthRatio - 1) > STROKE_TOLERANCE) {
    messages.push('The stroke length is incorrect');
  }

  if (expectedType === 'curve' && 
      Math.abs(stroke.curvature - definition.expectedCurvature) > CURVE_TOLERANCE) {
    messages.push('The curve shape is incorrect');
  }

  return messages.join('. ');
};

// Generate specific suggestions for improvement
const generateSuggestions = (
  stroke: StrokeData,
  expectedType: StrokeType
): string[] => {
  const suggestions: string[] = [];
  const definition = STROKE_DEFINITIONS[expectedType];

  if (stroke.type !== expectedType) {
    suggestions.push(`Try to draw a ${expectedType} stroke instead of a ${stroke.type} stroke`);
  }

  const directionDiff = Math.abs(stroke.direction - definition.expectedDirection);
  if (directionDiff > DIRECTION_TOLERANCE) {
    const direction = stroke.direction > definition.expectedDirection ? 'less' : 'more';
    suggestions.push(`Adjust the angle to be ${direction} horizontal`);
  }

  const lengthRatio = stroke.length / definition.expectedLength;
  if (Math.abs(lengthRatio - 1) > STROKE_TOLERANCE) {
    const length = lengthRatio > 1 ? 'shorter' : 'longer';
    suggestions.push(`Make the stroke ${length}`);
  }

  if (expectedType === 'curve') {
    const curvatureDiff = Math.abs(stroke.curvature - definition.expectedCurvature);
    if (curvatureDiff > CURVE_TOLERANCE) {
      const curve = stroke.curvature > definition.expectedCurvature ? 'less' : 'more';
      suggestions.push(`Make the curve ${curve} pronounced`);
    }
  }

  return suggestions;
};

// Calculate stroke order score
export const calculateStrokeOrderScore = (
  strokes: StrokeData[],
  expectedOrder: StrokeType[]
): number => {
  if (strokes.length !== expectedOrder.length) {
    return 0;
  }

  let correctCount = 0;
  for (let i = 0; i < strokes.length; i++) {
    const feedback = validateStroke(strokes[i], expectedOrder[i]);
    if (feedback.isCorrect) {
      correctCount++;
    }
  }

  return correctCount / expectedOrder.length;
}; 