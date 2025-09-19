# AI Object Measurement Web App

An AI-powered web application to measure objects in real-time using computer vision.  
Users can capture images from their camera or upload existing images, and the system will automatically detect objects and provide their dimensions.

<img width="1735" height="920" alt="Image" src="https://github.com/user-attachments/assets/e0021b99-8316-4f44-abd0-f43437c60568" />

## Features
- **Capture or Upload Images** – Take pictures directly from your webcam or upload an image.
- **AI-powered Object Detection** – Automatically detects objects in the image.
- **Reference Object Calibration** – Use a known object (e.g., US Quarter) to calibrate scale for accurate measurements.
- **Dimensional Analysis** – Get object width and height in metric units (cm).
- **Download Results** – Save the measurement results as an image report.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS  
- **Backend / AI**: TensorFlow.js / ONNX / TFLite (depending on model used)  
- **Computer Vision**: Pre-trained object detection + calibration system  

## Project Structure
OBJECT MEASURMENT APP/
├── dist/ # Production build
├── node_modules/ # Dependencies
├── src/ # React source code
│ ├── components/ # Reusable UI components
│ ├── hooks/ # Custom React hooks
│ ├── types/ # TypeScript types
│ ├── utils/ # Helper functions (calibration, scaling)
│ ├── App.tsx # Root component
│ ├── index.css # Global styles
│ ├── main.tsx # Entry point
│ └── vite-env.d.ts # Vite TypeScript declarations
├── index.html # HTML entry
├── package.json # Dependencies & scripts
├── tailwind.config.js # TailwindCSS config
├── vite.config.ts # Vite configuration
├── tsconfig.json # TypeScript configuration
└── README.md # Documentation

## Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/object-measurement-app.git
   cd object-measurement-app
Install Dependencies


2. ```bash
   npm install
Run the Development Server

4. ```bash
   npm run dev
The app will be available at: http://localhost:5173

6. ```bash
   npm run build
Build for Production

### Usage
--Place a reference object in the frame for calibration.
--The system automatically detects objects and displays their dimensions.
--Download results as a report for future use.

## Future Enhancements
--Add support for multiple reference objects (credit card, A4 paper,etc.)
--Support both Metric (cm) and Imperial (inch) units.
--Improve accuracy with more advanced AI models.
--Generate PDF reports of measurements.




