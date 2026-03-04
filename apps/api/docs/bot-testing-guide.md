# Telegram & Slack Bot 測試指南

## 目錄

- [Telegram Bot 測試](#telegram-bot-測試)
- [Slack Bot 測試](#slack-bot-測試)
- [指令測試清單](#指令測試清單)
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
   help - 顯示所有指令
   bind - 綁定系統帳號
   unbind - 解除綁定
   bindstatus - 查看綁定狀態
   pets - 列出寵物
   pet - 寵物管理
   weight - 記錄體重
   diet - 記錄飲食
   toilet - 記錄排泄
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
2. 逐一新增以下指令：

| Command | Short Description | Usage Hint |
|---------|-------------------|------------|
| `/help` | 顯示所有指令 | |
| `/bind` | 綁定系統帳號 | `<帳號> <密碼>` |
| `/unbind` | 解除綁定 | |
| `/bindstatus` | 查看綁定狀態 | |
| `/pets` | 列出寵物 | |
| `/pet` | 寵物管理 | `add <名字> <類型>` |
| `/weight` | 記錄體重 | `<數值> [me\|pet:<名字>]` |
| `/diet` | 記錄飲食 | `<餐別> <食物> [me\|pet:<名字>]` |
| `/toilet` | 記錄排泄 | `<類型> [abnormal] [me\|pet:<名字>]` |
| `/symptom` | 記錄症狀 | `<類型> <嚴重度> [me\|pet:<名字>]` |

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

## 指令測試清單

按以下順序測試，確保每一步都回傳正確結果：

### 1. 基本功能

| # | 指令 | 預期結果 | 平台注意事項 |
|---|------|----------|-------------|
| 1 | `/start` | 歡迎訊息 | 僅 Telegram |
| 2 | `/help` | 完整指令說明 | |
| 3 | `/bindstatus` | 提示尚未綁定 | |

### 2. 帳號綁定

| # | 指令 | 預期結果 | 安全驗證 |
|---|------|----------|----------|
| 4 | `/bind wronguser wrongpass` | 帳號或密碼錯誤 | TG: 訊息被刪除 / Slack: ephemeral |
| 5 | `/bind 你的帳號 你的密碼` | 綁定成功 | TG: 訊息被刪除 / Slack: ephemeral |
| 6 | `/bindstatus` | 顯示帳號和使用者名稱 | |

### 3. 寵物管理

| # | 指令 | 預期結果 |
|---|------|----------|
| 7 | `/pets` | 空列表提示 |
| 8 | `/pet add Mochi cat` | 新增成功 |
| 9 | `/pet add Lucky dog` | 新增成功 |
| 10 | `/pets` | 列出 Mochi 和 Lucky |

### 4. 體重記錄（寵物）

| # | 指令 | 預期結果 |
|---|------|----------|
| 11 | `/weight 4.5 pet:Mochi` | 記錄成功 [Mochi] |
| 12 | `/weight 12.3 pet:Lucky` | 記錄成功 [Lucky] |
| 13 | `/weight stats pet:Mochi` | 顯示 Mochi 統計 |
| 14 | `/weight abc` | 錯誤提示 |

### 5. 體重記錄（自己）

| # | 指令 | 預期結果 |
|---|------|----------|
| 15 | `/weight 65.5 me` | 記錄成功 [自己] |
| 16 | `/weight stats me` | 顯示自己的統計 |

### 6. 飲食記錄

| # | 指令 | 預期結果 |
|---|------|----------|
| 17 | `/diet breakfast chicken pet:Mochi` | 記錄成功 [Mochi] |
| 18 | `/diet lunch rice me` | 記錄成功 [自己] |
| 19 | `/diet today pet:Mochi` | 列出 Mochi 今日飲食 |
| 20 | `/diet today me` | 列出自己今日飲食 |
| 21 | `/diet invalidmeal food` | 餐別錯誤提示 |

### 7. 排泄記錄

| # | 指令 | 預期結果 |
|---|------|----------|
| 22 | `/toilet urination pet:Mochi` | 正常記錄 [Mochi] |
| 23 | `/toilet defecation abnormal pet:Mochi` | 異常記錄 [Mochi] |
| 24 | `/toilet urination me` | 正常記錄 [自己] |
| 25 | `/toilet invalidtype` | 類型錯誤提示 |

### 8. 症狀記錄

| # | 指令 | 預期結果 |
|---|------|----------|
| 26 | `/symptom vomiting mild pet:Mochi` | 記錄成功 [Mochi] |
| 27 | `/symptom coughing severe pet:Lucky` | 記錄成功 [Lucky] |
| 28 | `/symptom fever mild me` | 記錄成功 [自己] |
| 29 | `/symptom stats pet:Mochi` | 顯示 Mochi 統計 |
| 30 | `/symptom stats me` | 顯示自己的統計 |
| 31 | `/symptom invalidtype mild` | 類型錯誤提示 |

### 9. 自動帶入測試

測試只有一隻寵物時自動帶入功能：

| # | 步驟 | 預期結果 |
|---|------|----------|
| 32 | 用只有一隻寵物的帳號測試 | — |
| 33 | `/weight 3.2`（不指定 me 或 pet） | 自動帶入唯一寵物 |
| 34 | `/diet dinner salmon`（不指定） | 自動帶入唯一寵物 |
| 35 | 有多隻寵物時 `/weight 70`（不指定） | 記錄為自己 |

### 10. 解除綁定

| # | 指令 | 預期結果 |
|---|------|----------|
| 36 | `/unbind` | 解除成功 |
| 37 | `/pets` | 提示尚未綁定 |

### 11. 速率限制測試

| # | 測試 | 預期結果 |
|---|------|----------|
| 38 | 快速連續發送 `/bind` 超過 5 次 | 第 6 次被攔截 |
| 39 | 快速連續發送任意指令超過 30 次 | 第 31 次被攔截 |

---

## 目標選擇說明

所有健康記錄指令（weight / diet / toilet / symptom）都支援以下目標選擇：

| 關鍵字 | 說明 | 範例 |
|--------|------|------|
| `me` | 記錄自己（不關聯寵物） | `/weight 65 me` |
| `pet:<名字>` | 指定寵物 | `/weight 4.5 pet:Mochi` |
| （不指定） | 只有 1 隻寵物時自動帶入該寵物，否則記錄自己 | `/weight 65` |

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
- 確認在 Slack API Dashboard 中已註冊所有 slash commands
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
