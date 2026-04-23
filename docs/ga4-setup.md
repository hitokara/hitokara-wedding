# GA4 設定チェックリスト — ヒトカラウェディング

**GA4 プロパティID**: `G-QPV9CZRY9H`
**URL**: https://hitokarawedding.com

実装済みはコード側で完了済み。管理画面側の作業リストです。
GA4: https://analytics.google.com/

---

## ✅ 実装済み（コード側）

- [x] GA4 タグ導入（環境変数 `NEXT_PUBLIC_GA_ID` で管理）
- [x] Consent Mode v2 デフォルト設定（analytics=granted / ad=denied）
- [x] SPA ルート変更時の `page_view` 発火（App Router対応）
- [x] `anonymize_ip`, `cookie_flags: SameSite=None;Secure`
- [x] 自動トラッキング（スクロール深度 / 外部リンク / LINE / Instagram / 予約サイトクリック）
- [x] カスタムイベント計 20+ 種

---

## 📋 管理画面で必要な作業

### 1. 🔑 Key Event（旧コンバージョン）登録

**管理 → イベント → 既存のイベント** で以下の右端スイッチを ON：

| イベント名 | 目的 | 価値 |
|---|---|---|
| ⭐ `sim_pdf_download` | シミュレーションPDF保存（意思高い見込み客） | 最重要 |
| ⭐ `line_click` | LINE誘導成功 | 最重要 |
| ⭐ `booking_click` | Google Calendar 予約ページへ遷移 | 最重要 |
| `sim_complete` | シミュレーション完遂 | 高 |
| `creator_favorite` | クリエイターお気に入り登録 | 中 |
| `creator_view_detail` | クリエイター詳細閲覧 | 中 |
| `sim_nominate_creator` | クリエイター指名 | 中 |

まだ一度も発火してないイベントは一覧に出ないので、各ページで1回ずつ動作確認してから設定してください。

---

### 2. 📐 カスタムディメンション登録

**管理 → カスタム定義 → カスタムディメンション → 作成**

| ディメンション名 | スコープ | イベントパラメータ | 説明 |
|---|---|---|---|
| クリエイターID | イベント | `creator_id` | クリエイター別分析 |
| カテゴリ | イベント | `category` | シミュレーション項目別 |
| メニューID | イベント | `menu_id` | メニュー別人気度 |
| ゲスト人数 | イベント | `guests` | シミュレーションの規模 |
| 合計金額 | イベント | `total_price` | 予算分布 |
| スクロール深度 | イベント | `percent` | 離脱傾向 |
| 会場ID | イベント | `venue_id` | 会場別人気度 |
| CTA位置 | イベント | `location` | CTA設置位置別の効果 |

これを登録するとレポートで「セカンダリディメンション」に使えます。

---

### 3. 👥 オーディエンス作成

**管理 → オーディエンス → 新しいオーディエンス**

| 名前 | 条件 | 用途 |
|---|---|---|
| 🎯 **見積もり完了者** | `sim_complete` を発火したユーザー | 広告リマケの本丸 |
| 🎯 **PDF保存者** | `sim_pdf_download` を発火したユーザー | 最も見込み高い層 |
| 💚 **LINE相談開始** | `line_click` を発火したユーザー | 結論まで行ったセグメント |
| 💡 **クリエイター興味層** | `creator_view_detail` を 2 回以上 | ナーチャリング対象 |
| ⭐ **お気に入り登録者** | `creator_favorite` 発火 | 比較検討中 |
| 📉 **離脱層** | シミュレーションページ滞在30s未満 | 広告から除外 |

Google Ads 連携後、これらをリマーケティングリストとして活用できます。

---

### 4. 🔗 外部連携

#### ① Google Search Console 連携
**管理 → Search Consoleリンク → リンク**
→ 自然検索流入→サイト内行動を横断分析可能に。

#### ② Google Ads 連携（広告運用する場合）
**管理 → Google Ads リンク → リンク**
→ コンバージョンインポート + オーディエンス共有 + 入札自動最適化

#### ③ BigQuery エクスポート（データ分析する場合）
**管理 → BigQueryのリンク → リンク**
→ 生ログをSQLで分析（無料枠あり）

---

### 5. 🔍 確認テスト（DebugView）

