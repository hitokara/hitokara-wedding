import type { Metadata } from "next";
import { CREATORS_LIST } from "@/lib/creators";
import { getCreators, mapCMSCreator } from "@/lib/microcms";
import CreatorsClient from "./CreatorsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "クリエイター一覧 - 横浜・鎌倉のウェディングクリエイター",
  description:
    "横浜・鎌倉エリアで活躍するウェディングクリエイター一覧。プランナー・カメラマン・ヘアメイク・映像・司会・フラワーを顔と実績で選べます。",
  alternates: {
    canonical: "https://hitokara-wedding.com/creators",
  },
};

export default async function CreatorsPage() {
  const cmsResult = await getCreators();
  const creators =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map(mapCMSCreator)
      : CREATORS_LIST;

  return <CreatorsClient creators={creators} />;
}
