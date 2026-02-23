import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin } from "antd";
import {
	BankOutlined,
	BookOutlined,
	TeamOutlined,
	CheckCircleOutlined,
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

export const DashboardPage: React.FC = () => {
	const [statistics, setStatistics] = useState<DashboardStatistics | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStatistics = async () => {
			try {
				const response = await apiClient.get(
					"/v1/dashboard/statistics",
				);
				setStatistics(response.data?.data);
			} catch (error) {
				console.error("Failed to fetch dashboard statistics:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchStatistics();
	}, []);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div>
			<h1>首頁</h1>
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
		</div>
	);
};
