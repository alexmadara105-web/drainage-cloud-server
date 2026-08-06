const https = require('https');

const SERVER_HOST = 'drainage-cloud-server.onrender.com';
const SERVER_PATH = '/api/update';

function sendDrainageTelemetry(payloadData) {
  const payload = JSON.stringify(payloadData);

  const options = {
    hostname: SERVER_HOST,
    port: 443,
    path: SERVER_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[${new Date().toLocaleTimeString()}] Node ${payloadData.drainageId} Status: ${res.statusCode} | Response: ${data}`);
    });
  });

  req.on('error', (error) => {
    console.error(`[Node ${payloadData.drainageId} Error]: ${error.message}`);
  });

  req.write(payload);
  req.end();
}

function runDualNodeSimulation() {
  console.log("\n========================================================");
  console.log("🚀 MUNICIPAL SCADA DUAL-NODE TELEMETRY SIMULATION");
  console.log("========================================================");

  // 1. NODE D1: CRITICAL ALARM STATE (Cooum Basin Main Trunk)
  const nodeD1_Critical = {
    drainageId: "D1",
    gas: Math.floor(620 + Math.random() * 80),        // High Gas PPM (620 - 700) -> Triggers CRITICAL
    level: parseFloat((50.0 + Math.random() * 5).toFixed(1)), // High Water Depth (50 - 55 cm) -> Severe Overflow Risk
    flow: parseFloat((85.0 + Math.random() * 10).toFixed(1)), // High Flow Rate
    rain: true                                         // Torrential Rain Active
  };

  // 2. NODE D2: NORMAL STATE (Buckingham Canal Arterial)
  const nodeD2_Normal = {
    drainageId: "D2",
    gas: Math.floor(90 + Math.random() * 30),         // Safe Gas PPM (90 - 120) -> NORMAL
    level: parseFloat((14.0 + Math.random() * 3).toFixed(1)), // Safe Water Level (14 - 17 cm)
    flow: parseFloat((22.0 + Math.random() * 5).toFixed(1)),  // Normal Flow
    rain: false                                        // No Rain
  };

  // Transmit telemetry for both nodes
  sendDrainageTelemetry(nodeD1_Critical);
  sendDrainageTelemetry(nodeD2_Normal);
}

// Start Immediate Execution
runDualNodeSimulation();

// Repeat transmission every 4 seconds
setInterval(runDualNodeSimulation, 4000);