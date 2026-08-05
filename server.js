const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Initialize Municipal Drainage Nodes for Greater Chennai Corporation
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
    name: "Cooum Basin Main Trunk (Culvert 04-A)", 
    zone: "Zone 08 - Anna Nagar", 
    lat: "13.0827° N", 
    long: "80.2707° E", 
    isActive: true, 
    ...initialNodeState() 
  },
  "D2": { 
    name: "Buckingham Canal Arterial Drain", 
    zone: "Zone 09 - T. Nagar / Saidapet", 
    lat: "13.0221° N", 
    long: "80.2311° E", 
    isActive: true, 
    ...initialNodeState() 
  },
  "D3": { 
    name: "Velachery Lake Overflow Channel", 
    zone: "Zone 13 - Velachery", 
    lat: "12.9815° N", 
    long: "80.2180° E", 
    isActive: false, 
    ...initialNodeState() 
  },
  "D4": { 
    name: "Adyar River Sub-Basin Outfall", 
    zone: "Zone 10 - Adyar South", 
    lat: "13.0067° N", 
    long: "80.2571° E", 
    isActive: false, 
    ...initialNodeState() 
  },
  "D5": { 
    name: "Royapuram Coastal Storm Outfall", 
    zone: "Zone 05 - Royapuram", 
    lat: "13.1137° N", 
    long: "80.2954° E", 
    isActive: false, 
    ...initialNodeState() 
  }
};

// API Endpoint for ESP32 / Wokwi Telemetry Push
app.post('/api/update', (req, res) => {
  const { drainageId, gas, level, flow, rain } = req.body;

  if (!drainageId || !municipalData[drainageId]) {
    return res.status(400).json({ success: false, message: "Invalid Municipal Drainage Node ID" });
  }

  // Industrial Threat Level Assessment
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

  console.log(`[GCC SCADA] Telemetry Ingest - ${drainageId}:`, municipalData[drainageId]);
  res.json({ success: true, message: `Node ${drainageId} telemetry ingested successfully.` });
});

// Endpoint to fetch live telemetry stream
app.get('/api/live', (req, res) => {
  res.json(municipalData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🏛️ Greater Chennai Municipal SCADA Server Operational on Port ${PORT}`));