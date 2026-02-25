import React, { useEffect, useMemo, useState } from "react";
import {
	Card,
	Col,
	Row,
	Select,
	Input,
	Checkbox,
	Spin,
	Typography,
	Tooltip,
	Tag,
	Empty,
	Space,
	Button,
} from "antd";
import {
	ScheduleOutlined,
	SearchOutlined,
	ReloadOutlined,
} from "@ant-design/icons";
import { useGo } from "@refinedev/core";
import apiClient from "../../services/api/apiClient";
import { ISchool } from "../../common/types/models";
import { ICourse } from "../../common/types/models/course.types";
import { ROUTE_RESOURCE } from "../../common/constants";

const { Title, Text } = Typography;

interface IScheduleCourse extends ICourse {
	school: ISchool;
}

const DAY_MAP: Record<string, string> = {
	"1": "週一",
	"2": "週二",
	"3": "週三",
	"4": "週四",
	"5": "週五",
	"6": "週六",
	"7": "週日",
};

const DAY_OPTIONS = [
	{ label: "週一", value: "1" },
	{ label: "週二", value: "2" },
	{ label: "週三", value: "3" },
	{ label: "週四", value: "4" },
	{ label: "週五", value: "5" },
	{ label: "週六", value: "6" },
	{ label: "週日", value: "7" },
];

const SCHOOL_COLORS = [
	"#1677ff",
	"#52c41a",
	"#fa8c16",
	"#722ed1",
	"#eb2f96",
	"#13c2c2",
	"#faad14",
	"#2f54eb",
	"#f5222d",
	"#a0d911",
];

// 將 DateTime 轉為 HH:mm 格式的分鐘數
const timeToMinutes = (dateStr: string | Date): number => {
	const date = new Date(dateStr);
	return date.getHours() * 60 + date.getMinutes();
};

