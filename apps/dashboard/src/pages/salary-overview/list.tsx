import React, { useEffect, useState, useCallback } from "react";
import {
	Card,
	Col,
	DatePicker,
	Row,
	Select,
	Spin,
	Statistic,
	Table,
	Typography,
	Empty,
	Space,
} from "antd";
import {
	DollarOutlined,
	BankOutlined,
	ReloadOutlined,
} from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import dayjs, { Dayjs } from "dayjs";
import apiClient from "../../services/api/apiClient";
import { ISchool } from "../../common/types/models";
import { ROUTE_RESOURCE } from "../../common/constants";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ===== 型別定義 =====

interface ISalarySummarySession {
	date: string;
	studentCount: number;
	salaryAmount: number;
	salaryBaseName: string;
}

interface ISalarySummaryCourse {
	courseId: number;
	courseName: string;
	sessionCount: number;
	totalSalary: number;
	sessions: ISalarySummarySession[];
}

interface ISalarySummarySchool {
	schoolId: number;
	schoolName: string;
	courses: ISalarySummaryCourse[];
	totalSalary: number;
}

// ===== 工具函式 =====

const formatCurrency = (value: number): string => {
	return `$${value.toLocaleString("zh-TW")}`;
};

// ===== 元件 =====

export const SalaryOverviewList: React.FC = () => {
	// 日期範圍：預設為當月 1 日 ~ 今天
	const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
		dayjs().startOf("month"),
		dayjs(),
	]);
	const [schoolId, setSchoolId] = useState<number | undefined>(undefined);
	const [summaryData, setSummaryData] = useState<ISalarySummarySchool[]>([]);
	const [loading, setLoading] = useState(false);

	// 學校下拉選項
	const { selectProps: schoolSelectProps } = useSelect<ISchool>({
		resource: ROUTE_RESOURCE.school,
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
	});

	// 取得薪資摘要
	const fetchSummary = useCallback(async () => {
		setLoading(true);
		try {
			const params: Record<string, any> = {
				start_date: dateRange[0].toISOString(),
				end_date: dateRange[1].toISOString(),
			};
			if (schoolId) params.school_id = schoolId;

			const response = await apiClient.get(
				"/v1/course-session/salary-summary",
				{ params },
			);
			setSummaryData(response.data?.data || response.data || []);
		} catch {
			console.error("Failed to fetch salary summary");
		} finally {
			setLoading(false);
		}
	}, [dateRange, schoolId]);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	// 計算所有學校的薪資總計
	const grandTotal = summaryData.reduce(
		(sum, school) => sum + school.totalSalary,
		0,
	);

	// 計算總上課次數
	const totalSessionCount = summaryData.reduce(
		(sum, school) =>
			sum +
			school.courses.reduce(
				(courseSum, course) => courseSum + course.sessionCount,
				0,
			),
		0,
	);

	// 課程 Table 欄位
	const courseColumns = [
		{
			title: "課程名稱",
			dataIndex: "courseName",
			key: "courseName",
		},
		{
			title: "上課次數",
			dataIndex: "sessionCount",
			key: "sessionCount",
			align: "center" as const,
		},
		{
			title: "總薪資",
			dataIndex: "totalSalary",
			key: "totalSalary",
			align: "right" as const,
			render: (value: number) => (
				<Text strong style={{ color: "#52c41a" }}>
					{formatCurrency(value)}
				</Text>
			),
		},
	];

	// 展開列 — 個別堂次明細
	const sessionColumns = [
		{
			title: "日期",
			dataIndex: "date",
			key: "date",
			render: (value: string) => dayjs(value).format("YYYY-MM-DD (dd)"),
		},
		{
			title: "上課人數",
			dataIndex: "studentCount",
			key: "studentCount",
			align: "center" as const,
		},
		{
			title: "薪資金額",
			dataIndex: "salaryAmount",
			key: "salaryAmount",
			align: "right" as const,
			render: (value: number) => formatCurrency(value),
		},
		{
			title: "薪資級距",
			dataIndex: "salaryBaseName",
			key: "salaryBaseName",
		},
	];

	const expandedRowRender = (record: ISalarySummaryCourse) => {
		return (
			<Table
				columns={sessionColumns}
				dataSource={record.sessions}
				rowKey={(session) => `${record.courseId}-${session.date}`}
				pagination={false}
				size="small"
			/>
		);
	};

	return (
		<div>
			<Title level={3}>
				<DollarOutlined /> 薪資總覽
			</Title>

			{/* 篩選區 */}
			<Card style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} sm={12} md={8}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							日期範圍
						</Text>
						<RangePicker
							value={dateRange}
							onChange={(dates) => {
								if (dates && dates[0] && dates[1]) {
									setDateRange([dates[0], dates[1]]);
								}
							}}
							style={{ width: "100%" }}
							allowClear={false}
						/>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							學校
						</Text>
						<Select
							placeholder="全部學校"
							allowClear
							style={{ width: "100%" }}
							value={schoolId}
							onChange={(value) => setSchoolId(value as number | undefined)}
							options={schoolSelectProps?.options}
							loading={schoolSelectProps?.loading}
							showSearch={schoolSelectProps?.showSearch}
							filterOption={schoolSelectProps?.filterOption}
							onSearch={schoolSelectProps?.onSearch}
						/>
					</Col>
					<Col xs={24} sm={12} md={4}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							&nbsp;
						</Text>
						<Space>
							<a onClick={fetchSummary} style={{ cursor: "pointer" }}>
								<ReloadOutlined /> 重新載入
							</a>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* 摘要卡片 */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="薪資總計"
							value={grandTotal}
							prefix={<DollarOutlined />}
							formatter={(value) => formatCurrency(Number(value))}
							valueStyle={{ color: "#3f8600" }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="學校數"
							value={summaryData.length}
							prefix={<BankOutlined />}
							suffix="所"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="總上課次數"
							value={totalSessionCount}
							suffix="堂"
						/>
					</Card>
				</Col>
			</Row>

			{/* 各學校明細 */}
			{loading ? (
				<div style={{ textAlign: "center", padding: 60 }}>
					<Spin size="large" />
				</div>
			) : summaryData.length === 0 ? (
				<Card>
					<Empty description="此期間無薪資資料" />
				</Card>
			) : (
				summaryData.map((school) => (
					<Card
						key={school.schoolId}
						title={
							<Space>
								<BankOutlined />
								<span>{school.schoolName}</span>
							</Space>
						}
						extra={
							<Text strong style={{ color: "#3f8600", fontSize: 16 }}>
								合計：{formatCurrency(school.totalSalary)}
							</Text>
						}
						style={{ marginBottom: 16 }}
					>
						<Table
							columns={courseColumns}
							dataSource={school.courses}
							rowKey="courseId"
							pagination={false}
							expandable={{
								expandedRowRender,
								rowExpandable: (record) =>
									record.sessions && record.sessions.length > 0,
							}}
							summary={(pageData) => {
								const totalSessions = pageData.reduce(
									(sum, course) => sum + course.sessionCount,
									0,
								);
								const totalAmount = pageData.reduce(
									(sum, course) => sum + course.totalSalary,
									0,
								);
								return (
									<Table.Summary.Row>
										<Table.Summary.Cell index={0}>
											<Text strong>合計</Text>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={1} align="center">
											<Text strong>{totalSessions}</Text>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={2} align="right">
											<Text strong style={{ color: "#52c41a" }}>
												{formatCurrency(totalAmount)}
											</Text>
										</Table.Summary.Cell>
									</Table.Summary.Row>
								);
							}}
						/>
					</Card>
				))
			)}
		</div>
	);
};
