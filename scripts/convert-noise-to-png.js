const sharp = require('sharp');
const path = require('path');

const inputFile = path.join(__dirname, '../assets/noise.svg');
const outputFile = path.join(__dirname, '../assets/noise.png');

sharp(inputFile)
  .png()
  .toFile(outputFile)
  .then(() => console.log('Successfully converted noise.svg to noise.png'))
  .catch(err => console.error('Error converting file:', err)); 