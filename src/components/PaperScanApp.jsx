import React, { useState, useRef, useCallback } from 'react';
import { Camera, FileText, BarChart3, Download, Edit3, Trash2, Plus } from 'lucide-react';

const PaperScanApp = () => {
  const [currentStep, setCurrentStep] = useState('scan');
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [detectedData, setDetectedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Simulated OCR processing
  const processImage = useCallback((imageData) => {
    setIsProcessing(true);
    
    // Simulate OCR processing delay
    setTimeout(() => {
      // Simulated extracted text
      const mockText = `Meeting Notes - Project Alpha
Date: July 10, 2025
Attendees: John, Sarah, Mike

Key Points:
- Budget approval needed for Q3
- Timeline revised to 6 months
- Team expansion by 3 members

Sales Data:
Quarter 1: 150
Quarter 2: 220
Quarter 3: 180
Quarter 4: 290

Action Items:
1. Prepare budget proposal
2. Update project timeline
3. Begin recruitment process`;

      // Detect numerical data for charts
      const dataPattern = /(\w+\s*\d+):\s*(\d+)/g;
      const matches = [...mockText.matchAll(dataPattern)];
      const chartData = matches.map(match => ({
        label: match[1],
        value: parseInt(match[2])
      }));

      setExtractedText(mockText);
      setDetectedData(chartData);
      setIsProcessing(false);
      setCurrentStep('edit');
    }, 2000);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Stop camera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
      
      // Process the image
      processImage(imageData);
    }
  };

  const generatePDF = () => {
    // Create a simple PDF-like document
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Scanned Document</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { white-space: pre-wrap; margin-bottom: 30px; }
        .chart { margin: 20px 0; }
        .chart-bar { display: flex; align-items: center; margin: 5px 0; }
        .chart-label { width: 120px; font-size: 14px; }
        .chart-value { margin-left: 10px; font-weight: bold; }
        .bar { height: 20px; background: #3b82f6; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Scanned Document</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="content">${extractedText}</div>
    ${detectedData.length > 0 ? `
    <div class="chart">
        <h3>Data Visualization</h3>
        ${detectedData.map(item => `
        <div class="chart-bar">
            <div class="chart-label">${item.label}:</div>
            <div class="bar" style="width: ${(item.value / Math.max(...detectedData.map(d => d.value))) * 200}px;"></div>
            <div class="chart-value">${item.value}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `;

    // Create and download the file
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scanned-document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restartScan = () => {
    setCapturedImage(null);
    setExtractedText('');
    setDetectedData([]);
    setCurrentStep('scan');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">PaperScan Pro</h1>
          <p className="text-gray-600">Scan handwritten documents and convert to digital format</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'scan' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Camera size={20} />
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Edit3 size={20} />
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'export' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Download size={20} />
            </div>
          </div>
        </div>

        {/* Scan Step */}
        {currentStep === 'scan' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Scan Document</h2>
            
            {!isCameraActive && !capturedImage && (
              <div className="text-center py-12">
                <Camera size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-6">Click to start camera and scan your document</p>
                <button
                  onClick={startCamera}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            )}

            {isCameraActive && (
              <div className="text-center">
                <div className="relative inline-block">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="max-w-full h-80 rounded-lg border"
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none opacity-50"></div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={capturePhoto}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Capture Photo
                  </button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Processing document...</p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Edit Step */}
        {currentStep === 'edit' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Review and Edit</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Captured Image */}
              {capturedImage && (
                <div>
                  <h3 className="font-medium mb-2">Captured Image</h3>
                  <img 
                    src={capturedImage} 
                    alt="Captured document" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Extracted Text */}
              <div>
                <h3 className="font-medium mb-2">Extracted Text</h3>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-48 p-3 border rounded-lg resize-none font-mono text-sm"
                  placeholder="Extracted text will appear here..."
                />
              </div>
            </div>

            {/* Detected Data */}
            {detectedData.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Detected Data for Charts</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {detectedData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-blue-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={restartScan}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Trash2 size={16} />
                <span>Start Over</span>
              </button>
              <button
                onClick={() => setCurrentStep('export')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue to Export
              </button>
            </div>
          </div>
        )}

        {/* Export Step */}
        {currentStep === 'export' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Export Document</h2>
            
            {/* Preview */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-medium mb-4">Document Preview</h3>
              <div className="bg-white p-4 rounded border text-sm">
                <div className="text-center mb-4">
                  <h4 className="font-bold">Scanned Document</h4>
                  <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="whitespace-pre-wrap text-sm mb-4">{extractedText}</div>
                
                {detectedData.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Data Visualization</h4>
                    <div className="space-y-2">
                      {detectedData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-24 text-sm">{item.label}:</span>
                          <div 
                            className="h-4 bg-blue-500 rounded"
                            style={{ width: `${(item.value / Math.max(...detectedData.map(d => d.value))) * 100}px` }}
                          ></div>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('edit')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <div className="space-x-3">
                <button
                  onClick={generatePDF}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download Document</span>
                </button>
                <button
                  onClick={restartScan}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperScanApp;
