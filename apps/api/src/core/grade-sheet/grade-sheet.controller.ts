import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
} from '@nestjs/common';
import { GradeSheetService } from './grade-sheet.service';
import { CreateGradeSheetDto } from './dto/create-grade-sheet.dto';
import { UpdateGradeSheetDto } from './dto/update-grade-sheet.dto';
import { Prisma } from '@prisma/client';

@Controller('v1/grade-sheet')
export class GradeSheetController {
	constructor(private readonly gradeSheetService: GradeSheetService) {}

	@Post()
	create(@Body() createGradeSheetDto: CreateGradeSheetDto) {
		return this.gradeSheetService.create(createGradeSheetDto);
	}

	@Get()
	findAll(@Query() query: Prisma.GradeSheetFindManyArgs) {
		return this.gradeSheetService.findAll(query);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.gradeSheetService.findOne(+id);
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Body() updateGradeSheetDto: UpdateGradeSheetDto,
	) {
		return this.gradeSheetService.update(+id, updateGradeSheetDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.gradeSheetService.remove(+id);
	}
}
