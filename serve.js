const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const path = require('path');
const express = require('express');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Add CORS headers for incognito mode
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Also available on http://127.0.0.1:${port}`);
}); 