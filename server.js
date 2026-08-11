const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Secure Municipal Credentials for Tirunelveli Smart Drainage Portal
const MUNICIPAL_CREDENTIALS = {
  username: "TNL_ADMIN",
  password: "TNL_SECURE_2026"
};

// Default Telemetry Node Template
const initialNodeState = () => ({
  gasPPM: 0,
  waterLevelCM: 0,
  flowRateLPM: 0,
  isRaining: false,
  status: "NORMAL",
  lastUpdated: "OFFLINE",
  isActive: false
});

// Municipal Node Registry for Tirunelveli City Municipal Corporation
let municipalData = {
  "D1": { 
    name: "Thamirabarani River Sub-Basin Outfall", 
    zone: "Zone 01 - Palayamkottai", 
    lat: "8.7132° N", 
    long: "77.7567° E", 
    isActive: true, 
    ...initialNodeState() 
  },
  "D2": { 
    name: "Tirunelveli Junction Arterial Drain", 
    zone: "Zone 02 - Town / Junction", 
    lat: "8.7289° N", 
    long: "77.7081° E", 
    isActive: true, 
    ...initialNodeState() 
  },
  "D3": { 
    name: "Melapalayam Canal Overflow Channel", 
    zone: "Zone 03 - Melapalayam", 
    lat: "8.7011° N", 
    long: "77.7250° E", 
    isActive: false, 
    ...initialNodeState() 
  },
  "D4": { 
    name: "Tirunelveli West Collector Drain", 
    zone: "Zone 04 - Pettai", 
    lat: "8.7420° N", 
    long: "77.6852° E", 
    isActive: false, 
    ...initialNodeState() 
  },
  "D5": { 
    name: "Vannarpettai Storm Outfall Conduit", 
    zone: "Zone 01 - Vannarpettai", 
    lat: "8.7215° N", 
    long: "77.7310° E", 
    isActive: false, 
    ...initialNodeState() 
  }
};

// 1. Municipal Authentication Endpoint
app.post('/api/login', (req, res) => {
  const { username, password, city } = req.body;

  if (city !== "Tirunelveli") {
    return res.status(403).json({ 
      success: false, 
      message: `SCADA Monitoring for ${city} is currently out of scope. Operation restricted to Tirunelveli City Corporation.` 
    });
  }

  if (username === MUNICIPAL_CREDENTIALS.username && password === MUNICIPAL_CREDENTIALS.password) {
    return res.json({ success: true, message: "Authentication successful." });
  } else {
    return res.status(401).json({ success: false, message: "Invalid Officer Identification or Security Key." });
  }
});

// 2. Hardware Telemetry Ingest Endpoint (from ESP32)
app.post('/api/update', (req, res) => {
  const { drainageId, gas, level, flow, rain } = req.body;

  if (!drainageId || !municipalData[drainageId]) {
    return res.status(400).json({ success: false, message: "Invalid SCADA Node Identification." });
  }

  // Calibrated Threat Classification Engine:
  // NORMAL: Gas < 350 PPM AND Water Level <= 25 cm
  // WARNING: Gas 350 - 649 PPM OR Water Level 26 - 45 cm
  // CRITICAL ALARM: Gas >= 650 PPM OR Water Level > 45 cm
  let status = "NORMAL";
  
  if (gas >= 350 || level > 25) {
    status = "WARNING";
  }
  if (gas >= 650 || level > 45) {
    status = "CRITICAL ALARM";
  }

  // Update telemetry record
  municipalData[drainageId] = {
    ...municipalData[drainageId],
    gasPPM: gas ?? municipalData[drainageId].gasPPM,
    waterLevelCM: level ?? municipalData[drainageId].waterLevelCM,
    flowRateLPM: flow ?? municipalData[drainageId].flowRateLPM,
    isRaining: rain ?? municipalData[drainageId].isRaining,
    status: status,
    lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
    isActive: true
  };

  res.json({ success: true, message: `Telemetry ingested for Node ${drainageId}.` });
});

// 3. Live Telemetry Fetch Endpoint (for Frontend Dashboard)
app.get('/api/live', (req, res) => {
  res.json(municipalData);
});

// Start Express Application
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🏛️ Tirunelveli Smart Sewage SCADA Operational on Port ${PORT}`));