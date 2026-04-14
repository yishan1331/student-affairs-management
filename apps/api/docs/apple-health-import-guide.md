# Apple Health 體重資料匯入指南

提供兩種方式把 Apple Health 的體重資料灌進 `HealthWeight` 表：
1. **iOS 捷徑 + 個人存取權杖（PAT）** — 日常自動同步單筆
2. **一次性腳本 + Prisma 直寫 DB** — 批量匯入歷史資料（本文重點）

---

## 方式 A：日常自動同步（iOS Shortcuts）

### 後端 API
- Endpoint：`POST /api/v1/ingest/weight`
- 認證：Bearer Token（使用 PAT，**不是** JWT）
- 節流：全域 60 req/min
- 行為：以「本地日曆日」為 key 做 upsert（同一天多次呼叫只會更新同一筆）

### PAT 建立流程
1. 登入 dashboard → 側邊欄「個人存取權杖」
2. 點「新增權杖」→ 輸入名稱（如：iPhone 體重同步）→ 建立
3. **立即複製**完整 token（僅顯示一次）
4. 在 iOS 捷徑設定 HTTP header：`Authorization: Bearer <token>`

### Request 範例
```json
POST /api/v1/ingest/weight
Authorization: Bearer sat_xxxxxxxx...

{
  "date": "2026-04-15T08:00:00+08:00",
  "weight": 68.5,
  "height": 175,
  "bmi": 22.4,
  "note": "早上量"
}
```

欄位：
| 欄位 | 必填 | 型別 | 備註 |
|------|------|------|------|
| `date` | ✅ | string | ISO 8601 或 `YYYY-MM-DD`；dedup 取前 10 碼作為當地日 |
| `weight` | ✅ | number | 公斤，0.1 ~ 500，**最多 2 位小數**（超過會回 400） |
| `height` | | number | 公分，1 ~ 300 |
| `bmi` | | number | 0 ~ 100 |
| `note` | | string | 備註 |

> ⚠️ **關於精度限制**：Apple Health 回傳的原始浮點常有誤差（例如 `64.09999847412109`）。DTO 嚴格擋超過 2 位小數，因此呼叫端（Shortcut / 腳本）**必須自行四捨五入**後再送。Shortcut 的設定見下一節。

### 角色權限
- PAT 持有者對應到建立者本人（JWT 登入者）
- Casbin 政策：`p, role:user, /api/v1/ingest/weight, create`
- admin / user 都可使用，guest 不可

### iOS Shortcut 完整設定

#### 前置
1. Dashboard → **個人存取權杖** → 新增 → 複製完整 token（`sat_...`）
2. 記下 API URL：`https://<你的網域>/api/v1/ingest/weight`

#### 捷徑步驟（共 6 個動作）

打開 **捷徑 App** → 右上 `+` 新增捷徑 → 命名「同步體重」：

1. **尋找健康樣本**（Find Health Samples）
   - 樣本類型 = **身體質量**（搜尋「體重」也找得到）
   - 排序依據 = **結束日期**
   - 順序 = **最新的在最前**
   - 限制 = **1**

2. **取得健康樣本的詳細資料**（Get Details of Health Samples）
   - 輸入 = 步驟 1 的結果
   - 取得 = **數值**
   - → 產生變數「數值」（這時候是 `64.09999847412109` 這種原始浮點）

3. **捨入數字**（Round Number）
   - 數字 = 步驟 2 的「數值」
   - 捨入到 = **2 位小數**
   - 捨入方式 = **一般**（四捨五入）
   - → 產生變數「捨入數字」

4. **取得健康樣本的詳細資料**（Get Details of Health Samples）
   - 輸入 = 步驟 1 的結果
   - 取得 = **開始日期**
   - → 產生變數「開始日期」

5. **格式化日期**（Format Date）
   - 日期 = 步驟 4 的「開始日期」
   - 日期格式 = **自訂**
   - 格式字串 = `yyyy-MM-dd'T'HH:mm:ssXXX`
   - → 產生變數「格式化日期」（例：`2026-04-15T08:00:00+08:00`）

