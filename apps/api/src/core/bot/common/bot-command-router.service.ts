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
import { BOT_COMMANDS, BOT_HELP_TEXT, AUTH_REQUIRED_COMMANDS } from './constants/bot-commands.constant';
import { PetType, MealType, ToiletType, SymptomType, Severity } from '@prisma/client';

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
		const commandPart = parts[0].split('@')[0].substring(1).toLowerCase();
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
		if (parsed.args.length < 1 || parsed.args[0] !== 'add') {
			return { text: '📝 用法：/pet add <名字> <類型>\n類型: dog, cat, bird, fish, hamster, rabbit, other' };
		}
		if (parsed.args.length < 3) {
			return { text: '📝 用法：/pet add <名字> <類型>\n類型: dog, cat, bird, fish, hamster, rabbit, other' };
		}
		const name = parsed.args[1];
		const type = parsed.args[2].toLowerCase();

		const validTypes: string[] = Object.values(PetType);
		if (!validTypes.includes(type)) {
			return { text: `❌ 無效的寵物類型「${type}」\n可用類型: ${validTypes.join(', ')}` };
		}

		await this.petService.create(ctx.userId!, { name, type: type as PetType });
		return { text: this.formatter.formatPetCreated(name, type) };
	}

	private async handleWeight(ctx: BotUserContext, parsed: ParsedCommand): Promise<BotCommandResult> {
		if (parsed.args.length === 0) {
			return { text: '📝 用法：/weight <數值> [me|pet:<名字>] 或 /weight stats' };
		}

		// stats
		if (parsed.args[0] === 'stats') {
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
			return { text: '📝 用法：/diet <餐別> <食物> [me|pet:<名字>] 或 /diet today' };
		}

		// today
		if (parsed.args[0] === 'today') {
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
			return { text: '📝 用法：/diet <餐別> <食物> [me|pet:<名字>]\n餐別: breakfast, lunch, dinner, snack' };
		}

		const mealType = parsed.args[0].toLowerCase();
		const validMeals: string[] = Object.values(MealType);
		if (!validMeals.includes(mealType)) {
			return { text: `❌ 無效的餐別「${mealType}」\n可用: ${validMeals.join(', ')}` };
		}

		// 食物名稱 = args 中非 pet:/me 的部分
		const foodParts = parsed.args.slice(1).filter((a) => !a.startsWith('pet:') && a !== 'me');
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
			return { text: '📝 用法：/toilet <類型> [abnormal] [me|pet:<名字>]\n類型: urination, defecation' };
		}

		const type = parsed.args[0].toLowerCase();
		const validTypes: string[] = Object.values(ToiletType);
		if (!validTypes.includes(type)) {
			return { text: `❌ 無效的排泄類型「${type}」\n可用: ${validTypes.join(', ')}` };
		}

		const isNormal = !parsed.args.includes('abnormal');
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
			return { text: '📝 用法：/symptom <類型> <嚴重度> [me|pet:<名字>] 或 /symptom stats\n嚴重度: mild, moderate, severe' };
		}

		// stats
		if (parsed.args[0] === 'stats') {
			const target = await this.resolveTarget(ctx.userId!, parsed.args);
			if (target.error) return { text: `❌ ${target.error}` };
			const label = target.isMe ? '自己' : target.pet?.petName;
			const stats = await this.healthSymptomService.getStatistics(ctx.userId!, false, target.pet?.petId ?? undefined);
			return { text: this.formatter.formatSymptomStats(stats, label) };
		}

		if (parsed.args.length < 2) {
			return { text: '📝 用法：/symptom <類型> <嚴重度> [me|pet:<名字>]\n嚴重度: mild, moderate, severe' };
		}

		const symptomType = parsed.args[0].toLowerCase();
		const validSymptoms: string[] = Object.values(SymptomType);
		if (!validSymptoms.includes(symptomType)) {
			return { text: `❌ 無效的症狀類型「${symptomType}」\n可用: ${validSymptoms.join(', ')}` };
		}

		const severity = parsed.args[1].toLowerCase();
		const validSeverities: string[] = Object.values(Severity);
		if (!validSeverities.includes(severity)) {
			return { text: `❌ 無效的嚴重度「${severity}」\n可用: ${validSeverities.join(', ')}` };
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
		// 明確指定 me → 記錄自己
		if (args.includes('me')) {
			return { pet: null, isMe: true };
		}

		// 明確指定 pet:<名字>
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
		const petArg = args.find((a) => a.startsWith('pet:'));
		return petArg ? petArg.substring(4) : null;
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
