import { useSelect } from "@refinedev/antd";
import { Form, Flex, Select, DatePicker } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateAttendance,
	IUpdateAttendance,
	AttendanceStatus,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

const statusOptions = [
	{ label: "出席", value: AttendanceStatus.attendance },
	{ label: "缺席", value: AttendanceStatus.absent },
	{ label: "遲到", value: AttendanceStatus.late },
	{ label: "請假", value: AttendanceStatus.excused },
];

export const AttendanceForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { selectProps: studentSelectProps } = useSelect({
		resource: ROUTE_RESOURCE.student,
		optionLabel: "name",
		optionValue: "id",
	});

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateAttendance | IUpdateAttendance>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				props.formProps.onFinish?.({
					...values,
					date: values.date
						? dayjs(values.date).format("YYYY-MM-DD")
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
					label="出勤狀態"
					name="status"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇出勤狀態"
						options={statusOptions}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
