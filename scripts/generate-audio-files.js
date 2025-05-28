const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');
const commonWords = require('../public/data/common-words.json');
const crypto = require('crypto');

// Log the exact length of the data
console.log('Number of words in common-words.json:', commonWords.length);

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, '../public/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Track progress
let successCount = 0;
let errorCount = 0;
let skippedCount = 0;

// Helper to normalize Japanese text before hashing
function normalizeJapaneseText(text) {
  // Remove any whitespace
  text = text.trim();
  
  // Normalize Unicode characters (e.g., full-width to half-width)
  text = text.normalize('NFKC');
  
  // Remove any zero-width spaces or other invisible characters
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  return text;
}

// Helper to create a SHA-1 hash from a string (safe for filenames)
function hashJapanese(text) {
  const normalizedText = normalizeJapaneseText(text);
  return crypto.createHash('sha1').update(normalizedText).digest('hex');
}

async function generateAudioFile(text, filename) {
  const filepath = path.join(audioDir, filename);
  const normalizedText = normalizeJapaneseText(text);
  
  // Skip if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`Skipping existing file: ${filename} (${normalizedText})`);
    skippedCount++;
    return;
  }

  return new Promise((resolve, reject) => {
    const gtts = new gTTS(normalizedText, 'ja');
    
    gtts.save(filepath, (err) => {
      if (err) {
        console.error(`Error generating audio for "${normalizedText}" (${filename}):`, err);
        errorCount++;
        reject(err);
      } else {
        console.log(`Generated audio for "${normalizedText}" (${filename})`);
        successCount++;
        resolve();
      }
    });
  });
}

// --- ADDED: Load extra sources for sentences, stories, readings, grammar ---
const romajiWordsPath = path.join(__dirname, '../src/data/romajiWords.ts');
const readingMaterialsPath = path.join(__dirname, '../src/data/readingMaterials.ts');
const grammarDataPath = path.join(__dirname, '../src/data/grammarData.ts');

function extractFromRomajiWords() {
  const content = fs.readFileSync(romajiWordsPath, 'utf8');
  const sentences = [];
  const stories = [];
  // Extract romajiSentences
  const sentMatch = content.match(/export const romajiSentences = \[(.*?)\];/s);
  if (sentMatch) {
    const arr = eval(sentMatch[0].replace('export const romajiSentences =', ''));
    for (const s of arr) sentences.push(s.japanese);
  }
  // Extract romajiStories
  const storyMatch = content.match(/export const romajiStories = \[(.*?)\];/s);
  if (storyMatch) {
    const arr = eval(storyMatch[0].replace('export const romajiStories =', ''));
    for (const s of arr) stories.push(s.japanese);
  }
  return { sentences, stories };
}

function extractFromReadingMaterials() {
  const content = fs.readFileSync(readingMaterialsPath, 'utf8');
  const matches = [...content.matchAll(/content: "([^"]+)"/g)];
  return matches.map(m => m[1]);
}

function extractFromGrammarData() {
  const content = fs.readFileSync(grammarDataPath, 'utf8');
  const matches = [...content.matchAll(/japanese: '([^']+)'/g)];
  return matches.map(m => m[1]);
}

const animeSectionPath = path.join(__dirname, '../src/pages/AnimeSection.tsx');

function extractFromAnimeSection() {
  const content = fs.readFileSync(animeSectionPath, 'utf8');
  // Match beginnerPhrases array
  const arrMatch = content.match(/const beginnerPhrases: AnimePhrase\[\] = \[(.*?)\];/s);
  if (!arrMatch) return [];
  const arrStr = arrMatch[1];
  // Match all japanese and example fields
  const japaneseMatches = [...arrStr.matchAll(/japanese: "([^"]+)"/g)].map(m => m[1]);
  const exampleMatches = [...arrStr.matchAll(/example: "([^"]+)"/g)].map(m => m[1]);
  return [...japaneseMatches, ...exampleMatches];
}

