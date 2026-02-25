import { axiosInstance, generateSort, generateFilter } from './utils';
import { stringify } from 'query-string';
import type { AxiosInstance } from 'axios';
import type {
	DataProvider,
	BaseRecord,
	GetListParams,
	GetManyParams,
	CreateParams,
	UpdateParams,
	GetOneParams,
	DeleteOneParams,
	CustomParams,
} from '@refinedev/core';
import { ApiResponse } from '../../common/types/api';
import { extractApiData } from '../../utils/api';

type MethodTypes = 'get' | 'delete' | 'head' | 'options';
type MethodTypesWithBody = 'post' | 'put' | 'patch';

export const dataProvider = (
	apiUrl: string,
	httpClient: AxiosInstance = axiosInstance,
): Omit<
	Required<DataProvider>,
	'createMany' | 'updateMany' | 'deleteMany'
> => ({
	getList: async <TData extends BaseRecord = BaseRecord>(
		params: GetListParams,
	) => {
		const { resource, pagination, filters, sorters, meta } = params;
		const url = `${apiUrl}/${resource}`;

		const {
			current = 1,
			pageSize = 10,
			mode = 'server',
		} = pagination ?? {};

		const { headers: headersFromMeta, method } = meta ?? {};
		const requestMethod = (method as MethodTypes) ?? 'get';

		const queryFilters = generateFilter(filters);

		const query: {
			_start?: number;
			_end?: number;
			_sort?: string;
			_order?: string;
		} = {};

		if (mode === 'server') {
			query._start = (current - 1) * pageSize;
			query._end = current * pageSize;
		}

		const generatedSort = generateSort(sorters);
		if (generatedSort) {
			const { _sort, _order } = generatedSort;
			query._sort = _sort.join(',');
			query._order = _order.join(',');
		}

		const combinedQuery = { ...query, ...queryFilters };
		const urlWithQuery = Object.keys(combinedQuery).length
			? `${url}?${stringify(combinedQuery)}`
			: url;

		const { data: response, headers } = await httpClient[requestMethod](
			urlWithQuery,
			{
				headers: headersFromMeta,
			},
		);

		const total = +headers['x-total-count'];
		const apiResponse = extractApiData<TData[]>(response);

		return {
			data: apiResponse ?? [],
			total:
				total ||
				(Array.isArray(apiResponse)
					? apiResponse.length
					: typeof apiResponse === 'object'
						? 1
						: 0),
		};
	},

	getMany: async <TData extends BaseRecord = BaseRecord>(
		params: GetManyParams,
	) => {
		const { resource, ids, meta } = params;
		const { headers, method } = meta ?? {};
		const requestMethod = (method as MethodTypes) ?? 'get';

		const { data: response } = await httpClient[requestMethod](
			`${apiUrl}/${resource}?${stringify({ id: ids })}`,
			{ headers },
		);

		const apiResponse = extractApiData<TData[]>(response);

		return {
			data: apiResponse ?? [],
		};
	},

	create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
		params: CreateParams<TVariables>,
	) => {
		const { resource, variables, meta } = params;
		const url = `${apiUrl}/${resource}`;

		const { headers, method } = meta ?? {};
		const requestMethod = (method as MethodTypesWithBody) ?? 'post';

		const { data: response } = await httpClient[requestMethod](
			url,
			variables,
			{
				headers,
			},
		);

		const apiResponse = extractApiData<TData>(response);

		return {
			data: apiResponse as TData,
		};
	},

	update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
		params: UpdateParams<TVariables>,
	) => {
		const { resource, id, variables, meta } = params;
		const url = `${apiUrl}/${resource}/${id}`;

		const { headers, method } = meta ?? {};
		const requestMethod = (method as MethodTypesWithBody) ?? 'put';

		const { data: response } = await httpClient[requestMethod](
			url,
			variables,
			{
				headers,
			},
		);

		const apiResponse = extractApiData<TData>(response);

		return {
			data: apiResponse as TData,
		};
	},

	getOne: async <TData extends BaseRecord = BaseRecord>(
		params: GetOneParams,
	) => {
		const { resource, id, meta } = params;
		const url = `${apiUrl}/${resource}/${id}`;

		const { headers, method } = meta ?? {};
		const requestMethod = (method as MethodTypes) ?? 'get';

		const { data: response } = await httpClient[requestMethod](url, {
			headers,
		});

		const apiResponse = extractApiData<TData>(response);

		return {
			data: apiResponse as TData,
		};
	},

	deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
		params: DeleteOneParams<TVariables>,
	) => {
		const { resource, id, variables, meta } = params;
		const url = `${apiUrl}/${resource}/${id}`;

		const { headers, method } = meta ?? {};
		const requestMethod = (method as MethodTypesWithBody) ?? 'delete';

		const { data: response } = await httpClient[requestMethod](url, {
			data: variables,
			headers,
		});

		const apiResponse = extractApiData<TData>(response);

		return {
			data: apiResponse as TData,
		};
	},

	getApiUrl: () => {
		return apiUrl;
	},

	custom: async <
		TData extends BaseRecord = BaseRecord,
		TQuery = unknown,
		TPayload = unknown,
	>(
		params: CustomParams<TQuery, TPayload>,
	) => {
		const { url, method, filters, sorters, payload, query, headers } =
			params;
		let requestUrl = `${url}?`;

		if (sorters) {
			const generatedSort = generateSort(sorters);
			if (generatedSort) {
				const { _sort, _order } = generatedSort;
				const sortQuery = {
					_sort: _sort.join(','),
					_order: _order.join(','),
				};
				requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
			}
		}

		if (filters) {
			const filterQuery = generateFilter(filters);
			requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
		}

		if (query) {
			requestUrl = `${requestUrl}&${stringify(query)}`;
		}

		let axiosResponse;
		switch (method) {
			case 'put':
			case 'post':
			case 'patch':
				axiosResponse = await httpClient[method](url, payload, {
					headers,
				});
				break;
			case 'delete':
				axiosResponse = await httpClient.delete(url, {
					data: payload,
					headers: headers,
				});
				break;
			default:
				axiosResponse = await httpClient.get(requestUrl, {
					headers,
				});
				break;
		}

		const { data: response } = axiosResponse;
		const apiResponse = extractApiData<TData>(response);

		return Promise.resolve({ data: apiResponse as TData });
	},
});
