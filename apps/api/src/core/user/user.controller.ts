import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Req,
	Res,
	ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';

@ApiTags('使用者管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/user')
export class UserController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly userService: UserService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['account', 'username', 'email'],
			filterableFields: ['role', 'status'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Get()
	async findAll(@Query() query: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const prismaQuery = this.queryBuilder.build<Prisma.UserFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.userService.findAll(prismaQuery, user.id, isAdmin),
			this.userService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: number, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		if (!isAdmin && user.id !== +id) {
			throw new ForbiddenException('無權限存取此使用者資料');
		}
		return this.userService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		if (!isAdmin && user.id !== +id) {
			throw new ForbiddenException('無權限修改此使用者資料');
		}
		return this.userService.update(id, updateUserDto);
	}

	@Delete(':id')
	remove(@Param('id') id: number, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		if (!isAdmin) {
			throw new ForbiddenException('只有管理員可以刪除使用者');
		}
		return this.userService.remove(id);
	}
}
