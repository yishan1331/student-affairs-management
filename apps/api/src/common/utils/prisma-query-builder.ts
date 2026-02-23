import { Prisma } from '@prisma/client';

export interface QueryParams {
	sort?: string;
	_sort?: string;
	_order?: string;
	page?: string;
	pageSize?: string;
	_start?: string;
	_end?: string;
	[key: string]: any;
}

export interface PrismaQueryBuilderOptions {
	defaultSort?: Record<string, 'asc' | 'desc'>;
	defaultPageSize?: number;
	searchableFields?: string[];
	filterableFields?: string[];
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
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

		this.handleSort(query, prismaQuery);
		this.handlePagination(query, prismaQuery);
		this.handleFilters(query, prismaQuery);

		return prismaQuery as T;
	}

	// Extract just the where clause for count queries
	buildWhere(query: QueryParams): any {
		const prismaQuery: any = { where: {} };
		this.handleFilters(query, prismaQuery);
		return prismaQuery.where;
	}

	private handleSort(query: QueryParams, prismaQuery: any) {
		// Support _sort/_order format (from Refine data provider)
		if (query._sort && query._order) {
			const fields = query._sort.split(',');
			const orders = query._order.split(',');
			if (fields.length === 1) {
				prismaQuery.orderBy = { [fields[0]]: orders[0] || 'asc' };
			} else {
				prismaQuery.orderBy = fields.map((field, i) => ({
					[field]: orders[i] || 'asc',
				}));
			}
		}
		// Support sort format (field:order)
		else if (query.sort) {
			const [field, order] = query.sort.split(':');
			prismaQuery.orderBy = { [field]: order || 'asc' };
		}
		// Default sort
		else if (this.options.defaultSort) {
			prismaQuery.orderBy = this.options.defaultSort;
		}
	}

	private handlePagination(query: QueryParams, prismaQuery: any) {
		// Support _start/_end format (from Refine data provider)
		if (query._start !== undefined && query._end !== undefined) {
			const start = parseInt(query._start);
			const end = parseInt(query._end);
			prismaQuery.skip = start;
			prismaQuery.take = end - start;
		}
		// Support page/pageSize format
		else if (query.page && query.pageSize) {
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

		// 處理可篩選欄位（自動識別布林值與數字）
		if (this.options.filterableFields?.length) {
			for (const field of this.options.filterableFields) {
				if (query[field] !== undefined) {
					const value = query[field];
					if (value === 'true' || value === 'false') {
						where[field] = value === 'true';
					} else if (!isNaN(Number(value))) {
						where[field] = Number(value);
					} else {
						where[field] = value;
					}
				}
			}
		}

		prismaQuery.where = where;
	}
}
