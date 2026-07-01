const fs = require('fs');
const exifParser = require('exif-parser');
const { classifyImage } = require('../services/imageClassifierService');

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Middleware: Computer Vision & Metadata Trust Verification Hook
 */
async function validateGrievanceUpload(req, res, next) {
  // Default values
  req.trustScore = 1.0;
  req.trustReason = 'No image uploaded to audit';

  if (!req.files || req.files.length === 0) {
    return next();
  }

  const file = req.files[0];
  try {
    const buffer = fs.readFileSync(file.path);
    
    // 1. EXIF Metadata Extraction and Auditing
    let trustScore = 1.0;
    let trustReason = 'Genuine upload verified';

    try {
      const parser = exifParser.create(buffer);
      const result = parser.parse();
      const exif = result.tags;

      const exifLat = exif.GPSLatitude;
      const exifLng = exif.GPSLongitude;
      const exifTime = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;

      if (!exifLat || !exifLng || !exifTime) {
        trustScore = 0.2;
        trustReason = 'Missing EXIF GPS coordinates or creation timestamp';
      } else {
        // Compare with user-declared coordinates
        let userLat = req.body.latitude;
        let userLng = req.body.longitude;

        if (!userLat && !userLng && req.body.gpsCoordinates) {
          try {
            const parsed = typeof req.body.gpsCoordinates === 'string' 
              ? JSON.parse(req.body.gpsCoordinates) 
              : req.body.gpsCoordinates;
            userLat = parsed.lat;
            userLng = parsed.lng;
          } catch (e) {}
        }

        if (userLat && userLng) {
          const distance = getHaversineDistance(Number(userLat), Number(userLng), Number(exifLat), Number(exifLng));
          if (distance > 500) {
            trustScore = 0.1;
            trustReason = `Location mismatch: Image captured ${Math.round(distance)}m away from declared coordinates`;
          }
        }
      }
    } catch (exifErr) {
      trustScore = 0.3;
      trustReason = 'No valid EXIF metadata found in image';
    }

    req.trustScore = trustScore;
    req.trustReason = trustReason;

    // 2. Image Classification (Selfie / Document / Nature filter)
    const classification = await classifyImage(buffer, file.originalname);
    const userCategory = req.body.category || '';
    
    const isPotholeCategory = userCategory.toLowerCase().includes('pothole') || 
                              userCategory.toLowerCase().includes('road') || 
                              userCategory.toLowerCase().includes('street');
    
    const bannedLabels = ['Selfie', 'Text/Document', 'Random Interior/Nature'];
    
    if (isPotholeCategory && bannedLabels.includes(classification.label)) {
      // Remove uploaded files to prevent disk leak
      req.files.forEach(f => {
        try { fs.unlinkSync(f.path); } catch (e) {}
      });

      return res.status(400).json({
        message: 'Complaint not accepted: Image content does not match the selected civic category.',
        error: 'Spam check triggered: AI identified content as ' + classification.label
      });
    }

    next();
  } catch (err) {
    console.error('validateGrievanceUpload error:', err);
    next(); // Fall-safe
  }
}

module.exports = { validateGrievanceUpload };
