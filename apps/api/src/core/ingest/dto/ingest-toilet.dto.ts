import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { ToiletType } from '@prisma/client';

export class IngestToiletDto {
	// 接受 ISO 8601（含時區）或 YYYY-MM-DD。日曆日取前 10 碼，時間優先用下方 time。
	@Matches(/^\d{4}-\d{2}-\d{2}($|T)/, {
		message: 'date 需為 ISO 8601 格式（例如 2026-04-15T14:30:00+08:00 或 2026-04-15）',
	})
	date: string;

	// 可省略：若 date 為含時間的 ISO 字串會自動取用其 HH:mm
	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: 'time 格式必須為 HH:mm（例如 10:30）',
	})
	time?: string;

	// 可省略：預設 defecation（大便）
	@IsOptional()
	@IsEnum(ToiletType)
	type?: ToiletType;

	@IsOptional()
	@IsBoolean()
	is_normal?: boolean;

	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsNumber()
	pet_id?: number;
}
