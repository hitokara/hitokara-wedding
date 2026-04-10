import { getSimItems, mapCMSSimItems, getCreators, mapCMSCreator } from "@/lib/microcms";
import type { CMSCategoryGroup } from "@/lib/microcms";
import { CATS, PLANNERS, CREATORS, FLOWER_MAIN } from "@/lib/simulation";
import { CREATORS_LIST } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import SimulationClient from "./SimulationClient";

export const revalidate = 60;

/** Fallback: build categories from local hardcoded data */
function buildLocalCategories(): CMSCategoryGroup[] {
  const hairItems = CREATORS.filter((c) => c.ck === "hair" || c.id === "hair-std");
  const mcItems = CREATORS.filter((c) => c.ck === "mc" || c.id === "mc-std");
  const photoItems = CREATORS.filter((c) => c.ck === "photo" || c.id === "photo-std");
  const videoItems = CREATORS.filter((c) => c.ck === "movie" || c.id === "video-std");

  return [
    { id: "planner", title: "プランニング", items: PLANNERS },
    { id: "venue", title: "会場", items: CATS[0].items },
    { id: "food", title: "料理・飲物", items: CATS[1].items },
    { id: "dress", title: "衣装", items: CATS[2].items },
    { id: "flower", title: "装花", items: FLOWER_MAIN },
    { id: "hair", title: "ヘアメイク", items: hairItems },
    { id: "mc", title: "司会", items: mcItems },
    { id: "photo", title: "写真", items: photoItems },
    { id: "video", title: "映像", items: videoItems },
  ];
}

export default async function SimulationPage() {
  const res = await getSimItems();

  let categories: CMSCategoryGroup[];
  if (res.contents.length > 0) {
    categories = mapCMSSimItems(res.contents) as CMSCategoryGroup[];
  } else {
    categories = buildLocalCategories();
  }

  // Fetch CMS creators (same IDs as stored in localStorage favs)
  const cmsResult = await getCreators();
  const creators: Creator[] =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map(mapCMSCreator)
      : CREATORS_LIST;

  // Override/append "Other creators" category
  const otherCreators = creators.filter((c) => c.cat === "other");
  if (otherCreators.length > 0) {
    const otherCategory: CMSCategoryGroup = {
      id: "other",
      title: "結婚式を、もっと豊かな時間にしてくれるクリエイターたち",
      items: [
        {
          id: "other-none",
          label: "指名しない",
          price: 0,
          note: "この項目をスキップ",
        },
        {
          id: "other-nom",
          label: "クリエイター指名",
          price: 0,
          nom: 1,
          ck: "other",
          note: "気になるクリエイターを直接指名",
        },
      ],
    };
    // Replace existing "other" category if present, otherwise append
    const existingIdx = categories.findIndex((cat) => cat.id === "other");
    if (existingIdx >= 0) {
      categories = [...categories];
      categories[existingIdx] = otherCategory;
    } else {
      categories = [...categories, otherCategory];
    }
  }

  return <SimulationClient categories={categories} creators={creators} />;
}
