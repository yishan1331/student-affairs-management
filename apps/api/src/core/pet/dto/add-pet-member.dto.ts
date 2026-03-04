import { IsDefined, IsNumber } from 'class-validator';

export class AddPetMemberDto {
	@IsDefined()
	@IsNumber()
	user_id: number;
}
