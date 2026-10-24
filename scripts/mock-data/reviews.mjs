// Mock travellers and review text for Preview studios. All rows are written with is_mock = true;
// the app never shows mock reviews (experience.tsx filters is_mock = false).

// [first, last, country, language]
export const travellers = [
  ['Emily', 'Rhodes', 'US', 'en'], ['Jake', 'Morales', 'US', 'en'], ['Priya', 'Natarajan', 'US', 'en'], ['Marcus', 'Bell', 'US', 'en'],
  ['Hannah', 'Kowalski', 'CA', 'en'], ['Olivia', 'Tremblay', 'CA', 'en'], ['Sophie', 'Lawson', 'GB', 'en'], ['Tom', 'Fletcher', 'GB', 'en'],
  ['Aisha', 'Rahman', 'GB', 'en'], ['Liam', 'O’Connor', 'IE', 'en'], ['Chloe', 'Nguyen', 'AU', 'en'], ['Ben', 'Hartley', 'AU', 'en'],
  ['Mia', 'Fraser', 'NZ', 'en'], ['Wei Ling', 'Tan', 'SG', 'en'], ['Darren', 'Lim', 'SG', 'en'], ['Nur', 'Aisyah', 'MY', 'en'],
  ['Angela', 'Reyes', 'PH', 'en'], ['Lukas', 'Becker', 'DE', 'en'], ['Lea', 'Schmidt', 'DE', 'en'], ['Chloé', 'Dubois', 'FR', 'en'],
  ['Matteo', 'Rossi', 'IT', 'en'], ['Sanne', 'de Vries', 'NL', 'en'], ['Elin', 'Johansson', 'SE', 'en'], ['Arjun', 'Mehta', 'IN', 'en'],
  ['Yuki', 'Tanaka', 'JP', 'ja'], ['Haruka', 'Sato', 'JP', 'ja'], ['Ren', 'Kobayashi', 'JP', 'ja'], ['Misaki', 'Ito', 'JP', 'ja'],
  ['Sota', 'Watanabe', 'JP', 'ja'], ['Aya', 'Nakamura', 'JP', 'ja'], ['Kenta', 'Yamamoto', 'JP', 'ja'], ['Nanami', 'Suzuki', 'JP', 'ja'],
  ['Lin', 'Wang', 'CN', 'zh'], ['Xiaoyu', 'Chen', 'CN', 'zh'], ['Hao', 'Liu', 'CN', 'zh'], ['Jing', 'Zhao', 'CN', 'zh'],
  ['Yi-Ting', 'Huang', 'TW', 'zh'], ['Chia-Hui', 'Lin', 'TW', 'zh'], ['Ka Yan', 'Wong', 'HK', 'zh'], ['Zihan', 'Sun', 'CN', 'zh'],
  ['Camila', 'Gómez', 'MX', 'es'], ['Diego', 'Hernández', 'MX', 'es'], ['Lucía', 'Fernández', 'ES', 'es'], ['Pablo', 'Ruiz', 'ES', 'es'],
  ['Valentina', 'Rojas', 'CL', 'es'], ['Mateo', 'Álvarez', 'AR', 'es'], ['Sofía', 'Castro', 'CO', 'es'], ['Andrés', 'Vargas', 'PE', 'es'],
  ['Min-ji', 'Park', 'KR', 'ko'], ['Ji-hoon', 'Lee', 'KR', 'ko'], ['Seo-yun', 'Choi', 'KR', 'ko'], ['Do-yoon', 'Kim', 'KR', 'ko'],
  ['Ha-rin', 'Jung', 'KR', 'ko'], ['Yu-na', 'Kang', 'KR', 'ko'], ['Sarah', 'Kim', 'US', 'en'], ['Daniel', 'Park', 'CA', 'en'],
  ['Grace', 'Lee', 'AU', 'en'], ['Noah', 'Cho', 'US', 'en'], ['Isabella', 'Moreau', 'FR', 'en'], ['Ethan', 'Wright', 'US', 'en'],
];

