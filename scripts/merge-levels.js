// Script om bestaande levels uit src/data/levels.ts te combineren met de gegenereerde levels uit levels.generated.ts, waarbij bestaande levels behouden blijven en de nieuwe levels erachter worden geplakt (met unieke id's).

const fs = require('fs');
const path = require('path');

// 1. Lees bestaande levels
const levelsPath = path.join(__dirname, '../src/data/levels.ts');
const levelsContent = fs.readFileSync(levelsPath, 'utf8');

// Extract alleen de levels array, filter export statements
const existingMatch = levelsContent.match(/export const levels:? [^=]*= (\[[\s\S]*?\]);/);
if (!existingMatch) throw new Error('Kon bestaande levels array niet vinden!');

// Maak een veilige context voor eval
const safeEval = (code) => {
  // Verwijder TypeScript syntax en maak het JavaScript-compatibel
  const jsCode = code
    .replace(/:\s*Level\[\]/g, '') // Verwijder type annotations
    .replace(/:\s*string/g, '') // Verwijder string type annotations
    .replace(/:\s*number/g, '') // Verwijder number type annotations
    .replace(/:\s*boolean/g, ''); // Verwijder boolean type annotations
  
  return eval(jsCode);
};

const existingLevels = safeEval(existingMatch[1]);

// 2. Lees gegenereerde levels
const generatedContent = fs.readFileSync(path.join(__dirname, '../levels.generated.ts'), 'utf8');
const generatedMatch = generatedContent.match(/export const levels = (\[[\s\S]*?\]);/);
if (!generatedMatch) throw new Error('Kon generated levels array niet vinden!');
const generatedLevels = safeEval(generatedMatch[1]);

// 3. Bepaal hoogste bestaande id
const maxId = Math.max(...existingLevels.map(l => l.id));
console.log(`Hoogste bestaande level ID: ${maxId}`);

// 4. Update id's en nextUnlocks van gegenereerde levels
const offset = maxId;
const mergedGenerated = generatedLevels.map((lvl, i) => {
  const newId = offset + i + 1;
  // nextUnlocks aanpassen zodat ze niet naar oude id's verwijzen
  const nextUnlocks = lvl.nextUnlocks.map(n => n > 0 ? newId + (n - lvl.id) : n);
  return { ...lvl, id: newId, nextUnlocks };
});

// 5. Merge arrays
const merged = [...existingLevels, ...mergedGenerated];

console.log(`Totaal aantal levels na merge: ${merged.length}`);
console.log(`Bestaande levels: ${existingLevels.length}`);
console.log(`Nieuwe levels: ${mergedGenerated.length}`);

// 6. Schrijf terug naar levels.ts
const output = `import type { Level } from '../types/learn';\n\nexport const levels: Level[] = ${JSON.stringify(merged, null, 2)};\n`;
fs.writeFileSync(levelsPath, output);
console.log('Levels succesvol gemerged!'); 