6. **取得 URL 的內容**（Get Contents of URL）
   - 網址 = `https://<你的網域>/api/v1/ingest/weight`
   - 點**顯示更多**：
     - 方法 = **POST**
     - 標頭（加兩個）：
       - `Authorization` : `Bearer sat_你的token`
       - `Content-Type` : `application/json`
     - 請求主體 = **JSON**
       - `weight` → 類型 **數字** → 帶入步驟 3 的「捨入數字」
       - `date` → 類型 **文字** → 帶入步驟 5 的「格式化日期」

#### 視覺流程
```
尋找健康樣本 (體重, 最新 1 筆)
        ↓
取得數值 → 64.09999847412109
        ↓
捨入數字 (2 位) → 64.1
        ↓
取得開始日期
        ↓
格式化日期 (ISO 8601) → 2026-04-15T08:00:00+08:00
        ↓
POST /api/v1/ingest/weight
  Header: Authorization Bearer sat_...
  Body: { weight: 64.1, date: "2026-04-15T08:00:00+08:00" }
```

#### 測試與使用
- 第一次執行會跳「允許讀取身體質量資料」→ 允許
- 成功會看到 API 回傳 JSON
- 失敗常見原因：
  - **401**：token 打錯 / 過期 / 被撤銷
  - **400**：weight 小數位超過 2（忘記加捨入數字）或 JSON Body 的 weight 型別選成文字而不是數字
  - **429**：節流（全域 60 req/min、ingest 另外有限制）

#### 進階
- **主畫面按鍵**：編輯捷徑 → 右下 `⋯` → **加入主畫面**
- **自動化**：捷徑 App → 自動化分頁 → 每天早上 8 點執行
- **Siri**：「嘿 Siri，同步體重」

---

## 方式 B：批量匯入歷史資料（推薦用於首次匯入）

### 1. 從 iPhone 匯出資料
1. 打開 **健康 App**
2. 右上角頭像 → 下拉到底 → **「匯出所有健康資料」**
3. 等候產生 `匯出.zip`（資料多時可能數分鐘）
4. 透過 AirDrop / 雲端傳到電腦解壓
5. 取得 `export.xml`（主檔案）

### 2. 腳本位置
`apps/api/scripts/import-apple-health-weight.ts`

### 3. 執行方式

在 `apps/api` 目錄下：

**Dry-run（只統計不寫入）**
```bash
npm run import:apple-health -- --user=<userId> --file=<path/to/export.xml> --dry-run
```

**正式匯入（預設：已存在的日期跳過）**
```bash
npm run import:apple-health -- --user=<userId> --file=<path/to/export.xml>
```

**覆蓋既有資料**
```bash
npm run import:apple-health -- --user=<userId> --file=<path/to/export.xml> --overwrite
```

**綁給特定寵物**
```bash
npm run import:apple-health -- --user=<userId> --file=<path/to/export.xml> --pet=<petId>
```

### 4. 參數說明

| 參數 | 必填 | 說明 |
|------|------|------|
| `--user=<id>` | ✅ | 目標使用者 ID |
| `--file=<path>` | ✅ | `export.xml` 路徑（可相對） |
| `--pet=<id>` | | 綁定寵物；省略則為使用者個人體重 |
| `--overwrite` | | 覆蓋已存在日期的紀錄（預設跳過） |
| `--dry-run` | | 只統計，不寫入資料庫 |

### 5. 腳本行為

**解析**
- 逐行串流讀取 XML（不會吃爆記憶體，支援數百 MB 檔案）
- 僅擷取 `<Record type="HKQuantityTypeIdentifierBodyMass" .../>`
- 單位自動轉換：`kg` 直接用，`lb` × 0.45359237；其他單位略過

**去重邏輯**
- 以 `startDate` 前 10 碼（YYYY-MM-DD，Apple 匯出即當地時間）為 key
- 同一天多筆紀錄只保留 **最後出現** 的那一筆（通常為當天最新讀數）
- 日期正規化為 `YYYY-MM-DDT00:00:00.000Z`，與 `/v1/ingest/weight` 的 dedup 語義一致

**效能最佳化**
- 啟動時一次 `findMany` 撈回所有既有日期 → 記憶體 Set 判斷
- 寫入路徑逐筆 create / update（每 100 筆印進度）
- Neon 實測 700+ 天資料約 2-4 分鐘完成

