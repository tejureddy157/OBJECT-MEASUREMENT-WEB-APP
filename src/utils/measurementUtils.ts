import { DetectedObject, MeasurementResult, CalibrationData } from '../types';

// Common reference objects and their real-world dimensions in cm
export const REFERENCE_OBJECTS = {
  'quarter': { width: 2.426, height: 2.426, name: 'US Quarter' },
  'credit_card': { width: 8.56, height: 5.398, name: 'Credit Card' },
  'a4_paper': { width: 21.0, height: 29.7, name: 'A4 Paper' },
  'coin': { width: 2.5, height: 2.5, name: 'Standard Coin' },
};

export function calculateMeasurements(
  objects: DetectedObject[],
  calibration: CalibrationData
): MeasurementResult[] {
  if (!calibration.isCalibrated) {
    return [];
  }

  return objects.map(object => {
    const [x, y, width, height] = object.bbox;
    
    const widthCm = width / calibration.pixelsPerCm;
    const heightCm = height / calibration.pixelsPerCm;
    
    const widthInches = widthCm / 2.54;
    const heightInches = heightCm / 2.54;

    return {
      object,
      widthCm: Math.round(widthCm * 10) / 10,
      heightCm: Math.round(heightCm * 10) / 10,
      widthInches: Math.round(widthInches * 10) / 10,
      heightInches: Math.round(heightInches * 10) / 10,
    };
  });
}

export function calibrateScale(
  referenceObjectBbox: [number, number, number, number],
  referenceObjectType: keyof typeof REFERENCE_OBJECTS
): number {
  const [, , width, height] = referenceObjectBbox;
  const realDimensions = REFERENCE_OBJECTS[referenceObjectType];
  
  // Use the larger dimension for better accuracy
  const pixelDimension = Math.max(width, height);
  const realDimension = Math.max(realDimensions.width, realDimensions.height);
  
  return pixelDimension / realDimension;
}

export function drawMeasurements(
  ctx: CanvasRenderingContext2D,
  measurements: MeasurementResult[],
  useMetric: boolean = true
) {
  ctx.font = '14px Arial';
  ctx.lineWidth = 2;
  
  measurements.forEach(measurement => {
    const { object, widthCm, heightCm, widthInches, heightInches } = measurement;
    const [x, y, width, height] = object.bbox;
    
    // Draw bounding box
    ctx.strokeStyle = '#00ff00';
    ctx.strokeRect(x, y, width, height);
    
    // Draw semi-transparent background for text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y - 40, width, 35);
    
    // Draw measurement text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    const displayWidth = useMetric ? `${widthCm}cm` : `${widthInches}"`;
    const displayHeight = useMetric ? `${heightCm}cm` : `${heightInches}"`;
    
    ctx.fillText(`${object.class}`, x + 5, y - 25);
    ctx.fillText(`W: ${displayWidth} × H: ${displayHeight}`, x + 5, y - 8);
  });
}