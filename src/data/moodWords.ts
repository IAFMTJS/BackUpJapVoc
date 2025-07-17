import { MoodWord, EmotionalCategory } from '../types/mood';

export const MOOD_WORDS: MoodWord[] = [
  {
    id: 'happy-1',
    japanese: '嬉しい',
    romaji: 'ureshii',
    english: 'happy',
    emotionalContext: {
      category: 'happiness',
      originalCategory: 'happiness',
      emoji: '😊',
      intensity: 5,
      usageNotes: 'Common expression for happiness. Used in both casual and formal situations.',
      relatedEmotions: ['joy', 'delight', 'pleasure']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'neutral',
    commonResponses: ['私も嬉しいです', 'よかったですね']
  },
  {
    id: 'sad-1',
    japanese: '悲しい',
    romaji: 'kanashii',
    english: 'sad',
    emotionalContext: {
      category: 'sadness',
      originalCategory: 'sadness',
      emoji: '😢',
      intensity: 5,
      usageNotes: 'Expresses deep sadness. Can be used in both casual and formal contexts.',
      relatedEmotions: ['grief', 'sorrow', 'melancholy']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'neutral',
    commonResponses: ['大丈夫ですか？', '私も悲しいです']
  },
  {
    id: 'angry-1',
    japanese: '怒っている',
    romaji: 'okotteiru',
    english: 'angry',
    emotionalContext: {
      category: 'anger',
      originalCategory: 'anger',
      emoji: '😠',
      intensity: 5,
      usageNotes: 'Expresses current anger. More formal than 怒ってる (okotteru).',
      relatedEmotions: ['frustration', 'irritation', 'rage']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'neutral',
    commonResponses: ['落ち着いてください', '申し訳ありません']
  },
  {
    id: 'love-1',
    japanese: '大好き',
    romaji: 'daisuki',
    english: 'really like/love',
    emotionalContext: {
      category: 'love',
      originalCategory: 'love',
      emoji: '❤️',
      intensity: 7,
      usageNotes: 'Strong expression of liking or love. Less formal than 愛してる (aishiteru).',
      relatedEmotions: ['affection', 'fondness', 'adoration']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'casual',
    commonResponses: ['私も大好きです', 'ありがとう']
  },
  {
    id: 'surprise-1',
    japanese: '驚いた',
    romaji: 'odorokita',
    english: 'surprised',
    emotionalContext: {
      category: 'surprise',
      originalCategory: 'surprise',
      emoji: '😲',
      intensity: 5,
      usageNotes: 'Expresses surprise or astonishment. Can be used in both casual and formal situations.',
      relatedEmotions: ['amazement', 'shock', 'wonder']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'neutral',
    commonResponses: ['本当ですか？', '私も驚きました']
  },
  {
    id: 'fear-1',
    japanese: '怖い',
    romaji: 'kowai',
    english: 'scary/afraid',
    emotionalContext: {
      category: 'fear',
      originalCategory: 'fear',
      emoji: '😨',
      intensity: 5,
      usageNotes: 'Expresses fear or being scared. Can be used for both things and situations.',
      relatedEmotions: ['anxiety', 'terror', 'dread']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'casual',
    commonResponses: ['大丈夫ですよ', '心配しないでください']
  },
  {
    id: 'disgust-1',
    japanese: '嫌だ',
    romaji: 'iyada',
    english: 'dislike/hate',
    emotionalContext: {
      category: 'disgust',
      originalCategory: 'disgust',
      emoji: '🤢',
      intensity: 5,
      usageNotes: 'Expresses strong dislike or disgust. More casual than 嫌い (kirai).',
      relatedEmotions: ['aversion', 'repulsion', 'distaste']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'casual',
    commonResponses: ['そうですか', '申し訳ありません']
  },
  {
    id: 'respect-1',
    japanese: '尊敬する',
    romaji: 'sonkei suru',
    english: 'respect',
    emotionalContext: {
      category: 'respect',
      originalCategory: 'respect',
      emoji: '🙏',
      intensity: 5,
      usageNotes: 'Formal expression of respect. Often used in professional contexts.',
      relatedEmotions: ['admiration', 'esteem', 'honor']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'formal',
    commonResponses: ['ありがとうございます', '恐縮です']
  },
  {
    id: 'gratitude-1',
    japanese: '感謝する',
    romaji: 'kansha suru',
    english: 'grateful',
    emotionalContext: {
      category: 'gratitude',
      originalCategory: 'gratitude',
      emoji: '🙏',
      intensity: 5,
      usageNotes: 'Formal expression of gratitude. Used in both written and spoken Japanese.',
      relatedEmotions: ['appreciation', 'thankfulness', 'indebtedness']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'formal',
    commonResponses: ['どういたしまして', 'お役に立てて嬉しいです']
  },
  {
    id: 'pride-1',
    japanese: '誇りに思う',
    romaji: 'hokori ni omou',
    english: 'proud',
    emotionalContext: {
      category: 'happiness',
      originalCategory: 'pride',
      emoji: '😊',
      intensity: 5,
      usageNotes: 'Expresses pride in something or someone. More formal than 自慢 (jiman).',
      relatedEmotions: ['satisfaction', 'achievement', 'dignity']
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: 'formal',
    commonResponses: ['おめでとうございます', '素晴らしいですね']
  }
];

// Helper function to get words by category
export const getMoodWordsByCategory = (category: EmotionalCategory): MoodWord[] => {
  return MOOD_WORDS.filter(word => word.emotionalContext.category === category);
};

// Helper function to get words by formality
export const getMoodWordsByFormality = (formality: 'formal' | 'neutral' | 'casual'): MoodWord[] => {
  return MOOD_WORDS.filter(word => word.formality === formality);
};

// Helper function to get words by intensity
export const getMoodWordsByIntensity = (minIntensity: number, maxIntensity: number): MoodWord[] => {
  return MOOD_WORDS.filter(word => 
    word.emotionalContext.intensity >= minIntensity && 
    word.emotionalContext.intensity <= maxIntensity
  );
};

export const getMoodWords = (): MoodWord[] => {
  return MOOD_WORDS;
};

export const getCategories = (): string[] => {
  return [...new Set(MOOD_WORDS.map(word => word.emotionalContext.category))];
};

export const getIntensities = (): number[] => {
  return [...new Set(MOOD_WORDS.map(word => word.emotionalContext.intensity))];
};

export const getFormalityLevels = (): string[] => {
  return [...new Set(MOOD_WORDS.filter(word => word.formality).map(word => word.formality))];
}; 