export const BOT_COMMANDS = {
	HELP: 'help',
	BIND: 'bind',
	UNBIND: 'unbind',
	STATUS: 'bindstatus',
	PETS: 'pets',
	PET: 'pet',
	WEIGHT: 'weight',
	DIET: 'diet',
	TOILET: 'toilet',
	SYMPTOM: 'symptom',
} as const;

/** 指令短別名 → 完整指令 */
export const COMMAND_ALIASES: Record<string, string> = {
	h: BOT_COMMANDS.HELP,
	b: BOT_COMMANDS.BIND,
	ub: BOT_COMMANDS.UNBIND,
	bs: BOT_COMMANDS.STATUS,
	ps: BOT_COMMANDS.PETS,
	p: BOT_COMMANDS.PET,
	w: BOT_COMMANDS.WEIGHT,
	d: BOT_COMMANDS.DIET,
	t: BOT_COMMANDS.TOILET,
	s: BOT_COMMANDS.SYMPTOM,
};

// ===== 中英文關鍵字對照 =====

/** 「自己」關鍵字 */
export const SELF_KEYWORDS = ['me', '自己'];

/** 寵物前綴 */
export const PET_PREFIXES = ['pet:', '寵物:'];

/** add 子指令 */
export const ADD_KEYWORDS = ['add', '新增'];

/** stats 子指令 */
export const STATS_KEYWORDS = ['stats', '統計'];

/** today 子指令 */
export const TODAY_KEYWORDS = ['today', '今天'];

/** abnormal 關鍵字 */
export const ABNORMAL_KEYWORDS = ['abnormal', '異常'];

/** 餐別：中文 → enum */
export const MEAL_TYPE_MAP: Record<string, string> = {
	breakfast: 'breakfast',
	lunch: 'lunch',
	dinner: 'dinner',
	snack: 'snack',
	早餐: 'breakfast',
	午餐: 'lunch',
	晚餐: 'dinner',
	點心: 'snack',
};

/** 排泄類型：中文 → enum */
export const TOILET_TYPE_MAP: Record<string, string> = {
	urination: 'urination',
	defecation: 'defecation',
	尿: 'urination',
	便: 'defecation',
};

/** 寵物類型：中文 → enum */
export const PET_TYPE_MAP: Record<string, string> = {
	dog: 'dog',
	cat: 'cat',
	bird: 'bird',
	fish: 'fish',
	hamster: 'hamster',
	rabbit: 'rabbit',
	other: 'other',
	狗: 'dog',
	貓: 'cat',
	鳥: 'bird',
	魚: 'fish',
	倉鼠: 'hamster',
	兔: 'rabbit',
	兔子: 'rabbit',
	其他: 'other',
};

/** 症狀類型：中文 → enum */
export const SYMPTOM_TYPE_MAP: Record<string, string> = {
	vomiting: 'vomiting',
	coughing: 'coughing',
	diarrhea: 'diarrhea',
	skin_issue: 'skin_issue',
	eye_issue: 'eye_issue',
	ear_issue: 'ear_issue',
	appetite_loss: 'appetite_loss',
	lethargy: 'lethargy',
	breathing_issue: 'breathing_issue',
	limping: 'limping',
	scratching: 'scratching',
	sneezing: 'sneezing',
	fever: 'fever',
	other: 'other',
	嘔吐: 'vomiting',
	咳嗽: 'coughing',
	腹瀉: 'diarrhea',
	拉肚子: 'diarrhea',
	皮膚問題: 'skin_issue',
	眼睛問題: 'eye_issue',
	耳朵問題: 'ear_issue',
	食慾不振: 'appetite_loss',
	嗜睡: 'lethargy',
	呼吸問題: 'breathing_issue',
	跛行: 'limping',
	搔癢: 'scratching',
	打噴嚏: 'sneezing',
	發燒: 'fever',
	其他: 'other',
};

/** 嚴重度：中文 → enum */
export const SEVERITY_MAP: Record<string, string> = {
	mild: 'mild',
	moderate: 'moderate',
	severe: 'severe',
	輕微: 'mild',
	中等: 'moderate',
	嚴重: 'severe',
};

export const BOT_HELP_TEXT = `🐾 Astrid 健康管理 Bot 指令
（括號內為短指令）

📋 帳號管理
/bind (/b) <帳號> <密碼> — 綁定系統帳號
/unbind (/ub) — 解除綁定
/bindstatus (/bs) — 查看綁定狀態

🐶 寵物管理
/pets (/ps) — 列出寵物
/pet (/p) 新增 <名字> <類型> — 新增寵物
  類型: 狗/貓/鳥/魚/倉鼠/兔/其他

⚖️ 體重記錄
/weight (/w) <數值> — 記錄體重 (kg)
/w <數值> 自己 — 記錄自己的體重
/w <數值> 寵物:<名字> — 指定寵物記錄
/w 統計 — 體重統計

🍽️ 飲食記錄
/diet (/d) <餐別> <食物> — 記錄飲食
/d <餐別> <食物> 自己 — 記錄自己的飲食
  餐別: 早餐/午餐/晚餐/點心
/d 今天 — 今日飲食

🚽 排泄記錄
/toilet (/t) <類型> — 記錄排泄
/t <類型> 異常 — 異常排泄
/t <類型> 自己 — 記錄自己的排泄
  類型: 尿/便

🩺 症狀記錄
/symptom (/s) <類型> <嚴重度> — 記錄症狀
/s <類型> <嚴重度> 自己 — 記錄自己的症狀
/s 統計 — 症狀統計
  類型: 嘔吐/咳嗽/腹瀉/皮膚問題/眼睛問題/耳朵問題/食慾不振/嗜睡/呼吸問題/跛行/搔癢/打噴嚏/發燒/其他
  嚴重度: 輕微/中等/嚴重

💡 目標選擇：
  自己 — 記錄自己（不關聯寵物）
  寵物:<名字> — 指定寵物
  不指定 — 只有1隻寵物時自動帶入，否則記錄自己

ℹ️ 所有關鍵字同時支援英文（me, pet:, stats, today, abnormal 等）`;

// 需要綁定才能使用的指令
export const AUTH_REQUIRED_COMMANDS = [
	BOT_COMMANDS.UNBIND,
	BOT_COMMANDS.STATUS,
	BOT_COMMANDS.PETS,
	BOT_COMMANDS.PET,
	BOT_COMMANDS.WEIGHT,
	BOT_COMMANDS.DIET,
	BOT_COMMANDS.TOILET,
	BOT_COMMANDS.SYMPTOM,
];
