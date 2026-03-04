import { Injectable, Logger } from '@nestjs/common';
import { PetService } from '../../pet/pet.service';
import { HealthWeightService } from '../../health-weight/health-weight.service';
import { HealthDietService } from '../../health-diet/health-diet.service';
import { HealthToiletService } from '../../health-toilet/health-toilet.service';
import { HealthSymptomService } from '../../health-symptom/health-symptom.service';
import { BotUserService } from './bot-user.service';
import { BotMessageFormatterService } from './bot-message-formatter.service';
import { BotErrorHandlerService } from './bot-error-handler.service';
import { BotCommandResult, ParsedCommand, PetReference } from './interfaces/bot-command.interface';
import { BotUserContext } from './interfaces/bot-context.interface';
import {
	BOT_COMMANDS, BOT_HELP_TEXT, AUTH_REQUIRED_COMMANDS, COMMAND_ALIASES,
	SELF_KEYWORDS, PET_PREFIXES, ADD_KEYWORDS, STATS_KEYWORDS, TODAY_KEYWORDS, ABNORMAL_KEYWORDS,
	MEAL_TYPE_MAP, TOILET_TYPE_MAP, PET_TYPE_MAP, SYMPTOM_TYPE_MAP, SEVERITY_MAP,
} from './constants/bot-commands.constant';
import { MealType, ToiletType, SymptomType, Severity } from '@prisma/client';

@Injectable()
export class BotCommandRouterService {
	private readonly logger = new Logger(BotCommandRouterService.name);

	// 內建速率限制
	private readonly rateLimits = new Map<string, { count: number; resetAt: number }>();
	private readonly GENERAL_LIMIT = 30; // 30/min
	private readonly BIND_LIMIT = 5; // 5/min

	constructor(
		private readonly petService: PetService,
		private readonly healthWeightService: HealthWeightService,
		private readonly healthDietService: HealthDietService,
		private readonly healthToiletService: HealthToiletService,
		private readonly healthSymptomService: HealthSymptomService,
		private readonly botUserService: BotUserService,
		private readonly formatter: BotMessageFormatterService,
		private readonly errorHandler: BotErrorHandlerService,
	) {}

	async route(ctx: BotUserContext, raw: string): Promise<BotCommandResult> {
		const parsed = this.parseCommand(raw);
		if (!parsed) {
			return { text: '❓ 無法識別的指令，請輸入 /help 查看說明' };
		}

		// 速率限制
		const rateKey = `${ctx.platform}:${ctx.platformId}`;
		const isBindCmd = parsed.command === BOT_COMMANDS.BIND;
		if (!this.checkRateLimit(rateKey, isBindCmd)) {
			return { text: '⏳ 操作過於頻繁，請稍後再試' };
		}

		// help 不需要綁定
		if (parsed.command === BOT_COMMANDS.HELP) {
			return { text: BOT_HELP_TEXT };
		}

		// bind 不需要已綁定
		if (parsed.command === BOT_COMMANDS.BIND) {
			return this.handleBind(ctx, parsed);
		}

		// 其餘指令需要綁定
		if (AUTH_REQUIRED_COMMANDS.includes(parsed.command as any) && !ctx.userId) {
			return { text: this.formatter.formatNotBound() };
		}

		try {
			switch (parsed.command) {
				case BOT_COMMANDS.UNBIND:
					return this.botUserService.unbind(ctx);
				case BOT_COMMANDS.STATUS:
					return this.botUserService.getStatus(ctx);
				case BOT_COMMANDS.PETS:
					return this.handlePets(ctx);
				case BOT_COMMANDS.PET:
					return this.handlePet(ctx, parsed);
				case BOT_COMMANDS.WEIGHT:
					return this.handleWeight(ctx, parsed);
				case BOT_COMMANDS.DIET:
					return this.handleDiet(ctx, parsed);
				case BOT_COMMANDS.TOILET:
					return this.handleToilet(ctx, parsed);
				case BOT_COMMANDS.SYMPTOM:
					return this.handleSymptom(ctx, parsed);
				default:
					return { text: '❓ 無法識別的指令，請輸入 /help 查看說明' };
			}
		} catch (error) {
			return this.errorHandler.handle(error, parsed.command);
		}
	}

