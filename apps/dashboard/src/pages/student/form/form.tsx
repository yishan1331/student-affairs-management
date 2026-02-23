import { useSelect } from "@refinedev/antd";
import { Form, Input, Flex, Segmented, Select, Divider } from "antd";
import type { FormProps } from "antd";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateStudent,
	IUpdateStudent,
	ICourse,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

export const StudentForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { selectProps: courseSelectProps } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
		optionLabel: "name",
		optionValue: "id",
	});

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateStudent | IUpdateStudent>
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
					label="學生姓名"
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
					label="學號"
					name="number"
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
					label="性別"
					name="gender"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇性別"
						options={[
							{ label: "男", value: "male" },
							{ label: "女", value: "female" },
						]}
					/>
				</Form.Item>
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
						style={{ width: "200px" }}
						showSearch={false}
						placeholder="請選擇課程"
					/>
				</Form.Item>
				<Form.Item
					label="啟用狀態"
					name="is_active"
					className={styles.formItem}
					initialValue={true}
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
