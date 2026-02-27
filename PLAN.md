# 健康管理功能規劃 (Health Management)

## 概覽

在現有「學校課程管理系統」中新增「健康管理」模組，包含三個子功能：
- **體重管理** (Health Weight)
- **飲食紀錄** (Health Diet)
- **如廁紀錄** (Health Toilet)

所有健康紀錄皆與 **User（使用者帳號）** 關聯，屬於個人資料，遵循現有架構模式（NestJS module + Refine CRUD pages）。

### 關鍵設計原則
- 每筆紀錄透過 `user_id` 關聯到登入使用者本人
- **一般使用者**：只能查看/管理自己的紀錄（後端以 JWT user_id 自動篩選）
- **admin**：可查看所有使用者的紀錄（管理用途）
- 前端表單不需選擇使用者，`user_id` 由後端從 JWT token 自動帶入

---

## 一、資料庫設計 (Prisma Schema)

### 新增 Enums

```prisma
enum MealType {
  breakfast    // 早餐
  lunch        // 午餐
  dinner       // 晚餐
  snack        // 點心
}

enum ToiletType {
  urination    // 小便
  defecation   // 大便
}
```

### 新增 Models

#### 1. HealthWeight（體重紀錄）

| 欄位 | 型態 | 說明 |
|------|------|------|
| id | Int @id @default(autoincrement()) | 主鍵 |
| user_id | Int | 關聯使用者（紀錄擁有者，從 JWT 帶入） |
| date | DateTime | 量測日期 |
| weight | Float | 體重（公斤） |
| height | Float? | 身高（公分），選填 |
| bmi | Float? | BMI 值，選填（可由前端計算帶入） |
| note | String? | 備註 |
| created_at | DateTime @default(now()) | 建立時間 |
| updated_at | DateTime @updatedAt | 更新時間 |

關聯：`user -> User`

#### 2. HealthDiet（飲食紀錄）

| 欄位 | 型態 | 說明 |
|------|------|------|
| id | Int @id @default(autoincrement()) | 主鍵 |
| user_id | Int | 關聯使用者（紀錄擁有者，從 JWT 帶入） |
| date | DateTime | 日期 |
| meal_type | MealType | 餐別（早餐/午餐/晚餐/點心） |
| food_name | String | 食物名稱 |
| amount | String? | 份量描述 |
| calories | Float? | 卡路里（選填） |
| note | String? | 備註 |
| created_at | DateTime @default(now()) | 建立時間 |
| updated_at | DateTime @updatedAt | 更新時間 |

關聯：`user -> User`

#### 3. HealthToilet（如廁紀錄）

| 欄位 | 型態 | 說明 |
|------|------|------|
| id | Int @id @default(autoincrement()) | 主鍵 |
| user_id | Int | 關聯使用者（紀錄擁有者，從 JWT 帶入） |
| date | DateTime | 日期 |
| time | String | 時間（如 "10:30"） |
| type | ToiletType | 類型（小便/大便） |
| is_normal | Boolean @default(true) | 是否正常 |
| note | String? | 備註（異常狀況描述） |
| created_at | DateTime @default(now()) | 建立時間 |
| updated_at | DateTime @updatedAt | 更新時間 |

關聯：`user -> User`

> **注意**：不再需要 `modifier_id`，因為 `user_id` 即為紀錄擁有者。使用者只能操作自己的資料，admin 可管理全部。

### User Model 更新

在 User 模型中新增反向關聯：
```prisma
healthWeights   HealthWeight[]
healthDiets     HealthDiet[]
healthToilets   HealthToilet[]
```

---

## 二、後端 API 設計 (NestJS)

### 模組結構

```
apps/api/src/core/
├── health-weight/
│   ├── health-weight.module.ts
│   ├── health-weight.controller.ts
│   ├── health-weight.service.ts
│   └── dto/
│       ├── create-health-weight.dto.ts
│       └── update-health-weight.dto.ts
├── health-diet/
│   ├── health-diet.module.ts
│   ├── health-diet.controller.ts
│   ├── health-diet.service.ts
│   └── dto/
│       ├── create-health-diet.dto.ts
│       └── update-health-diet.dto.ts
├── health-toilet/
│   ├── health-toilet.module.ts
│   ├── health-toilet.controller.ts
│   ├── health-toilet.service.ts
│   └── dto/
│       ├── create-health-toilet.dto.ts
│       └── update-health-toilet.dto.ts
```

### API 路由設計

#### Health Weight (`/v1/health-weight`)

| Method | Route | 說明 |
|--------|-------|------|
| POST | `/v1/health-weight` | 新增體重紀錄 |
| GET | `/v1/health-weight` | 列表查詢（支援搜尋/篩選/分頁） |
| GET | `/v1/health-weight/export` | 匯出 Excel |
| GET | `/v1/health-weight/statistics` | 統計（平均體重、BMI 趨勢等） |
| GET | `/v1/health-weight/:id` | 查詢單筆 |
| PUT | `/v1/health-weight/:id` | 更新 |
| DELETE | `/v1/health-weight/:id` | 刪除 |

