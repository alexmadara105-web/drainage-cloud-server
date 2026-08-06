const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Secure Official Municipal Credentials
const MUNICIPAL_CREDENTIALS = {
  username: "GCC_ADMIN",
  password: "GCC_SECURE_2026"
};

// Initial Municipal Node Registry for Greater Chennai Corporation
const initialNodeState = () => ({
  gasPPM: 0,
  waterLevelCM: 0,
  flowRateLPM: 0,
  isRaining: false,
  status: "NORMAL",
  lastUpdated: "OFFLINE",
  isActive: false
});

let municipalData = {
  "D1": { 
    name: "Cooum River Arterial Trunk (Culvert 04-A)", 
    zone: "Zone 08 - Anna Nagar", 
    lat: "13.0827° N", 
    long: "80.2707° E", 
    isActive: true, 
    ...initialNodeState() 
  },
  "D2": { 
    name: "Buckingham Canal Sub-Basin Outfall", 
    zone: "Zone 09 - T. Nagar / Saidapet", 
    lat: "13.0221° N", 
    long: "80.2311° E", 
    isActive: true, 
    ...initialNodeState() 
  },
  "D3": { 
    name: "Velachery Lake Flood Overflow Conduit", 
    zone: "Zone 13 - Velachery", 
    lat: "12.9815° N", 
    long: "80.2180° E", 
    isActive: false, 
    ...initialNodeState() 
  },
  "D4": { 
    name: "Adyar River Basin Collector", 
    zone: "Zone 10 - Adyar South", 
    lat: "13.0067° N", 
    long: "80.2571° E", 
    isActive: false, 
    ...initialNodeState() 
  },
  "D5": { 
    name: "Royapuram Coastal Storm Drain Outfall", 
    zone: "Zone 05 - Royapuram", 
    lat: "13.1137° N", 
    long: "80.2954° E", 
    isActive: false, 
    ...initialNodeState() 
  }
};

// Authentication Endpoint
app.post('/api/login', (req, res) => {
  const { username, password, city } = req.body;

  if (city !== "Chennai") {
    return res.status(403).json({ 
      success: false, 
      message: `SCADA Monitoring for ${city} is currently out of scope. Operation restricted to Chennai Metropolitan Region.` 
    });
  }

  if (username === MUNICIPAL_CREDENTIALS.username && password === MUNICIPAL_CREDENTIALS.password) {
    return res.json({ success: true, message: "Authentication successful." });
  } else {
    return res.status(401).json({ success: false, message: "Invalid Officer Identification or Security Key." });
  }
});

// Telemetry Data Ingest Endpoint from ESP32
app.post('/api/update', (req, res) => {
  const { drainageId, gas, level, flow, rain } = req.body;

  if (!drainageId || !municipalData[drainageId]) {
    return res.status(400).json({ success: false, message: "Invalid SCADA Node Identification." });
  }

  let status = "NORMAL";
  if (gas > 250 || level > 25) status = "WARNING";
  if (gas > 550 || level > 45) status = "CRITICAL ALARM";

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

// Fetch Live Telemetry Data Endpoint
app.get('/api/live', (req, res) => {
  res.json(municipalData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🏛️ Chennai Smart Sewage SCADA Operational on Port ${PORT}`));