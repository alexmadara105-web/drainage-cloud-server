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
      console.log(`[${new Date().toLocaleTimeString('en-IN')}] Node ${payloadData.drainageId} Ingest Status: ${res.statusCode} | Response: ${data}`);
    });
  });

  req.on('error', (error) => {
    console.error(`[Node ${payloadData.drainageId} Transmission Error]: ${error.message}`);
  });

  req.write(payload);
  req.end();
}

function runTirunelveliDualNodeSimulation() {
  console.log("\n========================================================");
  console.log("🚀 TIRUNELVELI SCADA DUAL-NODE TELEMETRY TRANSMISSION");
  console.log("========================================================");

  // 1. NODE D1: CRITICAL ALARM STATE (Thamirabarani River Outfall)
  const nodeD1_Critical = {
    drainageId: "D1",
    gas: Math.floor(620 + Math.random() * 80),        // High Gas PPM (620 - 700) -> CRITICAL ALARM
    level: parseFloat((50.0 + Math.random() * 5).toFixed(1)), // High Water Level (50 - 55 CM)
    flow: parseFloat((85.0 + Math.random() * 10).toFixed(1)),
    rain: true
  };

  // 2. NODE D2: NORMAL STATE (Tirunelveli Junction Drain)
  const nodeD2_Normal = {
    drainageId: "D2",
    gas: Math.floor(90 + Math.random() * 30),         // Safe Gas PPM (90 - 120) -> NORMAL
    level: parseFloat((14.0 + Math.random() * 3).toFixed(1)),
    flow: parseFloat((22.0 + Math.random() * 5).toFixed(1)),
    rain: false
  };

  sendDrainageTelemetry(nodeD1_Critical);
  sendDrainageTelemetry(nodeD2_Normal);
}

runTirunelveliDualNodeSimulation();
setInterval(runTirunelveliDualNodeSimulation, 4000);