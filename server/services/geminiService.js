const { GoogleGenerativeAI } = require('@google/generative-ai');
const Complaint = require('../models/Complaint');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

function classifyRuleBased(text) {
  const textLower = String(text || '').toLowerCase();
  
  // Default fallback values
  let category = 'Other';
  let subCategory = 'General Inquiry';
  let priority = 'Low';
  let assignDepartment = 'General Administration';
  let confidence = 0.90;
  let reason = 'Rule-based local categorization fallback';

  if (
    textLower.includes('light') || textLower.includes('street light') || textLower.includes('dark') || 
    textLower.includes('electricity') || textLower.includes('power') || textLower.includes('wire') || 
    textLower.includes('blackout') || textLower.includes('bijli') || textLower.includes('andhera') || 
    textLower.includes('khamba') || textLower.includes('taar')
  ) {
    category = 'Street Light';
    subCategory = 'Non-functional Street Light';
    priority = 'Medium';
    assignDepartment = 'BSES Yamuna / BSES Rajdhani / Tata Power';
  } else if (
    textLower.includes('sewer') || textLower.includes('drain') || textLower.includes('drainage') || 
    textLower.includes('overflow') || textLower.includes('gutter') || textLower.includes('clog') || 
    textLower.includes('nala') || textLower.includes('naali')
  ) {
    category = 'Sewer Problem';
    subCategory = 'Sewer Line Blockage';
    priority = 'High';
    assignDepartment = 'Delhi Jal Board';
  } else if (
    textLower.includes('water') || textLower.includes('drinking water') || textLower.includes('dirty water') || 
    textLower.includes('no water') || textLower.includes('leakage') || textLower.includes('pipeline') || 
    textLower.includes('paani') || textLower.includes('pani')
  ) {
    category = 'Water Issue';
    subCategory = 'Water Supply Shortage';
    priority = 'High';
    assignDepartment = 'Delhi Jal Board';
  } else if (
    textLower.includes('garbage') || textLower.includes('waste') || textLower.includes('trash') || 
    textLower.includes('dump') || textLower.includes('dustbin') || textLower.includes('litter') || 
    textLower.includes('clean') || textLower.includes('kachra') || textLower.includes('kooda') || 
    textLower.includes('gandagi') || textLower.includes('safai')
  ) {
    category = 'Garbage / Waste';
    subCategory = 'Solid Waste Accumulation';
    priority = 'Medium';
    assignDepartment = 'MCD - Municipal Corporation';
  } else if (
    textLower.includes('pothole') || textLower.includes('road') || textLower.includes('pavement') || 
    textLower.includes('tar') || textLower.includes('crater') || textLower.includes('sadak') || 
    textLower.includes('rasta') || textLower.includes('gaddha') || textLower.includes('khadda')
  ) {
    category = 'Pothole / Road Damage';
    subCategory = 'Road Pothole';
    priority = 'High';
    assignDepartment = 'PWD - Public Works Department';
  } else if (
    textLower.includes('health') || textLower.includes('hospital') || textLower.includes('clinic') || 
    textLower.includes('disease') || textLower.includes('dengue') || textLower.includes('malaria') || 
    textLower.includes('mosquito')
  ) {
    category = 'Health Issue';
    subCategory = 'Public Health Concern';
    priority = 'High';
    assignDepartment = 'Health Dept';
  } else if (
    textLower.includes('danger') || textLower.includes('hazard') || textLower.includes('threat') || 
    textLower.includes('collapse') || textLower.includes('falling') || textLower.includes('dangerous') || 
    textLower.includes('unsafe')
  ) {
    category = 'Dangerous Condition';
    subCategory = 'Hazardous Structure';
    priority = 'Critical';
    assignDepartment = 'Delhi Police';
  } else if (
    textLower.includes('park') || textLower.includes('garden') || textLower.includes('tree') || 
    textLower.includes('plant') || textLower.includes('green') || textLower.includes('lawn') || 
    textLower.includes('branch') || textLower.includes('environment')
  ) {
    category = 'Environment Issue';
    subCategory = 'Horticulture Maintenance';
    priority = 'Medium';
    assignDepartment = 'MCD - Municipal Corporation';
  } else if (
    textLower.includes('noise') || textLower.includes('loudspeaker') || textLower.includes('sound') || 
    textLower.includes('horn') || textLower.includes('dj') || textLower.includes('disturbance')
  ) {
    category = 'Noise Complaint';
    subCategory = 'Loudspeaker Nuisance';
    priority = 'Low';
    assignDepartment = 'Delhi Police';
  } else if (
    textLower.includes('police') || textLower.includes('theft') || textLower.includes('crime') || 
    textLower.includes('robbery') || textLower.includes('security') || textLower.includes('patrol')
  ) {
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

async function categorizeComplaint(text) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
    return classifyRuleBased(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a civic complaint classifier for Delhi Government.
Analyze this complaint and return ONLY a valid JSON object (no markdown, no explanation):
{
  "category": "one of [Roads, Water Supply, Electricity, Sanitation, Public Safety, Health, Parks, Education, Other, Pothole / Road Damage, Garbage / Waste, Street Light, Sewer Problem, Water Issue]",
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
    console.error('Gemini AI Error:', err.message, '- Falling back to local classifier');
    return classifyRuleBased(text);
  }
}

async function handleChat(text, user, coordinates) {
  const textLower = text.toLowerCase().trim();

  // 1. Identify if it is a general query or greeting vs. a complaint registration.
  const queryKeywords = [
    'how many', 'which', 'what', 'who', 'why', 'where', 'show', 'list', 'status', 
    'track', 'hello', 'hi', 'namaskar', 'help', 'summary', 'stats', 'analytics', 
    'number of', 'total', 'complaint count', 'most'
  ];
  
  const isQuery = queryKeywords.some(kw => textLower.includes(kw)) || textLower.endsWith('?');

  if (isQuery) {
    try {
      const [total, pending, inProgress, resolved] = await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: { $in: ['Pending', 'Submitted', 'Assigned', 'Reopened'] } }),
        Complaint.countDocuments({ status: 'In Progress' }),
        Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
      ]);

      const categories = await Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const departments = await Complaint.aggregate([
        { $group: { _id: '$assignedDepartment', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Check specific types of queries first (rule-based fallback/primary)
      if (textLower.includes('most') && (textLower.includes('category') || textLower.includes('complaint'))) {
        if (categories.length > 0) {
          const topCat = categories[0];
          return {
            type: 'text',
            text: `📊 **Category Analytics:** The category with the most complaints is **${topCat._id || 'Other'}** with **${topCat.count}** complaints registered.`
          };
        } else {
          return {
            type: 'text',
            text: `📊 **Category Analytics:** No complaints have been registered yet, so we don't have a top category.`
          };
        }
      }

      if (textLower.includes('how many') || textLower.includes('total') || textLower.includes('pending') || textLower.includes('resolved') || textLower.includes('progress')) {
        let statsText = `📊 **Current Portal Statistics:**\n`;
        statsText += `• **Total Complaints:** ${total}\n`;
        statsText += `• **Pending/Submitted:** ${pending}\n`;
        statsText += `• **In Progress:** ${inProgress}\n`;
        statsText += `• **Resolved/Closed:** ${resolved}`;
        return { type: 'text', text: statsText };
      }

      if (textLower.includes('how') && textLower.includes('file')) {
        return {
          type: 'text',
          text: `📝 **How to file a complaint:**\n1. Click the **"+ File Complaint"** button on the left sidebar.\n2. Fill in the title, detailed description, and choose the area.\n3. Upload a photo or record a voice note for faster verification.\n4. Click **Submit** to register your grievance. You can track its status using the unique Grievance ID.`
        };
      }

      if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('namaskar')) {
        return {
          type: 'text',
          text: `Namaskar! I am your Delhi Connect Assistant. Aap apni civic grievance yahan type kar sakte hain. Main ise automatically sahi department ko forward kar dunga. Aap portal statistics ke baare mein bhi pooch sakte hain.`
        };
      }

      // Try using Gemini if API key is set
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock') {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const statsContext = `DelhiConnect Current Stats:
Total registered: ${total}
Pending/Submitted: ${pending}
In Progress: ${inProgress}
Resolved/Closed: ${resolved}
Categories: ${categories.map(c => `${c._id || 'Other'}: ${c.count}`).join(', ')}
Departments: ${departments.map(d => `${d._id || 'Unassigned'}: ${d.count}`).join(', ')}`;

          const prompt = `You are the Delhi Connect AI Assistant, an online helper for the Delhi Government's CM Grievance Portal.
Answer the user's question politely and concisely. Use the real-time system stats context provided below if relevant to answer the query correctly.

${statsContext}

User Query: "${text}"
Answer:`;

          const result = await model.generateContent(prompt);
          return { type: 'text', text: result.response.text().trim() };
        } catch (err) {
          console.error('Gemini query failure:', err.message);
        }
      }

      // Rule-based generic response if Gemini is not working
      return {
        type: 'text',
        text: `🤖 **Delhi Connect Assistant:**\nI am online to assist you! Currently, there are **${total}** total complaints on the portal (**${pending}** pending, **${inProgress}** in progress, **${resolved}** resolved). \n\nIf you want to file a new complaint, please describe the issue (e.g. "street light is broken").`
      };

    } catch (dbErr) {
      console.error('Database query error in chat:', dbErr.message);
      return {
        type: 'text',
        text: `Namaskar! I am your Delhi Connect Assistant. Aap apni civic grievance yahan type kar sakte hain, ya general queries pooch sakte hain.`
      };
    }
  }

  // Otherwise, treat it as a complaint registration!
  const complaintData = await categorizeComplaint(text);
  
  let grievanceId = '';
  try {
    const getZoneAndOfficer = (lat, lng, category) => {
      let zoneNum = 1;
      if (lat && lng) {
        zoneNum = (Math.floor((Number(lat) + Number(lng)) * 100) % 4) + 1;
      } else {
        zoneNum = Math.floor(Math.random() * 4) + 1;
      }

      let department = 'General Administration';
      const catLower = String(category || '').toLowerCase();
      if (catLower.includes('garbage') || catLower.includes('waste') || catLower.includes('sewer') || catLower.includes('sanitation')) {
        department = 'Sanitation';
      } else if (catLower.includes('pothole') || catLower.includes('road')) {
        department = 'Public Works Department (PWD)';
      } else if (catLower.includes('light') || catLower.includes('electricity')) {
        department = 'Electricity';
      } else if (catLower.includes('water')) {
        department = 'Water Supply';
      } else if (catLower.includes('police') || catLower.includes('safety') || catLower.includes('dangerous') || catLower.includes('noise')) {
        department = 'Police / Safety';
      } else if (catLower.includes('health')) {
        department = 'Health Dept';
      } else if (catLower.includes('environment') || catLower.includes('park')) {
        department = 'Parks & Gardens';
      }

      const ward = `Ward ${zoneNum * 10 + (Math.floor((Number(lat) || 28.6) * 1000) % 9 + 1)}`;
      const assignedDepartment = `Zone ${zoneNum} ${department} Officer`;
      return { ward, assignedDepartment };
    };

    let geoRouting = { ward: 'Ward 11', assignedDepartment: complaintData.assignDepartment };
    let district = 'Central Delhi';

    if (coordinates && coordinates.lat && coordinates.lng) {
      geoRouting = getZoneAndOfficer(coordinates.lat, coordinates.lng, complaintData.category);
      
      const districts = [
        'New Delhi', 'Central Delhi', 'South Delhi', 'South West Delhi', 
        'West Delhi', 'North West Delhi', 'North Delhi', 'North East Delhi', 
        'East Delhi', 'Shahdara', 'South East Delhi'
      ];
      const idx = Math.abs(Math.floor((Number(coordinates.lat) + Number(coordinates.lng)) * 100)) % districts.length;
      district = districts[idx];
    }

    const newComplaint = new Complaint({
      description: text,
      category: complaintData.category,
      subCategory: complaintData.subCategory,
      priority: complaintData.priority,
      assignedDepartment: geoRouting.assignedDepartment || complaintData.assignDepartment,
      ward: geoRouting.ward,
      district: district,
      coordinates: coordinates ? { lat: Number(coordinates.lat), lng: Number(coordinates.lng) } : undefined,
      address: coordinates ? `NCT of Delhi, India (Approx. Lat: ${Number(coordinates.lat).toFixed(4)}, Lng: ${Number(coordinates.lng).toFixed(4)})` : 'Delhi, India',
      citizenId: user ? user._id : undefined,
      citizenName: user ? user.name : 'Citizen (Chatbot)',
      citizenPhone: user ? user.phone : undefined,
      status: 'Submitted'
    });
    const saved = await newComplaint.save();
    grievanceId = saved.grievanceId;
  } catch (err) {
    console.error('Error saving chatbot complaint to DB:', err.message);
  }

  return {
    type: 'complaint',
    data: {
      ...complaintData,
      grievanceId: grievanceId
    }
  };
}

module.exports = { categorizeComplaint, handleChat };
