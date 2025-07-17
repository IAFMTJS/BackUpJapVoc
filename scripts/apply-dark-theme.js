#!/usr/bin/env node

/**
 * Dark Theme Application Script for Japanese Learning Platform
 * 
 * This script automatically applies dark theme styling to all components
 * by replacing hardcoded light theme classes with theme-aware classes.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Dark theme class mappings
const darkThemeMappings = {
  // Background colors
  'bg-light': 'bg-dark',
  'bg-light-secondary': 'bg-dark-secondary',
  'bg-light-tertiary': 'bg-dark-tertiary',
  'bg-white': 'bg-dark-elevated',
  
  // Text colors
  'text-text-primary': 'text-text-dark-primary',
  'text-text-secondary': 'text-text-dark-secondary',
  'text-text-muted': 'text-text-dark-muted',
  'text-gray-900': 'text-text-dark-primary',
  'text-gray-700': 'text-text-dark-secondary',
  'text-gray-500': 'text-text-dark-muted',
  'text-gray-600': 'text-text-dark-secondary',
  
  // Border colors
  'border-border-light': 'border-border-dark-light',
  'border-border-medium': 'border-border-dark-medium',
  'border-border-dark': 'border-border-dark-dark',
  'border-gray-200': 'border-border-dark-light',
  'border-gray-300': 'border-border-dark-medium',
  
  // Shadow classes
  'shadow-card': 'shadow-dark-card',
  'shadow-hover': 'shadow-dark-hover',
  'shadow-button': 'shadow-dark-button',
  'shadow-button-hover': 'shadow-dark-glow',
  'shadow-nav': 'shadow-dark-card',
  'shadow-input-focus': 'shadow-dark-glow',
  
  // Progress bar colors
  'bg-accent-orange': 'bg-accent-orange-dark',
  'bg-accent-yellow': 'bg-accent-yellow-dark',
  
  // Status colors (keep same for consistency)
  'text-status-success': 'text-status-success',
  'text-status-warning': 'text-status-warning',
  'text-status-error': 'text-status-error',
  'text-status-info': 'text-status-info',
  
  // Gradient backgrounds
  'bg-background-gradient': 'bg-dark-background-gradient',
  'bg-card-gradient': 'bg-dark-card-gradient',
  'bg-japanese-gradient': 'bg-dark-japanese-gradient',
};

// Theme-aware class replacements
const themeAwareReplacements = {
  // Background classes
  'bg-light': 'bg-light dark:bg-dark',
  'bg-light-secondary': 'bg-light-secondary dark:bg-dark-secondary',
  'bg-light-tertiary': 'bg-light-tertiary dark:bg-dark-tertiary',
  'bg-white': 'bg-white dark:bg-dark-elevated',
  
  // Text classes
  'text-text-primary': 'text-text-primary dark:text-text-dark-primary',
  'text-text-secondary': 'text-text-secondary dark:text-text-dark-secondary',
  'text-text-muted': 'text-text-muted dark:text-text-dark-muted',
  'text-gray-900': 'text-text-primary dark:text-text-dark-primary',
  'text-gray-700': 'text-text-secondary dark:text-text-dark-secondary',
  'text-gray-500': 'text-text-muted dark:text-text-dark-muted',
  'text-gray-600': 'text-text-secondary dark:text-text-dark-secondary',
  
  // Border classes
  'border-border-light': 'border-border-light dark:border-border-dark-light',
  'border-border-medium': 'border-border-medium dark:border-border-dark-medium',
  'border-border-dark': 'border-border-dark dark:border-border-dark-dark',
  'border-gray-200': 'border-border-light dark:border-border-dark-light',
  'border-gray-300': 'border-border-medium dark:border-border-dark-medium',
  
  // Shadow classes
  'shadow-card': 'shadow-card dark:shadow-dark-card',
  'shadow-hover': 'shadow-hover dark:shadow-dark-hover',
  'shadow-button': 'shadow-button dark:shadow-dark-button',
  'shadow-button-hover': 'shadow-button-hover dark:shadow-dark-glow',
  'shadow-nav': 'shadow-nav dark:shadow-dark-card',
  'shadow-input-focus': 'shadow-input-focus dark:shadow-dark-glow',
  
  // Progress bar classes
  'bg-accent-orange': 'bg-accent-orange dark:bg-accent-orange-dark',
  'bg-accent-yellow': 'bg-accent-yellow dark:bg-accent-yellow-dark',
  
  // Gradient backgrounds
  'bg-background-gradient': 'bg-background-gradient dark:bg-dark-background-gradient',
  'bg-card-gradient': 'bg-card-gradient dark:bg-dark-card-gradient',
  'bg-japanese-gradient': 'bg-japanese-gradient dark:bg-dark-japanese-gradient',
};

// Files to process
const filePatterns = [
  'src/components/**/*.{tsx,ts}',
  'src/pages/**/*.{tsx,ts}',
  'src/context/**/*.{tsx,ts}',
  'src/utils/**/*.{tsx,ts}',
  'src/hooks/**/*.{tsx,ts}',
  'src/services/**/*.{tsx,ts}',
];

// Exclude patterns
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.{tsx,ts}',
  '**/*.spec.{tsx,ts}',
  '**/ThemeContext.tsx', // Don't modify the theme context itself
  '**/DarkThemeWelcome.tsx', // Don't modify the dark theme component
];

function applyDarkThemeClasses(content, useThemeAware = true) {
  let modifiedContent = content;
  const mappings = useThemeAware ? themeAwareReplacements : darkThemeMappings;
  
  // Apply all mappings
  Object.entries(mappings).forEach(([oldClass, newClass]) => {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    modifiedContent = modifiedContent.replace(regex, newClass);
  });
  
  return modifiedContent;
}

function processFile(filePath, useThemeAware = true) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const modifiedContent = applyDarkThemeClasses(content, useThemeAware);
    
    if (content !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      return true; // File was modified
    }
    return false; // File was not modified
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
}

function findFiles() {
  const files = [];
  
  filePatterns.forEach(pattern => {
    const matches = glob.sync(pattern, {
      ignore: excludePatterns,
      absolute: true
    });
    files.push(...matches);
  });
  
  return files;
}

function main() {
  console.log('🎨 Applying Dark Theme to Japanese Learning Platform...\n');
  
  const files = findFiles();
  console.log(`Found ${files.length} files to process\n`);
  
  let modifiedCount = 0;
  let totalChanges = 0;
  
  files.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    const wasModified = processFile(filePath, true);
    
    if (wasModified) {
      modifiedCount++;
      console.log(`✅ Modified: ${relativePath}`);
      
      // Count changes by comparing content
      try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const modifiedContent = applyDarkThemeClasses(originalContent, true);
        const changes = (modifiedContent.match(/dark:/g) || []).length;
        totalChanges += changes;
      } catch (error) {
        // Ignore counting errors
      }
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files modified: ${modifiedCount}`);
  console.log(`   Total dark theme classes added: ${totalChanges}`);
  
  if (modifiedCount > 0) {
    console.log(`\n🎉 Dark theme successfully applied!`);
    console.log(`\nNext steps:`);
    console.log(`1. Test the dark theme by switching themes in the app`);
    console.log(`2. Review components for any missed styling`);
    console.log(`3. Test responsive behavior on mobile devices`);
    console.log(`4. Verify accessibility in dark mode`);
  } else {
    console.log(`\nℹ️  No files were modified. All components may already be theme-aware.`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  applyDarkThemeClasses,
  processFile,
  findFiles,
  darkThemeMappings,
  themeAwareReplacements
}; 