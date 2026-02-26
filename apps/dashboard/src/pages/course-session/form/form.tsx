import { useSelect } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Flex,
	Segmented,
	Divider,
	Select,
	DatePicker,
} from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateCourseSession,
	IUpdateCourseSession,
	ICourse,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

export const CourseSessionForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { query: courseQueryResult, selectProps: courseSelectProps } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
		optionLabel: "name",
		optionValue: "id",
	});
	const courseOptions = (courseQueryResult?.data?.data || []).map((c: ICourse) => ({
		label: `${c.school?.name ? `${c.school.name} - ` : ""}${c.name}`,
		value: c.id,
	}));

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateCourseSession | IUpdateCourseSession>
			{...props.formProps}
			layout="vertical"
			onFinish={(values) => {
				props.formProps.onFinish?.({
					...values,
					date: values.date
						? dayjs(values.date).format("YYYY-MM-DD")
						: undefined,
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
					label="課程"
					name="course_id"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						{...courseSelectProps}
						options={courseOptions}
						style={{ width: "200px" }}
						showSearch={false}
						placeholder="請選擇課程"
					/>
				</Form.Item>
				<Form.Item
					label="日期"
					name="date"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
					getValueProps={(value) => ({
						value: value ? dayjs(value) : undefined,
					})}
				>
					<DatePicker style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="實際上課人數"
					name="actual_student_count"
					className={styles.formItem}
				>
					<InputNumber min={0} style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="備註"
					name="note"
					className={styles.formItem}
				>
					<Input.TextArea rows={6} />
				</Form.Item>
				<Form.Item
					label="課程狀態"
					name="is_cancelled"
					initialValue={false}
					className={styles.formItem}
				>
					<Segmented
						block
						className={styles.segmented}
						options={[
							{
								label: "正常",
								value: false,
								className: "actice",
							},
							{
								label: "停課",
								value: true,
								className: "inactice",
							},
						]}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
