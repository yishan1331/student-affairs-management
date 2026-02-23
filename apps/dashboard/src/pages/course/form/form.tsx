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

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateCourse,
	IUpdateCourse,
	ISchool,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

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
	});

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateCourse | IUpdateCourse>
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
					label="課程名稱"
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
					label="課程描述"
					name="description"
					className={styles.formItem}
					// rules={[
					// 	{
					// 		required: true,
					// 	},
					// ]}
				>
					<Input.TextArea rows={6} />
				</Form.Item>
				<Form.Item
					label="課程等級"
					name="grade"
					className={styles.formItem}
					// rules={[
					// 	{
					// 		required: true,
					// 	},
					// ]}
				>
					<Input.TextArea rows={6} />
				</Form.Item>
				<Form.Item
					label="課程開始時間"
					name="start_time"
					className={styles.formItem}
					// rules={[
					// 	{
					// 		required: true,
					// 		message: '請輸入排序',
					// 	},
					// ]}
				>
					<Input.TextArea rows={6} />
				</Form.Item>
				<Form.Item
					label="學校管理"
					name="school_id"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						{...categorySelectProps}
						style={{ width: "200px" }}
						showSearch={false}
						placeholder="請選擇學校"
					/>
				</Form.Item>
				<Form.Item
					label="排序"
					name="display_order"
					className={styles.formItem}
					initialValue={1}
					rules={[
						{
							required: true,
							message: "請輸入排序",
						},
					]}
				>
					<InputNumber />
				</Form.Item>
				<Form.Item
					label="啟用狀態"
					name="is_active"
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