// Function to validate audio files and mapping
async function validateAudioFiles() {
  console.log('\nValidating audio files and mapping...');
  
  const audioMapPath = path.join(audioDir, 'audio_map.txt');
  const audioMap = new Map();
  const duplicateEntries = new Set();
  const missingFiles = new Set();
  
  // Read and parse the audio map
  if (fs.existsSync(audioMapPath)) {
    const content = fs.readFileSync(audioMapPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const [text, filename] = line.split(' => ').map(s => s.trim());
      if (!text || !filename) continue;
      
      const normalizedText = normalizeJapaneseText(text);
      const expectedHash = hashJapanese(normalizedText);
      const actualHash = filename.replace('.mp3', '');
      
      if (expectedHash !== actualHash) {
        console.warn(`Hash mismatch for "${text}": expected ${expectedHash}, got ${actualHash}`);
      }
      
      if (audioMap.has(normalizedText)) {
        duplicateEntries.add(normalizedText);
      } else {
        audioMap.set(normalizedText, filename);
      }
      
      // Check if file exists
      const filepath = path.join(audioDir, filename);
      if (!fs.existsSync(filepath)) {
        missingFiles.add(filename);
      }
    }
  }
  
  // Report validation results
  if (duplicateEntries.size > 0) {
    console.warn('\nFound duplicate entries in audio map:');
    duplicateEntries.forEach(text => {
      console.warn(`- "${text}"`);
    });
  }
  
  if (missingFiles.size > 0) {
    console.warn('\nFound missing audio files:');
    missingFiles.forEach(filename => {
      console.warn(`- ${filename}`);
    });
  }
  
  // Regenerate audio map if needed
  if (duplicateEntries.size > 0 || missingFiles.size > 0) {
    console.log('\nRegenerating audio map...');
    const newMapContent = Array.from(audioMap.entries())
      .map(([text, filename]) => `${text} => ${filename}`)
      .join('\n');
    fs.writeFileSync(audioMapPath, newMapContent + '\n');
    console.log('Audio map regenerated successfully');
  }
  
  return {
    totalEntries: audioMap.size,
    duplicateEntries: duplicateEntries.size,
    missingFiles: missingFiles.size
  };
}

async function generateAllAudioFiles() {
  console.log('Starting audio file generation...');
  console.log(`Total words to process: ${commonWords.length}`);

  // --- ADDED: Gather all extra texts ---
  const { sentences, stories } = extractFromRomajiWords();
  const readings = extractFromReadingMaterials();
  const grammarExamples = extractFromGrammarData();
  const animePhrases = extractFromAnimeSection();
  const extraTexts = [...sentences, ...stories, ...readings, ...grammarExamples, ...animePhrases];

  // Process words in batches to avoid overwhelming the system
  const batchSize = 10;
  const words = commonWords;
  const allTexts = [
    ...words.map(w => w.japanese),
    ...extraTexts
  ];
  
  // Remove duplicates and normalize text
  const uniqueTexts = Array.from(new Set(
    allTexts.map(text => normalizeJapaneseText(text))
  ));

  // Clear existing audio map
  const audioMapPath = path.join(audioDir, 'audio_map.txt');
  fs.writeFileSync(audioMapPath, '');

  for (let i = 0; i < uniqueTexts.length; i += batchSize) {
    const batch = uniqueTexts.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(uniqueTexts.length / batchSize)}`);
    console.log(`Progress: ${i + 1}-${Math.min(i + batchSize, uniqueTexts.length)} of ${uniqueTexts.length} items`);

    try {
      await Promise.all(
        batch.map(async (text) => {
          try {
            const hash = hashJapanese(text);
            const filename = `${hash}.mp3`;
            await generateAudioFile(text, filename);
            fs.appendFileSync(audioMapPath, `${text} => ${filename}\n`);
          } catch (err) {
            console.error(`Error processing text: ${text}`, err);
          }
        })
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }
  
  // Validate generated files
  const validationResults = await validateAudioFiles();
  
  console.log('\nAudio file generation complete!');
  console.log('Summary:');
  console.log(`- Successfully generated: ${successCount} files`);
  console.log(`- Skipped (already exist): ${skippedCount} files`);
  console.log(`- Errors: ${errorCount} files`);
  console.log('\nValidation Results:');
  console.log(`- Total unique entries: ${validationResults.totalEntries}`);
  console.log(`- Duplicate entries fixed: ${validationResults.duplicateEntries}`);
  console.log(`- Missing files: ${validationResults.missingFiles}`);
}

// Run the script
generateAllAudioFiles().catch(console.error); 