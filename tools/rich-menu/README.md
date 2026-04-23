# ヒトカラウェディング LINE Rich Menu

サイトのデザイントーンに合わせて作成した公式アカウントのリッチメニュー。

## ファイル
- `template.html` — デザインの元データ（編集→再生成すれば差し替え可能）
- `generate.sh` — Chrome Headless で PNG 生成
- `rich-menu.png` — LINE にアップロードする画像（**2500×1686px**）

## 再生成
```bash
bash tools/rich-menu/generate.sh
```

---

## LINE Official Account Manager での設定手順

### 1. リッチメニューを作成
1. [LINE Official Account Manager](https://manager.line.biz/) にログイン
2. 左メニュー「**トークルーム管理 → リッチメニュー**」
3. 「**作成**」をクリック
4. 「**タイトル**」: `ヒトカラ メインメニュー`（管理用・ユーザーには見えない）
5. 「**表示期間**」: 開始日のみ指定 / 終了日は空欄（無期限）
6. 「**メニューバーのテキスト**」: `メニュー` でOK
7. 「**メニューのデフォルト表示**」: ON（開いた状態で表示）

### 2. 画像設定
1. 「**コンテンツ設定**」→「**テンプレートを選択**」
2. **大** → **6分割（3×2）** を選択
3. 「**背景画像をアップロード**」→ `rich-menu.png` をアップロード

### 3. 各エリアのアクション設定（6箇所）

座標参考用（LINE 側で自動配置されますが確認用）：

| # | 位置 | ピクセル座標 (x, y, w, h) | ラベル | アクション種別 | 遷移先URL |
|---|---|---|---|---|---|
| 1 | 左上 | (0, 0, 833, 843) | 見積もり試算 | リンク | `https://hitokarawedding.com/simulation` |
| 2 | 中央上 | (833, 0, 834, 843) | クリエイター | リンク | `https://hitokarawedding.com/creators` |
| 3 | 右上 | (1667, 0, 833, 843) | 会場 | リンク | `https://hitokarawedding.com/#venues` |
| 4 | 左下 | (0, 843, 833, 843) | ヒトカラとは | リンク | `https://hitokarawedding.com/concept` |
| 5 | 中央下 | (833, 843, 834, 843) | ジャーナル | リンク | `https://hitokarawedding.com/journal` |
| 6 | 右下 | (1667, 843, 833, 843) | 相談を予約 | リンク | `https://calendar.app.google/ZN4YAQ4EKw7BZNDx9` |

各エリアの設定画面では：
- **アクションの種類**: `リンク`
- **アクションラベル**: 各ラベル（音声読み上げ等で使用）
- **URL**: 上記の遷移先URL

### 4. 保存・公開
1. 「**保存**」をクリック
2. 「**表示する**」にチェック（既存メニューがあれば自動で切り替わる）

---

## ❗ 画像変更時の注意

`template.html` を編集した場合：
```bash
bash tools/rich-menu/generate.sh
```
で再生成し、LINE管理画面から**画像を差し替えアップロード**してください。
テキスト・色・アイコンを調整したい場合は、HTML 側の CSS 変数（`:root` 内）と各セルの `<svg>` / `<span>` を編集します。

## UTM パラメータを付けて流入計測する場合
GA4 で「リッチメニューからの流入」を区別したい場合、各 URL に以下を追加：

```
?utm_source=line&utm_medium=rich_menu&utm_campaign=main&utm_content=simulation
```

例：
```
https://hitokarawedding.com/simulation?utm_source=line&utm_medium=rich_menu&utm_content=simulation
```

`utm_content` は各ボタン名（`simulation` / `creators` / `venues` / `concept` / `journal` / `booking`）にすると効果測定しやすいです。
