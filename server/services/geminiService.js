const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

async function categorizeComplaint(text) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
    const textLower = String(text || '').toLowerCase();
    
    // Default fallback values
    let category = 'Other';
    let subCategory = 'General Inquiry';
    let priority = 'Low';
    let assignDepartment = 'General Administration';
    let confidence = 0.90;
    let reason = 'Rule-based categorization';

    if (textLower.includes('garbage') || textLower.includes('waste') || textLower.includes('trash') || textLower.includes('dump') || textLower.includes('dustbin') || textLower.includes('litter') || textLower.includes('clean')) {
      category = 'Garbage / Waste';
      subCategory = 'Solid Waste Accumulation';
      priority = 'Medium';
      assignDepartment = 'MCD - Municipal Corporation';
    } else if (textLower.includes('pothole') || textLower.includes('road') || textLower.includes('damage') || textLower.includes('pavement') || textLower.includes('street')) {
      category = 'Pothole / Road Damage';
      subCategory = 'Road Pothole';
      priority = 'High';
      assignDepartment = 'PWD - Public Works Department';
    } else if (textLower.includes('sewer') || textLower.includes('drain') || textLower.includes('drainage') || textLower.includes('overflow') || textLower.includes('gutter') || textLower.includes('clog')) {
      category = 'Sewer Problem';
      subCategory = 'Sewer Line Blockage';
      priority = 'High';
      assignDepartment = 'Delhi Jal Board';
    } else if (textLower.includes('light') || textLower.includes('street light') || textLower.includes('dark') || textLower.includes('electricity') || textLower.includes('power') || textLower.includes('wire') || textLower.includes('blackout')) {
      category = 'Street Light';
      subCategory = 'Non-functional Street Light';
      priority = 'Medium';
      assignDepartment = 'BSES Yamuna / BSES Rajdhani / Tata Power';
    } else if (textLower.includes('water') || textLower.includes('drinking water') || textLower.includes('dirty water') || textLower.includes('no water') || textLower.includes('leakage') || textLower.includes('pipeline')) {
      category = 'Water Issue';
      subCategory = 'Water Supply Shortage';
      priority = 'High';
      assignDepartment = 'Delhi Jal Board';
    } else if (textLower.includes('health') || textLower.includes('hospital') || textLower.includes('clinic') || textLower.includes('disease') || textLower.includes('dengue') || textLower.includes('malaria') || textLower.includes('mosquito')) {
      category = 'Health Issue';
      subCategory = 'Public Health Concern';
      priority = 'High';
      assignDepartment = 'Health Dept';
    } else if (textLower.includes('danger') || textLower.includes('hazard') || textLower.includes('threat') || textLower.includes('collapse') || textLower.includes('falling') || textLower.includes('dangerous') || textLower.includes('unsafe')) {
      category = 'Dangerous Condition';
      subCategory = 'Hazardous Structure';
      priority = 'Critical';
      assignDepartment = 'Delhi Police';
    } else if (textLower.includes('park') || textLower.includes('garden') || textLower.includes('tree') || textLower.includes('plant') || textLower.includes('green') || textLower.includes('lawn') || textLower.includes('branch') || textLower.includes('environment')) {
      category = 'Environment Issue';
      subCategory = 'Horticulture Maintenance';
      priority = 'Medium';
      assignDepartment = 'MCD - Municipal Corporation';
    } else if (textLower.includes('noise') || textLower.includes('loudspeaker') || textLower.includes('sound') || textLower.includes('horn') || textLower.includes('dj') || textLower.includes('disturbance')) {
      category = 'Noise Complaint';
      subCategory = 'Loudspeaker Nuisance';
      priority = 'Low';
      assignDepartment = 'Delhi Police';
    } else if (textLower.includes('police') || textLower.includes('theft') || textLower.includes('crime') || textLower.includes('robbery') || textLower.includes('security') || textLower.includes('patrol')) {
      category = 'Police Issue';
      subCategory = 'Law and Order Patrol Request';
      priority = 'High';
      assignDepartment = 'Delhi Police';
    }

    return {
      category,
      subCategory,
      priority,
      assignDepartment,
      confidence,
      reason
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a civic complaint classifier for Delhi Government.
Analyze this complaint and return ONLY a valid JSON object (no markdown, no explanation):
{
  "category": "one of [Roads, Water Supply, Electricity, Sanitation, Public Safety, Health, Parks, Education, Other]",
  "subCategory": "specific sub-type string",
  "priority": "one of [Low, Medium, High, Critical]",
  "assignDepartment": "relevant Delhi department name",
  "confidence": 0.0,
  "reason": "brief explanation"
}

Complaint: ${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON in response');
  } catch (err) {
    console.error('Gemini AI Error:', err.message);
    return {
      category: 'Other',
      subCategory: 'General',
      priority: 'Medium',
      assignDepartment: 'General Administration',
      confidence: 0.5,
      reason: 'AI categorization failed - manual review required'
    };
  }
}

module.exports = { categorizeComplaint };