- **搜尋欄位**: 無（主要靠篩選）
- **篩選欄位**: `date`（範圍篩選）；admin 額外支援 `user_id` 篩選
- **排序**: 預設 `date` 降序
- **資料範圍**: 一般使用者自動以 JWT `user_id` 篩選僅回傳自己的資料；admin 可查看所有

#### Health Diet (`/v1/health-diet`)

| Method | Route | 說明 |
|--------|-------|------|
| POST | `/v1/health-diet` | 新增飲食紀錄 |
| GET | `/v1/health-diet` | 列表查詢 |
| GET | `/v1/health-diet/export` | 匯出 Excel |
| GET | `/v1/health-diet/statistics` | 統計（每日卡路里、餐別分布等） |
| GET | `/v1/health-diet/:id` | 查詢單筆 |
| PUT | `/v1/health-diet/:id` | 更新 |
| DELETE | `/v1/health-diet/:id` | 刪除 |

- **搜尋欄位**: `food_name`
- **篩選欄位**: `meal_type`, `date`（範圍篩選）；admin 額外支援 `user_id` 篩選
- **排序**: 預設 `date` 降序
- **資料範圍**: 同上（個人資料隔離）

#### Health Toilet (`/v1/health-toilet`)

| Method | Route | 說明 |
|--------|-------|------|
| POST | `/v1/health-toilet` | 新增如廁紀錄 |
| GET | `/v1/health-toilet` | 列表查詢 |
| GET | `/v1/health-toilet/export` | 匯出 Excel |
| GET | `/v1/health-toilet/statistics` | 統計（每日次數、正常/異常比例等） |
| GET | `/v1/health-toilet/:id` | 查詢單筆 |
| PUT | `/v1/health-toilet/:id` | 更新 |
| DELETE | `/v1/health-toilet/:id` | 刪除 |

- **搜尋欄位**: 無
- **篩選欄位**: `type`, `is_normal`, `date`（範圍篩選）；admin 額外支援 `user_id` 篩選
- **排序**: 預設 `date` 降序
- **資料範圍**: 同上（個人資料隔離）

### RBAC 權限設計 (Casbin Policy)

因為是**個人資料**，權限模式與現有模組不同：
- **所有角色（staff / manager / admin）**: 都可以對自己的健康紀錄進行完整 CRUD
- **admin**: 額外可查看/管理所有使用者的健康紀錄
- **資料隔離**: 由後端 Service 層實作（非 Casbin），根據 JWT user_id 過濾

新增 policy 規則：
```
// 所有角色都可以操作健康管理（資料層級由 Service 控制）
p, role:staff, /v1/health-weight, read
p, role:staff, /v1/health-weight, create
p, role:staff, /v1/health-weight, update
p, role:staff, /v1/health-weight, delete
p, role:staff, /v1/health-weight/export, read
p, role:staff, /v1/health-weight/statistics, read
p, role:staff, /v1/health-diet, read
p, role:staff, /v1/health-diet, create
p, role:staff, /v1/health-diet, update
p, role:staff, /v1/health-diet, delete
p, role:staff, /v1/health-diet/export, read
p, role:staff, /v1/health-diet/statistics, read
p, role:staff, /v1/health-toilet, read
p, role:staff, /v1/health-toilet, create
p, role:staff, /v1/health-toilet, update
p, role:staff, /v1/health-toilet, delete
p, role:staff, /v1/health-toilet/export, read
p, role:staff, /v1/health-toilet/statistics, read
```

> **注意**：由於角色繼承 (`admin > manager > staff`)，只需在 staff 層級定義即可，其他角色自動繼承。資料擁有權檢查在 Service 層實作：非 admin 角色只能操作 `user_id === request.user.id` 的紀錄。

---

## 三、前端 Dashboard 設計 (React + Refine)

### 頁面結構

```
apps/dashboard/src/pages/
├── health-weight/
│   ├── index.ts
│   ├── list.tsx          # 體重紀錄列表（含篩選學生、日期範圍）
│   ├── create.tsx        # 新增體重紀錄
│   ├── edit.tsx          # 編輯體重紀錄
│   ├── show.tsx          # 檢視單筆紀錄
│   └── form/
│       └── form.tsx      # 共用表單（Create/Edit 共用）
├── health-diet/
│   ├── index.ts
│   ├── list.tsx          # 飲食紀錄列表
│   ├── create.tsx
│   ├── edit.tsx
│   ├── show.tsx
│   └── form/
│       └── form.tsx
├── health-toilet/
│   ├── index.ts
│   ├── list.tsx          # 如廁紀錄列表
│   ├── create.tsx
│   ├── edit.tsx
│   ├── show.tsx
│   └── form/
│       └── form.tsx
```

### 路由與選單配置 (App.tsx)

新增「健康管理」父選單群組：

