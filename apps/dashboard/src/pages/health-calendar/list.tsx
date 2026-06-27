import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Calendar,
	Card,
	Grid,
	Spin,
	Drawer,
	Tag,
	Typography,
	Empty,
	Button,
	DatePicker,
	Space,
	Tooltip,
} from "antd";
import {
	CalendarOutlined,
	LeftOutlined,
	RightOutlined,
	DashboardOutlined,
	CoffeeOutlined,
	MedicineBoxOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import apiClient from "../../services/api/apiClient";
import { HealthSubjectSelector, ToiletOutlined } from "../../components";
import {
	MEAL_TYPE_MAP,
	TOILET_TYPE_MAP,
	SYMPTOM_TYPE_MAP,
	SEVERITY_MAP,
} from "../../common/constants";
import type {
	IHealthWeight,
	IHealthDiet,
	IHealthToilet,
	IHealthSymptom,
} from "../../common/types/models";
import { MealType, ToiletType, SymptomType, Severity } from "../../common/types/models";

const { Title, Text } = Typography;

// ── 顏色 ──
const COLOR = {
	weight: "#1890ff",
	diet: "#fa8c16",
	toilet: "#13c2c2",
	symptom: "#722ed1",
	danger: "#ff4d4f",
};

// ── 圖示（沿用各健康選單的圖示）──
const ICON = {
	weight: <DashboardOutlined />,
	diet: <CoffeeOutlined />,
	toilet: <ToiletOutlined />,
	symptom: <MedicineBoxOutlined />,
	danger: <WarningOutlined />,
};

interface MonthRecords {
	weight: IHealthWeight[];
	diet: IHealthDiet[];
	toilet: IHealthToilet[];
	symptom: IHealthSymptom[];
}

const EMPTY_RECORDS: MonthRecords = { weight: [], diet: [], toilet: [], symptom: [] };

// 以本地日曆日為 key（YYYY-MM-DD）
const dayKey = (d: string | Date | Dayjs) => dayjs(d).format("YYYY-MM-DD");

export const HealthCalendarList: React.FC = () => {
	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const [value, setValue] = useState<Dayjs>(dayjs());
	const [petId, setPetId] = useState<number | undefined>(undefined);
	const [records, setRecords] = useState<MonthRecords>(EMPTY_RECORDS);
	const [loading, setLoading] = useState(false);

	const [drawerDate, setDrawerDate] = useState<Dayjs | null>(null);

	const monthKey = value.format("YYYY-MM");

	const fetchMonth = useCallback(async () => {
		setLoading(true);
		try {
			const start = value.startOf("month");
			const end = value.endOf("month");
			const params: Record<string, string | number> = {
				pet_id: petId != null ? petId : "null",
				date_gte: start.format("YYYY-MM-DD"),
				date_lte: `${end.format("YYYY-MM-DD")}T23:59:59`,
				pageSize: 1000,
				sort: "date:asc",
			};
			const [w, d, t, s] = await Promise.all([
				apiClient.get("/v1/health-weight", { params }),
				apiClient.get("/v1/health-diet", { params }),
				apiClient.get("/v1/health-toilet", { params }),
				apiClient.get("/v1/health-symptom", { params }),
			]);
			setRecords({
				weight: w.data?.data ?? [],
				diet: d.data?.data ?? [],
				toilet: t.data?.data ?? [],
				symptom: s.data?.data ?? [],
			});
		} catch {
			console.error("Failed to fetch health calendar data");
			setRecords(EMPTY_RECORDS);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monthKey, petId]);

	useEffect(() => {
		fetchMonth();
	}, [fetchMonth]);

	// ── 依日彙總（供格子徽章使用）──
	const dayMap = useMemo(() => {
		const map = new Map<
			string,
			{
				weight: number | null;
				dietCount: number;
				toiletCount: number;
				toiletAbnormal: number;
				symptomCount: number;
				symptomSevere: number;
			}
		>();
		const ensure = (key: string) => {
			let v = map.get(key);
			if (!v) {
				v = {
					weight: null,
					dietCount: 0,
					toiletCount: 0,
					toiletAbnormal: 0,
					symptomCount: 0,
					symptomSevere: 0,
				};
				map.set(key, v);
			}
			return v;
		};
		records.weight.forEach((r) => {
			ensure(dayKey(r.date)).weight = r.weight;
		});
		records.diet.forEach((r) => {
			ensure(dayKey(r.date)).dietCount += 1;
		});
		records.toilet.forEach((r) => {
			const v = ensure(dayKey(r.date));
			v.toiletCount += 1;
			if (!r.is_normal) v.toiletAbnormal += 1;
		});
		records.symptom.forEach((r) => {
			const v = ensure(dayKey(r.date));
			v.symptomCount += 1;
			if (r.severity === Severity.severe) v.symptomSevere += 1;
		});
		return map;
	}, [records]);

	// ── 單格內容 ──
	const renderCell = (current: Dayjs, info: { type: string; originNode: React.ReactNode }) => {
		if (info.type !== "date") return info.originNode;
		// 僅顯示當月日期的資料（鄰月溢出格不抓資料）
		if (current.month() !== value.month() || current.year() !== value.year()) {
			return null;
		}
		const agg = dayMap.get(current.format("YYYY-MM-DD"));
		if (!agg) return null;

		const lineStyle: React.CSSProperties = {
			fontSize: isMobile ? 10 : 12,
			lineHeight: 1.5,
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis",
		};

		const items: React.ReactNode[] = [];
		if (agg.weight != null) {
			items.push(
				<div key="w" style={{ ...lineStyle, color: COLOR.weight }}>
					{ICON.weight} {agg.weight}kg
				</div>,
			);
		}
		if (agg.dietCount > 0) {
			items.push(
				<div key="d" style={{ ...lineStyle, color: COLOR.diet }}>
					{ICON.diet} {agg.dietCount}
				</div>,
			);
		}
		if (agg.toiletCount > 0) {
			items.push(
				<div
					key="t"
					style={{
						...lineStyle,
						color: agg.toiletAbnormal > 0 ? COLOR.danger : COLOR.toilet,
					}}
				>
					{ICON.toilet} {agg.toiletCount}
					{agg.toiletAbnormal > 0 ? <> {ICON.danger}</> : null}
				</div>,
			);
		}
		if (agg.symptomCount > 0) {
			items.push(
				<div
					key="s"
					style={{
						...lineStyle,
						color: agg.symptomSevere > 0 ? COLOR.danger : COLOR.symptom,
					}}
				>
					{ICON.symptom} {agg.symptomCount}
					{agg.symptomSevere > 0 ? <> {ICON.danger}</> : null}
				</div>,
			);
		}

		if (items.length === 0) return null;

		// 精簡模式（mobile / 非全屏）：以小圓點呈現避免溢位
		if (isMobile) {
			const dots = [
				agg.weight != null ? COLOR.weight : null,
				agg.dietCount > 0 ? COLOR.diet : null,
				agg.toiletCount > 0
					? agg.toiletAbnormal > 0
						? COLOR.danger
						: COLOR.toilet
					: null,
				agg.symptomCount > 0
					? agg.symptomSevere > 0
						? COLOR.danger
						: COLOR.symptom
					: null,
			].filter(Boolean) as string[];
			return (
				<div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 2 }}>
					{dots.map((c, i) => (
						<span
							key={i}
							style={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								background: c,
								display: "inline-block",
							}}
						/>
					))}
				</div>
			);
		}

		return <div>{items}</div>;
	};

	// ── 自訂行事曆標題列（前後月 / 月選擇 / 今天）──
	const headerRender = () => (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "center",
				gap: 12,
				padding: "8px 0 16px",
			}}
		>
			<Space>
				<Button
					icon={<LeftOutlined />}
					onClick={() => setValue(value.subtract(1, "month"))}
				/>
				<DatePicker
					picker="month"
					value={value}
					onChange={(d) => d && setValue(d)}
					allowClear={false}
				/>
				<Button
					icon={<RightOutlined />}
					onClick={() => setValue(value.add(1, "month"))}
				/>
			</Space>
			<Tooltip title="回到本月">
				<Button onClick={() => setValue(dayjs())}>今天</Button>
			</Tooltip>
		</div>
	);

	return (
		<div>
			<Title level={3}>
				<CalendarOutlined /> 健康行事曆
			</Title>

			<HealthSubjectSelector value={petId} onChange={setPetId} />

			{/* 圖例 */}
			<Card size="small" style={{ marginBottom: 16 }}>
				<Space size={[16, 4]} wrap>
					<span style={{ color: COLOR.weight }}>{ICON.weight} 體重</span>
					<span style={{ color: COLOR.diet }}>{ICON.diet} 飲食</span>
					<span style={{ color: COLOR.toilet }}>{ICON.toilet} 如廁</span>
					<span style={{ color: COLOR.symptom }}>{ICON.symptom} 症狀</span>
					<span style={{ color: COLOR.danger }}>{ICON.danger} 異常 / 嚴重</span>
				</Space>
			</Card>

			<Card>
				<Spin spinning={loading}>
					<Calendar
						fullscreen={!isMobile}
						value={value}
						headerRender={headerRender}
						cellRender={renderCell}
						onPanelChange={(d) => setValue(d)}
						onSelect={(d, { source }) => {
							if (source === "date") {
								setValue(d);
								setDrawerDate(d);
							}
						}}
					/>
				</Spin>
			</Card>

			<DayDetailDrawer
				date={drawerDate}
				records={records}
				onClose={() => setDrawerDate(null)}
			/>
		</div>
	);
};

