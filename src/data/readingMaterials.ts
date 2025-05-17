import { ReadingMaterial } from './types';

interface LevelReadingMaterials {
  [key: number]: ReadingMaterial[];
}

export const readingMaterials: LevelReadingMaterials = {
  1: [
    {
      title: "はじめまして (Nice to Meet You)",
      difficulty: "easy",
      content: "わたしは たなか です。にほんじん です。にじゅうごさい です。がくせい です。",
      translation: "I am Tanaka. I am Japanese. I am 25 years old. I am a student.",
      vocabulary: ["わたし", "たなか", "にほんじん", "にじゅうごさい", "がくせい"]
    },
    {
      title: "わたしの いえ (My House)",
      difficulty: "easy",
      content: "わたしの いえは ちいさい です。にほんご の ほんが たくさん あります。ねこが いっぴき います。",
      translation: "My house is small. I have many Japanese books. I have one cat.",
      vocabulary: ["いえ", "ちいさい", "にほんご", "ほん", "ねこ", "いっぴき"]
    },
    {
      title: "まいにちの せいかつ (Daily Life)",
      difficulty: "easy",
      content: "まいにち あさ ろくじに おきます。あさごはんを たべます。がっこうに いきます。",
      translation: "Every day I wake up at 6 o'clock. I eat breakfast. I go to school.",
      vocabulary: ["まいにち", "あさ", "ろくじ", "おきます", "あさごはん", "たべます", "がっこう"]
    }
  ],
  2: [
    {
      title: "しょくどうで (At the Cafeteria)",
      difficulty: "easy",
      content: "きょうは てんきが いいです。ともだちと しょくどうで ひるごはんを たべます。わたしは カレーライスを たべます。ともだちは ラーメンを たべます。",
      translation: "Today the weather is good. I eat lunch at the cafeteria with my friend. I eat curry rice. My friend eats ramen.",
      vocabulary: ["きょう", "てんき", "ともだち", "しょくどう", "ひるごはん", "カレーライス", "ラーメン"]
    },
    {
      title: "かいもの (Shopping)",
      difficulty: "easy",
      content: "きのう スーパーに いきました。くだものを かいました。りんごと バナナを かいました。",
      translation: "Yesterday I went to the supermarket. I bought fruit. I bought apples and bananas.",
      vocabulary: ["きのう", "スーパー", "くだもの", "かいました", "りんご", "バナナ"]
    },
    {
      title: "でんわ (Phone Call)",
      difficulty: "medium",
      content: "もしもし、たなかさんですか。はい、たなかです。あした いっしょに えいがを みませんか。はい、みましょう。",
      translation: "Hello, is this Tanaka? Yes, this is Tanaka. Would you like to watch a movie together tomorrow? Yes, let's watch one.",
      vocabulary: ["もしもし", "あした", "いっしょに", "えいが", "みませんか", "みましょう"]
    }
  ],
  3: [
    {
      title: "りょこうの けいかく (Travel Plans)",
      difficulty: "medium",
      content: "らいげつ とうきょうに りょこうします。ともだちと いっしょに いきます。しんかんせんで いきます。ホテルを よやくしました。",
      translation: "Next month I will travel to Tokyo. I will go with my friend. I will go by Shinkansen. I have reserved a hotel.",
      vocabulary: ["らいげつ", "とうきょう", "りょこう", "しんかんせん", "ホテル", "よやく"]
    },
    {
      title: "アルバイト (Part-time Job)",
      difficulty: "medium",
      content: "わたしは レストランで アルバイトを しています。まいにち よる はたらきます。おきゃくさんに りょうりを だします。",
      translation: "I work part-time at a restaurant. I work every night. I serve food to customers.",
      vocabulary: ["アルバイト", "レストラン", "よる", "はたらきます", "おきゃくさん", "りょうり", "だします"]
    },
    {
      title: "びょういん (Hospital)",
      difficulty: "medium",
      content: "きのう びょういんに いきました。かぜを ひきました。おいしゃさんに くすりを もらいました。きょうは げんきです。",
      translation: "Yesterday I went to the hospital. I caught a cold. The doctor gave me medicine. Today I am healthy.",
      vocabulary: ["びょういん", "かぜ", "ひきました", "おいしゃさん", "くすり", "げんき"]
    }
  ],
  4: [
    {
      title: "しごとの めんせつ (Job Interview)",
      difficulty: "medium",
      content: "らいしゅう かいしゃの めんせつが あります。しんぶんしゃで はたらきたいです。にほんごが じょうずに なりたいです。",
      translation: "Next week I have a job interview. I want to work at a newspaper company. I want to become good at Japanese.",
      vocabulary: ["らいしゅう", "かいしゃ", "めんせつ", "しんぶんしゃ", "はたらきたい", "じょうず"]
    },
    {
      title: "アパートの さがし (Apartment Hunting)",
      difficulty: "medium",
      content: "あたらしい アパートを さがしています。えきから あるいて ごふんの ところが いいです。へやが ひろくて あかるい アパートが いいです。",
      translation: "I am looking for a new apartment. I want one that's a 5-minute walk from the station. I want an apartment with a bright and spacious room.",
      vocabulary: ["あたらしい", "アパート", "さがしています", "えき", "あるいて", "へや", "ひろい", "あかるい"]
    },
    {
      title: "にほんの きせつ (Japanese Seasons)",
      difficulty: "medium",
      content: "にほんには はる、なつ、あき、ふゆの よっつの きせつが あります。はるは さくらが きれいです。なつは あつくて むしあついです。",
      translation: "Japan has four seasons: spring, summer, autumn, and winter. Spring has beautiful cherry blossoms. Summer is hot and humid.",
      vocabulary: ["きせつ", "はる", "なつ", "あき", "ふゆ", "さくら", "きれい", "あつい", "むしあつい"]
    }
  ],
  5: [
    {
      title: "にほんの でんとう (Japanese Traditions)",
      difficulty: "hard",
      content: "にほんの でんとうてきな まつりが すきです。なつに おこなわれる まつりでは、はなびが あがります。みんなで たのしく おどります。",
      translation: "I like traditional Japanese festivals. At summer festivals, fireworks are set off. Everyone dances happily together.",
      vocabulary: ["でんとうてき", "まつり", "おこなわれる", "はなび", "あがります", "おどります"]
    },
    {
      title: "しごとの せいかつ (Work Life)",
      difficulty: "hard",
      content: "かいしゃいんとして はたらくのは たいへんです。まいにち でんしゃで つうきんします。かいぎが おおくて、しごとが いそがしいです。",
      translation: "Working as a company employee is tough. I commute by train every day. There are many meetings and the work is busy.",
      vocabulary: ["かいしゃいん", "たいへん", "でんしゃ", "つうきん", "かいぎ", "いそがしい"]
    },
    {
      title: "にほんの りょうり (Japanese Cuisine)",
      difficulty: "hard",
      content: "にほんの りょうりは せかいで にんきが あります。すしや てんぷらは ゆうめいです。だしの うまみが にほんりょうりの とくちょうです。",
      translation: "Japanese cuisine is popular worldwide. Sushi and tempura are famous. The umami flavor of dashi is a characteristic of Japanese cuisine.",
      vocabulary: ["りょうり", "せかい", "にんき", "すし", "てんぷら", "ゆうめい", "だし", "うまみ", "とくちょう"]
    }
  ],
  6: [
    {
      title: "にほんの がっこう (Japanese Schools)",
      difficulty: "hard",
      content: "にほんの がっこうでは、せいとたちが じぶんで そうじを します。がっこうの きそくが きびしいです。クラブかつどうが さかんです。",
      translation: "In Japanese schools, students clean by themselves. School rules are strict. Club activities are popular.",
      vocabulary: ["がっこう", "せいと", "そうじ", "きそく", "きびしい", "クラブかつどう", "さかん"]
    },
    {
      title: "にほんの しゃかい (Japanese Society)",
      difficulty: "hard",
      content: "にほんの しゃかいは れいぎを たいせつに します。めいしの こうかんは じゅうような しゃかいてき ぎょうぎです。",
      translation: "Japanese society values etiquette. The exchange of business cards is an important social custom.",
      vocabulary: ["しゃかい", "れいぎ", "たいせつ", "めいし", "こうかん", "じゅうよう", "ぎょうぎ"]
    },
    {
      title: "にほんの ぎじゅつ (Japanese Technology)",
      difficulty: "hard",
      content: "にほんは ハイテクの くにとして しられています。でんきせいひんの せいぞうが さかんです。AIの けんきゅうも すすんでいます。",
      translation: "Japan is known as a high-tech country. Electronics manufacturing is thriving. AI research is also advancing.",
      vocabulary: ["ハイテク", "くに", "しられている", "でんきせいひん", "せいぞう", "さかん", "けんきゅう", "すすむ"]
    }
  ],
  7: [
    {
      title: "にほんの れきし (Japanese History)",
      difficulty: "hard",
      content: "にほんの れきしは ながくて ふくざつです。むかしの ぶしの せいかつや、じだいの へんかが おもしろいです。",
      translation: "Japanese history is long and complex. The life of ancient samurai and the changes of eras are interesting.",
      vocabulary: ["れきし", "ながい", "ふくざつ", "むかし", "ぶし", "せいかつ", "じだい", "へんか", "おもしろい"]
    },
    {
      title: "にほんの げいじゅつ (Japanese Arts)",
      difficulty: "hard",
      content: "にほんの げいじゅつには うきよえや のうがくなどが あります。わびさびの かんねんが げいじゅつに えいきょうを あたえました。",
      translation: "Japanese arts include ukiyo-e and Noh theater. The concept of wabi-sabi has influenced the arts.",
      vocabulary: ["げいじゅつ", "うきよえ", "のうがく", "わびさび", "かんねん", "えいきょう", "あたえる"]
    },
    {
      title: "にほんの しんぶん (Japanese Newspapers)",
      difficulty: "hard",
      content: "にほんの しんぶんは せかいで いちばん うれている しんぶんの ひとつです。まいにち はんぶんかんの よみものを ていきょうしています。",
      translation: "Japanese newspapers are among the most widely read newspapers in the world. They provide half a day's worth of reading material daily.",
      vocabulary: ["しんぶん", "せかい", "うれる", "はんぶんかん", "よみもの", "ていきょう"]
    }
  ],
  8: [
    {
      title: "にほんの けいざい (Japanese Economy)",
      difficulty: "hard",
      content: "にほんの けいざいは せかいで さんばんめの おおきさです。きぎょうの グローバルかが すすんでいます。",
      translation: "Japan's economy is the third largest in the world. Corporate globalization is advancing.",
      vocabulary: ["けいざい", "せかい", "さんばんめ", "おおきさ", "きぎょう", "グローバルか", "すすむ"]
    },
    {
      title: "にほんの かんきょう (Japanese Environment)",
      difficulty: "hard",
      content: "にほんは かんきょうほごに ちからを いれています。さいりサイクルが さかんで、せいねんりつが たかいです。",
      translation: "Japan is putting effort into environmental protection. Recycling is thriving and the collection rate is high.",
      vocabulary: ["かんきょう", "ほご", "ちから", "いれる", "さいりサイクル", "さかん", "せいねんりつ", "たかい"]
    },
    {
      title: "にほんの いがく (Japanese Medicine)",
      difficulty: "hard",
      content: "にほんの いがくは せかいで すすんでいます。じゅみょうが ながく、しんりょうの すいじゅんが たかいです。",
      translation: "Japanese medicine is advanced worldwide. Life expectancy is long and the level of medical care is high.",
      vocabulary: ["いがく", "せかい", "すすむ", "じゅみょう", "ながい", "しんりょう", "すいじゅん", "たかい"]
    }
  ],
  9: [
    {
      title: "にほんの ぶんか (Japanese Culture)",
      difficulty: "hard",
      content: "にほんの ぶんかは むかしと げんだいが まざりあっています。アニメや まんがは せかいてきに にんきが あります。",
      translation: "Japanese culture is a mix of traditional and modern elements. Anime and manga are popular worldwide.",
      vocabulary: ["ぶんか", "むかし", "げんだい", "まざりあう", "アニメ", "まんが", "せかいてき", "にんき"]
    },
    {
      title: "にほんの しゃかいもんだい (Social Issues)",
      difficulty: "hard",
      content: "にほんの しゃかいは しょうしかと ろうじんかに とまどっています。しごとと かぞくの りょうりつが むずかしいです。",
      translation: "Japanese society is struggling with declining birth rates and aging population. Balancing work and family is difficult.",
      vocabulary: ["しゃかい", "もんだい", "しょうしか", "ろうじんか", "とまどう", "しごと", "かぞく", "りょうりつ", "むずかしい"]
    },
    {
      title: "にほんの ぎじゅつかいはつ (Technology Development)",
      difficulty: "hard",
      content: "にほんの ぎじゅつかいはつは せかいを リードしています。ロボットぎじゅつや でんきじどうしゃが さかんです。",
      translation: "Japan's technology development leads the world. Robotics and electric vehicles are thriving.",
      vocabulary: ["ぎじゅつ", "かいはつ", "せかい", "リード", "ロボット", "でんきじどうしゃ", "さかん"]
    }
  ],
  10: [
    {
      title: "にほんの せいじ (Japanese Politics)",
      difficulty: "hard",
      content: "にほんの せいじは へいわてきな へんかの れきしを もっています。こくさいかんけいの ちからを つよめています。",
      translation: "Japanese politics has a history of peaceful change. It is strengthening its international relations.",
      vocabulary: ["せいじ", "へいわてき", "へんか", "れきし", "もつ", "こくさいかんけい", "ちから", "つよめる"]
    },
    {
      title: "にほんの けいざいせいさく (Economic Policy)",
      difficulty: "hard",
      content: "にほんの けいざいせいさくは グローバルな きょうそうりょくを たかめることを めざしています。",
      translation: "Japan's economic policy aims to enhance global competitiveness.",
      vocabulary: ["けいざい", "せいさく", "グローバル", "きょうそうりょく", "たかめる", "めざす"]
    },
    {
      title: "にほんの しゃかいかがく (Social Science)",
      difficulty: "hard",
      content: "にほんの しゃかいかがくの けんきゅうは せかいの もんだいかいけつに こうけんしています。",
      translation: "Japanese social science research contributes to solving world problems.",
      vocabulary: ["しゃかいかがく", "けんきゅう", "せかい", "もんだい", "かいけつ", "こうけん"]
    }
  ]
}; 