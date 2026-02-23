import { DynamicModule, Module, Provider } from '@nestjs/common';

import { newEnforcer } from 'casbin';

import { AuthorizationService } from './authorization.service';
import { IAuthorizationOptions } from './authorization.type';
import { CASBIN_ENFORCER } from './authorization.constants';

@Module({})
export class AuthorizationModule {
	static register(options: IAuthorizationOptions) {
		const { modelPath, policyAdapter, global = false } = options;
		const enforcer: Provider = {
			provide: CASBIN_ENFORCER,
			useFactory: async () => {
				const instance = await newEnforcer(modelPath, policyAdapter);
				return instance;
			},
		};

		return {
			module: AuthorizationModule,
			global,
			providers: [enforcer, AuthorizationService],
			exports: [AuthorizationService],
		};
	}
}
