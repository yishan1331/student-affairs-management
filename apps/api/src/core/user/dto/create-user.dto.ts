import { Role, Status, Subsystem } from '@prisma/client';

import {
	IsMobilePhone,
	IsEmail,
	IsString,
	IsNotEmpty,
	MinLength,
	IsDefined,
	IsOptional,
	IsEnum,
	IsArray,
} from 'class-validator';

export class CreateUserDto {
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	account: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	password: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	username: string;

	@IsOptional()
	@IsEnum(Role)
	role?: Role;

	@IsOptional()
	@IsArray()
	@IsEnum(Subsystem, { each: true })
	subsystems?: Subsystem[];

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsMobilePhone()
	mobile?: string;

	@IsOptional()
	@IsEnum(Status)
	status?: Status;
}
