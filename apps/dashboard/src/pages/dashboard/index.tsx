import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	Col,
	Row,
	Statistic,
	Spin,
	message,
	Progress,
	Typography,
	Space,
} from "antd";
import {
	BankOutlined,
	BookOutlined,
	TeamOutlined,
	CheckCircleOutlined,
	DownloadOutlined,
	BarChartOutlined,
} from "@ant-design/icons";
import apiClient from "../../services/api/apiClient";

interface DashboardStatistics {
	totalSchools: number;
	activeSchools: number;
	totalCourses: number;
	totalStudents: number;
	activeStudents: number;
	todayAttendanceRate: number;
	todayAttendanceCount: number;
	todayTotalCount: number;
}

interface AttendanceStats {
	student_id: number;
	name: string;
	attendance: number;
	absent: number;
	late: number;
	excused: number;
	total: number;
	attendanceRate: number;
}

interface GradeStats {
	courseId: number;
	totalStudents: number;
	averageScore: number;
	highestScore: number;
	lowestScore: number;
	distribution: {
		excellent: number;
		good: number;
		average: number;
		passing: number;
		failing: number;
	};
}

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
	const [statistics, setStatistics] = useState<DashboardStatistics | null>(
		null,
	);
	const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>(
		[],
	);
	const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState<string | null>(null);

	const handleExport = async (type: string, label: string) => {
		setExporting(type);
		try {
			const response = await apiClient.get(`/v1/${type}/export`, {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `${type}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			message.success(`${label}匯出成功`);
		} catch {
			message.error(`${label}匯出失敗`);
		} finally {
			setExporting(null);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsRes, attendanceRes, gradeRes] =
					await Promise.all([
						apiClient.get("/v1/dashboard/statistics"),
						apiClient
							.get("/v1/attendance/statistics")
							.catch(() => ({ data: { data: [] } })),
						apiClient
							.get("/v1/grade-sheet/statistics?course_id=1")
							.catch(() => ({ data: { data: null } })),
					]);
				setStatistics(statsRes.data?.data);
				setAttendanceStats(attendanceRes.data?.data || []);
				setGradeStats(gradeRes.data?.data || null);
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin size="large" />
			</div>
		);
	}

	// Calculate aggregated attendance data
	const totalAttendance = attendanceStats.reduce(
		(sum, s) => sum + s.attendance,
		0,
	);
	const totalAbsent = attendanceStats.reduce(
		(sum, s) => sum + s.absent,
		0,
	);
	const totalLate = attendanceStats.reduce((sum, s) => sum + s.late, 0);
	const totalExcused = attendanceStats.reduce(
		(sum, s) => sum + s.excused,
		0,
	);
	const totalRecords = attendanceStats.reduce(
		(sum, s) => sum + s.total,
		0,
	);

	return (
		<div>
			<Title level={3}>首頁</Title>

			{/* Statistics Cards */}
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="學校總數"
							value={statistics?.totalSchools ?? 0}
							suffix={`/ ${statistics?.activeSchools ?? 0} 活躍`}
							prefix={<BankOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="課程總數"
							value={statistics?.totalCourses ?? 0}
							prefix={<BookOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="學生總數"
							value={statistics?.totalStudents ?? 0}
							suffix={`/ ${statistics?.activeStudents ?? 0} 活躍`}
							prefix={<TeamOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="今日出勤率"
							value={
								statistics?.todayTotalCount
									? Math.round(
											(statistics.todayAttendanceRate ??
												0) * 100,
										)
									: 0
							}
							suffix="%"
							prefix={<CheckCircleOutlined />}
						/>
					</Card>
				</Col>
			</Row>

			{/* Attendance Distribution */}
			<Title level={4} style={{ marginTop: 24 }}>
				<BarChartOutlined /> 出勤統計分佈
			</Title>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="出席"
							value={totalAttendance}
							valueStyle={{ color: "#52c41a" }}
						/>
						<Progress
							percent={
								totalRecords
									? Math.round(
											(totalAttendance / totalRecords) *
												100,
										)
									: 0
							}
							strokeColor="#52c41a"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="缺席"
							value={totalAbsent}
							valueStyle={{ color: "#ff4d4f" }}
						/>
						<Progress
							percent={
								totalRecords
									? Math.round(
											(totalAbsent / totalRecords) * 100,
										)
									: 0
							}
							strokeColor="#ff4d4f"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="遲到"
							value={totalLate}
							valueStyle={{ color: "#faad14" }}
						/>
						<Progress
							percent={
								totalRecords
									? Math.round(
											(totalLate / totalRecords) * 100,
										)
									: 0
							}
							strokeColor="#faad14"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="請假"
							value={totalExcused}
							valueStyle={{ color: "#1890ff" }}
						/>
						<Progress
							percent={
								totalRecords
									? Math.round(
											(totalExcused / totalRecords) * 100,
										)
									: 0
							}
							strokeColor="#1890ff"
						/>
					</Card>
				</Col>
			</Row>

			{/* Grade Distribution */}
			{gradeStats && gradeStats.totalStudents > 0 && (
				<>
					<Title level={4} style={{ marginTop: 24 }}>
						<BarChartOutlined /> 成績統計分佈
					</Title>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={8}>
							<Card>
								<Statistic
									title="平均分數"
									value={gradeStats.averageScore}
									precision={1}
								/>
							</Card>
						</Col>
						<Col xs={24} sm={8}>
							<Card>
								<Statistic
									title="最高分"
									value={gradeStats.highestScore}
									valueStyle={{ color: "#52c41a" }}
								/>
							</Card>
						</Col>
						<Col xs={24} sm={8}>
							<Card>
								<Statistic
									title="最低分"
									value={gradeStats.lowestScore}
									valueStyle={{ color: "#ff4d4f" }}
								/>
							</Card>
						</Col>
					</Row>
					<Card style={{ marginTop: 16 }}>
						<Title level={5}>成績分佈</Title>
						<Space
							direction="vertical"
							style={{ width: "100%" }}
						>
							<div>
								<Text>優秀 (90-100)</Text>
								<Progress
									percent={Math.round(
										(gradeStats.distribution.excellent /
											gradeStats.totalStudents) *
											100,
									)}
									strokeColor="#52c41a"
									format={() =>
										`${gradeStats.distribution.excellent} 人`
									}
								/>
							</div>
							<div>
								<Text>良好 (80-89)</Text>
								<Progress
									percent={Math.round(
										(gradeStats.distribution.good /
											gradeStats.totalStudents) *
											100,
									)}
									strokeColor="#1890ff"
									format={() =>
										`${gradeStats.distribution.good} 人`
									}
								/>
							</div>
							<div>
								<Text>中等 (70-79)</Text>
								<Progress
									percent={Math.round(
										(gradeStats.distribution.average /
											gradeStats.totalStudents) *
											100,
									)}
									strokeColor="#faad14"
									format={() =>
										`${gradeStats.distribution.average} 人`
									}
								/>
							</div>
							<div>
								<Text>及格 (60-69)</Text>
								<Progress
									percent={Math.round(
										(gradeStats.distribution.passing /
											gradeStats.totalStudents) *
											100,
									)}
									strokeColor="#fa8c16"
									format={() =>
										`${gradeStats.distribution.passing} 人`
									}
								/>
							</div>
							<div>
								<Text>不及格 (&lt;60)</Text>
								<Progress
									percent={Math.round(
										(gradeStats.distribution.failing /
											gradeStats.totalStudents) *
											100,
									)}
									strokeColor="#ff4d4f"
									format={() =>
										`${gradeStats.distribution.failing} 人`
									}
								/>
							</div>
						</Space>
					</Card>
				</>
			)}

			{/* Quick Export */}
			<Title level={4} style={{ marginTop: 24 }}>
				快速匯出
			</Title>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={8}>
					<Card>
						<Button
							type="primary"
							icon={<DownloadOutlined />}
							loading={exporting === "student"}
							onClick={() =>
								handleExport("student", "學生名單")
							}
							block
						>
							匯出學生名單
						</Button>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Button
							type="primary"
							icon={<DownloadOutlined />}
							loading={exporting === "attendance"}
							onClick={() =>
								handleExport("attendance", "考勤紀錄")
							}
							block
						>
							匯出考勤紀錄
						</Button>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Button
							type="primary"
							icon={<DownloadOutlined />}
							loading={exporting === "grade-sheet"}
							onClick={() =>
								handleExport("grade-sheet", "成績紀錄")
							}
							block
						>
							匯出成績紀錄
						</Button>
					</Card>
				</Col>
			</Row>
		</div>
	);
};
