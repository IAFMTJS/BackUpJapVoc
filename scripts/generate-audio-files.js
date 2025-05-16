const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');
const commonWords = require('../src/data/common-words.json');

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

async function generateAudioFile(text, filename) {
  const filepath = path.join(audioDir, filename);
  
  // Skip if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`Skipping existing file: ${filename}`);
    skippedCount++;
    return;
  }

  return new Promise((resolve, reject) => {
    const gtts = new gTTS(text, 'ja');
    
    gtts.save(filepath, (err) => {
      if (err) {
        console.error(`Error generating audio for "${text}" (${filename}):`, err);
        errorCount++;
        reject(err);
      } else {
        console.log(`Generated audio for "${text}" (${filename})`);
        successCount++;
        resolve();
      }
    });
  });
}

async function generateAllAudioFiles() {
  console.log('Starting audio file generation...');
  console.log(`Total words to process: ${commonWords.length}`);
  
  // Process words in batches to avoid overwhelming the system
  const batchSize = 10;
  const words = commonWords;
  
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(words.length / batchSize)}`);
    console.log(`Progress: ${i + 1}-${Math.min(i + batchSize, words.length)} of ${words.length} words`);
    
    try {
      await Promise.all(
        batch.map(async (word) => {
          try {
            // Generate audio for the Japanese word
            const filename = `cw-${word.id}.mp3`;
            await generateAudioFile(word.japanese, filename);
            
            // Generate audio for example sentences if they exist
            if (word.examples && word.examples.length > 0) {
              for (let j = 0; j < word.examples.length; j++) {
                const example = word.examples[j];
                const exampleFilename = `cw-${word.id}_example_${j + 1}.mp3`;
                await generateAudioFile(example, exampleFilename);
              }
            }
          } catch (wordError) {
            console.error(`Error processing word ${word.id}:`, wordError);
          }
        })
      );
      
      // Add a small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }
  
  console.log('\nAudio file generation complete!');
  console.log('Summary:');
  console.log(`- Successfully generated: ${successCount} files`);
  console.log(`- Errors encountered: ${errorCount} files`);
  console.log(`- Skipped (already exist): ${skippedCount} files`);
  console.log(`- Total words processed: ${commonWords.length}`);
}

// Run the script
generateAllAudioFiles().catch(console.error); 