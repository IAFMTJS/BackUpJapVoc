// Level progression and unlocking is now enforced in the Romaji section. Each word's 'level' property determines its unlock order and requirements. See RomajiSection.tsx for logic.

export const romajiWords = [
  // Level 1
  { japanese: '水', romaji: 'mizu', english: 'water', level: 1 },
  { japanese: '火', romaji: 'hi', english: 'fire', level: 1 },
  { japanese: '山', romaji: 'yama', english: 'mountain', level: 1 },
  { japanese: '犬', romaji: 'inu', english: 'dog', level: 1 },
  { japanese: '猫', romaji: 'neko', english: 'cat', level: 1 },
  { japanese: '日', romaji: 'hi', english: 'sun', level: 1 },
  { japanese: '月', romaji: 'tsuki', english: 'moon', level: 1 },
  { japanese: '人', romaji: 'hito', english: 'person', level: 1 },
  { japanese: '手', romaji: 'te', english: 'hand', level: 1 },
  { japanese: '目', romaji: 'me', english: 'eye', level: 1 },
  // Level 2
  { japanese: '空', romaji: 'sora', english: 'sky', level: 2 },
  { japanese: '川', romaji: 'kawa', english: 'river', level: 2 },
  { japanese: '木', romaji: 'ki', english: 'tree', level: 2 },
  { japanese: '花', romaji: 'hana', english: 'flower', level: 2 },
  { japanese: '本', romaji: 'hon', english: 'book', level: 2 },
  { japanese: '車', romaji: 'kuruma', english: 'car', level: 2 },
  { japanese: '魚', romaji: 'sakana', english: 'fish', level: 2 },
  { japanese: '鳥', romaji: 'tori', english: 'bird', level: 2 },
  { japanese: '雨', romaji: 'ame', english: 'rain', level: 2 },
  { japanese: '石', romaji: 'ishi', english: 'stone', level: 2 },
  // Level 3
  { japanese: '友達', romaji: 'tomodachi', english: 'friend', level: 3 },
  { japanese: '学校', romaji: 'gakkou', english: 'school', level: 3 },
  { japanese: '先生', romaji: 'sensei', english: 'teacher', level: 3 },
  { japanese: '道', romaji: 'michi', english: 'road', level: 3 },
  { japanese: '町', romaji: 'machi', english: 'town', level: 3 },
  { japanese: '家', romaji: 'ie', english: 'house', level: 3 },
  { japanese: '時', romaji: 'toki', english: 'time', level: 3 },
  { japanese: '音', romaji: 'oto', english: 'sound', level: 3 },
  { japanese: '力', romaji: 'chikara', english: 'power', level: 3 },
  { japanese: '心', romaji: 'kokoro', english: 'heart', level: 3 },
];

export const romajiSentences = [
  // Level 1
  { japanese: '私は水を飲みます。', romaji: 'Watashi wa mizu o nomimasu.', english: 'I drink water.', level: 1 },
  { japanese: '山が見えます。', romaji: 'Yama ga miemasu.', english: 'I can see the mountain.', level: 1 },
  { japanese: '犬が走っています。', romaji: 'Inu ga hashitteimasu.', english: 'The dog is running.', level: 1 },
  { japanese: '火はあついです。', romaji: 'Hi wa atsui desu.', english: 'Fire is hot.', level: 1 },
  { japanese: '猫はかわいいです。', romaji: 'Neko wa kawaii desu.', english: 'The cat is cute.', level: 1 },
  { japanese: '月がきれいです。', romaji: 'Tsuki ga kirei desu.', english: 'The moon is beautiful.', level: 1 },
  { japanese: '人がたくさんいます。', romaji: 'Hito ga takusan imasu.', english: 'There are many people.', level: 1 },
  { japanese: '手をあげてください。', romaji: 'Te o agete kudasai.', english: 'Please raise your hand.', level: 1 },
  { japanese: '目をとじます。', romaji: 'Me o tojimasu.', english: 'I close my eyes.', level: 1 },
  { japanese: '私は犬が好きです。', romaji: 'Watashi wa inu ga suki desu.', english: 'I like dogs.', level: 1 },
  // Level 2
  { japanese: '花がきれいです。', romaji: 'Hana ga kirei desu.', english: 'The flower is beautiful.', level: 2 },
  { japanese: '先生は本を読みます。', romaji: 'Sensei wa hon o yomimasu.', english: 'The teacher reads a book.', level: 2 },
  { japanese: '猫は車の上にいます。', romaji: 'Neko wa kuruma no ue ni imasu.', english: 'The cat is on the car.', level: 2 },
  { japanese: '川で魚をつかまえます。', romaji: 'Kawa de sakana o tsukamaemasu.', english: 'I catch fish in the river.', level: 2 },
  { japanese: '鳥が空をとんでいます。', romaji: 'Tori ga sora o tondeimasu.', english: 'A bird is flying in the sky.', level: 2 },
  { japanese: '雨がふっています。', romaji: 'Ame ga futteimasu.', english: 'It is raining.', level: 2 },
  { japanese: '木の下に石があります。', romaji: 'Ki no shita ni ishi ga arimasu.', english: 'There is a stone under the tree.', level: 2 },
  { japanese: '車ははやいです。', romaji: 'Kuruma wa hayai desu.', english: 'The car is fast.', level: 2 },
  { japanese: '本をかしてください。', romaji: 'Hon o kashite kudasai.', english: 'Please lend me the book.', level: 2 },
  { japanese: '空が青いです。', romaji: 'Sora ga aoi desu.', english: 'The sky is blue.', level: 2 },
  // Level 3
  { japanese: '友達と学校へ行きます。', romaji: 'Tomodachi to gakkou e ikimasu.', english: 'I go to school with my friend.', level: 3 },
  { japanese: '道を歩きます。', romaji: 'Michi o arukimasu.', english: 'I walk on the road.', level: 3 },
  { japanese: '町はにぎやかです。', romaji: 'Machi wa nigiyaka desu.', english: 'The town is lively.', level: 3 },
  { japanese: '家に帰ります。', romaji: 'Ie ni kaerimasu.', english: 'I go home.', level: 3 },
  { japanese: '先生は力があります。', romaji: 'Sensei wa chikara ga arimasu.', english: 'The teacher has strength.', level: 3 },
  { japanese: '心がやさしいです。', romaji: 'Kokoro ga yasashii desu.', english: 'The heart is kind.', level: 3 },
  { japanese: '音が大きいです。', romaji: 'Oto ga ookii desu.', english: 'The sound is loud.', level: 3 },
  { japanese: '時をまちます。', romaji: 'Toki o machimasu.', english: 'I wait for the time.', level: 3 },
  { japanese: '友達と話します。', romaji: 'Tomodachi to hanashimasu.', english: 'I talk with my friend.', level: 3 },
  { japanese: '学校で勉強します。', romaji: 'Gakkou de benkyou shimasu.', english: 'I study at school.', level: 3 },
];

