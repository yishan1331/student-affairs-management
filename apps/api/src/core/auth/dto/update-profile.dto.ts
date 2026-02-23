import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	username?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MinLength(6)
	password?: string;
}
