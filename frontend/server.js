// Simple health check server for Kubernetes
const express = require('express');
const app = express();
const port = process.env.HEALTH_CHECK_PORT || 3000;

let isReady = false;

// Mark as ready after 5 seconds (simulating app startup)
setTimeout(() => {
  isReady = true;
}, 5000);

// Liveness probe - is the app running?
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness probe - is the app ready to serve traffic?
app.get('/health/ready', (req, res) => {
  if (isReady) {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'not ready', timestamp: new Date().toISOString() });
  }
});

// General health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    ready: isReady,
    timestamp: new Date().toISOString() 
  });
});

// Serve static files (if needed for the built app)
app.use(express.static('public'));

app.listen(port, '0.0.0.0', () => {
  console.log(`Health check server listening on port ${port}`);
});