// ── 當日詳情抽屜 ──

const DayDetailDrawer: React.FC<{
	date: Dayjs | null;
	records: MonthRecords;
	onClose: () => void;
}> = ({ date, records, onClose }) => {
	const key = date ? date.format("YYYY-MM-DD") : null;

	const dayWeight = key ? records.weight.filter((r) => dayKey(r.date) === key) : [];
	const dayDiet = key ? records.diet.filter((r) => dayKey(r.date) === key) : [];
	const dayToilet = key ? records.toilet.filter((r) => dayKey(r.date) === key) : [];
	const daySymptom = key ? records.symptom.filter((r) => dayKey(r.date) === key) : [];

	const isEmpty =
		dayWeight.length === 0 &&
		dayDiet.length === 0 &&
		dayToilet.length === 0 &&
		daySymptom.length === 0;

	return (
		<Drawer
			title={date ? `${date.format("YYYY-MM-DD (ddd)")} 健康紀錄` : ""}
			open={!!date}
			onClose={onClose}
			width={Math.min(420, typeof window !== "undefined" ? window.innerWidth : 420)}
		>
			{isEmpty ? (
				<Empty description="當日無任何健康紀錄" />
			) : (
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					{/* 體重 */}
					<Section color={COLOR.weight} icon={ICON.weight} title="體重">
						{dayWeight.length === 0 ? (
							<EmptyLine />
						) : (
							dayWeight.map((r) => (
								<div key={r.id} style={{ marginBottom: 4 }}>
									<Text strong>{r.weight} kg</Text>
									{r.height != null && <Text type="secondary">　身高 {r.height} cm</Text>}
									{r.bmi != null && <Text type="secondary">　BMI {r.bmi}</Text>}
									{r.body_fat != null && <Text type="secondary">　體脂 {r.body_fat}%</Text>}
									{r.note && (
										<div>
											<Text type="secondary">備註：{r.note}</Text>
										</div>
									)}
								</div>
							))
						)}
					</Section>

					{/* 飲食 */}
					<Section color={COLOR.diet} icon={ICON.diet} title={`飲食（${dayDiet.length}）`}>
						{dayDiet.length === 0 ? (
							<EmptyLine />
						) : (
							dayDiet.map((r) => (
								<div key={r.id} style={{ marginBottom: 6 }}>
									<Tag color={MEAL_TYPE_MAP[r.meal_type as MealType]?.color}>
										{MEAL_TYPE_MAP[r.meal_type as MealType]?.label ?? r.meal_type}
									</Tag>
									<Text strong>{r.food_name}</Text>
									{r.amount && <Text type="secondary">　{r.amount}</Text>}
									{r.calories != null && (
										<Text type="secondary">　{r.calories} kcal</Text>
									)}
									{r.note && (
										<div>
											<Text type="secondary">備註：{r.note}</Text>
										</div>
									)}
								</div>
							))
						)}
					</Section>

					{/* 如廁 */}
					<Section color={COLOR.toilet} icon={ICON.toilet} title={`如廁（${dayToilet.length}）`}>
						{dayToilet.length === 0 ? (
							<EmptyLine />
						) : (
							dayToilet.map((r) => (
								<div key={r.id} style={{ marginBottom: 6 }}>
									<Text type="secondary">{r.time}　</Text>
									<Tag color={TOILET_TYPE_MAP[r.type as ToiletType]?.color}>
										{TOILET_TYPE_MAP[r.type as ToiletType]?.label ?? r.type}
									</Tag>
									<Tag color={r.is_normal ? "green" : "red"}>
										{r.is_normal ? "正常" : "異常"}
									</Tag>
									{r.note && <Text type="secondary">{r.note}</Text>}
								</div>
							))
						)}
					</Section>

					{/* 症狀 */}
					<Section color={COLOR.symptom} icon={ICON.symptom} title={`症狀（${daySymptom.length}）`}>
						{daySymptom.length === 0 ? (
							<EmptyLine />
						) : (
							daySymptom.map((r) => (
								<div key={r.id} style={{ marginBottom: 8 }}>
									<Text type="secondary">{r.time}　</Text>
									<Tag color={SYMPTOM_TYPE_MAP[r.symptom_type as SymptomType]?.color}>
										{SYMPTOM_TYPE_MAP[r.symptom_type as SymptomType]?.label ??
											r.symptom_type}
									</Tag>
									<Tag color={SEVERITY_MAP[r.severity as Severity]?.color}>
										{SEVERITY_MAP[r.severity as Severity]?.label ?? r.severity}
									</Tag>
									{r.is_recurring && <Tag color="volcano">反覆</Tag>}
									{r.body_part && <Text type="secondary">{r.body_part}　</Text>}
									<Text type="secondary">
										{r.frequency > 1 ? `×${r.frequency}` : ""}
										{r.duration_minutes != null ? ` ${r.duration_minutes}分` : ""}
									</Text>
									{r.description && (
										<div>
											<Text type="secondary">{r.description}</Text>
										</div>
									)}
								</div>
							))
						)}
					</Section>
				</Space>
			)}
		</Drawer>
	);
};

const Section: React.FC<{
	color: string;
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
}> = ({ color, icon, title, children }) => (
	<div>
		<div
			style={{
				borderLeft: `3px solid ${color}`,
				paddingLeft: 8,
				marginBottom: 8,
				fontWeight: 600,
			}}
		>
			{icon} {title}
		</div>
		<div style={{ paddingLeft: 11 }}>{children}</div>
	</div>
);

const EmptyLine: React.FC = () => <Text type="secondary">無紀錄</Text>;
