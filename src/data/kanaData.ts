interface Kana {
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  row: string;
  column: string;
}

// Hiragana characters
export const hiraganaList: Kana[] = [
  // Basic vowels
  { character: 'あ', romaji: 'a', type: 'hiragana', row: 'a', column: 'vowel' },
  { character: 'い', romaji: 'i', type: 'hiragana', row: 'a', column: 'vowel' },
  { character: 'う', romaji: 'u', type: 'hiragana', row: 'a', column: 'vowel' },
  { character: 'え', romaji: 'e', type: 'hiragana', row: 'a', column: 'vowel' },
  { character: 'お', romaji: 'o', type: 'hiragana', row: 'a', column: 'vowel' },

  // K row
  { character: 'か', romaji: 'ka', type: 'hiragana', row: 'k', column: 'a' },
  { character: 'き', romaji: 'ki', type: 'hiragana', row: 'k', column: 'i' },
  { character: 'く', romaji: 'ku', type: 'hiragana', row: 'k', column: 'u' },
  { character: 'け', romaji: 'ke', type: 'hiragana', row: 'k', column: 'e' },
  { character: 'こ', romaji: 'ko', type: 'hiragana', row: 'k', column: 'o' },

  // S row
  { character: 'さ', romaji: 'sa', type: 'hiragana', row: 's', column: 'a' },
  { character: 'し', romaji: 'shi', type: 'hiragana', row: 's', column: 'i' },
  { character: 'す', romaji: 'su', type: 'hiragana', row: 's', column: 'u' },
  { character: 'せ', romaji: 'se', type: 'hiragana', row: 's', column: 'e' },
  { character: 'そ', romaji: 'so', type: 'hiragana', row: 's', column: 'o' },

  // T row
  { character: 'た', romaji: 'ta', type: 'hiragana', row: 't', column: 'a' },
  { character: 'ち', romaji: 'chi', type: 'hiragana', row: 't', column: 'i' },
  { character: 'つ', romaji: 'tsu', type: 'hiragana', row: 't', column: 'u' },
  { character: 'て', romaji: 'te', type: 'hiragana', row: 't', column: 'e' },
  { character: 'と', romaji: 'to', type: 'hiragana', row: 't', column: 'o' },

  // N row
  { character: 'な', romaji: 'na', type: 'hiragana', row: 'n', column: 'a' },
  { character: 'に', romaji: 'ni', type: 'hiragana', row: 'n', column: 'i' },
  { character: 'ぬ', romaji: 'nu', type: 'hiragana', row: 'n', column: 'u' },
  { character: 'ね', romaji: 'ne', type: 'hiragana', row: 'n', column: 'e' },
  { character: 'の', romaji: 'no', type: 'hiragana', row: 'n', column: 'o' },

  // H row
  { character: 'は', romaji: 'ha', type: 'hiragana', row: 'h', column: 'a' },
  { character: 'ひ', romaji: 'hi', type: 'hiragana', row: 'h', column: 'i' },
  { character: 'ふ', romaji: 'fu', type: 'hiragana', row: 'h', column: 'u' },
  { character: 'へ', romaji: 'he', type: 'hiragana', row: 'h', column: 'e' },
  { character: 'ほ', romaji: 'ho', type: 'hiragana', row: 'h', column: 'o' },

  // M row
  { character: 'ま', romaji: 'ma', type: 'hiragana', row: 'm', column: 'a' },
  { character: 'み', romaji: 'mi', type: 'hiragana', row: 'm', column: 'i' },
  { character: 'む', romaji: 'mu', type: 'hiragana', row: 'm', column: 'u' },
  { character: 'め', romaji: 'me', type: 'hiragana', row: 'm', column: 'e' },
  { character: 'も', romaji: 'mo', type: 'hiragana', row: 'm', column: 'o' },

  // Y row
  { character: 'や', romaji: 'ya', type: 'hiragana', row: 'y', column: 'a' },
  { character: 'ゆ', romaji: 'yu', type: 'hiragana', row: 'y', column: 'u' },
  { character: 'よ', romaji: 'yo', type: 'hiragana', row: 'y', column: 'o' },

  // R row
  { character: 'ら', romaji: 'ra', type: 'hiragana', row: 'r', column: 'a' },
  { character: 'り', romaji: 'ri', type: 'hiragana', row: 'r', column: 'i' },
  { character: 'る', romaji: 'ru', type: 'hiragana', row: 'r', column: 'u' },
  { character: 'れ', romaji: 're', type: 'hiragana', row: 'r', column: 'e' },
  { character: 'ろ', romaji: 'ro', type: 'hiragana', row: 'r', column: 'o' },

  // W row
  { character: 'わ', romaji: 'wa', type: 'hiragana', row: 'w', column: 'a' },
  { character: 'を', romaji: 'wo', type: 'hiragana', row: 'w', column: 'o' },

  // N
  { character: 'ん', romaji: 'n', type: 'hiragana', row: 'n', column: 'special' }
];

