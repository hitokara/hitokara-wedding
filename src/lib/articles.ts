export interface Article {
  slug: string;
  cat: string;
  title: string;
  date: string;
  author: string;
  excerpt?: string;
  gradient: string;
  thumbnailUrl?: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "cost-tips",
    cat: "費用・見積もり",
    title: "初期見積もりから「爆上がり」しないために",
    date: "2025.06.01",
    author: "大久保 雄治",
    excerpt:
      "最終的な費用が初期の1.8倍になるケースは珍しくありません。事前に知っておくべきポイントを解説します。",
    gradient: "linear-gradient(155deg,#7aa8c0,#3a6888)",
  },
  {
    slug: "photographer-tanaka",
    cat: "クリエイター紹介",
    title: "カメラマン田中渉が語る「自然なスナップ」の哲学",
    date: "2025.05.12",
    author: "田中 渉",
    excerpt:
      "ポーズではなく、自然な瞬間を切り取る。ドキュメンタリースタイルの魅力に迫ります。",
    gradient: "linear-gradient(155deg,#9ac8d8,#5898b8)",
  },
  {
    slug: "byoi-vs-venue",
    cat: "ノウハウ",
    title: "持込ありき vs 式場一括――正直に比較",
    date: "2025.04.28",
    author: "大久保 雄治",
    excerpt:
      "フリープランナーに持込で頼む場合と式場一括の違いを、費用・自由度・サポートの観点で比較。",
    gradient: "linear-gradient(155deg,#6898b8,#385878)",
  },
  {
    slug: "kamakura-venues",
    cat: "会場レポ",
    title: "鎌倉・湘南エリアのおすすめ会場5選",
    date: "2025.04.15",
    author: "松田 恵",
    excerpt:
      "鎌倉の神社・寺院で行う神前式は、凛とした空気の中で誓いを立てる特別な体験。",
    gradient: "linear-gradient(155deg,#8ab8d0,#4a7898)",
  },
  {
    slug: "flower-botanical",
    cat: "クリエイター紹介",
    title:
      "フラワーデザイナー伊藤花音の「ボタニカルスタイル」に迫る",
    date: "2025.03.05",
    author: "伊藤 花音",
    excerpt:
      "鎌倉の四季の花を使った、ナチュラルで温かみのある装花スタイルの秘密。",
    gradient: "linear-gradient(155deg,#9ac8d8,#5898b8)",
  },
  {
    slug: "hair-trends",
    cat: "ノウハウ",
    title: "2025年ブライダルヘアメイクトレンド",
    date: "2025.02.20",
    author: "山本 千夏",
    excerpt:
      "和装ヘアから洋装トレンドまで、2025年に押さえておきたいブライダルヘアメイクのポイント。",
    gradient: "linear-gradient(155deg,#7aa8c0,#3a6888)",
  },
];

export const JOURNAL_CATS = [
  { key: "all", label: "すべて" },
  { key: "area", label: "エリア情報" },
  { key: "creator", label: "クリエイター紹介" },
  { key: "know", label: "ノウハウ" },
  { key: "cost", label: "費用・見積もり" },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
