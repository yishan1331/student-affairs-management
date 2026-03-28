import React from "react";
import {
	Card,
	Space,
	Typography,
	Button,
	Dropdown,
	Modal,
	Pagination,
	Empty,
	Spin,
} from "antd";
import {
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	MoreOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export interface MobileCardField<T = any> {
	label: string;
	dataIndex?: string;
	render?: (value: any, record: T) => React.ReactNode;
}

export interface MobileCardListProps<T = any> {
	dataSource?: T[];
	fields: MobileCardField<T>[];
	rowKey?: string;
	loading?: boolean;
	pagination?: {
		current?: number;
		pageSize?: number;
		total?: number;
		onChange?: (page: number, pageSize: number) => void;
	};
	onShow?: (record: T) => void;
	onEdit?: (record: T) => void;
	onDelete?: (record: T) => void;
	deleteConfig?: {
		resourceLabel?: string;
	};
	extraActions?: (record: T) => React.ReactNode;
}

export function MobileCardList<T extends Record<string, any>>({
	dataSource = [],
	fields,
	rowKey = "id",
	loading = false,
	pagination,
	onShow,
	onEdit,
	onDelete,
	deleteConfig,
	extraActions,
}: MobileCardListProps<T>) {
	const handleDelete = (record: T) => {
		Modal.confirm({
			title: "確認要刪除嗎？",
			okText: "確認",
			cancelText: "取消",
			okType: "danger",
			onOk: () => onDelete?.(record),
		});
	};

	const buildMenuItems = (record: T) => {
		const items: any[] = [];
		if (onShow) {
			items.push({
				key: "show",
				icon: <EyeOutlined />,
				label: "查看",
				onClick: () => onShow(record),
			});
		}
		if (onEdit) {
			items.push({
				key: "edit",
				icon: <EditOutlined />,
				label: "編輯",
				onClick: () => onEdit(record),
			});
		}
		if (onDelete) {
			items.push(
				{ type: "divider" },
				{
					key: "delete",
					icon: <DeleteOutlined />,
					label: "刪除",
					danger: true,
					onClick: () => handleDelete(record),
				},
			);
		}
		return items;
	};

	const hasActions = onShow || onEdit || onDelete;

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: 40 }}>
				<Spin />
			</div>
		);
	}

	if (!dataSource.length) {
		return <Empty description="暫無資料" style={{ padding: 40 }} />;
	}

	const renderTitle = (record: T) => {
		if (!fields[0]) return null;
		const value = fields[0].dataIndex
			? record[fields[0].dataIndex]
			: undefined;
		const rendered = fields[0].render
			? fields[0].render(value, record)
			: value ?? "-";
		return rendered;
	};

	return (
		<div>
			<Space direction="vertical" size={8} style={{ width: "100%" }}>
				{dataSource.map((record) => (
					<Card
						key={record[rowKey]}
						size="small"
						style={{ borderRadius: 8 }}
						styles={{
							header: { minHeight: 0, padding: "8px 12px" },
							body: { padding: "10px 12px" },
						}}
						title={
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<Text strong style={{ fontSize: 14 }}>
									{renderTitle(record)}
								</Text>
								{hasActions && (
									<Dropdown
										trigger={["click"]}
										menu={{ items: buildMenuItems(record) }}
									>
										<Button
											type="text"
											icon={<MoreOutlined style={{ fontSize: 16 }} />}
											onClick={(e) => e.stopPropagation()}
											style={{
												minWidth: 40,
												minHeight: 40,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												marginRight: -8,
											}}
										/>
									</Dropdown>
								)}
							</div>
						}
					>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "6px 16px",
							}}
						>
							{fields.slice(1).map((field, idx) => {
								const value = field.dataIndex
									? record[field.dataIndex]
									: undefined;
								const rendered = field.render
									? field.render(value, record)
									: value ?? "-";
								return (
									<div key={idx}>
										<Text
											type="secondary"
											style={{ fontSize: 12 }}
										>
											{field.label}
										</Text>
										<div style={{ fontSize: 13, lineHeight: 1.5 }}>
											{rendered}
										</div>
									</div>
								);
							})}
						</div>
						{extraActions && (
							<div style={{ marginTop: 8 }}>
								{extraActions(record)}
							</div>
						)}
					</Card>
				))}
			</Space>
			{pagination && pagination.total != null && pagination.total > 0 && (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						marginTop: 16,
					}}
				>
					<Pagination
						simple
						size="small"
						current={pagination.current}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onChange={pagination.onChange}
					/>
				</div>
			)}
		</div>
	);
}
