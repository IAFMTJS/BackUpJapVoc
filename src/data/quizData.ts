export type Category = 
  // Basic Categories
  | 'greeting' | 'question' | 'pronoun'
  // Parts of Speech
  | 'verb' | 'adjective' | 'adverb' | 'particle' | 'conjunction' | 'interjection'
  // Topic Categories
  | 'food' | 'drink' | 'animals' | 'colors' | 'numbers' | 'family' | 'weather' | 'time' 
  | 'transportation' | 'clothing' | 'body' | 'emotions' | 'school' | 'work' | 'hobbies' 
  | 'nature' | 'house' | 'city' | 'technology' | 'health' | 'travel' | 'shopping' 
  | 'money' | 'direction' | 'location' | 'measurement'
  // Special Categories
  | 'idiom' | 'proverb' | 'onomatopoeia' | 'honorific' | 'slang'
  // Writing Systems
  | 'hiragana' | 'katakana'
  // All Categories
  | 'all';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizWord {
  japanese: string;
  english: string;
  category: Category;
  difficulty: Difficulty;
  hint?: string;
  romaji?: string;
  isHiragana: boolean;
  isKatakana: boolean;
  examples?: Array<{
    japanese: string;
    english: string;
    romaji: string;
    notes?: string;
  }>;
  notes?: string;
  jlptLevel?: string;
}

