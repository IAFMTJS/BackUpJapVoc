export type Difficulty = 'easy' | 'medium' | 'hard';
export type KanjiCategory = 'nature' | 'people' | 'body' | 'numbers' | 'time' | 'position' | 'size' | 'currency';

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface CompoundWordData {
  word: string;
  reading: string;
  meaning: string;
  kanji: string[];
  difficulty: number;
  examples: string[];
  relatedWords: string[];
}

export interface Kanji {
  character: string;
  english: string;
  kunyomi: string[];
  onyomi: string[];
  difficulty: Difficulty;
  category: KanjiCategory;
  hint?: string;
  examples?: KanjiExample[];
  compoundWords?: CompoundWordData[];
  strokeCount: number;
  radicals: string[];
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export const kanjiList: Kanji[] = [
  {
    character: '日',
    english: 'sun, day',
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', 'か'],
    examples: [
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
      { word: '今日', reading: 'きょう', meaning: 'today' },
      { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' }
    ],
    compoundWords: [
      {
        word: '日本',
        reading: 'にほん',
        meaning: 'Japan',
        kanji: ['日', '本'],
        difficulty: 1,
        examples: ['日本に行きたいです。', '日本の文化が好きです。'],
        relatedWords: ['日本人', '日本語', '日本食']
      },
      {
        word: '今日',
        reading: 'きょう',
        meaning: 'today',
        kanji: ['今', '日'],
        difficulty: 1,
        examples: ['今日は良い天気です。', '今日の予定は何ですか？'],
        relatedWords: ['昨日', '明日', '毎日']
      },
      {
        word: '日曜日',
        reading: 'にちようび',
        meaning: 'Sunday',
        kanji: ['日', '曜', '日'],
        difficulty: 2,
        examples: ['日曜日に映画を見ます。', '日曜日は休みです。'],
        relatedWords: ['月曜日', '火曜日', '水曜日']
      }
    ],
    difficulty: 'easy',
    category: 'nature',
    hint: 'Looks like a sun with rays',
    strokeCount: 4,
    radicals: ['日'],
    jlptLevel: 'N5'
  },
  {
    character: '月',
    english: 'moon, month',
    onyomi: ['ゲツ', 'ガツ'],
    kunyomi: ['つき'],
    examples: [
      { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
      { word: '一月', reading: 'いちがつ', meaning: 'January' },
      { word: '月見', reading: 'つきみ', meaning: 'moon viewing' }
    ],
    compoundWords: [
      {
        word: '月曜日',
        reading: 'げつようび',
        meaning: 'Monday',
        kanji: ['月', '曜', '日'],
        difficulty: 2,
        examples: ['月曜日から仕事が始まります。', '月曜日は忙しいです。'],
        relatedWords: ['火曜日', '水曜日', '木曜日']
      },
      {
        word: '一月',
        reading: 'いちがつ',
        meaning: 'January',
        kanji: ['一', '月'],
        difficulty: 1,
        examples: ['一月は新しい年の始まりです。', '一月は寒いです。'],
        relatedWords: ['二月', '三月', '四月']
      },
      {
        word: '月見',
        reading: 'つきみ',
        meaning: 'moon viewing',
        kanji: ['月', '見'],
        difficulty: 2,
        examples: ['月見をしながらお酒を飲みます。', '月見がきれいです。'],
        relatedWords: ['花見', '雪見', '星見']
      }
    ],
    difficulty: 'easy',
    category: 'nature',
    hint: 'Looks like a crescent moon',
    strokeCount: 4,
    radicals: ['月'],
    jlptLevel: 'N5'
  },
  {
    character: '水',
    english: 'water',
    onyomi: ['スイ'],
    kunyomi: ['みず'],
    examples: [
      { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
      { word: '水泳', reading: 'すいえい', meaning: 'swimming' },
      { word: '水着', reading: 'みずぎ', meaning: 'swimsuit' }
    ],
    compoundWords: [
      {
        word: '水曜日',
        reading: 'すいようび',
        meaning: 'Wednesday',
        kanji: ['水', '曜', '日'],
        difficulty: 2,
        examples: ['水曜日に会議があります。', '水曜日は半日です。'],
        relatedWords: ['火曜日', '木曜日', '金曜日']
      },
      {
        word: '水泳',
        reading: 'すいえい',
        meaning: 'swimming',
        kanji: ['水', '泳'],
        difficulty: 2,
        examples: ['水泳が好きです。', '水泳を習っています。'],
        relatedWords: ['泳ぐ', '水着', 'プール']
      },
      {
        word: '水着',
        reading: 'みずぎ',
        meaning: 'swimsuit',
        kanji: ['水', '着'],
        difficulty: 2,
        examples: ['水着を買いました。', '水着で泳ぎます。'],
        relatedWords: ['着る', '水泳', '海']
      }
    ],
    difficulty: 'easy',
    category: 'nature',
    hint: 'Looks like flowing water',
    strokeCount: 4,
    radicals: ['水'],
    jlptLevel: 'N5'
  },
  {
    character: '火',
    english: 'fire',
    onyomi: ['カ'],
    kunyomi: ['ひ', 'ほ'],
    examples: [
      { word: '火曜日', reading: 'かようび', meaning: 'Tuesday' },
      { word: '火山', reading: 'かざん', meaning: 'volcano' },
      { word: '火事', reading: 'かじ', meaning: 'fire' }
    ],
    compoundWords: [
      {
        word: '火曜日',
        reading: 'かようび',
        meaning: 'Tuesday',
        kanji: ['火', '曜', '日'],
        difficulty: 2,
        examples: ['火曜日に会議があります。', '火曜日は忙しいです。'],
        relatedWords: ['月曜日', '水曜日', '木曜日']
      },
      {
        word: '火山',
        reading: 'かざん',
        meaning: 'volcano',
        kanji: ['火', '山'],
        difficulty: 2,
        examples: ['富士山は火山です。', '火山が噴火しました。'],
        relatedWords: ['山', '火事', '地震']
      },
      {
        word: '火事',
        reading: 'かじ',
        meaning: 'fire',
        kanji: ['火', '事'],
        difficulty: 2,
        examples: ['火事が起きました。', '火事に注意してください。'],
        relatedWords: ['火', '消防車', '避難']
      }
    ],
    difficulty: 'medium',
    category: 'nature',
    hint: 'Looks like flames',
    strokeCount: 4,
    radicals: ['火'],
    jlptLevel: 'N5'
  },
  {
    character: '木',
    english: 'tree, wood',
    onyomi: ['ボク', 'モク'],
    kunyomi: ['き', 'こ'],
    examples: [
      { word: '木曜日', reading: 'もくようび', meaning: 'Thursday' },
      { word: '木村', reading: 'きむら', meaning: 'Kimura (surname)' },
      { word: '木造', reading: 'もくぞう', meaning: 'wooden' }
    ],
    compoundWords: [
      {
        word: '木曜日',
        reading: 'もくようび',
        meaning: 'Thursday',
        kanji: ['木', '曜', '日'],
        difficulty: 2,
        examples: ['木曜日に映画を見ます。', '木曜日は半日です。'],
        relatedWords: ['水曜日', '金曜日', '土曜日']
      },
      {
        word: '木村',
        reading: 'きむら',
        meaning: 'Kimura (surname)',
        kanji: ['木', '村'],
        difficulty: 2,
        examples: ['木村さんは先生です。', '木村さんに会いました。'],
        relatedWords: ['村', '田村', '山田']
      },
      {
        word: '木造',
        reading: 'もくぞう',
        meaning: 'wooden',
        kanji: ['木', '造'],
        difficulty: 3,
        examples: ['この家は木造です。', '木造の建物が好きです。'],
        relatedWords: ['造る', '建築', '家']
      }
    ],
    difficulty: 'medium',
    category: 'nature',
    hint: 'Looks like a tree with branches',
    strokeCount: 4,
    radicals: ['木'],
    jlptLevel: 'N5'
  },
  {
    character: '金',
    english: 'gold, money',
    onyomi: ['キン', 'コン'],
    kunyomi: ['かね', 'かな'],
    examples: [
      { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
      { word: '金魚', reading: 'きんぎょ', meaning: 'goldfish' },
      { word: 'お金', reading: 'おかね', meaning: 'money' }
    ],
    compoundWords: [
      {
        word: '金曜日',
        reading: 'きんようび',
        meaning: 'Friday',
        kanji: ['金', '曜', '日'],
        difficulty: 2,
        examples: ['金曜日にパーティーがあります。', '金曜日は楽しいです。'],
        relatedWords: ['木曜日', '土曜日', '週末']
      },
      {
        word: '金魚',
        reading: 'きんぎょ',
        meaning: 'goldfish',
        kanji: ['金', '魚'],
        difficulty: 2,
        examples: ['金魚を飼っています。', '金魚が泳いでいます。'],
        relatedWords: ['魚', '水槽', 'ペット']
      },
      {
        word: 'お金',
        reading: 'おかね',
        meaning: 'money',
        kanji: ['金'],
        difficulty: 1,
        examples: ['お金がありません。', 'お金を払います。'],
        relatedWords: ['金', '銀行', '給料']
      }
    ],
    difficulty: 'medium',
    category: 'nature',
    hint: 'Looks like a treasure chest',
    strokeCount: 8,
    radicals: ['金'],
    jlptLevel: 'N5'
  },
  {
    character: '土',
    english: 'earth, soil',
    onyomi: ['ド', 'ト'],
    kunyomi: ['つち'],
    examples: [
      { word: '土曜日', reading: 'どようび', meaning: 'Saturday' },
      { word: '土地', reading: 'とち', meaning: 'land' },
      { word: '土産', reading: 'みやげ', meaning: 'souvenir' }
    ],
    compoundWords: [
      {
        word: '土曜日',
        reading: 'どようび',
        meaning: 'Saturday',
        kanji: ['土', '曜', '日'],
        difficulty: 2,
        examples: ['土曜日に買い物します。', '土曜日は休みです。'],
        relatedWords: ['金曜日', '日曜日', '週末']
      },
      {
        word: '土地',
        reading: 'とち',
        meaning: 'land',
        kanji: ['土', '地'],
        difficulty: 2,
        examples: ['この土地を買いました。', '土地の値段が高いです。'],
        relatedWords: ['地', '不動産', '家']
      },
      {
        word: '土産',
        reading: 'みやげ',
        meaning: 'souvenir',
        kanji: ['土', '産'],
        difficulty: 3,
        examples: ['土産を買いました。', '土産をあげます。'],
        relatedWords: ['産', 'お土産', '旅行']
      }
    ],
    difficulty: 'medium',
    category: 'nature',
    hint: 'Looks like soil in a field',
    strokeCount: 3,
    radicals: ['土'],
    jlptLevel: 'N5'
  },
  {
    character: '人',
    english: 'person',
    onyomi: ['ジン', 'ニン'],
    kunyomi: ['ひと'],
    examples: [
      { word: '日本人', reading: 'にほんじん', meaning: 'Japanese person' },
      { word: '一人', reading: 'ひとり', meaning: 'one person' },
      { word: '人口', reading: 'じんこう', meaning: 'population' }
    ],
    compoundWords: [
      {
        word: '日本人',
        reading: 'にほんじん',
        meaning: 'Japanese person',
        kanji: ['日', '本', '人'],
        difficulty: 2,
        examples: ['日本人です。', '日本人の友達がいます。'],
        relatedWords: ['日本', '人', '外国人']
      },
      {
        word: '一人',
        reading: 'ひとり',
        meaning: 'one person',
        kanji: ['一', '人'],
        difficulty: 1,
        examples: ['一人で行きます。', '一人暮らしです。'],
        relatedWords: ['一', '人', '二人']
      },
      {
        word: '人口',
        reading: 'じんこう',
        meaning: 'population',
        kanji: ['人', '口'],
        difficulty: 2,
        examples: ['人口が増えています。', '日本の人口は多いです。'],
        relatedWords: ['人', '口', '統計']
      }
    ],
    difficulty: 'medium',
    category: 'people',
    hint: 'Looks like a person walking',
    strokeCount: 2,
    radicals: ['人'],
    jlptLevel: 'N5'
  },
  {
    character: '口',
    english: 'mouth',
    onyomi: ['コウ', 'ク'],
    kunyomi: ['くち'],
    examples: [
      { word: '人口', reading: 'じんこう', meaning: 'population' },
      { word: '出口', reading: 'でぐち', meaning: 'exit' },
      { word: '入口', reading: 'いりぐち', meaning: 'entrance' }
    ],
    compoundWords: [
      {
        word: '人口',
        reading: 'じんこう',
        meaning: 'population',
        kanji: ['人', '口'],
        difficulty: 2,
        examples: ['人口が増えています。', '日本の人口は多いです。'],
        relatedWords: ['人', '口', '統計']
      },
      {
        word: '出口',
        reading: 'でぐち',
        meaning: 'exit',
        kanji: ['出', '口'],
        difficulty: 2,
        examples: ['出口はどこですか？', '出口から出ます。'],
        relatedWords: ['出る', '口', '入口']
      },
      {
        word: '入口',
        reading: 'いりぐち',
        meaning: 'entrance',
        kanji: ['入', '口'],
        difficulty: 2,
        examples: ['入口から入ります。', '入口が分かりません。'],
        relatedWords: ['入る', '口', '出口']
      }
    ],
    difficulty: 'medium',
    category: 'body',
    hint: 'Looks like an open mouth',
    strokeCount: 3,
    radicals: ['口'],
    jlptLevel: 'N5'
  },
  {
    character: '手',
    english: 'hand',
    onyomi: ['シュ'],
    kunyomi: ['て'],
    examples: [
      { word: '手紙', reading: 'てがみ', meaning: 'letter' },
      { word: '右手', reading: 'みぎて', meaning: 'right hand' },
      { word: '左手', reading: 'ひだりて', meaning: 'left hand' }
    ],
    compoundWords: [
      {
        word: '手紙',
        reading: 'てがみ',
        meaning: 'letter',
        kanji: ['手', '紙'],
        difficulty: 3,
        examples: ['手紙を書きます。', '手紙を受け取りました。'],
        relatedWords: ['手', '紙', 'メール']
      },
      {
        word: '右手',
        reading: 'みぎて',
        meaning: 'right hand',
        kanji: ['右', '手'],
        difficulty: 2,
        examples: ['右手で書きます。', '右手が痛いです。'],
        relatedWords: ['右', '手', '左手']
      },
      {
        word: '左手',
        reading: 'ひだりて',
        meaning: 'left hand',
        kanji: ['左', '手'],
        difficulty: 2,
        examples: ['左手で持っています。', '左手が利き手です。'],
        relatedWords: ['左', '手', '右手']
      }
    ],
    difficulty: 'hard',
    category: 'body',
    hint: 'Looks like a hand with fingers',
    strokeCount: 4,
    radicals: ['手'],
    jlptLevel: 'N5'
  },
  {
    character: '目',
    english: 'eye',
    onyomi: ['モク', 'ボク'],
    kunyomi: ['め'],
    examples: [
      { word: '目次', reading: 'もくじ', meaning: 'table of contents' },
      { word: '目的', reading: 'もくてき', meaning: 'purpose' },
      { word: '目玉', reading: 'めだま', meaning: 'eyeball' }
    ],
    compoundWords: [
      {
        word: '目次',
        reading: 'もくじ',
        meaning: 'table of contents',
        kanji: ['目', '次'],
        difficulty: 3,
        examples: ['目次を見てください。', '目次が分かりやすいです。'],
        relatedWords: ['目', '次', '内容']
      },
      {
        word: '目的',
        reading: 'もくてき',
        meaning: 'purpose',
        kanji: ['目', '的'],
        difficulty: 3,
        examples: ['目的を達成しました。', '目的が明確です。'],
        relatedWords: ['目', '的', '目標']
      },
      {
        word: '目玉',
        reading: 'めだま',
        meaning: 'eyeball',
        kanji: ['目', '玉'],
        difficulty: 2,
        examples: ['目玉が大きいです。', '目玉焼きを作ります。'],
        relatedWords: ['目', '玉', '眼']
      }
    ],
    difficulty: 'hard',
    category: 'body',
    hint: 'Looks like an eye with eyelashes',
    strokeCount: 5,
    radicals: ['目'],
    jlptLevel: 'N5'
  },
  {
    character: '耳',
    english: 'ear',
    onyomi: ['ジ'],
    kunyomi: ['みみ'],
    examples: [
      { word: '耳鼻科', reading: 'じびか', meaning: 'ear, nose, and throat' },
      { word: '耳鳴り', reading: 'みみなり', meaning: 'ringing in ears' },
      { word: '耳元', reading: 'みみもと', meaning: 'close to ear' }
    ],
    compoundWords: [
      {
        word: '耳鼻科',
        reading: 'じびか',
        meaning: 'ear, nose, and throat',
        kanji: ['耳', '鼻', '科'],
        difficulty: 3,
        examples: ['耳鼻科に行きます。', '耳鼻科の先生です。'],
        relatedWords: ['耳', '鼻', '科']
      },
      {
        word: '耳鳴り',
        reading: 'みみなり',
        meaning: 'ringing in ears',
        kanji: ['耳', '鳴'],
        difficulty: 3,
        examples: ['耳鳴りがします。', '耳鳴りが止まりません。'],
        relatedWords: ['耳', '鳴る', '音']
      },
      {
        word: '耳元',
        reading: 'みみもと',
        meaning: 'close to ear',
        kanji: ['耳', '元'],
        difficulty: 3,
        examples: ['耳元で話します。', '耳元に近づきます。'],
        relatedWords: ['耳', '元', '近い']
      }
    ],
    difficulty: 'hard',
    category: 'body',
    hint: 'Looks like an ear',
    strokeCount: 6,
    radicals: ['耳'],
    jlptLevel: 'N5'
  },
  {
    character: '足',
    english: 'foot, leg',
    onyomi: ['ソク'],
    kunyomi: ['あし'],
    examples: [
      { word: '足音', reading: 'あしおと', meaning: 'footsteps' },
      { word: '手足', reading: 'てあし', meaning: 'hands and feet' },
      { word: '足跡', reading: 'あしあと', meaning: 'footprints' }
    ],
    compoundWords: [
      {
        word: '足音',
        reading: 'あしおと',
        meaning: 'footsteps',
        kanji: ['足', '音'],
        difficulty: 2,
        examples: ['足音が聞こえます。', '足音を立てないでください。'],
        relatedWords: ['足', '音', '歩く']
      },
      {
        word: '手足',
        reading: 'てあし',
        meaning: 'hands and feet',
        kanji: ['手', '足'],
        difficulty: 2,
        examples: ['手足が冷たいです。', '手足を動かします。'],
        relatedWords: ['手', '足', '体']
      },
      {
        word: '足跡',
        reading: 'あしあと',
        meaning: 'footprints',
        kanji: ['足', '跡'],
        difficulty: 3,
        examples: ['足跡が残っています。', '足跡を追います。'],
        relatedWords: ['足', '跡', '印']
      }
    ],
    difficulty: 'medium',
    category: 'body',
    hint: 'Looks like a foot with toes',
    strokeCount: 7,
    radicals: ['足'],
    jlptLevel: 'N5'
  },
  {
    character: '山',
    english: 'mountain',
    onyomi: ['サン'],
    kunyomi: ['やま'],
    examples: [
      { word: '富士山', reading: 'ふじさん', meaning: 'Mount Fuji' },
      { word: '火山', reading: 'かざん', meaning: 'volcano' },
      { word: '山登り', reading: 'やまのぼり', meaning: 'mountain climbing' }
    ],
    difficulty: 'easy',
    category: 'nature',
    hint: 'Looks like three mountain peaks',
    strokeCount: 3,
    radicals: ['山'],
    jlptLevel: 'N5'
  },
  {
    character: '川',
    english: 'river',
    onyomi: ['セン'],
    kunyomi: ['かわ'],
    examples: [
      { word: '川辺', reading: 'かわべ', meaning: 'riverside' },
      { word: '川下り', reading: 'かわくだり', meaning: 'river rafting' },
      { word: '川原', reading: 'かわら', meaning: 'riverbed' }
    ],
    difficulty: 'easy',
    category: 'nature',
    hint: 'Looks like flowing water',
    strokeCount: 3,
    radicals: ['川'],
    jlptLevel: 'N5'
  },
  {
    character: '田',
    english: 'rice field',
    onyomi: ['デン'],
    kunyomi: ['た'],
    examples: [
      { word: '田舎', reading: 'いなか', meaning: 'countryside' },
      { word: '田園', reading: 'でんえん', meaning: 'rural area' },
      { word: '田植え', reading: 'たうえ', meaning: 'rice planting' }
    ],
    difficulty: 'easy',
    category: 'nature',
    hint: 'Looks like a rice field divided into sections',
    strokeCount: 5,
    radicals: ['田'],
    jlptLevel: 'N5'
  },
  {
    character: '中',
    english: 'middle, inside',
    onyomi: ['チュウ'],
    kunyomi: ['なか'],
    examples: [
      { word: '中国', reading: 'ちゅうごく', meaning: 'China' },
      { word: '中心', reading: 'ちゅうしん', meaning: 'center' },
      { word: '中止', reading: 'ちゅうし', meaning: 'cancellation' }
    ],
    difficulty: 'easy',
    category: 'position',
    hint: 'Looks like a line through the middle',
    strokeCount: 4,
    radicals: ['中'],
    jlptLevel: 'N5'
  },
  {
    character: '大',
    english: 'big, large',
    onyomi: ['ダイ', 'タイ'],
    kunyomi: ['おお'],
    examples: [
      { word: '大学', reading: 'だいがく', meaning: 'university' },
      { word: '大人', reading: 'おとな', meaning: 'adult' },
      { word: '大好き', reading: 'だいすき', meaning: 'really like' }
    ],
    difficulty: 'easy',
    category: 'size',
    hint: 'Looks like a person with arms spread wide',
    strokeCount: 3,
    radicals: ['大'],
    jlptLevel: 'N5'
  },
  {
    character: '小',
    english: 'small',
    onyomi: ['ショウ'],
    kunyomi: ['ちい', 'こ'],
    examples: [
      { word: '小学校', reading: 'しょうがっこう', meaning: 'elementary school' },
      { word: '小さい', reading: 'ちいさい', meaning: 'small' },
      { word: '小鳥', reading: 'ことり', meaning: 'small bird' }
    ],
    difficulty: 'easy',
    category: 'size',
    hint: 'Looks like something small',
    strokeCount: 3,
    radicals: ['小'],
    jlptLevel: 'N5'
  },
  {
    character: '上',
    english: 'up, above',
    onyomi: ['ジョウ', 'ショウ'],
    kunyomi: ['うえ', 'あ'],
    examples: [
      { word: '上手', reading: 'じょうず', meaning: 'skillful' },
      { word: '上着', reading: 'うわぎ', meaning: 'jacket' },
      { word: '上達', reading: 'じょうたつ', meaning: 'improvement' }
    ],
    difficulty: 'easy',
    category: 'position',
    hint: 'Looks like something pointing upward',
    strokeCount: 3,
    radicals: ['上'],
    jlptLevel: 'N5'
  },
  {
    character: '下',
    english: 'down, below',
    onyomi: ['カ', 'ゲ'],
    kunyomi: ['した', 'くだ'],
    examples: [
      { word: '下手', reading: 'へた', meaning: 'unskillful' },
      { word: '下着', reading: 'したぎ', meaning: 'underwear' },
      { word: '下車', reading: 'げしゃ', meaning: 'getting off a vehicle' }
    ],
    difficulty: 'easy',
    category: 'position',
    hint: 'Looks like something pointing downward',
    strokeCount: 3,
    radicals: ['下'],
    jlptLevel: 'N5'
  },
  {
    character: '一',
    english: 'one',
    onyomi: ['イチ', 'イツ'],
    kunyomi: ['ひと'],
    examples: [
      { word: '一人', reading: 'ひとり', meaning: 'one person' },
      { word: '一月', reading: 'いちがつ', meaning: 'January' },
      { word: '一日', reading: 'いちにち', meaning: 'one day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Just one line',
    strokeCount: 1,
    radicals: ['一'],
    jlptLevel: 'N5'
  },
  {
    character: '二',
    english: 'two',
    onyomi: ['ニ'],
    kunyomi: ['ふた'],
    examples: [
      { word: '二人', reading: 'ふたり', meaning: 'two people' },
      { word: '二月', reading: 'にがつ', meaning: 'February' },
      { word: '二日', reading: 'ふつか', meaning: 'second day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Two parallel lines',
    strokeCount: 2,
    radicals: ['二'],
    jlptLevel: 'N5'
  },
  {
    character: '三',
    english: 'three',
    onyomi: ['サン'],
    kunyomi: ['み'],
    examples: [
      { word: '三人', reading: 'さんにん', meaning: 'three people' },
      { word: '三月', reading: 'さんがつ', meaning: 'March' },
      { word: '三日', reading: 'みっか', meaning: 'third day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Three parallel lines',
    strokeCount: 3,
    radicals: ['三'],
    jlptLevel: 'N5'
  },
  {
    character: '四',
    english: 'four',
    onyomi: ['シ'],
    kunyomi: ['よ', 'よん'],
    examples: [
      { word: '四人', reading: 'よにん', meaning: 'four people' },
      { word: '四月', reading: 'しがつ', meaning: 'April' },
      { word: '四日', reading: 'よっか', meaning: 'fourth day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a box with a line inside',
    strokeCount: 5,
    radicals: ['四'],
    jlptLevel: 'N5'
  },
  {
    character: '五',
    english: 'five',
    onyomi: ['ゴ'],
    kunyomi: ['いつ'],
    examples: [
      { word: '五人', reading: 'ごにん', meaning: 'five people' },
      { word: '五月', reading: 'ごがつ', meaning: 'May' },
      { word: '五日', reading: 'いつか', meaning: 'fifth day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a hand with five fingers',
    strokeCount: 4,
    radicals: ['五'],
    jlptLevel: 'N5'
  },
  {
    character: '六',
    english: 'six',
    onyomi: ['ロク'],
    kunyomi: ['む'],
    examples: [
      { word: '六人', reading: 'ろくにん', meaning: 'six people' },
      { word: '六月', reading: 'ろくがつ', meaning: 'June' },
      { word: '六日', reading: 'むいか', meaning: 'sixth day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a roof with a line underneath',
    strokeCount: 6,
    radicals: ['六'],
    jlptLevel: 'N5'
  },
  {
    character: '七',
    english: 'seven',
    onyomi: ['シチ'],
    kunyomi: ['なな'],
    examples: [
      { word: '七人', reading: 'しちにん', meaning: 'seven people' },
      { word: '七月', reading: 'しちがつ', meaning: 'July' },
      { word: '七日', reading: 'なのか', meaning: 'seventh day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a cross with a line',
    strokeCount: 4,
    radicals: ['七'],
    jlptLevel: 'N5'
  },
  {
    character: '八',
    english: 'eight',
    onyomi: ['ハチ'],
    kunyomi: ['や'],
    examples: [
      { word: '八人', reading: 'はちにん', meaning: 'eight people' },
      { word: '八月', reading: 'はちがつ', meaning: 'August' },
      { word: '八日', reading: 'ようか', meaning: 'eighth day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like two lines spreading apart',
    strokeCount: 5,
    radicals: ['八'],
    jlptLevel: 'N5'
  },
  {
    character: '九',
    english: 'nine',
    onyomi: ['キュウ', 'ク'],
    kunyomi: ['ここの'],
    examples: [
      { word: '九人', reading: 'きゅうにん', meaning: 'nine people' },
      { word: '九月', reading: 'くがつ', meaning: 'September' },
      { word: '九日', reading: 'ここのか', meaning: 'ninth day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a hook',
    strokeCount: 9,
    radicals: ['九'],
    jlptLevel: 'N5'
  },
  {
    character: '十',
    english: 'ten',
    onyomi: ['ジュウ', 'ジッ'],
    kunyomi: ['とお'],
    examples: [
      { word: '十人', reading: 'じゅうにん', meaning: 'ten people' },
      { word: '十月', reading: 'じゅうがつ', meaning: 'October' },
      { word: '十日', reading: 'とおか', meaning: 'tenth day' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a plus sign',
    strokeCount: 4,
    radicals: ['十'],
    jlptLevel: 'N5'
  },
  {
    character: '百',
    english: 'hundred',
    onyomi: ['ヒャク'],
    kunyomi: ['もも'],
    examples: [
      { word: '百円', reading: 'ひゃくえん', meaning: '100 yen' },
      { word: '百貨店', reading: 'ひゃっかてん', meaning: 'department store' },
      { word: '百倍', reading: 'ひゃくばい', meaning: 'hundredfold' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a one with a line on top',
    strokeCount: 6,
    radicals: ['百'],
    jlptLevel: 'N5'
  },
  {
    character: '千',
    english: 'thousand',
    onyomi: ['セン'],
    kunyomi: ['ち'],
    examples: [
      { word: '千円', reading: 'せんえん', meaning: '1000 yen' },
      { word: '千葉', reading: 'ちば', meaning: 'Chiba (prefecture)' },
      { word: '千代', reading: 'ちよ', meaning: 'thousand years' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a person with a line on top',
    strokeCount: 3,
    radicals: ['千'],
    jlptLevel: 'N5'
  },
  {
    character: '万',
    english: 'ten thousand',
    onyomi: ['マン', 'バン'],
    kunyomi: ['よろず'],
    examples: [
      { word: '一万円', reading: 'いちまんえん', meaning: '10,000 yen' },
      { word: '万年筆', reading: 'まんねんひつ', meaning: 'fountain pen' },
      { word: '万国', reading: 'ばんこく', meaning: 'all nations' }
    ],
    difficulty: 'easy',
    category: 'numbers',
    hint: 'Looks like a box with a line inside',
    strokeCount: 3,
    radicals: ['万'],
    jlptLevel: 'N5'
  },
  {
    character: '円',
    english: 'circle, yen',
    onyomi: ['エン'],
    kunyomi: ['まる'],
    examples: [
      { word: '円形', reading: 'えんけい', meaning: 'circular' },
      { word: '円周', reading: 'えんしゅう', meaning: 'circumference' },
      { word: '円満', reading: 'えんまん', meaning: 'harmonious' }
    ],
    difficulty: 'easy',
    category: 'currency',
    hint: 'Looks like a circle',
    strokeCount: 3,
    radicals: ['円'],
    jlptLevel: 'N5'
  },
  {
    character: '年',
    english: 'year',
    onyomi: ['ネン'],
    kunyomi: ['とし'],
    examples: [
      { word: '今年', reading: 'ことし', meaning: 'this year' },
      { word: '去年', reading: 'きょねん', meaning: 'last year' },
      { word: '来年', reading: 'らいねん', meaning: 'next year' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a person with a line on top',
    strokeCount: 6,
    radicals: ['年'],
    jlptLevel: 'N5'
  },
  {
    character: '月',
    english: 'month, moon',
    onyomi: ['ゲツ', 'ガツ'],
    kunyomi: ['つき'],
    examples: [
      { word: '一月', reading: 'いちがつ', meaning: 'January' },
      { word: '今月', reading: 'こんげつ', meaning: 'this month' },
      { word: '月見', reading: 'つきみ', meaning: 'moon viewing' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a crescent moon',
    strokeCount: 4,
    radicals: ['月'],
    jlptLevel: 'N5'
  },
  {
    character: '日',
    english: 'day, sun',
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', 'か'],
    examples: [
      { word: '今日', reading: 'きょう', meaning: 'today' },
      { word: '昨日', reading: 'きのう', meaning: 'yesterday' },
      { word: '明日', reading: 'あした', meaning: 'tomorrow' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a sun with rays',
    strokeCount: 4,
    radicals: ['日'],
    jlptLevel: 'N5'
  },
  {
    character: '時',
    english: 'time, hour',
    onyomi: ['ジ'],
    kunyomi: ['とき'],
    examples: [
      { word: '時間', reading: 'じかん', meaning: 'time' },
      { word: '時計', reading: 'とけい', meaning: 'clock' },
      { word: '一時', reading: 'いちじ', meaning: 'one o\'clock' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a sun with a line',
    strokeCount: 7,
    radicals: ['時'],
    jlptLevel: 'N5'
  },
  {
    character: '分',
    english: 'minute, part',
    onyomi: ['ブン', 'フン'],
    kunyomi: ['わ'],
    examples: [
      { word: '分かる', reading: 'わかる', meaning: 'to understand' },
      { word: '自分', reading: 'じぶん', meaning: 'oneself' },
      { word: '十分', reading: 'じゅうぶん', meaning: 'sufficient' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a knife cutting something',
    strokeCount: 4,
    radicals: ['分'],
    jlptLevel: 'N5'
  },
  {
    character: '今',
    english: 'now',
    onyomi: ['コン', 'キン'],
    kunyomi: ['いま'],
    examples: [
      { word: '今日', reading: 'きょう', meaning: 'today' },
      { word: '今月', reading: 'こんげつ', meaning: 'this month' },
      { word: '今年', reading: 'ことし', meaning: 'this year' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a person with a line on top',
    strokeCount: 9,
    radicals: ['今'],
    jlptLevel: 'N5'
  },
  {
    character: '先',
    english: 'previous, ahead',
    onyomi: ['セン'],
    kunyomi: ['さき'],
    examples: [
      { word: '先生', reading: 'せんせい', meaning: 'teacher' },
      { word: '先週', reading: 'せんしゅう', meaning: 'last week' },
      { word: '先月', reading: 'せんげつ', meaning: 'last month' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a person with a line on top',
    strokeCount: 6,
    radicals: ['先'],
    jlptLevel: 'N5'
  },
  {
    character: '後',
    english: 'after, behind',
    onyomi: ['ゴ', 'コウ'],
    kunyomi: ['あと', 'うし'],
    examples: [
      { word: '午後', reading: 'ごご', meaning: 'afternoon' },
      { word: '後ろ', reading: 'うしろ', meaning: 'behind' },
      { word: '最後', reading: 'さいご', meaning: 'last' }
    ],
    difficulty: 'easy',
    category: 'time',
    hint: 'Looks like a person with a line on top',
    strokeCount: 6,
    radicals: ['後'],
    jlptLevel: 'N5'
  }
]; 