export type Difficulty = 'easy' | 'medium' | 'hard';
export type KanjiCategory = 'nature' | 'people' | 'body' | 'numbers' | 'time' | 'position' | 'size' | 'currency';

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
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
    difficulty: 'easy',
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
    difficulty: 'easy',
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
    difficulty: 'easy',
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
    difficulty: 'easy',
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
    difficulty: 'easy',
    category: 'people',
    hint: 'Looks like a person walking',
    strokeCount: 4,
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
    difficulty: 'easy',
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
      { word: '上手', reading: 'じょうず', meaning: 'skillful' },
      { word: '下手', reading: 'へた', meaning: 'unskillful' },
      { word: '手紙', reading: 'てがみ', meaning: 'letter' }
    ],
    difficulty: 'easy',
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
      { word: '目的', reading: 'もくてき', meaning: 'purpose' },
      { word: '目次', reading: 'もくじ', meaning: 'table of contents' },
      { word: '目玉', reading: 'めだま', meaning: 'eyeball' }
    ],
    difficulty: 'easy',
    category: 'body',
    hint: 'Looks like an eye with eyelashes',
    strokeCount: 4,
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
    difficulty: 'easy',
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
    kunyomi: ['あし', 'た'],
    examples: [
      { word: '足音', reading: 'あしおと', meaning: 'footsteps' },
      { word: '足跡', reading: 'あしあと', meaning: 'footprints' },
      { word: '満足', reading: 'まんぞく', meaning: 'satisfaction' }
    ],
    difficulty: 'easy',
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
  },
  {
    character: '開',
    english: 'open, unfold',
    onyomi: ['カイ'],
    kunyomi: ['あ', 'ひら'],
    examples: [
      { word: '開始', reading: 'かいし', meaning: 'start, beginning' },
      { word: '開店', reading: 'かいてん', meaning: 'store opening' },
      { word: '開く', reading: 'あく', meaning: 'to open' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a door opening',
    strokeCount: 12,
    radicals: ['門', '干'],
    jlptLevel: 'N4'
  },
  {
    character: '閉',
    english: 'close, shut',
    onyomi: ['ヘイ'],
    kunyomi: ['し', 'と'],
    examples: [
      { word: '閉店', reading: 'へいてん', meaning: 'store closing' },
      { word: '閉じる', reading: 'とじる', meaning: 'to close' },
      { word: '閉める', reading: 'しめる', meaning: 'to shut' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a door closing',
    strokeCount: 11,
    radicals: ['門', '才'],
    jlptLevel: 'N4'
  },
  {
    character: '始',
    english: 'begin, start',
    onyomi: ['シ'],
    kunyomi: ['はじ'],
    examples: [
      { word: '開始', reading: 'かいし', meaning: 'start, beginning' },
      { word: '始める', reading: 'はじめる', meaning: 'to begin' },
      { word: '始まる', reading: 'はじまる', meaning: 'to start' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a woman starting something',
    strokeCount: 8,
    radicals: ['女', '台'],
    jlptLevel: 'N4'
  },
  {
    character: '終',
    english: 'end, finish',
    onyomi: ['シュウ'],
    kunyomi: ['お'],
    examples: [
      { word: '終了', reading: 'しゅうりょう', meaning: 'end, conclusion' },
      { word: '終わる', reading: 'おわる', meaning: 'to end' },
      { word: '終える', reading: 'おえる', meaning: 'to finish' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a thread being tied off',
    strokeCount: 11,
    radicals: ['糸', '冬'],
    jlptLevel: 'N4'
  },
  {
    character: '帰',
    english: 'return, go back',
    onyomi: ['キ'],
    kunyomi: ['かえ'],
    examples: [
      { word: '帰国', reading: 'きこく', meaning: 'return to one\'s country' },
      { word: '帰る', reading: 'かえる', meaning: 'to return' },
      { word: '帰宅', reading: 'きたく', meaning: 'returning home' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a person returning home',
    strokeCount: 10,
    radicals: ['止', '帚'],
    jlptLevel: 'N4'
  },
  {
    character: '起',
    english: 'wake up, rise',
    onyomi: ['キ'],
    kunyomi: ['お'],
    examples: [
      { word: '起床', reading: 'きしょう', meaning: 'waking up' },
      { word: '起きる', reading: 'おきる', meaning: 'to wake up' },
      { word: '起こす', reading: 'おこす', meaning: 'to wake someone up' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a person getting up',
    strokeCount: 10,
    radicals: ['走', '己'],
    jlptLevel: 'N4'
  },
  {
    character: '寝',
    english: 'sleep, lie down',
    onyomi: ['シン'],
    kunyomi: ['ね'],
    examples: [
      { word: '就寝', reading: 'しゅうしん', meaning: 'going to bed' },
      { word: '寝る', reading: 'ねる', meaning: 'to sleep' },
      { word: '寝室', reading: 'しんしつ', meaning: 'bedroom' }
    ],
    difficulty: 'intermediate',
    category: 'action',
    hint: 'Looks like a person lying down',
    strokeCount: 13,
    radicals: ['宀', '爿'],
    jlptLevel: 'N4'
  },
  {
    character: '食',
    english: 'eat, food',
    onyomi: ['ショク'],
    kunyomi: ['た', 'く'],
    examples: [
      { word: '食事', reading: 'しょくじ', meaning: 'meal' },
      { word: '食べる', reading: 'たべる', meaning: 'to eat' },
      { word: '食堂', reading: 'しょくどう', meaning: 'dining room' }
    ],
    difficulty: 'intermediate',
    category: 'food',
    hint: 'Looks like a person eating',
    strokeCount: 9,
    radicals: ['食'],
    jlptLevel: 'N4'
  },
  {
    character: '飲',
    english: 'drink',
    onyomi: ['イン'],
    kunyomi: ['の'],
    examples: [
      { word: '飲料', reading: 'いんりょう', meaning: 'beverage' },
      { word: '飲む', reading: 'のむ', meaning: 'to drink' },
      { word: '飲み物', reading: 'のみもの', meaning: 'drink, beverage' }
    ],
    difficulty: 'intermediate',
    category: 'food',
    hint: 'Looks like a person drinking',
    strokeCount: 12,
    radicals: ['食', '欠'],
    jlptLevel: 'N4'
  },
  {
    character: '買',
    english: 'buy',
    onyomi: ['バイ'],
    kunyomi: ['か'],
    examples: [
      { word: '購入', reading: 'こうにゅう', meaning: 'purchase' },
      { word: '買う', reading: 'かう', meaning: 'to buy' },
      { word: '買い物', reading: 'かいもの', meaning: 'shopping' }
    ],
    difficulty: 'intermediate',
    category: 'commerce',
    hint: 'Looks like a person buying something',
    strokeCount: 12,
    radicals: ['貝', '目'],
    jlptLevel: 'N4'
  },
  {
    character: '電',
    english: 'electricity',
    onyomi: ['デン'],
    kunyomi: [],
    examples: [
      { word: '電車', reading: 'でんしゃ', meaning: 'train' },
      { word: '電気', reading: 'でんき', meaning: 'electricity' },
      { word: '電話', reading: 'でんわ', meaning: 'telephone' }
    ],
    difficulty: 'intermediate',
    category: 'technology',
    hint: 'Looks like rain with electricity',
    strokeCount: 13,
    radicals: ['雨', '田'],
    jlptLevel: 'N4'
  },
  {
    character: '駅',
    english: 'station',
    onyomi: ['エキ'],
    kunyomi: [],
    examples: [
      { word: '駅前', reading: 'えきまえ', meaning: 'in front of the station' },
      { word: '駅員', reading: 'えきいん', meaning: 'station staff' },
      { word: '駅長', reading: 'えきちょう', meaning: 'station master' }
    ],
    difficulty: 'intermediate',
    category: 'transportation',
    hint: 'Looks like a train station with tracks',
    strokeCount: 14,
    radicals: ['馬', '尺'],
    jlptLevel: 'N4'
  },
  {
    character: '楽',
    english: 'music, comfort, ease',
    onyomi: ['ガク', 'ラク'],
    kunyomi: ['たの'],
    examples: [
      { word: '音楽', reading: 'おんがく', meaning: 'music' },
      { word: '楽しい', reading: 'たのしい', meaning: 'enjoyable' },
      { word: '楽器', reading: 'がっき', meaning: 'musical instrument' }
    ],
    difficulty: 'intermediate',
    category: 'emotion',
    hint: 'Looks like a tree with music notes',
    strokeCount: 13,
    radicals: ['木', '白'],
    jlptLevel: 'N4'
  },
  {
    character: '悲',
    english: 'sad, sorrow',
    onyomi: ['ヒ'],
    kunyomi: ['かな'],
    examples: [
      { word: '悲しい', reading: 'かなしい', meaning: 'sad' },
      { word: '悲劇', reading: 'ひげき', meaning: 'tragedy' },
      { word: '悲観', reading: 'ひかん', meaning: 'pessimism' }
    ],
    difficulty: 'intermediate',
    category: 'emotion',
    hint: 'Looks like a heart with sadness',
    strokeCount: 12,
    radicals: ['心', '非'],
    jlptLevel: 'N4'
  },
  {
    character: '怒',
    english: 'anger, rage',
    onyomi: ['ド'],
    kunyomi: ['いか', 'おこ'],
    examples: [
      { word: '怒る', reading: 'おこる', meaning: 'to get angry' },
      { word: '怒り', reading: 'いかり', meaning: 'anger' },
      { word: '激怒', reading: 'げきど', meaning: 'rage' }
    ],
    difficulty: 'intermediate',
    category: 'emotion',
    hint: 'Looks like a slave with anger',
    strokeCount: 9,
    radicals: ['奴', '心'],
    jlptLevel: 'N4'
  },
  {
    character: '喜',
    english: 'joy, rejoice',
    onyomi: ['キ'],
    kunyomi: ['よろこ'],
    examples: [
      { word: '喜ぶ', reading: 'よろこぶ', meaning: 'to be happy' },
      { word: '喜劇', reading: 'きげき', meaning: 'comedy' },
      { word: '歓喜', reading: 'かんき', meaning: 'delight' }
    ],
    difficulty: 'intermediate',
    category: 'emotion',
    hint: 'Looks like a drum with joy',
    strokeCount: 12,
    radicals: ['士', '口'],
    jlptLevel: 'N4'
  },
  {
    character: '怖',
    english: 'fear, afraid',
    onyomi: ['フ'],
    kunyomi: ['こわ'],
    examples: [
      { word: '怖い', reading: 'こわい', meaning: 'scary' },
      { word: '恐怖', reading: 'きょうふ', meaning: 'fear' },
      { word: '怖がる', reading: 'こわがる', meaning: 'to be afraid' }
    ],
    difficulty: 'intermediate',
    category: 'emotion',
    hint: 'Looks like a heart with fear',
    strokeCount: 8,
    radicals: ['心', '布'],
    jlptLevel: 'N4'
  },
  {
    character: '驚',
    english: 'surprise, astonish',
    onyomi: ['キョウ'],
    kunyomi: ['おどろ'],
    examples: [
      { word: '驚く', reading: 'おどろく', meaning: 'to be surprised' },
      { word: '驚異', reading: 'きょうい', meaning: 'wonder' },
      { word: '驚愕', reading: 'きょうがく', meaning: 'amazement' }
    ],
    difficulty: 'hard',
    category: 'emotion',
    hint: 'Looks like a horse with surprise',
    strokeCount: 22,
    radicals: ['馬', '敬'],
    jlptLevel: 'N3'
  },
  {
    character: '優',
    english: 'gentle, superior',
    onyomi: ['ユウ'],
    kunyomi: ['やさ', 'すぐ'],
    examples: [
      { word: '優しい', reading: 'やさしい', meaning: 'kind, gentle' },
      { word: '優秀', reading: 'ゆうしゅう', meaning: 'excellence' },
      { word: '優勝', reading: 'ゆうしょう', meaning: 'championship' }
    ],
    difficulty: 'hard',
    category: 'emotion',
    hint: 'Looks like a person with excellence',
    strokeCount: 17,
    radicals: ['人', '憂'],
    jlptLevel: 'N3'
  },
  {
    character: '複',
    english: 'duplicate, complex',
    onyomi: ['フク'],
    kunyomi: [],
    examples: [
      { word: '複雑', reading: 'ふくざつ', meaning: 'complex' },
      { word: '複数', reading: 'ふくすう', meaning: 'plural' },
      { word: '複製', reading: 'ふくせい', meaning: 'reproduction' }
    ],
    difficulty: 'hard',
    category: 'concept',
    hint: 'Looks like clothes being folded',
    strokeCount: 14,
    radicals: ['衣', '复'],
    jlptLevel: 'N3'
  },
  {
    character: '確',
    english: 'certain, confirm',
    onyomi: ['カク'],
    kunyomi: ['たし'],
    examples: [
      { word: '確か', reading: 'たしか', meaning: 'certain' },
      { word: '確認', reading: 'かくにん', meaning: 'confirmation' },
      { word: '確実', reading: 'かくじつ', meaning: 'certainty' }
    ],
    difficulty: 'hard',
    category: 'concept',
    hint: 'Looks like a stone being confirmed',
    strokeCount: 15,
    radicals: ['石', '隺'],
    jlptLevel: 'N3'
  },
  {
    character: '効',
    english: 'effect, efficacy',
    onyomi: ['コウ'],
    kunyomi: ['き'],
    examples: [
      { word: '効果', reading: 'こうか', meaning: 'effect' },
      { word: '効力', reading: 'こうりょく', meaning: 'efficacy' },
      { word: '効率', reading: 'こうりつ', meaning: 'efficiency' }
    ],
    difficulty: 'hard',
    category: 'concept',
    hint: 'Looks like power with effect',
    strokeCount: 8,
    radicals: ['力', '交'],
    jlptLevel: 'N3'
  },
  {
    character: '証',
    english: 'evidence, proof',
    onyomi: ['ショウ'],
    kunyomi: ['あかし'],
    examples: [
      { word: '証明', reading: 'しょうめい', meaning: 'proof' },
      { word: '証拠', reading: 'しょうこ', meaning: 'evidence' },
      { word: '証券', reading: 'しょうけん', meaning: 'security' }
    ],
    difficulty: 'hard',
    category: 'concept',
    hint: 'Looks like words being verified',
    strokeCount: 12,
    radicals: ['言', '正'],
    jlptLevel: 'N3'
  },
  {
    character: '策',
    english: 'plan, scheme',
    onyomi: ['サク'],
    kunyomi: [],
    examples: [
      { word: '政策', reading: 'せいさく', meaning: 'policy' },
      { word: '対策', reading: 'たいさく', meaning: 'countermeasure' },
      { word: '策略', reading: 'さくりゃく', meaning: 'strategy' }
    ],
    difficulty: 'hard',
    category: 'concept',
    hint: 'Looks like bamboo with a plan',
    strokeCount: 12,
    radicals: ['竹', '朿'],
    jlptLevel: 'N3'
  },
  {
    character: '校',
    english: 'school',
    onyomi: ['コウ'],
    kunyomi: [],
    examples: [
      { word: '学校', reading: 'がっこう', meaning: 'school' },
      { word: '校長', reading: 'こうちょう', meaning: 'principal' },
      { word: '校舎', reading: 'こうしゃ', meaning: 'school building' }
    ],
    difficulty: 'intermediate',
    category: 'education',
    hint: 'Looks like a tree with a cross',
    strokeCount: 10,
    radicals: ['木', '交'],
    jlptLevel: 'N4'
  },
  {
    character: '習',
    english: 'learn, practice',
    onyomi: ['シュウ'],
    kunyomi: ['なら'],
    examples: [
      { word: '練習', reading: 'れんしゅう', meaning: 'practice' },
      { word: '学習', reading: 'がくしゅう', meaning: 'study' },
      { word: '習う', reading: 'ならう', meaning: 'to learn' }
    ],
    difficulty: 'intermediate',
    category: 'education',
    hint: 'Looks like wings learning to fly',
    strokeCount: 11,
    radicals: ['羽', '白'],
    jlptLevel: 'N4'
  },
  {
    character: '宿',
    english: 'inn, lodging',
    onyomi: ['シュク'],
    kunyomi: ['やど'],
    examples: [
      { word: '宿題', reading: 'しゅくだい', meaning: 'homework' },
      { word: '宿泊', reading: 'しゅくはく', meaning: 'lodging' },
      { word: '下宿', reading: 'げしゅく', meaning: 'boarding house' }
    ],
    difficulty: 'intermediate',
    category: 'daily',
    hint: 'Looks like a house with people',
    strokeCount: 11,
    radicals: ['宀', '人'],
    jlptLevel: 'N4'
  },
  {
    character: '洗',
    english: 'wash',
    onyomi: ['セン'],
    kunyomi: ['あら'],
    examples: [
      { word: '洗濯', reading: 'せんたく', meaning: 'laundry' },
      { word: '洗う', reading: 'あらう', meaning: 'to wash' },
      { word: '洗面', reading: 'せんめん', meaning: 'washing face' }
    ],
    difficulty: 'intermediate',
    category: 'daily',
    hint: 'Looks like water washing something',
    strokeCount: 9,
    radicals: ['氵', '先'],
    jlptLevel: 'N4'
  },
  {
    character: '掃',
    english: 'sweep',
    onyomi: ['ソウ'],
    kunyomi: ['は'],
    examples: [
      { word: '掃除', reading: 'そうじ', meaning: 'cleaning' },
      { word: '掃く', reading: 'はく', meaning: 'to sweep' },
      { word: '掃引', reading: 'そういん', meaning: 'scanning' }
    ],
    difficulty: 'intermediate',
    category: 'daily',
    hint: 'Looks like a hand with a broom',
    strokeCount: 11,
    radicals: ['扌', '帚'],
    jlptLevel: 'N4'
  },
  {
    character: '会',
    english: 'meeting, society',
    onyomi: ['カイ', 'エ'],
    kunyomi: ['あ'],
    examples: [
      { word: '会社', reading: 'かいしゃ', meaning: 'company' },
      { word: '会議', reading: 'かいぎ', meaning: 'meeting' },
      { word: '会う', reading: 'あう', meaning: 'to meet' }
    ],
    difficulty: 'intermediate',
    category: 'business',
    hint: 'Looks like people gathering',
    strokeCount: 6,
    radicals: ['人', '云'],
    jlptLevel: 'N4'
  },
  {
    character: '社',
    english: 'company, shrine',
    onyomi: ['シャ'],
    kunyomi: ['やしろ'],
    examples: [
      { word: '会社', reading: 'かいしゃ', meaning: 'company' },
      { word: '社長', reading: 'しゃちょう', meaning: 'company president' },
      { word: '神社', reading: 'じんじゃ', meaning: 'shrine' }
    ],
    difficulty: 'intermediate',
    category: 'business',
    hint: 'Looks like a shrine with a roof',
    strokeCount: 7,
    radicals: ['示', '土'],
    jlptLevel: 'N4'
  },
  {
    character: '森',
    english: 'forest',
    onyomi: ['シン'],
    kunyomi: ['もり'],
    examples: [
      { word: '森林', reading: 'しんりん', meaning: 'forest' },
      { word: '森田', reading: 'もりた', meaning: 'Morita (surname)' },
      { word: '森羅万象', reading: 'しんらばんしょう', meaning: 'all things in nature' }
    ],
    difficulty: 'intermediate',
    category: 'nature',
    hint: 'Looks like three trees',
    strokeCount: 12,
    radicals: ['木', '木', '木'],
    jlptLevel: 'N4'
  },
  {
    character: '湖',
    english: 'lake',
    onyomi: ['コ'],
    kunyomi: ['みずうみ'],
    examples: [
      { word: '湖面', reading: 'こめん', meaning: 'lake surface' },
      { word: '湖畔', reading: 'こはん', meaning: 'lakeside' },
      { word: '琵琶湖', reading: 'びわこ', meaning: 'Lake Biwa' }
    ],
    difficulty: 'intermediate',
    category: 'nature',
    hint: 'Looks like water with a moon',
    strokeCount: 12,
    radicals: ['氵', '胡'],
    jlptLevel: 'N4'
  },
  {
    character: '講',
    english: 'lecture, explain',
    onyomi: ['コウ'],
    kunyomi: [],
    examples: [
      { word: '講義', reading: 'こうぎ', meaning: 'lecture' },
      { word: '講師', reading: 'こうし', meaning: 'lecturer' },
      { word: '講演', reading: 'こうえん', meaning: 'speech' }
    ],
    difficulty: 'hard',
    category: 'education',
    hint: 'Looks like words being explained',
    strokeCount: 17,
    radicals: ['言', '冓'],
    jlptLevel: 'N3'
  },
  {
    character: '授',
    english: 'teach, grant',
    onyomi: ['ジュ'],
    kunyomi: ['さず'],
    examples: [
      { word: '授業', reading: 'じゅぎょう', meaning: 'lesson' },
      { word: '教授', reading: 'きょうじゅ', meaning: 'professor' },
      { word: '授ける', reading: 'さずける', meaning: 'to grant' }
    ],
    difficulty: 'hard',
    category: 'education',
    hint: 'Looks like hands teaching',
    strokeCount: 11,
    radicals: ['扌', '受'],
    jlptLevel: 'N3'
  },
  {
    character: '勤',
    english: 'work, serve',
    onyomi: ['キン'],
    kunyomi: ['つと'],
    examples: [
      { word: '勤務', reading: 'きんむ', meaning: 'work, service' },
      { word: '勤める', reading: 'つとめる', meaning: 'to work' },
      { word: '通勤', reading: 'つうきん', meaning: 'commuting' }
    ],
    difficulty: 'hard',
    category: 'business',
    hint: 'Looks like strength in work',
    strokeCount: 12,
    radicals: ['力', '堇'],
    jlptLevel: 'N3'
  },
  {
    character: '務',
    english: 'duty, task',
    onyomi: ['ム'],
    kunyomi: ['つと'],
    examples: [
      { word: '業務', reading: 'ぎょうむ', meaning: 'business' },
      { word: '義務', reading: 'ぎむ', meaning: 'duty' },
      { word: '任務', reading: 'にんむ', meaning: 'mission' }
    ],
    difficulty: 'hard',
    category: 'business',
    hint: 'Looks like a person with a task',
    strokeCount: 11,
    radicals: ['攵', '矛'],
    jlptLevel: 'N3'
  },
  {
    character: '環',
    english: 'ring, circle',
    onyomi: ['カン'],
    kunyomi: [],
    examples: [
      { word: '環境', reading: 'かんきょう', meaning: 'environment' },
      { word: '循環', reading: 'じゅんかん', meaning: 'circulation' },
      { word: '環状', reading: 'かんじょう', meaning: 'circular' }
    ],
    difficulty: 'hard',
    category: 'nature',
    hint: 'Looks like a ring of jade',
    strokeCount: 17,
    radicals: ['王', '睘'],
    jlptLevel: 'N3'
  },
  {
    character: '境',
    english: 'boundary, condition',
    onyomi: ['キョウ', 'ケイ'],
    kunyomi: ['さかい'],
    examples: [
      { word: '環境', reading: 'かんきょう', meaning: 'environment' },
      { word: '国境', reading: 'こっきょう', meaning: 'national border' },
      { word: '境界', reading: 'きょうかい', meaning: 'boundary' }
    ],
    difficulty: 'hard',
    category: 'nature',
    hint: 'Looks like land with boundaries',
    strokeCount: 14,
    radicals: ['土', '竟'],
    jlptLevel: 'N3'
  },
  {
    character: '整',
    english: 'arrange, organize',
    onyomi: ['セイ'],
    kunyomi: ['ととの'],
    examples: [
      { word: '整理', reading: 'せいり', meaning: 'organization' },
      { word: '整う', reading: 'ととのう', meaning: 'to be in order' },
      { word: '整備', reading: 'せいび', meaning: 'maintenance' }
    ],
    difficulty: 'hard',
    category: 'business',
    hint: 'Looks like a hand arranging things',
    strokeCount: 16,
    radicals: ['攵', '正'],
    jlptLevel: 'N3'
  },
  {
    character: '管',
    english: 'pipe, control',
    onyomi: ['カン'],
    kunyomi: ['くだ'],
    examples: [
      { word: '管理', reading: 'かんり', meaning: 'management' },
      { word: '管轄', reading: 'かんかつ', meaning: 'jurisdiction' },
      { word: '配管', reading: 'はいかん', meaning: 'plumbing' }
    ],
    difficulty: 'hard',
    category: 'business',
    hint: 'Looks like bamboo with control',
    strokeCount: 14,
    radicals: ['竹', '官'],
    jlptLevel: 'N3'
  },
  {
    character: '料',
    english: 'fee, materials',
    onyomi: ['リョウ'],
    kunyomi: [],
    examples: [
      { word: '料理', reading: 'りょうり', meaning: 'cooking' },
      { word: '材料', reading: 'ざいりょう', meaning: 'ingredients' },
      { word: '料金', reading: 'りょうきん', meaning: 'fee' }
    ],
    difficulty: 'intermediate',
    category: 'food',
    hint: 'Looks like rice with materials',
    strokeCount: 10,
    radicals: ['米', '斗'],
    jlptLevel: 'N4'
  },
  {
    character: '味',
    english: 'taste, flavor',
    onyomi: ['ミ'],
    kunyomi: ['あじ'],
    examples: [
      { word: '味噌', reading: 'みそ', meaning: 'miso' },
      { word: '味わう', reading: 'あじわう', meaning: 'to taste' },
      { word: '趣味', reading: 'しゅみ', meaning: 'hobby' }
    ],
    difficulty: 'intermediate',
    category: 'food',
    hint: 'Looks like a mouth with taste',
    strokeCount: 8,
    radicals: ['口', '未'],
    jlptLevel: 'N4'
  },
  {
    character: '調',
    english: 'investigate, tune',
    onyomi: ['チョウ'],
    kunyomi: ['しら'],
    examples: [
      { word: '調理', reading: 'ちょうり', meaning: 'cooking' },
      { word: '調査', reading: 'ちょうさ', meaning: 'investigation' },
      { word: '調べる', reading: 'しらべる', meaning: 'to investigate' }
    ],
    difficulty: 'intermediate',
    category: 'food',
    hint: 'Looks like words being tuned',
    strokeCount: 15,
    radicals: ['言', '周'],
    jlptLevel: 'N4'
  },
  {
    character: '機',
    english: 'machine, opportunity',
    onyomi: ['キ'],
    kunyomi: ['はた'],
    examples: [
      { word: '機械', reading: 'きかい', meaning: 'machine' },
      { word: '機会', reading: 'きかい', meaning: 'opportunity' },
      { word: '飛行機', reading: 'ひこうき', meaning: 'airplane' }
    ],
    difficulty: 'intermediate',
    category: 'technology',
    hint: 'Looks like a tree with a machine',
    strokeCount: 16,
    radicals: ['木', '幾'],
    jlptLevel: 'N4'
  },
  {
    character: '器',
    english: 'utensil, container',
    onyomi: ['キ'],
    kunyomi: ['うつわ'],
    examples: [
      { word: '器具', reading: 'きぐ', meaning: 'utensil' },
      { word: '食器', reading: 'しょっき', meaning: 'tableware' },
      { word: '機器', reading: 'きき', meaning: 'equipment' }
    ],
    difficulty: 'intermediate',
    category: 'technology',
    hint: 'Looks like four mouths in a container',
    strokeCount: 15,
    radicals: ['口', '犬'],
    jlptLevel: 'N4'
  },
  {
    character: '親',
    english: 'parent, relative',
    onyomi: ['シン'],
    kunyomi: ['おや', 'した'],
    examples: [
      { word: '親子', reading: 'おやこ', meaning: 'parent and child' },
      { word: '両親', reading: 'りょうしん', meaning: 'parents' },
      { word: '親切', reading: 'しんせつ', meaning: 'kind' }
    ],
    difficulty: 'intermediate',
    category: 'family',
    hint: 'Looks like seeing a relative',
    strokeCount: 16,
    radicals: ['見', '立'],
    jlptLevel: 'N4'
  },
  {
    character: '族',
    english: 'tribe, family',
    onyomi: ['ゾク'],
    kunyomi: [],
    examples: [
      { word: '家族', reading: 'かぞく', meaning: 'family' },
      { word: '民族', reading: 'みんぞく', meaning: 'ethnic group' },
      { word: '部族', reading: 'ぶぞく', meaning: 'tribe' }
    ],
    difficulty: 'intermediate',
    category: 'family',
    hint: 'Looks like a flag with an arrow',
    strokeCount: 11,
    radicals: ['方', '矢'],
    jlptLevel: 'N4'
  },
  {
    character: '化',
    english: 'change, transform',
    onyomi: ['カ', 'ケ'],
    kunyomi: ['ば'],
    examples: [
      { word: '文化', reading: 'ぶんか', meaning: 'culture' },
      { word: '変化', reading: 'へんか', meaning: 'change' },
      { word: '化学', reading: 'かがく', meaning: 'chemistry' }
    ],
    difficulty: 'intermediate',
    category: 'society',
    hint: 'Looks like a person changing',
    strokeCount: 4,
    radicals: ['化'],
    jlptLevel: 'N4'
  },
  {
    character: '科',
    english: 'department, science',
    onyomi: ['カ'],
    kunyomi: [],
    examples: [
      { word: '科学', reading: 'かがく', meaning: 'science' },
      { word: '内科', reading: 'ないか', meaning: 'internal medicine' },
      { word: '教科', reading: 'きょうか', meaning: 'subject' }
    ],
    difficulty: 'intermediate',
    category: 'science',
    hint: 'Looks like rice with a measure',
    strokeCount: 9,
    radicals: ['禾', '斗'],
    jlptLevel: 'N4'
  },
  {
    character: '製',
    english: 'manufacture, make',
    onyomi: ['セイ'],
    kunyomi: [],
    examples: [
      { word: '製品', reading: 'せいひん', meaning: 'product' },
      { word: '製造', reading: 'せいぞう', meaning: 'manufacturing' },
      { word: '製作', reading: 'せいさく', meaning: 'production' }
    ],
    difficulty: 'hard',
    category: 'technology',
    hint: 'Looks like clothes being made',
    strokeCount: 14,
    radicals: ['衣', '制'],
    jlptLevel: 'N3'
  },
  {
    character: '術',
    english: 'art, technique',
    onyomi: ['ジュツ'],
    kunyomi: [],
    examples: [
      { word: '技術', reading: 'ぎじゅつ', meaning: 'technology' },
      { word: '手術', reading: 'しゅじゅつ', meaning: 'surgery' },
      { word: '美術', reading: 'びじゅつ', meaning: 'art' }
    ],
    difficulty: 'hard',
    category: 'technology',
    hint: 'Looks like a road with technique',
    strokeCount: 11,
    radicals: ['行', '朮'],
    jlptLevel: 'N3'
  },
  {
    character: '婚',
    english: 'marriage',
    onyomi: ['コン'],
    kunyomi: [],
    examples: [
      { word: '結婚', reading: 'けっこん', meaning: 'marriage' },
      { word: '離婚', reading: 'りこん', meaning: 'divorce' },
      { word: '婚約', reading: 'こんやく', meaning: 'engagement' }
    ],
    difficulty: 'hard',
    category: 'family',
    hint: 'Looks like a woman with marriage',
    strokeCount: 11,
    radicals: ['女', '昏'],
    jlptLevel: 'N3'
  },
  {
    character: '育',
    english: 'raise, bring up',
    onyomi: ['イク'],
    kunyomi: ['そだ'],
    examples: [
      { word: '教育', reading: 'きょういく', meaning: 'education' },
      { word: '育つ', reading: 'そだつ', meaning: 'to grow up' },
      { word: '育児', reading: 'いくじ', meaning: 'childcare' }
    ],
    difficulty: 'hard',
    category: 'family',
    hint: 'Looks like a child being raised',
    strokeCount: 8,
    radicals: ['月', '子'],
    jlptLevel: 'N3'
  },
  {
    character: '芸',
    english: 'art, performance',
    onyomi: ['ゲイ'],
    kunyomi: [],
    examples: [
      { word: '芸術', reading: 'げいじゅつ', meaning: 'art' },
      { word: '芸能', reading: 'げいのう', meaning: 'entertainment' },
      { word: '文芸', reading: 'ぶんげい', meaning: 'literature' }
    ],
    difficulty: 'hard',
    category: 'society',
    hint: 'Looks like grass with art',
    strokeCount: 7,
    radicals: ['艹', '云'],
    jlptLevel: 'N3'
  },
  {
    character: '祭',
    english: 'festival, worship',
    onyomi: ['サイ'],
    kunyomi: ['まつ'],
    examples: [
      { word: '祭り', reading: 'まつり', meaning: 'festival' },
      { word: '祭日', reading: 'さいじつ', meaning: 'holiday' },
      { word: '祭典', reading: 'さいてん', meaning: 'celebration' }
    ],
    difficulty: 'hard',
    category: 'society',
    hint: 'Looks like a hand with worship',
    strokeCount: 11,
    radicals: ['示', '又'],
    jlptLevel: 'N3'
  },
  {
    character: '献',
    english: 'offer, dedicate',
    onyomi: ['ケン', 'コン'],
    kunyomi: ['たてまつ'],
    examples: [
      { word: '貢献', reading: 'こうけん', meaning: 'contribution' },
      { word: '献立', reading: 'こんだて', meaning: 'menu' },
      { word: '献上', reading: 'けんじょう', meaning: 'dedication' }
    ],
    difficulty: 'hard',
    category: 'society',
    hint: 'Looks like a dog with offering',
    strokeCount: 13,
    radicals: ['犬', '南'],
    jlptLevel: 'N3'
  }
]; 