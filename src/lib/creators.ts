export interface Creator {
  id: string;
  name: string;
  role: string;
  cat: string;
  catLabel: string;
  price: number;
  tags: string[];
  profile: string;
  mbti?: string;
  likes?: string;
  weddingThought?: string;
  snsInstagram?: string;
  sampleVideoUrl?: string;
  sampleVideoTitle?: string;
  images?: { url: string }[];
  works?: { url: string }[];
  fav: boolean;
}

export const CREATORS_LIST: Creator[] = [
  {
    id: "ok",
    name: "大久保 雄治",
    role: "Wedding Planner",
    cat: "planner",
    catLabel: "プランナー",
    price: 150000,
    tags: ["レストラン", "少人数", "横浜・鎌倉"],
    profile:
      "横浜・鎌倉エリアを中心に、レストランウェディングや少人数の式を得意とするフリープランナー。ふたりの想いを丁寧に汲み取り、オリジナルの一日をプロデュースします。",
    mbti: "ENFJ",
    likes: "古民家カフェ巡り、サーフィン",
    weddingThought: "結婚式は「二人らしさ」を表現できる唯一の場所。型にはまらない自由な一日を一緒につくりましょう。",
    fav: false,
  },
  {
    id: "tn",
    name: "田中 渉",
    role: "Photographer",
    cat: "photo",
    catLabel: "カメラマン",
    price: 80000,
    tags: ["和婚", "ナチュラル", "スナップ"],
    profile:
      "自然な表情を切り取るドキュメンタリースタイルが持ち味。和婚やガーデンウェディングでの撮影を多数手がけています。",
    mbti: "INFP",
    likes: "フィルムカメラ、旅行",
    weddingThought: "その瞬間にしかない空気感をそのまま残したい。飾らない笑顔が一番美しいと思っています。",
    fav: true,
  },
  {
    id: "ms",
    name: "松田 恵",
    role: "Photographer",
    cat: "photo",
    catLabel: "カメラマン",
    price: 90000,
    tags: ["モダン", "スタイリッシュ", "前撮り"],
    profile:
      "モダンでスタイリッシュな写真が特徴。前撮りからウェディング当日まで、トータルでの撮影プランを提案します。",
    mbti: "ENTJ",
    likes: "建築、ファッション誌",
    weddingThought: "写真は一生残るもの。だからこそ、その一枚に二人のストーリーを込めたい。",
    fav: false,
  },
  {
    id: "hb",
    name: "橋本 聡",
    role: "Videographer",
    cat: "movie",
    catLabel: "映像",
    price: 100000,
    tags: ["シネマ", "ドキュメンタリー"],
    profile:
      "映画のような映像美で、ふたりの一日をドキュメンタリータッチで記録。感動的なエンドロールにも定評があります。",
    mbti: "ISTP",
    likes: "映画鑑賞、ドローン撮影",
    weddingThought: "10年後に見返して、また泣ける映像を。そんな作品づくりを心がけています。",
    fav: false,
  },
  {
    id: "ym",
    name: "山本 千夏",
    role: "Hair & Makeup",
    cat: "hair",
    catLabel: "ヘアメイク",
    price: 60000,
    tags: ["和装", "フェミニン"],
    profile:
      "和装・洋装問わず、花嫁の魅力を最大限に引き出すヘアメイクを提供。トレンドを取り入れつつ、ナチュラルな仕上がりが人気です。",
    mbti: "ESFJ",
    likes: "韓国コスメ、ヨガ",
    weddingThought: "花嫁さんが自分史上最高に綺麗だと感じる瞬間をつくるのが私の仕事です。",
    fav: false,
  },
  {
    id: "sk",
    name: "鈴木 拓也",
    role: "MC & Ceremony",
    cat: "mc",
    catLabel: "司会",
    price: 70000,
    tags: ["ユーモア", "感動的"],
    profile:
      "ふたりの人柄を引き出すトーク力と、ゲストを巻き込む進行で、笑いと感動のある式をつくります。",
    mbti: "ENTP",
    likes: "お笑いライブ、即興劇",
    weddingThought: "ゲスト全員が「来てよかった」と思える空間をつくること。それが最高の司会だと信じています。",
    fav: false,
  },
  {
    id: "ik",
    name: "伊藤 花音",
    role: "Flower Designer",
    cat: "flower",
    catLabel: "フラワー",
    price: 80000,
    tags: ["ガーデン", "ナチュラル"],
    profile:
      "鎌倉の四季の花を使ったナチュラルな装花が得意。ブーケからテーブルコーディネートまで統一感のある空間を演出します。",
    mbti: "ISFP",
    likes: "植物園散歩、水彩画",
    weddingThought: "花には言葉以上のメッセージがある。二人の想いを花で語る空間をつくります。",
    fav: false,
  },
  {
    id: "it",
    name: "伊東 健",
    role: "Videographer",
    cat: "movie",
    catLabel: "映像",
    price: 130000,
    tags: ["シネマティック", "4K"],
    profile:
      "4K撮影と繊細なカラーグレーディングで、映画のようなウェディングムービーを制作。音楽選びにもこだわります。",
    mbti: "INTJ",
    likes: "音楽フェス、カラーグレーディング研究",
    weddingThought: "映像は光と音の芸術。二人だけの映画を、最高のクオリティでお届けします。",
    fav: false,
  },
];

export const FILTER_CATS = [
  { key: "all", label: "すべて" },
  { key: "planner", label: "プランナー" },
  { key: "photo_movie", label: "写真・映像" },
  { key: "hair", label: "ヘアメイク" },
  { key: "music", label: "音楽" },
  { key: "flower", label: "装花" },
  { key: "item", label: "アイテム" },
  { key: "other", label: "Other" },
];