**管理 → DebugView** で開き、ブラウザの開発者ツールで以下を実行すると、リアルタイムにイベントが流れるのを確認できる：

```js
// GA4 Debug Modeを有効化
window.gtag?.('set', 'debug_mode', true);
```

または、Chrome拡張機能「Google Analytics Debugger」を使う。

---

### 6. 🚀 レポートのブックマーク

以下のレポートを作成しておくと便利：

#### A. シミュレーターファネル
**探索 → ファネル探索**
```
step1: page_view (/simulation)
step2: sim_start
step3: sim_progress (percent ≥ 50)
step4: sim_complete
step5: sim_pdf_download
```

#### B. クリエイター別PV / 指名ランキング
**探索 → 自由形式**
- ディメンション: カスタム「クリエイターID」 + `name`
- 指標: イベント数 (`creator_view_detail`)

#### C. エリア別コンバージョン率
**探索 → 自由形式**
- ディメンション: 市区町村
- 指標: PV / `sim_pdf_download` / `line_click`

#### D. 見積もり金額分布
**探索 → 自由形式**
- ディメンション: なし（または `total_price` バケット）
- 指標: `sim_pdf_download` イベント数 + 合計金額の分布

---

### 7. ⚠️ プライバシー対応（必要に応じて）

- **Consent Mode v2**：既にコード側で実装済み（ad は denied / analytics は granted で初期化）
- **EU向けアクセスが多い場合**：Cookieバナー導入（Cookieyes, Osanoなど）で `grantConsent()` / `denyConsent()` を呼ぶ
- **プライバシーポリシーに記載**：GAでのトラッキングを明記（既存のプライバシーポリシーに追記推奨）

GDPR対象ユーザーがほぼない運用なら現行設定で十分です。

---

## 🧪 発火中の全イベント一覧

### ページビュー・流入
- `page_view` (自動 / SPA route change)
- `scroll_depth` { percent, path }
- `outbound_click` { host, href, path }
- `line_click` { href, path }
- `instagram_click` { href, path }
- `booking_click` { href, path }

### シミュレーション
- `sim_start` { guests }
- `sim_select_item` { category, item }
- `sim_nominate_creator` { category, creator_id }
- `sim_select_menu` { category, creator_id, menu_id }
- `sim_select_venue` { venue_id }
- `sim_guests_change` { guests }
- `sim_progress` { percent, filled, total_categories }
- `sim_complete` { total_price, guests, creators_nominated }
- `sim_pdf_download` { total_price, guests, categories_filled, creators_nominated, creator_ids, has_venue }
- `sim_pdf_save` (旧互換)
- `sim_image_save` (フォールバック用)

### CTA
- `cta_line` { location }

### クリエイター
- `creator_view_detail` { creator_id }
- `creator_favorite` { creator_id, action: "add" | "remove" }
- `creator_sns_click` { creator_id }
- `creator_video_play` { creator_id }
- `creator_partner_cta` { category }

### ジャーナル
- `journal_filter` { category }

---

## 🎯 リッチメニュー UTM 計測

LINE リッチメニュー経由の流入は GA4 で以下のクエリで識別可能：

**探索 → 自由形式 →**
- ディメンション: `session source` = `line`
- ディメンション: `session medium` = `rich_menu`
- ディメンション: `session campaign content` = `simulation`等

---

## 📈 月次で確認すべきKPI

| KPI | 目標値（初月） | 改善トリガー |
|---|---|---|
| セッション数 | — | Search Consoleで流入キーワード確認 |
| シミュレーター完了率 | 30%以上 | `sim_start` → `sim_complete` |
| PDF保存率 | 15%以上 | `sim_complete` → `sim_pdf_download` |
| LINE誘導率 | 10%以上 | PDF保存 → `line_click` |
| クリエイター詳細閲覧 | セッションあたり平均1.5 | — |

---

## 環境変数管理

開発環境ごとに GA ID を切り替えたい場合：

```bash
# .env.local (本番)
NEXT_PUBLIC_GA_ID=G-QPV9CZRY9H

# .env.development.local (ステージング用・発火させたくない場合は空値)
NEXT_PUBLIC_GA_ID=
```

ID が未設定の場合も既存のハードコード値 `G-QPV9CZRY9H` にフォールバックします（`gtag.ts` 参照）。