// 將分鐘數轉為 HH:mm 格式
const minutesToTime = (minutes: number): string => {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export const ScheduleList: React.FC = () => {
	const go = useGo();
	const [courses, setCourses] = useState<IScheduleCourse[]>([]);
	const [schools, setSchools] = useState<ISchool[]>([]);
	const [loading, setLoading] = useState(false);

	// 篩選狀態
	const [selectedSchool, setSelectedSchool] = useState<number | undefined>();
	const [selectedGrade, setSelectedGrade] = useState<number | undefined>();
	const [selectedDays, setSelectedDays] = useState<string[]>([
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
	]);
	const [searchName, setSearchName] = useState("");

	// 取得學校列表
	useEffect(() => {
		const fetchSchools = async () => {
			try {
				const res = await apiClient.get(
					`/${ROUTE_RESOURCE.school}?_start=0&_end=100`,
				);
				setSchools(res.data?.data || res.data || []);
			} catch {
				console.error("Failed to fetch schools");
			}
		};
		fetchSchools();
	}, []);

	// 取得課表資料
	const fetchSchedule = async () => {
		setLoading(true);
		try {
			const params: Record<string, any> = {};
			if (selectedSchool) params.school_id = selectedSchool;
			if (selectedGrade !== undefined) params.grade = selectedGrade;
			if (searchName) params.name = searchName;

			const res = await apiClient.get(`/${ROUTE_RESOURCE.course}/schedule`, {
				params,
			});
			setCourses(res.data?.data || res.data || []);
		} catch {
			console.error("Failed to fetch schedule");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSchedule();
	}, [selectedSchool, selectedGrade]);

	// 建立學校顏色映射
	const schoolColorMap = useMemo(() => {
		const map: Record<number, string> = {};
		const uniqueSchoolIds = [
			...new Set(courses.map((c) => c.school_id)),
		];
		uniqueSchoolIds.forEach((id, i) => {
			map[id] = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
		});
		return map;
	}, [courses]);

	// 根據搜尋和星期篩選課程
	const filteredCourses = useMemo(() => {
		return courses.filter((course) => {
			// 課程名稱篩選
			if (
				searchName &&
				!course.name
					.toLowerCase()
					.includes(searchName.toLowerCase())
			) {
				return false;
			}
			// 星期篩選：課程的 day_of_week (如 "1,3,5") 是否與選中的星期有交集
			if (selectedDays.length > 0) {
				const courseDays = course.day_of_week.split(",").map((d) => d.trim());
				const hasMatch = courseDays.some((d) => selectedDays.includes(d));
				if (!hasMatch) return false;
			}
			return true;
		});
	}, [courses, searchName, selectedDays]);

	// 計算時間軸範圍
	const timeRange = useMemo(() => {
		if (filteredCourses.length === 0) {
			return { min: 8 * 60, max: 18 * 60 }; // 預設 08:00 - 18:00
		}
		let min = Infinity;
		let max = -Infinity;
		filteredCourses.forEach((course) => {
			const start = timeToMinutes(course.start_time);
			const end = timeToMinutes(course.end_time);
			if (start < min) min = start;
			if (end > max) max = end;
		});
		// 向下取整到 30 分鐘、向上取整到 30 分鐘
		min = Math.floor(min / 30) * 30;
		max = Math.ceil(max / 30) * 30;
		return { min, max };
	}, [filteredCourses]);

	// 產生時間刻度
	const timeSlots = useMemo(() => {
		const slots: number[] = [];
		for (let t = timeRange.min; t <= timeRange.max; t += 30) {
			slots.push(t);
		}
		return slots;
	}, [timeRange]);

	// 將課程按星期分組
	const coursesByDay = useMemo(() => {
		const map: Record<string, IScheduleCourse[]> = {};
		selectedDays.forEach((d) => {
			map[d] = [];
		});
		filteredCourses.forEach((course) => {
			const courseDays = course.day_of_week.split(",").map((d) => d.trim());
			courseDays.forEach((d) => {
				if (map[d]) {
					map[d].push(course);
				}
			});
		});
		return map;
	}, [filteredCourses, selectedDays]);

	// 取得年級選項（從現有課程中擷取）
	const gradeOptions = useMemo(() => {
		const grades = [...new Set(courses.map((c) => c.grade))].sort(
			(a, b) => a - b,
		);
		return grades.map((g) => ({ label: `${g} 年級`, value: g }));
	}, [courses]);

	const totalMinutes = timeRange.max - timeRange.min;
	const ROW_HEIGHT_PER_30MIN = 48; // 每 30 分鐘的像素高度
	const gridHeight = (totalMinutes / 30) * ROW_HEIGHT_PER_30MIN;

	return (
		<div>
			<Title level={3}>
				<ScheduleOutlined /> 課表總覽
			</Title>

			{/* 篩選區 */}
			<Card style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} sm={12} md={6}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							學校
						</Text>
						<Select
							placeholder="全部學校"
							allowClear
							style={{ width: "100%" }}
							value={selectedSchool}
							onChange={setSelectedSchool}
							options={schools.map((s) => ({
								label: s.name,
								value: s.id,
							}))}
						/>
					</Col>
					<Col xs={24} sm={12} md={4}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							年級
						</Text>
						<Select
							placeholder="全部年級"
							allowClear
							style={{ width: "100%" }}
							value={selectedGrade}
							onChange={setSelectedGrade}
							options={gradeOptions}
						/>
					</Col>
					<Col xs={24} sm={12} md={8}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							課程搜尋
						</Text>
						<Input
							placeholder="搜尋課程名稱"
							prefix={<SearchOutlined />}
							allowClear
							value={searchName}
							onChange={(e) => setSearchName(e.target.value)}
							onPressEnter={fetchSchedule}
						/>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Text strong style={{ display: "block", marginBottom: 4 }}>
							&nbsp;
						</Text>
						<Button
							icon={<ReloadOutlined />}
							onClick={fetchSchedule}
						>
							重新載入
						</Button>
					</Col>
				</Row>
				<Row style={{ marginTop: 12 }}>
					<Col span={24}>
						<Text strong style={{ marginRight: 8 }}>
							顯示星期：
						</Text>
						<Checkbox.Group
							options={DAY_OPTIONS}
							value={selectedDays}
							onChange={(vals) => setSelectedDays(vals as string[])}
						/>
					</Col>
				</Row>
			</Card>

			{/* 學校圖例 */}
			{Object.keys(schoolColorMap).length > 0 && (
				<Card size="small" style={{ marginBottom: 16 }}>
					<Space wrap>
						<Text strong>學校圖例：</Text>
						{Object.entries(schoolColorMap).map(
							([schoolId, color]) => {
								const school = schools.find(
									(s) => s.id === Number(schoolId),
								);
								return (
									<Tag
										key={schoolId}
										color={color}
										style={{ fontSize: 13 }}
									>
										{school?.name || `學校 ${schoolId}`}
									</Tag>
								);
							},
						)}
					</Space>
				</Card>
			)}

			{/* 課表主體 */}
			{loading ? (
				<div style={{ textAlign: "center", padding: 60 }}>
					<Spin size="large" />
				</div>
			) : filteredCourses.length === 0 ? (
				<Card>
					<Empty description="目前沒有符合條件的課程" />
				</Card>
			) : (
				<Card bodyStyle={{ padding: 0, overflow: "auto" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: `80px repeat(${selectedDays.length}, 1fr)`,
							minWidth: selectedDays.length * 140 + 80,
						}}
					>
						{/* 表頭 */}
						<div
							style={{
								borderBottom: "2px solid #d9d9d9",
								borderRight: "1px solid #f0f0f0",
								padding: "12px 8px",
								textAlign: "center",
								fontWeight: 600,
								background: "#fafafa",
								position: "sticky",
								top: 0,
								zIndex: 2,
							}}
						>
							時間
						</div>
						{selectedDays.map((day) => (
							<div
								key={day}
								style={{
									borderBottom: "2px solid #d9d9d9",
									borderRight: "1px solid #f0f0f0",
									padding: "12px 8px",
									textAlign: "center",
									fontWeight: 600,
									background: "#fafafa",
									position: "sticky",
									top: 0,
									zIndex: 2,
								}}
							>
								{DAY_MAP[day]}
							</div>
						))}

						{/* 時間軸 + 課程格子 */}
						<div
							style={{
								borderRight: "1px solid #f0f0f0",
								position: "relative",
								height: gridHeight,
							}}
						>
							{timeSlots.map((slot) => (
								<div
									key={slot}
									style={{
										position: "absolute",
										top:
											((slot - timeRange.min) /
												totalMinutes) *
											gridHeight,
										left: 0,
										right: 0,
										padding: "2px 6px",
										fontSize: 12,
										color: "#8c8c8c",
										borderTop: "1px solid #f0f0f0",
										height: ROW_HEIGHT_PER_30MIN,
									}}
								>
									{minutesToTime(slot)}
								</div>
							))}
						</div>

						{selectedDays.map((day) => (
							<div
								key={day}
								style={{
									position: "relative",
									height: gridHeight,
									borderRight: "1px solid #f0f0f0",
								}}
							>
								{/* 格線 */}
								{timeSlots.map((slot) => (
									<div
										key={slot}
										style={{
											position: "absolute",
											top:
												((slot - timeRange.min) /
													totalMinutes) *
												gridHeight,
											left: 0,
											right: 0,
											height: ROW_HEIGHT_PER_30MIN,
											borderTop: "1px solid #f0f0f0",
										}}
									/>
								))}

								{/* 課程色塊 */}
								{coursesByDay[day]?.map((course) => {
									const startMin = timeToMinutes(
										course.start_time,
									);
									const endMin = timeToMinutes(
										course.end_time,
									);
									const top =
										((startMin - timeRange.min) /
											totalMinutes) *
										gridHeight;
									const height =
										((endMin - startMin) / totalMinutes) *
										gridHeight;
									const bgColor =
										schoolColorMap[course.school_id] ||
										"#1677ff";

									return (
										<Tooltip
											key={`${course.id}-${day}`}
											title={
												<div>
													<div>
														<b>{course.name}</b>
													</div>
													<div>
														學校：
														{course.school?.name}
													</div>
													<div>
														時間：
														{minutesToTime(
															startMin,
														)}{" "}
														~{" "}
														{minutesToTime(endMin)}
													</div>
													<div>
														時長：{course.duration}{" "}
														分鐘
													</div>
													<div>
														年級：{course.grade}
													</div>
												</div>
											}
										>
											<div
												onClick={() =>
													go({
														to: `/course/${course.id}`,
														type: "push",
													})
												}
												style={{
													position: "absolute",
													top: top + 1,
													left: 4,
													right: 4,
													height:
														Math.max(height - 2, 20),
													background: bgColor,
													borderRadius: 6,
													padding: "6px 10px",
													color: "#fff",
													fontSize: 14,
													lineHeight: "1.5",
													overflow: "hidden",
													cursor: "pointer",
													boxShadow:
														"0 1px 3px rgba(0,0,0,0.15)",
													transition:
														"transform 0.15s, box-shadow 0.15s",
													zIndex: 1,
													display: "flex",
													flexDirection: "column",
													justifyContent: "center",
													alignItems: "center",
													textAlign: "center",
												}}
												onMouseEnter={(e) => {
													(
														e.currentTarget as HTMLDivElement
													).style.transform =
														"scale(1.02)";
													(
														e.currentTarget as HTMLDivElement
													).style.boxShadow =
														"0 3px 8px rgba(0,0,0,0.25)";
												}}
												onMouseLeave={(e) => {
													(
														e.currentTarget as HTMLDivElement
													).style.transform =
														"scale(1)";
													(
														e.currentTarget as HTMLDivElement
													).style.boxShadow =
														"0 1px 3px rgba(0,0,0,0.15)";
												}}
											>
												<div
													style={{
														fontWeight: 600,
														overflow: "hidden",
														textOverflow:
															"ellipsis",
														width: "100%",
														textAlign: "center",
													}}
												>
													{course.name}
												</div>
												{height > 36 && (
													<div
														style={{
															fontSize: 13,
															opacity: 0.9,
															overflow: "hidden",
															textOverflow:
																"ellipsis",
															width: "100%",
															textAlign: "center",
														}}
													>
														{course.school?.name}
													</div>
												)}
												{height > 52 && (
													<div
														style={{
															fontSize: 12,
															opacity: 0.8,
															textAlign: "center",
														}}
													>
														{minutesToTime(
															startMin,
														)}
														~
														{minutesToTime(endMin)}
													</div>
												)}
											</div>
										</Tooltip>
									);
								})}
							</div>
						))}
					</div>
				</Card>
			)}
		</div>
	);
};
