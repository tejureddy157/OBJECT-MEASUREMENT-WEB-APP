import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectedObject } from '../types';

export const useTensorFlow = () => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Set TensorFlow backend
      await tf.ready();
      
      // Load COCO-SSD model
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    } catch (err) {
      setError('Failed to load TensorFlow model');
      console.error('Model loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const detectObjects = async (imageElement: HTMLImageElement): Promise<DetectedObject[]> => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      // Optimize detection settings for speed
      const predictions = await model.detect(imageElement);
      
      // Filter out low confidence predictions to reduce processing
      const filteredPredictions = predictions.filter(prediction => prediction.score > 0.5);
      
      return filteredPredictions.map(prediction => ({
        bbox: prediction.bbox,
        class: prediction.class,
        score: prediction.score
      }));
    } catch (err) {
      console.error('Detection error:', err);
      throw new Error('Failed to detect objects');
    }
  };

  return {
    model,
    isLoading,
    error,
    detectObjects
  };
};