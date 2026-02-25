import { useSelect } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Flex,
	Divider,
	Select,
	TimePicker,
	Checkbox,
} from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateCourse,
	IUpdateCourse,
	ISchool,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

const DAY_OF_WEEK_OPTIONS = [
	{ label: "週一", value: "1" },
	{ label: "週二", value: "2" },
	{ label: "週三", value: "3" },
	{ label: "週四", value: "4" },
	{ label: "週五", value: "5" },
	{ label: "週六", value: "6" },
	{ label: "週日", value: "7" },
];

type Props = {
	formProps: FormProps<any>;
};

export const CourseForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { selectProps: categorySelectProps } = useSelect<ISchool>({
		resource: ROUTE_RESOURCE.school,
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
	});

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateCourse | IUpdateCourse>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				const submitValues = {
					...values,
					modifier_id: user.id,
					start_time: values.start_time
						? dayjs(values.start_time).toISOString()
						: undefined,
					end_time: values.end_time
						? dayjs(values.end_time).toISOString()
						: undefined,
					day_of_week: Array.isArray(values.day_of_week)
						? values.day_of_week.join(",")
						: values.day_of_week,
				};
				props.formProps.onFinish?.(submitValues);
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
					label="課程名稱"
					name="name"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請輸入課程名稱",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="課程描述"
					name="description"
					className={styles.formItem}
				>
					<Input.TextArea rows={3} />
				</Form.Item>
				<Form.Item
					label="學校"
					name="school_id"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請選擇學校",
						},
					]}
				>
					<Select
						{...categorySelectProps}
						style={{ width: "100%" }}
						showSearch={false}
						placeholder="請選擇學校"
					/>
				</Form.Item>
				<Form.Item
					label="年級"
					name="grade"
					className={styles.formItem}
				>
					<InputNumber
						min={1}
						style={{ width: "100%" }}
						placeholder="請輸入年級"
					/>
				</Form.Item>
				<Form.Item
					label="上課星期"
					name="day_of_week"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請選擇上課星期",
						},
					]}
					getValueFromEvent={(val: string[]) => val}
					getValueProps={(val: string) => ({
						value:
							typeof val === "string"
								? val.split(",").map((d: string) => d.trim())
								: val,
					})}
				>
					<Checkbox.Group options={DAY_OF_WEEK_OPTIONS} />
				</Form.Item>
				<Form.Item
					label="開始時間"
					name="start_time"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請選擇開始時間",
						},
					]}
					getValueProps={(val: string) => ({
						value: val ? dayjs(val) : undefined,
					})}
				>
					<TimePicker
						format="HH:mm"
						style={{ width: "100%" }}
						placeholder="請選擇開始時間"
					/>
				</Form.Item>
				<Form.Item
					label="結束時間"
					name="end_time"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請選擇結束時間",
						},
					]}
					getValueProps={(val: string) => ({
						value: val ? dayjs(val) : undefined,
					})}
				>
					<TimePicker
						format="HH:mm"
						style={{ width: "100%" }}
						placeholder="請選擇結束時間"
					/>
				</Form.Item>
				<Form.Item
					label="課程時長（分鐘）"
					name="duration"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請輸入課程時長",
						},
					]}
				>
					<InputNumber
						min={1}
						style={{ width: "100%" }}
						placeholder="請輸入課程時長（分鐘）"
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
