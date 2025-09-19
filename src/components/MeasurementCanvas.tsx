import React, { useRef, useEffect } from 'react';
import { MeasurementResult } from '../types';
import { drawMeasurements } from '../utils/measurementUtils';
import { Download, ToggleLeft, ToggleRight } from 'lucide-react';

interface MeasurementCanvasProps {
  imageData: string;
  measurements: MeasurementResult[];
  useMetric: boolean;
  onToggleUnit: () => void;
}

const MeasurementCanvas: React.FC<MeasurementCanvasProps> = ({
  imageData,
  measurements,
  useMetric,
  onToggleUnit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageData) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => drawCanvas());
      };
      img.src = imageData;
    }
  }, [imageData, measurements, useMetric]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Draw measurements if available
    if (measurements.length > 0) {
      drawMeasurements(ctx, measurements, useMetric);
    }
  };

  const downloadAnnotatedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `measurements-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  if (!imageData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No image selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <button
          onClick={onToggleUnit}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
        >
          {useMetric ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {useMetric ? 'Metric (cm)' : 'Imperial (inches)'}
        </button>
        
        {measurements.length > 0 && (
          <button
            onClick={downloadAnnotatedImage}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
        />
        
        {measurements.length === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <p className="text-white text-lg">Processing measurements...</p>
          </div>
        )}
      </div>

      {measurements.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Measurement Results</h3>
          <div className="space-y-2">
            {measurements.map((measurement, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{measurement.object.class}</span>
                <span className="text-sm text-gray-600">
                  {useMetric 
                    ? `${measurement.widthCm} × ${measurement.heightCm} cm`
                    : `${measurement.widthInches}" × ${measurement.heightInches}"`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementCanvas;