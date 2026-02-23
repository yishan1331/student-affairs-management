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
	ICreateSalaryBase,
	IUpdateSalaryBase,
	ISchool,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

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
	});

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
					label="薪資基底名稱"
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
					label="學校"
					name="school_id"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						{...schoolSelectProps}
						style={{ width: "200px" }}
						showSearch={false}
						placeholder="請選擇學校"
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
