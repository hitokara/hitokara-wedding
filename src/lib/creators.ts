export interface Creator {
  id: string;
  name: string;
  role: string;
  cat: string;
  catLabel: string;
  price: number;
  tags: string[];
  profile: string;
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
    fav: false,
  },
];

export const FILTER_CATS = [
  { key: "all", label: "すべて" },
  { key: "planner", label: "プランナー" },
  { key: "photo", label: "カメラマン" },
  { key: "movie", label: "映像" },
  { key: "hair", label: "ヘアメイク" },
  { key: "mc", label: "司会" },
  { key: "flower", label: "フラワー" },
];
