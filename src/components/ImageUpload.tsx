import React, { useRef } from 'react';
import { Upload, Image } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Show immediate feedback
    const fileName = file.name;
    console.log(`Processing ${fileName}...`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      // Process immediately after load
      onImageUpload(imageData);
    };
    // Use readAsDataURL for faster processing
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={triggerFileSelect}
        className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
      >
        <Upload className="w-5 h-5" />
        Upload Image
      </button>
      
      <p className="text-sm text-gray-600 mt-2">
        Upload an image to measure objects within it
      </p>
    </div>
  );
};

export default ImageUpload;