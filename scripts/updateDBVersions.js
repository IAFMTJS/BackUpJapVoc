const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/Dictionary.tsx',
  'src/utils/databaseConfig.ts',
  'src/utils/importDictionaryData.ts',
  'src/utils/dictionaryStats.ts',
  'src/utils/indexedDB.ts',
  'src/context/DatabaseContext.tsx'
];

const versionRegex = /openDB\(['"]DictionaryDB['"],\s*1/g;
const japVocVersionRegex = /version:\s*1/g;

async function updateFile(filePath) {
  try {
    console.log(`Updating ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update DictionaryDB version
    content = content.replace(versionRegex, 'openDB("DictionaryDB", 2');
    
    // Update JapVocDB version
    content = content.replace(japVocVersionRegex, 'version: 2');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

async function updateAllFiles() {
  console.log('Updating database versions to 2...');
  
  for (const file of filesToUpdate) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      await updateFile(filePath);
    } else {
      console.warn(`File not found: ${file}`);
    }
  }
  
  console.log('Database version update complete');
}

updateAllFiles().catch(console.error); 