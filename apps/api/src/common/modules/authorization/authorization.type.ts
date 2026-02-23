import { Model } from 'casbin';

export interface IAuthorizationOptions<T = any> {
	modelPath: Model | string;
	policyAdapter: T;
	global?: boolean;
}

export enum ActionType {
	READ = 'read',
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}
