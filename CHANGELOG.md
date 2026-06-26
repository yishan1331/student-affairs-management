# Changelog

## 2026-06-26

### 雙子系統架構與帳號層級存取控制

將系統拆分為**課程管理**與**健康管理**兩個子系統，並可依帳號開放可使用哪個（或哪些）子系統。權限新增「子系統」維度，與既有角色（admin/user/guest）正交：角色決定「能做什麼動作」，子系統決定「能進入哪個功能區」。

- **資料層**（`schema.prisma`）：新增 `enum Subsystem { course health }`，`User` 新增 `subsystems Subsystem[] @default([course, health])`。既有帳號 migration 後預設兩者皆可用。

- **後端授權**：
  - JWT access token payload 新增 `subsystems`（供前端解碼使用）。
  - 新增 `SubsystemGuard`（`common/guards/subsystem/`），以「路由前綴 → 子系統」對照表為單一真實來源，掛在課程／健康共 12 個 controller 的 `JwtAuthGuard` → `RbacGuard` 之後；不符回 403。共用路由（user/pet/api-token/upload 等）不受限。
  - `request.user.subsystems` 由 `JwtStrategy` 自 DB 取得，故權限調整即時生效、不受舊 token 影響。
  - `CreateUserDto` 支援設定 `subsystems`。
  - 縱深防禦：`PATCH /v1/user/:id` 對非 admin（即使編輯自己）剝除 `role`/`subsystems`/`status` 欄位，避免自我提權。

- **前端**：
  - 新增**子系統切換器**（Header），僅授權多個子系統時顯示；切換後導向該子系統預設落地頁。
  - 側邊選單與手機底部導覽依作用中子系統過濾（`RESOURCE_SUBSYSTEM` 對照表為單一真實來源）。
  - `accessControlProvider` 加入子系統把關；`authProvider` 登入導向改依授權子系統決定落地頁；深連到已授權子系統頁面時自動同步切換器。
  - `SubsystemRouteGuard`：直接以網址進入無權子系統頁面時，於 render 階段即重導至有權落地頁，避免無權頁面送出 API 觸發 403。
  - 授權子系統清單於每次導覽重讀 token，使背景刷新後（admin 調整權限）選單與切換器能即時反映。
  - 使用者管理 create/edit 頁新增「可使用子系統」多選欄位，詳情頁顯示子系統標籤。

## 2026-06-06

### 批次匯入上課紀錄：效能優化與逾時體驗

修正「批次匯入上課紀錄」整月跨多門課時，後端耗時約 47 秒、超過前端 30 秒 timeout 而顯示假失敗（實際後端已成功寫入）的問題。

- **後端效能**（`course-session.service.ts` 的 `batchGenerate`）：
  - 課程、既有 session 改為**各一次查詢**預先載入（原本逐課查詢）。
  - 批次產生的 session 學生數皆為 0，薪資**每門課只計算一次**（原本每筆都重算，138 筆 → 31 次）。
  - 改用 `createMany` **單次批次插入**（原本逐筆 `create`），單一語句具原子性。
  - 預估耗時從 ~47s 降至 ~5s。

- **修正 soft-delete 地雷**：`batchGenerate` 判斷「該日是否已存在」時補上 `deleted_at: null` 過濾，避免已軟刪除的紀錄擋住重新匯入。

- **前端體驗**（`pages/course-session/list.tsx`）：
  - 此匯入請求單獨將 timeout 放寬至 120s。
  - 連線逾時（`ECONNABORTED`）時改為提示「可能仍在背景完成、請重新整理確認、可安全重試」，並自動 refetch，不再誤報失敗。

- **可觀測性**（先前提交）：新增全域 `LoggingInterceptor` 記錄每筆 request，`HttpExceptionFilter` 記錄 5xx 含 stack，輸出至 stdout 供 Zeabur runtime log 擷取。

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