	private parseCommand(raw: string): ParsedCommand | null {
		const trimmed = raw.trim();
		if (!trimmed.startsWith('/')) return null;

		// 處理 Telegram bot 指令格式：/command@botname
		const parts = trimmed.split(/\s+/);
		const rawCommand = parts[0].split('@')[0].substring(1).toLowerCase();
		const commandPart = COMMAND_ALIASES[rawCommand] || rawCommand;
		return {
			command: commandPart,
			args: parts.slice(1),
			raw: trimmed,
		};
	}

	private checkRateLimit(key: string, isBind: boolean): boolean {
		const limitKey = isBind ? `bind:${key}` : key;
		const limit = isBind ? this.BIND_LIMIT : this.GENERAL_LIMIT;
		const now = Date.now();

		const entry = this.rateLimits.get(limitKey);
		if (!entry || now > entry.resetAt) {
			this.rateLimits.set(limitKey, { count: 1, resetAt: now + 60_000 });
			return true;
		}
		if (entry.count >= limit) return false;
		entry.count++;
		return true;
	}

	// ===== 指令處理 =====

	private async handleBind(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		if (parsed.args.length < 2) {
			return {
				text: '📝 用法：/bind <帳號> <密碼>',
				deleteUserMessage: true,
				ephemeral: true,
			};
		}
		const [account, password] = parsed.args;
		return this.botUserService.bind(ctx.platformId, ctx.platform, account, password);
	}

	private async handlePets(ctx: BotUserContext): Promise<BotCommandResult> {
		const pets = await this.petService.findMyPets(ctx.userId!);
		return { text: this.formatter.formatPetList(pets) };
	}

	private async handlePet(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		const usage = '📝 用法：/pet 新增 <名字> <類型>\n類型: 狗/貓/鳥/魚/倉鼠/兔/其他';
		if (parsed.args.length < 1 || !ADD_KEYWORDS.includes(parsed.args[0].toLowerCase())) {
			return { text: usage };
		}
		if (parsed.args.length < 3) {
			return { text: usage };
		}
		const name = parsed.args[1];
		const typeInput = parsed.args[2].toLowerCase();
		const type = PET_TYPE_MAP[typeInput];

		if (!type) {
			return { text: `❌ 無效的寵物類型「${parsed.args[2]}」\n可用: 狗/貓/鳥/魚/倉鼠/兔/其他` };
		}

		await this.petService.create(ctx.userId!, { name, type: type as any });
		return { text: this.formatter.formatPetCreated(name, type) };
	}

	private async handleWeight(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		if (parsed.args.length === 0) {
			return { text: '📝 用法：/weight <數值> [自己|寵物:<名字>] 或 /weight 統計' };
		}

		// stats / 統計
		if (STATS_KEYWORDS.includes(parsed.args[0].toLowerCase())) {
			const target = await this.resolveTarget(ctx.userId!, parsed.args);
			if (target.error) return { text: `❌ ${target.error}` };
			const label = target.isMe ? '自己' : target.pet?.petName;
			const stats = await this.healthWeightService.getStatistics(ctx.userId!, false, target.pet?.petId ?? undefined);
			return { text: this.formatter.formatWeightStats(stats, label) };
		}

		const weight = parseFloat(parsed.args[0]);
		if (isNaN(weight) || weight <= 0) {
			return { text: '❌ 請輸入有效的體重數值 (kg)' };
		}

		const target = await this.resolveTarget(ctx.userId!, parsed.args);
		if (target.error) return { text: `❌ ${target.error}` };

		await this.healthWeightService.create(ctx.userId!, {
			date: new Date(),
			weight,
			pet_id: target.pet?.petId,
		});

		const label = target.isMe ? '自己' : target.pet?.petName;
		return { text: this.formatter.formatWeightRecorded(weight, label) };
	}

