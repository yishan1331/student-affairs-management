export enum Role {
	ADMIN = 'admin',
	USER = 'user',
	GUEST = 'guest',
}

export enum Status {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

export enum BlogVideoCategory {
	NEWS = 'news',
	ARTICLE = 'article',
}

export type DataSource<T> = {
	label: string;
	value: keyof T;
	type: 'text' | 'custom';
	render?: () => React.ReactNode;
};
