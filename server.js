import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error(`[ERROR] Build directory not found: ${distPath}`);
  console.error(`Please run "npm run build" before starting the server.`);
  process.exit(1);
}

// Serve static assets with cache headers
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: true,
  index: 'index.html'
}));

// SPA Fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(` 💧 گوارانو B2B - سامانه جامع پخش مویرگی آب و نوشیدنی`);
  console.log(` Gowarano B2B Platform is running successfully!`);
  console.log(`======================================================`);
  console.log(` ➜ Local:   http://localhost:${PORT}`);
  console.log(` ➜ Network: http://${HOST === '0.0.0.0' ? 'YOUR-SERVER-IP' : HOST}:${PORT}`);
  console.log(`======================================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[INFO] SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('[INFO] Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[INFO] SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('[INFO] Server closed.');
    process.exit(0);
  });
});