	private async handleDiet(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		if (parsed.args.length === 0) {
			return { text: '📝 用法：/diet <餐別> <食物> [自己|寵物:<名字>] 或 /diet 今天' };
		}

		// today / 今天
		if (TODAY_KEYWORDS.includes(parsed.args[0].toLowerCase())) {
			const target = await this.resolveTarget(ctx.userId!, parsed.args);
			if (target.error) return { text: `❌ ${target.error}` };

			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const records = await this.healthDietService.findAll(
				{ where: { date: { gte: today, lt: tomorrow }, pet_id: target.pet?.petId ?? undefined } },
				ctx.userId!,
				false,
			);
			const label = target.isMe ? '自己' : target.pet?.petName;
			return { text: this.formatter.formatDietToday(records, label) };
		}

		if (parsed.args.length < 2) {
			return { text: '📝 用法：/diet <餐別> <食物> [自己|寵物:<名字>]\n餐別: 早餐/午餐/晚餐/點心' };
		}

		const mealTypeInput = parsed.args[0].toLowerCase();
		const mealType = MEAL_TYPE_MAP[mealTypeInput];
		if (!mealType) {
			return { text: `❌ 無效的餐別「${parsed.args[0]}」\n可用: 早餐/午餐/晚餐/點心` };
		}

		// 食物名稱 = args 中非 pet:/寵物:/me/自己 的部分
		const foodParts = parsed.args.slice(1).filter((a) => !this.isPetPrefix(a) && !this.isSelfKeyword(a));
		const foodName = foodParts.join(' ');
		if (!foodName) {
			return { text: '❌ 請輸入食物名稱' };
		}

		const target = await this.resolveTarget(ctx.userId!, parsed.args);
		if (target.error) return { text: `❌ ${target.error}` };

		await this.healthDietService.create(ctx.userId!, {
			date: new Date(),
			meal_type: mealType as MealType,
			food_name: foodName,
			pet_id: target.pet?.petId,
		});

		const label = target.isMe ? '自己' : target.pet?.petName;
		return { text: this.formatter.formatDietRecorded(mealType, foodName, label) };
	}

	private async handleToilet(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		if (parsed.args.length === 0) {
			return { text: '📝 用法：/toilet <類型> [異常] [自己|寵物:<名字>]\n類型: 排尿/排便' };
		}

		const typeInput = parsed.args[0].toLowerCase();
		const type = TOILET_TYPE_MAP[typeInput];
		if (!type) {
			return { text: `❌ 無效的排泄類型「${parsed.args[0]}」\n可用: 尿/便` };
		}

		const isNormal = !parsed.args.some((a) => ABNORMAL_KEYWORDS.includes(a.toLowerCase()));
		const target = await this.resolveTarget(ctx.userId!, parsed.args);
		if (target.error) return { text: `❌ ${target.error}` };

		const now = new Date();
		const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

		await this.healthToiletService.create(ctx.userId!, {
			date: now,
			time,
			type: type as ToiletType,
			is_normal: isNormal,
			pet_id: target.pet?.petId,
		});

		const label = target.isMe ? '自己' : target.pet?.petName;
		return { text: this.formatter.formatToiletRecorded(type, isNormal, label) };
	}

