import React from 'react';
import {
  Movie as MovieIcon,
  SportsEsports as GamesIcon,
  TempleBuddhist as ShintoIcon,
  History as HistoryIcon,
  Restaurant as FoodIcon,
  AutoStories as MythologyIcon,
} from '@mui/icons-material';

export interface TriviaItem {
  title: {
    japanese: string;
    romaji: string;
    english: string;
  };
  description: {
    japanese: string;
    romaji: string;
    english: string;
  };
  details: {
    japanese: string;
    romaji: string;
    english: string;
  };
  examples?: {
    japanese: string;
    romaji: string;
    english: string;
  }[];
  icon: React.ReactNode;
}

export interface TriviaTopic {
  title: string;
  icon: React.ReactNode;
  content: TriviaItem[];
}

export const triviaTopics: TriviaTopic[] = [
  {
    title: 'Anime & Manga',
    icon: <MovieIcon />,
    content: [
      {
        title: {
          japanese: 'アニメと漫画の歴史 (アニメとまんがのれきし)',
          romaji: 'anime to manga no rekishi',
          english: 'History of Anime and Manga'
        },
        description: {
          japanese: 'アニメと漫画は日本のポップカルチャーの重要な部分です。',
          romaji: 'Anime to manga wa nihon no poppu karuchā no jūyō na bubun desu.',
          english: 'Anime and manga are significant parts of Japanese pop culture.'
        },
        details: {
          japanese: 'アニメの歴史は1917年に始まり、漫画は12世紀の絵巻物に起源があります。現代の漫画は戦後、手塚治虫によって大きく発展しました。',
          romaji: 'Anime no rekishi wa 1917-nen ni hajimari, manga wa 12-seiki no emakimono ni kigen ga arimasu. Gendai no manga wa sengo, Tezuka Osamu ni yotte ōkiku hatten shimashita.',
          english: 'Anime history began in 1917, while manga has origins in 12th-century picture scrolls. Modern manga was greatly developed after World War II by Osamu Tezuka.'
        },
        examples: [
          {
            japanese: '「鉄腕アトム」は日本初のテレビアニメシリーズです。',
            romaji: '"Tetsuwan Atomu" wa nihon hatsu no terebi anime shirīzu desu.',
            english: '"Astro Boy" was Japan\'s first TV anime series.'
          },
          {
            japanese: '「ドラゴンボール」は世界で最も影響力のある漫画の一つです。',
            romaji: '"Doragon Bōru" wa sekai de mottomo eikyōryoku no aru manga no hitotsu desu.',
            english: '"Dragon Ball" is one of the most influential manga worldwide.'
          }
        ],
        icon: <MovieIcon />
      },
      {
        title: {
          japanese: 'アニメのジャンル (アニメのジャンル)',
          romaji: 'anime no janru',
          english: 'Anime Genres'
        },
        description: {
          japanese: 'アニメには様々なジャンルがあり、それぞれ独自の特徴があります。',
          romaji: 'Anime niwa samazama na janru ga ari, sorezore dokuji no tokuchō ga arimasu.',
          english: 'Anime encompasses various genres, each with its own unique characteristics.'
        },
        details: {
          japanese: '主なジャンルには、アクション、ロマンス、SF、ファンタジー、スポーツ、日常、メカ、魔法少女などがあります。',
          romaji: 'Omona janru niwa, akushon, romansu, SF, fantajī, supōtsu, nichijō, meka, mahō shōjo nado ga arimasu.',
          english: 'Main genres include action, romance, sci-fi, fantasy, sports, slice of life, mecha, and magical girls.'
        },
        examples: [
          {
            japanese: '「進撃の巨人」はダークファンタジーとアクションの要素を持つ人気作品です。',
            romaji: '"Shingeki no Kyojin" wa dāku fantajī to akushon no yōso wo motsu ninki sakuhin desu.',
            english: '"Attack on Titan" is a popular work combining dark fantasy and action elements.'
          }
        ],
        icon: <MovieIcon />
      },
      {
        title: {
          japanese: 'アニメの制作過程 (アニメのせいさくかてい)',
          romaji: 'anime no seisaku katei',
          english: 'Anime Production Process'
        },
        description: {
          japanese: 'アニメの制作は複雑な工程を経て、多くの専門家の協力によって作られます。',
          romaji: 'Anime no seisaku wa fukuzatsu na kōtei wo hete, ōku no senmonka no kyōryoku ni yotte tsukuraremasu.',
          english: 'Anime production involves complex processes and requires collaboration from many specialists.'
        },
        details: {
          japanese: '企画、脚本、絵コンテ、原画、動画、背景、色彩、撮影、編集、音響など、多くの工程があります。一話の制作に数ヶ月かかることも珍しくありません。',
          romaji: 'Kikaku, kyakuhon, ekonte, genga, dōga, haikei, shikisai, satsuei, henshū, onkyō nado, ōku no kōtei ga arimasu. Ichiwashi no seisaku ni sūkagetsu kakaru koto mo mezurashiku arimasen.',
          english: 'The process includes planning, scriptwriting, storyboarding, key animation, in-between animation, background art, coloring, cinematography, editing, and sound design. It\'s not uncommon for a single episode to take several months to produce.'
        },
        examples: [
          {
            japanese: '「千と千尋の神隠し」は制作に3年以上かかりました。',
            romaji: '"Sen to Chihiro no Kamikakushi" wa seisaku ni 3-nen ijō kakarimashita.',
            english: '"Spirited Away" took over 3 years to produce.'
          },
          {
            japanese: 'アニメーターは一日に数百枚の原画を描くこともあります。',
            romaji: 'Animētā wa ichinichi ni sūhyakumai no genga wo kaku koto mo arimasu.',
            english: 'Animators sometimes draw hundreds of key frames in a single day.'
          }
        ],
        icon: <MovieIcon />
      },
      {
        title: {
          japanese: '漫画の表現技法 (まんがのひょうげんぎほう)',
          romaji: 'manga no hyōgen gihō',
          english: 'Manga Expression Techniques'
        },
        description: {
          japanese: '漫画には独特の表現技法があり、感情や動きを効果的に伝えます。',
          romaji: 'Manga niwa dokutoku no hyōgen gihō ga ari, kanjō ya ugoki wo kōkateki ni tsutaemasu.',
          english: 'Manga has unique expression techniques that effectively convey emotions and movement.'
        },
        details: {
          japanese: '効果線、集中線、スピード線、擬音語、擬態語など、様々な技法があります。また、コマ割りや構図も重要な表現手段です。',
          romaji: 'Kōka-sen, shūchū-sen, supīdo-sen, giongo, gitaigo nado, samazama na gihō ga arimasu. Mata, koma-wari ya kōzu mo jūyō na hyōgen shudan desu.',
          english: 'Techniques include speed lines, focus lines, onomatopoeia, and mimetic words. Panel layout and composition are also important means of expression.'
        },
        examples: [
          {
            japanese: '「ワンピース」の尾田栄一郎は、効果的な構図で有名です。',
            romaji: '"Wanpīsu" no Oda Eiichirō wa, kōkateki na kōzu de yūmei desu.',
            english: 'Eiichiro Oda of "One Piece" is famous for his effective compositions.'
          },
          {
            japanese: '「ドラえもん」の藤子・F・不二雄は、擬音語の使い方が特徴的です。',
            romaji: '"Doraemon" no Fujiko F Fujio wa, giongo no tsukaikata ga tokuchōteki desu.',
            english: 'Fujiko F Fujio of "Doraemon" is known for his distinctive use of sound effects.'
          }
        ],
        icon: <MovieIcon />
      }
    ]
  },
  {
    title: 'Japanese Games',
    icon: <GamesIcon />,
    content: [
      {
        title: {
          japanese: '日本のゲーム産業 (にほんのゲームさんぎょう)',
          romaji: 'nihon no gēmu sangyō',
          english: 'Japanese Game Industry'
        },
        description: {
          japanese: '日本はビデオゲーム産業の先駆者であり、多くの有名なゲームシリーズを生み出しています。',
          romaji: 'Nihon wa bideo gēmu sangyō no senkusha de ari, ōku no yūmei na gēmu shirīzu wo umidashiteimasu.',
          english: 'Japan is a pioneer in the video game industry and has created many famous game series.'
        },
        details: {
          japanese: '任天堂、ソニー、セガなどの企業が世界のゲーム文化に大きな影響を与えています。ファミコンからPlayStationまで、日本のゲーム機は常に革新を続けています。',
          romaji: 'Nintendō, Sonī, Sega nado no kigyō ga sekai no gēmu bunka ni ōkina eikyō wo ataeteimasu. Famikon kara PureiSutēshon made, nihon no gēmu ki wa tsune ni kakushin wo tsuzuketeimasu.',
          english: 'Companies like Nintendo, Sony, and Sega have had a major influence on global gaming culture. From the Famicom to PlayStation, Japanese gaming consoles have consistently innovated.'
        },
        examples: [
          {
            japanese: '「スーパーマリオ」シリーズは世界で最も売れているゲームの一つです。',
            romaji: '"Sūpā Mario" shirīzu wa sekai de mottomo ureteiru gēmu no hitotsu desu.',
            english: 'The "Super Mario" series is one of the best-selling games worldwide.'
          },
          {
            japanese: '「ポケットモンスター」は世界で最も成功したメディアミックスの一つです。',
            romaji: '"Poketto Monsutā" wa sekai de mottomo seikō shita media mikkusu no hitotsu desu.',
            english: '"Pokémon" is one of the most successful media mixes worldwide.'
          }
        ],
        icon: <GamesIcon />
      },
      {
        title: {
          japanese: '日本のゲーム文化 (にほんのゲームぶんか)',
          romaji: 'nihon no gēmu bunka',
          english: 'Japanese Gaming Culture'
        },
        description: {
          japanese: '日本のゲーム文化は独特で、アーケードゲームから家庭用ゲームまで多様な楽しみ方があります。',
          romaji: 'Nihon no gēmu bunka wa dokutoku de, ākēdo gēmu kara kateiyō gēmu made tayō na tanoshimikata ga arimasu.',
          english: 'Japanese gaming culture is unique, offering diverse ways to enjoy games from arcades to home consoles.'
        },
        details: {
          japanese: 'ゲームセンター、カプセルトイ、eスポーツなど、日本独自のゲーム文化が発展しています。',
          romaji: 'Gēmu Sentā, kapuseru toi, īsupōtsu nado, nihon dokuji no gēmu bunka ga hatten shiteimasu.',
          english: 'Game centers, capsule toys, and e-sports represent unique aspects of Japanese gaming culture.'
        },
        examples: [
          {
            japanese: '「太鼓の達人」は日本のアーケードゲーム文化を代表する人気ゲームです。',
            romaji: '"Taiko no Tatsujin" wa nihon no ākēdo gēmu bunka wo daihyō suru ninki gēmu desu.',
            english: '"Taiko no Tatsujin" is a popular game representing Japanese arcade culture.'
          }
        ],
        icon: <GamesIcon />
      },
      {
        title: {
          japanese: '日本のゲーム音楽 (にほんのゲームおんがく)',
          romaji: 'nihon no gēmu ongaku',
          english: 'Japanese Game Music'
        },
        description: {
          japanese: '日本のゲーム音楽は独自の進化を遂げ、クラシックから現代音楽まで幅広いジャンルをカバーしています。',
          romaji: 'Nihon no gēmu ongaku wa dokuji no shinka wo toge, kurashikku kara gendai ongaku made habahiroi janru wo kabā shiteimasu.',
          english: 'Japanese game music has evolved uniquely, covering genres from classical to contemporary music.'
        },
        details: {
          japanese: 'ファミコン時代のチップチューンから、オーケストラ、ロック、J-POPまで、様々な音楽がゲームを彩っています。多くの作曲家がゲーム音楽の分野で活躍しています。',
          romaji: 'Famikon jidai no chippu chūn kara, ōkesutora, rokku, J-POP made, samazama na ongaku ga gēmu wo irodotteimasu. Ōku no sakkyokuka ga gēmu ongaku no bun\'ya de katsuyaku shiteimasu.',
          english: 'From Famicom-era chiptunes to orchestral, rock, and J-POP, various music styles enhance games. Many composers are active in the game music field.'
        },
        examples: [
          {
            japanese: '「ファイナルファンタジー」の植松伸夫は、ゲーム音楽の巨匠として知られています。',
            romaji: '"Fainaru Fantajī" no Uematsu Nobuo wa, gēmu ongaku no kyoshō to shite shirareteimasu.',
            english: 'Nobuo Uematsu of "Final Fantasy" is known as a master of game music.'
          },
          {
            japanese: '「ゼルダの伝説」の近藤浩治は、印象的なメロディーで有名です。',
            romaji: '"Zeruda no Densetsu" no Kondō Kōji wa, inshōteki na merodī de yūmei desu.',
            english: 'Koji Kondo of "The Legend of Zelda" is famous for his memorable melodies.'
          }
        ],
        icon: <GamesIcon />
      },
      {
        title: {
          japanese: 'ゲームの教育利用 (ゲームのきょういくりよう)',
          romaji: 'gēmu no kyōiku riyō',
          english: 'Educational Use of Games'
        },
        description: {
          japanese: '日本のゲームは教育目的でも活用され、学習効果が期待されています。',
          romaji: 'Nihon no gēmu wa kyōiku mokuteki demo katsuyō sare, gakushū kōka ga kitai sareteimasu.',
          english: 'Japanese games are also utilized for educational purposes, with expected learning effects.'
        },
        details: {
          japanese: '言語学習、数学、科学、歴史など、様々な分野でゲームが教育ツールとして使われています。特に、RPGやシミュレーションゲームは効果的な学習手段として注目されています。',
          romaji: 'Gengo gakushū, sūgaku, kagaku, rekishi nado, samazama na bun\'ya de gēmu ga kyōiku tsūru to shite tsukawareteimasu. Tokuni, RPG ya shimyurēshon gēmu wa kōkateki na gakushū shudan to shite chūmoku sareteimasu.',
          english: 'Games are used as educational tools in various fields including language learning, mathematics, science, and history. RPGs and simulation games are particularly noted as effective learning tools.'
        },
        examples: [
          {
            japanese: '「ドラクエ」シリーズは、漢字学習に活用されることがあります。',
            romaji: '"Dorakue" shirīzu wa, kanji gakushū ni katsuyō sareru koto ga arimasu.',
            english: 'The "Dragon Quest" series is sometimes used for kanji learning.'
          },
          {
            japanese: '「桃太郎電鉄」は地理学習に役立つゲームとして知られています。',
            romaji: '"Momotarō Dentetsu" wa chiri gakushū ni yakudatsu gēmu to shite shirareteimasu.',
            english: '"Momotaro Dentetsu" is known as a game useful for geography learning.'
          }
        ],
        icon: <GamesIcon />
      }
    ]
  },
  {
    title: 'Shintoism',
    icon: <ShintoIcon />,
    content: [
      {
        title: {
          japanese: '神道の基本 (しんとうのきほん)',
          romaji: 'shintō no kihon',
          english: 'Basics of Shinto'
        },
        description: {
          japanese: '神道は日本固有の宗教で、自然と祖先を崇拝する多神教です。',
          romaji: 'Shintō wa nihon koyū no shūkyō de, shizen to sosen wo sūhai suru tashinkyō desu.',
          english: 'Shinto is Japan\'s indigenous religion, a polytheistic faith that worships nature and ancestors.'
        },
        details: {
          japanese: '神道には「八百万の神」という概念があり、自然現象や祖先の霊を神として崇拝します。神社は神道の中心的な施設で、様々な儀式や祭りが行われます。',
          romaji: 'Shintō niwa "yaoyorozu no kami" to iu gainen ga ari, shizen genshō ya sosen no rei wo kami to shite sūhai shimasu. Jinja wa shintō no chūshinteki na shisetsu de, samazama na gishiki ya matsuri ga okonawaremasu.',
          english: 'Shinto has the concept of "eight million gods," worshiping natural phenomena and ancestral spirits as deities. Shrines are central facilities where various ceremonies and festivals are held.'
        },
        examples: [
          {
            japanese: '初詣では、新年に神社を訪れ、一年の幸運を祈ります。',
            romaji: 'Hatsumōde dewa, shinnen ni jinja wo otozure, ichinen no kōun wo inorimasu.',
            english: 'During Hatsumōde, people visit shrines in the new year to pray for good fortune.'
          },
          {
            japanese: '七五三は、子供の成長を祝う重要な神道の儀式です。',
            romaji: 'Shichi-go-san wa, kodomo no seichō wo iwau jūyō na shintō no gishiki desu.',
            english: 'Shichi-go-san is an important Shinto ceremony celebrating children\'s growth.'
          }
        ],
        icon: <ShintoIcon />
      },
      {
        title: {
          japanese: '神道の祭りと儀式 (しんとうのまつりとぎしき)',
          romaji: 'shintō no matsuri to gishiki',
          english: 'Shinto Festivals and Rituals'
        },
        description: {
          japanese: '神道の祭りと儀式は、日本の文化と生活に深く根付いています。',
          romaji: 'Shintō no matsuri to gishiki wa, nihon no bunka to seikatsu ni fukaku nezuita imasu.',
          english: 'Shinto festivals and rituals are deeply rooted in Japanese culture and daily life.'
        },
        details: {
          japanese: '祭りには、神輿、山車、神楽などの伝統的な要素が含まれます。また、お祓いやお守りなどの日常的な儀式も神道の重要な部分です。',
          romaji: 'Matsuri niwa, mikoshi, dashi, kagura nado no dentōteki na yōso ga fukumaremasu. Mata, oharai ya omamori nado no nichijōteki na gishiki mo shintō no jūyō na bubun desu.',
          english: 'Festivals include traditional elements like mikoshi (portable shrines), dashi (festival floats), and kagura (sacred dance). Daily rituals like purification and omamori (amulets) are also important aspects of Shinto.'
        },
        examples: [
          {
            japanese: '祇園祭は、京都で行われる最も有名な神道の祭りの一つです。',
            romaji: 'Gion Matsuri wa, Kyōto de okonawareru mottomo yūmei na shintō no matsuri no hitotsu desu.',
            english: 'The Gion Festival is one of the most famous Shinto festivals held in Kyoto.'
          }
        ],
        icon: <ShintoIcon />
      },
      {
        title: {
          japanese: '神道の建築様式 (しんとうのけんちくようしき)',
          romaji: 'shintō no kenchiku yōshiki',
          english: 'Shinto Architecture'
        },
        description: {
          japanese: '神社の建築は独特の様式を持ち、自然との調和を重視しています。',
          romaji: 'Jinja no kenchiku wa dokutoku no yōshiki wo mochi, shizen to no chōwa wo jūshi shiteimasu.',
          english: 'Shrine architecture has unique styles that emphasize harmony with nature.'
        },
        details: {
          japanese: '鳥居、拝殿、本殿、神楽殿など、神社の建物にはそれぞれ重要な役割があります。建築様式は時代や地域によって異なり、様々な特徴があります。',
          romaji: 'Torii, haiden, honden, kagura-den nado, jinja no tatemono niwa sorezore jūyō na yakuwari ga arimasu. Kenchiku yōshiki wa jidai ya chiiki ni yotte kotonari, samazama na tokuchō ga arimasu.',
          english: 'Shrine buildings like torii gates, worship halls, main halls, and kagura stages each have important roles. Architectural styles vary by era and region, with various characteristics.'
        },
        examples: [
          {
            japanese: '伊勢神宮は、20年ごとに式年遷宮が行われます。',
            romaji: 'Ise Jingū wa, 20-nen goto ni shikinen sengū ga okonawaremasu.',
            english: 'Ise Grand Shrine undergoes Shikinen Sengu (rebuilding) every 20 years.'
          },
          {
            japanese: '出雲大社の大社造りは、日本最古の建築様式の一つです。',
            romaji: 'Izumo Taisha no taisha-zukuri wa, nihon saiko no kenchiku yōshiki no hitotsu desu.',
            english: 'The Taisha-zukuri style of Izumo Grand Shrine is one of Japan\'s oldest architectural styles.'
          }
        ],
        icon: <ShintoIcon />
      },
      {
        title: {
          japanese: '神道と自然 (しんとうとしぜん)',
          romaji: 'shintō to shizen',
          english: 'Shinto and Nature'
        },
        description: {
          japanese: '神道は自然との深い結びつきを持ち、自然現象を神として崇拝します。',
          romaji: 'Shintō wa shizen to no fukai musubitsuki wo mochi, shizen genshō wo kami to shite sūhai shimasu.',
          english: 'Shinto has a deep connection with nature, worshiping natural phenomena as deities.'
        },
        details: {
          japanese: '山、川、海、森など、自然の要素は神道において特別な意味を持ちます。御神木や磐座など、自然物を神の依り代として祀る習慣があります。',
          romaji: 'Yama, kawa, umi, mori nado, shizen no yōso wa shintō ni oite tokubetsu na imi wo mochimasu. Goshinboku ya iwakura nado, shizenbutsu wo kami no yorishiro to shite matsuru shūkan ga arimasu.',
          english: 'Natural elements like mountains, rivers, oceans, and forests have special meaning in Shinto. There are traditions of worshiping natural objects like sacred trees and rock formations as vessels for the gods.'
        },
        examples: [
          {
            japanese: '富士山は神道の重要な聖地として崇拝されています。',
            romaji: 'Fujisan wa shintō no jūyō na seichi to shite sūhai sareteimasu.',
            english: 'Mount Fuji is worshiped as an important sacred site in Shinto.'
          },
          {
            japanese: '三輪山は、日本最古の神社の一つである大神神社の御神体です。',
            romaji: 'Miwasan wa, nihon saiko no jinja no hitotsu de aru Ōmiwa Jinja no goshintai desu.',
            english: 'Mount Miwa is the sacred object of Ōmiwa Shrine, one of Japan\'s oldest shrines.'
          }
        ],
        icon: <ShintoIcon />
      },
      {
        title: {
          japanese: '主要な神々 (しゅようなかみがみ)',
          romaji: 'shuyō na kamigami',
          english: 'Major Shinto Deities'
        },
        description: {
          japanese: '神道には、様々な役割を持つ重要な神々が存在します。',
          romaji: 'Shintō niwa, samazama na yakuwari wo motsu jūyō na kamigami ga sonzai shimasu.',
          english: 'Shinto has many important deities with various roles and responsibilities.'
        },
        details: {
          japanese: '天照大神（太陽の女神）、月読命（月の神）、素戔嗚尊（嵐と海の神）、大国主命（国造りの神）、稲荷神（農業と商売の神）など、それぞれの神々は特定の領域を司り、人々の生活に深く関わっています。また、七福神や地蔵菩薩など、民間信仰と結びついた神々も存在します。',
          romaji: 'Amaterasu Ōmikami (taiyō no megami), Tsukuyomi no Mikoto (tsuki no kami), Susanoo no Mikoto (arashi to umi no kami), Ōkuninushi no Mikoto (kunizukuri no kami), Inari no Kami (nōgyō to shōbai no kami) nado, sorezore no kamigami wa tokutei no ryōiki wo tsukasadori, hitobito no seikatsu ni fukaku kakawatteimasu. Mata, Shichifukujin ya Jizō Bosatsu nado, minkan shinkō to musubitsuita kamigami mo sonzai shimasu.',
          english: 'Deities like Amaterasu (sun goddess), Tsukuyomi (moon god), Susanoo (god of storms and sea), Ōkuninushi (god of nation-building), and Inari (god of agriculture and commerce) each govern specific domains and deeply influence people\'s lives. There are also deities connected to folk beliefs, such as the Seven Lucky Gods and Jizō Bodhisattva.'
        },
        examples: [
          {
            japanese: '天照大神は、皇室の祖神として最も重要な神の一人です。',
            romaji: 'Amaterasu Ōmikami wa, kōshitsu no soshin to shite mottomo jūyō na kami no hitori desu.',
            english: 'Amaterasu is one of the most important deities as the ancestral deity of the imperial family.'
          },
          {
            japanese: '稲荷神は、全国の稲荷神社で祀られ、商売繁盛の神として信仰されています。',
            romaji: 'Inari no Kami wa, zenkoku no Inari Jinja de matsurare, shōbai hanjō no kami to shite shinkō sareteimasu.',
            english: 'Inari is enshrined at Inari shrines nationwide and is worshiped as the god of business prosperity.'
          },
          {
            japanese: '七福神は、福をもたらす七柱の神々で、特に正月に信仰されます。',
            romaji: 'Shichifukujin wa, fuku wo motarasu nanahashira no kamigami de, tokuni shōgatsu ni shinkō saremasu.',
            english: 'The Seven Lucky Gods are seven deities who bring good fortune, especially worshiped during the New Year.'
          }
        ],
        icon: <ShintoIcon />
      }
    ]
  },
  {
    title: 'Japanese History',
    icon: <HistoryIcon />,
    content: [
      {
        title: {
          japanese: '日本の歴史時代 (にほんのれきしじだい)',
          romaji: 'nihon no rekishi jidai',
          english: 'Japanese Historical Periods'
        },
        description: {
          japanese: '日本の歴史は、古代から現代まで、豊かな文化と伝統を育んできました。',
          romaji: 'Nihon no rekishi wa, kodai kara gendai made, yutaka na bunka to dentō wo hagukunde kimashita.',
          english: 'Japanese history, from ancient times to the present, has nurtured a rich culture and traditions.'
        },
        details: {
          japanese: '縄文時代から令和時代まで、各時代は独自の特徴と発展を持っています。特に、平安時代の貴族文化、戦国時代の武士文化、江戸時代の町人文化は、現代の日本文化に大きな影響を与えています。',
          romaji: 'Jōmon jidai kara Reiwa jidai made, kakujidai wa dokuji no tokuchō to hatten wo motteimasu. Tokuni, Heian jidai no kizoku bunka, Sengoku jidai no bushi bunka, Edo jidai no chōnin bunka wa, gendai no nihon bunka ni ōkina eikyō wo ataeteimasu.',
          english: 'From the Jōmon period to the Reiwa era, each period has its distinct characteristics and developments. Particularly, the aristocratic culture of the Heian period, the samurai culture of the Sengoku period, and the merchant culture of the Edo period have greatly influenced modern Japanese culture.'
        },
        examples: [
          {
            japanese: '平安時代は、『源氏物語』などの文学作品が生まれ、貴族文化が栄えました。',
            romaji: 'Heian jidai wa, "Genji Monogatari" nado no bungaku sakuhin ga umare, kizoku bunka ga sakaemashita.',
            english: 'The Heian period saw the creation of literary works like "The Tale of Genji" and the flourishing of aristocratic culture.'
          },
          {
            japanese: '江戸時代は、歌舞伎や浮世絵など、独自の文化が発展しました。',
            romaji: 'Edo jidai wa, kabuki ya ukiyo-e nado, dokuji no bunka ga hatten shimashita.',
            english: 'The Edo period saw the development of unique cultural forms like kabuki and ukiyo-e.'
          }
        ],
        icon: <HistoryIcon />
      },
      {
        title: {
          japanese: '日本の歴史的人物 (にほんのれきしてきじんぶつ)',
          romaji: 'nihon no rekishiteki jinbutsu',
          english: 'Historical Figures of Japan'
        },
        description: {
          japanese: '日本の歴史には、多くの重要な人物が登場し、社会や文化に大きな影響を与えました。',
          romaji: 'Nihon no rekishi niwa, ōku no jūyō na jinbutsu ga tōjō shi, shakai ya bunka ni ōkina eikyō wo ataemashita.',
          english: 'Many important figures have emerged in Japanese history, greatly influencing society and culture.'
        },
        details: {
          japanese: '政治家、武士、芸術家、作家など、様々な分野で活躍した人物たちが、日本の歴史を形作ってきました。',
          romaji: 'Seijika, bushi, geijutsuka, sakka nado, samazama na bun\'ya de katsuyaku shita jinbutsu-tachi ga, nihon no rekishi wo katachizutte kimashita.',
          english: 'Politicians, warriors, artists, writers, and others have shaped Japanese history through their contributions in various fields.'
        },
        examples: [
          {
            japanese: '織田信長は、戦国時代を統一へと導いた重要な武将です。',
            romaji: 'Oda Nobunaga wa, Sengoku jidai wo tōitsu e to michibita jūyō na bushō desu.',
            english: 'Oda Nobunaga was an important military commander who led the unification of the Sengoku period.'
          },
          {
            japanese: '紫式部は、『源氏物語』を書いた平安時代の代表的な作家です。',
            romaji: 'Murasaki Shikibu wa, "Genji Monogatari" wo kaita Heian jidai no daihyōteki na sakka desu.',
            english: 'Murasaki Shikibu was a representative writer of the Heian period who wrote "The Tale of Genji."'
          }
        ],
        icon: <HistoryIcon />
      }
    ]
  },
  {
    title: 'Japanese Cuisine',
    icon: <FoodIcon />,
    content: [
      {
        title: {
          japanese: '日本料理の基本 (にほんりょうりのきほん)',
          romaji: 'nihon ryōri no kihon',
          english: 'Basics of Japanese Cuisine'
        },
        description: {
          japanese: '日本料理は、新鮮な食材と繊細な調理技術を特徴とする世界遺産に登録されています。',
          romaji: 'Nihon ryōri wa, shinsen na shokuzai to sensai na chōri gijutsu wo tokuchō to suru sekai isan ni tōroku sareteimasu.',
          english: 'Japanese cuisine, characterized by fresh ingredients and delicate cooking techniques, is registered as a UNESCO World Heritage.'
        },
        details: {
          japanese: '「うま味」を重視し、季節の食材を活かした調理法が特徴です。また、「一汁三菜」という伝統的な食事形式があり、栄養バランスを考慮しています。',
          romaji: '"Umami" wo jūshi shi, kisetsu no shokuzai wo ikashita chōrihō ga tokuchō desu. Mata, "ichijū sansai" to iu dentōteki na shokuji keishiki ga ari, eiyō baransu wo kōryo shiteimasu.',
          english: 'It emphasizes "umami" and features cooking methods that highlight seasonal ingredients. The traditional "ichijū sansai" (one soup, three dishes) meal format considers nutritional balance.'
        },
        examples: [
          {
            japanese: '寿司は、新鮮な魚と酢飯を組み合わせた代表的な日本料理です。',
            romaji: 'Sushi wa, shinsen na sakana to sumeshi wo kumiawaseta daihyōteki na nihon ryōri desu.',
            english: 'Sushi is a representative Japanese dish combining fresh fish with vinegared rice.'
          },
          {
            japanese: '懐石料理は、季節の食材を使い、見た目も味も大切にする伝統的な料理です。',
            romaji: 'Kaiseki ryōri wa, kisetsu no shokuzai wo tsukai, mitame mo aji mo taisetsu ni suru dentōteki na ryōri desu.',
            english: 'Kaiseki cuisine is a traditional style that uses seasonal ingredients and values both appearance and taste.'
          }
        ],
        icon: <FoodIcon />
      },
      {
        title: {
          japanese: '日本の郷土料理 (にほんのきょうどりょうり)',
          romaji: 'nihon no kyōdo ryōri',
          english: 'Japanese Regional Cuisine'
        },
        description: {
          japanese: '日本の各地域には、その土地ならではの特色ある料理があります。',
          romaji: 'Nihon no kakuchiiki niwa, sono tochi nara dewa no tokushoku aru ryōri ga arimasu.',
          english: 'Each region of Japan has its own unique local cuisine.'
        },
        details: {
          japanese: '気候、地理的条件、歴史的背景などにより、各地域で独自の食文化が発展してきました。',
          romaji: 'Kikō, chiri-teki jōken, rekishi-teki haikei nado ni yori, kakuchiiki de dokuji no shokubunka ga hatten shite kimashita.',
          english: 'Local food cultures have developed uniquely in each region due to climate, geographical conditions, and historical background.'
        },
        examples: [
          {
            japanese: '北海道のジンギスカンは、羊肉を使った独特の鍋料理です。',
            romaji: 'Hokkaidō no Jingisukan wa, yōniku wo tsukatta dokutoku no naberyōri desu.',
            english: 'Hokkaido\'s Jingisukan is a unique hot pot dish using lamb meat.'
          },
          {
            japanese: '沖縄のゴーヤチャンプルーは、ゴーヤと豆腐を使った代表的な郷土料理です。',
            romaji: 'Okinawa no gōyā chanpurū wa, gōyā to tōfu wo tsukatta daihyōteki na kyōdo ryōri desu.',
            english: 'Okinawa\'s Goya Chanpurū is a representative local dish using bitter melon and tofu.'
          }
        ],
        icon: <FoodIcon />
      }
    ]
  },
  {
    title: 'Japanese Mythology',
    icon: <MythologyIcon />,
    content: [
      {
        title: {
          japanese: '日本の神話 (にほんのしんわ)',
          romaji: 'nihon no shinwa',
          english: 'Japanese Mythology'
        },
        description: {
          japanese: '日本の神話は、古事記と日本書紀に記録された豊かな物語の宝庫です。',
          romaji: 'Nihon no shinwa wa, Kojiki to Nihon Shoki ni kiroku sareta yutaka na monogatari no hōko desu.',
          english: 'Japanese mythology is a rich treasury of stories recorded in the Kojiki and Nihon Shoki.'
        },
        details: {
          japanese: '天地創造から神々の物語、英雄伝説まで、日本の神話は様々な要素を含んでいます。特に、天照大神、スサノオ、大国主命などの神々の物語は、日本の文化に深い影響を与えています。',
          romaji: 'Tenchi sōzō kara kamigami no monogatari, eiyū densetsu made, nihon no shinwa wa samazama na yōso wo fukundeimasu. Tokuni, Amaterasu Ōmikami, Susanoo, Ōkuninushi nado no kamigami no monogatari wa, nihon no bunka ni fukai eikyō wo ataeteimasu.',
          english: 'From creation myths to tales of gods and heroic legends, Japanese mythology encompasses various elements. Stories of deities like Amaterasu, Susanoo, and Ōkuninushi have deeply influenced Japanese culture.'
        },
        examples: [
          {
            japanese: '天照大神は太陽の女神で、皇室の祖神とされています。',
            romaji: 'Amaterasu Ōmikami wa taiyō no megami de, kōshitsu no soshin to sareteimasu.',
            english: 'Amaterasu is the sun goddess and is considered the ancestral deity of the imperial family.'
          },
          {
            japanese: 'スサノオは、八岐大蛇を退治したことで知られる神です。',
            romaji: 'Susanoo wa, Yamata no Orochi wo taiji shita koto de shirareru kami desu.',
            english: 'Susanoo is known as the god who defeated the eight-headed serpent Yamata no Orochi.'
          }
        ],
        icon: <MythologyIcon />
      },
      {
        title: {
          japanese: '神話の英雄たち (しんわのえいゆうたち)',
          romaji: 'shinwa no eiyū-tachi',
          english: 'Mythological Heroes'
        },
        description: {
          japanese: '日本の神話には、多くの英雄が登場し、様々な冒険を繰り広げます。',
          romaji: 'Nihon no shinwa niwa, ōku no eiyū ga tōjō shi, samazama na bōken wo kurihirogemasu.',
          english: 'Japanese mythology features many heroes who embark on various adventures.'
        },
        details: {
          japanese: 'ヤマトタケル、イザナギ、イザナミなど、神話の英雄たちは、日本の国土や文化の形成に重要な役割を果たしました。彼らの物語は、現代の文学や芸術にも影響を与え続けています。',
          romaji: 'Yamato Takeru, Izanagi, Izanami nado, shinwa no eiyū-tachi wa, nihon no kokudo ya bunka no keisei ni jūyō na yakuwari wo hatashimashita. Karera no monogatari wa, gendai no bungaku ya geijutsu ni mo eikyō wo ataetsuzuketeimasu.',
          english: 'Heroes like Yamato Takeru, Izanagi, and Izanami played crucial roles in shaping Japan\'s land and culture. Their stories continue to influence modern literature and art.'
        },
        examples: [
          {
            japanese: 'ヤマトタケルは、日本各地を平定した伝説の英雄です。',
            romaji: 'Yamato Takeru wa, nihon kakuchi wo heitei shita densetsu no eiyū desu.',
            english: 'Yamato Takeru is a legendary hero who pacified various regions of Japan.'
          },
          {
            japanese: 'イザナギとイザナミは、日本の国土を生み出した夫婦の神です。',
            romaji: 'Izanagi to Izanami wa, nihon no kokudo wo umidashita fūfu no kami desu.',
            english: 'Izanagi and Izanami are the divine couple who created the Japanese islands.'
          }
        ],
        icon: <MythologyIcon />
      },
      {
        title: {
          japanese: '神話の生き物 (しんわのいきもの)',
          romaji: 'shinwa no ikimono',
          english: 'Mythological Creatures'
        },
        description: {
          japanese: '日本の神話には、様々な不思議な生き物が登場します。',
          romaji: 'Nihon no shinwa niwa, samazama na fushigi na ikimono ga tōjō shimasu.',
          english: 'Japanese mythology features various mysterious creatures.'
        },
        details: {
          japanese: '龍、鳳凰、麒麟、天狗、河童など、神話の生き物たちは、それぞれ独特の特徴と物語を持っています。これらの生き物は、現代のポップカルチャーにも影響を与えています。',
          romaji: 'Ryū, hōō, kirin, tengu, kappa nado, shinwa no ikimono-tachi wa, sorezore dokutoku no tokuchō to monogatari wo motteimasu. Korera no ikimono wa, gendai no poppu karuchā ni mo eikyō wo ataeteimasu.',
          english: 'Creatures like dragons, phoenixes, kirin, tengu, and kappa each have unique characteristics and stories. These creatures continue to influence modern pop culture.'
        },
        examples: [
          {
            japanese: '天狗は、山に住む神通力を持つ伝説の生き物です。',
            romaji: 'Tengu wa, yama ni sumu jinzūryoku wo motsu densetsu no ikimono desu.',
            english: 'Tengu are legendary creatures with supernatural powers who live in mountains.'
          },
          {
            japanese: '河童は、川や池に住む水の妖怪として知られています。',
            romaji: 'Kappa wa, kawa ya ike ni sumu mizu no yōkai to shite shirareteimasu.',
            english: 'Kappa are known as water spirits that live in rivers and ponds.'
          }
        ],
        icon: <MythologyIcon />
      },
      {
        title: {
          japanese: '神話と自然現象 (しんわとしぜんげんしょう)',
          romaji: 'shinwa to shizen genshō',
          english: 'Mythology and Natural Phenomena'
        },
        description: {
          japanese: '日本の神話では、自然現象が神々の行いとして説明されています。',
          romaji: 'Nihon no shinwa dewa, shizen genshō ga kamigami no okonai to shite setsumei sareteimasu.',
          english: 'In Japanese mythology, natural phenomena are explained as the actions of deities.'
        },
        details: {
          japanese: '地震、雷、台風、火山の噴火など、様々な自然現象が神話の中で物語られています。これらの物語は、自然への畏敬の念を表現し、自然との共生の大切さを伝えています。',
          romaji: 'Jishin, kaminari, taifū, kazan no funka nado, samazama na shizen genshō ga shinwa no naka de monogatara reteimasu. Korera no monogatari wa, shizen e no ikei no nen wo hyōgen shi, shizen to no kyōsei no taisetsusa wo tsutaeteimasu.',
          english: 'Various natural phenomena like earthquakes, lightning, typhoons, and volcanic eruptions are narrated in mythology. These stories express reverence for nature and convey the importance of coexistence with nature.'
        },
        examples: [
          {
            japanese: '雷神は、雷と稲妻を司る神として崇拝されています。',
            romaji: 'Raijin wa, kaminari to inazuma wo tsukasadoru kami to shite sūhai sareteimasu.',
            english: 'Raijin is worshiped as the god who controls thunder and lightning.'
          },
          {
            japanese: '風神は、風を司る神で、台風や嵐を起こすとされています。',
            romaji: 'Fūjin wa, kaze wo tsukasadoru kami de, taifū ya arashi wo okosu to sareteimasu.',
            english: 'Fujin is the god of wind, said to cause typhoons and storms.'
          }
        ],
        icon: <MythologyIcon />
      }
    ]
  }
]; 