import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Request } from 'express';

type Subsystem = 'course' | 'health';

/**
 * 路由前綴 → 所屬子系統 的單一真實來源。
 * 未列在此處的路由視為「共用」，不受子系統限制（僅由 RbacGuard 依角色把關）。
 * 註：請將較長的前綴排在前面，避免被較短前綴提前比中（例如 course-session vs course）。
 */
const SUBSYSTEM_ROUTE_MAP: { prefix: string; subsystem: Subsystem }[] = [
	// 課程管理
	{ prefix: '/api/v1/course-session', subsystem: 'course' },
	{ prefix: '/api/v1/course', subsystem: 'course' },
	{ prefix: '/api/v1/school', subsystem: 'course' },
	{ prefix: '/api/v1/student', subsystem: 'course' },
	{ prefix: '/api/v1/attendance', subsystem: 'course' },
	{ prefix: '/api/v1/grade-sheet', subsystem: 'course' },
	{ prefix: '/api/v1/salary-base', subsystem: 'course' },
	{ prefix: '/api/v1/dashboard', subsystem: 'course' },
	// 健康管理
	{ prefix: '/api/v1/health-weight', subsystem: 'health' },
	{ prefix: '/api/v1/health-diet', subsystem: 'health' },
	{ prefix: '/api/v1/health-toilet', subsystem: 'health' },
	{ prefix: '/api/v1/health-symptom', subsystem: 'health' },
	{ prefix: '/api/v1/ingest', subsystem: 'health' },
];

const SUBSYSTEM_LABELS: Record<Subsystem, string> = {
	course: '課程管理',
	health: '健康管理',
};

@Injectable()
export class SubsystemGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const path = request.path;

		const matched = SUBSYSTEM_ROUTE_MAP.find(
			(r) => path === r.prefix || path.startsWith(r.prefix + '/'),
		);

		// 共用路由（未對應任何子系統）直接放行
		if (!matched) {
			return true;
		}

		// request.user 由 JwtAuthGuard 從 DB 取得，subsystems 永遠是最新值（不依賴 token 內容）
		const user = request.user as { subsystems?: string[] } | undefined;
		const subsystems = user?.subsystems ?? [];

		if (!subsystems.includes(matched.subsystem)) {
			throw new ForbiddenException(
				`此帳號無權存取「${SUBSYSTEM_LABELS[matched.subsystem]}」子系統`,
			);
		}

		return true;
	}
}
