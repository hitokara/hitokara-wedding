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
      id: "planner",
      title: "プランニング",
      items: [
        { id: "planner-nom", label: "プランナーを選択", price: 300000, nom: 1, ck: "planner", note: "担当プランナーを指名（必須）。基本料¥300,000〜。指名した場合はクリエイターの料金を適用。" },
      ],
    },
    {
      id: "venue",
      title: "会場",
      items: [
        { id: "venue-consult", label: "相談して決める", price: 500000, note: "式場じゃない場所（レストランや思い出の場所など）" },
        { id: "venue-cms", label: "会場一覧から選ぶ", price: 200000, vp: 1, note: "提携会場から選べます（会場により料金異なる）" },
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
        { id: "dress-nom", label: "ドレスショップを指名", price: 0, nom: 1, ck: "dress", note: "提携ドレスショップから選ぶ" },
      ],
    },
    {
      id: "flower",
      title: "装花",
      items: [
        { id: "flower-set", label: "一式（メイン・ゲスト・ブーケ）", price: 0, unit: "flower_set", note: "メインテーブル ¥100,000 + ゲストテーブル ¥10,000/卓（ゲスト人数から自動算出） + ブーケ ¥50,000" },
        { id: "flower-bouquet", label: "ブーケのみ", price: 50000, note: "ブーケ単品" },
        { id: "flower-nom", label: "クリエイター指名", price: 210000, nom: 1, ck: "flower", note: "フラワーデザイナーを直接指名。指名した場合はクリエイター料金を適用。" },
      ],
    },
    {
      id: "hair",
      title: "ヘアメイク",
      items: [
        { id: "hair-std", label: "1スタイル", price: 82500, note: "事前リハーサル・新婦ヘアメイク・ドレスフィッティング・挙式前後のヘアメイク直し含む" },
        { id: "hair-attend", label: "1スタイル＋アテンド", price: 112500, note: "上記 + 介添え1名手配（¥30,000）" },
        { id: "hair-nom", label: "クリエイター指名", price: 82500, nom: 1, ck: "hair", note: "気になるヘアメイクを直接指名。指名時はクリエイター料金を適用。" },
        { id: "hair-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "mc",
      title: "司会",
      items: [
        { id: "mc-std", label: "おまかせ", price: 80000, note: "打合せ1回含む" },
        { id: "mc-nom", label: "クリエイター指名", price: 80000, nom: 1, ck: "mc", note: "気になる司会者を直接指名。指名時はクリエイター料金を適用。" },
        { id: "mc-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "sound",
      title: "音響・生演奏",
      items: [
        { id: "sound-std", label: "おまかせ", price: 100100, note: "音響オペレーター手配" },
        { id: "sound-nom", label: "クリエイター指名", price: 100100, nom: 1, ck: "other", note: "ピアニスト・演奏者を指名。指名時はクリエイター料金を適用。" },
        { id: "sound-none", label: "なし", price: 0 },
      ],
    },
    {
      id: "photo",
      title: "写真",
      items: [
        { id: "photo-std", label: "当日撮影", price: 130000, note: "挙式〜披露宴の撮影" },
        { id: "photo-nom", label: "クリエイター指名", price: 130000, nom: 1, ck: "photo", note: "気になるカメラマンを直接指名。指名時はクリエイター料金を適用。" },
        { id: "photo-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
        { id: "photo-none", label: "なし", price: 0 },
      ],
    },
    {
      id: "video",
      title: "映像",
      items: [
        { id: "video-std", label: "エンドロール", price: 130000, note: "当日1日のシーンを撮影したエンドロール映像" },
        { id: "video-nom", label: "クリエイター指名", price: 130000, nom: 1, ck: "movie", note: "気になる映像クリエイターを直接指名。指名時はクリエイター料金を適用。" },
        { id: "video-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
        { id: "video-none", label: "なし", price: 0 },
      ],
    },
    {
      id: "gift",
      title: "引出物・引菓子",
      items: [
        { id: "gift-std", label: "おまかせ", price: 4000, unit: "人", note: "参考価格。ゲスト人数分。" },
        { id: "gift-nom", label: "クリエイター指名", price: 4000, unit: "人", nom: 1, ck: "gift", note: "こだわりのギフトプランナーを指名。指名時はクリエイター料金を適用。" },
        { id: "gift-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "paper",
      title: "ペーパーアイテム",
      items: [
        { id: "paper-std", label: "おまかせ", price: 1500, unit: "人", note: "招待状・席次表・席札など（参考価格）" },
        { id: "paper-bring", label: "持ち込み", price: 0, note: "ご自身で手配" },
      ],
    },
    {
      id: "party-creators",
      title: "結婚式を、もっと豊かな時間にしてくれるクリエイターたち",
      items: [
        { id: "party-none", label: "指名しない", price: 0, note: "この項目をスキップ" },
        { id: "party-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "other", multi: true, note: "結婚式を彩るクリエイターを複数指名" },
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
