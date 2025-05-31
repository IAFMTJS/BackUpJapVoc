import React from 'react';
import {
  Brush as BrushIcon,
  SportsKabaddi as SportsKabaddiIcon,
  Celebration as CelebrationIcon,
  Spa as SpaIcon,
  School as SchoolIcon,
  Festival as FestivalIcon,
  Checkroom as CheckroomIcon,
  Language as LanguageIcon,
  Gavel as GavelIcon,
  Groups as GroupsIcon,
  Restaurant as RestaurantIcon,
  DirectionsBus as TransportIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  EmojiEvents as SportsIcon,
  MusicNote as MusicIcon,
  LocalHospital as HealthIcon,
  Security as SecurityIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

export interface CulturalItem {
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

export interface CulturalTopic {
  title: string;
  icon: React.ReactNode;
  content: CulturalItem[];
}

export const culturalTopics: CulturalTopic[] = [
  {
    title: 'Traditional Arts',
    icon: <BrushIcon />,
    content: [
      {
        title: {
          japanese: '茶道 (さどう)',
          romaji: 'sadou',
          english: 'Tea Ceremony'
        },
        description: {
          japanese: '茶道は日本の伝統的な芸術形式で、抹茶を点て、客人に振る舞う儀式です。',
          romaji: 'Sadou wa nihon no dentouteki na geijutsu keishiki de, matcha wo tate, kyaku ni furumau gishiki desu.',
          english: 'The tea ceremony is a traditional Japanese art form involving the ceremonial preparation and presentation of matcha tea.'
        },
        details: {
          japanese: '茶道は「和敬清寂」の精神を重んじ、一期一会の出会いを大切にします。',
          romaji: 'Sadou wa "wakei seijaku" no seishin wo omonji, ichigo ichie no deai wo taisetsu ni shimasu.',
          english: 'The tea ceremony emphasizes the principles of harmony, respect, purity, and tranquility, valuing each unique encounter.'
        },
        examples: [
          {
            japanese: 'お茶を点てる前に「お手前頂戴いたします」と言います。',
            romaji: 'Ocha wo tateru mae ni "otemae choudai itashimasu" to iimasu.',
            english: 'Before making tea, we say "I will receive your tea preparation."'
          }
        ],
        icon: <BrushIcon />
      }
    ]
  },
  {
    title: 'Martial Arts',
    icon: <SportsKabaddiIcon />,
    content: [
      {
        title: {
          japanese: '武道 (ぶどう)',
          romaji: 'budou',
          english: 'Martial Arts'
        },
        description: {
          japanese: '武道は日本の伝統的な武術で、心身の鍛錬を目的としています。',
          romaji: 'Budou wa nihon no dentouteki na bujutsu de, shinshin no tanren wo mokuteki to shiteimasu.',
          english: 'Martial arts are traditional Japanese combat practices aimed at physical and mental training.'
        },
        details: {
          japanese: '礼に始まり礼に終わる。武道は単なる技術ではなく、人格形成の道でもあります。',
          romaji: 'Rei ni hajimari rei ni owaru. Budou wa tannaru gijutsu dewa naku, jinkaku keisei no michi demo arimasu.',
          english: 'It begins and ends with respect. Martial arts are not just techniques but a path of character development.'
        },
        examples: [
          {
            japanese: '道場に入る時は「お願いします」、出る時は「ありがとうございました」と言います。',
            romaji: 'Doujou ni hairu toki wa "onegaishimasu", deru toki wa "arigatou gozaimashita" to iimasu.',
            english: 'When entering the dojo, we say "please," and when leaving, we say "thank you very much."'
          }
        ],
        icon: <SportsKabaddiIcon />
      }
    ]
  },
  {
    title: 'Festivals',
    icon: <FestivalIcon />,
    content: [
      {
        title: {
          japanese: '祭り (まつり)',
          romaji: 'matsuri',
          english: 'Festivals'
        },
        description: {
          japanese: '日本の祭りは、季節の移り変わりや神様への感謝を祝う伝統的な行事です。',
          romaji: 'Nihon no matsuri wa, kisetsu no utsurikawari ya kamisama he no kansha wo iwau dentouteki na gyouji desu.',
          english: 'Japanese festivals are traditional events that celebrate seasonal changes and express gratitude to the gods.'
        },
        details: {
          japanese: '祭りは地域の文化や伝統を守り、人々の絆を深める大切な機会です。',
          romaji: 'Matsuri wa chiiki no bunka ya dentou wo mamori, hitobito no kizuna wo fukameru taisetsu na kikai desu.',
          english: 'Festivals are important opportunities to preserve local culture and traditions while strengthening community bonds.'
        },
        examples: [
          {
            japanese: '夏祭りでは、浴衣を着て、屋台で食べ物を買い、花火を見ます。',
            romaji: 'Natsumatsuri dewa, yukata wo kite, yatai de tabemono wo kai, hanabi wo mimasu.',
            english: 'At summer festivals, people wear yukata, buy food from stalls, and watch fireworks.'
          }
        ],
        icon: <FestivalIcon />
      }
    ]
  },
  {
    title: 'Traditional Clothing',
    icon: <CheckroomIcon />,
    content: [
      {
        title: {
          japanese: '着物 (きもの)',
          romaji: 'kimono',
          english: 'Kimono'
        },
        description: {
          japanese: '着物は日本の伝統的な衣装で、様々な場面で着用されます。',
          romaji: 'Kimono wa nihon no dentouteki na ishou de, samazama na bamen de chakuyou saremasu.',
          english: 'The kimono is a traditional Japanese garment worn on various occasions.'
        },
        details: {
          japanese: '着物には、振袖、留袖、訪問着など、用途に応じた種類があります。',
          romaji: 'Kimono niwa, furisode, tomesode, houmongi nado, yoto ni oujita shurui ga arimasu.',
          english: 'There are different types of kimono for different occasions, such as furisode (long-sleeved), tomesode (formal), and houmongi (visiting wear).'
        },
        examples: [
          {
            japanese: '成人式では、女性は振袖、男性は紋付き袴を着ます。',
            romaji: 'Seijinshiki dewa, josei wa furisode, dansei wa montsuki hakama wo kimasu.',
            english: 'At coming-of-age ceremonies, women wear furisode and men wear montsuki hakama.'
          }
        ],
        icon: <CheckroomIcon />
      }
    ]
  },
  {
    title: 'Social Etiquette',
    icon: <GroupsIcon />,
    content: [
      {
        title: {
          japanese: '礼儀作法 (れいぎさほう)',
          romaji: 'reigi sahō',
          english: 'Social Etiquette'
        },
        description: {
          japanese: '日本の礼儀作法は、相手への敬意と調和を重んじる文化から生まれています。',
          romaji: 'Nihon no reigi sahō wa, aite he no keii to chōwa wo omonjiru bunka kara umareteimasu.',
          english: 'Japanese social etiquette stems from a culture that values respect and harmony.'
        },
        details: {
          japanese: '挨拶、お辞儀、言葉遣いなど、様々な場面での振る舞い方があります。',
          romaji: 'Aisatsu, ojigi, kotobazukai nado, samazama na bamen de no furumai kata ga arimasu.',
          english: 'There are specific ways of behaving in different situations, including greetings, bowing, and speech patterns.'
        },
        examples: [
          {
            japanese: '目上の人には「です・ます」調を使い、お辞儀は深くします。',
            romaji: 'Meue no hito niwa "desu・masu" chō wo tsukai, ojigi wa fukaku shimasu.',
            english: 'Use polite speech ("desu・masu") with superiors and bow deeply.'
          },
          {
            japanese: '靴を脱ぐ場所では、靴を揃えて置きます。',
            romaji: 'Kutsu wo nugu basho dewa, kutsu wo soroete okimasu.',
            english: 'When taking off shoes, align them neatly.'
          }
        ],
        icon: <GroupsIcon />
      }
    ]
  },
  {
    title: 'Dining Etiquette',
    icon: <RestaurantIcon />,
    content: [
      {
        title: {
          japanese: '食事のマナー (しょくじのマナー)',
          romaji: 'shokuji no manā',
          english: 'Dining Manners'
        },
        description: {
          japanese: '日本の食事マナーは、感謝の気持ちと周囲への配慮を表します。',
          romaji: 'Nihon no shokuji manā wa, kansha no kimochi to shūi he no hairyo wo arawashimasu.',
          english: 'Japanese dining manners express gratitude and consideration for others.'
        },
        details: {
          japanese: '「いただきます」「ごちそうさま」の挨拶、箸の使い方、器の持ち方など、細かい決まりがあります。',
          romaji: '"Itadakimasu" "gochisōsama" no aisatsu, hashi no tsukaikata, utsuwa no mochikata nado, komakai kimari ga arimasu.',
          english: 'There are detailed rules including greetings ("itadakimasu" before eating, "gochisōsama" after), chopstick usage, and how to hold dishes.'
        },
        examples: [
          {
            japanese: '箸で食べ物を刺したり、箸を渡し箸にしたりしてはいけません。',
            romaji: 'Hashi de tabemono wo sasitari, hashi wo watashibashi ni shitari shitewa ikemasen.',
            english: 'Do not stab food with chopsticks or pass food between chopsticks.'
          },
          {
            japanese: '器は手で持ち、口を付けて食べるのが正しい作法です。',
            romaji: 'Utsuwa wa te de mochi, kuchi wo tsukete taberu no ga tadashii sahō desu.',
            english: 'It is proper etiquette to hold dishes with your hands and bring them to your mouth.'
          }
        ],
        icon: <RestaurantIcon />
      }
    ]
  },
  {
    title: 'Public Transportation',
    icon: <TransportIcon />,
    content: [
      {
        title: {
          japanese: '公共交通機関 (こうきょうこうつうきかん)',
          romaji: 'kōkyō kōtsū kikan',
          english: 'Public Transportation'
        },
        description: {
          japanese: '日本の公共交通機関は、時間厳守と秩序を重んじる文化を反映しています。',
          romaji: 'Nihon no kōkyō kōtsū kikan wa, jikan genshu to chitsujo wo omonjiru bunka wo han\'ei shiteimasu.',
          english: 'Japanese public transportation reflects a culture that values punctuality and order.'
        },
        details: {
          japanese: '電車内での携帯電話の使用、優先席の利用、混雑時の振る舞いなど、様々なルールがあります。',
          romaji: 'Denshanai de no keitai denwa no shiyō, yūsen seki no riyō, konzatsu ji no furumai nado, samazama na rūru ga arimasu.',
          english: 'There are various rules regarding mobile phone use on trains, priority seating, and behavior during crowded times.'
        },
        examples: [
          {
            japanese: '優先席付近では携帯電話の電源を切り、通話は控えます。',
            romaji: 'Yūsen seki fukin dewa keitai denwa no dengen wo kiri, tsūwa wa hikaemasu.',
            english: 'Turn off mobile phones near priority seats and avoid making calls.'
          },
          {
            japanese: '朝のラッシュ時は、順番を守り、押し合わないようにします。',
            romaji: 'Asa no rasshu ji wa, junban wo mamori, oshiawanai yō ni shimasu.',
            english: 'During morning rush hour, maintain order and avoid pushing.'
          }
        ],
        icon: <TransportIcon />
      }
    ]
  },
  {
    title: 'Work Culture',
    icon: <WorkIcon />,
    content: [
      {
        title: {
          japanese: '仕事の文化 (しごとのぶんか)',
          romaji: 'shigoto no bunka',
          english: 'Work Culture'
        },
        description: {
          japanese: '日本の仕事文化は、チームワーク、責任感、長時間労働を特徴としています。',
          romaji: 'Nihon no shigoto bunka wa, chīmuwāku, sekininkan, chōjikan rōdō wo tokuchō to shiteimasu.',
          english: 'Japanese work culture is characterized by teamwork, responsibility, and long working hours.'
        },
        details: {
          japanese: '終身雇用、年功序列、社内での上下関係など、独特のシステムがあります。',
          romaji: 'Shūshin koyō, nenkō joretsu, shanai de no jōge kankei nado, dokutoku no shisutemu ga arimasu.',
          english: 'There are unique systems including lifetime employment, seniority-based promotion, and workplace hierarchy.'
        },
        examples: [
          {
            japanese: '「残業」は一般的で、特に新入社員は積極的に参加します。',
            romaji: '"Zangyō" wa ippanteki de, tokuni shinnyū shain wa sekkyokuteki ni sanka shimasu.',
            english: 'Overtime work is common, and new employees especially participate actively.'
          },
          {
            japanese: '飲み会は重要なコミュニケーションの場とされています。',
            romaji: 'Nomikai wa jūyō na komyunikēshon no ba to sareteimasu.',
            english: 'Drinking parties are considered important venues for communication.'
          }
        ],
        icon: <WorkIcon />
      }
    ]
  },
  {
    title: 'Laws and Regulations',
    icon: <GavelIcon />,
    content: [
      {
        title: {
          japanese: '法律と規則 (ほうりつときそく)',
          romaji: 'hōritsu to kisoku',
          english: 'Laws and Regulations'
        },
        description: {
          japanese: '日本の法律と規則は、社会の秩序と安全を守るために制定されています。',
          romaji: 'Nihon no hōritsu to kisoku wa, shakai no chitsujo to anzen wo mamoru tame ni seitei sareteimasu.',
          english: 'Japanese laws and regulations are established to maintain social order and safety.'
        },
        details: {
          japanese: '刑法、民法、交通法など、様々な法律があり、違反には厳しい罰則があります。',
          romaji: 'Keihō, minpō, kōtsūhō nado, samazama na hōritsu ga ari, ihan niwa kibishii bassoku ga arimasu.',
          english: 'There are various laws including criminal, civil, and traffic laws, with strict penalties for violations.'
        },
        examples: [
          {
            japanese: '飲酒運転は厳しく罰せられ、免許取り消しになることもあります。',
            romaji: 'Inshu unten wa kibishiku basserare, menkyo torikeshi ni naru koto mo arimasu.',
            english: 'Drunk driving is severely punished and can result in license revocation.'
          },
          {
            japanese: '路上喫煙は多くの都市で禁止されており、罰金が科せられます。',
            romaji: 'Rojō kitsuen wa ōku no toshi de kinshi sareteori, bakkin ga kaseraremasu.',
            english: 'Smoking on the street is prohibited in many cities and can result in fines.'
          }
        ],
        icon: <GavelIcon />
      }
    ]
  },
  {
    title: 'Sports and Recreation',
    icon: <SportsIcon />,
    content: [
      {
        title: {
          japanese: 'スポーツと娯楽 (スポーツとごらく)',
          romaji: 'supōtsu to goraku',
          english: 'Sports and Recreation'
        },
        description: {
          japanese: '日本のスポーツ文化は、伝統的な武道から現代的なスポーツまで多様です。',
          romaji: 'Nihon no supōtsu bunka wa, dentōteki na budō kara gendaiteki na supōtsu made tayō desu.',
          english: 'Japanese sports culture is diverse, ranging from traditional martial arts to modern sports.'
        },
        details: {
          japanese: '野球、相撲、柔道、剣道など、様々なスポーツが盛んです。',
          romaji: 'Yakyū, sumō, jūdō, kendō nado, samazama na supōtsu ga sakan desu.',
          english: 'Various sports are popular, including baseball, sumo, judo, and kendo.'
        },
        examples: [
          {
            japanese: '高校野球は全国大会がテレビ中継され、国民的なイベントとなっています。',
            romaji: 'Kōkō yakyū wa zenkoku taikai ga terebi chūkei sare, kokuminteki na ibento to natteimasu.',
            english: 'High school baseball tournaments are broadcast nationwide and have become national events.'
          },
          {
            japanese: '相撲は国技として認められ、伝統的な儀式が今も続いています。',
            romaji: 'Sumō wa kokugi toshite mitomerare, dentōteki na gishiki ga ima mo tsuzuiteimasu.',
            english: 'Sumo is recognized as a national sport, with traditional ceremonies continuing to this day.'
          }
        ],
        icon: <SportsIcon />
      }
    ]
  },
  {
    title: 'Health and Wellness',
    icon: <HealthIcon />,
    content: [
      {
        title: {
          japanese: '健康と福祉 (けんこうとふくし)',
          romaji: 'kenkō to fukushi',
          english: 'Health and Wellness'
        },
        description: {
          japanese: '日本の健康システムは、予防医療と長寿を重視しています。',
          romaji: 'Nihon no kenkō shisutemu wa, yobō iryō to chōju wo jūshi shiteimasu.',
          english: 'The Japanese health system emphasizes preventive medicine and longevity.'
        },
        details: {
          japanese: '国民皆保険制度、定期健診、温泉療法など、様々な健康維持の方法があります。',
          romaji: 'Kokumin kai hoken seido, teiki kenshin, onsen ryōhō nado, samazama na kenkō iji no hōhō ga arimasu.',
          english: 'There are various health maintenance methods including universal health insurance, regular check-ups, and hot spring therapy.'
        },
        examples: [
          {
            japanese: '会社では年に一度の健康診断が義務付けられています。',
            romaji: 'Kaisha dewa toshi ni ichido no kenkō shindan ga gimu tsukerareteimasu.',
            english: 'Annual health check-ups are mandatory in companies.'
          },
          {
            japanese: '温泉は心身の疲れを癒す伝統的な方法として親しまれています。',
            romaji: 'Onsen wa shinshin no tsukare wo iyasu dentōteki na hōhō toshite shitashimareteimasu.',
            english: 'Hot springs are cherished as a traditional method of healing physical and mental fatigue.'
          }
        ],
        icon: <HealthIcon />
      }
    ]
  }
];

export const languageRules: CulturalTopic[] = [
  {
    title: 'Politeness Levels',
    icon: <SchoolIcon />,
    content: [
      {
        title: {
          japanese: '敬語 (けいご)',
          romaji: 'keigo',
          english: 'Honorific Language'
        },
        description: {
          japanese: '敬語は、相手への敬意を表す日本語の表現方法です。',
          romaji: 'Keigo wa, aite he no keii wo arawasu nihongo no hyougen houhou desu.',
          english: 'Honorific language is a way of expressing respect in Japanese.'
        },
        details: {
          japanese: '丁寧語、尊敬語、謙譲語の三種類があります。',
          romaji: 'Teineigo, sonkeigo, kenjougo no sanshurui ga arimasu.',
          english: 'There are three types: polite language, respectful language, and humble language.'
        },
        examples: [
          {
            japanese: '「食べる」の尊敬語は「召し上がる」です。',
            romaji: '"Taberu" no sonkeigo wa "meshiagaru" desu.',
            english: 'The respectful form of "to eat" is "meshiagaru."'
          }
        ],
        icon: <SchoolIcon />
      }
    ]
  },
  {
    title: 'Particles',
    icon: <LanguageIcon />,
    content: [
      {
        title: {
          japanese: '助詞 (じょし)',
          romaji: 'joshi',
          english: 'Particles'
        },
        description: {
          japanese: '助詞は、文の要素の関係を示す重要な文法要素です。',
          romaji: 'Joshi wa, bun no youso no kankei wo shimesu juuyou na bunpou youso desu.',
          english: 'Particles are important grammatical elements that indicate relationships between sentence elements.'
        },
        details: {
          japanese: '「は」「が」「を」「に」「で」など、様々な助詞があります。それぞれの助詞には特定の役割があります。',
          romaji: '"Wa" "ga" "wo" "ni" "de" nado, samazama na joshi ga arimasu. Sorezore no joshi niwa tokutei no yakuwari ga arimasu.',
          english: 'There are various particles such as "wa," "ga," "wo," "ni," and "de." Each particle has a specific role.'
        },
        examples: [
          {
            japanese: '「私は学校に行きます」の「は」は主題、「に」は方向を示します。',
            romaji: '"Watashi wa gakkou ni ikimasu" no "wa" wa shudai, "ni" wa houkou wo shimeshimasu.',
            english: 'In "I go to school," "wa" indicates the topic, and "ni" indicates direction.'
          }
        ],
        icon: <LanguageIcon />
      }
    ]
  },
  {
    title: 'Sentence Structure',
    icon: <SchoolIcon />,
    content: [
      {
        title: {
          japanese: '文型 (ぶんけい)',
          romaji: 'bunkei',
          english: 'Sentence Patterns'
        },
        description: {
          japanese: '日本語の文型は、基本的に「主語・目的語・述語」の順序で構成されます。',
          romaji: 'Nihongo no bunkei wa, kihonteki ni "shugo・mokutekigo・jutsu" no junjo de kousei saremasu.',
          english: 'Japanese sentence patterns are basically structured in the order of "subject・object・predicate."'
        },
        details: {
          japanese: '述語は文の最後に来ることが多く、これが日本語の特徴的な文型です。',
          romaji: 'Jutsu wa bun no saigo ni kuru koto ga ooku, kore ga nihongo no tokuchouteki na bunkei desu.',
          english: 'The predicate often comes at the end of the sentence, which is a characteristic feature of Japanese sentence structure.'
        },
        examples: [
          {
            japanese: '「私は昨日、友達と映画を見ました」は、主語・時・相手・目的語・述語の順です。',
            romaji: '"Watashi wa kinou, tomodachi to eiga wo mimashita" wa, shugo・ji・aite・mokutekigo・jutsu no jun desu.',
            english: '"I watched a movie with my friend yesterday" follows the order of subject・time・companion・object・predicate.'
          }
        ],
        icon: <SchoolIcon />
      }
    ]
  },
  {
    title: 'Business Language',
    icon: <BusinessIcon />,
    content: [
      {
        title: {
          japanese: 'ビジネス日本語 (ビジネスにほんご)',
          romaji: 'bijinesu nihongo',
          english: 'Business Japanese'
        },
        description: {
          japanese: 'ビジネス日本語は、丁寧さと敬意を表す特別な表現が多く使われます。',
          romaji: 'Bijinesu nihongo wa, teineisa to keii wo arawasu tokubetsu na hyōgen ga ōku tsukawaremasu.',
          english: 'Business Japanese uses many special expressions to show politeness and respect.'
        },
        details: {
          japanese: '謙譲語、尊敬語、丁寧語を適切に使い分けることが重要です。',
          romaji: 'Kenjōgo, sonkeigo, teineigo wo tekisetsu ni tsukaikakeru koto ga jūyō desu.',
          english: 'It is important to appropriately use humble, respectful, and polite language.'
        },
        examples: [
          {
            japanese: '「申し訳ございません」は「すみません」のより丁寧な表現です。',
            romaji: '"Mōshiwake gozaimasen" wa "sumimasen" no yori teinei na hyōgen desu.',
            english: '"Mōshiwake gozaimasen" is a more polite expression than "sumimasen."'
          },
          {
            japanese: '「お世話になっております」はビジネスでの挨拶としてよく使われます。',
            romaji: '"Osewa ni natteorimasu" wa bijinesu de no aisatsu toshite yoku tsukawaremasu.',
            english: '"Osewa ni natteorimasu" is commonly used as a business greeting.'
          }
        ],
        icon: <BusinessIcon />
      }
    ]
  },
  {
    title: 'Regional Dialects',
    icon: <LanguageIcon />,
    content: [
      {
        title: {
          japanese: '方言 (ほうげん)',
          romaji: 'hōgen',
          english: 'Regional Dialects'
        },
        description: {
          japanese: '日本の方言は、地域ごとに独特の表現やイントネーションがあります。',
          romaji: 'Nihon no hōgen wa, chiiki goto ni dokutoku no hyōgen ya intonēshon ga arimasu.',
          english: 'Japanese dialects have unique expressions and intonations for each region.'
        },
        details: {
          japanese: '関西弁、東北弁、沖縄弁など、様々な方言が存在します。',
          romaji: 'Kansaiben, Tōhokuben, Okinawaben nado, samazama na hōgen ga sonzai shimasu.',
          english: 'Various dialects exist, including Kansai, Tohoku, and Okinawa dialects.'
        },
        examples: [
          {
            japanese: '関西では「〜やね」、東北では「〜だべ」など、地域特有の終助詞があります。',
            romaji: 'Kansai dewa "~yane", Tōhoku dewa "~dabe" nado, chiiki tokuyū no shūjoshi ga arimasu.',
            english: 'There are region-specific sentence-ending particles, such as "~yane" in Kansai and "~dabe" in Tohoku.'
          },
          {
            japanese: '「ありがとう」は関西では「おおきに」と言うこともあります。',
            romaji: '"Arigatō" wa Kansai dewa "ōkini" to iu koto mo arimasu.',
            english: 'In Kansai, "thank you" is sometimes expressed as "ōkini."'
          }
        ],
        icon: <LanguageIcon />
      }
    ]
  }
]; 