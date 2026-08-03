const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static UI files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize 5 Drainage Status Objects
const initialDrainState = () => ({
  gasPPM: 0,
  waterLevelCM: 0,
  flowRateLPM: 0,
  isRaining: false,
  status: "Normal", // Normal, Alert, Critical
  lastUpdated: "Never"
});

let systemData = {
  "D1": { name: "Main Avenue Drain", ...initialDrainState() },
  "D2": { name: "Market Street Drain", ...initialDrainState() },
  "D3": { name: "Community Center Drain", ...initialDrainState() },
  "D4": { name: "Industrial Park Drain", ...initialDrainState() },
  "D5": { name: "Residential Alley Drain", ...initialDrainState() }
};

// --- API Endpoint: Update Sensor Data ---
// Expects: { drainageId: "D1", gas: 50, level: 10, flow: 12, rain: false }
app.post('/api/update', (req, res) => {
  const { drainageId, gas, level, flow, rain } = req.body;

  // Validate drainageId
  if (!drainageId || !systemData[drainageId]) {
    return res.status(400).json({ success: false, message: "Invalid or missing drainageId" });
  }

  // Calculate status (optional, adds simple logic)
  let status = "Normal";
  if (gas > 200 || level > 20) status = "Alert ⚠️";
  if (gas > 500 || level > 40) status = "Critical 🚨";

  // Update specific drainage data
  systemData[drainageId] = {
    ...systemData[drainageId], // keep name
    gasPPM: gas ?? systemData[drainageId].gasPPM,
    waterLevelCM: level ?? systemData[drainageId].waterLevelCM,
    flowRateLPM: flow ?? systemData[drainageId].flowRateLPM,
    isRaining: rain ?? systemData[drainageId].isRaining,
    status: status,
    lastUpdated: new Date().toLocaleTimeString()
  };

  console.log(`Updated ${drainageId}:`, systemData[drainageId]);
  res.json({ success: true, message: `${drainageId} updated.` });
});

// --- API Endpoint: Fetch All Live Data ---
app.get('/api/live', (req, res) => {
  res.json(systemData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Multi-Drain Server running at http://localhost:${PORT}`));