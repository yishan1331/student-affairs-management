import { useSelect } from "@refinedev/antd";
import {
	Form,
	Flex,
	Divider,
	Select,
} from "antd";
import type { FormProps } from "antd";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateTeacherSalaryConfig,
	IUpdateTeacherSalaryConfig,
	ICourse,
	ISalaryBase,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

export const TeacherSalaryConfigForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	const { selectProps: courseSelectProps } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
		optionLabel: "name",
		optionValue: "id",
	});

	const { selectProps: salaryBaseSelectProps } = useSelect<ISalaryBase>({
		resource: ROUTE_RESOURCE.salaryBase,
		optionLabel: "name",
		optionValue: "id",
	});

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateTeacherSalaryConfig | IUpdateTeacherSalaryConfig>
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
					label="薪資基底"
					name="salary_base_id"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
				>
					<Select
						{...salaryBaseSelectProps}
						style={{ width: "200px" }}
						showSearch={false}
						placeholder="請選擇薪資基底"
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