// Katakana characters
export const katakanaList: Kana[] = [
  // Basic vowels
  { character: 'ア', romaji: 'a', type: 'katakana', row: 'a', column: 'vowel' },
  { character: 'イ', romaji: 'i', type: 'katakana', row: 'a', column: 'vowel' },
  { character: 'ウ', romaji: 'u', type: 'katakana', row: 'a', column: 'vowel' },
  { character: 'エ', romaji: 'e', type: 'katakana', row: 'a', column: 'vowel' },
  { character: 'オ', romaji: 'o', type: 'katakana', row: 'a', column: 'vowel' },

  // K row
  { character: 'カ', romaji: 'ka', type: 'katakana', row: 'k', column: 'a' },
  { character: 'キ', romaji: 'ki', type: 'katakana', row: 'k', column: 'i' },
  { character: 'ク', romaji: 'ku', type: 'katakana', row: 'k', column: 'u' },
  { character: 'ケ', romaji: 'ke', type: 'katakana', row: 'k', column: 'e' },
  { character: 'コ', romaji: 'ko', type: 'katakana', row: 'k', column: 'o' },

  // S row
  { character: 'サ', romaji: 'sa', type: 'katakana', row: 's', column: 'a' },
  { character: 'シ', romaji: 'shi', type: 'katakana', row: 's', column: 'i' },
  { character: 'ス', romaji: 'su', type: 'katakana', row: 's', column: 'u' },
  { character: 'セ', romaji: 'se', type: 'katakana', row: 's', column: 'e' },
  { character: 'ソ', romaji: 'so', type: 'katakana', row: 's', column: 'o' },

  // T row
  { character: 'タ', romaji: 'ta', type: 'katakana', row: 't', column: 'a' },
  { character: 'チ', romaji: 'chi', type: 'katakana', row: 't', column: 'i' },
  { character: 'ツ', romaji: 'tsu', type: 'katakana', row: 't', column: 'u' },
  { character: 'テ', romaji: 'te', type: 'katakana', row: 't', column: 'e' },
  { character: 'ト', romaji: 'to', type: 'katakana', row: 't', column: 'o' },

  // N row
  { character: 'ナ', romaji: 'na', type: 'katakana', row: 'n', column: 'a' },
  { character: 'ニ', romaji: 'ni', type: 'katakana', row: 'n', column: 'i' },
  { character: 'ヌ', romaji: 'nu', type: 'katakana', row: 'n', column: 'u' },
  { character: 'ネ', romaji: 'ne', type: 'katakana', row: 'n', column: 'e' },
  { character: 'ノ', romaji: 'no', type: 'katakana', row: 'n', column: 'o' },

  // H row
  { character: 'ハ', romaji: 'ha', type: 'katakana', row: 'h', column: 'a' },
  { character: 'ヒ', romaji: 'hi', type: 'katakana', row: 'h', column: 'i' },
  { character: 'フ', romaji: 'fu', type: 'katakana', row: 'h', column: 'u' },
  { character: 'ヘ', romaji: 'he', type: 'katakana', row: 'h', column: 'e' },
  { character: 'ホ', romaji: 'ho', type: 'katakana', row: 'h', column: 'o' },

  // M row
  { character: 'マ', romaji: 'ma', type: 'katakana', row: 'm', column: 'a' },
  { character: 'ミ', romaji: 'mi', type: 'katakana', row: 'm', column: 'i' },
  { character: 'ム', romaji: 'mu', type: 'katakana', row: 'm', column: 'u' },
  { character: 'メ', romaji: 'me', type: 'katakana', row: 'm', column: 'e' },
  { character: 'モ', romaji: 'mo', type: 'katakana', row: 'm', column: 'o' },

  // Y row
  { character: 'ヤ', romaji: 'ya', type: 'katakana', row: 'y', column: 'a' },
  { character: 'ユ', romaji: 'yu', type: 'katakana', row: 'y', column: 'u' },
  { character: 'ヨ', romaji: 'yo', type: 'katakana', row: 'y', column: 'o' },

  // R row
  { character: 'ラ', romaji: 'ra', type: 'katakana', row: 'r', column: 'a' },
  { character: 'リ', romaji: 'ri', type: 'katakana', row: 'r', column: 'i' },
  { character: 'ル', romaji: 'ru', type: 'katakana', row: 'r', column: 'u' },
  { character: 'レ', romaji: 're', type: 'katakana', row: 'r', column: 'e' },
  { character: 'ロ', romaji: 'ro', type: 'katakana', row: 'r', column: 'o' },

  // W row
  { character: 'ワ', romaji: 'wa', type: 'katakana', row: 'w', column: 'a' },
  { character: 'ヲ', romaji: 'wo', type: 'katakana', row: 'w', column: 'o' },

  // N
  { character: 'ン', romaji: 'n', type: 'katakana', row: 'n', column: 'special' }
];

// Helper functions
export const getKanaByRomaji = (romaji: string): Kana | undefined => {
  return [...hiraganaList, ...katakanaList].find(k => k.romaji === romaji.toLowerCase());
};

export const getKanaByCharacter = (character: string): Kana | undefined => {
  return [...hiraganaList, ...katakanaList].find(k => k.character === character);
};

export const getKanaByRow = (row: string): Kana[] => {
  return [...hiraganaList, ...katakanaList].filter(k => k.row === row.toLowerCase());
};

export const getKanaByType = (type: 'hiragana' | 'katakana'): Kana[] => {
  return type === 'hiragana' ? hiraganaList : katakanaList;
}; 