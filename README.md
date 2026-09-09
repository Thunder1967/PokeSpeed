# PokéSpeed Champion ⚡

> **專為寶可夢 VGC 對戰設計的現代化速度線查詢與實時基準對抗分析工具**  
> A high-performance, modern Pokémon VGC Speed Tier Calculator & Live Benchmark Suite.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.x-729B1B?logo=vitest)](https://vitest.dev/)
[![Tests](https://img.shields.io/badge/Tests-82%20passed-success)](https://github.com/)

---

## 🌟 核心特色 (Core Features)

### 1. 🏎️ 完整 VGC 冠軍規速度線矩陣 (Comprehensive Speed Tiers)
- 收錄最新規排位（Champion MB）環境主流寶可夢之速度種族值與常用型態。
- 橫向同步速線基準欄位：
  - **極速 (Max 252+ EV)**：性格 +1.1 修正、252 努力值。
  - **準速 (Neutral 252 EV)**：性格 1.0 修正、252 努力值。
  - **無調 (Neutral 0 EV)**：性格 1.0 修正、0 努力值。
  - **極慢 (Min 0- EV)**：性格 -0.9 修正、0 努力值。
  - **圍巾極速 / 準速 (Scarf 1.5x)**：攜帶講究圍巾時實數。
  - **降 1 階極速 / 準速 (-1 Stage 0.66x)**：受黏黏網、重踏等降速後實數。

### 2. ⚙️ 對戰設定抽屜與即時實數重算 (Live Battle Drawer & Calcs)
- **單打 / 雙打基準切換**：單打提供 2 基準 Slot（對手基準 + 我方 A），雙打提供 3 基準 Slot（對手基準 + 我方 A + 我方 B）。
- **細緻化即時調配**：
  - 努力值滑條：支援 0～32 檔次（0 至 252 EV）精確調節。
  - 性格修正三態按鈕：`+` (+10%)、`=` (無修正)、`-` (-10%)。
  - 能力階級滑條：支援 -6 至 +6 階速升降。
  - 實戰修正複選框：順風（Tailwind 2x）、講究圍巾（Choice Scarf 1.5x）、特性加速（Speed Boost / 葉綠素 / 撥沙等 2x）、麻痺（Paralysis 0.5x）。
- 實時展示 Lv.50 實際速度數值（Real Speed Value）。

### 3. 📌 實時動態圖釘分割線 (Dynamic Pin Dividers)
- 根據玩家當前配置的寶可夢與對抗基準，即時計算其在速線表中的絕對位階。
- 在速線表對應列自動插入發光的圖釘分割線（Pin Divider），支援：
  - 跨速度區間插入（精確落在比它快與比它慢的種族值列之間）。
  - 當我方 A 與我方 B 處於同速區間時，自動合併渲染並列頭像與各自配置，避免視覺衝突。
  - 支援點擊/懸停圖釘查看詳細加成配點資訊。

### 4. 🌐 即時雙語系統 (Internationalization / i18n)
- 支援 **繁體中文 (Traditional Chinese)** 與 **English** 一鍵無縫即時切換。
- 全站標題、搜尋欄、各項修正標籤、寶可夢名稱（主名與副名動態對調）、單位標籤、佈告欄資訊均具備完整多語系支援。

### 5. 📋 獨立「關於本站」動態佈告欄 (Bulletin Board)
- 獨立 SPA 路由（`#/about` 與 `#/` 互相切換）。
- 資料集中於 `src/data/aboutInfo.ts`，支援自訂文字區塊（`[]`）與超連結，便於站長隨時維護更新版本說明、授權與對戰指南。

### 6. 🎨 頂級現代深色對戰美學 (Premium Battle UI)
- **持續吸附導航列 (Persistent Sticky Nav)**：頂部導航無論頁面如何滾動皆維持吸附置頂，並配合模糊玻璃（Glassmorphism）與即時容器高度計算。
- **凍結表頭 (Sticky Table Header)**：速線表縱向捲動時，表頭與基礎速度欄（Sticky Left）無縫釘選，隨時掌握各欄指標。
- **單一霓虹捲動軸 (Unified Neon Scrollbar)**：隱藏每列重複的多個捲動軸，只保留表頭上方一條流光漸層滾動條，橫向捲動時百列資料即時批次同步。

---

## 🛠️ 技術架構 (Tech Stack & Architecture)

| 技術 / 工具 | 說明 |
| :--- | :--- |
| **Language** | **TypeScript 5.x**（嚴格型別檢查，零 `any` 降級） |
| **Build Tool** | **Vite 8.x**（極速熱重載與 Production Bundle Tree-shaking） |
| **Styling** | **TailwindCSS 3.x** + 模組化 Vanilla CSS（深色主題、玻璃擬態） |
| **State Management** | **輕量微型訂閱 Store (`battleStore`)**（以發布訂閱驅動 UI 重算） |
| **Testing** | **Vitest 5.x**（10 個測試檔案、82 項單元測試，涵蓋各項公式與邊界） |
| **Security** | 嚴格防禦 XSS，所有使用者輸入皆經過 `escapeHtml`，圖片 URL 經 `sanitizeUrl` 驗證 |

### 目錄結構 (Project Structure)

```text
PokeSpeed/
├── public/                 # 靜態資源檔案
├── src/
│   ├── assets/
│   │   └── icons/          # SVG 圖示集中庫 (順風, 圍巾, 特性, 麻痺等)
│   ├── components/
│   │   ├── AboutPage.ts    # 關於本站 / 獨立佈告欄畫面
│   │   ├── Drawer.ts       # 對戰設定側邊抽屜 (Slot A/B, 數值滑條, 修正項)
│   │   ├── Header.ts       # 頂部吸附導航列 (搜尋, 語言切換, 抽屜按鈕)
│   │   ├── PinDivider.ts   # 速線表動態插入之發光圖釘分割線
│   │   └── SpeedTable.ts   # 核心速線表 (凍結標頭, 基準格計算, 批次捲動)
│   ├── config/
│   │   └── appConfig.ts    # 全域設定常數 (圖釘限制, 預設頭像, 算式檔次)
│   ├── data/
│   │   ├── aboutInfo.ts    # 佈告欄自訂文字區塊與超連結資訊
│   │   └── formats/        # 排位主流寶可夢數據 (champion-m-b.json)
│   ├── i18n/               # 多語系字典與語系狀態訂閱器
│   ├── store/
│   │   └── battleState.ts  # 對戰設定狀態 Store (單雙打、各 Slot 配置)
│   ├── styles/
│   │   ├── main.css        # 全域樣式、動畫與吸附導航設定
│   │   └── table.css       # 速線表格網格佈局、凍結定位與霓虹捲動軸
│   ├── types/
│   │   └── pokemon.ts      # 寶可夢、速線、Slot 型別定義
│   ├── utils/
│   │   ├── imageFallback.ts    # 圖片破損自動替換為替代身頭像
│   │   ├── pinDividerCalc.ts   # 圖釘分割線相對排序與合併邏輯
│   │   ├── pokemonSearch.ts    # 寶可夢搜尋、快取與下拉選單渲染器
│   │   ├── reverseCalc.ts      # 速度實數反推配點演算法
│   │   ├── security.ts         # escapeHtml, sanitizeUrl, clamp 安全防護
│   │   └── speedCalc.ts        # 寶可夢 Lv.50 速度實數核心計算公式
│   └── main.ts             # 應用程式入口點與 SPA 路由掛載
├── tests/                  # 單元測試集 (*.test.ts)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 快速開始 (Getting Started)

### 前置需求 (Prerequisites)
- [Node.js](https://nodejs.org/) (建議 v18.0.0 以上版本)
- npm 或 pnpm / yarn

### 安裝步驟 (Installation)

1. **複製儲存庫 (Clone Repository)**：
   ```bash
   git clone https://github.com/your-username/pokespeed.git
   cd pokespeed
   ```

2. **安裝依賴套件 (Install Dependencies)**：
   ```bash
   npm install
   ```

3. **啟動本機開發伺服器 (Start Dev Server)**：
   ```bash
   npm run dev
   ```
   瀏覽器造訪 `http://localhost:5173/` 即可開始使用。

---

## 🔄 更新單雙打數據 (Updating Pokémon Data)

寶可夢速度與排位熱門度數據儲存於 `src/data/formats/champion-m-b.json`。專案提供**自動化管線**與**手動微調**兩種更新方式：

### 方式一：使用自動化同步腳本 (推薦)
專案在 `scripts/sync-data.ts` 中封裝了自動化管線，可自動自 **Pokémon Showdown**、**PokeAPI** 與 **Smogon 天梯榜單**抓取並組裝最新單雙打數據：

```bash
# 預設執行：自動探測最新月份與 1500 分段，更新 champion-m-b.json
npm run sync:data

# 強制略過本機快取，重新抓取遠端資料
npx tsx scripts/sync-data.ts --force

# 指定月份 (如 2026-02)
npx tsx scripts/sync-data.ts --month=2026-02

# 指定天梯分段門檻 (如 1760 高端分段)
npx tsx scripts/sync-data.ts --cutoff=1760

# 組合參數範例
npx tsx scripts/sync-data.ts --month=2026-02 --cutoff=1760 --force
```

### 方式二：手動修改資料檔
若僅需個別微調少數寶可夢的單雙打排名或百分比，可直接編輯 `src/data/formats/champion-m-b.json`：
```json
{
  "id": 1003,
  "formId": "ting-lu",
  "nameZh": "古鼎鹿",
  "nameEn": "Ting-Lu",
  "baseSpeed": 45,
  "sprite": "https://play.pokemonshowdown.com/sprites/gen5/tinglu.png",
  "usageRankSingle": 12,        // 單打天梯排名 (數值越小越熱門，未上榜填 999)
  "usageRankDouble": 28,        // 雙打天梯排名 (數值越小越熱門，未上榜填 999)
  "usagePercentSingle": 8.42,   // 單打使用率百分比 (%)
  "usagePercentDouble": 5.16    // 雙打使用率百分比 (%)
}
```

> [!TIP]
> **繁體中文特殊譯名微調**：如需強制指定特定型態或新寶可夢之中文譯名，可至 `scripts/lib/name-override.json` 進行編輯。

---

## 🧪 測試與品質檢查 (Testing & Quality)

專案具備完整的自動化品質檢查體系：

```bash
# 執行所有單元測試 (Vitest)
npm test

# 執行 TypeScript 靜態型別檢驗 (No Emit)
npm run lint

# 執行正式環境 Production 建置與打包
npm run build
```

### 測試覆蓋範疇 (Test Suites)
- **速度計算公式** (`speedCalc.test.ts`)：性格修正、努力值換算、特性加成、能力階級、順風與圍巾疊加。
- **圖釘分割線演算法** (`pinDividerCalc.test.ts`)：超越最高速、低於最低速、區間定位、同速合併。
- **安全防護機制** (`security.test.ts`)：XSS 防禦、跳脫字元、非法 URL 攔截與值域安全 clamp。
- **搜尋引擎與多語系** (`pokemonSearch.test.ts`, `i18n.test.ts`)：中英文雙向模糊匹配與動態渲染。
- **UI 元件渲染** (`SpeedTable.test.ts`, `AboutPage.test.ts`)：DOM 結構渲染與事件響應。

---

## 📝 授權與聲明 (License & Disclaimer)

- 本專案採用 **MIT License** 開源授權。
- **免責聲明**：寶可夢（Pokémon）、寶可夢圖示、數值與相關版權歸屬於 [Nintendo](https://www.nintendo.com/)、[Game Freak](https://www.gamefreak.co.jp/) 與 [Creatures Inc. / The Pokémon Company](https://www.pokemon.co.jp/)。本工具僅供非營利之個人學習與玩家對戰競技參考使用。
