# 🚀 DelhiConnect Vercel Deployment Guide

DelhiConnect is structured as a monorepo with separate `client` (React/Vite) and `server` (Node.js/Express) directories. We recommend deploying them as **two separate projects** on Vercel for maximum reliability and ease of configuration.

---

## 🗄️ Part 1: Deploying the Backend (`server`)

1. **Import the Project on Vercel**:
   - In the Vercel dashboard, click **Add New** > **Project**.
   - Select your GitHub repository.
2. **Configure Settings**:
   - **Framework Preset**: Other (Vercel will auto-detect the Node.js runtime).
   - **Root Directory**: `server` (Click Edit next to Root Directory and select the `server` folder).
3. **Environment Variables**:
   - Add the following environment variables inside the Vercel dashboard settings:
     * `MONGODB_URI`: *Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)*.
     * `JWT_SECRET`: *A secure random string*.
     * `GEMINI_API_KEY`: *Your Google Gemini AI API key (or set to `mock` to use local rule-based routing)*.
     * `TWILIO_ACCOUNT_SID` (Optional): *Your Twilio Account SID*.
     * `TWILIO_AUTH_TOKEN` (Optional): *Your Twilio Auth Token*.
     * `TWILIO_WHATSAPP_FROM` (Optional): *Your Twilio WhatsApp Sandboxed phone number*.
4. **Deploy**:
   - Click **Deploy**. Vercel will build the serverless functions and output a backend URL (e.g., `https://delhiconnect-server.vercel.app`). Note this URL!

---

## 🌐 Part 2: Deploying the Frontend (`client`)

1. **Import the Project on Vercel**:
   - Click **Add New** > **Project** again, selecting the same repository.
2. **Configure Settings**:
   - **Framework Preset**: `Vite` (Vercel will auto-configure building with `npm run build` and serving the `dist` output folder).
   - **Root Directory**: `client` (Select the `client` folder).
3. **Environment Variables**:
   - Add the following environment variable:
     * `VITE_API_URL`: *The backend URL generated in Part 1 (e.g. `https://delhiconnect-server.vercel.app`)*. Make sure there is **no trailing slash** at the end.
4. **Deploy**:
   - Click **Deploy**. Vercel will compile the Vite assets and serve your React app (e.g., `https://delhiconnect-client.vercel.app`).

---

## ⚙️ Configuration Files Added
We have pre-configured Vercel routing rules in the codebase:
* [`client/vercel.json`](file:///c:/Users/ASUS/Downloads/DelhiConnect-/client/vercel.json): Configures route rewriting to `index.html` to prevent `404 Not Found` errors when refreshing React Router SPA pages directly.
* [`server/vercel.json`](file:///c:/Users/ASUS/Downloads/DelhiConnect-/server/vercel.json): Configures serverless request mapping to route all API calls to the Express `index.js` entrypoint.
