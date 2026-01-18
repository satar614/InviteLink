// Simple health check server for Kubernetes
const express = require('express');
const app = express();
const port = process.env.HEALTH_CHECK_PORT || 3000;
const backendUrl = process.env.BACKEND_URL || '';

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

// Simple landing page so / returns 200
app.get('/', (req, res) => {
  const title = 'InviteLink Preview';
  const backendLink = backendUrl || `${req.protocol}://${req.get('host')}`;
  res.status(200).send(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; color: #0f172a; }
          h1 { margin-bottom: 0.25rem; }
          p { margin-top: 0.25rem; }
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .muted { color: #64748b; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="muted">This preview pod is running Express on port ${port}.</p>
        <div class="card">
          <p><strong>Frontend:</strong> You are on it.</p>
          <p><strong>Backend Swagger:</strong> <a href="${backendLink}/" target="_blank" rel="noreferrer">${backendLink}/</a></p>
        </div>
      </body>
    </html>`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Health check server listening on port ${port}`);
});