	private async handleSymptom(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		if (parsed.args.length === 0) {
			return { text: '📝 用法：/symptom <類型> <嚴重度> [自己|寵物:<名字>] 或 /symptom 統計\n嚴重度: 輕微/中等/嚴重' };
		}

		// stats / 統計
		if (STATS_KEYWORDS.includes(parsed.args[0].toLowerCase())) {
			const target = await this.resolveTarget(ctx.userId!, parsed.args);
			if (target.error) return { text: `❌ ${target.error}` };
			const label = target.isMe ? '自己' : target.pet?.petName;
			const stats = await this.healthSymptomService.getStatistics(ctx.userId!, false, target.pet?.petId ?? undefined);
			return { text: this.formatter.formatSymptomStats(stats, label) };
		}

		if (parsed.args.length < 2) {
			return { text: '📝 用法：/symptom <類型> <嚴重度> [自己|寵物:<名字>]\n嚴重度: 輕微/中等/嚴重' };
		}

		const symptomTypeInput = parsed.args[0].toLowerCase();
		const symptomType = SYMPTOM_TYPE_MAP[symptomTypeInput];
		if (!symptomType) {
			return { text: `❌ 無效的症狀類型「${parsed.args[0]}」\n可用: 嘔吐/咳嗽/腹瀉/皮膚問題/眼睛問題/耳朵問題/食慾不振/嗜睡/呼吸問題/跛行/搔癢/打噴嚏/發燒/其他` };
		}

		const severityInput = parsed.args[1].toLowerCase();
		const severity = SEVERITY_MAP[severityInput];
		if (!severity) {
			return { text: `❌ 無效的嚴重度「${parsed.args[1]}」\n可用: 輕微/中等/嚴重` };
		}

		const target = await this.resolveTarget(ctx.userId!, parsed.args);
		if (target.error) return { text: `❌ ${target.error}` };

		const now = new Date();
		const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

		await this.healthSymptomService.create(ctx.userId!, {
			date: now,
			time,
			symptom_type: symptomType as SymptomType,
			severity: severity as Severity,
			pet_id: target.pet?.petId,
		});

		const label = target.isMe ? '自己' : target.pet?.petName;
		return { text: this.formatter.formatSymptomRecorded(symptomType, severity, label) };
	}

	// ===== 共用工具 =====

	/**
	 * 統一解析目標：me（自己）、pet:<名字>（指定寵物）、或自動帶入
	 * 回傳 { pet: PetReference | null, isMe: boolean, error?: string }
	 */
	private async resolveTarget(userId: number, args: string[]): Promise<{ pet: PetReference | null; isMe: boolean; error?: string }> {
		// 明確指定 me/自己 → 記錄自己
		if (args.some((a) => this.isSelfKeyword(a))) {
			return { pet: null, isMe: true };
		}

		// 明確指定 pet:<名字> / 寵物:<名字>
		const petRef = this.extractPetRef(args);
		if (petRef) {
			const pet = await this.resolvePetByName(userId, petRef);
			if (!pet) {
				return { pet: null, isMe: false, error: `找不到名為「${petRef}」的寵物` };
			}
			return { pet, isMe: false };
		}

		// 未指定 → 自動帶入（1 隻寵物帶入，0 或多隻記錄自己）
		const pet = await this.autoResolvePet(userId);
		return { pet, isMe: !pet };
	}

	private extractPetRef(args: string[]): string | null {
		const petArg = args.find((a) => this.isPetPrefix(a));
		if (!petArg) return null;
		for (const prefix of PET_PREFIXES) {
			if (petArg.startsWith(prefix)) {
				return petArg.substring(prefix.length);
			}
		}
		return null;
	}

	private isSelfKeyword(arg: string): boolean {
		return SELF_KEYWORDS.includes(arg.toLowerCase());
	}

	private isPetPrefix(arg: string): boolean {
		return PET_PREFIXES.some((p) => arg.startsWith(p));
	}

	private async resolvePetByName(userId: number, name: string): Promise<PetReference | null> {
		const pets = await this.petService.findMyPets(userId);
		const match = pets.find((p) => p.name.toLowerCase() === name.toLowerCase());
		return match ? { petId: match.id, petName: match.name } : null;
	}

	private async autoResolvePet(userId: number): Promise<PetReference | null> {
		const pets = await this.petService.findMyPets(userId);
		if (pets.length === 1) {
			return { petId: pets[0].id, petName: pets[0].name };
		}
		return null;
	}
}
