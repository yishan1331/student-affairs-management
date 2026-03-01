import React, { useEffect, useState, useCallback } from "react";
import {
	Card,
	Col,
	Row,
	Radio,
	DatePicker,
	Button,
	Spin,
	Statistic,
	Empty,
	Space,
	Tabs,
	Typography,
} from "antd";
import {
	LeftOutlined,
	RightOutlined,
	LineChartOutlined,
	BarChartOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
} from "@ant-design/icons";
import { DualAxes, Column, Pie } from "@ant-design/charts";
import dayjs, { Dayjs } from "dayjs";
import apiClient from "../../services/api/apiClient";
import { HealthSubjectSelector } from "../../components";

const { Title } = Typography;

type Period = "day" | "week" | "month";

// ===== 體重趨勢型別 =====

interface WeightTrendDataItem {
	date: string;
	weight: number | null;
	bmi: number | null;
	count: number;
}

interface WeightTrendSummary {
	avgWeight: number;
	minWeight: number;
	maxWeight: number;
	weightChange: number;
}

interface WeightTrendResponse {
	period: string;
	startDate: string;
	endDate: string;
	data: WeightTrendDataItem[];
	summary: WeightTrendSummary;
}

// ===== 如廁趨勢型別 =====

interface ToiletTrendDataItem {
	date: string;
	urination: number;
	defecation: number;
	total: number;
	abnormalCount: number;
}

interface ToiletTrendSummary {
	totalRecords: number;
	avgDaily: number;
	normalRate: number;
	urinationTotal: number;
	defecationTotal: number;
}

interface ToiletTrendResponse {
	period: string;
	startDate: string;
	endDate: string;
	data: ToiletTrendDataItem[];
	summary: ToiletTrendSummary;
}

// ===== 共用期間控制列 =====

const PeriodControls: React.FC<{
	period: Period;
	setPeriod: (p: Period) => void;
	date: Dayjs;
	setDate: (d: Dayjs) => void;
	periodLabel: string;
}> = ({ period, setPeriod, date, setDate, periodLabel }) => {
	const navigatePeriod = (direction: -1 | 1) => {
		if (period === "day") setDate(date.add(direction, "day"));
		else if (period === "week") setDate(date.add(direction * 7, "day"));
		else setDate(date.add(direction, "month"));
	};

	return (
		<Card style={{ marginBottom: 16 }}>
			<Row gutter={[16, 16]} align="middle">
				<Col>
					<Radio.Group
						value={period}
						onChange={(e) => setPeriod(e.target.value)}
						optionType="button"
						buttonStyle="solid"
					>
						<Radio.Button value="day">日</Radio.Button>
						<Radio.Button value="week">週</Radio.Button>
						<Radio.Button value="month">月</Radio.Button>
					</Radio.Group>
				</Col>
				<Col>
					<Space>
						<Button
							icon={<LeftOutlined />}
							onClick={() => navigatePeriod(-1)}
						/>
						<DatePicker
							value={date}
							onChange={(d) => d && setDate(d)}
							picker={period === "month" ? "month" : "date"}
							allowClear={false}
						/>
						<Button
							icon={<RightOutlined />}
							onClick={() => navigatePeriod(1)}
						/>
					</Space>
				</Col>
				<Col>
					<Typography.Text type="secondary">
						{periodLabel}
					</Typography.Text>
				</Col>
			</Row>
		</Card>
	);
};

// ===== 體重趨勢 Tab =====

