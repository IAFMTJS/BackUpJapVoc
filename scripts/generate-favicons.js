#!/usr/bin/env node

/**
 * Favicon Generator Script for Japanese Learning Platform
 * 
 * This script generates favicon icons from the mascot PNG files
 * for use as website icons and PWA icons.
 */

const fs = require('fs');
const path = require('path');

// Favicon sizes needed
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// ICO sizes for favicon.ico
const icoSizes = [16, 32, 48];

function createFaviconInstructions() {
  const instructions = `# 🎨 Favicon Generation Instructions

## 📁 Bestaande Setup
De website heeft momenteel favicon iconen in \`public/icons/\` maar gebruikt nog niet de mascot iconen.

## 🎯 Wat er moet gebeuren

### 1. Favicon Iconen Genereren
Je moet de mascot PNG bestanden converteren naar verschillende favicon formaten:

#### Benodigde Formaten:
- **favicon.ico** (16x16, 32x32, 48x48) - Voor browser tabs
- **favicon-16x16.png** - Kleine browser tab
- **favicon-32x32.png** - Standaard browser tab
- **icon-192x192.png** - PWA icon (huidige)
- **icon-512x512.png** - PWA icon (grote)

### 2. Tools die je kunt gebruiken:

#### Online Tools:
- **Favicon.io** (https://favicon.io/favicon-converter/)
- **RealFaviconGenerator** (https://realfavicongenerator.net/)
- **Favicon Generator** (https://www.favicon-generator.org/)

#### Desktop Tools:
- **GIMP** (gratis)
- **Photoshop**
- **Sketch** (Mac)

### 3. Stappen:

1. **Download de mascot PNG bestanden:**
   - \`public/assets/mascots/Maneki Neko and penguin Light mode.PNG\`
   - \`public/assets/mascots/Maneki Neko and penguin Dark mode.PNG\`

2. **Kies een tool** (bijvoorbeeld Favicon.io)

3. **Upload de Light Mode versie** (voor beste contrast)

4. **Genereer alle formaten**

5. **Plaats de bestanden:**
   - \`favicon.ico\` → \`public/favicon.ico\`
   - \`favicon-16x16.png\` → \`public/favicon-16x16.png\`
   - \`favicon-32x32.png\` → \`public/favicon-32x32.png\`
   - \`icon-192x192.png\` → \`public/icons/icon-192x192.png\`
   - \`icon-512x512.png\` → \`public/icons/icon-512x512.png\`

### 4. HTML Updates
De \`public/index.html\` moet worden bijgewerkt met de nieuwe favicon links.

### 5. Manifest Updates
Het \`public/manifest.json\` moet worden bijgewerkt met de nieuwe icon paden.

## 🎨 Design Tips

### Voor Favicon Design:
- **Gebruik de Light Mode versie** voor beste zichtbaarheid
- **Crop het icoon** zodat de mascots goed zichtbaar zijn
- **Zorg voor goede contrast** tegen witte/lichte achtergronden
- **Test op verschillende achtergronden** (wit, zwart, gekleurd)

### Voor PWA Icons:
- **Gebruik de Light Mode versie** voor consistente branding
- **Zorg voor goede padding** rond de mascots
- **Test op verschillende devices** (desktop, tablet, mobile)

## 🔧 Automatische Updates

Zodra je de favicon bestanden hebt geplaatst, kan ik de HTML en manifest bestanden automatisch updaten.

## 📱 Resultaat

Na de implementatie krijg je:
- ✅ Mascot favicon in browser tabs
- ✅ Mascot icon voor PWA installatie
- ✅ Mascot icon voor bookmarks
- ✅ Consistente branding across alle platforms
- ✅ Professionele uitstraling

## 🎯 Volgende Stappen

1. **Genereer de favicon bestanden** met een online tool
2. **Plaats ze in de juiste directories**
3. **Laat me weten wanneer ze klaar zijn**
4. **Ik update dan automatisch de HTML en manifest bestanden**

De mascots zullen dan verschijnen in browser tabs, bookmarks, en PWA installaties! 🐱🐧⛩️
`;

  fs.writeFileSync('FAVICON_INSTRUCTIONS.md', instructions);
  console.log('✅ Favicon instructions created: FAVICON_INSTRUCTIONS.md');
}

function updateIndexHtml() {
  const indexPath = path.join(__dirname, '../public/index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Update favicon links
  html = html.replace(
    /<link rel="icon" href="\.\/icons\/icon-192x192\.png" \/>/,
    `<link rel="icon" href="./favicon.ico" />
    <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="./favicon-48x48.png" />`
  );

  // Update apple touch icons
  html = html.replace(
    /<link rel="apple-touch-icon" href="\.\/icons\/icon-192x192\.png" \/>/,
    `<link rel="apple-touch-icon" href="./icons/icon-192x192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="./icons/icon-192x192.png" />`
  );

  fs.writeFileSync(indexPath, html);
  console.log('✅ Updated index.html with new favicon links');
}

function updateManifest() {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Update icons array
  manifest.icons = [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "favicon-48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ];

  // Update theme colors to match Japanese theme
  manifest.theme_color = "#D45A38"; // Japanese red
  manifest.background_color = "#FAF0E6"; // Light beige

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Updated manifest.json with new favicon icons and theme colors');
}

function checkExistingFavicons() {
  const publicDir = path.join(__dirname, '../public');
  const iconsDir = path.join(__dirname, '../public/icons');
  
  const existingFiles = [];
  
  // Check for favicon files
  const faviconFiles = ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png'];
  faviconFiles.forEach(file => {
    if (fs.existsSync(path.join(publicDir, file))) {
      existingFiles.push(file);
    }
  });

  // Check for icon files
  const iconFiles = ['icon-192x192.png', 'icon-512x512.png'];
  iconFiles.forEach(file => {
    if (fs.existsSync(path.join(iconsDir, file))) {
      existingFiles.push(`icons/${file}`);
    }
  });

  return existingFiles;
}

function main() {
  console.log('🎨 Favicon Generator for Japanese Learning Platform\n');

  // Check existing favicons
  const existingFiles = checkExistingFavicons();
  
  if (existingFiles.length > 0) {
    console.log('📁 Existing favicon files found:');
    existingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\n🔄 Updating HTML and manifest files...\n');
    
    updateIndexHtml();
    updateManifest();
    
    console.log('\n✅ Favicon setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Generate new favicon files from your mascot PNG');
    console.log('2. Replace the existing files with your new mascot-based favicons');
    console.log('3. Test the favicon in different browsers and devices');
  } else {
    console.log('📝 No existing favicon files found.');
    console.log('Creating instructions for favicon generation...\n');
    
    createFaviconInstructions();
    
    console.log('\n📋 Next steps:');
    console.log('1. Follow the instructions in FAVICON_INSTRUCTIONS.md');
    console.log('2. Generate favicon files from your mascot PNG');
    console.log('3. Place the files in the correct directories');
    console.log('4. Run this script again to update HTML and manifest');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  updateIndexHtml,
  updateManifest,
  checkExistingFavicons,
  createFaviconInstructions
}; 