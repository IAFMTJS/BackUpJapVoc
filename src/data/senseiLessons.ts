export interface LessonContent {
  id: string;
  type: 'vocabulary' | 'grammar' | 'practice' | 'example' | 'exercise';
  content: any;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  prerequisites: string[];
  content: LessonContent[];
  exercises: any[];
  estimatedTime: number; // in minutes
  isCompleted?: boolean;
  progress?: number; // 0-100
}

export const senseiLessons: Lesson[] = [
  {
    id: 'numbers',
    title: 'Numbers & Counting',
    description: 'Learn to count from 1 to 10 and basic counting patterns',
    difficulty: 1,
    prerequisites: [],
    estimatedTime: 15,
    content: [
      {
        id: 'numbers-intro',
        type: 'vocabulary',
        content: {
          title: 'Numbers 1-10',
          words: [
            { japanese: '一', romaji: 'ichi', english: 'one' },
            { japanese: '二', romaji: 'ni', english: 'two' },
            { japanese: '三', romaji: 'san', english: 'three' },
            { japanese: '四', romaji: 'yon', english: 'four' },
            { japanese: '五', romaji: 'go', english: 'five' },
            { japanese: '六', romaji: 'roku', english: 'six' },
            { japanese: '七', romaji: 'nana', english: 'seven' },
            { japanese: '八', romaji: 'hachi', english: 'eight' },
            { japanese: '九', romaji: 'kyuu', english: 'nine' },
            { japanese: '十', romaji: 'juu', english: 'ten' }
          ]
        }
      },
      {
        id: 'counting-pattern',
        type: 'grammar',
        content: {
          title: 'Counting Pattern',
          explanation: 'In Japanese, you can count objects by adding a counter after the number. For now, let\'s learn the basic pattern: Number + つ (tsu) for general objects.',
          examples: [
            { japanese: '一つ', romaji: 'hitotsu', english: 'one (object)' },
            { japanese: '二つ', romaji: 'futatsu', english: 'two (objects)' },
            { japanese: '三つ', romaji: 'mittsu', english: 'three (objects)' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'matching',
        question: 'Match the numbers with their readings',
        pairs: [
          { japanese: '一', answer: 'ichi' },
          { japanese: '二', answer: 'ni' },
          { japanese: '三', answer: 'san' }
        ]
      },
      {
        type: 'fill-blank',
        question: 'Complete the counting: 一つ、二つ、___',
        answer: '三つ',
        hint: 'What comes after two?'
      }
    ]
  },
  {
    id: 'greetings',
    title: 'Basic Greetings',
    description: 'Learn essential greetings for daily conversation',
    difficulty: 1,
    prerequisites: [],
    estimatedTime: 20,
    content: [
      {
        id: 'greetings-vocab',
        type: 'vocabulary',
        content: {
          title: 'Essential Greetings',
          words: [
            { japanese: 'こんにちは', romaji: 'konnichiwa', english: 'hello (daytime)' },
            { japanese: 'おはようございます', romaji: 'ohayou gozaimasu', english: 'good morning' },
            { japanese: 'こんばんは', romaji: 'konbanwa', english: 'good evening' },
            { japanese: 'さようなら', romaji: 'sayounara', english: 'goodbye' },
            { japanese: 'ありがとう', romaji: 'arigatou', english: 'thank you' },
            { japanese: 'お願いします', romaji: 'onegaishimasu', english: 'please' }
          ]
        }
      },
      {
        id: 'greeting-context',
        type: 'grammar',
        content: {
          title: 'When to Use Each Greeting',
          explanation: 'Japanese greetings change based on the time of day and formality level.',
          examples: [
            { context: 'Morning (before 10 AM)', japanese: 'おはようございます', english: 'Good morning' },
            { context: 'Daytime (10 AM - 5 PM)', japanese: 'こんにちは', english: 'Hello' },
            { context: 'Evening (after 5 PM)', japanese: 'こんばんは', english: 'Good evening' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What would you say at 2 PM?',
        options: ['おはようございます', 'こんにちは', 'こんばんは'],
        answer: 'こんにちは'
      }
    ]
  },
  {
    id: 'pronouns',
    title: 'Simple Pronouns',
    description: 'Learn basic pronouns and demonstratives',
    difficulty: 2,
    prerequisites: ['greetings'],
    estimatedTime: 25,
    content: [
      {
        id: 'pronouns-vocab',
        type: 'vocabulary',
        content: {
          title: 'Basic Pronouns',
          words: [
            { japanese: '私', romaji: 'watashi', english: 'I/me' },
            { japanese: 'あなた', romaji: 'anata', english: 'you' },
            { japanese: 'これ', romaji: 'kore', english: 'this' },
            { japanese: 'それ', romaji: 'sore', english: 'that (near you)' },
            { japanese: 'あれ', romaji: 'are', english: 'that (over there)' },
            { japanese: 'ここ', romaji: 'koko', english: 'here' },
            { japanese: 'そこ', romaji: 'soko', english: 'there (near you)' },
            { japanese: 'あそこ', romaji: 'asoko', english: 'there (over there)' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'matching',
        question: 'Match the pronouns with their meanings',
        pairs: [
          { japanese: 'これ', answer: 'this' },
          { japanese: 'それ', answer: 'that (near you)' },
          { japanese: 'あれ', answer: 'that (over there)' }
        ]
      }
    ]
  },
  {
    id: 'verbs',
    title: 'Essential Verbs',
    description: 'Learn the most common verbs for daily communication',
    difficulty: 2,
    prerequisites: ['pronouns'],
    estimatedTime: 30,
    content: [
      {
        id: 'verbs-vocab',
        type: 'vocabulary',
        content: {
          title: 'Essential Verbs',
          words: [
            { japanese: 'です', romaji: 'desu', english: 'to be (polite)' },
            { japanese: 'あります', romaji: 'arimasu', english: 'to have/exist (inanimate)' },
            { japanese: 'います', romaji: 'imasu', english: 'to have/exist (animate)' },
            { japanese: '行きます', romaji: 'ikimasu', english: 'to go' },
            { japanese: '来ます', romaji: 'kimasu', english: 'to come' },
            { japanese: '食べます', romaji: 'tabemasu', english: 'to eat' },
            { japanese: '飲みます', romaji: 'nomimasu', english: 'to drink' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'fill-blank',
        question: 'Complete: 私は水を___ (I drink water)',
        answer: '飲みます',
        hint: 'What do you do with water?'
      }
    ]
  },
  {
    id: 'family',
    title: 'Family & People',
    description: 'Learn family members and basic relationships',
    difficulty: 2,
    prerequisites: ['pronouns'],
    estimatedTime: 25,
    content: [
      {
        id: 'family-vocab',
        type: 'vocabulary',
        content: {
          title: 'Family Members',
          words: [
            { japanese: '家族', romaji: 'kazoku', english: 'family' },
            { japanese: '父', romaji: 'chichi', english: 'father' },
            { japanese: '母', romaji: 'haha', english: 'mother' },
            { japanese: '兄', romaji: 'ani', english: 'older brother' },
            { japanese: '姉', romaji: 'ane', english: 'older sister' },
            { japanese: '弟', romaji: 'otouto', english: 'younger brother' },
            { japanese: '妹', romaji: 'imouto', english: 'younger sister' },
            { japanese: '友達', romaji: 'tomodachi', english: 'friend' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'matching',
        question: 'Match family members',
        pairs: [
          { japanese: '父', answer: 'father' },
          { japanese: '母', answer: 'mother' },
          { japanese: '友達', answer: 'friend' }
        ]
      }
    ]
  },
  {
    id: 'time',
    title: 'Time & Days',
    description: 'Learn to express time and days of the week',
    difficulty: 3,
    prerequisites: ['verbs'],
    estimatedTime: 30,
    content: [
      {
        id: 'time-vocab',
        type: 'vocabulary',
        content: {
          title: 'Time Expressions',
          words: [
            { japanese: '今日', romaji: 'kyou', english: 'today' },
            { japanese: '明日', romaji: 'ashita', english: 'tomorrow' },
            { japanese: '昨日', romaji: 'kinou', english: 'yesterday' },
            { japanese: '今', romaji: 'ima', english: 'now' },
            { japanese: '時', romaji: 'ji', english: 'hour/time' },
            { japanese: '分', romaji: 'fun', english: 'minute' }
          ]
        }
      },
      {
        id: 'days-vocab',
        type: 'vocabulary',
        content: {
          title: 'Days of the Week',
          words: [
            { japanese: '月曜日', romaji: 'getsuyoubi', english: 'Monday' },
            { japanese: '火曜日', romaji: 'kayoubi', english: 'Tuesday' },
            { japanese: '水曜日', romaji: 'suiyoubi', english: 'Wednesday' },
            { japanese: '木曜日', romaji: 'mokuyoubi', english: 'Thursday' },
            { japanese: '金曜日', romaji: 'kinyoubi', english: 'Friday' },
            { japanese: '土曜日', romaji: 'doyoubi', english: 'Saturday' },
            { japanese: '日曜日', romaji: 'nichiyoubi', english: 'Sunday' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What day is 月曜日?',
        options: ['Monday', 'Tuesday', 'Wednesday'],
        answer: 'Monday'
      }
    ]
  },
  {
    id: 'adjectives',
    title: 'Basic Adjectives',
    description: 'Learn common adjectives to describe things',
    difficulty: 3,
    prerequisites: ['verbs'],
    estimatedTime: 25,
    content: [
      {
        id: 'adjectives-vocab',
        type: 'vocabulary',
        content: {
          title: 'Common Adjectives',
          words: [
            { japanese: '大きい', romaji: 'ookii', english: 'big' },
            { japanese: '小さい', romaji: 'chiisai', english: 'small' },
            { japanese: '良い', romaji: 'ii', english: 'good' },
            { japanese: '悪い', romaji: 'warui', english: 'bad' },
            { japanese: '新しい', romaji: 'atarashii', english: 'new' },
            { japanese: '古い', romaji: 'furui', english: 'old' },
            { japanese: '熱い', romaji: 'atsui', english: 'hot' },
            { japanese: '寒い', romaji: 'samui', english: 'cold' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'fill-blank',
        question: 'Complete: この本は___ (This book is good)',
        answer: '良い',
        hint: 'What\'s the opposite of bad?'
      }
    ]
  },
  {
    id: 'questions',
    title: 'Simple Questions',
    description: 'Learn to ask basic questions',
    difficulty: 3,
    prerequisites: ['adjectives'],
    estimatedTime: 30,
    content: [
      {
        id: 'question-words',
        type: 'vocabulary',
        content: {
          title: 'Question Words',
          words: [
            { japanese: '何', romaji: 'nani', english: 'what' },
            { japanese: 'どこ', romaji: 'doko', english: 'where' },
            { japanese: 'いつ', romaji: 'itsu', english: 'when' },
            { japanese: 'だれ', romaji: 'dare', english: 'who' },
            { japanese: 'どう', romaji: 'dou', english: 'how' },
            { japanese: 'なぜ', romaji: 'naze', english: 'why' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Which question word means "where"?',
        options: ['何', 'どこ', 'いつ'],
        answer: 'どこ'
      }
    ]
  },
  {
    id: 'activities',
    title: 'Daily Activities',
    description: 'Learn verbs for common daily activities',
    difficulty: 4,
    prerequisites: ['questions'],
    estimatedTime: 35,
    content: [
      {
        id: 'activities-vocab',
        type: 'vocabulary',
        content: {
          title: 'Daily Activities',
          words: [
            { japanese: '起きます', romaji: 'okimasu', english: 'to wake up' },
            { japanese: '寝ます', romaji: 'nemasu', english: 'to sleep' },
            { japanese: '働きます', romaji: 'hatarakimasu', english: 'to work' },
            { japanese: '勉強します', romaji: 'benkyou shimasu', english: 'to study' },
            { japanese: '遊びます', romaji: 'asobimasu', english: 'to play' },
            { japanese: '見ます', romaji: 'mimasu', english: 'to see/watch' },
            { japanese: '聞きます', romaji: 'kikimasu', english: 'to listen/hear' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'fill-blank',
        question: 'Complete: 私は毎日___ (I study every day)',
        answer: '勉強します',
        hint: 'What do you do to learn?'
      }
    ]
  },
  {
    id: 'kanji',
    title: 'Basic Kanji',
    description: 'Learn fundamental kanji characters',
    difficulty: 4,
    prerequisites: ['activities'],
    estimatedTime: 40,
    content: [
      {
        id: 'basic-kanji',
        type: 'vocabulary',
        content: {
          title: 'Essential Kanji',
          words: [
            { japanese: '人', romaji: 'hito', english: 'person' },
            { japanese: '水', romaji: 'mizu', english: 'water' },
            { japanese: '火', romaji: 'hi', english: 'fire' },
            { japanese: '山', romaji: 'yama', english: 'mountain' },
            { japanese: '木', romaji: 'ki', english: 'tree' },
            { japanese: '日', romaji: 'hi', english: 'sun/day' },
            { japanese: '月', romaji: 'tsuki', english: 'moon/month' },
            { japanese: '年', romaji: 'toshi', english: 'year' }
          ]
        }
      }
    ],
    exercises: [
      {
        type: 'matching',
        question: 'Match kanji with meanings',
        pairs: [
          { japanese: '人', answer: 'person' },
          { japanese: '水', answer: 'water' },
          { japanese: '山', answer: 'mountain' }
        ]
      }
    ]
  }
];

export const getLessonById = (id: string): Lesson | undefined => {
  return senseiLessons.find(lesson => lesson.id === id);
};

export const getNextLesson = (currentLessonId: string): Lesson | undefined => {
  const currentIndex = senseiLessons.findIndex(lesson => lesson.id === currentLessonId);
  if (currentIndex >= 0 && currentIndex < senseiLessons.length - 1) {
    return senseiLessons[currentIndex + 1];
  }
  return undefined;
};

export const getPrerequisitesMet = (lessonId: string, completedLessons: string[]): boolean => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;
  
  return lesson.prerequisites.every(prereq => completedLessons.includes(prereq));
}; 