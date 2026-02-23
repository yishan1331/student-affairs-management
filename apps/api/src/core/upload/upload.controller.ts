import {
	Controller,
	Post,
	Delete,
	Param,
	Query,
	UseGuards,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards';

@ApiTags('檔案上傳')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Post()
	@UseInterceptors(FileInterceptor('file'))
	upload(
		@UploadedFile() file: Express.Multer.File,
		@Query('folder') folder?: string,
	) {
		return this.uploadService.uploadImage(file, folder);
	}

	@Delete(':publicId')
	remove(@Param('publicId') publicId: string) {
		return this.uploadService.deleteImage(publicId);
	}
}
