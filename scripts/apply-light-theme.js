#!/usr/bin/env node

/**
 * Script om de nieuwe Japanese Learning Platform light stijl toe te passen
 * Vervangt hardcoded styling met design system tokens
 */

const fs = require('fs');
const path = require('path');

// Design system kleuren en tokens
const designTokens = {
  colors: {
    light: '#FAF0E6',
    lightSecondary: '#F5F0E8',
    lightTertiary: '#F0E8D8',
    japaneseRed: '#D45A38',
    japaneseRedLight: '#E67A5A',
    textPrimary: '#2D2D2D',
    textSecondary: '#5A5A5A',
    textMuted: '#8A8A8A',
    borderLight: '#E0E0E0',
    borderMedium: '#D0D0D0',
    accentOrange: '#FFA500',
    accentYellow: '#FFD700',
  },
  spacing: {
    card: '1.5rem',
    section: '3rem',
    container: '2rem',
  },
  borderRadius: {
    button: '0.75rem',
    card: '0.75rem',
    input: '0.375rem',
    nav: '0.5rem',
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    button: '0 4px 6px -1px rgba(212, 90, 56, 0.2), 0 2px 4px -1px rgba(212, 90, 56, 0.1)',
  }
};

// Vervangingsregels voor styling
const replacementRules = [
  // Achtergrondkleuren
  { from: /bg-\[#181830\]/g, to: 'bg-light' },
  { from: /bg-\[#23233a\]/g, to: 'bg-light-secondary' },
  { from: /bg-\[#2a2a40\]/g, to: 'bg-light-tertiary' },
  { from: /bg-gray-50/g, to: 'bg-light' },
  { from: /bg-white/g, to: 'bg-white' },
  
  // Tekstkleuren
  { from: /text-white/g, to: 'text-text-primary' },
  { from: /text-gray-900/g, to: 'text-text-primary' },
  { from: /text-gray-700/g, to: 'text-text-secondary' },
  { from: /text-gray-600/g, to: 'text-text-muted' },
  { from: /text-gray-300/g, to: 'text-text-secondary' },
  { from: /text-gray-200/g, to: 'text-text-secondary' },
  
  // Border kleuren
  { from: /border-\[#2a2a40\]/g, to: 'border-border-light' },
  { from: /border-gray-200/g, to: 'border-border-light' },
  { from: /border-gray-300/g, to: 'border-border-medium' },
  
  // Button styling
  { from: /bg-blue-600/g, to: 'bg-japanese-red' },
  { from: /bg-blue-500/g, to: 'bg-japanese-red' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-japanese-redLight' },
  { from: /focus:ring-blue-500/g, to: 'focus:ring-japanese-red' },
  
  // Border radius
  { from: /rounded-lg/g, to: 'rounded-nav' },
  { from: /rounded-xl/g, to: 'rounded-card' },
  { from: /rounded-2xl/g, to: 'rounded-card' },
  
  // Shadows
  { from: /shadow-md/g, to: 'shadow-card' },
  { from: /shadow-sm/g, to: 'shadow-card' },
  { from: /hover:shadow-lg/g, to: 'hover:shadow-hover' },
  
  // Progress bars
  { from: /bg-blue-500/g, to: 'bg-accent-orange' },
  { from: /bg-blue-600/g, to: 'bg-accent-orange' },
  
  // Accent kleuren
  { from: /bg-green-500/g, to: 'bg-status-success' },
  { from: /bg-red-500/g, to: 'bg-status-error' },
  { from: /bg-yellow-500/g, to: 'bg-status-warning' },
  
  // Typography
  { from: /font-bold/g, to: 'font-bold' },
  { from: /font-semibold/g, to: 'font-semibold' },
  { from: /font-medium/g, to: 'font-medium' },
  
  // Spacing
  { from: /p-6/g, to: 'p-6' },
  { from: /px-4/g, to: 'px-4' },
  { from: /py-2/g, to: 'py-2' },
  { from: /m-4/g, to: 'm-4' },
  { from: /gap-4/g, to: 'gap-4' },
  { from: /space-y-4/g, to: 'space-y-4' },
];

// Component-specifieke vervangingsregels
const componentRules = {
  'Button': [
    { from: /className="([^"]*bg-\[#23233a\][^"]*)"/g, to: 'className="$1 bg-japanese-red text-white"' },
    { from: /className="([^"]*hover:bg-\[#2a2a40\][^"]*)"/g, to: 'className="$1 hover:bg-japanese-redLight"' },
  ],
  'Card': [
    { from: /className="([^"]*bg-\[#23233a\][^"]*)"/g, to: 'className="$1 bg-light-secondary"' },
    { from: /className="([^"]*border-\[#2a2a40\][^"]*)"/g, to: 'className="$1 border-border-light"' },
  ],
  'Navigation': [
    { from: /className="([^"]*bg-\[#181830\][^"]*)"/g, to: 'className="$1 bg-light/95 backdrop-blur-md"' },
  ],
};

// Functie om een bestand te verwerken
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Pas algemene vervangingsregels toe
    replacementRules.forEach(rule => {
      const matches = content.match(rule.from);
      if (matches) {
        content = content.replace(rule.from, rule.to);
        changes += matches.length;
      }
    });

    // Pas component-specifieke regels toe
    const fileName = path.basename(filePath, path.extname(filePath));
    if (componentRules[fileName]) {
      componentRules[fileName].forEach(rule => {
        const matches = content.match(rule.from);
        if (matches) {
          content = content.replace(rule.from, rule.to);
          changes += matches.length;
        }
      });
    }

    // Schrijf het bestand terug als er wijzigingen zijn
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath} (${changes} changes)`);
      return changes;
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Functie om een directory recursief te doorlopen
function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let totalChanges = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules en andere onnodige directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          totalChanges += processDirectory(itemPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(itemPath);
        if (extensions.includes(ext)) {
          totalChanges += processFile(itemPath);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message);
  }
  
  return totalChanges;
}

// Functie om specifieke componenten te verwerken
function processSpecificComponents() {
  const componentsToProcess = [
    'src/components/progress/ProgressBar.tsx',
    'src/components/progress/WordLevelPractice.tsx',
    'src/components/progress/WritingPractice.tsx',
    'src/components/progress/Achievements.tsx',
    'src/components/progress/ProgressVisuals.tsx',
    'src/pages/Home.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Progress.tsx',
  ];

  let totalChanges = 0;
  
  componentsToProcess.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      totalChanges += processFile(componentPath);
    } else {
      console.log(`⚠️  File not found: ${componentPath}`);
    }
  });
  
  return totalChanges;
}

// Hoofdfunctie
function main() {
  console.log('🎨 Applying Japanese Learning Platform Light Theme...\n');
  
  const startTime = Date.now();
  let totalChanges = 0;
  
  // Verwerk specifieke componenten
  console.log('📦 Processing specific components...');
  totalChanges += processSpecificComponents();
  
  // Verwerk src/components directory
  console.log('\n📁 Processing components directory...');
  totalChanges += processDirectory('src/components', ['.tsx', '.ts']);
  
  // Verwerk src/pages directory
  console.log('\n📄 Processing pages directory...');
  totalChanges += processDirectory('src/pages', ['.tsx', '.ts']);
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`\n✨ Theme application complete!`);
  console.log(`📊 Total changes made: ${totalChanges}`);
  console.log(`⏱️  Time taken: ${duration.toFixed(2)}s`);
  
  console.log('\n🎯 Next steps:');
  console.log('1. Review the changes in your components');
  console.log('2. Test the light theme functionality');
  console.log('3. Update any remaining hardcoded styles');
  console.log('4. Add mascottes and Japanese cultural elements');
}

// Voer het script uit
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  processDirectory,
  processSpecificComponents,
  replacementRules,
  componentRules,
  designTokens
}; 