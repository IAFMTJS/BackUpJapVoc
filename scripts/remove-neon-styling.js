const fs = require('fs');
const path = require('path');

// Neon styling replacements
const replacements = [
  // Tailwind classes
  { from: 'text-neon-blue', to: 'text-blue-500' },
  { from: 'text-neon-pink', to: 'text-red-500' },
  { from: 'bg-neon-blue', to: 'bg-blue-500' },
  { from: 'bg-neon-pink', to: 'bg-red-500' },
  { from: 'border-neon-blue', to: 'border-blue-500' },
  { from: 'border-neon-pink', to: 'border-red-500' },
  { from: 'bg-neon-blue/10', to: 'bg-blue-100' },
  { from: 'bg-neon-pink/10', to: 'bg-red-100' },
  { from: 'bg-neon-blue/20', to: 'bg-blue-200' },
  { from: 'bg-neon-pink/20', to: 'bg-red-200' },
  { from: 'text-neon-blue/80', to: 'text-blue-400' },
  { from: 'text-neon-pink/80', to: 'text-red-400' },
  { from: 'border-neon-blue/30', to: 'border-blue-300' },
  { from: 'border-neon-pink/30', to: 'border-red-300' },
  { from: 'hover:bg-neon-blue/20', to: 'hover:bg-blue-200' },
  { from: 'hover:bg-neon-pink/20', to: 'hover:bg-red-200' },
  { from: 'hover:bg-neon-blue/90', to: 'hover:bg-blue-600' },
  { from: 'hover:bg-neon-pink/90', to: 'hover:bg-red-600' },
  
  // CSS classes
  { from: 'neon-glow', to: '' },
  { from: 'neon-card', to: 'card' },
  { from: 'neon-btn', to: 'btn' },
  { from: 'neon-button', to: 'button' },
  { from: 'neon-input', to: 'input' },
  { from: 'neon-text', to: '' },
  { from: 'neon-text-gradient', to: '' },
  
  // Hardcoded colors
  { from: '#00f7ff', to: '#3b82f6' }, // neon-blue to blue-500
  { from: '#ff00c8', to: '#ef4444' }, // neon-pink to red-500
  { from: '#9c00ff', to: '#8b5cf6' }, // electric-purple to purple-500
  
  // Shadow effects
  { from: 'shadow-[0_0_10px_rgba(0,149,255,0.4)]', to: 'shadow-lg' },
  { from: 'shadow-[0_0_10px_rgba(255,0,128,0.4)]', to: 'shadow-lg' },
  { from: 'shadow-[0_0_20px_rgba(0,149,255,0.2)]', to: 'shadow-md' },
];

// Files to process
const filesToProcess = [
  'src/components/WritingPractice.tsx',
  'src/components/WordPractice.tsx',
  'src/components/Achievements.tsx',
  'src/components/ProgressVisuals.tsx',
  'src/components/visualizations/Background.tsx',
];

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changed = true;
      console.log(`Replaced ${from} with ${to} in ${filePath}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
filesToProcess.forEach(file => {
  replaceInFile(file);
});

console.log('Neon styling removal complete!'); 