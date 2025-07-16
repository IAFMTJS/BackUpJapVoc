import type { Level } from '../types/learn';

export const levels: Level[] = [
  {
    id: 1,
    title: "Hiragana 1: A to O",
    description: "Learn the first five hiragana vowels (あ, い, う, え, お) and their pronunciations.",
    category: "kana",
    estimatedTime: "5 min",
    minScore: 80,
    nextUnlocks: [2],
    exercises: [
      {
        title: "Hiragana Recognition",
        instruction: "Select the correct hiragana character for each sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is the hiragana for 'a'?",
            options: ["あ", "い", "う"],
            answer: "あ"
          },
          {
            question: "Which one is the hiragana for 'i'?",
            options: ["う", "い", "え"],
            answer: "い"
          },
          {
            question: "Which one is the hiragana for 'u'?",
            options: ["う", "お", "あ"],
            answer: "う"
          },
          {
            question: "Which one is the hiragana for 'e'?",
            options: ["い", "え", "お"],
            answer: "え"
          },
          {
            question: "Which one is the hiragana for 'o'?",
            options: ["え", "お", "あ"],
            answer: "お"
          }
        ]
      },
      {
        title: "Hiragana Matching",
        instruction: "Match each hiragana character with its romanized sound.",
        exerciseType: "memoryGame",
        pointsPerItem: 2,
        items: [
          { question: "あ", answer: "a" },
          { question: "い", answer: "i" },
          { question: "う", answer: "u" },
          { question: "え", answer: "e" },
          { question: "お", answer: "o" }
        ]
      },
      {
        title: "Listening Practice",
        instruction: "Listen to the audio and choose the correct character.",
        exerciseType: "audioListen",
        pointsPerItem: 2,
        items: [
          {
            question: "Which character did you hear?",
            audio: "audio/a.mp3",
            options: ["あ", "お", "う"],
            answer: "あ"
          },
          {
            question: "Which character did you hear?",
            audio: "audio/u.mp3",
            options: ["う", "え", "お"],
            answer: "う"
          },
          {
            question: "Which character did you hear?",
            audio: "audio/o.mp3",
            options: ["あ", "う", "お"],
            answer: "お"
          }
        ]
      },
      {
        title: "Spelling in Hiragana",
        instruction: "Type the correct hiragana for each sound or word.",
        exerciseType: "typeAnswer",
        pointsPerItem: 2,
        items: [
          {
            question: "Type the hiragana for 'u'.",
            answer: "う"
          },
          {
            question: "Type the hiragana for 'ai'.",
            answer: "あい",
            hint: "This spells a word meaning 'love'."
          },
          {
            question: "Type the hiragana for 'ie'.",
            answer: "いえ",
            hint: "This spells a word meaning 'house'."
          },
          {
            question: "Type the hiragana for 'ao'.",
            answer: "あお",
            hint: "This spells a word meaning 'blue'."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Hiragana 2: KA to KO",
    description: "Learn the hiragana characters か, き, く, け, こ (the K-line) and how to read simple words with them.",
    category: "kana",
    estimatedTime: "5 min",
    minScore: 80,
    nextUnlocks: [3],
    exercises: [
      {
        title: "Hiragana K-line",
        instruction: "Select the correct hiragana character for each given 'K' sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'ka'?",
            options: ["か", "き", "く"],
            answer: "か"
          },
          {
            question: "Which one is 'ki'?",
            options: ["い", "き", "け"],
            answer: "き"
          },
          {
            question: "Which one is 'ku'?",
            options: ["く", "こ", "か"],
            answer: "く"
          },
          {
            question: "Which one is 'ke'?",
            options: ["け", "き", "こ"],
            answer: "け"
          },
          {
            question: "Which one is 'ko'?",
            options: ["こ", "か", "く"],
            answer: "こ"
          }
        ]
      },
      {
        title: "Reading Practice",
        instruction: "Type the romanized reading for each hiragana or word.",
        exerciseType: "typeAnswer",
        pointsPerItem: 2,
        items: [
          {
            question: "か",
            answer: "ka"
          },
          {
            question: "き",
            answer: "ki"
          },
          {
            question: "あか",
            answer: "aka",
            hint: "Means 'red' (aka)."
          },
          {
            question: "いけ",
            answer: "ike",
            hint: "Means 'pond' (ike)."
          },
          {
            question: "いく",
            answer: "iku",
            hint: "Means 'to go' (iku)."
          }
        ]
      },
      {
        title: "Listening: K-line Sounds",
        instruction: "Listen and select the character you hear.",
        exerciseType: "audioListen",
        pointsPerItem: 2,
        items: [
          {
            question: "Which character did you hear?",
            audio: "audio/ka.mp3",
            options: ["か", "あ", "こ"],
            answer: "か"
          },
          {
            question: "Which character did you hear?",
            audio: "audio/ko.mp3",
            options: ["こ", "か", "け"],
            answer: "こ"
          },
          {
            question: "Which character did you hear?",
            audio: "audio/ki.mp3",
            options: ["き", "け", "い"],
            answer: "き"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Hiragana 3: S & T Lines",
    description: "Learn the S-series (さ, し, す, せ, そ) and T-series (た, ち, つ, て, と) hiragana, including the special pronunciations shi (し), chi (ち), and tsu (つ).",
    category: "kana",
    estimatedTime: "6 min",
    minScore: 80,
    nextUnlocks: [4],
    exercises: [
      {
        title: "Hiragana S-line",
        instruction: "Select the correct character for each S-line sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'sa'?",
            options: ["さ", "し", "す"],
            answer: "さ"
          },
          {
            question: "Which one is 'shi'?",
            options: ["さ", "し", "せ"],
            answer: "し"
          },
          {
            question: "Which one is 'su'?",
            options: ["す", "そ", "し"],
            answer: "す"
          },
          {
            question: "Which one is 'se'?",
            options: ["せ", "そ", "す"],
            answer: "せ"
          },
          {
            question: "Which one is 'so'?",
            options: ["そ", "す", "せ"],
            answer: "そ"
          }
        ]
      },
      {
        title: "Hiragana T-line",
        instruction: "Select the correct character for each T-line sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'ta'?",
            options: ["た", "ち", "て"],
            answer: "た"
          },
          {
            question: "Which one is 'chi'?",
            options: ["ち", "さ", "つ"],
            answer: "ち"
          },
          {
            question: "Which one is 'tsu'?",
            options: ["つ", "し", "す"],
            answer: "つ"
          },
          {
            question: "Which one is 'te'?",
            options: ["て", "と", "た"],
            answer: "て"
          },
          {
            question: "Which one is 'to'?",
            options: ["と", "て", "た"],
            answer: "と"
          }
        ]
      },
      {
        title: "Word Reading Practice",
        instruction: "Type the romanized reading for each word in hiragana.",
        exerciseType: "typeAnswer",
        pointsPerItem: 2,
        items: [
          {
            question: "すし",
            answer: "sushi",
            hint: "sushi (a Japanese food)"
          },
          {
            question: "あさ",
            answer: "asa",
            hint: "morning"
          },
          {
            question: "あつい",
            answer: "atsui",
            hint: "hot (temperature)"
          },
          {
            question: "あし",
            answer: "ashi",
            hint: "foot or leg"
          },
          {
            question: "さけ",
            answer: "sake",
            hint: "sake (alcoholic drink)"
          }
        ]
      },
      {
        title: "Listening Practice",
        instruction: "Listen and choose the character you hear.",
        exerciseType: "audioListen",
        pointsPerItem: 2,
        items: [
          {
            question: "Which character did you hear?",
            audio: "audio/shi.mp3",
            options: ["し", "ち", "す"],
            answer: "し"
          },
          {
            question: "Which character did you hear?",
            audio: "audio/tsu.mp3",
            options: ["つ", "す", "と"],
            answer: "つ"
          },
          {
            question: "Which character did you hear?",
            audio: "audio/so.mp3",
            options: ["そ", "し", "す"],
            answer: "そ"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Hiragana 4: N & H Lines",
    description: "Learn the N-series (な, に, ぬ, ね, の) and H-series (は, ひ, ふ, へ, ほ) hiragana characters.",
    category: "kana",
    estimatedTime: "6 min",
    minScore: 80,
    nextUnlocks: [5],
    exercises: [
      {
        title: "Hiragana N-line",
        instruction: "Select the correct character for each N-line sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'na'?",
            options: ["な", "に", "ぬ"],
            answer: "な"
          },
          {
            question: "Which one is 'ni'?",
            options: ["ね", "に", "の"],
            answer: "に"
          },
          {
            question: "Which one is 'nu'?",
            options: ["ぬ", "ね", "の"],
            answer: "ぬ"
          },
          {
            question: "Which one is 'ne'?",
            options: ["ね", "の", "な"],
            answer: "ね"
          },
          {
            question: "Which one is 'no'?",
            options: ["の", "な", "ぬ"],
            answer: "の"
          }
        ]
      },
      {
        title: "Hiragana H-line",
        instruction: "Select the correct character for each H-line sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'ha'?",
            options: ["は", "ほ", "ひ"],
            answer: "は"
          },
          {
            question: "Which one is 'hi'?",
            options: ["ひ", "は", "け"],
            answer: "ひ"
          },
          {
            question: "Which one is 'fu'?",
            options: ["ふ", "へ", "ひ"],
            answer: "ふ"
          },
          {
            question: "Which one is 'he'?",
            options: ["へ", "ほ", "は"],
            answer: "へ"
          },
          {
            question: "Which one is 'ho'?",
            options: ["ほ", "は", "ひ"],
            answer: "ほ"
          }
        ]
      },
      {
        title: "Word Reading Practice",
        instruction: "Type the romanized reading for each word (hiragana).",
        exerciseType: "typeAnswer",
        pointsPerItem: 2,
        items: [
          {
            question: "いぬ",
            answer: "inu",
            hint: "dog"
          },
          {
            question: "ねこ",
            answer: "neko",
            hint: "cat"
          },
          {
            question: "はな",
            answer: "hana",
            hint: "flower"
          },
          {
            question: "ふね",
            answer: "fune",
            hint: "boat/ship"
          },
          {
            question: "ほし",
            answer: "hoshi",
            hint: "star"
          },
          {
            question: "ひと",
            answer: "hito",
            hint: "person"
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Hiragana 5: M, Y, R, W & N",
    description: "Learn the remaining hiragana: M-series (ま, み, む, め, も), Y-series (や, ゆ, よ), R-series (ら, り, る, れ, ろ), W-series (わ, を) and the nasal sound ん.",
    category: "kana",
    estimatedTime: "7 min",
    minScore: 80,
    nextUnlocks: [6],
    exercises: [
      {
        title: "Hiragana M-line",
        instruction: "Select the correct character for each M-line sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'ma'?",
            options: ["ま", "み", "も"],
            answer: "ま"
          },
          {
            question: "Which one is 'mi'?",
            options: ["み", "ぬ", "ま"],
            answer: "み"
          },
          {
            question: "Which one is 'mu'?",
            options: ["む", "め", "も"],
            answer: "む"
          },
          {
            question: "Which one is 'me'?",
            options: ["め", "ま", "ぬ"],
            answer: "め"
          },
          {
            question: "Which one is 'mo'?",
            options: ["も", "む", "ま"],
            answer: "も"
          }
        ]
      },
      {
        title: "Hiragana Y, W & N",
        instruction: "Select the correct character for each Y/W sound (and 'ん').",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'ya'?",
            options: ["や", "わ", "よ"],
            answer: "や"
          },
          {
            question: "Which one is 'yu'?",
            options: ["ゆ", "よ", "や"],
            answer: "ゆ"
          },
          {
            question: "Which one is 'yo'?",
            options: ["よ", "ゆ", "や"],
            answer: "よ"
          },
          {
            question: "Which one is 'wa'?",
            options: ["わ", "れ", "ね"],
            answer: "わ"
          },
          {
            question: "Which one is 'wo' (o)?",
            options: ["を", "わ", "ん"],
            answer: "を"
          },
          {
            question: "Which one is the 'n' (ん) sound?",
            options: ["ん", "め", "る"],
            answer: "ん"
          }
        ]
      },
      {
        title: "Hiragana R-line",
        instruction: "Select the correct character for each R-line sound.",
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          {
            question: "Which one is 'ra'?",
            options: ["ら", "り", "れ"],
            answer: "ら"
          },
          {
            question: "Which one is 'ri'?",
            options: ["り", "ろ", "ね"],
            answer: "り"
          },
          {
            question: "Which one is 'ru'?",
            options: ["る", "ろ", "ぬ"],
            answer: "る"
          },
          {
            question: "Which one is 're'?",
            options: ["れ", "ら", "ね"],
            answer: "れ"
          },
          {
            question: "Which one is 'ro'?",
            options: ["ろ", "る", "ら"],
            answer: "ろ"
          }
        ]
      },
      {
        title: "Word Reading Practice",
        instruction: "Type the romanized reading for each word.",
        exerciseType: "typeAnswer",
        pointsPerItem: 2,
        items: [
          {
            question: "あめ",
            answer: "ame",
            hint: "rain"
          },
          {
            question: "やま",
            answer: "yama",
            hint: "mountain"
          },
          {
            question: "ゆき",
            answer: "yuki",
            hint: "snow"
          },
          {
            question: "よる",
            answer: "yoru",
            hint: "night"
          },
          {
            question: "わたし",
            answer: "watashi",
            hint: "(I, myself)"
          },
          {
            question: "にほん",
            answer: "nihon",
            hint: "Japan"
          }
        ]
      }
    ]
  }
];

export const getLevelById = (id: number): Level | undefined => {
  return levels.find(level => level.id === id);
};

export const getNextLevels = (currentLevelId: number): Level[] => {
  const currentLevel = getLevelById(currentLevelId);
  if (!currentLevel) return [];
  
  return currentLevel.nextUnlocks
    .map(id => getLevelById(id))
    .filter((level): level is Level => level !== undefined);
}; 