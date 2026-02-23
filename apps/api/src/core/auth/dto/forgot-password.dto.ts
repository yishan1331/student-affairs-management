import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
	@IsString()
	@IsNotEmpty()
	account: string;
}
