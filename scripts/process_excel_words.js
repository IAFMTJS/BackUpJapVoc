const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');

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
        'pronoun': ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'],
        'verb': ['to', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'go', 'come', 'eat', 'drink', 'sleep', 'walk', 'run'],
        'adjective': ['big', 'small', 'good', 'bad', 'hot', 'cold', 'new', 'old', 'beautiful', 'ugly', 'happy', 'sad'],
        'adverb': ['very', 'quickly', 'slowly', 'well', 'badly', 'often', 'sometimes', 'never', 'always'],
        'number': ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand'],
        'time': ['today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'week', 'month', 'year'],
        'place': ['here', 'there', 'where', 'home', 'school', 'work', 'hospital', 'station', 'park', 'restaurant'],
        'family': ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather', 'aunt', 'uncle'],
        'food': ['rice', 'bread', 'meat', 'fish', 'vegetable', 'fruit', 'water', 'tea', 'coffee', 'milk'],
        'weather': ['sunny', 'rainy', 'cloudy', 'snowy', 'hot', 'cold', 'warm', 'cool'],
        'emotion': ['happy', 'sad', 'angry', 'scared', 'surprised', 'excited', 'tired', 'bored'],
        'body': ['head', 'hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'hair', 'face'],
        'clothing': ['shirt', 'pants', 'dress', 'shoes', 'hat', 'coat', 'socks', 'underwear'],
        'transportation': ['car', 'bus', 'train', 'bicycle', 'airplane', 'ship', 'taxi', 'subway'],
        'occupation': ['teacher', 'doctor', 'student', 'worker', 'engineer', 'artist', 'writer', 'singer'],
        'education': ['school', 'university', 'class', 'book', 'pen', 'pencil', 'paper', 'test', 'exam']
    };

    const lowerEnglish = english.toLowerCase();
    for (const [category, words] of Object.entries(categories)) {
        if (words.some(word => lowerEnglish.includes(word))) {
            return category;
        }
    }
    return 'noun'; // Default to noun if no other category matches
}

// Function to determine word level based on complexity and category
function determineLevel(japanese, english, category) {
    // Define level distribution based on JLPT and category
    const levelDistribution = {
        'N5': {
            // Level 1: Basic survival words (greetings, numbers, pronouns)
            greeting: 1,
            number: 1,
            pronoun: 1,
            question: 1,
            // Level 2: Simple nouns (time, weather, directions)
            time: 2,
            weather: 2,
            direction: 2,
            color: 2,
            // Level 3: Basic particles and simple verbs
            particle: 3,
            verb: 3,
            // Level 4: Basic adjectives and adverbs
            adjective: 4,
            adverb: 4,
            // Level 5: Common nouns (food, family, body)
            food: 5,
            drink: 5,
            family: 5,
            body: 5,
            // Level 6: Basic actions and states
            action: 6,
            movement: 6,
            'change of state': 6,
            default: 3
        },
        'N4': {
            // Level 3: Basic particles and simple verbs
            particle: 3,
            verb: 3,
            // Level 4: Basic adjectives and adverbs
            adjective: 4,
            adverb: 4,
            // Level 5: Common nouns (food, family, body)
            food: 5,
            drink: 5,
            family: 5,
            body: 5,
            // Level 6: Basic actions and states
            action: 6,
            movement: 6,
            'change of state': 6,
            // Level 7: Transportation and shopping
            transportation: 7,
            shopping: 7,
            // Level 8: Emotions and health
            emotion: 8,
            health: 8,
            housing: 8,
            // Level 9: Work and education
            work: 9,
            education: 9,
            hobby: 9,
            travel: 9,
            money: 9,
            default: 6
        },
        'N3': {
            // Level 7: Transportation and shopping
            transportation: 7,
            shopping: 7,
            // Level 8: Emotions and health
            emotion: 8,
            health: 8,
            housing: 8,
            // Level 9: Work and education
            work: 9,
            education: 9,
            hobby: 9,
            travel: 9,
            money: 9,
            // Level 10: Technology and business
            technology: 10,
            business: 10,
            academic: 10,
            default: 8
        },
        'N2': {
            // Level 9: Work and education
            work: 9,
            education: 9,
            hobby: 9,
            travel: 9,
            money: 9,
            // Level 10: Advanced language
            technology: 10,
            business: 10,
            academic: 10,
            verb: 10,
            adjective: 10,
            adverb: 10,
            conjunction: 10,
            idiom: 10,
            proverb: 10,
            onomatopoeia: 10,
            default: 9
        },
        'N1': {
            // Level 10: Advanced language
            literature: 10,
            formal: 10,
            advanced: 10,
            slang: 10,
            colloquial: 10,
            nuanced: 10,
            default: 10
        }
    };

    // First determine the category if not provided
    if (!category) {
        category = determineCategory(english);
    }

    // Normalize category name to match distribution rules
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
    
    // Determine JLPT level based on word characteristics and category
    let jlptLevel = 'N5';
    
    // Category-based JLPT level determination
    if (['verb', 'adjective', 'adverb', 'particle', 'action', 'movement', 'change of state'].includes(normalizedCategory)) {
        jlptLevel = 'N4';  // Basic verbs, adjectives, adverbs, and related categories are N4
    } else if (['technology', 'business', 'academic'].includes(normalizedCategory)) {
        jlptLevel = 'N2';
    } else if (['literature', 'formal', 'advanced'].includes(normalizedCategory)) {
        jlptLevel = 'N1';
    }

    // Adjust JLPT level based on word characteristics
    if (containsKanji(japanese)) {
        // Words with kanji are typically N4 or higher
        if (jlptLevel === 'N5') {
            jlptLevel = 'N4';
        }
    } else if (isKatakana(japanese)) {
        // Katakana words (often loanwords) are typically N4 or higher
        if (jlptLevel === 'N5') {
            jlptLevel = 'N4';
        }
    }

    // Get the appropriate level based on JLPT level and category
    const distribution = levelDistribution[jlptLevel];
    return normalizedCategory ? (distribution[normalizedCategory] || distribution.default) : distribution.default;
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
                
                // Create word object
                const word = {
                    kana: kana.trim(),
                    kanji: kanji.trim(),
                    english: english.trim(),
                    romaji: romaji.trim(),
                    category: currentCategory || 'Uncategorized',
                    level: determineLevel(kana || kanji, english, currentCategory),
                    sheet: sheetName
                };
                
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