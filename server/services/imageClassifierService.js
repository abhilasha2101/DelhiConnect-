const fs = require('fs');

/**
 * Mock Image Classifier Service
 * Simulates a MobileNet / CNN model analyzing an image buffer.
 */
async function classifyImage(buffer, filename) {
  const name = String(filename || '').toLowerCase();
  
  // Rule-based categorization based on filename patterns
  if (name.includes('selfie') || name.includes('face') || name.includes('profile') || name.includes('person')) {
    return { label: 'Selfie', confidence: 0.96 };
  }
  if (name.includes('doc') || name.includes('text') || name.includes('paper') || name.includes('invoice') || name.includes('receipt') || name.includes('bill')) {
    return { label: 'Text/Document', confidence: 0.92 };
  }
  if (name.includes('room') || name.includes('interior') || name.includes('desk') || name.includes('furniture') || name.includes('nature') || name.includes('flower') || name.includes('cat') || name.includes('dog')) {
    return { label: 'Random Interior/Nature', confidence: 0.89 };
  }
  if (name.includes('garbage') || name.includes('trash') || name.includes('litter') || name.includes('dump')) {
    return { label: 'Garbage / Waste', confidence: 0.93 };
  }
  if (name.includes('pothole') || name.includes('road') || name.includes('crack') || name.includes('asphalt') || name.includes('street')) {
    return { label: 'Road Pothole', confidence: 0.95 };
  }

  // Default fallback class
  return { label: 'Road Pothole', confidence: 0.90 };
}

module.exports = { classifyImage };
