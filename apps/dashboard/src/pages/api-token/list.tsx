import { useEffect, useState } from "react";
import {
	Button,
	Card,
	Form,
	Input,
	InputNumber,
	Modal,
	Space,
	Table,
	Tag,
	Typography,
	Alert,
	Popconfirm,
	Grid,
} from "antd";
import { CopyOutlined, KeyOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { apiClient } from "../../services/api";
import { showMessage } from "../../utils/message";
import { TOKEN_KEY } from "../../common/constants";
import { getTokenPayload } from "../../providers/authProvider";

interface ApiTokenOwner {
	id: number;
	account: string;
	username: string;
	role: string;
}

interface ApiTokenItem {
	id: number;
	name: string;
	last_used_at: string | null;
	expires_at: string | null;
	revoked_at: string | null;
	created_at: string;
	user_id?: number;
	user?: ApiTokenOwner;
}

interface CreatedToken {
	id: number;
	name: string;
	token: string;
	expires_at: string | null;
}

const formatDate = (v: string | null) => (v ? new Date(v).toLocaleString() : "-");

export const ApiTokenList = () => {
	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;
	const currentUser = (() => {
		const token = localStorage.getItem(TOKEN_KEY);
		return token ? getTokenPayload(token) : null;
	})();
	const isAdmin = currentUser?.role === "admin";
	const [tokens, setTokens] = useState<ApiTokenItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [created, setCreated] = useState<CreatedToken | null>(null);
	const [form] = Form.useForm<{ name: string; expires_in_days?: number }>();

	const fetchTokens = async () => {
		setLoading(true);
		try {
			const res = await apiClient.get("/v1/api-token");
			setTokens(res.data?.data || []);
		} catch {
			// 錯誤訊息由 interceptor 處理
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTokens();
	}, []);

	const handleCreate = async (values: { name: string; expires_in_days?: number }) => {
		try {
			const res = await apiClient.post("/v1/api-token", values);
			setCreated(res.data?.data);
			setModalOpen(false);
			form.resetFields();
			fetchTokens();
		} catch {
			// handled by interceptor
		}
	};

	const handleRevoke = async (id: number) => {
		try {
			await apiClient.delete(`/v1/api-token/${id}`);
			showMessage.success("已撤銷");
			fetchTokens();
		} catch {
			// handled
		}
	};

	const copyToken = () => {
		if (!created) return;
		navigator.clipboard.writeText(created.token);
		showMessage.success("已複製到剪貼簿");
	};

	const statusTag = (record: ApiTokenItem) => {
		if (record.revoked_at) return <Tag color="red">已撤銷</Tag>;
		if (record.expires_at && new Date(record.expires_at) < new Date()) {
			return <Tag color="orange">已過期</Tag>;
		}
		return <Tag color="green">啟用中</Tag>;
	};

	return (
		<Card
			title={
				<Space>
					<KeyOutlined />
					<span>個人存取權杖</span>
				</Space>
			}
			extra={
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setModalOpen(true)}
				>
					新增權杖
				</Button>
			}
		>
			<Alert
				style={{ marginBottom: 16 }}
				type="info"
				showIcon
				message="用於 iOS 捷徑或腳本存取特定 API（例如 /v1/ingest/weight）。權杖僅在建立當下顯示一次，請立即複製保存。"
			/>

			<Table<ApiTokenItem>
				dataSource={tokens}
				rowKey="id"
				loading={loading}
				pagination={false}
				scroll={{ x: "max-content" }}
				size={isMobile ? "small" : "middle"}
			>
				<Table.Column<ApiTokenItem> dataIndex="name" title="名稱" />
				{isAdmin && (
					<Table.Column<ApiTokenItem>
						title="擁有者"
						render={(_, record) =>
							record.user
								? `${record.user.username} (${record.user.account})`
								: "-"
						}
					/>
				)}
				<Table.Column<ApiTokenItem>
					title="狀態"
					render={(_, record) => statusTag(record)}
				/>
				<Table.Column<ApiTokenItem>
					dataIndex="last_used_at"
					title="最後使用"
					render={(v) => formatDate(v)}
				/>
				<Table.Column<ApiTokenItem>
					dataIndex="expires_at"
					title="到期時間"
					render={(v) => (v ? formatDate(v) : "永久")}
				/>
				<Table.Column<ApiTokenItem>
					dataIndex="created_at"
					title="建立時間"
					render={(v) => formatDate(v)}
				/>
				<Table.Column<ApiTokenItem>
					title="操作"
					render={(_, record) =>
						record.revoked_at ? null : (
							<Popconfirm
								title="確認撤銷此權杖？"
								description="撤銷後使用此權杖的自動化將立即失效"
								okText="撤銷"
								cancelText="取消"
								okType="danger"
								onConfirm={() => handleRevoke(record.id)}
							>
								<Button danger size="small" icon={<DeleteOutlined />}>
									撤銷
								</Button>
							</Popconfirm>
						)
					}
				/>
			</Table>

			<Modal
				open={modalOpen}
				title="新增個人存取權杖"
				onCancel={() => {
					setModalOpen(false);
					form.resetFields();
				}}
				onOk={() => form.submit()}
				okText="建立"
				cancelText="取消"
			>
				<Form form={form} layout="vertical" onFinish={handleCreate}>
					<Form.Item
						label="名稱"
						name="name"
						rules={[{ required: true, message: "請輸入名稱" }]}
					>
						<Input placeholder="例如：iPhone 健康體重同步" maxLength={50} />
					</Form.Item>
					<Form.Item
						label="有效天數（留空為永久）"
						name="expires_in_days"
					>
						<InputNumber
							style={{ width: "100%" }}
							min={1}
							max={3650}
							placeholder="例如 365"
						/>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				open={!!created}
				title="權杖建立成功"
				footer={[
					<Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyToken}>
						複製權杖
					</Button>,
					<Button key="close" onClick={() => setCreated(null)}>
						我已保存
					</Button>,
				]}
				onCancel={() => setCreated(null)}
			>
				<Alert
					type="warning"
					showIcon
					style={{ marginBottom: 12 }}
					message="這是唯一一次看到完整權杖的機會，請立即複製並安全保存。"
				/>
				<Typography.Paragraph
					copyable={{ text: created?.token }}
					code
					style={{ wordBreak: "break-all", marginBottom: 0 }}
				>
					{created?.token}
				</Typography.Paragraph>
			</Modal>
		</Card>
	);
};
