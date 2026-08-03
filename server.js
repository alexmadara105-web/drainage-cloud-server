const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static HTML files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Sensor data storage
let drainageStatus = {
  gasPPM: 0,
  waterLevelCM: 0,
  flowRateLPM: 0,
  isRaining: false,
  lastUpdated: "Waiting for data..."
};

// Endpoint for ESP32/Postman data updates
app.post('/api/update', (req, res) => {
  const { gas, level, flow, rain } = req.body;

  drainageStatus = {
    gasPPM: gas || 0,
    waterLevelCM: level || 0,
    flowRateLPM: flow || 0,
    isRaining: rain ?? false,
    lastUpdated: new Date().toLocaleTimeString()
  };

  console.log("Data Received:", drainageStatus);
  res.json({ success: true, message: "Data updated successfully!" });
});

// Endpoint for web interface to fetch live data
app.get('/api/live', (req, res) => {
  res.json(drainageStatus);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));