const express = require('express');
const path = require('path');
const { register } = require('ts-node/register');
const app = express();

// Register ts-node to handle TypeScript files
register({
  transpileOnly: true,
  compilerOptions: {
    module: 'ESNext',
    moduleResolution: 'node',
    target: 'ESNext',
    esModuleInterop: true,
    allowJs: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx'
  }
});

// Serve static files from the scripts directory
app.use(express.static(path.join(__dirname)));

// Serve static files from the src directory
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

// Handle TypeScript files
app.get('*.ts', (req, res, next) => {
  res.type('application/javascript');
  next();
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
}); 