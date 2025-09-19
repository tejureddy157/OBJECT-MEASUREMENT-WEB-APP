export interface DetectedObject {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

export interface MeasurementResult {
  object: DetectedObject;
  widthCm: number;
  heightCm: number;
  widthInches: number;
  heightInches: number;
}

export interface CalibrationData {
  pixelsPerCm: number;
  referenceObject: string;
  isCalibrated: boolean;
}