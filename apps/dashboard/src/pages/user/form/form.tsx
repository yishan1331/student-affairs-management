import { Form, Input, Flex, Segmented, Select } from "antd";
import type { FormProps } from "antd";

import { useStyles } from "../editStyled";
import { ICreateUser, IUpdateUser } from "../../../common/types/models";

type Props = {
	formProps: FormProps<any>;
	isEdit?: boolean;
};

const roleOptions = [
	{ label: "管理員", value: "admin" },
	{ label: "經理", value: "manager" },
	{ label: "職員", value: "staff" },
];

export const UserForm = (props: Props) => {
	const { styles } = useStyles();

	return (
		<Form<ICreateUser | IUpdateUser>
			{...props.formProps}
			layout="vertical"
		>
			<Flex vertical>
				{!props.isEdit && (
					<Form.Item
						label="帳號"
						name="account"
						className={styles.formItem}
						rules={[
							{
								required: true,
								message: "請輸入帳號",
							},
						]}
					>
						<Input />
					</Form.Item>
				)}
				<Form.Item
					label="密碼"
					name="password"
					className={styles.formItem}
					rules={[
						{
							required: !props.isEdit,
							message: "請輸入密碼",
						},
					]}
				>
					<Input.Password
						placeholder={props.isEdit ? "留空則不修改" : ""}
					/>
				</Form.Item>
				<Form.Item
					label="使用者名稱"
					name="username"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請輸入使用者名稱",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="角色"
					name="role"
					className={styles.formItem}
					rules={[
						{
							required: true,
							message: "請選擇角色",
						},
					]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇角色"
						options={roleOptions}
					/>
				</Form.Item>
				<Form.Item
					label="信箱"
					name="email"
					className={styles.formItem}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="狀態"
					name="status"
					className={styles.formItem}
					initialValue="active"
				>
					<Segmented
						block
						className={styles.segmented}
						options={[
							{
								label: "啟用",
								value: "active",
								className: "actice",
							},
							{
								label: "停用",
								value: "inactive",
								className: "inactice",
							},
						]}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
