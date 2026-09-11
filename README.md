# PokéSpeed

> **專為 Pokémon Champions 對戰設計的現代化速度線查詢與實時基準對抗分析工具**  
> A high-performance, modern Pokémon VGC Speed Tier Calculator & Live Benchmark Suite.

線上網站 -> https://thunder1967.github.io/PokeSpeed/

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.x-729B1B?logo=vitest)](https://vitest.dev/)

---

## Features
### 完整速線表
收錄 Pokémon Champions 環境主流寶可夢之速度種族值與常用型態
- 依種族值列出各寶可夢在極速、準速、無速、圍巾等多種情況的速度實數
- 搜尋框可用寶可夢中文名、英文名、速度種族值進行查詢
### 速線比較器
可在 "對戰設定" 中設置要比較的敵方狀態和我方寶可夢狀態。敵方狀態會被套用至所有種族值，計算出對應的速度實數，也就是 "敵方實數" 項。比較器會依照我方寶可夢速度實數標示出指定敵方狀態下比我方快的寶可夢。
- 比較器支援單/雙打比較
## Project Structure

```text
PokeSpeed/
├── .github/
│   └── workflows/          # GitHub Actions (定時更新天梯排名, 自動部署 Pages)
├── public/                 # 靜態資源檔案
├── scripts/
│   ├── fetch-season.ts     # 下載新賽季合法寶可夢名單 
│   ├── update-rankings.ts  # 獨立自 Smogon 更新單雙打天梯排名
│   ├── lib/                # Showdown/Smogon/PokeAPI 解析與本地快取模組
│   └── rosters/            # 賽季合法精靈名冊快照
├── src/
│   ├── assets/
│   │   └── icons/          # SVG 圖示集中庫
│   ├── components/
│   │   ├── AboutPage.ts    # 關於本站 / 獨立佈告欄畫面
│   │   ├── Drawer.ts       # 對戰設定側邊抽屜 
│   │   ├── Header.ts       # 頂部吸附導航列 
│   │   ├── PinDivider.ts   # 速線表動態插入之圖釘分割線
│   │   └── SpeedTable.ts   # 核心速線表 
│   ├── config/
│   │   └── appConfig.ts    # 全域設定常數 
│   ├── data/
│   │   ├── aboutInfo.ts    # 佈告欄自訂文字區塊與超連結資訊
│   │   └── formats/        # 賽季速線資料庫 (champion-m-b.json, index.ts 註冊表,…)
│   ├── i18n/               # 多語系字典與語系狀態訂閱器
│   ├── store/
│   │   └── battleState.ts  # 對戰設定狀態 Store (賽季代號、單雙打、各 Slot 配置)
│   ├── styles/
│   │   ├── main.css        # 全域樣式、動畫與吸附導航設定
│   │   └── table.css       # 速線表格網格佈局、凍結定位與霓虹捲動軸
│   ├── types/
│   │   └── pokemon.ts      # 寶可夢、速線、Slot 型別定義
│   ├── utils/
│   │   ├── imageFallback.ts    # 圖片破損自動替換為替代身頭像
│   │   ├── pinDividerCalc.ts   # 圖釘分割線相對排序與合併邏輯
│   │   ├── pokemonSearch.ts    # 寶可夢搜尋、快取與下拉選單渲染器
│   │   ├── security.ts         # escapeHtml, sanitizeUrl, clamp 安全防護
│   │   └── speedCalc.ts        # 寶可夢 Lv.50 速度實數核心計算公式
│   └── main.ts             # 應用程式入口點與 SPA 路由掛載
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 快速開始

### 前置需求 (Prerequisites)
- [Node.js](https://nodejs.org/) (建議 v18.0.0 以上版本)
- npm 或 pnpm / yarn

### 安裝步驟 (Installation)

1. **複製儲存庫 (Clone Repository)**：
   ```bash
   git clone https://github.com/Thunder1967/PokeSpeed.git
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

## 賽季名冊下載與天梯數據更新
### 1. 下載指定(新)賽季可用寶可夢 (`npm run fetch:season`)
當官方公布新賽季規則時，可人工手動執行以下指令以下載該賽季之合法寶可夢名單：
```bash
# 預設下載 Regulation M-B 名冊
npm run fetch:season

# 下載指定新賽季 (如 Regulation M-C)
npm run fetch:season -- --format=m-c

# 強制略過快取重新下載
npm run fetch:season -- --format=m-c --force
```
- 指令會自動將新賽季資料註冊至 `src/config/appConfig.ts`（可用賽季清單）與 `src/data/formats/index.ts`，前端頂部導覽列的賽季下拉選單將自動可選該新賽季。
### 2. 獨立更新單雙打天梯排名 (`npm run update:rankings`)
自 **Smogon Stats (1500+)** 抓取單雙打天梯資料，用於更新既有名冊中寶可夢的單打 (BSS) 與雙打 (VGC) 排名與使用率數值，並將同速階層重新按雙打排名排列：
```bash
# 預設執行：自動更新 appConfig.ts 當前賽季 (如 champion-m-b) 最新天梯排名
npm run update:rankings

# 手動指定更新特定賽季 (如歷史賽季 champion-m-a)
npm run update:rankings -- --format=m-a

# 手動指定特定天梯月份 (如 2026-08)
npm run update:rankings -- --month=2026-08

# 手動指定天梯分段門檻 (如 1760 高端分段)
npm run update:rankings -- --cutoff=1760

# 組合參數範例
npm run update:rankings -- --format=m-b --month=2026-08 --cutoff=1500 --force
```

#### 手動微調特定精靈數據
若僅需個別微調少數寶可夢的單雙打排名或百分比，可直接編輯 json 檔，如： `src/data/formats/champion-m-b.json`：
```json
{
  "id": 1003,
  "formId": "ting-lu",
  "nameZh": "古鼎鹿",
  "nameEn": "Ting-Lu",
  "baseSpeed": 45,
  "sprite": "https://play.pokemonshowdown.com/sprites/gen5/tinglu.png",
  "usageRankSingle": 12,        // 單打天梯排名 (數值越小越熱門)
  "usageRankDouble": 28,        // 雙打天梯排名 (數值越小越熱門)
  "usagePercentSingle": 8.42,   // 單打使用率百分比 (%)
  "usagePercentDouble": 5.16    // 雙打使用率百分比 (%)
}
```

#### 繁體中文特殊譯名微調
如需強制指定特定型態或新寶可夢之中文譯名，可至 `scripts/lib/name-override.json` 進行編輯。

---

## 測試與品質檢查 (Testing & Quality)
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
專案涵蓋 12 個測試套件、100 項自動化單元測試，確保核心算式、狀態連動與介面穩定：
- **速度計算公式** (`speedCalc.test.ts`)：性格修正、努力值換算、特性加成、能力階級、順風與圍巾疊加。
- **圖釘分割線演算法** (`pinDividerCalc.test.ts`)：超越最高速、低於最低速、區間定位、同速合併。
- **安全防護機制** (`security.test.ts`)：XSS 防禦、跳脫字元、非法 URL 攔截與值域安全 clamp。
- **搜尋引擎與多語系** (`pokemonSearch.test.ts`, `i18n.test.ts`)：中英文雙向模糊匹配、語系切換與動態渲染。
- **UI 元件渲染** (`SpeedTable.test.ts`, `AboutPage.test.ts`, `Header.test.ts`)：DOM 結構渲染、折疊展開、賽季下拉選單與事件響應。
- **狀態管理與廣播** (`battleState.test.ts`)：對戰設定 Store 變更、Slot 狀態管理與 rAF 批次通知。
- **全域配置與自適應** (`appConfig.test.ts`)：網路省流量 (SaveData) 判定與多螢幕寬度自適應斷點。
- **賽季速線資料庫** (`formats.test.ts`)：多賽季速線資料正確載入與 fallback 回退容錯。
- **天梯數據解析器** (`smogon-stats.test.ts`)：Smogon 賽制代號動態轉換 (`toSmogonRegCode`) 與天梯統計文字報表解析。

---

## 授權與聲明

### 數據與圖資致謝
- 本站對戰數據與部分寶可夢圖示引用自 [Pokémon Showdown](https://play.pokemonshowdown.com)
- 部分寶可夢圖示引用自 [PokeAPI](https://github.com/PokeAPI/sprites/)
- 排位天梯統計引用自 [Smogon University](https://www.smogon.com/)

### 免責聲明
PokéSpeed 為非官方、免費的粉絲自製工具，與 [Nintendo](https://www.nintendo.com/)、[Game Freak](https://www.gamefreak.co.jp/) 及 [Creatures Inc. / The Pokémon Company](https://www.pokemon.co.jp/) 無任何關聯，亦未獲得其授權或背書。寶可夢（Pokémon）、寶可夢圖示及所有相關名稱之商標與著作權均屬各原權利人所有。本工具僅供非營利之玩家對戰競技參考使用。

### 專案授權
本專案原始碼採用 [CC BY-NC 4.0 (姓名標示-非商業性)](https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hant) 授權開源。

> **注意**：本專案僅供非營利之個人學習與玩家對戰競技參考使用，嚴禁任何形式之商業獲利行為。專案中所引用之 Pokémon 名稱、商標、外觀圖示等第三方資產**絕不屬於**此授權範疇，其商標與著作權均歸原權利人所有。

## 問題回報
若在對戰計算或使用上有任何建議、錯誤回報，歡迎填寫 [意見回饋表單](https://docs.google.com/forms/d/e/1FAIpQLSecYgH3X76K7zKufvV6WSz6BzuUEddqg50dCHFEB6EVYcTrdw/viewform?usp=publish-editor)。