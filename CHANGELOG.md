# Changelog

## 2026-06-03

### 軟刪除機制（Soft Delete）

將原本的「物理刪除」改為「軟刪除」，避免刪除一筆資料時連帶 cascade 毀掉底下的歷史紀錄（學生、出缺勤、成績、寵物健康紀錄、上課薪資結算等）。被刪除的資料保留在資料庫並從所有列表/統計中隱藏，可後續還原。

- **背景**：原本刪除 Course/School 會透過 Prisma `onDelete: Cascade` 連鎖刪除 Student → Attendance/GradeSheet、以及 CourseSession（含每堂課的薪資金額），且 `AuditLog` 在 DELETE 時 `changes: null`（不保存內容），刪除後完全無法復原。

- **影響的 6 個 Model**（各新增 `deleted_at DateTime?` 欄位 + 索引）：
  - `School`、`Student`、`Pet`、`SalaryBase`、`CourseSession`、`User`
  - 對應 migration：`20260603044006_add_course_soft_delete`、`20260603050622_add_soft_delete_to_core_models`

- **行為變更**：
  - 各 model 的 `DELETE` 端點改為標記 `deleted_at`（不再物理刪除），同時更新 `modifier_id`。
  - 所有 `list / count / findOne / update` 查詢排除已軟刪除的紀錄。

- **祖先過濾**（刪上層→下層自動隱藏，並可隨上層還原而自動回復）：
  - Course 列表排除「所屬 School 已刪除」。
  - Student 列表排除「所屬 Course / School 已刪除」。
  - Attendance、GradeSheet 的 列表 / 統計 / 匯出 排除「所屬 Student / Course / School 已刪除」。
  - Dashboard 各項統計（學校 / 課程 / 學生 / 今日出席率）一併套用。

- **薪資相關**：
  - `CourseSession` 不做祖先過濾 —— 即使其 Course/School 被刪除，歷史上課與薪資結算仍保留於薪資彙總（`getSalarySummary` / `recalculateAllSalaries` 僅排除已軟刪除的 session）。
  - 薪資計算 `calculateSalary` 排除已軟刪除的 `SalaryBase`，但歷史 session 已存的 `salary_amount` 不受影響。

- **安全性（User 軟刪除）**：
  - 登入、JWT 驗證、Bot（Telegram/Slack）綁定查詢一律查不到已軟刪除帳號。
  - `ApiTokenGuard` 除了 `status` 外，新增 `deleted_at` 檢查，避免軟刪除帳號的 PAT 仍可使用。

- **設計邊界**：
  - 葉節點紀錄（`Attendance`、`GradeSheet`、各 `Health*`）維持硬刪除（刪單筆為刻意修正），透過上層祖先過濾隱藏。
  - 唯一鍵（`User.account`、`School.code`）仍受 DB unique 限制，軟刪除後無法以相同值新建，需還原舊紀錄。
  - 目前為純後台隱藏，尚未提供還原（restore）的 UI / API。

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
