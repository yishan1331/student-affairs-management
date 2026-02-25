import { useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Flex, DatePicker } from "antd";
import type { FormProps } from "antd";
import { Select } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import { ICreateGradeSheet, IUpdateGradeSheet } from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

export const GradeSheetForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { selectProps: studentSelectProps } = useSelect({
		resource: ROUTE_RESOURCE.student,
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
	});

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateGradeSheet | IUpdateGradeSheet>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				props.formProps.onFinish?.({
					...values,
					exam_date: values.exam_date
						? dayjs(values.exam_date).format("YYYY-MM-DD")
						: undefined,
					modifier_id: user.id,
				});
			}}
		>
			<Flex vertical>
				<Form.Item
					label="學生"
					name="student_id"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						{...studentSelectProps}
						style={{ width: "200px" }}
						showSearch={false}
						placeholder="請選擇學生"
					/>
				</Form.Item>
				<Form.Item
					label="分數"
					name="score"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<InputNumber min={0} max={100} style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="描述"
					name="description"
					className={styles.formItem}
				>
					<Input.TextArea rows={4} />
				</Form.Item>
				<Form.Item
					label="考試日期"
					name="exam_date"
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
			</Flex>
		</Form>
	);
};