const WeightTrendTab: React.FC<{ period: Period; date: Dayjs; petId?: number }> = ({
	period,
	date,
	petId,
}) => {
	const [trendData, setTrendData] = useState<WeightTrendResponse | null>(
		null
	);
	const [loading, setLoading] = useState(false);

	const fetchTrend = useCallback(async () => {
		setLoading(true);
		try {
			const params: any = { period, date: date.toISOString() };
			params.pet_id = petId != null ? petId : "null";
			const res = await apiClient.get("/v1/health-weight/trend", {
				params,
			});
			setTrendData(res.data?.data || res.data);
		} catch {
			console.error("Failed to fetch weight trend");
		} finally {
			setLoading(false);
		}
	}, [period, date, petId]);

	useEffect(() => {
		fetchTrend();
	}, [fetchTrend]);

	const chartData = (trendData?.data || [])
		.filter((d) => d.weight !== null)
		.map((d) => ({
			date: period === "day" ? dayjs(d.date).format("HH:mm") : d.date,
			weight: d.weight as number,
			bmi: d.bmi as number,
		}));

	const summary = trendData?.summary;

	const dualAxesConfig: any = {
		xField: "date",
		data: chartData,
		children: [
			{
				type: "line",
				yField: "weight",
				style: { lineWidth: 2, stroke: "#1890ff" },
				point: { size: 4, fill: "#1890ff" },
				axis: {
					y: { title: "體重 (kg)", position: "left" },
				},
			},
			{
				type: "line",
				yField: "bmi",
				style: {
					lineWidth: 2,
					stroke: "#ff7a45",
					lineDash: [4, 4],
				},
				point: { size: 4, fill: "#ff7a45" },
				axis: {
					y: { title: "BMI", position: "right" },
				},
			},
		],
	};

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: 60 }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<>
			{summary && (
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="平均體重"
								value={summary.avgWeight}
								suffix="kg"
								precision={2}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="最低體重"
								value={summary.minWeight}
								suffix="kg"
								precision={1}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="最高體重"
								value={summary.maxWeight}
								suffix="kg"
								precision={1}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="體重變化"
								value={summary.weightChange}
								suffix="kg"
								precision={2}
								valueStyle={{
									color:
										summary.weightChange > 0
											? "#cf1322"
											: summary.weightChange < 0
												? "#3f8600"
												: undefined,
								}}
								prefix={
									summary.weightChange > 0 ? (
										<ArrowUpOutlined />
									) : summary.weightChange < 0 ? (
										<ArrowDownOutlined />
									) : undefined
								}
							/>
						</Card>
					</Col>
				</Row>
			)}

			{chartData.length === 0 ? (
				<Card>
					<Empty description="此期間無體重紀錄" />
				</Card>
			) : (
				<Card title="體重 / BMI 趨勢">
					<DualAxes {...dualAxesConfig} height={400} />
				</Card>
			)}
		</>
	);
};

// ===== 如廁趨勢 Tab =====