export const quizWords: QuizWord[] = [
  {
    "japanese": "私",
    "english": "I, me",
    "category": "pronoun",
    "difficulty": "easy",
    "hint": "",
    "romaji": "watashi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "あなた",
    "english": "you",
    "category": "pronoun",
    "difficulty": "easy",
    "hint": "",
    "romaji": "anata",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "彼",
    "english": "he, him",
    "category": "pronoun",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kare",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "彼女",
    "english": "she, her",
    "category": "pronoun",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kanojo",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "です",
    "english": "to be (polite)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "desu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "有る",
    "english": "to exist (inanimate)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "aru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "居る",
    "english": "to exist (animate)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "iru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "為る",
    "english": "to do",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "suru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "本",
    "english": "book",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hon",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "水",
    "english": "water",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "mizu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {}
    ]
  },
  {
    "japanese": "猫",
    "english": "cat",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "neko",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "犬",
    "english": "dog",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "inu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "食べる",
    "english": "to eat",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "taberu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "飲む",
    "english": "to drink",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nomu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "行く",
    "english": "to go",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "iku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "来る",
    "english": "to come",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kuru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "見る",
    "english": "to see, to look",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "miru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "聞く",
    "english": "to listen, to hear",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kiku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "話す",
    "english": "to speak, to talk",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hanasu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "書く",
    "english": "to write",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kaku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "読む",
    "english": "to read",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "yomu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "買う",
    "english": "to buy",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kau",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "売る",
    "english": "to sell",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "uru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "学校",
    "english": "school",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "gakkou",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "会社",
    "english": "company, office",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kaisha",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "駅",
    "english": "station",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "eki",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "電車",
    "english": "train",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "densha",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "ばす",
    "english": "bus",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "basu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "車",
    "english": "car",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kuruma",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "家",
    "english": "house, home",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "ie",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "部屋",
    "english": "room",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "heya",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "机",
    "english": "desk",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tsukue",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "椅子",
    "english": "chair",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "isu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "時計",
    "english": "clock, watch",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tokei",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "電話",
    "english": "telephone",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "denwa",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "てれび",
    "english": "television",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "terebi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "ぱそこん",
    "english": "computer",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "pasokon",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "冷蔵庫",
    "english": "refrigerator",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "reizouko",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "洗濯機",
    "english": "washing machine",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "sentakuki",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "窓",
    "english": "window",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "mado",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "どあ",
    "english": "door",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "doa",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "大きい",
    "english": "big, large",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "ookii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "小さい",
    "english": "small, little",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "chiisai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "新しい",
    "english": "new",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "atarashii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "古い",
    "english": "old",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "furui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "高い",
    "english": "expensive, tall",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "takai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "安い",
    "english": "cheap, inexpensive",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "yasui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "良い",
    "english": "good",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "ii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "悪い",
    "english": "bad",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "warui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "難しい",
    "english": "difficult",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "muzukashii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "簡単",
    "english": "easy, simple",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kantan",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "忙しい",
    "english": "busy",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "isogashii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "暇",
    "english": "free time, leisure",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hima",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "暑い",
    "english": "hot (weather)",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "atsui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "寒い",
    "english": "cold (weather)",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "samui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "暖かい",
    "english": "warm",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "atatakai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "涼しい",
    "english": "cool, refreshing",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "suzushii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "美味しい",
    "english": "delicious",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "oishii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "不味い",
    "english": "bad tasting",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "mazui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "甘い",
    "english": "sweet",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "amai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "辛い",
    "english": "spicy, hot",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "karai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "酸っぱい",
    "english": "sour",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "suppai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "苦い",
    "english": "bitter",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nigai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "塩辛い",
    "english": "salty",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "shiokarai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "薄い",
    "english": "thin, weak",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "usui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "厚い",
    "english": "thick",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "atsui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "広い",
    "english": "wide, spacious",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hiroi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "狭い",
    "english": "narrow, cramped",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "semai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "長い",
    "english": "long",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nagai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "短い",
    "english": "short",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "mijikai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "早い",
    "english": "early, fast",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hayai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "遅い",
    "english": "late, slow",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "osoi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "速い",
    "english": "fast, quick",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hayai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "遅い",
    "english": "slow",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "osoi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "重い",
    "english": "heavy",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "omoi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "軽い",
    "english": "light",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "karui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "硬い",
    "english": "hard, stiff",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "katai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "柔らかい",
    "english": "soft",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "yawarakai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "強い",
    "english": "strong",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tsuyoi",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "弱い",
    "english": "weak",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "yowai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "美しい",
    "english": "beautiful",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "utsukushii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "醜い",
    "english": "ugly",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "minikui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "きれい",
    "english": "beautiful, clean",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kirei",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "汚い",
    "english": "dirty",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kitanai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "静か",
    "english": "quiet",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "shizuka",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "賑やか",
    "english": "lively, bustling",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nigiyaka",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "有名",
    "english": "famous",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "yuumei",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "大切",
    "english": "important, precious",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "taisetsu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "大丈夫",
    "english": "okay, all right",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "daijoubu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "危険",
    "english": "dangerous",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kiken",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "安全",
    "english": "safe",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "anzen",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "便利",
    "english": "convenient",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "benri",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "不便",
    "english": "inconvenient",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "fuben",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "上手",
    "english": "good at, skilled",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "jouzu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "下手",
    "english": "poor at, unskilled",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "heta",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "得意",
    "english": "good at, strong point",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tokui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "苦手",
    "english": "poor at, weak point",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nigate",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "好き",
    "english": "like, favorite",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "suki",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "嫌い",
    "english": "dislike, hate",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kirai",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "必要",
    "english": "necessary",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hitsuyou",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "歩く",
    "english": "to walk",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "aruku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "走る",
    "english": "to run",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hashiru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "泳ぐ",
    "english": "to swim",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "oyogu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "飛ぶ",
    "english": "to fly, to jump",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tobu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "座る",
    "english": "to sit",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "suwaru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "立つ",
    "english": "to stand",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tatsu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "寝る",
    "english": "to sleep, to lie down",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "neru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "起きる",
    "english": "to wake up, to get up",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "okiru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "着る",
    "english": "to wear (clothes)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kiru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "脱ぐ",
    "english": "to take off (clothes)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nugu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "履く",
    "english": "to wear (shoes, pants)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "haku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "かぶる",
    "english": "to wear (hat)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kaburu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "かける",
    "english": "to wear (glasses)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kakeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "洗う",
    "english": "to wash",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "arau",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "掃除する",
    "english": "to clean",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "souji suru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "片付ける",
    "english": "to tidy up, to put away",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "katazukeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "作る",
    "english": "to make, to create",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tsukuru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "使う",
    "english": "to use",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tsukau",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "開ける",
    "english": "to open",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "akeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "閉める",
    "english": "to close",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "shimeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "始める",
    "english": "to start, to begin",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hajimeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "終わる",
    "english": "to end, to finish",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "owaru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "待つ",
    "english": "to wait",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "matsu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "止まる",
    "english": "to stop",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tomaru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "止める",
    "english": "to stop (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tomeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "曲がる",
    "english": "to turn",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "magaru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "渡る",
    "english": "to cross",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "wataru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "通る",
    "english": "to pass through",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tooru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "消える",
    "english": "to disappear, to go out",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kieru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "消す",
    "english": "to turn off, to erase",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kesu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "付く",
    "english": "to turn on, to be attached",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "付ける",
    "english": "to turn on, to attach",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "壊れる",
    "english": "to break, to be broken",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "壊す",
    "english": "to break (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "直る",
    "english": "to be fixed, to be repaired",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "直す",
    "english": "to fix, to repair",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "切る",
    "english": "to cut",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "折る",
    "english": "to fold, to break",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "貼る",
    "english": "to stick, to paste",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "結ぶ",
    "english": "to tie, to connect",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "解く",
    "english": "to untie, to solve",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "包む",
    "english": "to wrap",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "開く",
    "english": "to open",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "閉じる",
    "english": "to close",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "集める",
    "english": "to collect, to gather",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "集まる",
    "english": "to gather, to meet",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "分ける",
    "english": "to divide, to separate",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "分かる",
    "english": "to understand",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "覚える",
    "english": "to remember, to memorize",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "忘れる",
    "english": "to forget",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "空",
    "english": "sky",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "海",
    "english": "sea, ocean",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "山",
    "english": "mountain",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "川",
    "english": "river",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "道",
    "english": "road, street",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "橋",
    "english": "bridge",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "公園",
    "english": "park",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "図書館",
    "english": "library",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "病院",
    "english": "hospital",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "銀行",
    "english": "bank",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "郵便局",
    "english": "post office",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "すーぱー",
    "english": "supermarket",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "こんびに",
    "english": "convenience store",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "れすとらん",
    "english": "restaurant",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "喫茶店",
    "english": "coffee shop",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "映画館",
    "english": "movie theater",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "美術館",
    "english": "art museum",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "博物館",
    "english": "museum",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "動物園",
    "english": "zoo",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "遊園地",
    "english": "amusement park",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "空港",
    "english": "airport",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "港",
    "english": "port, harbor",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "駐車場",
    "english": "parking lot",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "自転車置き場",
    "english": "bicycle parking",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "といれ",
    "english": "toilet, bathroom",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "階段",
    "english": "stairs",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "えれべーたー",
    "english": "elevator",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "えすかれーたー",
    "english": "escalator",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "屋上",
    "english": "rooftop",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "地下",
    "english": "underground, basement",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "屋根",
    "english": "roof",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "壁",
    "english": "wall",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "床",
    "english": "floor",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "天井",
    "english": "ceiling",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "柱",
    "english": "pillar, column",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "屋外",
    "english": "outdoors",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "屋内",
    "english": "indoors",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "玄関",
    "english": "entrance",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "廊下",
    "english": "hallway, corridor",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "階段",
    "english": "stairs",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "屋根裏",
    "english": "attic",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "地下室",
    "english": "basement",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "庭",
    "english": "garden",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "畑",
    "english": "field, farm",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "たんぼ",
    "english": "rice field",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "森",
    "english": "forest",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "林",
    "english": "woods, grove",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "草原",
    "english": "grassland, meadow",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "砂漠",
    "english": "desert",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "島",
    "english": "island",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "今日",
    "english": "today",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "明日",
    "english": "tomorrow",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "昨日",
    "english": "yesterday",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "朝",
    "english": "morning",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "昼",
    "english": "noon, daytime",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "夜",
    "english": "night, evening",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "今",
    "english": "now",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "後",
    "english": "after, later",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "前",
    "english": "before, ago",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "毎日",
    "english": "every day",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "毎週",
    "english": "every week",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "毎月",
    "english": "every month",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "毎年",
    "english": "every year",
    "category": "time",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "父",
    "english": "father",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "母",
    "english": "mother",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "兄",
    "english": "older brother",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "姉",
    "english": "older sister",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "弟",
    "english": "younger brother",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "妹",
    "english": "younger sister",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "祖父",
    "english": "grandfather",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "祖母",
    "english": "grandmother",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "叔父",
    "english": "uncle",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "叔母",
    "english": "aunt",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "従兄弟",
    "english": "cousin (male)",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "従姉妹",
    "english": "cousin (female)",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "息子",
    "english": "son",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "娘",
    "english": "daughter",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "夫",
    "english": "husband",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "妻",
    "english": "wife",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "家族",
    "english": "family",
    "category": "family",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "考える",
    "english": "to think, to consider",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "思う",
    "english": "to think, to feel",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "知る",
    "english": "to know, to learn",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "分かる",
    "english": "to understand",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "覚える",
    "english": "to remember, to memorize",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "忘れる",
    "english": "to forget",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "教える",
    "english": "to teach, to tell",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "習う",
    "english": "to learn",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "練習する",
    "english": "to practice",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "勉強する",
    "english": "to study",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "働く",
    "english": "to work",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "休む",
    "english": "to rest, to take a break",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "遊ぶ",
    "english": "to play",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "運動する",
    "english": "to exercise",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "散歩する",
    "english": "to take a walk",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "旅行する",
    "english": "to travel",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "帰る",
    "english": "to return, to go back",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "戻る",
    "english": "to return, to come back",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "出かける",
    "english": "to go out",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "入る",
    "english": "to enter, to go in",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "出る",
    "english": "to exit, to leave",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "乗る",
    "english": "to ride, to board",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "降りる",
    "english": "to get off, to descend",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "上がる",
    "english": "to go up, to rise",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "下がる",
    "english": "to go down, to lower",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "開く",
    "english": "to open",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "閉まる",
    "english": "to close",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "始まる",
    "english": "to begin, to start",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "終わる",
    "english": "to end, to finish",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "決まる",
    "english": "to be decided",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "決める",
    "english": "to decide",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "変わる",
    "english": "to change",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "変える",
    "english": "to change (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "続く",
    "english": "to continue",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "続ける",
    "english": "to continue (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "増える",
    "english": "to increase",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "増やす",
    "english": "to increase (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "減る",
    "english": "to decrease",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "減らす",
    "english": "to decrease (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "始める",
    "english": "to start (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "終える",
    "english": "to finish (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "始まる",
    "english": "to begin",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "終わる",
    "english": "to end, to finish",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "owaru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "作る",
    "english": "to make, to create",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tsukuru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "使う",
    "english": "to use",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tsukau",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "置く",
    "english": "to put, to place",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "oku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "取る",
    "english": "to take, to get",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "toru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "持つ",
    "english": "to hold, to have",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "motsu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "開ける",
    "english": "to open",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "akeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "閉める",
    "english": "to close",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "shimeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "切る",
    "english": "to cut",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kiru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "貼る",
    "english": "to stick, to paste",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "haru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "折る",
    "english": "to fold, to break",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "oru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "壊す",
    "english": "to break (something)",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kowasu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "壊れる",
    "english": "to break, to be broken",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kowareru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "直す",
    "english": "to fix, to repair",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "naosu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "直る",
    "english": "to be fixed, to be repaired",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "naoru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "洗う",
    "english": "to wash",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "arau",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "掃除する",
    "english": "to clean",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "souji suru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "片付ける",
    "english": "to tidy up, to put away",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "katazukeru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "準備する",
    "english": "to prepare",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "junbi suru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "片付く",
    "english": "to be tidied up, to be put away",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "katazuku",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "準備ができる",
    "english": "to be ready",
    "category": "verb",
    "difficulty": "easy",
    "hint": "",
    "romaji": "junbi ga dekiru",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "忙しい",
    "english": "busy",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "isogashii",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "暇",
    "english": "free time, not busy",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hima",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "静か",
    "english": "quiet",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "shizuka",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "賑やか",
    "english": "lively, bustling",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nigiyaka",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "安全",
    "english": "safe",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "anzen",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "危険",
    "english": "dangerous",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kiken",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "便利",
    "english": "convenient",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "benri",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "不便",
    "english": "inconvenient",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "fuben",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "上手",
    "english": "good at, skilled",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "jouzu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "下手",
    "english": "poor at, unskilled",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "heta",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "得意",
    "english": "good at, strong point",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "tokui",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "苦手",
    "english": "poor at, weak point",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "nigate",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "必要",
    "english": "necessary",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "hitsuyou",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "大切",
    "english": "important, precious",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "taisetsu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "大丈夫",
    "english": "okay, all right",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "daijoubu",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "残念",
    "english": "unfortunate, regrettable",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "zannen",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "幸せ",
    "english": "happy, fortunate",
    "category": "adjective",
    "difficulty": "easy",
    "hint": "",
    "romaji": "shiawase",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "空港",
    "english": "airport",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "kuukou",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "港",
    "english": "port, harbor",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "minato",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "美術館",
    "english": "art museum",
    "category": "all",
    "difficulty": "easy",
    "hint": "",
    "romaji": "bijutsukan",
    "isHiragana": true,
    "isKatakana": false,
    "examples": [
      {},
      {}
    ]
  },
  {
    "japanese": "あ",
    "english": "a",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "a",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "い",
    "english": "i",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "i",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "う",
    "english": "u",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "u",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "え",
    "english": "e",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "e",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "お",
    "english": "o",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "o",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "か",
    "english": "ka",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ka",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "き",
    "english": "ki",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ki",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "く",
    "english": "ku",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ku",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "け",
    "english": "ke",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ke",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "こ",
    "english": "ko",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ko",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "さ",
    "english": "sa",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "sa",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "し",
    "english": "shi",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "shi",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "す",
    "english": "su",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "su",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "せ",
    "english": "se",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "se",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "そ",
    "english": "so",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "so",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "た",
    "english": "ta",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ta",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ち",
    "english": "chi",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "chi",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "つ",
    "english": "tsu",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "tsu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "て",
    "english": "te",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "te",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "と",
    "english": "to",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "to",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "な",
    "english": "na",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "na",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "に",
    "english": "ni",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ni",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ぬ",
    "english": "nu",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "nu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ね",
    "english": "ne",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ne",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "の",
    "english": "no",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "no",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "は",
    "english": "ha",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ha",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ひ",
    "english": "hi",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "hi",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ふ",
    "english": "fu",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "fu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "へ",
    "english": "he",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "he",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ほ",
    "english": "ho",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ho",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ま",
    "english": "ma",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ma",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "み",
    "english": "mi",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "mi",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "む",
    "english": "mu",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "mu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "め",
    "english": "me",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "me",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "も",
    "english": "mo",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "mo",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "や",
    "english": "ya",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ya",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ゆ",
    "english": "yu",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "yu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "よ",
    "english": "yo",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "yo",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ら",
    "english": "ra",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ra",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "り",
    "english": "ri",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ri",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "る",
    "english": "ru",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ru",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "れ",
    "english": "re",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "re",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ろ",
    "english": "ro",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "ro",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "わ",
    "english": "wa",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "wa",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "を",
    "english": "wo",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "wo",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ん",
    "english": "n",
    "category": "hiragana",
    "difficulty": "easy",
    "romaji": "n",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ア",
    "english": "a",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "a",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "イ",
    "english": "i",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "i",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ウ",
    "english": "u",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "u",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "エ",
    "english": "e",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "e",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "オ",
    "english": "o",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "o",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "カ",
    "english": "ka",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ka",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "キ",
    "english": "ki",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ki",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ク",
    "english": "ku",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ku",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ケ",
    "english": "ke",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ke",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "コ",
    "english": "ko",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ko",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "サ",
    "english": "sa",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "sa",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "シ",
    "english": "shi",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "shi",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ス",
    "english": "su",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "su",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "セ",
    "english": "se",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "se",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ソ",
    "english": "so",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "so",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "タ",
    "english": "ta",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ta",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "チ",
    "english": "chi",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "chi",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ツ",
    "english": "tsu",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "tsu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "テ",
    "english": "te",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "te",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ト",
    "english": "to",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "to",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ナ",
    "english": "na",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "na",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ニ",
    "english": "ni",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ni",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ヌ",
    "english": "nu",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "nu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ネ",
    "english": "ne",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ne",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ノ",
    "english": "no",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "no",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ハ",
    "english": "ha",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ha",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ヒ",
    "english": "hi",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "hi",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "フ",
    "english": "fu",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "fu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ヘ",
    "english": "he",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "he",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ホ",
    "english": "ho",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ho",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "マ",
    "english": "ma",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ma",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ミ",
    "english": "mi",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "mi",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ム",
    "english": "mu",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "mu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "メ",
    "english": "me",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "me",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "モ",
    "english": "mo",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "mo",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ヤ",
    "english": "ya",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ya",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ユ",
    "english": "yu",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "yu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ヨ",
    "english": "yo",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "yo",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ラ",
    "english": "ra",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ra",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "リ",
    "english": "ri",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ri",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ル",
    "english": "ru",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ru",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "レ",
    "english": "re",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "re",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ロ",
    "english": "ro",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "ro",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ワ",
    "english": "wa",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "wa",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ヲ",
    "english": "wo",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "wo",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ン",
    "english": "n",
    "category": "katakana",
    "difficulty": "easy",
    "romaji": "n",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "こんにちは",
    "english": "hello",
    "category": "greeting",
    "difficulty": "easy",
    "romaji": "konnichiwa",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "コンニチハ",
    "english": "hello",
    "category": "greeting",
    "difficulty": "easy",
    "romaji": "konnichiwa",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "なに",
    "english": "what",
    "category": "question",
    "difficulty": "easy",
    "romaji": "nani",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ナニ",
    "english": "what",
    "category": "question",
    "difficulty": "easy",
    "romaji": "nani",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "わたし",
    "english": "I, me",
    "category": "pronoun",
    "difficulty": "easy",
    "romaji": "watashi",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ワタシ",
    "english": "I, me",
    "category": "pronoun",
    "difficulty": "easy",
    "romaji": "watashi",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "たべる",
    "english": "to eat",
    "category": "verb",
    "difficulty": "easy",
    "romaji": "taberu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "タベル",
    "english": "to eat",
    "category": "verb",
    "difficulty": "easy",
    "romaji": "taberu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "あかい",
    "english": "red",
    "category": "adjective",
    "difficulty": "easy",
    "romaji": "akai",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "アカイ",
    "english": "red",
    "category": "adjective",
    "difficulty": "easy",
    "romaji": "akai",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ゆっくり",
    "english": "slowly",
    "category": "adverb",
    "difficulty": "easy",
    "romaji": "yukkuri",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ユックリ",
    "english": "slowly",
    "category": "adverb",
    "difficulty": "easy",
    "romaji": "yukkuri",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "は",
    "english": "topic particle",
    "category": "particle",
    "difficulty": "easy",
    "romaji": "wa",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ハ",
    "english": "topic particle",
    "category": "particle",
    "difficulty": "easy",
    "romaji": "wa",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "そして",
    "english": "and (then)",
    "category": "conjunction",
    "difficulty": "easy",
    "romaji": "soshite",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ソシテ",
    "english": "and (then)",
    "category": "conjunction",
    "difficulty": "easy",
    "romaji": "soshite",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ああ",
    "english": "ah! (interjection)",
    "category": "interjection",
    "difficulty": "easy",
    "romaji": "aa",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "アア",
    "english": "ah! (interjection)",
    "category": "interjection",
    "difficulty": "easy",
    "romaji": "aa",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ごはん",
    "english": "rice, meal",
    "category": "food",
    "difficulty": "easy",
    "romaji": "gohan",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ゴハン",
    "english": "rice, meal",
    "category": "food",
    "difficulty": "easy",
    "romaji": "gohan",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "みず",
    "english": "water",
    "category": "drink",
    "difficulty": "easy",
    "romaji": "mizu",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ミズ",
    "english": "water",
    "category": "drink",
    "difficulty": "easy",
    "romaji": "mizu",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "ねこ",
    "english": "cat",
    "category": "animals",
    "difficulty": "easy",
    "romaji": "neko",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "ネコ",
    "english": "cat",
    "category": "animals",
    "difficulty": "easy",
    "romaji": "neko",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "あか",
    "english": "red",
    "category": "colors",
    "difficulty": "easy",
    "romaji": "aka",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "アカ",
    "english": "red",
    "category": "colors",
    "difficulty": "easy",
    "romaji": "aka",
    "isHiragana": false,
    "isKatakana": true
  },
  {
    "japanese": "いち",
    "english": "one",
    "category": "numbers",
    "difficulty": "easy",
    "romaji": "ichi",
    "isHiragana": true,
    "isKatakana": false
  },
  {
    "japanese": "イチ",
    "english": "one",
    "category": "numbers",
    "difficulty": "easy",
    "romaji": "ichi",
    "isHiragana": false,
    "isKatakana": true
  }
];

// Export quizWords as allWords for backward compatibility
export const allWords = quizWords;
