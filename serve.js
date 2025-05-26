const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const path = require('path');
const express = require('express');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 