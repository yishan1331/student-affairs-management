import { Prisma } from '@prisma/client';

export interface QueryParams {
	sort?: string;
	page?: string;
	pageSize?: string;
	[key: string]: any;
}

export interface PrismaQueryBuilderOptions {
	defaultSort?: Record<string, 'asc' | 'desc'>;
	defaultPageSize?: number;
	searchableFields?: string[];
	filterableFields?: string[];
}

export class PrismaQueryBuilder {
	private options: PrismaQueryBuilderOptions;

	constructor(options: PrismaQueryBuilderOptions = {}) {
		this.options = {
			defaultSort: options.defaultSort || { id: 'desc' },
			defaultPageSize: options.defaultPageSize || 10,
			searchableFields: options.searchableFields || [],
			filterableFields: options.filterableFields || [],
		};
	}

	build<T>(query: QueryParams): T {
		const prismaQuery: any = {
			where: {},
			orderBy: {},
			skip: undefined,
			take: undefined,
		};

		// 處理排序
		this.handleSort(query, prismaQuery);

		// 處理分頁
		this.handlePagination(query, prismaQuery);

		// 處理篩選條件
		this.handleFilters(query, prismaQuery);

		return prismaQuery as T;
	}

	private handleSort(query: QueryParams, prismaQuery: any) {
		if (query.sort) {
			const [field, order] = query.sort.split(':');
			prismaQuery.orderBy = {
				[field]: order || 'asc',
			};
		} else if (this.options.defaultSort) {
			prismaQuery.orderBy = this.options.defaultSort;
		}
	}

	private handlePagination(query: QueryParams, prismaQuery: any) {
		if (query.page && query.pageSize) {
			const page = parseInt(query.page);
			const pageSize = parseInt(query.pageSize);
			prismaQuery.skip = (page - 1) * pageSize;
			prismaQuery.take = pageSize;
		} else if (query.page) {
			const page = parseInt(query.page);
			const pageSize = this.options.defaultPageSize ?? 10;
			prismaQuery.skip = (page - 1) * pageSize;
			prismaQuery.take = pageSize;
		}
	}

	private handleFilters(query: QueryParams, prismaQuery: any) {
		const where: Record<string, any> = {};

		// 處理可搜尋欄位
		if (this.options.searchableFields?.length) {
			for (const field of this.options.searchableFields) {
				if (query[field]) {
					where[field] = {
						contains: query[field],
					};
				}
			}
		}

		// 處理可篩選欄位
		if (this.options.filterableFields?.length) {
			for (const field of this.options.filterableFields) {
				if (query[field] !== undefined) {
					where[field] = query[field] === 'true';
				}
			}
		}

		prismaQuery.where = where;
	}
}
