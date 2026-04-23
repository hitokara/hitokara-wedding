import type { Metadata } from "next";
import { Suspense } from "react";
import { CREATORS_LIST } from "@/lib/creators";
import { getCreators, mapCMSCreator } from "@/lib/microcms";
import { AREA_LABEL_SHORT, AREA_LABEL_FULL, SITE_URL } from "@/lib/areas";
import CreatorsClient from "./CreatorsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `クリエイター一覧 - ${AREA_LABEL_SHORT}のウェディングクリエイター`,
  description:
    `${AREA_LABEL_FULL}で活躍するウェディングクリエイター一覧。プランナー・カメラマン・ヘアメイク・映像・司会・フラワーを顔と実績で選べます。`,
  alternates: {
    canonical: `${SITE_URL}/creators`,
  },
};

// 静的データから名前ベースでMBTI等を補完（CMSにフィールド追加されるまでの暫定）
const EXTRA_BY_NAME = new Map(
  CREATORS_LIST.map((c) => [c.name, { mbti: c.mbti, likes: c.likes, weddingThought: c.weddingThought }])
);

export default async function CreatorsPage() {
  const cmsResult = await getCreators();
  const creators =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map((c) => {
          const mapped = mapCMSCreator(c);
          const extra = EXTRA_BY_NAME.get(mapped.name);
          return {
            ...mapped,
            mbti: mapped.mbti || extra?.mbti,
            likes: mapped.likes || extra?.likes,
            weddingThought: mapped.weddingThought || extra?.weddingThought,
          };
        })
      : CREATORS_LIST;

  return (
    <Suspense>
      <CreatorsClient creators={creators} />
    </Suspense>
  );
}
