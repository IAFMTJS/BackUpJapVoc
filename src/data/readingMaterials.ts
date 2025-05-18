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
    },
    {
      title: "わたしの かぞく (My Family)",
      difficulty: "easy",
      content: "わたしの かぞくは よにん です。ちちと ははと あにと わたし です。いぬが いっぴき います。",
      translation: "There are four people in my family: my father, mother, older brother, and me. We have one dog.",
      vocabulary: ["かぞく", "よにん", "ちち", "はは", "あに", "いぬ", "いっぴき"]
    },
    {
      title: "がっこう (School)",
      difficulty: "easy",
      content: "わたしは がっこうに いきます。ともだちと べんきょうします。せんせいは やさしい です。",
      translation: "I go to school. I study with my friends. The teacher is kind.",
      vocabulary: ["がっこう", "いきます", "ともだち", "べんきょう", "せんせい", "やさしい"]
    },
    {
      title: "ともだち (Friend)",
      difficulty: "easy",
      content: "わたしの ともだちは さとうさん です。いっしょに サッカーを します。たのしい です。",
      translation: "My friend is Sato. We play soccer together. It's fun.",
      vocabulary: ["ともだち", "さとうさん", "いっしょに", "サッカー", "します", "たのしい"]
    },
    {
      title: "しゅみ (Hobby)",
      difficulty: "easy",
      content: "わたしの しゅみは えを かくこと です。まいにち すこし えを かきます。",
      translation: "My hobby is drawing. I draw a little every day.",
      vocabulary: ["しゅみ", "え", "かく", "まいにち", "すこし"]
    },
    {
      title: "やさいと くだもの (Vegetables and Fruits)",
      difficulty: "easy",
      content: "にんじんと きゅうりが すきです。くだものは りんごと みかんが すきです。",
      translation: "I like carrots and cucumbers. For fruit, I like apples and mandarins.",
      vocabulary: ["にんじん", "きゅうり", "くだもの", "りんご", "みかん"]
    },
    {
      title: "いぬと ねこ (Dog and Cat)",
      difficulty: "easy",
      content: "いぬは おおきい です。ねこは ちいさい です。どちらも かわいい です。",
      translation: "The dog is big. The cat is small. Both are cute.",
      vocabulary: ["いぬ", "おおきい", "ねこ", "ちいさい", "かわいい"]
    },
    {
      title: "あさごはん (Breakfast)",
      difficulty: "easy",
      content: "あさごはんに パンと たまごを たべます。みずを のみます。",
      translation: "For breakfast, I eat bread and eggs. I drink water.",
      vocabulary: ["あさごはん", "パン", "たまご", "たべます", "みず", "のみます"]
    },
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
    },
    {
      title: "でんしゃ (Train)",
      difficulty: "easy",
      content: "まいあさ でんしゃで がっこうに いきます。でんしゃは こんでいます。",
      translation: "Every morning I go to school by train. The train is crowded.",
      vocabulary: ["でんしゃ", "まいあさ", "がっこう", "いきます", "こんでいます"]
    },
    {
      title: "きょうしつ (Classroom)",
      difficulty: "easy",
      content: "きょうしつに つくえと いすが あります。まどから そとが みえます。",
      translation: "There are desks and chairs in the classroom. You can see outside from the window.",
      vocabulary: ["きょうしつ", "つくえ", "いす", "まど", "そと", "みえます"]
    },
    {
      title: "おんがく (Music)",
      difficulty: "easy",
      content: "おんがくを きくのが すきです。とくに J-POPが すきです。",
      translation: "I like listening to music. I especially like J-POP.",
      vocabulary: ["おんがく", "きく", "すき", "とくに", "J-POP"]
    },
    {
      title: "こうえん (Park)",
      difficulty: "easy",
      content: "こうえんで さんぽを します。はなや きが たくさん あります。",
      translation: "I take walks in the park. There are many flowers and trees.",
      vocabulary: ["こうえん", "さんぽ", "はな", "き", "たくさん"]
    },
    {
      title: "おかし (Snacks)",
      difficulty: "easy",
      content: "おかしを たべるのが すきです。チョコレートと クッキーが おいしい です。",
      translation: "I like eating snacks. Chocolate and cookies are delicious.",
      vocabulary: ["おかし", "たべる", "すき", "チョコレート", "クッキー", "おいしい"]
    },
    {
      title: "ともだちの たんじょうび (Friend's Birthday)",
      difficulty: "easy",
      content: "きょうは ともだちの たんじょうび です。プレゼントを あげます。いっしょに ケーキを たべます。",
      translation: "Today is my friend's birthday. I give a present. We eat cake together.",
      vocabulary: ["たんじょうび", "プレゼント", "あげます", "いっしょに", "ケーキ", "たべます"]
    },
    {
      title: "てがみ (Letter)",
      difficulty: "easy",
      content: "ともだちに てがみを かきます。にほんごで かきます。よろこんで くれます。",
      translation: "I write a letter to my friend. I write it in Japanese. My friend is happy.",
      vocabulary: ["てがみ", "かきます", "にほんご", "よろこぶ"]
    },
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
    },
    {
      title: "にちようびの よてい (Sunday Plans)",
      difficulty: "medium",
      content: "にちようびは ともだちと こうえんに いきます。ピクニックを します。おべんとうを つくります。",
      translation: "On Sunday, I will go to the park with my friend. We will have a picnic. I will make a lunch box.",
      vocabulary: ["にちようび", "ともだち", "こうえん", "ピクニック", "おべんとう", "つくります"]
    },
    {
      title: "しゅくだい (Homework)",
      difficulty: "medium",
      content: "まいばん しゅくだいを します。むずかしい ですが、がんばります。",
      translation: "I do my homework every night. It's difficult, but I do my best.",
      vocabulary: ["しゅくだい", "まいばん", "むずかしい", "がんばります"]
    },
    {
      title: "でんしゃの なか (On the Train)",
      difficulty: "medium",
      content: "でんしゃの なかで ほんを よみます。ときどき ねむく なります。",
      translation: "I read books on the train. Sometimes I get sleepy.",
      vocabulary: ["でんしゃ", "なか", "ほん", "よみます", "ときどき", "ねむい"]
    },
    {
      title: "おてつだい (Helping Out)",
      difficulty: "medium",
      content: "いえで りょうりや そうじを てつだいます。かぞくが よろこびます。",
      translation: "I help with cooking and cleaning at home. My family is happy.",
      vocabulary: ["いえ", "りょうり", "そうじ", "てつだいます", "かぞく", "よろこぶ"]
    },
    {
      title: "あたらしい くつ (New Shoes)",
      difficulty: "medium",
      content: "きょう あたらしい くつを かいました。あおい くつです。とても きにいりました。",
      translation: "Today I bought new shoes. They are blue. I like them very much.",
      vocabulary: ["あたらしい", "くつ", "かいました", "あおい", "きにいる"]
    },
    {
      title: "えいがかん (Movie Theater)",
      difficulty: "medium",
      content: "えいがかんで えいがを みました。とても おもしろかった です。ポップコーンを たべました。",
      translation: "I watched a movie at the theater. It was very interesting. I ate popcorn.",
      vocabulary: ["えいがかん", "えいが", "みました", "おもしろい", "ポップコーン", "たべました"]
    },
    {
      title: "おんがくの じゅぎょう (Music Class)",
      difficulty: "medium",
      content: "がっこうで おんがくの じゅぎょうが あります。ピアノを ひきます。",
      translation: "There is a music class at school. I play the piano.",
      vocabulary: ["がっこう", "おんがく", "じゅぎょう", "ピアノ", "ひきます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
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
    },
    {
      title: "しゅうまつの よてい (Weekend Plans)",
      difficulty: "medium",
      content: "しゅうまつは かぞくと でかけます。こうえんや みせに いきます。たのしい です。",
      translation: "On weekends, I go out with my family. We go to parks and shops. It's fun.",
      vocabulary: ["しゅうまつ", "かぞく", "でかけます", "こうえん", "みせ", "たのしい"]
    },
    {
      title: "あさの ルーティン (Morning Routine)",
      difficulty: "medium",
      content: "あさ おきて かおを あらいます。あさごはんを たべて がっこうに いきます。",
      translation: "In the morning, I wake up and wash my face. I eat breakfast and go to school.",
      vocabulary: ["あさ", "おきて", "かお", "あらいます", "あさごはん", "たべて", "がっこう"]
    },
    {
      title: "ともだちと あそぶ (Playing with Friends)",
      difficulty: "medium",
      content: "ほうかご ともだちと サッカーを します。とても たのしい です。",
      translation: "After school, I play soccer with my friends. It's a lot of fun.",
      vocabulary: ["ほうかご", "ともだち", "サッカー", "します", "たのしい"]
    },
    {
      title: "おかあさんの りょうり (Mom's Cooking)",
      difficulty: "medium",
      content: "おかあさんの りょうりは おいしい です。とくに カレーが すきです。",
      translation: "My mom's cooking is delicious. I especially like her curry.",
      vocabulary: ["おかあさん", "りょうり", "おいしい", "とくに", "カレー", "すき"]
    },
    {
      title: "がっこうの きょうしつ (School Classroom)",
      difficulty: "medium",
      content: "きょうしつで べんきょうします。せんせいは しんせつ です。",
      translation: "I study in the classroom. The teacher is kind.",
      vocabulary: ["きょうしつ", "べんきょう", "せんせい", "しんせつ"]
    },
    {
      title: "おてがみ (Letter)",
      difficulty: "medium",
      content: "ともだちに おてがみを かきました。へんじが きて うれしい です。",
      translation: "I wrote a letter to my friend. I was happy to get a reply.",
      vocabulary: ["ともだち", "おてがみ", "かきました", "へんじ", "うれしい"]
    },
    {
      title: "はるの まつり (Spring Festival)",
      difficulty: "medium",
      content: "はるに まつりが あります。さくらを みて たのしみます。",
      translation: "There is a festival in spring. We enjoy watching the cherry blossoms.",
      vocabulary: ["はる", "まつり", "さくら", "みて", "たのしみます"]
    },
  ]
}; 