# Changelog

## 2026-04-15

### 體重精度調整
- 體重支援到 **小數點後 2 位**（原為 1 位）。
- 前端 `InputNumber` 的 `precision=2 / step=0.01`（含寵物表單）。
- 後端 DTO 新增 `@IsNumber({ maxDecimalPlaces: 2 })`，影響三個端點：
  - `POST /api/v1/health-weight`
  - `POST /api/v1/ingest/weight`（PAT / Shortcut 來源）
  - `POST /api/v1/pet`（寵物體重）
- List / Show 頁面體重顯示改為 `.toFixed(2)`。
- **注意**：iOS Shortcut 需自行對 Apple Health 原始浮點做捨入（否則 `64.09999847412109` 會被 400 擋下）。設定步驟見 `apps/api/docs/apple-health-import-guide.md`。

### Apple Health 整合
- 新增 `apps/api/scripts/import-apple-health-weight.ts` 一次性腳本，支援從 Apple Health `export.xml` 批量匯入歷史體重資料到 `HealthWeight` 表。
- 新增 npm script：`npm run import:apple-health -- --user=<id> --file=<path> [--pet=<id>] [--overwrite] [--dry-run]`
- 逐行串流解析、本地日曆日去重、自動 `kg`/`lb` 單位轉換。
- 啟動時一次 `findMany` 預載已存在日期，避免逐筆查詢造成的慢速問題。
- 使用手冊：`apps/api/docs/apple-health-import-guide.md`

### 權杖管理擴充
- `GET /v1/api-token`：admin 可檢視所有使用者的權杖（附擁有者資訊）。
- `DELETE /v1/api-token/:id`：admin 可撤銷任何使用者的權杖。
- Dashboard：admin 視角在權杖列表多顯示「擁有者」欄位。

## 更早的變更
見 git log（`git log --oneline`）。