**寫入欄位**
```ts
{
  user_id: <args.user>,
  pet_id: <args.pet || null>,
  date: <normalizedDate>,
  weight: <round(kg, 2)>,
  note: "Apple Health 匯入（<sourceName>）"
  // 更新時會額外寫入 modifier_id
}
```

### 6. 執行範例輸出
```
目標：user=Ethan(1)，模式=dry-run
掃描 3697161 行，命中體重紀錄 905 筆，去重後 747 天
時間範圍：2023-07-30 ~ 2026-04-14
資料庫已存在 0 天的紀錄
----
完成：新增 747、更新 0、略過 0（dry-run 未寫入）
```

---

## Troubleshooting

### Q1. 腳本看起來卡住不動？
**已修正**：舊版本對每一天各做一次 `findFirst`，700+ 次 Neon 來回需數分鐘。現在改成一次 `findMany` 預載後記憶體判斷，掃描結束後若沒有進度輸出，通常是寫入中（每 100 筆印一次）。

### Q2. 找不到 `.env.development.local`？
腳本靠 `apps/api/.env.development.local` 載入 `DATABASE_URL`。在 `apps/api` 目錄下執行 `npm run import:apple-health` 即可自動讀取。

### Q3. 時間範圍看起來少了？
- Apple Health 只包含你目前 iPhone 啟用 Health App 以來的資料
- 若換過手機但沒轉移健康資料會斷
- 刪除過的紀錄不會在 `export.xml` 出現

### Q4. 單位顯示怪怪的？
腳本目前僅接受 `kg` 和 `lb`，其他單位（`st` 英石等）會略過且不提示。若遇到可擴充 `import-apple-health-weight.ts` 的單位轉換邏輯。

### Q5. 想先看 XML 裡有哪些資料類型？
```bash
grep -oE 'type="HK[A-Za-z]+Identifier[A-Za-z]+"' export.xml | sort -u
```

---

## XML 結構參考

### 頂層節點
```xml
<HealthData>
  <Me .../>                    <!-- 個人資料 -->
  <Record type="..." .../>     <!-- 最大宗：量測/類別紀錄 -->
  <Workout .../>               <!-- 運動 session -->
  <ActivitySummary .../>       <!-- 每日活動概要 -->
  <ClinicalRecord .../>        <!-- 醫療紀錄 -->
</HealthData>
```

### 體重紀錄範例
```xml
<Record type="HKQuantityTypeIdentifierBodyMass"
        sourceName="Ethan 的 iPhone"
        sourceVersion="18.1"
        unit="kg"
        creationDate="2026-04-15 08:00:00 +0800"
        startDate="2026-04-15 08:00:00 +0800"
        endDate="2026-04-15 08:00:00 +0800"
        value="68.5"/>
```

### 目前 **未** 支援的類型（擴充需求時參考）
- `HKQuantityTypeIdentifierHeight` — 身高
- `HKQuantityTypeIdentifierBodyMassIndex` — BMI
- `HKQuantityTypeIdentifierBodyFatPercentage` — 體脂率
- `HKQuantityTypeIdentifierStepCount` — 步數（資料量大，建議另開 model）
- `HKQuantityTypeIdentifierHeartRate` — 心率（同上）
- `HKCategoryTypeIdentifierSleepAnalysis` — 睡眠（需新 model）

擴充時只要在 `parseExport` 增加對應 type 的分支，並在 DB 寫入路徑加上欄位即可。

---

## 相關檔案

| 檔案 | 用途 |
|------|------|
| `apps/api/scripts/import-apple-health-weight.ts` | 批量匯入腳本（方式 B） |
| `apps/api/src/core/ingest/ingest.controller.ts` | 日常同步端點（方式 A） |
| `apps/api/src/core/ingest/dto/ingest-weight.dto.ts` | API 參數驗證 |
| `apps/api/src/core/health-weight/health-weight.service.ts` | `upsertByDate` 共用邏輯 |
| `apps/api/src/core/api-token/` | PAT 管理 |
| `apps/api/src/common/guards/api-token/` | `ApiTokenGuard` 實作 |
| `apps/api/prisma/schema.prisma` | `HealthWeight` / `ApiToken` 結構 |
