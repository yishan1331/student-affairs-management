import { useState, useEffect } from "react";
import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { useParsed, useResource } from "@refinedev/core";
import { Card, List as AntList, Button, Modal, Input, Tag, Popconfirm, Space, Typography } from "antd";
import { UserAddOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";

import { IUpdatePet, IPet } from "../../common/types/models";
import { PetForm } from "./form/form";
import { ROUTE_RESOURCE, TOKEN_KEY } from "../../common/constants";
import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";
import apiClient from "../../services/api/apiClient";
import { getTokenPayload } from "../../providers/authProvider";
import { showMessage } from "../../utils/message";

export const PetEdit = () => {
	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "修改";

	const { formProps, saveButtonProps, query } = useForm<IUpdatePet>({
		resource: ROUTE_RESOURCE.pet,
		id,
		action: "edit",
		redirect: false,
		onMutationSuccess: () => {
			dataProcessingSuccess(action, resource?.meta?.label);
		},
		onMutationError: (error) => {
			console.error("Pet Edit Error:", error);
		},
		successNotification: false,
		errorNotification: false,
	});

	const record = query?.data?.data as IPet | undefined;

	// 共享成員管理 state
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [searchAccount, setSearchAccount] = useState("");
	const [searchResult, setSearchResult] = useState<{ id: number; username: string; email?: string } | null>(null);
	const [searching, setSearching] = useState(false);
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState<number | null>(null);
	const [petUsers, setPetUsers] = useState<IPet["petUsers"]>([]);

	// 當 record 載入後同步 petUsers
	useEffect(() => {
		if (record?.petUsers) {
			setPetUsers(record.petUsers);
		}
	}, [record?.petUsers]);

	// 取得當前使用者資訊
	const token = localStorage.getItem(TOKEN_KEY);
	const currentUser = token ? getTokenPayload(token) : null;
	const isAdmin = currentUser?.role === "admin";
	const isOwner = petUsers?.some(
		(pu) => pu.user_id === currentUser?.sub && pu.role === "owner"
	);
	const canManageMembers = isAdmin || isOwner;

	// 搜尋使用者
	const handleSearchUser = async () => {
		if (!searchAccount.trim()) return;
		setSearching(true);
		setSearchResult(null);
		try {
			const res = await apiClient.get("/v1/user/search", {
				params: { q: searchAccount.trim() },
			});
			const users = res.data?.data || res.data || [];
			if (users.length > 0) {
				setSearchResult(users[0]);
			} else {
				showMessage.warning("找不到該使用者");
			}
		} catch {
			showMessage.error("搜尋使用者失敗");
		} finally {
			setSearching(false);
		}
	};

	// 新增成員
	const handleAddMember = async () => {
		if (!searchResult || !id) return;
		setAdding(true);
		try {
			await apiClient.post(`/v1/pet/${id}/members`, {
				user_id: searchResult.id,
			});
			showMessage.success("已成功新增共享成員");
			setAddModalOpen(false);
			setSearchAccount("");
			setSearchResult(null);
			query?.refetch();
		} catch {
			showMessage.error("新增共享成員失敗");
		} finally {
			setAdding(false);
		}
	};

	// 移除成員
	const handleRemoveMember = async (userId: number) => {
		if (!id) return;
		setRemoving(userId);
		try {
			await apiClient.delete(`/v1/pet/${id}/members/${userId}`);
			showMessage.success("已成功移除共享成員");
			query?.refetch();
		} catch {
			showMessage.error("移除共享成員失敗");
		} finally {
			setRemoving(null);
		}
	};

	const title = `${action}${resource?.meta?.label}`;

	return (
		<Edit
			saveButtonProps={saveButtonProps}
			title={title}
			breadcrumb={
				<CustomBreadcrumb
					items={[
						{
							title: resource?.meta?.label || "",
							path: resource?.list?.toString(),
						},
						{
							title: title,
						},
					]}
				/>
			}
			headerButtons={<></>}
			footerButtons={({ saveButtonProps }) => (
				<>
					<SaveButton {...saveButtonProps} type="primary">
						儲存
					</SaveButton>
				</>
			)}
		>
			<PetForm formProps={{ ...formProps }} />

			{/* 共享成員管理區塊 */}
			{petUsers && (
				<Card
					title={
						<Space>
							<TeamOutlined />
							<span>共享成員</span>
						</Space>
					}
					style={{ marginTop: 24 }}
					extra={
						canManageMembers && (
							<Button
								type="primary"
								icon={<UserAddOutlined />}
								size="small"
								onClick={() => setAddModalOpen(true)}
							>
								新增成員
							</Button>
						)
					}
				>
					<AntList
						dataSource={petUsers}
						locale={{ emptyText: "尚無共享成員" }}
						renderItem={(item) => (
							<AntList.Item
								actions={
									canManageMembers && item.role !== "owner"
										? [
											<Popconfirm
												key="remove"
												title="確認移除此成員？"
												okText="確認"
												cancelText="取消"
												onConfirm={() => handleRemoveMember(item.user_id)}
											>
												<Button
													type="text"
													danger
													size="small"
													icon={<DeleteOutlined />}
													loading={removing === item.user_id}
												>
													移除
												</Button>
											</Popconfirm>,
										]
										: undefined
								}
							>
								<AntList.Item.Meta
									title={
										<Space>
											<span>{item.user.username}</span>
											<Tag color={item.role === "owner" ? "blue" : "green"}>
												{item.role === "owner" ? "擁有者" : "成員"}
											</Tag>
										</Space>
									}
									description={item.user.email || undefined}
								/>
							</AntList.Item>
						)}
					/>
				</Card>
			)}

			{/* 新增成員 Modal */}
			<Modal
				title="新增共享成員"
				open={addModalOpen}
				onCancel={() => {
					setAddModalOpen(false);
					setSearchAccount("");
					setSearchResult(null);
				}}
				footer={null}
			>
				<Space direction="vertical" style={{ width: "100%" }} size="middle">
					<Space.Compact style={{ width: "100%" }}>
						<Input
							placeholder="輸入使用者帳號搜尋"
							value={searchAccount}
							onChange={(e) => setSearchAccount(e.target.value)}
							onPressEnter={handleSearchUser}
						/>
						<Button
							type="primary"
							onClick={handleSearchUser}
							loading={searching}
						>
							搜尋
						</Button>
					</Space.Compact>

					{searchResult && (
						<Card size="small">
							<Space style={{ width: "100%", justifyContent: "space-between" }}>
								<span>
									<Typography.Text strong>{searchResult.username}</Typography.Text>
									{searchResult.email && (
										<Typography.Text type="secondary" style={{ marginLeft: 8 }}>
											{searchResult.email}
										</Typography.Text>
									)}
								</span>
								<Button
									type="primary"
									size="small"
									onClick={handleAddMember}
									loading={adding}
								>
									確認新增
								</Button>
							</Space>
						</Card>
					)}
				</Space>
			</Modal>
		</Edit>
	);
};
