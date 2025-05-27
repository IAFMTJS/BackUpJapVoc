const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');

// Emotional categories with their associated emojis and colors
const EMOTIONAL_CATEGORIES = {
  flirting: { emoji: '😘', color: '#ff69b4' },
  anger: { emoji: '😠', color: '#ff4444' },
  love: { emoji: '❤️', color: '#ff1493' },
  happiness: { emoji: '😊', color: '#ffd700' },
  sadness: { emoji: '😢', color: '#4169e1' },
  surprise: { emoji: '😲', color: '#ffa500' },
  fear: { emoji: '😨', color: '#800080' },
  disgust: { emoji: '🤢', color: '#556b2f' },
  neutral: { emoji: '😐', color: '#808080' }
};

// Function to determine emotional category from English text
function determineEmotionalCategory(english) {
  const lowerEnglish = english.toLowerCase();
  
  // Define keywords for each category
  const categoryKeywords = {
    flirting: ['love', 'like', 'flirt', 'romantic', 'kiss', 'date', 'sweet'],
    anger: ['angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated'],
    love: ['love', 'adore', 'affection', 'fond', 'cherish', 'care'],
    happiness: ['happy', 'joy', 'glad', 'delighted', 'cheerful', 'pleased'],
    sadness: ['sad', 'sorrow', 'grief', 'unhappy', 'depressed', 'melancholy'],
    surprise: ['surprise', 'amazed', 'astonished', 'shocked', 'stunned'],
    fear: ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried'],
    disgust: ['disgust', 'disgusted', 'repulsed', 'revolted', 'nauseated'],
    neutral: ['neutral', 'calm', 'normal', 'usual', 'regular', 'ordinary']
  };

  // Count matches for each category
  const categoryMatches = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    categoryMatches[category] = keywords.filter(keyword => 
      lowerEnglish.includes(keyword)
    ).length;
  }

  // Find the category with the most matches
  let maxMatches = 0;
  let selectedCategory = 'neutral';
  for (const [category, matches] of Object.entries(categoryMatches)) {
    if (matches > maxMatches) {
      maxMatches = matches;
      selectedCategory = category;
    }
  }

  return selectedCategory;
}

// Function to determine emotional intensity (1-5)
function determineEmotionalIntensity(english) {
  const lowerEnglish = english.toLowerCase();
  
  // Words indicating high intensity
  const highIntensityWords = [
    'very', 'extremely', 'absolutely', 'completely', 'totally',
    'really', 'incredibly', 'intensely', 'deeply', 'profoundly'
  ];
  
  // Words indicating low intensity
  const lowIntensityWords = [
    'slightly', 'somewhat', 'a bit', 'a little', 'kind of',
    'rather', 'fairly', 'moderately', 'relatively'
  ];

  // Count intensity indicators
  const highCount = highIntensityWords.filter(word => lowerEnglish.includes(word)).length;
  const lowCount = lowIntensityWords.filter(word => lowerEnglish.includes(word)).length;

  // Calculate base intensity
  let intensity = 3; // Default to middle intensity
  if (highCount > 0) intensity += Math.min(highCount, 2);
  if (lowCount > 0) intensity -= Math.min(lowCount, 2);

  // Ensure intensity is between 1 and 5
  return Math.max(1, Math.min(5, intensity));
}

// Function to generate related emotions
function generateRelatedEmotions(category, english) {
  const lowerEnglish = english.toLowerCase();
  const relatedEmotions = new Set();

  // Add category-specific related emotions
  switch (category) {
    case 'happiness':
      relatedEmotions.add('joy');
      relatedEmotions.add('delight');
      if (lowerEnglish.includes('excite')) relatedEmotions.add('excitement');
      if (lowerEnglish.includes('pleas')) relatedEmotions.add('pleasure');
      break;
    case 'sadness':
      relatedEmotions.add('grief');
      relatedEmotions.add('melancholy');
      if (lowerEnglish.includes('lonel')) relatedEmotions.add('loneliness');
      if (lowerEnglish.includes('miss')) relatedEmotions.add('longing');
      break;
    case 'anger':
      relatedEmotions.add('frustration');
      relatedEmotions.add('irritation');
      if (lowerEnglish.includes('rage')) relatedEmotions.add('rage');
      if (lowerEnglish.includes('annoy')) relatedEmotions.add('annoyance');
      break;
    case 'love':
      relatedEmotions.add('affection');
      relatedEmotions.add('adoration');
      if (lowerEnglish.includes('care')) relatedEmotions.add('caring');
      if (lowerEnglish.includes('fond')) relatedEmotions.add('fondness');
      break;
    case 'fear':
      relatedEmotions.add('anxiety');
      relatedEmotions.add('terror');
      if (lowerEnglish.includes('worry')) relatedEmotions.add('worry');
      if (lowerEnglish.includes('nervous')) relatedEmotions.add('nervousness');
      break;
    // Add more cases for other categories
  }

  return Array.from(relatedEmotions);
}

// Function to generate usage notes
function generateUsageNotes(category, english) {
  const lowerEnglish = english.toLowerCase();
  let notes = '';

  switch (category) {
    case 'happiness':
      notes = 'Used to express joy or happiness';
      if (lowerEnglish.includes('very') || lowerEnglish.includes('really')) {
        notes += ' (strong expression)';
      }
      break;
    case 'sadness':
      notes = 'Expresses sadness or sorrow';
      if (lowerEnglish.includes('deep') || lowerEnglish.includes('profound')) {
        notes += ' (deep emotional expression)';
      }
      break;
    case 'anger':
      notes = 'Used when expressing anger';
      if (lowerEnglish.includes('very') || lowerEnglish.includes('extremely')) {
        notes += ' (strong expression of anger)';
      }
      break;
    case 'love':
      notes = 'Expresses love or strong affection';
      if (lowerEnglish.includes('really') || lowerEnglish.includes('truly')) {
        notes += ' (sincere expression of love)';
      }
      break;
    case 'fear':
      notes = 'Used to express fear or being scared';
      if (lowerEnglish.includes('very') || lowerEnglish.includes('really')) {
        notes += ' (strong expression of fear)';
      }
      break;
    // Add more cases for other categories
    default:
      notes = `Used to express ${category}`;
  }

  return notes;
}

