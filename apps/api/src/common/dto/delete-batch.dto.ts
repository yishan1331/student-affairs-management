import { IsDefined, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

/**
 * 批次刪除共用 DTO：所有資源的批次刪除 endpoint 皆接收一組整數 id 陣列。
 */
export class DeleteBatchDto {
	@IsDefined()
	@IsArray()
	@ArrayNotEmpty()
	@IsInt({ each: true })
	ids: number[];
}
