const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static dashboard UI
app.use(express.static(path.join(__dirname, 'public')));

// Initialize 5 Drainage Status Objects
const initialDrainState = () => ({
  gasPPM: 0,
  waterLevelCM: 0,
  flowRateLPM: 0,
  isRaining: false,
  status: "Normal",
  lastUpdated: "Never"
});

let systemData = {
  "D1": { name: "Main Avenue Drain", ...initialDrainState() },
  "D2": { name: "Market Street Drain", ...initialDrainState() },
  "D3": { name: "Community Center Drain", ...initialDrainState() },
  "D4": { name: "Industrial Park Drain", ...initialDrainState() },
  "D5": { name: "Residential Alley Drain", ...initialDrainState() }
};

// Update Endpoint for ESP32 / Test inputs
app.post('/api/update', (req, res) => {
  const { drainageId, gas, level, flow, rain } = req.body;

  if (!drainageId || !systemData[drainageId]) {
    return res.status(400).json({ success: false, message: "Invalid or missing drainageId" });
  }

  // Automatic status calculation
  let status = "Normal";
  if (gas > 200 || level > 20) status = "Alert ⚠️";
  if (gas > 500 || level > 40) status = "Critical 🚨";

  systemData[drainageId] = {
    ...systemData[drainageId],
    gasPPM: gas ?? systemData[drainageId].gasPPM,
    waterLevelCM: level ?? systemData[drainageId].waterLevelCM,
    flowRateLPM: flow ?? systemData[drainageId].flowRateLPM,
    isRaining: rain ?? systemData[drainageId].isRaining,
    status: status,
    lastUpdated: new Date().toLocaleTimeString()
  };

  console.log(`Updated ${drainageId}:`, systemData[drainageId]);
  res.json({ success: true, message: `${drainageId} updated successfully.` });
});

// Endpoint to fetch live status
app.get('/api/live', (req, res) => {
  res.json(systemData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Multi-Drainage Server running on port ${PORT}`));