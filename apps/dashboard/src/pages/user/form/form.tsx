import { useState } from "react";
import { Form, Input, Flex, Segmented, Select, Button, Modal } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";

import { useStyles } from "../editStyled";
import { ICreateUser, IUpdateUser } from "../../../common/types/models";
import { useGlobalNotification } from "../../../hooks/useGlobalNotification";
import apiClient from "../../../services/api/apiClient";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
	isEdit?: boolean;
	userId?: string | number;
};

const roleOptions = [
	{ label: "管理員", value: "admin" },
	{ label: "使用者", value: "user" },
	{ label: "訪客", value: "guest" },
];

export const UserForm = (props: Props) => {
	const { styles } = useStyles();
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [passwordForm] = Form.useForm();
	const [passwordLoading, setPasswordLoading] = useState(false);
	const { success, error } = useGlobalNotification();

	const handlePasswordUpdate = async () => {
		try {
			const values = await passwordForm.validateFields();
			setPasswordLoading(true);
			await apiClient.patch(`/${ROUTE_RESOURCE.user}/${props.userId}`, {
				password: values.newPassword,
			});
			success("密碼更新成功", "使用者密碼已成功更新");
			setPasswordModalOpen(false);
			passwordForm.resetFields();
		} catch (err: any) {
			if (err?.errorFields) return; // 表單驗證失敗，不需額外處理
			error("密碼更新失敗", err?.response?.data?.message || "請稍後再試");
		} finally {
			setPasswordLoading(false);
		}
	};

	return (
		<>
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
					{!props.isEdit && (
						<Form.Item
							label="密碼"
							name="password"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請輸入密碼",
								},
							]}
						>
							<Input.Password />
						</Form.Item>
					)}
					{props.isEdit && (
						<Form.Item label="密碼" className={styles.formItem}>
							<Button
								icon={<LockOutlined />}
								onClick={() => setPasswordModalOpen(true)}
							>
								更新密碼
							</Button>
						</Form.Item>
					)}
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

			<Modal
				title="更新密碼"
				open={passwordModalOpen}
				onCancel={() => {
					setPasswordModalOpen(false);
					passwordForm.resetFields();
				}}
				onOk={handlePasswordUpdate}
				okText="確認更新"
				cancelText="取消"
				confirmLoading={passwordLoading}
				destroyOnClose
			>
				<Form form={passwordForm} layout="vertical">
					<Form.Item
						label="新密碼"
						name="newPassword"
						rules={[
							{ required: true, message: "請輸入新密碼" },
							{ min: 6, message: "密碼至少需要6個字元" },
						]}
					>
						<Input.Password placeholder="請輸入新密碼" />
					</Form.Item>
					<Form.Item
						label="確認密碼"
						name="confirmPassword"
						dependencies={["newPassword"]}
						rules={[
							{ required: true, message: "請確認密碼" },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue("newPassword") === value) {
										return Promise.resolve();
									}
									return Promise.reject(new Error("兩次輸入的密碼不一致"));
								},
							}),
						]}
					>
						<Input.Password placeholder="請再次輸入新密碼" />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};
