import { IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class IngestWeightDto {
	// 接受 ISO 8601（含時區）或 YYYY-MM-DD。保留原字串以便用 local calendar day 做 dedup。
	@Matches(/^\d{4}-\d{2}-\d{2}($|T)/, {
		message: 'date 需為 ISO 8601 格式（例如 2026-04-15T00:23:00+08:00 或 2026-04-15）',
	})
	date: string;

	@IsNumber()
	@Min(0.1)
	@Max(500)
	weight: number;

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(300)
	height?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	bmi?: number;

	@IsOptional()
	@IsString()
	note?: string;
}
