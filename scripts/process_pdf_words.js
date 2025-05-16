const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdf = require('pdf-parse');

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
                    hiragana: isHiragana(japanese) ? japanese : '', // We'll need to add hiragana conversion
                    kanji: containsKanji(japanese) ? japanese : undefined,
                    level: determineLevel(japanese, english, determineCategory(english)),
                    category: determineCategory(english),
                    examples: [], // We'll need to add example sentences later
                    notes: ''
                };
                
                // Only add if it's a valid word entry
                if (word.japanese && word.english && word.japanese.length > 0 && word.english.length > 0) {
                    processedWords.push(word);
                }
            }
        }
        
        // Group words by level
        const wordsByLevel = processedWords.reduce((acc, word) => {
            if (!acc[word.level]) {
                acc[word.level] = [];
            }
            acc[word.level].push(word);
            return acc;
        }, {});
        
        // Save the processed words
        const outputPath = path.join(__dirname, '..', 'src', 'data', 'processed_words.json');
        fs.writeFileSync(outputPath, JSON.stringify(wordsByLevel, null, 2));
        
        console.log(`Processed ${processedWords.length} words`);
        console.log('Words saved to:', outputPath);
        
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

processPDF(); 