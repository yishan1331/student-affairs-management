import { Injectable } from '@nestjs/common';

@Injectable()
export class BotMessageFormatterService {
	formatPetList(pets: { id: number; name: string; type: string }[]): string {
		if (pets.length === 0) {
			return '📭 您還沒有寵物，使用 /pet add <名字> <類型> 新增';
		}
		const lines = pets.map((p, i) => `${i + 1}. ${p.name} (${p.type})`);
		return `🐾 您的寵物：\n${lines.join('\n')}`;
	}

	formatPetCreated(name: string, type: string): string {
		return `✅ 寵物「${name}」(${type}) 新增成功！`;
	}

	formatWeightRecorded(weight: number, petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		return `✅ 體重${target} ${weight} kg 已記錄`;
	}

	formatWeightStats(stats: any, petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		if (stats.totalRecords === 0) {
			return `📊 體重統計${target}：尚無記錄`;
		}
		return [
			`📊 體重統計${target}`,
			`📝 總記錄數：${stats.totalRecords}`,
			`⚖️ 最新體重：${stats.latestWeight} kg`,
			`📈 平均：${stats.averageWeight} kg`,
			`⬇️ 最低：${stats.minWeight} kg`,
			`⬆️ 最高：${stats.maxWeight} kg`,
		].join('\n');
	}

	formatDietRecorded(mealType: string, foodName: string, petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		return `✅ 飲食${target} ${mealType}: ${foodName} 已記錄`;
	}

	formatDietToday(records: any[], petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		if (records.length === 0) {
			return `🍽️ 今日飲食${target}：尚無記錄`;
		}
		const lines = records.map((r) => `• ${r.meal_type}: ${r.food_name}${r.amount ? ` (${r.amount})` : ''}`);
		return `🍽️ 今日飲食${target}：\n${lines.join('\n')}`;
	}

	formatToiletRecorded(type: string, isNormal: boolean, petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		const status = isNormal ? '正常' : '⚠️ 異常';
		return `✅ 排泄${target} ${type} (${status}) 已記錄`;
	}

	formatSymptomRecorded(symptomType: string, severity: string, petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		return `✅ 症狀${target} ${symptomType} (${severity}) 已記錄`;
	}

	formatSymptomStats(stats: any, petName?: string): string {
		const target = petName ? ` [${petName}]` : '';
		if (stats.totalRecords === 0) {
			return `🩺 症狀統計${target}：尚無記錄`;
		}
		const topStr = stats.topSymptoms?.length > 0
			? stats.topSymptoms.map((s: any) => `  ${s.type}: ${s.count}次`).join('\n')
			: '  無';
		return [
			`🩺 症狀統計${target}`,
			`📝 總記錄數：${stats.totalRecords}`,
			`🔴 嚴重比例：${stats.severityDistribution?.severe || 0}`,
			`🟡 中等：${stats.severityDistribution?.moderate || 0}`,
			`🟢 輕微：${stats.severityDistribution?.mild || 0}`,
			`🔁 復發率：${stats.recurringRate}%`,
			`📊 常見症狀：\n${topStr}`,
		].join('\n');
	}

	formatBindSuccess(username: string): string {
		return `✅ 帳號綁定成功！歡迎，${username}`;
	}

	formatUnbindSuccess(): string {
		return '✅ 已解除帳號綁定';
	}

	formatStatus(username: string, account: string): string {
		return `👤 綁定狀態\n帳號：${account}\n使用者：${username}`;
	}

	formatError(message: string): string {
		return `❌ ${message}`;
	}

	formatNotBound(): string {
		return '⚠️ 您尚未綁定帳號，請使用 /bind <帳號> <密碼> 綁定';
	}
}
