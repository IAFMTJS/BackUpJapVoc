// This script now uses the shared level logic from src/data/levelRules.ts
// Do not duplicate level rules here—always update src/data/levelRules.ts if changes are needed.

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdf = require('pdf-parse');
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

// Function to determine if a string is Japanese (contains any Japanese characters)
function isJapanese(str) {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str);
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

// Function to clean and normalize text
function cleanText(text) {
    return text
        .replace(/[\[\]()]/g, '') // Remove brackets and parentheses
        .replace(/[;:]/g, '') // Remove semicolons and colons
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

// Function to extract romaji from text (revert to previous extraction)
function extractRomaji(text) {
    const romajiMatch = text.match(/\[([a-zA-Z\s]+)\]/);
    return romajiMatch ? romajiMatch[1].trim() : '';
}

// Function to assign JLPT level based on assigned level
function assignJlptLevel(level) {
    if (level <= 2) return 'N5';
    if (level <= 4) return 'N4';
    if (level <= 6) return 'N3';
    if (level <= 8) return 'N2';
    return 'N1';
}

async function processPDF() {
    try {
        // Read the PDF file
        const pdfPath = path.join(__dirname, '..', '1000-Basic-Japanese-Words-With-English-Translations-PDF-_-blog.matthewhawkins.co-Sheet-1-1.pdf');
        const dataBuffer = fs.readFileSync(pdfPath);
        
        // Parse the PDF
        const data = await pdf(dataBuffer);
        
        // Split the text into lines and process each line
        const lines = data.text.split('\n').filter(line => line.trim());
        
        const processedWords = [];
        let currentWord = null;
        
        for (const line of lines) {
            // Skip empty lines, headers, and metadata
            if (!line.trim() || 
                line.includes('Adapted from') || 
                line.includes('creative commons') || 
                line.includes('recommend the rtk series') ||
                line.includes('page:') ||
                !isJapanese(line)) {
                continue;
            }
            
            // Try to parse the line as a word entry
            const parts = line.split(/\s+/).filter(part => part.trim());
            if (parts.length >= 2) {
                // Find the first Japanese word
                let japaneseIndex = parts.findIndex(part => isJapanese(part));
                if (japaneseIndex === -1) continue;
                
                const japanese = cleanText(parts[japaneseIndex]);
                // Get the English translation (everything after the Japanese word until the next Japanese word or end)
                let englishParts = [];
                for (let i = japaneseIndex + 1; i < parts.length; i++) {
                    if (isJapanese(parts[i])) break;
                    englishParts.push(parts[i]);
                }
                const english = cleanText(englishParts.join(' '));
                const romaji = extractRomaji(line);
                
                // Skip if either Japanese or English is empty
                if (!japanese || !english) continue;
                
                // Create a new word entry
                const word = {
                    id: `cw-${uuidv4().slice(0, 8)}`,
                    japanese: japanese,
                    english: english,
                    romaji: romaji,
                    hiragana: isHiragana(japanese) ? japanese : '',
                    kanji: containsKanji(japanese) ? japanese : undefined,
                    level: assignLevel(word),
                    category: determineCategory(english),
                    jlptLevel: assignJlptLevel(assignLevel(word)),
                    examples: [],
                    notes: ''
                };
                
                // Only add if it's a valid word entry
                if (word.japanese && word.english && word.japanese.length > 0 && word.english.length > 0) {
                    processedWords.push(word);
                }
            }
        }
        
        // --- NEW: Evenly distribute by difficulty into 10 levels, max 100 per level ---
        processedWords.sort((a, b) => a.level - b.level);
        const maxPerLevel = 100;
        let currentLevel = 1;
        let countInLevel = 0;
        for (let i = 0; i < processedWords.length; i++) {
            processedWords[i].level = currentLevel;
            processedWords[i].jlptLevel = assignJlptLevel(currentLevel);
            countInLevel++;
            if (countInLevel >= maxPerLevel) {
                currentLevel++;
                countInLevel = 0;
                if (currentLevel > 10) break;
            }
        }
        processedWords.length = Math.min(processedWords.length, 10 * maxPerLevel);
        // --- END NEW ---

        // Save the processed words as a flat array
        const outputPath = path.join(__dirname, '..', 'src', 'data', 'processed_words.json');
        fs.writeFileSync(outputPath, JSON.stringify(processedWords, null, 2));
        
        console.log(`Processed ${processedWords.length} words`);
        console.log('Words saved to:', outputPath);
        
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

processPDF(); 