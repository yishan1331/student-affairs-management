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
import { Avatar, Flex, Space, Table, Tag, Typography } from "antd";
import { useGo, useNavigation, useResource } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren } from "react";

import { ISchool } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { ICourse } from "../../common/types/models/course.types";
import { UserOutlined } from "@ant-design/icons";

export const CourseList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters, searchFormProps, tableQuery } =
		useTable<ICourse>({
			resource: ROUTE_RESOURCE.course,
			initialSorter: [
				{
					field: "updated_at",
					order: "desc",
				},
			],
		});

	const records = tableProps.dataSource as ICourse[];

	const { selectProps: categorySelectProps, query: queryResult } =
		useSelect<ISchool>({
			resource: ROUTE_RESOURCE.school,
		});
	const medicalCategories = queryResult?.data?.data || [];

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
							to: `${createUrl(ROUTE_PATH.course)}`,
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
			{/* <Card title="篩選">
				<Form {...searchFormProps} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8} lg={6}>
							<Form.Item name="name">
								<Input placeholder="輸入名稱搜尋" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8} lg={6}>
							<Form.Item>
								<Button type="primary" htmlType="submit">
									搜尋
								</Button>
								<Button
									style={{ marginLeft: 8 }}
									onClick={() =>
										searchFormProps.form?.resetFields()
									}
								>
									重置
								</Button>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card> */}

			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
				<Table.Column dataIndex="name" title="名稱" />
				<Table.Column dataIndex="display_order" title="排序" />
				<Table.Column
					dataIndex="is_active"
					title="啟用狀態"
					render={(value: boolean) => (
						<Tag color={value ? "success" : "error"}>
							{value ? "啟用" : "未啟用"}
						</Tag>
					)}
				/>
				<Table.Column dataIndex="modifier_id" title="修改者ID" />
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
				<Table.Column<ICourse>
					title="操作"
					render={(_: any, record: ICourse) => (
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
								resource={ROUTE_RESOURCE.course}
								hideText
								size="small"
								recordItemId={record.id}
								confirmTitle={`確認要刪除嗎？`}
								confirmOkText={`確認`}
								confirmCancelText={`取消`}
								successNotification={{
									message: "刪除成功",
									description: `${resource?.meta?.label?.slice(0, 2)}資料已成功刪除`,
									type: "success",
								}}
								errorNotification={{
									message: "刪除失敗",
									description: `無法刪除${resource?.meta?.label?.slice(0, 2)}資料`,
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