const ToiletTrendTab: React.FC<{ period: Period; date: Dayjs; petId?: number }> = ({
	period,
	date,
	petId,
}) => {
	const [trendData, setTrendData] = useState<ToiletTrendResponse | null>(
		null
	);
	const [loading, setLoading] = useState(false);

	const fetchTrend = useCallback(async () => {
		setLoading(true);
		try {
			const params: any = { period, date: date.toISOString() };
			params.pet_id = petId != null ? petId : "null";
			const res = await apiClient.get("/v1/health-toilet/trend", {
				params,
			});
			setTrendData(res.data?.data || res.data);
		} catch {
			console.error("Failed to fetch toilet trend");
		} finally {
			setLoading(false);
		}
	}, [period, date, petId]);

	useEffect(() => {
		fetchTrend();
	}, [fetchTrend]);

	const columnData = (trendData?.data || []).flatMap((d) => [
		{ date: d.date, type: "小便", count: d.urination },
		{ date: d.date, type: "大便", count: d.defecation },
	]);

	const summary = trendData?.summary;
	const normalCount = summary
		? Math.round((summary.normalRate * summary.totalRecords) / 100)
		: 0;
	const abnormalCount = summary ? summary.totalRecords - normalCount : 0;
	const pieData = summary
		? [
				{ type: "正常", value: normalCount },
				{ type: "異常", value: abnormalCount },
			]
		: [];

	const columnConfig: any = {
		data: columnData,
		xField: "date",
		yField: "count",
		colorField: "type",
		stack: true,
		color: ["#1890ff", "#faad14"],
		axis: { y: { title: "次數" } },
		legend: { position: "top" as const },
	};

	const pieConfig: any = {
		data: pieData,
		angleField: "value",
		colorField: "type",
		color: ["#52c41a", "#ff4d4f"],
		innerRadius: 0.6,
		label: {
			text: (d: any) => `${d.type}: ${d.value}`,
			position: "outside",
		},
		legend: { position: "bottom" as const },
	};

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: 60 }}>
				<Spin size="large" />
			</div>
		);
	}

	const hasData = (trendData?.data || []).some((d) => d.total > 0);

	return (
		<>
			{summary && (
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="總次數"
								value={summary.totalRecords}
								suffix="次"
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="每日平均"
								value={summary.avgDaily}
								suffix="次"
								precision={1}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="正常率"
								value={summary.normalRate}
								suffix="%"
								precision={1}
								valueStyle={{
									color:
										summary.normalRate >= 80
											? "#3f8600"
											: "#cf1322",
								}}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card>
							<Statistic
								title="小便 / 大便"
								value={`${summary.urinationTotal} / ${summary.defecationTotal}`}
							/>
						</Card>
					</Col>
				</Row>
			)}

			{!hasData ? (
				<Card>
					<Empty description="此期間無如廁紀錄" />
				</Card>
			) : (
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={16}>
						<Card title="每日如廁次數">
							<Column {...columnConfig} height={400} />
						</Card>
					</Col>
					<Col xs={24} lg={8}>
						<Card title="正常 / 異常比例">
							<Pie {...pieConfig} height={400} />
						</Card>
					</Col>
				</Row>
			)}
		</>
	);
};

// ===== 主頁面 =====

export const HealthTrendList: React.FC = () => {
	const [period, setPeriod] = useState<Period>("week");
	const [date, setDate] = useState<Dayjs>(dayjs());
	const [periodLabel, setPeriodLabel] = useState("");
	const [activeTab, setActiveTab] = useState("weight");
	const [petId, setPetId] = useState<number | undefined>(undefined);

	// 期間標籤由子元件回傳不太方便，改為自行計算
	useEffect(() => {
		const base = date.toDate();
		let start: Date;
		let end: Date;

		if (period === "day") {
			start = base;
			end = base;
		} else if (period === "month") {
			start = new Date(base.getFullYear(), base.getMonth(), 1);
			end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
		} else {
			const day = base.getDay();
			const diffToMonday = day === 0 ? -6 : 1 - day;
			start = new Date(
				base.getFullYear(),
				base.getMonth(),
				base.getDate() + diffToMonday
			);
			end = new Date(
				start.getFullYear(),
				start.getMonth(),
				start.getDate() + 6
			);
		}
		setPeriodLabel(
			`${dayjs(start).format("YYYY-MM-DD")} ~ ${dayjs(end).format("YYYY-MM-DD")}`
		);
	}, [period, date]);

	return (
		<div>
			<Title level={3}>
				<LineChartOutlined /> 健康趨勢分析
			</Title>

			<HealthSubjectSelector value={petId} onChange={setPetId} />

			<PeriodControls
				period={period}
				setPeriod={setPeriod}
				date={date}
				setDate={setDate}
				periodLabel={periodLabel}
			/>

			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				items={[
					{
						key: "weight",
						label: (
							<span>
								<LineChartOutlined /> 體重趨勢
							</span>
						),
						children: (
							<WeightTrendTab period={period} date={date} petId={petId} />
						),
					},
					{
						key: "toilet",
						label: (
							<span>
								<BarChartOutlined /> 如廁趨勢
							</span>
						),
						children: (
							<ToiletTrendTab period={period} date={date} petId={petId} />
						),
					},
				]}
			/>
		</div>
	);
};