```typescript
// Resources
{ name: "health", meta: { label: "健康管理", icon: <HeartOutlined /> } },
{ name: "health-weight", list: "/health-weight", create: "/health-weight/create", edit: "/health-weight/edit/:id", show: "/health-weight/:id", meta: { label: "體重管理", parent: "health" } },
{ name: "health-diet", list: "/health-diet", create: "/health-diet/create", edit: "/health-diet/edit/:id", show: "/health-diet/:id", meta: { label: "飲食紀錄", parent: "health" } },
{ name: "health-toilet", list: "/health-toilet", create: "/health-toilet/create", edit: "/health-toilet/edit/:id", show: "/health-toilet/:id", meta: { label: "如廁紀錄", parent: "health" } },

// Routes
<Route path="/health-weight">
  <Route index element={<HealthWeightList />} />
  <Route path="create" element={<HealthWeightCreate />} />
  <Route path="edit/:id" element={<HealthWeightEdit />} />
  <Route path=":id" element={<HealthWeightShow />} />
</Route>
// ... 同理 health-diet, health-toilet
```

### 常數配置 (constants.ts)

```typescript
ROUTE_RESOURCE = {
  // ...existing
  healthWeight: "v1/health-weight",
  healthDiet: "v1/health-diet",
  healthToilet: "v1/health-toilet",
}
```

### 類型定義 (types)

新增對應的 TypeScript 介面：
- `IHealthWeight`, `ICreateHealthWeight`, `IUpdateHealthWeight`
- `IHealthDiet`, `ICreateHealthDiet`, `IUpdateHealthDiet`
- `IHealthToilet`, `ICreateHealthToilet`, `IUpdateHealthToilet`

### 頁面功能細節

#### 體重管理 List 頁
- 表格欄位: 日期、體重(kg)、身高(cm)、BMI、備註、紀錄時間
- 篩選: 日期範圍
- 操作: 查看 / 編輯 / 刪除
- 資料: 自動顯示當前使用者的紀錄

#### 體重管理 Form
- 欄位: 日期（DatePicker）、體重（InputNumber, kg）、身高（InputNumber, cm）、備註（TextArea）
- BMI 自動計算: `weight / (height/100)²`
- `user_id` 由後端從 JWT 自動帶入，前端不需顯示

#### 飲食紀錄 List 頁
- 表格欄位: 日期、餐別、食物名稱、份量、卡路里、備註
- 篩選: 餐別、日期範圍

#### 飲食紀錄 Form
- 欄位: 日期（DatePicker）、餐別（Select: 早餐/午餐/晚餐/點心）、食物名稱（Input）、份量（Input）、卡路里（InputNumber, 選填）、備註（TextArea）

#### 如廁紀錄 List 頁
- 表格欄位: 日期、時間、類型、是否正常、備註
- 篩選: 類型、是否正常、日期範圍

#### 如廁紀錄 Form
- 欄位: 日期（DatePicker）、時間（TimePicker）、類型（Select: 小便/大便）、是否正常（Switch）、備註（TextArea）

---

## 四、實作步驟（建議順序）

### Phase 1: 資料庫 & 後端基礎
1. 更新 Prisma Schema（新增 enums + 3 個 models + 關聯）
2. 執行 `prisma migrate` 產生遷移檔
3. 建立 3 個 NestJS 模組（module / controller / service / dto）
4. 註冊模組到 AppModule
5. 更新 Casbin policy 加入新資源的權限規則

### Phase 2: 後端進階功能
6. 實作 Excel 匯出功能（3 個模組各一）
7. 實作統計 API（體重趨勢 / 飲食分布 / 如廁統計）

### Phase 3: 前端頁面
8. 新增 TypeScript 類型定義
9. 更新 constants.ts 路由資源
10. 建立 3 組 CRUD 頁面（list / create / edit / show / form）
11. 更新 App.tsx 路由與選單配置

### Phase 4: 整合測試
12. API 端點測試
13. 前後端整合驗證
14. 權限驗證（三種角色）

---

## 五、預估檔案異動

### 修改既有檔案（~5 個）
| 檔案 | 異動內容 |
|------|---------|
| `apps/api/prisma/schema.prisma` | 新增 enums + 3 models + 關聯 |
| `apps/api/src/app.module.ts` | 註冊 3 個新模組 |
| `apps/api/casbin/policy.csv.ts` | 新增健康管理的 RBAC 規則 |
| `apps/dashboard/src/App.tsx` | 新增路由 + 選單資源 |
| `apps/dashboard/src/common/constants.ts` | 新增 ROUTE_RESOURCE |

### 新增檔案（~30+ 個）

**API 端（~18 個）**
- 3 模組 × (module + controller + service + 2 dto) = 15 個
- 3 個 index.ts (dto 目錄)

**Dashboard 端（~18 個）**
- 3 模組 × (index + list + create + edit + show + form) = 18 個
- types 定義檔 ~3 個
