# Telegram & Slack Bot 測試指南

## 目錄

- [Telegram Bot 測試](#telegram-bot-測試)
- [Slack Bot 測試](#slack-bot-測試)
- [指令測試清單](#指令測試清單)
- [指令短別名對照](#指令短別名對照)
- [中英文關鍵字對照](#中英文關鍵字對照)
- [常見問題](#常見問題)

---

## Telegram Bot 測試

### Step 1：建立 Telegram Bot

1. 開啟 Telegram，搜尋 **@BotFather**
2. 發送 `/newbot`
3. 輸入 Bot 名稱（例如 `Astrid Health Bot`）
4. 輸入 Bot username（必須以 `_bot` 結尾，例如 `astrid_health_bot`）
5. BotFather 回覆的訊息中會包含一組 **HTTP API Token**，格式類似：
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
6. （選用）發送 `/setcommands` 給 BotFather，選擇你的 bot，貼上以下指令清單：
   ```
   h - 顯示所有指令
   help - 顯示所有指令
   b - 綁定系統帳號
   bind - 綁定系統帳號
   ub - 解除綁定
   unbind - 解除綁定
   bs - 查看綁定狀態
   bindstatus - 查看綁定狀態
   ps - 列出寵物
   pets - 列出寵物
   p - 寵物管理
   pet - 寵物管理
   w - 記錄體重
   weight - 記錄體重
   d - 記錄飲食
   diet - 記錄飲食
   t - 記錄排泄
   toilet - 記錄排泄
   s - 記錄症狀
   symptom - 記錄症狀
   ```

### Step 2：設定環境變數

在 `apps/api/.env.development.local` 中加入：

```env
TELEGRAM_BOT_TOKEN=你從BotFather取得的token
```

### Step 3：啟動 API

```bash
cd apps/api
npm run start
```

啟動成功後應看到類似以下 log：

```
[Nest] LOG [TelegrafModule] Telegram bot started
```

### Step 4：開始測試

在 Telegram 中搜尋你的 bot username，開啟聊天室，依照 [指令測試清單](#指令測試清單) 逐步測試。

---

## Slack Bot 測試

### Step 1：建立 Slack App

1. 前往 [Slack API Apps](https://api.slack.com/apps)
2. 點擊 **Create New App** → **From scratch**
3. 輸入 App 名稱（例如 `Astrid Health Bot`），選擇你的 Workspace
4. 點擊 **Create App**

### Step 2：啟用 Socket Mode

1. 左側選單點擊 **Socket Mode**
2. 點擊 **Enable Socket Mode**
3. 輸入 App-Level Token 名稱（例如 `socket-token`），Scope 選 `connections:write`
4. 點擊 **Generate**
5. 複製產生的 **App Token**（以 `xapp-` 開頭）

### Step 3：設定 Bot Token Scopes

1. 左側選單 **OAuth & Permissions**
2. 往下找到 **Scopes** → **Bot Token Scopes**，新增以下 scope：
   - `chat:write` — 發送訊息
   - `commands` — 斜線指令
   - `im:history` — 讀取 DM 訊息
   - `im:read` — 存取 DM
   - `im:write` — 發送 DM

### Step 4：註冊 Slash Commands

1. 左側選單 **Slash Commands**
2. 逐一新增以下指令（含完整指令與短指令）：

**完整指令：**

| Command | Short Description | Usage Hint |
|---------|-------------------|------------|
| `/help` | 顯示所有指令 | |
| `/bind` | 綁定系統帳號 | `<帳號> <密碼>` |
| `/unbind` | 解除綁定 | |
| `/bindstatus` | 查看綁定狀態 | |
| `/pets` | 列出寵物 | |
| `/pet` | 寵物管理 | `新增 <名字> <類型>` |
| `/weight` | 記錄體重 | `<數值> [自己\|寵物:<名字>]` |
| `/diet` | 記錄飲食 | `<餐別> <食物> [自己\|寵物:<名字>]` |
| `/toilet` | 記錄排泄 | `<類型> [異常] [自己\|寵物:<名字>]` |
| `/symptom` | 記錄症狀 | `<類型> <嚴重度> [自己\|寵物:<名字>]` |

**短指令（選用，方便快速輸入）：**

| Command | Short Description | Usage Hint |
|---------|-------------------|------------|
| `/h` | 顯示所有指令 | |
| `/b` | 綁定系統帳號 | `<帳號> <密碼>` |
| `/ub` | 解除綁定 | |
| `/bs` | 查看綁定狀態 | |
| `/ps` | 列出寵物 | |
| `/p` | 寵物管理 | `新增 <名字> <類型>` |
| `/w` | 記錄體重 | `<數值> [自己\|寵物:<名字>]` |
| `/d` | 記錄飲食 | `<餐別> <食物> [自己\|寵物:<名字>]` |
| `/t` | 記錄排泄 | `<類型> [異常] [自己\|寵物:<名字>]` |
| `/s` | 記錄症狀 | `<類型> <嚴重度> [自己\|寵物:<名字>]` |

### Step 5：啟用 Event Subscriptions

1. 左側選單 **Event Subscriptions** → 開啟 **Enable Events**
2. 在 **Subscribe to bot events** 中新增：
   - `message.im` — 監聽 DM 訊息
3. 點擊 **Save Changes**

### Step 6：安裝 App 到 Workspace

1. 左側選單 **Install App**
2. 點擊 **Install to Workspace** → **Allow**
3. 複製產生的 **Bot User OAuth Token**（以 `xoxb-` 開頭）

### Step 7：取得 Signing Secret

1. 左側選單 **Basic Information**
2. 找到 **App Credentials** → **Signing Secret**
3. 點擊 **Show** 並複製

### Step 8：設定環境變數

在 `apps/api/.env.development.local` 中加入：

```env
SLACK_BOT_TOKEN=xoxb-你的bot-token
SLACK_SIGNING_SECRET=你的signing-secret
SLACK_APP_TOKEN=xapp-你的app-token
```

### Step 9：啟動 API

```bash
cd apps/api
npm run start
```

啟動成功後應看到：

```
[Nest] LOG [SlackBotService] Slack Bot 已啟動 (Socket Mode)
```

### Step 10：開始測試

在 Slack 中直接對 Bot 發送 DM，或在頻道中使用斜線指令，依照 [指令測試清單](#指令測試清單) 測試。

---

## 指令短別名對照

所有指令都同時支援完整名稱和短別名：

| 完整指令 | 短別名 |
|----------|--------|
| `/help` | `/h` |
| `/bind` | `/b` |
| `/unbind` | `/ub` |
| `/bindstatus` | `/bs` |
| `/pets` | `/ps` |
| `/pet` | `/p` |
| `/weight` | `/w` |
| `/diet` | `/d` |
| `/toilet` | `/t` |
| `/symptom` | `/s` |

Telegram 直接可用。Slack 需要在 Slack API Dashboard 註冊短指令才能使用。

---

## 中英文關鍵字對照

所有關鍵字都同時支援中文和英文：

### 通用關鍵字

| 中文 | 英文 | 說明 |
|------|------|------|
| `自己` | `me` | 記錄自己（不關聯寵物） |
| `寵物:<名字>` | `pet:<名字>` | 指定寵物 |
| `新增` | `add` | 新增寵物 |
| `統計` | `stats` | 查看統計 |
| `今天` | `today` | 今日記錄 |
| `異常` | `abnormal` | 異常排泄 |

### 餐別

| 中文 | 英文 |
|------|------|
| `早餐` | `breakfast` |
| `午餐` | `lunch` |
| `晚餐` | `dinner` |
| `點心` | `snack` |

### 排泄類型

| 中文 | 英文 |
|------|------|
| `尿` | `urination` |
| `便` | `defecation` |

### 寵物類型

| 中文 | 英文 |
|------|------|
| `狗` | `dog` |
| `貓` | `cat` |
| `鳥` | `bird` |
| `魚` | `fish` |
| `倉鼠` | `hamster` |
| `兔` / `兔子` | `rabbit` |
| `其他` | `other` |

### 症狀類型

| 中文 | 英文 |
|------|------|
| `嘔吐` | `vomiting` |
| `咳嗽` | `coughing` |
| `腹瀉` / `拉肚子` | `diarrhea` |
| `皮膚問題` | `skin_issue` |
| `眼睛問題` | `eye_issue` |
| `耳朵問題` | `ear_issue` |
| `食慾不振` | `appetite_loss` |
| `嗜睡` | `lethargy` |
| `呼吸問題` | `breathing_issue` |
| `跛行` | `limping` |
| `搔癢` | `scratching` |
| `打噴嚏` | `sneezing` |
| `發燒` | `fever` |
| `其他` | `other` |

### 嚴重度

| 中文 | 英文 |
|------|------|
| `輕微` | `mild` |
| `中等` | `moderate` |
| `嚴重` | `severe` |

---

## 指令測試清單

按以下順序測試，確保每一步都回傳正確結果：

### 1. 基本功能

| # | 指令 | 預期結果 | 平台注意事項 |
|---|------|----------|-------------|
| 1 | `/start` | 歡迎訊息 | 僅 Telegram |
| 2 | `/help` 或 `/h` | 完整指令說明 | |
| 3 | `/bindstatus` 或 `/bs` | 提示尚未綁定 | |

### 2. 帳號綁定

| # | 指令 | 預期結果 | 安全驗證 |
|---|------|----------|----------|
| 4 | `/b wronguser wrongpass` | 帳號或密碼錯誤 | TG: 訊息被刪除 / Slack: ephemeral |
| 5 | `/b 你的帳號 你的密碼` | 綁定成功 | TG: 訊息被刪除 / Slack: ephemeral |
| 6 | `/bs` | 顯示帳號和使用者名稱 | |

### 3. 寵物管理

| # | 指令 | 預期結果 |
|---|------|----------|
| 7 | `/ps` | 空列表提示 |
| 8 | `/p 新增 Mochi 貓` | 新增成功 |
| 9 | `/p 新增 Lucky 狗` | 新增成功 |
| 10 | `/ps` | 列出 Mochi 和 Lucky |

### 4. 體重記錄（寵物）

| # | 指令 | 預期結果 |
|---|------|----------|
| 11 | `/w 4.5 寵物:Mochi` | 記錄成功 [Mochi] |
| 12 | `/w 12.3 寵物:Lucky` | 記錄成功 [Lucky] |
| 13 | `/w 統計 寵物:Mochi` | 顯示 Mochi 統計 |
| 14 | `/w abc` | 錯誤提示 |

### 5. 體重記錄（自己）

| # | 指令 | 預期結果 |
|---|------|----------|
| 15 | `/w 65.5 自己` | 記錄成功 [自己] |
| 16 | `/w 統計 自己` | 顯示自己的統計 |

### 6. 飲食記錄

| # | 指令 | 預期結果 |
|---|------|----------|
| 17 | `/d 早餐 雞肉 寵物:Mochi` | 記錄成功 [Mochi] |
| 18 | `/d 午餐 白飯 自己` | 記錄成功 [自己] |
| 19 | `/d 今天 寵物:Mochi` | 列出 Mochi 今日飲食 |
| 20 | `/d 今天 自己` | 列出自己今日飲食 |
| 21 | `/d 無效餐別 food` | 餐別錯誤提示 |

### 7. 排泄記錄

| # | 指令 | 預期結果 |
|---|------|----------|
| 22 | `/t 尿 寵物:Mochi` | 正常記錄 [Mochi] |
| 23 | `/t 便 異常 寵物:Mochi` | 異常記錄 [Mochi] |
| 24 | `/t 尿 自己` | 正常記錄 [自己] |
| 25 | `/t 無效類型` | 類型錯誤提示 |

### 8. 症狀記錄

| # | 指令 | 預期結果 |
|---|------|----------|
| 26 | `/s 嘔吐 輕微 寵物:Mochi` | 記錄成功 [Mochi] |
| 27 | `/s 咳嗽 嚴重 寵物:Lucky` | 記錄成功 [Lucky] |
| 28 | `/s 發燒 輕微 自己` | 記錄成功 [自己] |
| 29 | `/s 統計 寵物:Mochi` | 顯示 Mochi 統計 |
| 30 | `/s 統計 自己` | 顯示自己的統計 |
| 31 | `/s 無效類型 輕微` | 類型錯誤提示 |

### 9. 自動帶入測試

測試只有一隻寵物時自動帶入功能：

| # | 步驟 | 預期結果 |
|---|------|----------|
| 32 | 用只有一隻寵物的帳號測試 | — |
| 33 | `/w 3.2`（不指定自己或寵物） | 自動帶入唯一寵物 |
| 34 | `/d 晚餐 鮭魚`（不指定） | 自動帶入唯一寵物 |
| 35 | 有多隻寵物時 `/w 70`（不指定） | 記錄為自己 |

### 10. 解除綁定

| # | 指令 | 預期結果 |
|---|------|----------|
| 36 | `/ub` | 解除成功 |
| 37 | `/ps` | 提示尚未綁定 |

### 11. 速率限制測試

| # | 測試 | 預期結果 |
|---|------|----------|
| 38 | 快速連續發送 `/b` 超過 5 次 | 第 6 次被攔截 |
| 39 | 快速連續發送任意指令超過 30 次 | 第 31 次被攔截 |

---

## 目標選擇說明

所有健康記錄指令（weight / diet / toilet / symptom）都支援以下目標選擇：

| 關鍵字 | 說明 | 範例 |
|--------|------|------|
| `自己` 或 `me` | 記錄自己（不關聯寵物） | `/w 65 自己` |
| `寵物:<名字>` 或 `pet:<名字>` | 指定寵物 | `/w 4.5 寵物:Mochi` |
| （不指定） | 只有 1 隻寵物時自動帶入該寵物，否則記錄自己 | `/w 65` |

---

## 常見問題

### Telegram

**Q: Bot 沒有回應？**
- 確認 `TELEGRAM_BOT_TOKEN` 是否正確
- 確認 API 有正常啟動且無錯誤
- 確認有跟 bot 發送 `/start`

**Q: `/bind` 後訊息沒有被刪除？**
- Bot 需要在群組中有 **Delete messages** 權限
- 在私聊中，bot 可能沒有刪除訊息的權限（這是 Telegram 的限制）
- 不影響功能，只是密碼會留在聊天記錄中

**Q: 出現 409 Conflict 錯誤？**
- 確認沒有其他程式同時使用同一個 bot token（例如另一個開發環境）

### Slack

**Q: Slash command 回傳 `dispatch_failed`？**
- 確認 Socket Mode 已啟用
- 確認 `SLACK_APP_TOKEN` 正確（`xapp-` 開頭）
- 確認 API 有正常啟動

**Q: Bot 無法發送訊息？**
- 確認有加入 `chat:write` scope
- 確認 Bot 已被邀請到該頻道（`/invite @你的bot名稱`）

**Q: Slash command 沒有出現在輸入框？**
- 確認在 Slack API Dashboard 中已註冊所有 slash commands（含短指令）
- 重新安裝 App 到 Workspace（Scope 或 Command 變更後需要重裝）

**Q: 安裝時出現 `invalid_scope`？**
- 移除 `chat:write.public` scope（部分 Slack plan 不支援）
- 只保留 `chat:write`、`commands`、`im:history`、`im:read`、`im:write`
- 重新安裝

### 通用

**Q: 綁定時顯示「此聊天帳號已被綁定」？**
- 同一個 Telegram/Slack 帳號只能綁定一個系統帳號
- 先 `/unbind` 再重新 `/bind`

**Q: 顯示「此帳號已停用」？**
- 確認系統帳號的 status 為 `active`
