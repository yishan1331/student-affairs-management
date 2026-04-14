import { IsDefined, IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';

export class CreateApiTokenDto {
	@IsDefined()
	@IsString()
	@MaxLength(50)
	name: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(3650)
	expires_in_days?: number;
}
