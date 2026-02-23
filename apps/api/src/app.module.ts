import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { newModelFromString, StringAdapter } from 'casbin';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './core/user/user.module';
import { AttendanceModule } from './core/attendance/attendance.module';
import { CourseModule } from './core/course/course.module';
import { StudentModule } from './core/student/student.module';
import { SchoolModule } from './core/school/school.module';
import { GradeSheetModule } from './core/grade-sheet/grade-sheet.module';
import configurationFactory from './config/configuration.factory';
import secretConfigFactory from './config/secret.config';
import {
	GLOBAL_VALIDATION_PIPE,
	GLOBAL_RESPONSE_INTERCEPTOR,
	GLOBAL_EXCEPTIONS_FILTER,
	GLOBAL_PRISMA_EXCEPTIONS_FILTER,
} from './common/providers';
import { AuthModule } from './core/auth/auth.module';
import { DashboardModule } from './core/dashboard/dashboard.module';
import { UploadModule } from './core/upload/upload.module';
import { AuthorizationModule } from './common/modules/authorization/authorization.module';

import { casbinModel } from '../casbin/model.conf';
import { casbinPolicy } from '../casbin/policy.csv';

const model = newModelFromString(casbinModel);
const adapter = new StringAdapter(casbinPolicy);

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env.development.local',
			load: [configurationFactory, secretConfigFactory],
		}),
		AuthorizationModule.register({
			global: true,
			modelPath: model,
			policyAdapter: adapter,
		}),
		PrismaModule,
		UserModule,
		AttendanceModule,
		CourseModule,
		StudentModule,
		SchoolModule,
		GradeSheetModule,
		AuthModule,
		DashboardModule,
		UploadModule,
	],
	controllers: [],
	providers: [
		GLOBAL_VALIDATION_PIPE,
		GLOBAL_RESPONSE_INTERCEPTOR,
		GLOBAL_EXCEPTIONS_FILTER,
		GLOBAL_PRISMA_EXCEPTIONS_FILTER,
	],
})
export class AppModule {}
