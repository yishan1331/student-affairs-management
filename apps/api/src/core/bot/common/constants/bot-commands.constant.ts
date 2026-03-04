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

export const BOT_HELP_TEXT = `🐾 Astrid 健康管理 Bot 指令

📋 帳號管理
/bind <帳號> <密碼> — 綁定系統帳號
/unbind — 解除綁定
/bindstatus — 查看綁定狀態

🐶 寵物管理
/pets — 列出寵物
/pet add <名字> <類型> — 新增寵物
  類型: dog, cat, bird, fish, hamster, rabbit, other

⚖️ 體重記錄
/weight <數值> — 記錄體重 (kg)
/weight <數值> me — 記錄自己的體重
/weight <數值> pet:<名字> — 指定寵物記錄
/weight stats — 體重統計

🍽️ 飲食記錄
/diet <餐別> <食物> — 記錄飲食
/diet <餐別> <食物> me — 記錄自己的飲食
  餐別: breakfast, lunch, dinner, snack
/diet today — 今日飲食

🚽 排泄記錄
/toilet <類型> — 記錄排泄
/toilet <類型> abnormal — 異常排泄
/toilet <類型> me — 記錄自己的排泄
  類型: urination, defecation

🩺 症狀記錄
/symptom <類型> <嚴重度> — 記錄症狀
/symptom <類型> <嚴重度> me — 記錄自己的症狀
/symptom stats — 症狀統計
  嚴重度: mild, moderate, severe

💡 目標選擇：
  me — 記錄自己（不關聯寵物）
  pet:<名字> — 指定寵物
  不指定 — 只有1隻寵物時自動帶入，否則記錄自己`;

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
