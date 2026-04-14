import { useSelect } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Flex,
	Segmented,
	Divider,
	Select,
} from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateSalaryBase,
	IUpdateSalaryBase,
	ISchool,
	ICourse,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const formatCourseLabel = (c: ICourse) => {
	const schoolName = c.school?.name ? `${c.school.name} · ` : "";
	const dayNum = Number((c.day_of_week ?? "").split(",")[0]);
	const dayLabel = dayNum >= 1 && dayNum <= 7
		? `週${WEEKDAY_LABELS[dayNum % 7]}`
		: "";
	const timeLabel = c.start_time ? dayjs(c.start_time).format("HH:mm") : "";
	const suffix = [dayLabel, timeLabel].filter(Boolean).join(" ");
	return `${schoolName}${c.name}${suffix ? ` (${suffix})` : ""}`;
};

type Props = {
	formProps: FormProps<any>;
};

export const SalaryBaseForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { selectProps: schoolSelectProps } = useSelect<ISchool>({
		resource: ROUTE_RESOURCE.school,
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
	});

	const { queryResult: courseQueryResult } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
		optionLabel: "name",
		optionValue: "id",
		pagination: { mode: "off" },
	});

	const courseOptions = (courseQueryResult?.data?.data ?? []).map((c) => ({
		label: formatCourseLabel(c),
		value: c.id,
	}));

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateSalaryBase | IUpdateSalaryBase>
			{...props.formProps}
			layout="vertical"
			onFinish={(values) => {
				props.formProps.onFinish?.({
					...values,
					modifier_id: user.id,
				});
			}}
		>
			<Divider
				style={{
					margin: 0,
					padding: 0,
				}}
			/>
			<Flex vertical>
				<Form.Item
					label="薪資級距名稱"
					name="name"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="適用學校"
					name="school_ids"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請至少選擇一間學校",
						},
					]}
				>
					<Select
						{...schoolSelectProps}
						mode="multiple"
						style={{ width: "100%" }}
						showSearch={false}
						placeholder="請選擇適用學校（可多選）"
					/>
				</Form.Item>
				<Form.Item
					label="適用課程"
					name="course_ids"
					className={styles.formItem}
					tooltip="綁定特定課程時，此薪資級距將優先於「適用學校」的通用薪資；留空則對學校內所有課程生效"
				>
					<Select
						mode="multiple"
						style={{ width: "100%" }}
						options={courseOptions}
						loading={courseQueryResult?.isLoading}
						optionFilterProp="label"
						placeholder="（選填）綁定特定課程（可多選）"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					label="時薪"
					name="hourly_rate"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<InputNumber min={0} style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="最少人數"
					name="min_students"
					className={styles.formItem}
					tooltip="留空表示固定薪資（不依人數計算）"
				>
					<InputNumber min={0} style={{ width: "200px" }} placeholder="留空為固定薪資" />
				</Form.Item>
				<Form.Item
					label="最多人數"
					name="max_students"
					className={styles.formItem}
					tooltip="留空表示無上限"
				>
					<InputNumber min={0} style={{ width: "200px" }} placeholder="留空為無上限" />
				</Form.Item>
				<Form.Item
					label="描述"
					name="description"
					className={styles.formItem}
				>
					<Input.TextArea rows={6} />
				</Form.Item>
				<Form.Item
					label="啟用狀態"
					name="is_active"
					initialValue={true}
					className={styles.formItem}
				>
					<Segmented
						block
						className={styles.segmented}
						options={[
							{
								label: "啟用",
								value: true,
								className: "actice",
							},
							{
								label: "未啟用",
								value: false,
								className: "inactice",
							},
						]}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
