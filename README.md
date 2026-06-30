# 🏛️ DelhiConnect: Chief Minister's Grievance & Public Services Portal

DelhiConnect is a modern, responsive, and feature-rich civic grievance registration and administrative tracking system designed for the National Capital Territory of Delhi. Enabled with Gemini AI smart routing, full Hindi/English bilingual support, geospatial hotspot mapping, and automatic PDF report generation, it bridges the gap between citizens and local governance.

---

## 🌟 Key Features

### 1. 📝 Citizen Grievance Registration
- **AI Smart Routing**: Automatically classifies complaint category, priority, and target department based on the user's description using Gemini AI.
- **Bilingual Interface**: Toggles seamlessly between English and Hindi, complete with localized timestamps, status badges, and department names.
- **Multimedia Support**: Allows uploading up to 3 photos of the issue via camera or gallery.
- **Voice Input**: Features built-in voice search/dictation for hands-free typing.
- **Social Sharing**: Encourages citizens to share their submitted concerns on Facebook and X (Twitter) with tracking links.
- **Automatic Hotspot Consolidation**: Intelligently groups duplicate reports filed near each other into a single "hotspot" to prevent dashboard clutter.

### 2. 🏛️ Public Services Linkage
- Direct links to Delhi Municipal Corporation utility services (Property Tax, Birth/Death Certificates, Ration Card, Driving License, Voter ID, and utility connections).

### 3. 🚨 Emergency Helplines
- Quick-call government hotlines (Police, Ambulance, Fire, Women Safety, Disaster Management, and the CM Helpline).

### 4. 📍 Facility Locator ("What's Near Me")
- Instantly detects live GPS coordinates and queries nearest hospitals, police stations, railways, metro stations, parks, schools, ATMs, and pharmacies.

### 5. 👮 Officer Field App
- Real-time attendance check-ins, toilet inspection logging, and GPS observation entries for administrative field workers.

### 6. 📊 Admin & Analytics Dashboard
- **Zonal Complaint Map**: Dynamic Leaflet map displaying heatmaps and coordinates pins of all submitted grievances.
- **Trends & Performance**: Track monthly volumes, resolution percentages, and district-wise SLA breaches via Recharts.
- **PDF Report Generator**: Instantly compile real-time performance summaries using server-side PDFKit.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Vanilla CSS, Tailwind CSS, Recharts, Leaflet, i18next, React Hot Toast |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Google Generative AI SDK, PDFKit |
| **Integrations** | Gemini 1.5 Flash (Categorization), Twilio (Mock WhatsApp Notifications) |

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or Atlas cloud cluster)
- **Gemini API Key** (For real AI categorization; defaults to mock responses if omitted)

### 📥 Installation & Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/abhilasha2101/DelhiConnect-.git
   cd DelhiConnect-
   ```

2. **Install Dependencies**:
   Install client and server packages simultaneously from the root:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `/server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/delhiconnect
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Seed the Database**:
   Populate MongoDB with departments, administrative accounts, and 200 dummy complaints across Delhi's 11 districts:
   ```bash
   npm run seed
   ```

5. **Run the Application**:
   Start the backend and frontend dev servers concurrently:
   - Run backend: `npm run dev:server` (Server will start on port `5000`)
   - Run frontend: `npm run dev:client` (Client will launch on port `5173` or `5174`)

---

## 👤 Quick Access Credentials

For testing and demonstration, use the seeded login accounts below:

| Role | Username / Email / Phone | Password |
|---|---|---|
| **Admin** | `admin@delhi.gov.in` | `admin123` |
| **Officer** | `officer.roads@delhi.gov.in` | `officer123` |
| **Citizen** | `+919876543210` | `citizen123` |
