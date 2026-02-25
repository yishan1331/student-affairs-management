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
import {
	Space,
	Table,
	Tag,
	DatePicker,
	Select,
	InputNumber,
	Input,
	Switch,
	Modal,
	Form,
	Button,
	Card,
	Row,
	Col,
	Typography,
	message,
	Checkbox,
	Divider,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useGo, useNavigation, useResource } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren, useState, useCallback } from "react";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";

import {
	ICourseSession,
	ICourse,
	ISchool,
} from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import apiClient from "../../services/api/apiClient";
import { useUser } from "../../contexts/userContext";

dayjs.locale("zh-tw");

const { Text } = Typography;

// 行內編輯的本地狀態管理
interface InlineEditState {
	[key: string]: {
		actual_student_count?: number;
		note?: string;
	};
}

export const CourseSessionList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();
	const { resource } = useResource();
	const { user } = useUser();

	// 篩選狀態
	const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
	const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>();
	const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();

	// 批次匯入 Modal 狀態
	const [batchModalOpen, setBatchModalOpen] = useState(false);
	const [batchMonth, setBatchMonth] = useState<Dayjs | null>(dayjs());
	const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
	const [batchLoading, setBatchLoading] = useState(false);

	// 行內編輯狀態
	const [editState, setEditState] = useState<InlineEditState>({});

	// 計算月份篩選的日期範圍
	const monthStart = selectedMonth.startOf("month").format("YYYY-MM-DD");
	const monthEnd = selectedMonth.endOf("month").format("YYYY-MM-DD");

	// 建立篩選條件
	const buildFilters = useCallback(() => {
		const filters: any[] = [
			{
				field: "date",
				operator: "gte",
				value: monthStart,
			},
			{
				field: "date",
				operator: "lte",
				value: monthEnd,
			},
		];

		if (selectedSchoolId) {
			filters.push({
				field: "school_id",
				operator: "eq",
				value: selectedSchoolId,
			});
		}

		if (selectedCourseId) {
			filters.push({
				field: "course_id",
				operator: "eq",
				value: selectedCourseId,
			});
		}

		return filters;
	}, [monthStart, monthEnd, selectedSchoolId, selectedCourseId]);

	const { tableProps, sorters, tableQueryResult, setFilters } = useTable<ICourseSession>({
		resource: ROUTE_RESOURCE.courseSession,
		initialSorter: [
			{
				field: "date",
				order: "asc",
			},
		],
		filters: {
			initial: buildFilters(),
			defaultBehavior: "replace",
		},
	});

	const records = tableProps.dataSource as ICourseSession[];

	// 學校選擇
	const { query: schoolQueryResult } = useSelect<ISchool>({
		resource: ROUTE_RESOURCE.school,
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
	});
	const schools = schoolQueryResult?.data?.data || [];
	const schoolOptions = schools.map((s: ISchool) => ({
		label: s.name,
		value: s.id,
	}));

	// 課程選擇（依學校篩選）
	const courseFilters = selectedSchoolId
		? [{ field: "school_id", operator: "eq" as const, value: selectedSchoolId }]
		: [];

	const { query: courseQueryResult } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
		optionLabel: "name",
		optionValue: "id",
		filters: courseFilters,
	});
	const courses = courseQueryResult?.data?.data || [];
	const courseFilterOptions = courses.map((c: ICourse) => ({
		label: `${c.school?.name ? `${c.school.name} - ` : ""}${c.name}`,
		value: c.id,
	}));

	// 批次匯入的課程選項
	const courseOptions = courses.map((c: ICourse) => ({
		label: `${c.school?.name ? `${c.school.name} - ` : ""}${c.name}`,
		value: c.id,
	}));

	// 行內編輯處理
	const handleInlineUpdate = async (id: number, field: string, value: any) => {
		try {
			await apiClient.put(`/${ROUTE_RESOURCE.courseSession}/${id}`, {
				[field]: value,
				modifier_id: user?.id,
			});
			message.success("更新成功");
			tableQueryResult.refetch();
		} catch (error) {
			console.error("Update failed:", error);
			message.error("更新失敗");
		}
	};

	// 取得行內編輯的本地值
	const getEditValue = (recordId: number, field: "actual_student_count" | "note") => {
		return editState[recordId]?.[field];
	};

	// 設定行內編輯的本地值
	const setEditValue = (recordId: number, field: "actual_student_count" | "note", value: any) => {
		setEditState((prev) => ({
			...prev,
			[recordId]: {
				...prev[recordId],
				[field]: value,
			},
		}));
	};

	// 初始化行內編輯的本地值（首次 focus 時）
	const initEditValue = (record: ICourseSession, field: "actual_student_count" | "note") => {
		if (editState[record.id]?.[field] === undefined) {
			setEditValue(record.id, field, record[field] ?? (field === "actual_student_count" ? 0 : ""));
		}
	};

	// 提交行內編輯
	const submitEdit = (recordId: number, field: "actual_student_count" | "note", originalValue: any) => {
		const editedValue = getEditValue(recordId, field);
		if (editedValue !== undefined && editedValue !== originalValue) {
			handleInlineUpdate(recordId, field, editedValue);
		}
		// 清除本地狀態
		setEditState((prev) => {
			const newState = { ...prev };
			if (newState[recordId]) {
				delete newState[recordId][field];
				if (Object.keys(newState[recordId]).length === 0) {
					delete newState[recordId];
				}
			}
			return newState;
		});
	};

	// 篩選變更處理
	const handleMonthChange = (value: Dayjs | null) => {
		if (value) {
			setSelectedMonth(value);
			const start = value.startOf("month").format("YYYY-MM-DD");
			const end = value.endOf("month").format("YYYY-MM-DD");
			const filters: any[] = [
				{ field: "date", operator: "gte", value: start },
				{ field: "date", operator: "lte", value: end },
			];
			if (selectedSchoolId) {
				filters.push({ field: "school_id", operator: "eq", value: selectedSchoolId });
			}
			if (selectedCourseId) {
				filters.push({ field: "course_id", operator: "eq", value: selectedCourseId });
			}
			setFilters(filters, "replace");
		}
	};

	const handleSchoolChange = (value: number | undefined) => {
		setSelectedSchoolId(value);
		setSelectedCourseId(undefined);
		const filters: any[] = [
			{ field: "date", operator: "gte", value: monthStart },
			{ field: "date", operator: "lte", value: monthEnd },
		];
		if (value) {
			filters.push({ field: "school_id", operator: "eq", value });
		}
		setFilters(filters, "replace");
	};

	const handleCourseChange = (value: number | undefined) => {
		setSelectedCourseId(value);
		const filters: any[] = [
			{ field: "date", operator: "gte", value: monthStart },
			{ field: "date", operator: "lte", value: monthEnd },
		];
		if (selectedSchoolId) {
			filters.push({ field: "school_id", operator: "eq", value: selectedSchoolId });
		}
		if (value) {
			filters.push({ field: "course_id", operator: "eq", value });
		}
		setFilters(filters, "replace");
	};

	// 批次匯入處理
	const handleBatchGenerate = async () => {
		if (!batchMonth || selectedCourseIds.length === 0) {
			message.warning("請選擇月份及課程");
			return;
		}
		setBatchLoading(true);
		try {
			const response = await apiClient.post(`/${ROUTE_RESOURCE.courseSession}/batch-generate`, {
				course_ids: selectedCourseIds,
				year: batchMonth.year(),
				month: batchMonth.month() + 1,
				modifier_id: user?.id,
			});
			const result = response.data?.data || response.data;
			message.success(`成功匯入 ${result.created} 筆上課記錄`);
			setBatchModalOpen(false);
			setSelectedCourseIds([]);
			tableQueryResult.refetch();
		} catch (error) {
			message.error("批次匯入失敗");
		} finally {
			setBatchLoading(false);
		}
	};

	return (
		<List
			breadcrumb={true}
			title="上課記錄"
			headerButtons={[
				<Button
					key="batch"
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setBatchModalOpen(true)}
				>
					批次匯入
				</Button>,
				<CreateButton
					key="create"
					hideText={false}
					size="middle"
					style={{ marginLeft: 8 }}
					onClick={() => {
						return go({
							to: `${createUrl(ROUTE_PATH.courseSession)}`,
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
			{/* 篩選區域 */}
			<Card size="small" style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} sm={8} md={6}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							月份
						</Text>
						<DatePicker
							picker="month"
							value={selectedMonth}
							onChange={handleMonthChange}
							style={{ width: "100%" }}
							allowClear={false}
						/>
					</Col>
					<Col xs={24} sm={8} md={6}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							學校
						</Text>
						<Select
							placeholder="全部學校"
							allowClear
							style={{ width: "100%" }}
							value={selectedSchoolId}
							onChange={handleSchoolChange}
							showSearch={false}
							options={schoolOptions}
						/>
					</Col>
					<Col xs={24} sm={8} md={6}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							課程
						</Text>
						<Select
							placeholder="全部課程"
							allowClear
							style={{ width: "100%" }}
							value={selectedCourseId}
							onChange={handleCourseChange}
							showSearch={false}
							options={courseFilterOptions}
						/>
					</Col>
				</Row>
			</Card>

			<Table {...tableProps} dataSource={records} rowKey="id" scroll={{ x: 1200 }}>
				<Table.Column
					dataIndex="id"
					title="ID"
					width={60}
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
				<Table.Column<ICourseSession>
					title="課程"
					width={150}
					render={(_: any, record: ICourseSession) =>
						record.course?.name || "-"
					}
				/>
				<Table.Column<ICourseSession>
					title="學校"
					width={120}
					render={(_: any, record: ICourseSession) =>
						record.course?.school?.name || "-"
					}
				/>
				<Table.Column
					dataIndex="date"
					title="日期"
					width={160}
					defaultSortOrder={getDefaultSortOrder("date", sorters)}
					render={(value: string) =>
						dayjs(value).format("YYYY-MM-DD (dd)")
					}
				/>
				<Table.Column<ICourseSession>
					title="上課時間"
					width={140}
					render={(_: any, record: ICourseSession) => {
						const course = record.course;
						if (!course?.start_time || !course?.end_time) return "-";
						const start = dayjs(course.start_time).format("HH:mm");
						const end = dayjs(course.end_time).format("HH:mm");
						const duration = course.duration;
						return (
							<span>
								{start} - {end}
								{duration ? (
									<Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
										({Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)}h` : ""}
										{duration % 60 > 0 ? `${duration % 60}m` : ""})
									</Text>
								) : null}
							</span>
						);
					}}
				/>
				<Table.Column<ICourseSession>
					title="狀態"
					width={80}
					dataIndex="is_cancelled"
					render={(value: boolean) => (
						<Tag color={value ? "error" : "success"}>
							{value ? "停課" : "正常"}
						</Tag>
					)}
				/>
				<Table.Column<ICourseSession>
					title="實際上課人數"
					width={130}
					render={(_: any, record: ICourseSession) => (
						<InputNumber
							min={0}
							size="small"
							style={{ width: 80 }}
							disabled={record.is_cancelled}
							value={
								getEditValue(record.id, "actual_student_count") ??
								record.actual_student_count
							}
							onFocus={() => initEditValue(record, "actual_student_count")}
							onChange={(val) =>
								setEditValue(record.id, "actual_student_count", val ?? 0)
							}
							onBlur={() =>
								submitEdit(record.id, "actual_student_count", record.actual_student_count)
							}
							onPressEnter={() =>
								submitEdit(record.id, "actual_student_count", record.actual_student_count)
							}
						/>
					)}
				/>
				<Table.Column
					dataIndex="salary_amount"
					title="薪資金額"
					width={100}
					render={(value: number | null, record: ICourseSession) => {
						if ((record as ICourseSession).is_cancelled) return "-";
						return value != null ? `$${value}` : "未設定";
					}}
				/>
				<Table.Column<ICourseSession>
					title="薪資級距"
					width={120}
					render={(_: any, record: ICourseSession) =>
						record.salaryBase?.name || "未設定"
					}
				/>
				<Table.Column<ICourseSession>
					title="備註"
					width={180}
					render={(_: any, record: ICourseSession) => (
						<Input
							size="small"
							style={{ width: "100%" }}
							value={
								getEditValue(record.id, "note") ??
								(record.note || "")
							}
							onFocus={() => initEditValue(record, "note")}
							onChange={(e) =>
								setEditValue(record.id, "note", e.target.value)
							}
							onBlur={() =>
								submitEdit(record.id, "note", record.note || "")
							}
							onPressEnter={() =>
								submitEdit(record.id, "note", record.note || "")
							}
							placeholder="輸入備註"
						/>
					)}
				/>
				<Table.Column<ICourseSession>
					title="操作"
					width={180}
					fixed="right"
					render={(_: any, record: ICourseSession) => (
						<Space>
							<Switch
								size="small"
								checked={record.is_cancelled}
								checkedChildren="停課"
								unCheckedChildren="正常"
								onChange={(checked) =>
									handleInlineUpdate(record.id, "is_cancelled", checked)
								}
							/>
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
								resource={ROUTE_RESOURCE.courseSession}
								hideText
								size="small"
								recordItemId={record.id}
								confirmTitle="確認要刪除嗎？"
								confirmOkText="確認"
								confirmCancelText="取消"
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

			{/* 批次匯入 Modal */}
			<Modal
				title="批次匯入上課記錄"
				open={batchModalOpen}
				onCancel={() => setBatchModalOpen(false)}
				onOk={handleBatchGenerate}
				confirmLoading={batchLoading}
				okText="匯入"
				cancelText="取消"
			>
				<Form layout="vertical">
					<Form.Item label="選擇月份" required>
						<DatePicker
							picker="month"
							value={batchMonth}
							onChange={setBatchMonth}
							style={{ width: "100%" }}
						/>
					</Form.Item>
					<Form.Item label="選擇課程" required>
						<Select
							mode="multiple"
							placeholder="選擇要匯入的課程"
							options={courseOptions}
							value={selectedCourseIds}
							onChange={setSelectedCourseIds}
							style={{ width: "100%" }}
							dropdownRender={(menu) => {
								const allIds = courseOptions.map((c) => c.value);
								const isAllSelected =
									allIds.length > 0 &&
									selectedCourseIds.length === allIds.length;
								const isIndeterminate =
									selectedCourseIds.length > 0 &&
									selectedCourseIds.length < allIds.length;
								return (
									<>
										<div
											style={{
												padding: "4px 12px",
												cursor: "pointer",
											}}
											onMouseDown={(e) => e.preventDefault()}
										>
											<Checkbox
												checked={isAllSelected}
												indeterminate={isIndeterminate}
												onChange={(e) => {
													setSelectedCourseIds(
														e.target.checked ? allIds : [],
													);
												}}
											>
												全選
											</Checkbox>
										</div>
										<Divider style={{ margin: "4px 0" }} />
										{menu}
									</>
								);
							}}
						/>
					</Form.Item>
				</Form>
			</Modal>

			{children}
		</List>
	);
};
