import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
} from '@nestjs/common';
import { GradeSheetService } from './grade-sheet.service';
import { CreateGradeSheetDto } from './dto/create-grade-sheet.dto';
import { UpdateGradeSheetDto } from './dto/update-grade-sheet.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/grade-sheet')
export class GradeSheetController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly gradeSheetService: GradeSheetService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['student_id'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createGradeSheetDto: CreateGradeSheetDto) {
		return this.gradeSheetService.create(createGradeSheetDto);
	}

	@Get()
	findAll(@Query() query: any) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.GradeSheetFindManyArgs>(query);
		return this.gradeSheetService.findAll(prismaQuery);
	}

	@Get('statistics')
	getStatistics(@Query('course_id') courseId: string) {
		return this.gradeSheetService.getStatistics(+courseId);
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