// Each entry: [title, body]. {reader} = the studio's primary reader (first name), {area} = neighbourhood.
export const pools = {
  en: {
    saju: [
      ['Worth every minute', '{reader} drew out my four pillars on paper and explained each one before getting to my questions. It felt less like fortune-telling and more like a really thoughtful conversation about where I am in life.'],
      ['The highlight of our Seoul trip', 'Booked this on a whim and it ended up being the thing we talked about most on the flight home. The interpreter was excellent and never rushed.'],
      ['Surprisingly specific', 'I expected vague horoscope stuff. Instead I got a clear explanation of why the next two years look busy for work and which months to slow down. Took notes the whole time.'],
      ['Great introduction to Saju', 'I knew nothing about Saju before. {reader} started with the basics (day master, the five elements) so the rest actually made sense.'],
      ['Calm, kind and honest', 'Some of what came up was not what I wanted to hear, but it was said with a lot of care. I left feeling clearer rather than worried.'],
      ['Bring your questions', 'Tip: write down two or three questions before you go. The general reading is good, but the answers to my specific career question were the best part.'],
      ['Easy to find from the station', 'Short walk from {area}, quiet room, tea served while we waited. The reading itself ran a little over time and nobody minded.'],
      ['Helpful for a big decision', 'I am deciding whether to move for a job and wanted another perspective. The reading did not tell me what to do, but it gave me a useful way to think about timing.'],
      ['Felt very personal', 'They asked about my family and work first, which I think is why the reading felt so tailored. Would happily go back next time I am in Seoul.'],
      ['Good with first-timers', 'My husband was sceptical and ended up asking the most questions. The interpretation was smooth, with no awkward pauses.'],
      ['Loved the written notes', 'I came away with a sheet showing my chart and the key years. Really nice souvenir and I have looked at it a few times since.'],
      ['Thoughtful and unhurried', 'Never felt like a tourist trap. {reader} took time to explain terms and checked that I understood before moving on.'],
    ],
    tarot: [
      ['Fun and insightful', 'Quick tarot spread before dinner and it was so much better than I expected. {reader} was funny but took my question seriously.'],
      ['Perfect late-night stop', 'We walked in around 9 pm without booking and were seen within ten minutes. Great atmosphere in {area}.'],
      ['Honest about my love life', 'Asked about a situationship and got a very honest (and kind) answer. My friends all want to go now.'],
      ['Combo was the way to go', 'Did the Saju + tarot session. Saju for the big picture and tarot for the question on my mind worked really well together.'],
    ],
    couple: [
      ['Great for couples', 'We did the compatibility reading together. It was sweet, sometimes funny, and gave us a couple of things to genuinely talk about.'],
      ['Our anniversary treat', 'Booked this for our anniversary. Seeing both charts side by side was fascinating, and the reader was great at keeping it light.'],
      ['Fun with friends', 'Four of us shared a session and it was hilarious hearing how our elements mix. Great value split four ways.'],
    ],
    mixed: [
      ['Good, but a bit short', 'The reading itself was interesting but it went by fast. I would book a longer session next time.'],
      ['Interpretation could be smoother', 'The reader was clearly knowledgeable, but some answers lost detail in translation. Still worth trying.'],
      ['Hard to find', 'Took us a while to find the entrance in {area}. Once inside it was lovely, but give yourself extra time.'],
      ['Mixed feelings', 'Some parts felt spot on, others quite general. Nice experience overall, just manage your expectations.'],
      ['Felt slightly rushed', 'There was a group waiting after us and the last part of the session felt hurried.'],
    ],
  },
  ja: {
    saju: [
      ['丁寧に説明してもらえました', '命式を紙に書きながら一つずつ説明してくれたので、初めてでも分かりやすかったです。通訳の方もとても自然でした。'],
      ['ソウル旅行のいい思い出に', '友人とふたりで伺いました。仕事の時期の話が具体的で、帰りのカフェでずっとその話をしていました。'],
      ['落ち着いた雰囲気', '静かな部屋でお茶をいただきながら受けられました。駅からも近くて迷いませんでした。'],
      ['また行きたいです', '{reader}先生の話し方が優しくて、聞きにくい質問もしやすかったです。'],
    ],
    tarot: [['気軽に楽しめました', '予約なしで入れて、恋愛について短くタロットを見てもらいました。思ったより当たっていて驚きました。']],
    couple: [['カップルで受けました', 'ふたりの命式を並べて相性を見てもらいました。笑いながら聞けて、いい記念になりました。']],
    mixed: [['少し短く感じました', '内容は良かったのですが、あっという間でした。次は長いコースにします。'], ['場所が分かりにくい', '入口を探すのに時間がかかりました。中はとても素敵でした。']],
  },
  zh: {
    saju: [
      ['讲解得很细致', '老师把命盘画在纸上逐一讲解，完全不懂韩语也能听明白。口译很流畅。'],
      ['首尔旅行中最难忘的体验', '关于事业和感情的部分讲得很具体，提问时间也很充足。'],
      ['环境安静舒服', '在安静的房间里一边喝茶一边听解读，离地铁站也很近。'],
      ['推荐给第一次体验的人', '{reader}老师先讲了日主和五行，后面的内容就很好理解了。'],
    ],
    tarot: [['轻松有趣', '晚上路过直接进去抽了一次塔罗，老师很幽默但回答很认真。']],
    couple: [['和男朋友一起来的', '两个人的命盘放在一起看，互补的地方和容易吵架的地方都说中了，很有意思。']],
    mixed: [['时间有点短', '内容不错，但时间过得太快了，下次会选长一点的。'], ['翻译偶尔有点慢', '老师很专业，只是有些细节翻译时丢失了一点。']],
  },
  es: {
    saju: [
      ['Una experiencia muy especial', '{reader} dibujó mi carta en papel y explicó cada pilar con calma. Muy recomendable si es tu primera vez.'],
      ['Lo mejor del viaje', 'Fuimos sin saber nada de Saju y salimos encantados. La intérprete fue genial y no hubo prisas.'],
      ['Muy concreto', 'Esperaba algo genérico y fue todo lo contrario: habló de años concretos para el trabajo y la familia.'],
    ],
    tarot: [['Divertido y certero', 'Una tirada rápida de tarot por la noche. Muy cercana y sincera con mi pregunta sobre el amor.']],
    couple: [['Ideal en pareja', 'Hicimos la lectura de compatibilidad juntos y nos reímos mucho. Un recuerdo precioso de Seúl.']],
    mixed: [['Bien, pero corto', 'Interesante, aunque se hace muy corta. La próxima vez reservaré una sesión más larga.']],
  },
  ko: {
    saju: [
      ['설명이 정말 친절해요', '사주를 종이에 직접 그려 가면서 하나하나 설명해 주셔서 이해하기 쉬웠어요.'],
      ['외국인 친구와 함께', '외국인 친구와 같이 갔는데 통역이 자연스러워서 둘 다 재미있게 들었습니다.'],
      ['구체적이라 좋았어요', '막연한 이야기가 아니라 언제 움직이면 좋은지 구체적으로 짚어 주셔서 도움이 됐어요.'],
      ['분위기가 차분해요', '조용한 공간에서 차 마시면서 편하게 상담받았습니다. 또 오고 싶어요.'],
    ],
    tarot: [['가볍게 보기 좋아요', '저녁 먹고 예약 없이 들렀는데 금방 봐 주셨어요. 솔직하게 말씀해 주셔서 좋았습니다.']],
    couple: [['커플 궁합 추천', '남자친구랑 같이 봤는데 서로 맞는 부분, 부딪히는 부분을 짚어 주셔서 재미있었어요.']],
    mixed: [['조금 짧았어요', '내용은 좋았는데 시간이 금방 지나가네요. 다음엔 더 긴 상담으로 볼게요.']],
  },
};
