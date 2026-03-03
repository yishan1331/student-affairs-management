import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Req,
	ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('使用者管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Get()
	findAll(@Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		if (!isAdmin) {
			// 非 admin 只能查看自己的使用者資料
			return this.userService.findOne(user.id);
		}
		return this.userService.findAll();
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