// Helper function to check if a string contains Japanese text
function hasJapaneseText(text) {
    return /[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FF]/.test(text);
}

// Helper function to determine emotional context from English text
function determineEmotionalContext(english) {
    const context = {
        category: 'romantic', // default category
        intensity: 'medium',
        related_emotions: [],
        usage_notes: []
    };

    // Convert to lowercase for easier matching
    const text = english.toLowerCase();

    // Determine category based on keywords
    if (text.includes('love') || text.includes('heart') || text.includes('beautiful') || 
        text.includes('like') || text.includes('together') || text.includes('future')) {
        context.category = 'romantic';
    } else if (text.includes('angry') || text.includes('hate') || text.includes('stupid') || 
               text.includes('annoying') || text.includes('die') || text.includes('shut up')) {
        context.category = 'angry';
    } else if (text.includes('happy') || text.includes('smile') || text.includes('joy') || 
               text.includes('fun') || text.includes('warm') || text.includes('light')) {
        context.category = 'happy';
    } else if (text.includes('sad') || text.includes('cry') || text.includes('tears') || 
               text.includes('lonely') || text.includes('miss')) {
        context.category = 'sad';
    } else if (text.includes('scared') || text.includes('afraid') || text.includes('fear') || 
               text.includes('nervous') || text.includes('anxious')) {
        context.category = 'scared';
    }

    // Determine intensity
    if (text.includes('very') || text.includes('really') || text.includes('so much') || 
        text.includes('extremely') || text.includes('absolutely')) {
        context.intensity = 'high';
    } else if (text.includes('little') || text.includes('slightly') || text.includes('somewhat')) {
        context.intensity = 'low';
    }

    // Add related emotions based on category
    switch (context.category) {
        case 'romantic':
            context.related_emotions = ['love', 'affection', 'passion'];
            context.usage_notes = ['Use in romantic contexts', 'Can be used to express deep feelings'];
            break;
        case 'angry':
            context.related_emotions = ['frustration', 'irritation', 'rage'];
            context.usage_notes = ['Use with caution', 'Consider the relationship context'];
            break;
        case 'happy':
            context.related_emotions = ['joy', 'excitement', 'contentment'];
            context.usage_notes = ['Use in positive situations', 'Good for expressing gratitude'];
            break;
        case 'sad':
            context.related_emotions = ['melancholy', 'loneliness', 'nostalgia'];
            context.usage_notes = ['Use in emotional contexts', 'Can express empathy'];
            break;
        case 'scared':
            context.related_emotions = ['anxiety', 'worry', 'fear'];
            context.usage_notes = ['Use in concerning situations', 'Can express concern'];
            break;
    }

    return context;
}

async function processMoodWords() {
  try {
    const filePath = path.join(__dirname, '..', 'JAPJAP NEW WORDS.docx');
    console.log('Reading file from:', filePath);
    
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    console.log('File read successfully. Text length:', text.length);
    console.log('First 200 characters:', text.substring(0, 200));

    // Split into lines and filter out empty lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('Number of non-empty lines:', lines.length);

    const processedWords = [];
    let currentEntry = null;
    let lineType = null; // 'japanese', 'romaji', or 'english'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip header lines
      if (line === '🇯🇵 Japans' || line === '🔤 Romaji' || line === '🇬🇧 Engels') {
        continue;
      }

      // Check if this is a Japanese line
      if (hasJapaneseText(line)) {
        if (currentEntry) {
          // If we have a previous entry that's complete, save it
          if (currentEntry.japanese && currentEntry.romaji && currentEntry.english) {
            processedWords.push(currentEntry);
          }
        }
        // Start a new entry
        currentEntry = {
          japanese: line,
          romaji: '',
          english: '',
          category: 'romantic', // default category
          intensity: 'medium',
          related_emotions: [],
          usage_notes: []
        };
        lineType = 'japanese';
      } 
      // Check if this is a Romaji line (contains Latin characters but no Japanese)
      else if (/^[a-zA-Z\s,.'?!-]+$/.test(line) && !hasJapaneseText(line)) {
        if (currentEntry) {
          currentEntry.romaji = line;
          lineType = 'romaji';
        }
      }
      // This must be an English line
      else if (!hasJapaneseText(line)) {
        if (currentEntry) {
          currentEntry.english = line;
          lineType = 'english';
          
          // Determine emotional context from English text
          const context = determineEmotionalContext(line);
          currentEntry.category = context.category;
          currentEntry.intensity = context.intensity;
          currentEntry.related_emotions = context.related_emotions;
          currentEntry.usage_notes = context.usage_notes;
        }
      }
    }

    // Add the last entry if it's complete
    if (currentEntry && currentEntry.japanese && currentEntry.romaji && currentEntry.english) {
      processedWords.push(currentEntry);
    }

    // Sort words by category and then by Japanese text
    processedWords.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.japanese.localeCompare(b.japanese);
    });

    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'mood_words.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedWords, null, 2));
    console.log(`Successfully processed ${processedWords.length} words and saved to ${outputPath}`);

  } catch (error) {
    console.error('Error processing file:', error);
  }
}

// Run the script
processMoodWords(); 