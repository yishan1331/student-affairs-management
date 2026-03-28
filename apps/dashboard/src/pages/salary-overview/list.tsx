import React, { useEffect, useState, useCallback } from "react";
import {
	Button,
	Card,
	Col,
	DatePicker,
	Grid,
	Row,
	Select,
	Spin,
	Statistic,
	Table,
	Tooltip,
	Typography,
	Empty,
	Space,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import {
	DollarOutlined,
	BankOutlined,
	ReloadOutlined,
	ClearOutlined,
} from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import dayjs, { Dayjs } from "dayjs";
import apiClient from "../../services/api/apiClient";
import { ISchool } from "../../common/types/models";
import { ROUTE_RESOURCE } from "../../common/constants";
import { MobileFilterBar } from "../../components/mobile";

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
	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	// 日期範圍：預設為當月 1 日 ~ 今天
	const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
		dayjs().startOf("month"),
		dayjs(),
	]);
	const [schoolId, setSchoolId] = useState<number | undefined>(undefined);
	const [summaryData, setSummaryData] = useState<ISalarySummarySchool[]>([]);
	const [loading, setLoading] = useState(false);
	const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

	const toggleCourse = (courseId: number) => {
		setExpandedCourses((prev) => {
			const next = new Set(prev);
			if (next.has(courseId)) {
				next.delete(courseId);
			} else {
				next.add(courseId);
			}
			return next;
		});
	};

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
				start_date: dateRange[0].format("YYYY-MM-DD"),
				end_date: dateRange[1].format("YYYY-MM-DD"),
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

	const expandedRowRenderWithScroll = (record: ISalarySummaryCourse) => {
		return (
			<div style={{ overflowX: "auto" }}>
				<Table
					columns={sessionColumns}
					dataSource={record.sessions}
					rowKey={(session) => `${record.courseId}-${session.date}`}
					pagination={false}
					size="small"
					scroll={{ x: 'max-content' }}
				/>
			</div>
		);
	};

	return (
		<div>
			<Title level={3}>
				<DollarOutlined /> 薪資總覽
			</Title>

			{/* 篩選區 */}
			<MobileFilterBar isMobile={isMobile}>
			<Card style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} sm={8} md={5}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							快速選月
						</Text>
						<DatePicker
							picker="month"
							placeholder="選擇月份"
							style={{ width: "100%" }}
							onChange={(date: Dayjs | null) => {
								if (date) {
									setDateRange([
										date.startOf("month"),
										date.endOf("month"),
									]);
								}
							}}
							value={null}
						/>
					</Col>
					<Col xs={24} sm={16} md={9}>
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
							<Tooltip title="重新載入">
								<Button
									icon={<ReloadOutlined />}
									onClick={fetchSummary}
								/>
							</Tooltip>
							<Tooltip title="重置篩選">
								<Button
									icon={<ClearOutlined />}
									onClick={() => {
										setDateRange([dayjs().startOf("month"), dayjs()]);
										setSchoolId(undefined);
									}}
								/>
							</Tooltip>
						</Space>
					</Col>
				</Row>
			</Card>
			</MobileFilterBar>

			{/* 摘要卡片 */}
			<Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
				<Col xs={8} sm={8}>
					<Card size={isMobile ? "small" : "default"}>
						<Statistic
							title="薪資總計"
							value={grandTotal}
							prefix={isMobile ? undefined : <DollarOutlined />}
							formatter={(value) => formatCurrency(Number(value))}
							valueStyle={{ color: "#3f8600", fontSize: isMobile ? 16 : 24 }}
						/>
					</Card>
				</Col>
				<Col xs={8} sm={8}>
					<Card size={isMobile ? "small" : "default"}>
						<Statistic
							title="學校數"
							value={summaryData.length}
							prefix={isMobile ? undefined : <BankOutlined />}
							suffix="所"
							valueStyle={isMobile ? { fontSize: 16 } : undefined}
						/>
					</Card>
				</Col>
				<Col xs={8} sm={8}>
					<Card size={isMobile ? "small" : "default"}>
						<Statistic
							title="上課次數"
							value={totalSessionCount}
							suffix="堂"
							valueStyle={isMobile ? { fontSize: 16 } : undefined}
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
						size={isMobile ? "small" : "default"}
						title={
							<Space>
								<BankOutlined />
								<span>{school.schoolName}</span>
							</Space>
						}
						extra={
							<Text strong style={{ color: "#3f8600", fontSize: isMobile ? 13 : 16 }}>
								{isMobile ? formatCurrency(school.totalSalary) : `合計：${formatCurrency(school.totalSalary)}`}
							</Text>
						}
						style={{ marginBottom: 16 }}
					>
						{isMobile ? (
							<Space direction="vertical" size={8} style={{ width: "100%" }}>
								{school.courses.map((course) => {
									const isExpanded = expandedCourses.has(course.courseId);
									return (
										<Card
											key={course.courseId}
											size="small"
											style={{ borderRadius: 8, cursor: "pointer" }}
											styles={{ body: { padding: 0 } }}
											onClick={() => toggleCourse(course.courseId)}
										>
											<div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
												<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
													<DownOutlined style={{
														fontSize: 10,
														color: "#999",
														transition: "transform 0.2s",
														transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
													}} />
													<div>
														<Text strong style={{ fontSize: 13 }}>{course.courseName}</Text>
														<div>
															<Text type="secondary" style={{ fontSize: 12 }}>
																{course.sessionCount} 堂
															</Text>
														</div>
													</div>
												</div>
												<Text strong style={{ color: "#52c41a", fontSize: 14 }}>
													{formatCurrency(course.totalSalary)}
												</Text>
											</div>
											{isExpanded && (
												<div style={{ padding: "0 8px 8px", borderTop: "1px solid #f0f0f0" }}>
													<Space direction="vertical" size={4} style={{ width: "100%", marginTop: 6 }}>
														{course.sessions.map((session) => (
															<div
																key={`${course.courseId}-${session.date}`}
																style={{
																	display: "flex",
																	justifyContent: "space-between",
																	alignItems: "center",
																	padding: "6px 8px",
																	borderRadius: 6,
																	background: "var(--ant-color-fill-alter, #fafafa)",
																	fontSize: 12,
																}}
																onClick={(e) => e.stopPropagation()}
															>
																<div>
																	<Text style={{ fontSize: 12 }}>
																		{dayjs(session.date).format("MM/DD (dd)")}
																	</Text>
																	<Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
																		{session.studentCount} 人
																	</Text>
																	{session.salaryBaseName && (
																		<Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
																			· {session.salaryBaseName}
																		</Text>
																	)}
																</div>
																<Text style={{ fontSize: 12, color: "#52c41a" }}>
																	{formatCurrency(session.salaryAmount)}
																</Text>
															</div>
														))}
													</Space>
												</div>
											)}
										</Card>
									);
								})}
								<div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px", borderTop: "1px solid #f0f0f0" }}>
									<Text strong style={{ fontSize: 12 }}>
										合計 {school.courses.reduce((sum, c) => sum + c.sessionCount, 0)} 堂
									</Text>
									<Text strong style={{ color: "#52c41a", fontSize: 13 }}>
										{formatCurrency(school.totalSalary)}
									</Text>
								</div>
							</Space>
						) : (
							<Table
								columns={courseColumns}
								dataSource={school.courses}
								rowKey="courseId"
								pagination={false}
								scroll={{ x: 'max-content' }}
								expandable={{
									expandedRowRender: expandedRowRenderWithScroll,
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
											<Table.Summary.Cell index={0} />
											<Table.Summary.Cell index={1}>
												<Text strong>合計</Text>
											</Table.Summary.Cell>
											<Table.Summary.Cell index={2} align="center">
												<Text strong>{totalSessions}</Text>
											</Table.Summary.Cell>
											<Table.Summary.Cell index={3} align="right">
												<Text strong style={{ color: "#52c41a" }}>
													{formatCurrency(totalAmount)}
												</Text>
											</Table.Summary.Cell>
										</Table.Summary.Row>
									);
								}}
							/>
						)}
					</Card>
				))
			)}
		</div>
	);
};
