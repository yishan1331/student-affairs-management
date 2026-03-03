import { useLogin } from "@refinedev/core";
import { Row, Col, Card, Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";

import { LoginLogoIcon } from "../../components/icons";
import { useGlobalMessage } from "../../hooks/useGlobalMessage";
import { showMessage } from "../../utils/message";

// 檢查是否為測試環境
const isTestEnvironment = import.meta.env.MODE !== "production";

export const LoginPage: React.FC = () => {
	const [form] = Form.useForm();
	const { mutate: login, isLoading } = useLogin();
	const { contextHolder } = useGlobalMessage();

	// 檢查權限過期標記
	useEffect(() => {
		const authExpired = localStorage.getItem("auth_expired");
		if (authExpired === "true") {
			showMessage.warning("權限已過期，請重新登入");
			// 清除標記，避免重複顯示
			localStorage.removeItem("auth_expired");
		}
	}, []);

	const onFinish = async (values: { username: string; password: string }) => {
		const result = await login(values);
		console.log("🚀 -> result ", result);
	};

	return (
		<div
			style={{
				height: "100vh",
				backgroundImage: 'url("/images/astrid.jpg")',
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{contextHolder}
			<style>
				{`
					.ant-input-password-icon {
						color: #4a5568 !important;
					}
					.ant-input-password-icon:hover {
						color: #2d3748 !important;
					}
				`}
			</style>
			<Row
				justify="center"
				align="middle"
				style={{
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.4)",
				}}
			>
				<Col xs={22} sm={16} md={12} lg={8} xl={6}>
					<Card
						style={{
							boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
							borderRadius: "16px",
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							backdropFilter: "blur(10px)",
							border: "1px solid rgba(255, 255, 255, 0.2)",
						}}
					>
						<div
							style={{
								textAlign: "center",
								width: "100%",
							}}
						>
							<div style={{ width: "100%" }}>
								{/* <LoginLogoIcon width={200} height={50} /> */}
							</div>
						</div>
						<Form
							form={form}
							layout="vertical"
							onFinish={onFinish}
							initialValues={{
								remember: true,
							}}
						>
							<Form.Item
								name="username"
								initialValue={
									isTestEnvironment
										? "admin@example.com"
										: undefined
								}
								rules={[
									{
										required: true,
										message: "請輸入帳號",
									},
								]}
							>
								<Input
									prefix={
										<UserOutlined
											style={{ color: "#4a5568" }}
										/>
									}
									placeholder="帳號"
									size="large"
									style={{
										borderRadius: "8px",
										height: "45px",
										backgroundColor:
											"rgba(255, 255, 255, 0.9)",
										border: "1px solid #e2e8f0",
										color: "#2d3748",
									}}
								/>
							</Form.Item>
							<Form.Item
								name="password"
								initialValue={
									isTestEnvironment ? "admin@1234" : undefined
								}
								rules={[
									{
										required: true,
										message: "請輸入密碼",
									},
								]}
							>
								<Input.Password
									prefix={
										<LockOutlined
											style={{ color: "#4a5568" }}
										/>
									}
									placeholder="密碼"
									size="large"
									style={{
										borderRadius: "8px",
										height: "45px",
										backgroundColor:
											"rgba(255, 255, 255, 0.9)",
										border: "1px solid #e2e8f0",
										color: "#2d3748",
									}}
								/>
							</Form.Item>
							<Form.Item>
								<Button
									type="primary"
									size="large"
									htmlType="submit"
									loading={isLoading}
									block
									style={{
										height: "45px",
										borderRadius: "8px",
										backgroundColor: "#FC6627",
										border: "none",
										fontSize: "16px",
										fontWeight: 500,
										boxShadow:
											"0 4px 12px rgba(252, 102, 39, 0.3)",
									}}
								>
									登入
								</Button>
							</Form.Item>
						</Form>
					</Card>
				</Col>
			</Row>
		</div>
	);
};
