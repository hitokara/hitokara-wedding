/**
 * Simulation data & calculation functions
 *
 * This module contains the category data, pricing arrays,
 * and helper functions for the wedding cost simulator.
 */

// ---------- Types ----------
export interface CategoryItem {
  id: string;
  label: string;
  price: number;
  unit?: string;
  note?: string;
  /** If 1, this option enables creator nomination */
  nom?: 1;
  /** Creator category key for nomination (matches Creator.cat) */
  ck?: string;
}

export interface CategoryGroup {
  id: string;
  title: string;
  items: CategoryItem[];
}

// ---------- Data ----------

/** Main cost categories */
export const CATS: CategoryGroup[] = [
  {
    id: "venue",
    title: "会場",
    items: [
      { id: "venue-a", label: "ゲストハウス", price: 500000, note: "挙式+披露宴" },
      { id: "venue-b", label: "レストラン", price: 350000, note: "挙式+披露宴" },
      { id: "venue-c", label: "ホテル", price: 600000, note: "挙式+披露宴" },
    ],
  },
  {
    id: "food",
    title: "料理・飲物",
    items: [
      { id: "food-a", label: "スタンダード", price: 15000, unit: "人" },
      { id: "food-b", label: "プレミアム", price: 20000, unit: "人" },
      { id: "food-c", label: "オリジナル", price: 18000, unit: "人" },
    ],
  },
  {
    id: "dress",
    title: "衣装",
    items: [
      { id: "dress-a", label: "ウェディングドレス", price: 300000 },
      { id: "dress-b", label: "カラードレス", price: 250000 },
      { id: "dress-c", label: "タキシード", price: 150000 },
    ],
  },
];

/** Planner options */
export const PLANNERS: CategoryItem[] = [
  { id: "planner-a", label: "フリープランナー", price: 300000 },
  { id: "planner-b", label: "プロデュース会社", price: 450000 },
];

/** Creator options (with nomination support) */
export const CREATORS: CategoryItem[] = [
  { id: "photo-std", label: "フォトグラファー（おまかせ）", price: 200000, note: "スタイル希望に合わせて手配" },
  { id: "photo-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "photo", note: "気になるカメラマンを直接指名" },
  { id: "video-std", label: "ビデオグラファー（おまかせ）", price: 250000, note: "スタイル希望に合わせて手配" },
  { id: "video-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "movie", note: "気になる映像クリエイターを直接指名" },
  { id: "mc-std", label: "司会者（おまかせ）", price: 100000, note: "経験豊富な司会者を手配" },
  { id: "mc-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "mc", note: "気になる司会者を直接指名" },
  { id: "hair-std", label: "ヘアメイク（おまかせ）", price: 80000, note: "スタイル希望に合わせて手配" },
  { id: "hair-nom", label: "クリエイター指名", price: 0, nom: 1, ck: "hair", note: "気になるヘアメイクを直接指名" },
];

/** Flower / decoration main options */
export const FLOWER_MAIN: CategoryItem[] = [
  { id: "flower-a", label: "ナチュラル", price: 200000 },
  { id: "flower-b", label: "モダン", price: 250000 },
  { id: "flower-c", label: "クラシック", price: 300000 },
];

// ---------- Calculation Functions ----------

/**
 * Calculate subtotal for selected items
 */
export function subtotal(
  selectedItems: CategoryItem[],
  guestCount: number = 60
): number {
  return selectedItems.reduce((sum, item) => {
    if (item.unit === "人") {
      return sum + item.price * guestCount;
    }
    return sum + item.price;
  }, 0);
}

/**
 * Calculate planning fee (percentage-based or flat)
 */
export function planningFee(
  plannerItem: CategoryItem | null
): number {
  return plannerItem?.price ?? 0;
}

/**
 * Calculate grand total
 */
export function totalAll(
  selectedItems: CategoryItem[],
  plannerItem: CategoryItem | null,
  guestCount: number = 60
): number {
  return subtotal(selectedItems, guestCount) + planningFee(plannerItem);
}

/**
 * Get value from a category by item id
 */
export function getCatVal(
  categories: CategoryGroup[],
  categoryId: string,
  itemId: string
): CategoryItem | undefined {
  const group = categories.find((c) => c.id === categoryId);
  return group?.items.find((i) => i.id === itemId);
}

/**
 * Format price for display (Japanese yen)
 */
export function fmtP(price: number): string {
  return price.toLocaleString("ja-JP");
}
