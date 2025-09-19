import React from 'react';
import { CalibrationData } from '../types';
import { REFERENCE_OBJECTS } from '../utils/measurementUtils';
import { Settings, CheckCircle } from 'lucide-react';

interface CalibrationPanelProps {
  calibration: CalibrationData;
  onReferenceChange: (reference: keyof typeof REFERENCE_OBJECTS) => void;
}

const CalibrationPanel: React.FC<CalibrationPanelProps> = ({ 
  calibration, 
  onReferenceChange 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Calibration Settings</h3>
        {calibration.isCalibrated && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Object for Scale
          </label>
          <select
            value={calibration.referenceObject}
            onChange={(e) => onReferenceChange(e.target.value as keyof typeof REFERENCE_OBJECTS)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(REFERENCE_OBJECTS).map(([key, obj]) => (
              <option key={key} value={key}>
                {obj.name} ({obj.width} × {obj.height} cm)
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>
            <strong>Instructions:</strong> Include a {REFERENCE_OBJECTS[calibration.referenceObject as keyof typeof REFERENCE_OBJECTS].name} in your image for accurate measurements.
            The system will automatically detect it and calibrate the scale.
          </p>
        </div>

        {calibration.isCalibrated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              ✓ Scale calibrated: {Math.round(calibration.pixelsPerCm * 100) / 100} pixels per cm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalibrationPanel;