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
	rangeFilterableFields?: string[]; // Fields that support _gte/_lte range operators
	relationFilters?: Record<string, string>; // e.g. { school_id: 'course.school_id' }
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
			rangeFilterableFields: options.rangeFilterableFields || [],
			relationFilters: options.relationFilters || {},
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

		// 處理範圍篩選欄位（支援 _gte / _lte 運算符）
		if (this.options.rangeFilterableFields?.length) {
			for (const field of this.options.rangeFilterableFields) {
				const gteValue = query[`${field}_gte`];
				const lteValue = query[`${field}_lte`];
				if (gteValue !== undefined || lteValue !== undefined) {
					where[field] = {};
					if (gteValue !== undefined) {
						where[field].gte = new Date(gteValue);
					}
					if (lteValue !== undefined) {
						where[field].lte = new Date(lteValue);
					}
				}
			}
		}

		// 處理關聯篩選（e.g. school_id → course: { school_id: value }）
		if (this.options.relationFilters) {
			for (const [queryField, relationPath] of Object.entries(this.options.relationFilters)) {
				if (query[queryField] !== undefined) {
					const value = !isNaN(Number(query[queryField]))
						? Number(query[queryField])
						: query[queryField];
					const parts = relationPath.split('.');
					let current = where;
					for (let i = 0; i < parts.length - 1; i++) {
						if (!current[parts[i]]) current[parts[i]] = {};
						current = current[parts[i]];
					}
					current[parts[parts.length - 1]] = value;
				}
			}
		}

		prismaQuery.where = where;
	}
}
