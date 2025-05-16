const fs = require('fs');
const path = require('path');

// Read the current processed words
const processedWordsPath = path.join(__dirname, '../src/data/processed_words.json');
const words = JSON.parse(fs.readFileSync(processedWordsPath, 'utf8'));

// Category mapping from old to new categories
const categoryMapping = {
  // Basic Categories
  'Greetings': 'greeting',
  'Numbers': 'number',
  'Pronouns': 'pronoun',
  'Questions': 'question',
  
  // Parts of Speech
  'Verbs': 'verb',
  'Adjectives': 'adjective',
  'Adverbs': 'adverb',
  'Particles': 'particle',
  'Conjunctions': 'conjunction',
  'Interjections': 'interjection',
  'Pre-noun adjectival': 'adjective',
  
  // Topic Categories
  'Food': 'food',
  'Drink': 'drink',
  'Animals': 'animal',
  'Colors': 'color',
  'Time': 'time',
  'Family': 'family',
  'Weather': 'weather',
  'Body': 'body',
  'Health': 'health',
  'Work': 'work',
  'Education': 'education',
  'Hobbies': 'hobby',
  'Travel': 'travel',
  'Shopping': 'shopping',
  'Money': 'money',
  'Transportation': 'transportation',
  'Nature': 'nature',
  'Housing': 'housing',
  'Technology': 'technology',
  'Business': 'business',
  'Academic': 'academic',
  'Language': 'language',
  'Media': 'media',
  'Others': 'other',
  'Abstract nouns': 'abstract',
  'Forms': 'form',
  'Activities': 'activity',
  'Emotions': 'emotion',
  'Directions and positions': 'direction',
  'Plants': 'plant',
  'Crops': 'crop',
  'People': 'person',
  
  // Special Categories
  'Idioms': 'idiom',
  'Proverbs': 'proverb',
  'Onomatopoeia': 'onomatopoeia',
  'Honorific': 'honorific',
  'Slang': 'slang',
  'Colloquial': 'colloquial',
  'Nuanced': 'nuanced',
  'Literature': 'literature',
  'Formal': 'formal',
  'Advanced': 'advanced'
};

