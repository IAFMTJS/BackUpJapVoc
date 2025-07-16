import type { Level } from '../types/learn';

export const levels: Level[] = [
  {
    "id": 1,
    "title": "Hiragana 1: A to O",
    "description": "Learn the first five hiragana vowels (あ, い, う, え, お) and their pronunciations.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      2
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana character for each sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is the hiragana for 'a'?",
            "options": [
              "あ",
              "い",
              "う"
            ],
            "answer": "あ"
          },
          {
            "question": "Which one is the hiragana for 'i'?",
            "options": [
              "う",
              "い",
              "え"
            ],
            "answer": "い"
          },
          {
            "question": "Which one is the hiragana for 'u'?",
            "options": [
              "う",
              "お",
              "あ"
            ],
            "answer": "う"
          },
          {
            "question": "Which one is the hiragana for 'e'?",
            "options": [
              "い",
              "え",
              "お"
            ],
            "answer": "え"
          },
          {
            "question": "Which one is the hiragana for 'o'?",
            "options": [
              "え",
              "お",
              "あ"
            ],
            "answer": "お"
          }
        ]
      },
      {
        "title": "Hiragana Matching",
        "instruction": "Match each hiragana character with its romanized sound.",
        "exerciseType": "memoryGame",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "あ",
            "answer": "a"
          },
          {
            "question": "い",
            "answer": "i"
          },
          {
            "question": "う",
            "answer": "u"
          },
          {
            "question": "え",
            "answer": "e"
          },
          {
            "question": "お",
            "answer": "o"
          }
        ]
      },
      {
        "title": "Listening Practice",
        "instruction": "Listen to the audio and choose the correct character.",
        "exerciseType": "audioListen",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Which character did you hear?",
            "audio": "audio/a.mp3",
            "options": [
              "あ",
              "お",
              "う"
            ],
            "answer": "あ"
          },
          {
            "question": "Which character did you hear?",
            "audio": "audio/u.mp3",
            "options": [
              "う",
              "え",
              "お"
            ],
            "answer": "う"
          },
          {
            "question": "Which character did you hear?",
            "audio": "audio/o.mp3",
            "options": [
              "あ",
              "う",
              "お"
            ],
            "answer": "お"
          }
        ]
      },
      {
        "title": "Spelling in Hiragana",
        "instruction": "Type the correct hiragana for each sound or word.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type the hiragana for 'u'.",
            "answer": "う"
          },
          {
            "question": "Type the hiragana for 'ai'.",
            "answer": "あい",
            "hint": "This spells a word meaning 'love'."
          },
          {
            "question": "Type the hiragana for 'ie'.",
            "answer": "いえ",
            "hint": "This spells a word meaning 'house'."
          },
          {
            "question": "Type the hiragana for 'ao'.",
            "answer": "あお",
            "hint": "This spells a word meaning 'blue'."
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "title": "Hiragana 2: KA to KO",
    "description": "Learn the hiragana characters か, き, く, け, こ (the K-line) and how to read simple words with them.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      3
    ],
    "exercises": [
      {
        "title": "Hiragana K-line",
        "instruction": "Select the correct hiragana character for each given 'K' sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'ka'?",
            "options": [
              "か",
              "き",
              "く"
            ],
            "answer": "か"
          },
          {
            "question": "Which one is 'ki'?",
            "options": [
              "い",
              "き",
              "け"
            ],
            "answer": "き"
          },
          {
            "question": "Which one is 'ku'?",
            "options": [
              "く",
              "こ",
              "か"
            ],
            "answer": "く"
          },
          {
            "question": "Which one is 'ke'?",
            "options": [
              "け",
              "き",
              "こ"
            ],
            "answer": "け"
          },
          {
            "question": "Which one is 'ko'?",
            "options": [
              "こ",
              "か",
              "く"
            ],
            "answer": "こ"
          }
        ]
      },
      {
        "title": "Reading Practice",
        "instruction": "Type the romanized reading for each hiragana or word.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "か",
            "answer": "ka"
          },
          {
            "question": "き",
            "answer": "ki"
          },
          {
            "question": "あか",
            "answer": "aka",
            "hint": "Means 'red' (aka)."
          },
          {
            "question": "いけ",
            "answer": "ike",
            "hint": "Means 'pond' (ike)."
          },
          {
            "question": "いく",
            "answer": "iku",
            "hint": "Means 'to go' (iku)."
          }
        ]
      },
      {
        "title": "Listening: K-line Sounds",
        "instruction": "Listen and select the character you hear.",
        "exerciseType": "audioListen",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Which character did you hear?",
            "audio": "audio/ka.mp3",
            "options": [
              "か",
              "あ",
              "こ"
            ],
            "answer": "か"
          },
          {
            "question": "Which character did you hear?",
            "audio": "audio/ko.mp3",
            "options": [
              "こ",
              "か",
              "け"
            ],
            "answer": "こ"
          },
          {
            "question": "Which character did you hear?",
            "audio": "audio/ki.mp3",
            "options": [
              "き",
              "け",
              "い"
            ],
            "answer": "き"
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "title": "Hiragana 3: S & T Lines",
    "description": "Learn the S-series (さ, し, す, せ, そ) and T-series (た, ち, つ, て, と) hiragana, including the special pronunciations shi (し), chi (ち), and tsu (つ).",
    "category": "kana",
    "estimatedTime": "6 min",
    "minScore": 80,
    "nextUnlocks": [
      4
    ],
    "exercises": [
      {
        "title": "Hiragana S-line",
        "instruction": "Select the correct character for each S-line sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'sa'?",
            "options": [
              "さ",
              "し",
              "す"
            ],
            "answer": "さ"
          },
          {
            "question": "Which one is 'shi'?",
            "options": [
              "さ",
              "し",
              "せ"
            ],
            "answer": "し"
          },
          {
            "question": "Which one is 'su'?",
            "options": [
              "す",
              "そ",
              "し"
            ],
            "answer": "す"
          },
          {
            "question": "Which one is 'se'?",
            "options": [
              "せ",
              "そ",
              "す"
            ],
            "answer": "せ"
          },
          {
            "question": "Which one is 'so'?",
            "options": [
              "そ",
              "す",
              "せ"
            ],
            "answer": "そ"
          }
        ]
      },
      {
        "title": "Hiragana T-line",
        "instruction": "Select the correct character for each T-line sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'ta'?",
            "options": [
              "た",
              "ち",
              "て"
            ],
            "answer": "た"
          },
          {
            "question": "Which one is 'chi'?",
            "options": [
              "ち",
              "さ",
              "つ"
            ],
            "answer": "ち"
          },
          {
            "question": "Which one is 'tsu'?",
            "options": [
              "つ",
              "し",
              "す"
            ],
            "answer": "つ"
          },
          {
            "question": "Which one is 'te'?",
            "options": [
              "て",
              "と",
              "た"
            ],
            "answer": "て"
          },
          {
            "question": "Which one is 'to'?",
            "options": [
              "と",
              "て",
              "た"
            ],
            "answer": "と"
          }
        ]
      },
      {
        "title": "Word Reading Practice",
        "instruction": "Type the romanized reading for each word in hiragana.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "すし",
            "answer": "sushi",
            "hint": "sushi (a Japanese food)"
          },
          {
            "question": "あさ",
            "answer": "asa",
            "hint": "morning"
          },
          {
            "question": "あつい",
            "answer": "atsui",
            "hint": "hot (temperature)"
          },
          {
            "question": "あし",
            "answer": "ashi",
            "hint": "foot or leg"
          },
          {
            "question": "さけ",
            "answer": "sake",
            "hint": "sake (alcoholic drink)"
          }
        ]
      },
      {
        "title": "Listening Practice",
        "instruction": "Listen and choose the character you hear.",
        "exerciseType": "audioListen",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Which character did you hear?",
            "audio": "audio/shi.mp3",
            "options": [
              "し",
              "ち",
              "す"
            ],
            "answer": "し"
          },
          {
            "question": "Which character did you hear?",
            "audio": "audio/tsu.mp3",
            "options": [
              "つ",
              "す",
              "と"
            ],
            "answer": "つ"
          },
          {
            "question": "Which character did you hear?",
            "audio": "audio/so.mp3",
            "options": [
              "そ",
              "し",
              "す"
            ],
            "answer": "そ"
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "title": "Hiragana 4: N & H Lines",
    "description": "Learn the N-series (な, に, ぬ, ね, の) and H-series (は, ひ, ふ, へ, ほ) hiragana characters.",
    "category": "kana",
    "estimatedTime": "6 min",
    "minScore": 80,
    "nextUnlocks": [
      5
    ],
    "exercises": [
      {
        "title": "Hiragana N-line",
        "instruction": "Select the correct character for each N-line sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'na'?",
            "options": [
              "な",
              "に",
              "ぬ"
            ],
            "answer": "な"
          },
          {
            "question": "Which one is 'ni'?",
            "options": [
              "ね",
              "に",
              "の"
            ],
            "answer": "に"
          },
          {
            "question": "Which one is 'nu'?",
            "options": [
              "ぬ",
              "ね",
              "の"
            ],
            "answer": "ぬ"
          },
          {
            "question": "Which one is 'ne'?",
            "options": [
              "ね",
              "の",
              "な"
            ],
            "answer": "ね"
          },
          {
            "question": "Which one is 'no'?",
            "options": [
              "の",
              "な",
              "ぬ"
            ],
            "answer": "の"
          }
        ]
      },
      {
        "title": "Hiragana H-line",
        "instruction": "Select the correct character for each H-line sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'ha'?",
            "options": [
              "は",
              "ほ",
              "ひ"
            ],
            "answer": "は"
          },
          {
            "question": "Which one is 'hi'?",
            "options": [
              "ひ",
              "は",
              "け"
            ],
            "answer": "ひ"
          },
          {
            "question": "Which one is 'fu'?",
            "options": [
              "ふ",
              "へ",
              "ひ"
            ],
            "answer": "ふ"
          },
          {
            "question": "Which one is 'he'?",
            "options": [
              "へ",
              "ほ",
              "は"
            ],
            "answer": "へ"
          },
          {
            "question": "Which one is 'ho'?",
            "options": [
              "ほ",
              "は",
              "ひ"
            ],
            "answer": "ほ"
          }
        ]
      },
      {
        "title": "Word Reading Practice",
        "instruction": "Type the romanized reading for each word (hiragana).",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "いぬ",
            "answer": "inu",
            "hint": "dog"
          },
          {
            "question": "ねこ",
            "answer": "neko",
            "hint": "cat"
          },
          {
            "question": "はな",
            "answer": "hana",
            "hint": "flower"
          },
          {
            "question": "ふね",
            "answer": "fune",
            "hint": "boat/ship"
          },
          {
            "question": "ほし",
            "answer": "hoshi",
            "hint": "star"
          },
          {
            "question": "ひと",
            "answer": "hito",
            "hint": "person"
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "title": "Hiragana 5: M, Y, R, W & N",
    "description": "Learn the remaining hiragana: M-series (ま, み, む, め, も), Y-series (や, ゆ, よ), R-series (ら, り, る, れ, ろ), W-series (わ, を) and the nasal sound ん.",
    "category": "kana",
    "estimatedTime": "7 min",
    "minScore": 80,
    "nextUnlocks": [
      6
    ],
    "exercises": [
      {
        "title": "Hiragana M-line",
        "instruction": "Select the correct character for each M-line sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'ma'?",
            "options": [
              "ま",
              "み",
              "も"
            ],
            "answer": "ま"
          },
          {
            "question": "Which one is 'mi'?",
            "options": [
              "み",
              "ぬ",
              "ま"
            ],
            "answer": "み"
          },
          {
            "question": "Which one is 'mu'?",
            "options": [
              "む",
              "め",
              "も"
            ],
            "answer": "む"
          },
          {
            "question": "Which one is 'me'?",
            "options": [
              "め",
              "ま",
              "ぬ"
            ],
            "answer": "め"
          },
          {
            "question": "Which one is 'mo'?",
            "options": [
              "も",
              "む",
              "ま"
            ],
            "answer": "も"
          }
        ]
      },
      {
        "title": "Hiragana Y, W & N",
        "instruction": "Select the correct character for each Y/W sound (and 'ん').",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'ya'?",
            "options": [
              "や",
              "わ",
              "よ"
            ],
            "answer": "や"
          },
          {
            "question": "Which one is 'yu'?",
            "options": [
              "ゆ",
              "よ",
              "や"
            ],
            "answer": "ゆ"
          },
          {
            "question": "Which one is 'yo'?",
            "options": [
              "よ",
              "ゆ",
              "や"
            ],
            "answer": "よ"
          },
          {
            "question": "Which one is 'wa'?",
            "options": [
              "わ",
              "れ",
              "ね"
            ],
            "answer": "わ"
          },
          {
            "question": "Which one is 'wo' (o)?",
            "options": [
              "を",
              "わ",
              "ん"
            ],
            "answer": "を"
          },
          {
            "question": "Which one is the 'n' (ん) sound?",
            "options": [
              "ん",
              "め",
              "る"
            ],
            "answer": "ん"
          }
        ]
      },
      {
        "title": "Hiragana R-line",
        "instruction": "Select the correct character for each R-line sound.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'ra'?",
            "options": [
              "ら",
              "り",
              "れ"
            ],
            "answer": "ら"
          },
          {
            "question": "Which one is 'ri'?",
            "options": [
              "り",
              "ろ",
              "ね"
            ],
            "answer": "り"
          },
          {
            "question": "Which one is 'ru'?",
            "options": [
              "る",
              "ろ",
              "ぬ"
            ],
            "answer": "る"
          },
          {
            "question": "Which one is 're'?",
            "options": [
              "れ",
              "ら",
              "ね"
            ],
            "answer": "れ"
          },
          {
            "question": "Which one is 'ro'?",
            "options": [
              "ろ",
              "る",
              "ら"
            ],
            "answer": "ろ"
          }
        ]
      },
      {
        "title": "Word Reading Practice",
        "instruction": "Type the romanized reading for each word.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "あめ",
            "answer": "ame",
            "hint": "rain"
          },
          {
            "question": "やま",
            "answer": "yama",
            "hint": "mountain"
          },
          {
            "question": "ゆき",
            "answer": "yuki",
            "hint": "snow"
          },
          {
            "question": "よる",
            "answer": "yoru",
            "hint": "night"
          },
          {
            "question": "わたし",
            "answer": "watashi",
            "hint": "(I, myself)"
          },
          {
            "question": "にほん",
            "answer": "nihon",
            "hint": "Japan"
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "title": "Hiragana 1",
    "description": "Learn hiragana part 1 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      7
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H1'?",
            "options": [
              "H1",
              "H2",
              "H3"
            ],
            "answer": "H1"
          },
          {
            "question": "Which one is 'H2'?",
            "options": [
              "H2",
              "H1",
              "H3"
            ],
            "answer": "H2"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H1'",
            "answer": "H1"
          },
          {
            "question": "Type 'H2'",
            "answer": "H2"
          }
        ]
      }
    ]
  },
  {
    "id": 7,
    "title": "Hiragana 2",
    "description": "Learn hiragana part 2 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      8
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H2'?",
            "options": [
              "H2",
              "H3",
              "H4"
            ],
            "answer": "H2"
          },
          {
            "question": "Which one is 'H3'?",
            "options": [
              "H3",
              "H2",
              "H4"
            ],
            "answer": "H3"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H2'",
            "answer": "H2"
          },
          {
            "question": "Type 'H3'",
            "answer": "H3"
          }
        ]
      }
    ]
  },
  {
    "id": 8,
    "title": "Hiragana 3",
    "description": "Learn hiragana part 3 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      9
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H3'?",
            "options": [
              "H3",
              "H4",
              "H5"
            ],
            "answer": "H3"
          },
          {
            "question": "Which one is 'H4'?",
            "options": [
              "H4",
              "H3",
              "H5"
            ],
            "answer": "H4"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H3'",
            "answer": "H3"
          },
          {
            "question": "Type 'H4'",
            "answer": "H4"
          }
        ]
      }
    ]
  },
  {
    "id": 9,
    "title": "Hiragana 4",
    "description": "Learn hiragana part 4 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      10
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H4'?",
            "options": [
              "H4",
              "H5",
              "H6"
            ],
            "answer": "H4"
          },
          {
            "question": "Which one is 'H5'?",
            "options": [
              "H5",
              "H4",
              "H6"
            ],
            "answer": "H5"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H4'",
            "answer": "H4"
          },
          {
            "question": "Type 'H5'",
            "answer": "H5"
          }
        ]
      }
    ]
  },
  {
    "id": 10,
    "title": "Hiragana 5",
    "description": "Learn hiragana part 5 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      11
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H5'?",
            "options": [
              "H5",
              "H6",
              "H7"
            ],
            "answer": "H5"
          },
          {
            "question": "Which one is 'H6'?",
            "options": [
              "H6",
              "H5",
              "H7"
            ],
            "answer": "H6"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H5'",
            "answer": "H5"
          },
          {
            "question": "Type 'H6'",
            "answer": "H6"
          }
        ]
      }
    ]
  },
  {
    "id": 11,
    "title": "Hiragana 6",
    "description": "Learn hiragana part 6 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      12
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H6'?",
            "options": [
              "H6",
              "H7",
              "H8"
            ],
            "answer": "H6"
          },
          {
            "question": "Which one is 'H7'?",
            "options": [
              "H7",
              "H6",
              "H8"
            ],
            "answer": "H7"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H6'",
            "answer": "H6"
          },
          {
            "question": "Type 'H7'",
            "answer": "H7"
          }
        ]
      }
    ]
  },
  {
    "id": 12,
    "title": "Hiragana 7",
    "description": "Learn hiragana part 7 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      13
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H7'?",
            "options": [
              "H7",
              "H8",
              "H9"
            ],
            "answer": "H7"
          },
          {
            "question": "Which one is 'H8'?",
            "options": [
              "H8",
              "H7",
              "H9"
            ],
            "answer": "H8"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H7'",
            "answer": "H7"
          },
          {
            "question": "Type 'H8'",
            "answer": "H8"
          }
        ]
      }
    ]
  },
  {
    "id": 13,
    "title": "Hiragana 8",
    "description": "Learn hiragana part 8 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      14
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H8'?",
            "options": [
              "H8",
              "H9",
              "H10"
            ],
            "answer": "H8"
          },
          {
            "question": "Which one is 'H9'?",
            "options": [
              "H9",
              "H8",
              "H10"
            ],
            "answer": "H9"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H8'",
            "answer": "H8"
          },
          {
            "question": "Type 'H9'",
            "answer": "H9"
          }
        ]
      }
    ]
  },
  {
    "id": 14,
    "title": "Hiragana 9",
    "description": "Learn hiragana part 9 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      15
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H9'?",
            "options": [
              "H9",
              "H10",
              "H11"
            ],
            "answer": "H9"
          },
          {
            "question": "Which one is 'H10'?",
            "options": [
              "H10",
              "H9",
              "H11"
            ],
            "answer": "H10"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H9'",
            "answer": "H9"
          },
          {
            "question": "Type 'H10'",
            "answer": "H10"
          }
        ]
      }
    ]
  },
  {
    "id": 15,
    "title": "Hiragana 10",
    "description": "Learn hiragana part 10 with basic practice.",
    "category": "kana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      16
    ],
    "exercises": [
      {
        "title": "Hiragana Recognition",
        "instruction": "Select the correct hiragana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'H10'?",
            "options": [
              "H10",
              "H11",
              "H12"
            ],
            "answer": "H10"
          },
          {
            "question": "Which one is 'H11'?",
            "options": [
              "H11",
              "H10",
              "H12"
            ],
            "answer": "H11"
          }
        ]
      },
      {
        "title": "Hiragana Typing",
        "instruction": "Type the correct hiragana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'H10'",
            "answer": "H10"
          },
          {
            "question": "Type 'H11'",
            "answer": "H11"
          }
        ]
      }
    ]
  },
  {
    "id": 16,
    "title": "Katakana 1",
    "description": "Learn katakana part 1 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      17
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K1'?",
            "options": [
              "K1",
              "K2",
              "K3"
            ],
            "answer": "K1"
          },
          {
            "question": "Which one is 'K2'?",
            "options": [
              "K2",
              "K1",
              "K3"
            ],
            "answer": "K2"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K1'",
            "answer": "K1"
          },
          {
            "question": "Type 'K2'",
            "answer": "K2"
          }
        ]
      }
    ]
  },
  {
    "id": 17,
    "title": "Katakana 2",
    "description": "Learn katakana part 2 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      18
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K2'?",
            "options": [
              "K2",
              "K3",
              "K4"
            ],
            "answer": "K2"
          },
          {
            "question": "Which one is 'K3'?",
            "options": [
              "K3",
              "K2",
              "K4"
            ],
            "answer": "K3"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K2'",
            "answer": "K2"
          },
          {
            "question": "Type 'K3'",
            "answer": "K3"
          }
        ]
      }
    ]
  },
  {
    "id": 18,
    "title": "Katakana 3",
    "description": "Learn katakana part 3 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      19
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K3'?",
            "options": [
              "K3",
              "K4",
              "K5"
            ],
            "answer": "K3"
          },
          {
            "question": "Which one is 'K4'?",
            "options": [
              "K4",
              "K3",
              "K5"
            ],
            "answer": "K4"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K3'",
            "answer": "K3"
          },
          {
            "question": "Type 'K4'",
            "answer": "K4"
          }
        ]
      }
    ]
  },
  {
    "id": 19,
    "title": "Katakana 4",
    "description": "Learn katakana part 4 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      20
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K4'?",
            "options": [
              "K4",
              "K5",
              "K6"
            ],
            "answer": "K4"
          },
          {
            "question": "Which one is 'K5'?",
            "options": [
              "K5",
              "K4",
              "K6"
            ],
            "answer": "K5"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K4'",
            "answer": "K4"
          },
          {
            "question": "Type 'K5'",
            "answer": "K5"
          }
        ]
      }
    ]
  },
  {
    "id": 20,
    "title": "Katakana 5",
    "description": "Learn katakana part 5 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      21
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K5'?",
            "options": [
              "K5",
              "K6",
              "K7"
            ],
            "answer": "K5"
          },
          {
            "question": "Which one is 'K6'?",
            "options": [
              "K6",
              "K5",
              "K7"
            ],
            "answer": "K6"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K5'",
            "answer": "K5"
          },
          {
            "question": "Type 'K6'",
            "answer": "K6"
          }
        ]
      }
    ]
  },
  {
    "id": 21,
    "title": "Katakana 6",
    "description": "Learn katakana part 6 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      22
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K6'?",
            "options": [
              "K6",
              "K7",
              "K8"
            ],
            "answer": "K6"
          },
          {
            "question": "Which one is 'K7'?",
            "options": [
              "K7",
              "K6",
              "K8"
            ],
            "answer": "K7"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K6'",
            "answer": "K6"
          },
          {
            "question": "Type 'K7'",
            "answer": "K7"
          }
        ]
      }
    ]
  },
  {
    "id": 22,
    "title": "Katakana 7",
    "description": "Learn katakana part 7 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      23
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K7'?",
            "options": [
              "K7",
              "K8",
              "K9"
            ],
            "answer": "K7"
          },
          {
            "question": "Which one is 'K8'?",
            "options": [
              "K8",
              "K7",
              "K9"
            ],
            "answer": "K8"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K7'",
            "answer": "K7"
          },
          {
            "question": "Type 'K8'",
            "answer": "K8"
          }
        ]
      }
    ]
  },
  {
    "id": 23,
    "title": "Katakana 8",
    "description": "Learn katakana part 8 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      24
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K8'?",
            "options": [
              "K8",
              "K9",
              "K10"
            ],
            "answer": "K8"
          },
          {
            "question": "Which one is 'K9'?",
            "options": [
              "K9",
              "K8",
              "K10"
            ],
            "answer": "K9"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K8'",
            "answer": "K8"
          },
          {
            "question": "Type 'K9'",
            "answer": "K9"
          }
        ]
      }
    ]
  },
  {
    "id": 24,
    "title": "Katakana 9",
    "description": "Learn katakana part 9 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      25
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K9'?",
            "options": [
              "K9",
              "K10",
              "K11"
            ],
            "answer": "K9"
          },
          {
            "question": "Which one is 'K10'?",
            "options": [
              "K10",
              "K9",
              "K11"
            ],
            "answer": "K10"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K9'",
            "answer": "K9"
          },
          {
            "question": "Type 'K10'",
            "answer": "K10"
          }
        ]
      }
    ]
  },
  {
    "id": 25,
    "title": "Katakana 10",
    "description": "Learn katakana part 10 with basic practice.",
    "category": "katakana",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      26
    ],
    "exercises": [
      {
        "title": "Katakana Recognition",
        "instruction": "Select the correct katakana for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K10'?",
            "options": [
              "K10",
              "K11",
              "K12"
            ],
            "answer": "K10"
          },
          {
            "question": "Which one is 'K11'?",
            "options": [
              "K11",
              "K10",
              "K12"
            ],
            "answer": "K11"
          }
        ]
      },
      {
        "title": "Katakana Typing",
        "instruction": "Type the correct katakana for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K10'",
            "answer": "K10"
          },
          {
            "question": "Type 'K11'",
            "answer": "K11"
          }
        ]
      }
    ]
  },
  {
    "id": 26,
    "title": "Vocabulary 1",
    "description": "Learn vocabulary part 1 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      27
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V1'?",
            "options": [
              "V1",
              "V2",
              "V3"
            ],
            "answer": "V1"
          },
          {
            "question": "Which one is 'V2'?",
            "options": [
              "V2",
              "V1",
              "V3"
            ],
            "answer": "V2"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V1'",
            "answer": "V1"
          },
          {
            "question": "Type 'V2'",
            "answer": "V2"
          }
        ]
      }
    ]
  },
  {
    "id": 27,
    "title": "Vocabulary 2",
    "description": "Learn vocabulary part 2 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      28
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V2'?",
            "options": [
              "V2",
              "V3",
              "V4"
            ],
            "answer": "V2"
          },
          {
            "question": "Which one is 'V3'?",
            "options": [
              "V3",
              "V2",
              "V4"
            ],
            "answer": "V3"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V2'",
            "answer": "V2"
          },
          {
            "question": "Type 'V3'",
            "answer": "V3"
          }
        ]
      }
    ]
  },
  {
    "id": 28,
    "title": "Vocabulary 3",
    "description": "Learn vocabulary part 3 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      29
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V3'?",
            "options": [
              "V3",
              "V4",
              "V5"
            ],
            "answer": "V3"
          },
          {
            "question": "Which one is 'V4'?",
            "options": [
              "V4",
              "V3",
              "V5"
            ],
            "answer": "V4"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V3'",
            "answer": "V3"
          },
          {
            "question": "Type 'V4'",
            "answer": "V4"
          }
        ]
      }
    ]
  },
  {
    "id": 29,
    "title": "Vocabulary 4",
    "description": "Learn vocabulary part 4 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      30
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V4'?",
            "options": [
              "V4",
              "V5",
              "V6"
            ],
            "answer": "V4"
          },
          {
            "question": "Which one is 'V5'?",
            "options": [
              "V5",
              "V4",
              "V6"
            ],
            "answer": "V5"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V4'",
            "answer": "V4"
          },
          {
            "question": "Type 'V5'",
            "answer": "V5"
          }
        ]
      }
    ]
  },
  {
    "id": 30,
    "title": "Vocabulary 5",
    "description": "Learn vocabulary part 5 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      31
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V5'?",
            "options": [
              "V5",
              "V6",
              "V7"
            ],
            "answer": "V5"
          },
          {
            "question": "Which one is 'V6'?",
            "options": [
              "V6",
              "V5",
              "V7"
            ],
            "answer": "V6"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V5'",
            "answer": "V5"
          },
          {
            "question": "Type 'V6'",
            "answer": "V6"
          }
        ]
      }
    ]
  },
  {
    "id": 31,
    "title": "Vocabulary 6",
    "description": "Learn vocabulary part 6 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      32
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V6'?",
            "options": [
              "V6",
              "V7",
              "V8"
            ],
            "answer": "V6"
          },
          {
            "question": "Which one is 'V7'?",
            "options": [
              "V7",
              "V6",
              "V8"
            ],
            "answer": "V7"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V6'",
            "answer": "V6"
          },
          {
            "question": "Type 'V7'",
            "answer": "V7"
          }
        ]
      }
    ]
  },
  {
    "id": 32,
    "title": "Vocabulary 7",
    "description": "Learn vocabulary part 7 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      33
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V7'?",
            "options": [
              "V7",
              "V8",
              "V9"
            ],
            "answer": "V7"
          },
          {
            "question": "Which one is 'V8'?",
            "options": [
              "V8",
              "V7",
              "V9"
            ],
            "answer": "V8"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V7'",
            "answer": "V7"
          },
          {
            "question": "Type 'V8'",
            "answer": "V8"
          }
        ]
      }
    ]
  },
  {
    "id": 33,
    "title": "Vocabulary 8",
    "description": "Learn vocabulary part 8 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      34
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V8'?",
            "options": [
              "V8",
              "V9",
              "V10"
            ],
            "answer": "V8"
          },
          {
            "question": "Which one is 'V9'?",
            "options": [
              "V9",
              "V8",
              "V10"
            ],
            "answer": "V9"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V8'",
            "answer": "V8"
          },
          {
            "question": "Type 'V9'",
            "answer": "V9"
          }
        ]
      }
    ]
  },
  {
    "id": 34,
    "title": "Vocabulary 9",
    "description": "Learn vocabulary part 9 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      35
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V9'?",
            "options": [
              "V9",
              "V10",
              "V11"
            ],
            "answer": "V9"
          },
          {
            "question": "Which one is 'V10'?",
            "options": [
              "V10",
              "V9",
              "V11"
            ],
            "answer": "V10"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V9'",
            "answer": "V9"
          },
          {
            "question": "Type 'V10'",
            "answer": "V10"
          }
        ]
      }
    ]
  },
  {
    "id": 35,
    "title": "Vocabulary 10",
    "description": "Learn vocabulary part 10 with basic practice.",
    "category": "vocab",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      36
    ],
    "exercises": [
      {
        "title": "Vocabulary Recognition",
        "instruction": "Select the correct vocabulary for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'V10'?",
            "options": [
              "V10",
              "V11",
              "V12"
            ],
            "answer": "V10"
          },
          {
            "question": "Which one is 'V11'?",
            "options": [
              "V11",
              "V10",
              "V12"
            ],
            "answer": "V11"
          }
        ]
      },
      {
        "title": "Vocabulary Typing",
        "instruction": "Type the correct vocabulary for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'V10'",
            "answer": "V10"
          },
          {
            "question": "Type 'V11'",
            "answer": "V11"
          }
        ]
      }
    ]
  },
  {
    "id": 36,
    "title": "Kanji 1",
    "description": "Learn kanji part 1 with basic practice.",
    "category": "kanji",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      37
    ],
    "exercises": [
      {
        "title": "Kanji Recognition",
        "instruction": "Select the correct kanji for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K1'?",
            "options": [
              "K1",
              "K2",
              "K3"
            ],
            "answer": "K1"
          },
          {
            "question": "Which one is 'K2'?",
            "options": [
              "K2",
              "K1",
              "K3"
            ],
            "answer": "K2"
          }
        ]
      },
      {
        "title": "Kanji Typing",
        "instruction": "Type the correct kanji for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K1'",
            "answer": "K1"
          },
          {
            "question": "Type 'K2'",
            "answer": "K2"
          }
        ]
      }
    ]
  },
  {
    "id": 37,
    "title": "Kanji 2",
    "description": "Learn kanji part 2 with basic practice.",
    "category": "kanji",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      38
    ],
    "exercises": [
      {
        "title": "Kanji Recognition",
        "instruction": "Select the correct kanji for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K2'?",
            "options": [
              "K2",
              "K3",
              "K4"
            ],
            "answer": "K2"
          },
          {
            "question": "Which one is 'K3'?",
            "options": [
              "K3",
              "K2",
              "K4"
            ],
            "answer": "K3"
          }
        ]
      },
      {
        "title": "Kanji Typing",
        "instruction": "Type the correct kanji for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K2'",
            "answer": "K2"
          },
          {
            "question": "Type 'K3'",
            "answer": "K3"
          }
        ]
      }
    ]
  },
  {
    "id": 38,
    "title": "Kanji 3",
    "description": "Learn kanji part 3 with basic practice.",
    "category": "kanji",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      39
    ],
    "exercises": [
      {
        "title": "Kanji Recognition",
        "instruction": "Select the correct kanji for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K3'?",
            "options": [
              "K3",
              "K4",
              "K5"
            ],
            "answer": "K3"
          },
          {
            "question": "Which one is 'K4'?",
            "options": [
              "K4",
              "K3",
              "K5"
            ],
            "answer": "K4"
          }
        ]
      },
      {
        "title": "Kanji Typing",
        "instruction": "Type the correct kanji for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K3'",
            "answer": "K3"
          },
          {
            "question": "Type 'K4'",
            "answer": "K4"
          }
        ]
      }
    ]
  },
  {
    "id": 39,
    "title": "Kanji 4",
    "description": "Learn kanji part 4 with basic practice.",
    "category": "kanji",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      40
    ],
    "exercises": [
      {
        "title": "Kanji Recognition",
        "instruction": "Select the correct kanji for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K4'?",
            "options": [
              "K4",
              "K5",
              "K6"
            ],
            "answer": "K4"
          },
          {
            "question": "Which one is 'K5'?",
            "options": [
              "K5",
              "K4",
              "K6"
            ],
            "answer": "K5"
          }
        ]
      },
      {
        "title": "Kanji Typing",
        "instruction": "Type the correct kanji for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K4'",
            "answer": "K4"
          },
          {
            "question": "Type 'K5'",
            "answer": "K5"
          }
        ]
      }
    ]
  },
  {
    "id": 40,
    "title": "Kanji 5",
    "description": "Learn kanji part 5 with basic practice.",
    "category": "kanji",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      41
    ],
    "exercises": [
      {
        "title": "Kanji Recognition",
        "instruction": "Select the correct kanji for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'K5'?",
            "options": [
              "K5",
              "K6",
              "K7"
            ],
            "answer": "K5"
          },
          {
            "question": "Which one is 'K6'?",
            "options": [
              "K6",
              "K5",
              "K7"
            ],
            "answer": "K6"
          }
        ]
      },
      {
        "title": "Kanji Typing",
        "instruction": "Type the correct kanji for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'K5'",
            "answer": "K5"
          },
          {
            "question": "Type 'K6'",
            "answer": "K6"
          }
        ]
      }
    ]
  },
  {
    "id": 41,
    "title": "Grammar 1",
    "description": "Learn grammar part 1 with basic practice.",
    "category": "grammar",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      42
    ],
    "exercises": [
      {
        "title": "Grammar Recognition",
        "instruction": "Select the correct grammar for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'G1'?",
            "options": [
              "G1",
              "G2",
              "G3"
            ],
            "answer": "G1"
          },
          {
            "question": "Which one is 'G2'?",
            "options": [
              "G2",
              "G1",
              "G3"
            ],
            "answer": "G2"
          }
        ]
      },
      {
        "title": "Grammar Typing",
        "instruction": "Type the correct grammar for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'G1'",
            "answer": "G1"
          },
          {
            "question": "Type 'G2'",
            "answer": "G2"
          }
        ]
      }
    ]
  },
  {
    "id": 42,
    "title": "Grammar 2",
    "description": "Learn grammar part 2 with basic practice.",
    "category": "grammar",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      43
    ],
    "exercises": [
      {
        "title": "Grammar Recognition",
        "instruction": "Select the correct grammar for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'G2'?",
            "options": [
              "G2",
              "G3",
              "G4"
            ],
            "answer": "G2"
          },
          {
            "question": "Which one is 'G3'?",
            "options": [
              "G3",
              "G2",
              "G4"
            ],
            "answer": "G3"
          }
        ]
      },
      {
        "title": "Grammar Typing",
        "instruction": "Type the correct grammar for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'G2'",
            "answer": "G2"
          },
          {
            "question": "Type 'G3'",
            "answer": "G3"
          }
        ]
      }
    ]
  },
  {
    "id": 43,
    "title": "Grammar 3",
    "description": "Learn grammar part 3 with basic practice.",
    "category": "grammar",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      44
    ],
    "exercises": [
      {
        "title": "Grammar Recognition",
        "instruction": "Select the correct grammar for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'G3'?",
            "options": [
              "G3",
              "G4",
              "G5"
            ],
            "answer": "G3"
          },
          {
            "question": "Which one is 'G4'?",
            "options": [
              "G4",
              "G3",
              "G5"
            ],
            "answer": "G4"
          }
        ]
      },
      {
        "title": "Grammar Typing",
        "instruction": "Type the correct grammar for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'G3'",
            "answer": "G3"
          },
          {
            "question": "Type 'G4'",
            "answer": "G4"
          }
        ]
      }
    ]
  },
  {
    "id": 44,
    "title": "Grammar 4",
    "description": "Learn grammar part 4 with basic practice.",
    "category": "grammar",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [
      45
    ],
    "exercises": [
      {
        "title": "Grammar Recognition",
        "instruction": "Select the correct grammar for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'G4'?",
            "options": [
              "G4",
              "G5",
              "G6"
            ],
            "answer": "G4"
          },
          {
            "question": "Which one is 'G5'?",
            "options": [
              "G5",
              "G4",
              "G6"
            ],
            "answer": "G5"
          }
        ]
      },
      {
        "title": "Grammar Typing",
        "instruction": "Type the correct grammar for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'G4'",
            "answer": "G4"
          },
          {
            "question": "Type 'G5'",
            "answer": "G5"
          }
        ]
      }
    ]
  },
  {
    "id": 45,
    "title": "Grammar 5",
    "description": "Learn grammar part 5 with basic practice.",
    "category": "grammar",
    "estimatedTime": "5 min",
    "minScore": 80,
    "nextUnlocks": [],
    "exercises": [
      {
        "title": "Grammar Recognition",
        "instruction": "Select the correct grammar for each question.",
        "exerciseType": "multipleChoice",
        "pointsPerItem": 1,
        "items": [
          {
            "question": "Which one is 'G5'?",
            "options": [
              "G5",
              "G6",
              "G7"
            ],
            "answer": "G5"
          },
          {
            "question": "Which one is 'G6'?",
            "options": [
              "G6",
              "G5",
              "G7"
            ],
            "answer": "G6"
          }
        ]
      },
      {
        "title": "Grammar Typing",
        "instruction": "Type the correct grammar for each prompt.",
        "exerciseType": "typeAnswer",
        "pointsPerItem": 2,
        "items": [
          {
            "question": "Type 'G5'",
            "answer": "G5"
          },
          {
            "question": "Type 'G6'",
            "answer": "G6"
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
  
  return levels.filter(level => 
    currentLevel.nextUnlocks.includes(level.id)
  );
};
