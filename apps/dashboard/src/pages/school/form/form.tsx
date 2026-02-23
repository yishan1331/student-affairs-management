import { type BaseKey, useApiUrl } from "@refinedev/core";
import { getValueFromEvent } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Upload,
	Button,
	Flex,
	Avatar,
	Segmented,
	Divider,
} from "antd";
import type { FormProps } from "antd";

import { UploadOutlined } from "@ant-design/icons";
import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import { ICreateSchool, IUpdateSchool } from "../../../common/types/models";

// 擴展 IMedicalCategoryUpdate 類型，添加 modifier_id
type FormValues = IUpdateSchool & {
	modifier_id?: number;
};

type Props = {
	formProps: FormProps<any>;
};

export const SchoolForm = (props: Props) => {
	const apiUrl = useApiUrl();
	const { styles, theme: themeStyles } = useStyles();
	const { user } = useUser();

	const images = Form.useWatch("images", props.formProps.form);
	const image = images?.[0] || null;
	const previewImageURL = image?.url || image?.response?.url;

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateSchool | IUpdateSchool>
			{...props.formProps}
			layout="vertical"
			onFinish={(values) => {
				props.formProps.onFinish?.({
					...values,
					modifier_id: user.id,
				});
			}}
		>
			<Flex vertical>
				<Form.Item
					label="學校名稱"
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
					label="學校編碼"
					name="code"
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
					label="地址"
					name="address"
					className={styles.formItem}
				>
					<Input.TextArea rows={2} />
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