export const romajiStories = [
  // Level 1
  { title: 'A Day at the Mountain',
    japanese: '今日は山に行きます。水を持っていきます。山の上で友達とお弁当を食べます。空が青くて、花がたくさん咲いています。',
    romaji: 'Kyou wa yama ni ikimasu. Mizu o motte ikimasu. Yama no ue de tomodachi to obentou o tabemasu. Sora ga aokute, hana ga takusan saiteimasu.',
    english: 'Today I go to the mountain. I bring water. On top of the mountain, I eat lunch with my friend. The sky is blue and many flowers are blooming.',
    level: 1
  },
  { title: 'The Dog and the Cat',
    japanese: '犬と猫は友達です。毎日いっしょに遊びます。山で走ったり、水を飲んだりします。',
    romaji: 'Inu to neko wa tomodachi desu. Mainichi issho ni asobimasu. Yama de hashittari, mizu o nondari shimasu.',
    english: 'The dog and the cat are friends. They play together every day. They run in the mountains and drink water.',
    level: 1
  },
  { title: 'The Sun and the Moon',
    japanese: '昼は太陽が空にあります。夜は月が出ます。人は昼に働き、夜に休みます。',
    romaji: 'Hiru wa taiyou ga sora ni arimasu. Yoru wa tsuki ga demasu. Hito wa hiru ni hataraki, yoru ni yasumimasu.',
    english: 'The sun is in the sky during the day. The moon comes out at night. People work during the day and rest at night.',
    level: 1
  },
  { title: 'The Cat and the Car',
    japanese: '猫は車の上で寝ています。先生が猫を見つけて、「おはよう」と言いました。猫は先生の本の上にジャンプしました。',
    romaji: 'Neko wa kuruma no ue de neteimasu. Sensei ga neko o mitsukete, "ohayou" to iimashita. Neko wa sensei no hon no ue ni janpu shimashita.',
    english: 'The cat is sleeping on the car. The teacher found the cat and said, "Good morning." The cat jumped onto the teacher\'s book.',
    level: 2
  },
  { title: 'The River and the Fish',
    japanese: '川には魚がたくさんいます。鳥が空を飛んでいます。花が川のそばに咲いています。',
    romaji: 'Kawa ni wa sakana ga takusan imasu. Tori ga sora o tondeimasu. Hana ga kawa no soba ni saiteimasu.',
    english: 'There are many fish in the river. Birds are flying in the sky. Flowers are blooming by the river.',
    level: 2
  },
  { title: 'The Book and the Teacher',
    japanese: '先生は毎日本を読みます。生徒は先生の話を聞きます。学校で勉強します。',
    romaji: 'Sensei wa mainichi hon o yomimasu. Seito wa sensei no hanashi o kikimasu. Gakkou de benkyou shimasu.',
    english: 'The teacher reads a book every day. The students listen to the teacher. They study at school.',
    level: 2
  },
  { title: 'The Town and the Road',
    japanese: '町には道がたくさんあります。車が走っています。人が歩いています。',
    romaji: 'Machi ni wa michi ga takusan arimasu. Kuruma ga hashitteimasu. Hito ga aruiteimasu.',
    english: 'There are many roads in the town. Cars are running. People are walking.',
    level: 3
  },
  { title: 'The House and the Heart',
    japanese: '家には家族がいます。心があたたかいです。友達もよく来ます。',
    romaji: 'Ie ni wa kazoku ga imasu. Kokoro ga atatakai desu. Tomodachi mo yoku kimasu.',
    english: 'There is family in the house. Their hearts are warm. Friends often come too.',
    level: 3
  },
  { title: 'The Power of Sound',
    japanese: '音楽の音は大きいです。時々静かです。心が楽しくなります。',
    romaji: 'Ongaku no oto wa ookii desu. Tokidoki shizuka desu. Kokoro ga tanoshiku narimasu.',
    english: 'The sound of music is loud. Sometimes it is quiet. The heart becomes happy.',
    level: 3
  },
  { title: 'The Teacher and the Time',
    japanese: '先生は時間を大切にします。生徒は先生と一緒に勉強します。',
    romaji: 'Sensei wa jikan o taisetsu ni shimasu. Seito wa sensei to issho ni benkyou shimasu.',
    english: 'The teacher values time. The students study together with the teacher.',
    level: 3
  },
]; 