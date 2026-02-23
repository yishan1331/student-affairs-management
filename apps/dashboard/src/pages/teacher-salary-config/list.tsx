import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
	useSelect,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import { useGo, useNavigation, useResource } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren } from "react";

import {
	ITeacherSalaryConfig,
	ICourse,
	ISalaryBase,
} from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";

export const TeacherSalaryConfigList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<ITeacherSalaryConfig>({
		resource: ROUTE_RESOURCE.teacherSalaryConfig,
		initialSorter: [
			{
				field: "updated_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as ITeacherSalaryConfig[];

	const { query: courseQueryResult } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
	});
	const courses = courseQueryResult?.data?.data || [];

	const { query: salaryBaseQueryResult } = useSelect<ISalaryBase>({
		resource: ROUTE_RESOURCE.salaryBase,
	});
	const salaryBases = salaryBaseQueryResult?.data?.data || [];

	return (
		<List
			breadcrumb={true}
			headerButtons={[
				<CreateButton
					key="create"
					hideText={false}
					size="middle"
					style={{ marginLeft: 8 }}
					onClick={() => {
						return go({
							to: `${createUrl(ROUTE_PATH.teacherSalaryConfig)}`,
							query: {
								to: pathname,
							},
							options: {
								keepQuery: true,
							},
							type: "replace",
						});
					}}
				>
					新增資料
				</CreateButton>,
			]}
		>
			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
				<Table.Column
					dataIndex="course_id"
					title="課程"
					render={(value: number) => {
						const course = courses.find(
							(c: ICourse) => c.id === value
						);
						return course?.name || value;
					}}
				/>
				<Table.Column
					dataIndex="salary_base_id"
					title="薪資基底"
					render={(value: number) => {
						const salaryBase = salaryBases.find(
							(s: ISalaryBase) => s.id === value
						);
						return salaryBase?.name || value;
					}}
				/>
				<Table.Column
					dataIndex="created_at"
					title="建立時間"
					render={(value: string) => new Date(value).toLocaleString()}
				/>
				<Table.Column
					dataIndex="updated_at"
					title="更新時間"
					render={(value: string) => new Date(value).toLocaleString()}
				/>
				<Table.Column<ITeacherSalaryConfig>
					title="操作"
					render={(_: any, record: ITeacherSalaryConfig) => (
						<Space>
							<ShowButton
								hideText
								size="small"
								recordItemId={record.id}
							/>
							<EditButton
								hideText
								size="small"
								recordItemId={record.id}
							/>
							<DeleteButton
								resource={ROUTE_RESOURCE.teacherSalaryConfig}
								hideText
								size="small"
								recordItemId={record.id}
								confirmTitle={`確認要刪除嗎？`}
								confirmOkText={`確認`}
								confirmCancelText={`取消`}
								successNotification={{
									message: "刪除成功",
									description: `${resource?.meta?.label}已成功刪除`,
									type: "success",
								}}
								errorNotification={{
									message: "刪除失敗",
									description: `無法刪除${resource?.meta?.label}`,
									type: "error",
								}}
							/>
						</Space>
					)}
				/>
			</Table>
			{children}
		</List>
	);
};