// Example sentences for common words
const exampleSentences = {
  // Basic Greetings and Introductions
  '私': [
    {
      japanese: '私は学生です。',
      english: 'I am a student.',
      romaji: 'Watashi wa gakusei desu.',
      notes: 'Basic self-introduction'
    },
    {
      japanese: '私の名前は田中です。',
      english: 'My name is Tanaka.',
      romaji: 'Watashi no namae wa Tanaka desu.',
      notes: 'Introducing yourself with your name'
    }
  ],
  '名前': [
    {
      japanese: 'お名前は何ですか？',
      english: 'What is your name?',
      romaji: 'O-namae wa nan desu ka?',
      notes: 'Polite way to ask someone\'s name'
    }
  ],
  '学生': [
    {
      japanese: '私は大学生です。',
      english: 'I am a university student.',
      romaji: 'Watashi wa daigakusei desu.',
      notes: 'Specifying type of student'
    }
  ],

  // Common Verbs
  '食べる': [
    {
      japanese: '毎日朝ごはんを食べます。',
      english: 'I eat breakfast every day.',
      romaji: 'Mainichi asagohan wo tabemasu.',
      notes: 'Daily routine with time expression'
    },
    {
      japanese: 'この料理は美味しく食べられます。',
      english: 'This dish can be eaten deliciously.',
      romaji: 'Kono ryouri wa oishiku taberaremasu.',
      notes: 'Potential form of verb'
    }
  ],
  '飲む': [
    {
      japanese: 'お茶を飲みましょう。',
      english: 'Let\'s drink tea.',
      romaji: 'Ocha wo nomimashou.',
      notes: 'Suggestive form'
    }
  ],
  '行く': [
    {
      japanese: '学校に行きます。',
      english: 'I go to school.',
      romaji: 'Gakkou ni ikimasu.',
      notes: 'Basic movement verb with destination'
    },
    {
      japanese: '一緒に行きましょう。',
      english: 'Let\'s go together.',
      romaji: 'Issho ni ikimashou.',
      notes: 'Suggestive form with together'
    }
  ],

  // Time and Numbers
  '今日': [
    {
      japanese: '今日はいい天気です。',
      english: 'Today is nice weather.',
      romaji: 'Kyou wa ii tenki desu.',
      notes: 'Basic weather expression'
    }
  ],
  '時間': [
    {
      japanese: '何時間かかりますか？',
      english: 'How many hours will it take?',
      romaji: 'Nan-jikan kakarimasu ka?',
      notes: 'Asking about duration'
    }
  ],

  // Family
  '家族': [
    {
      japanese: '私の家族は4人です。',
      english: 'My family has 4 people.',
      romaji: 'Watashi no kazoku wa yonin desu.',
      notes: 'Describing family size'
    }
  ],
  '母': [
    {
      japanese: '母は料理が上手です。',
      english: 'My mother is good at cooking.',
      romaji: 'Haha wa ryouri ga jouzu desu.',
      notes: 'Describing someone\'s ability'
    }
  ],

  // Food and Drink
  '料理': [
    {
      japanese: '日本料理が好きです。',
      english: 'I like Japanese food.',
      romaji: 'Nihon ryouri ga suki desu.',
      notes: 'Expressing preference'
    }
  ],
  '水': [
    {
      japanese: '水をください。',
      english: 'Water, please.',
      romaji: 'Mizu wo kudasai.',
      notes: 'Basic request'
    }
  ],

  // Transportation
  '電車': [
    {
      japanese: '電車で学校に行きます。',
      english: 'I go to school by train.',
      romaji: 'Densha de gakkou ni ikimasu.',
      notes: 'Using transportation method'
    }
  ],
  '駅': [
    {
      japanese: '駅はどこですか？',
      english: 'Where is the station?',
      romaji: 'Eki wa doko desu ka?',
      notes: 'Asking for location'
    }
  ],

  // Work and Business
  '仕事': [
    {
      japanese: '仕事が忙しいです。',
      english: 'Work is busy.',
      romaji: 'Shigoto ga isogashii desu.',
      notes: 'Describing work situation'
    }
  ],
  '会社': [
    {
      japanese: '会社員です。',
      english: 'I am a company employee.',
      romaji: 'Kaishain desu.',
      notes: 'Stating occupation'
    }
  ],

  // Emotions and Feelings
  '嬉しい': [
    {
      japanese: '合格して嬉しいです。',
      english: 'I am happy to have passed.',
      romaji: 'Goukaku shite ureshii desu.',
      notes: 'Expressing happiness with reason'
    }
  ],
  '疲れた': [
    {
      japanese: '今日は疲れました。',
      english: 'I am tired today.',
      romaji: 'Kyou wa tsukaremashita.',
      notes: 'Expressing fatigue'
    }
  ],

  // Weather
  '天気': [
    {
      japanese: '今日の天気はどうですか？',
      english: 'How is the weather today?',
      romaji: 'Kyou no tenki wa dou desu ka?',
      notes: 'Asking about weather'
    }
  ],
  '雨': [
    {
      japanese: '雨が降っています。',
      english: 'It is raining.',
      romaji: 'Ame ga futte imasu.',
      notes: 'Describing current weather'
    }
  ],

  // Advanced Expressions
  '人間': [
    {
      japanese: '人間は考える葦である。',
      english: 'Humans are thinking reeds.',
      romaji: 'Ningen wa kangaeru ashi de aru.',
      notes: 'A famous quote by Blaise Pascal'
    }
  ],
  '文化': [
    {
      japanese: '日本の文化に興味があります。',
      english: 'I am interested in Japanese culture.',
      romaji: 'Nihon no bunka ni kyoumi ga arimasu.',
      notes: 'Expressing interest in a topic'
    }
  ]
};

// Update the words with new structure
const updatedWords = words.map(word => {
  // Get the new category
  const newCategory = categoryMapping[word.category] || word.category.toLowerCase();
  
  // Get example sentences if available
  const examples = exampleSentences[word.kanji] || [];
  
  // Add additional metadata
  return {
    ...word,
    category: newCategory,
    example: examples[0]?.japanese || '',
    exampleTranslation: examples[0]?.english || '',
    exampleRomaji: examples[0]?.romaji || '',
    exampleNotes: examples[0]?.notes || '',
    additionalExamples: examples.slice(1),
    notes: word.notes || ''
  };
});

// Write the updated words back to the file
fs.writeFileSync(
  processedWordsPath,
  JSON.stringify(updatedWords, null, 2),
  'utf8'
);

console.log('Updated word data with new categories and example sentences.'); 