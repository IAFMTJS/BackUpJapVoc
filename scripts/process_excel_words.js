// This script now uses the shared level logic from src/data/levelRules.ts
// Do not duplicate level rules here—always update src/data/levelRules.ts if changes are needed.

const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
const tsNode = require('ts-node');
tsNode.register();

// Import shared level logic
const { levelDistribution, wordBelongsInLevel } = require('../src/data/levelRules.ts');

// Function to determine if a string contains kanji
function containsKanji(str) {
    return /[\u4E00-\u9FAF]/.test(str);
}

// Function to determine if a string is hiragana
function isHiragana(str) {
    return /^[\u3040-\u309F]+$/.test(str);
}

// Function to determine if a string is katakana
function isKatakana(str) {
    return /^[\u30A0-\u30FF]+$/.test(str);
}

// Function to determine word category based on English translation
function determineCategory(english) {
    const categories = {
        'greeting': ['hello', 'hi', 'good morning', 'good evening', 'good night', 'bye', 'see you'],
        'number': ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand'],
        'pronoun': ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'],
        'question': ['who', 'what', 'where', 'when', 'why', 'how'],
        'hiragana': [],
        'katakana': [],
        'verb': ['to', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'go', 'come', 'eat', 'drink', 'sleep', 'walk', 'run'],
        'adjective': ['big', 'small', 'good', 'bad', 'hot', 'cold', 'new', 'old', 'beautiful', 'ugly', 'happy', 'sad'],
        'adverb': ['very', 'quickly', 'slowly', 'well', 'badly', 'often', 'sometimes', 'never', 'always'],
        'particle': [],
        'time': ['today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'week', 'month', 'year'],
        'food': ['rice', 'bread', 'meat', 'fish', 'vegetable', 'fruit', 'water', 'tea', 'coffee', 'milk'],
        'drink': ['water', 'tea', 'coffee', 'milk', 'juice'],
        'transportation': ['car', 'bus', 'train', 'bicycle', 'airplane', 'ship', 'taxi', 'subway'],
        'shopping': ['shop', 'store', 'buy', 'sell', 'price', 'money'],
        'family': ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather', 'aunt', 'uncle'],
        'emotion': ['happy', 'sad', 'angry', 'scared', 'surprised', 'excited', 'tired', 'bored'],
        'body': ['head', 'hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'hair', 'face'],
        'health': ['sick', 'ill', 'healthy', 'medicine', 'doctor', 'hospital'],
        'housing': ['house', 'home', 'apartment', 'room', 'kitchen', 'bathroom'],
        'work': ['work', 'job', 'office', 'company', 'boss', 'colleague'],
        'education': ['school', 'university', 'class', 'book', 'pen', 'pencil', 'paper', 'test', 'exam'],
        'hobby': ['hobby', 'music', 'movie', 'game', 'sport', 'reading'],
        'travel': ['travel', 'trip', 'journey', 'tour', 'visit'],
        'money': ['money', 'yen', 'dollar', 'euro', 'pay', 'cost'],
        'conjunction': ['and', 'but', 'or', 'so', 'because', 'although'],
        'idiom': [],
        'proverb': [],
        'onomatopoeia': [],
        'technology': ['computer', 'phone', 'internet', 'app', 'software', 'hardware'],
        'business': ['business', 'company', 'manager', 'employee', 'client'],
        'academic': ['academic', 'research', 'study', 'university', 'professor'],
        'literature': ['literature', 'novel', 'poem', 'author', 'story'],
        'formal': ['formal', 'polite', 'respect', 'honorific'],
        'advanced': ['advanced', 'complex', 'difficult'],
        'slang': ['slang', 'colloquial', 'casual'],
        'colloquial': ['colloquial', 'casual', 'informal'],
        'nuanced': ['nuance', 'subtle', 'implied']
    };
    const lowerEnglish = english.toLowerCase();
    for (const [category, words] of Object.entries(categories)) {
        if (words.some(word => lowerEnglish.includes(word))) {
            return category;
        }
    }
    return 'noun'; // Default to noun if no other category matches
}

// Function to assign a level to a word using the shared logic
function assignLevel(word) {
  for (let level = 1; level <= 10; level++) {
    if (wordBelongsInLevel(word, level)) {
      return level;
    }
  }
  return 1; // fallback
}

// Function to assign JLPT level based on assigned level
function assignJlptLevel(level) {
    if (level <= 2) return 'N5';
    if (level <= 4) return 'N4';
    if (level <= 6) return 'N3';
    if (level <= 8) return 'N2';
    return 'N1';
}

async function processExcel() {
    try {
        // Read the Excel file with correct extension
        const excelPath = path.join(__dirname, '..', 'japanese_words.xls');
        console.log('Reading file:', excelPath);
        const workbook = XLSX.readFile(excelPath);
        
        const processedWords = [];
        let currentCategory = '';
        
        // Process each worksheet in the workbook
        for (const sheetName of workbook.SheetNames) {
            console.log(`\nProcessing sheet: ${sheetName}`);
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Process each row
            for (const row of data) {
                // Skip empty rows
                if (!row || row.length === 0) continue;
                
                // Check if this is a category header (single cell with text)
                if (row.length === 1 && typeof row[0] === 'string' && !row[0].includes('http')) {
                    currentCategory = row[0].trim();
                    continue;
                }
                
                // Skip header rows (containing "Kana", "Kanji", etc.)
                if (row.some(cell => typeof cell === 'string' && 
                    (cell.includes('Kana') || cell.includes('Kanji') || 
                     cell.includes('English') || cell.includes('Romaji')))) {
                    continue;
                }
                
                // Skip metadata rows (containing URLs or credits)
                if (row.some(cell => typeof cell === 'string' && 
                    (cell.includes('http') || cell.includes('Credit') || 
                     cell.includes('Adapted from') || cell.includes('For more information')))) {
                    continue;
                }
                
                // Get the values from the columns
                const kana = row[0] || '';
                const kanji = row[1] || '';
                const english = row[2] || '';
                const romaji = row[3] || '';
                
                // Skip if we don't have at least kana/kanji and english
                if ((!kana && !kanji) || !english) continue;
                
                // Create word object with basic fields
                const word = {
                    kana: kana.trim(),
                    kanji: kanji.trim(),
                    english: english.trim(),
                    romaji: romaji.trim(),
                    category: determineCategory(english),
                    sheet: sheetName
                };
                word.level = assignLevel(word);
                word.jlptLevel = assignJlptLevel(word.level);
                processedWords.push(word);
            }
        }
        
        // --- NEW: Evenly distribute by difficulty into 10 levels, max 100 per level ---
        processedWords.sort((a, b) => a.level - b.level);
        const maxPerLevel = 100;
        let currentLevel = 1;
        let countInLevel = 0;
        for (let i = 0; i < processedWords.length; i++) {
            processedWords[i].level = currentLevel;
            countInLevel++;
            if (countInLevel >= maxPerLevel) {
                currentLevel++;
                countInLevel = 0;
                if (currentLevel > 10) break;
            }
        }
        processedWords.length = Math.min(processedWords.length, 10 * maxPerLevel);
        // --- END NEW ---

        // Save processed words
        const outputPath = path.join(__dirname, '..', 'src', 'data', 'processed_words.json');
        await fs.writeFile(outputPath, JSON.stringify(processedWords, null, 2));
        
        console.log(`\nTotal processed words: ${processedWords.length}`);
        console.log(`Words saved to: ${outputPath}`);
        
        // Print statistics
        const wordsByLevel = {};
        const wordsBySheet = {};
        const wordsByCategory = {};
        
        processedWords.forEach(word => {
            wordsByLevel[word.level] = (wordsByLevel[word.level] || 0) + 1;
            wordsBySheet[word.sheet] = (wordsBySheet[word.sheet] || 0) + 1;
            wordsByCategory[word.category] = (wordsByCategory[word.category] || 0) + 1;
        });
        
        console.log('\nWords by level:', wordsByLevel);
        console.log('\nWords by sheet:', wordsBySheet);
        console.log('\nWords by category:', wordsByCategory);
        
    } catch (error) {
        console.error('Error processing Excel file:', error);
    }
}

processExcel(); 