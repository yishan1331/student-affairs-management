import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../../core/audit-log/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
	constructor(private readonly auditLogService: AuditLogService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const method = request.method;

		// Only log CUD operations
		if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
			return next.handle();
		}

		const user = request.user;
		const path = request.route?.path || request.url;
		const ip = request.ip || request.headers['x-forwarded-for'];

		// Extract entity name from controller path (e.g., "v1/student" -> "Student")
		const entity = this.extractEntity(path);
		const action = this.mapMethodToAction(method);

		return next.handle().pipe(
			tap((data) => {
				const entityId = data?.id || request.params?.id ? +request.params.id : undefined;

				this.auditLogService.create({
					action,
					entity,
					entity_id: entityId,
					user_id: user?.sub || user?.id,
					changes: method === 'DELETE' ? null : request.body,
					ip_address: ip,
				}).catch((err) => {
					// Don't let audit log failure affect the request
					console.error('Audit log error:', err);
				});
			}),
		);
	}

	private extractEntity(path: string): string {
		// Extract from path like "/api/v1/student/:id" -> "Student"
		const match = path.match(/v1\/([^/]+)/);
		if (!match) return 'Unknown';
		return match[1]
			.split('-')
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');
	}

	private mapMethodToAction(method: string): string {
		switch (method) {
			case 'POST': return 'CREATE';
			case 'PUT':
			case 'PATCH': return 'UPDATE';
			case 'DELETE': return 'DELETE';
			default: return method;
		}
	}
}
