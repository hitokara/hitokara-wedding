import type { Metadata } from "next";
import { getSimItems, mapCMSSimItems, getCreators, mapCMSCreator, getVenues } from "@/lib/microcms";
import type { CMSCategoryGroup, CMSVenue } from "@/lib/microcms";
import { CREATORS_LIST } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import SimulationClient from "./SimulationClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "見積もりシミュレーター - 結婚式費用を簡単シミュレーション",
  description:
    "横浜・鎌倉の結婚式費用をシミュレーション。プランナー・カメラマン・ヘアメイクなどクリエイターを自分で選び、見積もりをリアルタイムで確認。持ち込み自由・適正価格のヒトカラウェディング。",
  alternates: {
    canonical: "https://hitokarawedding.com/simulation",
  },
};

/** Fallback: build categories from local hardcoded data */
function buildLocalCategories(): CMSCategoryGroup[] {
  return [
    {
      id: "venue",
      title: "会場",
      items: [
        { id: "venue-consult", label: "相談して決める", price: 0, note: "プランナーと一緒に最適な会場を探します" },
        { id: "venue-cms", label: "会場一覧から選ぶ", price: 0, vp: 1, note: "提携会場から選べます" },
        { id: "venue-self", label: "自分で探す", price: 0, note: "ご自身で会場を手配" },
      ],
    },
    {
      id: "food",
      title: "料理・ドリンク",
      items: [
        { id: "food-a", label: "スタンダード", price: 15000, unit: "人", note: "コース料理＋フリードリンク" },
        { id: "food-b", label: "プレミアム", price: 20000, unit: "人", note: "厳選素材のコース＋プレミアムドリンク" },
        { id: "food-c", label: "オリジナル", price: 18000, unit: "人", note: "シェフと相談してオリジナルメニュー" },
      ],
    },
    {
      id: "dress",
      title: "衣装",
      items: [
        { id: "dress-wd", label: "ウェディングドレス", price: 300000 },
        { id: "dress-cd", label: "カラードレス", price: 250000 },
        { id: "dress-tx", label: "タキシード", price: 150000 },
        { id: "dress-wdtx", label: "ウェディングドレス＋タキシード", price: 450000, note: "セット割引" },
        { id: "dress-all", label: "ウェディングドレス＋カラードレス＋タキシード", price: 650000, note: "セット割引" },
      ],
    },
    {
      id: "flower",
      title: "装花",
      items: [
        { id: "flower-a", label: "ナチュラル", price: 200000, note: "グリーン中心のナチュラルスタイル" },
        { id: "flower-b", label: "モダン", price: 250000, note: "洗練されたモダンデザイン" },
        { id: "flower-c", label: "クラシック", price: 300000, note: "華やかなクラシックスタイル" },
        { id: "flower-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "flower", note: "フラワーデザイナーを直接指名" },
      ],
    },
    {
      id: "planner",
      title: "プランニング料",
      items: [
        { id: "planner-nom", label: "プランナーを選択", price: 0, nom: 1, ck: "planner", note: "担当プランナーを指名（必須）" },
      ],
    },
    {
      id: "hair",
      title: "ヘアメイク",
      items: [
        { id: "hair-std", label: "おまかせ", price: 80000, note: "スタイル希望に合わせて手配" },
        { id: "hair-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "hair", note: "気になるヘアメイクを直接指名" },
        { id: "hair-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "mc",
      title: "司会",
      items: [
        { id: "mc-std", label: "おまかせ", price: 100000, note: "経験豊富な司会者を手配" },
        { id: "mc-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "party", note: "気になる司会者を直接指名" },
        { id: "mc-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "photo",
      title: "写真",
      items: [
        { id: "photo-std", label: "おまかせ", price: 200000, note: "スタイル希望に合わせて手配" },
        { id: "photo-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "photo_only", note: "気になるカメラマンを直接指名" },
        { id: "photo-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
        { id: "photo-none", label: "なし", price: 0 },
      ],
    },
    {
      id: "video",
      title: "映像",
      items: [
        { id: "video-std", label: "おまかせ", price: 250000, note: "スタイル希望に合わせて手配" },
        { id: "video-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "movie_only", note: "気になる映像クリエイターを直接指名" },
        { id: "video-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
        { id: "video-none", label: "なし", price: 0 },
      ],
    },
    {
      id: "gift",
      title: "引出物・引菓子",
      items: [
        { id: "gift-std", label: "おまかせ", price: 5000, unit: "人", note: "ゲスト人数分" },
        { id: "gift-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "item", note: "こだわりのギフトプランナーを指名" },
        { id: "gift-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "paper",
      title: "ペーパーアイテム",
      items: [
        { id: "paper-std", label: "おまかせ", price: 1500, unit: "人", note: "招待状・席次表・席札など" },
        { id: "paper-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "item", note: "デザイナーを直接指名" },
        { id: "paper-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "party-creators",
      title: "結婚式を、もっと豊かな時間にしてくれるクリエイターたち",
      items: [
        { id: "party-none", label: "指名しない", price: 0, note: "この項目をスキップ" },
        { id: "party-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "party", multi: true, note: "パーティーを彩るクリエイターを複数指名" },
      ],
    },
  ];
}

export default async function SimulationPage() {
  // Use local categories (CMS sim-items can be enabled later when updated)
  // const res = await getSimItems();
  const categories: CMSCategoryGroup[] = buildLocalCategories();

  // Fetch CMS creators and venues in parallel
  const [cmsResult, venueResult] = await Promise.all([getCreators(), getVenues()]);
  const creators: Creator[] =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map(mapCMSCreator)
      : CREATORS_LIST;

  const venues = venueResult.contents;

  return <SimulationClient categories={categories} creators={creators} venues={venues} />;
}
