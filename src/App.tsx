import React, { useState, useCallback } from 'react';
import { Ruler, Brain, Zap } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import ImageUpload from './components/ImageUpload';
import MeasurementCanvas from './components/MeasurementCanvas';
import CalibrationPanel from './components/CalibrationPanel';
import { useTensorFlow } from './hooks/useTensorFlow';
import { DetectedObject, MeasurementResult, CalibrationData } from './types';
import { calculateMeasurements, calibrateScale, REFERENCE_OBJECTS } from './utils/measurementUtils';

function App() {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [useMetric, setUseMetric] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [calibration, setCalibration] = useState<CalibrationData>({
    pixelsPerCm: 0,
    referenceObject: 'quarter',
    isCalibrated: false
  });

  const { model, isLoading: modelLoading, error: modelError, detectObjects } = useTensorFlow();

  const processImage = useCallback(async (imageData: string) => {
    if (!model) return;

    setIsProcessing(true);
    setMeasurements([]);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          // Start detection immediately
          const detectedObjects = await detectObjects(img);
          
          // Process calibration and measurements in parallel
          let updatedCalibration = { ...calibration };

          if (!calibration.isCalibrated) {
            // Try to find reference object for calibration
            const referenceObjects = detectedObjects.filter(obj => {
              const refObj = REFERENCE_OBJECTS[calibration.referenceObject as keyof typeof REFERENCE_OBJECTS];
              return obj.class.toLowerCase().includes(calibration.referenceObject.toLowerCase()) ||
                     obj.class === 'person' && calibration.referenceObject === 'a4_paper'; // fallback
            });

            if (referenceObjects.length > 0) {
              // Use first reference object for calibration
              const refObj = referenceObjects[0];
              const pixelsPerCm = calibrateScale(refObj.bbox, calibration.referenceObject as keyof typeof REFERENCE_OBJECTS);
              
              updatedCalibration = {
                ...calibration,
                pixelsPerCm,
                isCalibrated: true
              };
              setCalibration(updatedCalibration);
            } else {
              // Use default calibration if no reference object found
              updatedCalibration = {
                ...calibration,
                pixelsPerCm: 37.8, // Default pixels per cm (96 DPI standard)
                isCalibrated: true
              };
              setCalibration(updatedCalibration);
            }
          }

          // Calculate measurements for all objects
          const measurementResults = calculateMeasurements(detectedObjects, updatedCalibration);
          setMeasurements(measurementResults);
          
        } catch (err) {
          console.error('Detection failed:', err);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = imageData;
    } catch (err) {
      console.error('Image processing failed:', err);
      setIsProcessing(false);
    }
  }, [model, detectObjects, calibration]);

  const handleImageCapture = (imageData: string) => {
    setCurrentImage(imageData);
    processImage(imageData);
  };

  const handleReferenceChange = (reference: keyof typeof REFERENCE_OBJECTS) => {
    setCalibration(prev => ({
      ...prev,
      referenceObject: reference,
      isCalibrated: false // Reset calibration when reference changes
    }));
  };

  if (modelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading TensorFlow model...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Brain className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Model Loading Error</h2>
          <p className="text-gray-600">{modelError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ruler className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Object Measurement
            </h1>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Measure objects in real-time using AI-powered computer vision. 
            Capture from your camera or upload images for instant dimensional analysis.
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-6">
              <CalibrationPanel 
                calibration={calibration}
                onReferenceChange={handleReferenceChange}
              />
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Capture Options</h3>
                
                <CameraCapture
                  onCapture={handleImageCapture}
                  isActive={isCameraActive}
                  onToggle={() => setIsCameraActive(!isCameraActive)}
                />
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ImageUpload onImageUpload={handleImageCapture} />
                </div>
              </div>
              
              {/* Status Panel */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Model Status</span>
                    <span className="text-sm font-medium text-green-600">Ready ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Calibration</span>
                    <span className={`text-sm font-medium ${calibration.isCalibrated ? 'text-green-600' : 'text-orange-600'}`}>
                      {calibration.isCalibrated ? 'Calibrated ✓' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Objects Detected</span>
                    <span className="text-sm font-medium text-blue-600">{measurements.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Measurement Results</h3>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
                
                <MeasurementCanvas
                  imageData={currentImage}
                  measurements={measurements}
                  useMetric={useMetric}
                  onToggleUnit={() => setUseMetric(!useMetric)}
                />

                {!currentImage && (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <Ruler className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg mb-2">Ready to measure objects</p>
                    <p className="text-gray-400">
                      Start your camera or upload an image to begin analysis
                    </p>
                  </div>
                )}

                {currentImage && measurements.length === 0 && !isProcessing && (
                  <div className="text-center py-8">
                    <p className="text-orange-600">No objects detected or calibration needed</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try including a {REFERENCE_OBJECTS[calibration.referenceObject as keyof typeof REFERENCE_OBJECTS].name} for better results
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Setup Reference</h4>
              <p className="text-sm text-gray-600">
                Select a reference object from the dropdown. Include it in your image for calibration.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Capture/Upload</h4>
              <p className="text-sm text-gray-600">
                Use your camera for real-time capture or upload an existing image.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Get Results</h4>
              <p className="text-sm text-gray-600">
                View measurements overlaid on objects and download annotated results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;