import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { FiUpload, FiX, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ReceiptScanner({ onScanComplete }) {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      extractText(e.target.result);
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsDataURL(file);
  };

  const extractText = async (imageSrc) => {
    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageSrc,
        'eng',
        { 
          logger: m => console.log(m) 
        }
      );
      
      const parsedData = parseReceiptText(text);
      setResult(parsedData);
      if (onScanComplete) {
        onScanComplete(parsedData);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process receipt. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseReceiptText = (text) => {
    // This is a basic parser - you'll need to adjust based on receipt formats you expect
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Look for amounts (numbers with currency symbols)
    const amountMatch = text.match(/[£$€¥₹]?\s*\d+(\.\d{2})?/g);
    const amount = amountMatch ? parseFloat(amountMatch[amountMatch.length - 1].replace(/[^\d.-]/g, '')) : null;
    
    // Look for dates (common formats)
    const dateMatch = text.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/) || 
                     text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{1,2}(?:st|nd|rd|th)?[\s,]+\d{4}\b/i);
    
    // Try to extract merchant name (usually at the top)
    let merchant = lines.length > 0 ? lines[0].trim() : 'Unknown Merchant';
    
    // Try to find a category based on common keywords
    const categoryKeywords = {
      food: ['restaurant', 'cafe', 'food', 'eat', 'dine', 'coffee', 'bakery', 'pizza', 'burger', 'sushi'],
      groceries: ['market', 'grocery', 'supermarket', 'mart', 'foods', 'fresh', 'produce'],
      shopping: ['store', 'shop', 'mall', 'retail', 'outlet', 'boutique'],
      transportation: ['taxi', 'uber', 'lyft', 'gas', 'fuel', 'transit', 'metro', 'train', 'bus'],
      entertainment: ['movie', 'cinema', 'theater', 'concert', 'game', 'sports', 'gym', 'fitness'],
      bills: ['bill', 'payment', 'utilities', 'electric', 'water', 'internet', 'phone', 'mobile']
    };
    
    let category = 'other';
    const lowerText = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }

    return {
      amount,
      date: dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : null,
      merchant,
      category,
      rawText: text
    };
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div 
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <FiUpload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag & drop a receipt image here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WEBP
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative group">
            <img 
              src={image} 
              alt="Receipt preview" 
              className="max-h-64 w-auto mx-auto rounded-lg shadow-sm border border-gray-200"
            />
            <button
              onClick={resetScanner}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center space-x-2 text-blue-700">
              <FiLoader className="animate-spin w-5 h-5" />
              <span>Processing receipt...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start space-x-2 text-red-700">
              <FiAlertCircle className="flex-shrink-0 w-5 h-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && !isProcessing && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Merchant:</span>
                <span className="text-gray-700">{result.merchant}</span>
              </div>
              
              {result.amount && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Amount:</span>
                  <span className="font-semibold text-blue-600">
                    ₹{result.amount.toFixed(2)}
                  </span>
                </div>
              )}
              
              {result.date && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Date:</span>
                  <span className="text-gray-700">{result.date}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Category:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {result.category}
                </span>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <button
                  onClick={() => {
                    if (onScanComplete) onScanComplete(result);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Use This Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-2">
        We process your receipt images directly in your browser. Your data never leaves your device.
      </div>
    </div>
  );
}
