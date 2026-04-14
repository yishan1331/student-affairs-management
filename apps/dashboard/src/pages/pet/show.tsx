import { useState } from "react";
import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Tag, Alert, Typography, Card, List as AntList, Button, Modal, Input, Popconfirm, Space } from "antd";
import { UserAddOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { IPet, PetType } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE, PET_TYPE_MAP, PET_GENDER_MAP, TOKEN_KEY } from "../../common/constants";
import { DataSource } from "../../common/types/types";
import apiClient from "../../services/api/apiClient";
import { getTokenPayload } from "../../providers/authProvider";
import { showMessage } from "../../utils/message";

export const PetShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.pet,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as IPet;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.pet,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.pet,
		action: "delete",
	});

	// 共享成員管理 state
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [searchAccount, setSearchAccount] = useState("");
	const [searchResult, setSearchResult] = useState<{ id: number; username: string; email?: string } | null>(null);
	const [searching, setSearching] = useState(false);
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState<number | null>(null);

	// 取得當前使用者資訊
	const token = localStorage.getItem(TOKEN_KEY);
	const currentUser = token ? getTokenPayload(token) : null;
	const isAdmin = currentUser?.role === "admin";
	const isOwner = record?.petUsers?.some(
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
			query.refetch();
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
			query.refetch();
		} catch {
			showMessage.error("移除共享成員失敗");
		} finally {
			setRemoving(null);
		}
	};

	const dataSources: DataSource<IPet>[] = [
		{ label: "名稱", value: "name", type: "text" },
		{
			label: "種類",
			value: "type",
			type: "custom",
			render: () => {
				const t = record?.type ? PET_TYPE_MAP[record.type] : null;
				return t ? (
					<Tag color={t.color}>{t.label}</Tag>
				) : (
					<Typography.Text>{record?.type}</Typography.Text>
				);
			},
		},
		{
			label: "品種",
			value: "breed",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.breed || "-"}</Typography.Text>
			),
		},
		{
			label: "性別",
			value: "gender",
			type: "custom",
			render: () => {
				const g = record?.gender ? PET_GENDER_MAP[record.gender] : null;
				return g ? (
					<Tag color={g.color}>{g.label}</Tag>
				) : (
					<Typography.Text>-</Typography.Text>
				);
			},
		},
		{
			label: "生日",
			value: "birthday",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.birthday ? dayjs(record.birthday).format("YYYY-MM-DD") : "-"}
				</Typography.Text>
			),
		},
		{
			label: "體重 (kg)",
			value: "weight",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.weight ? record.weight.toFixed(2) : "-"}
				</Typography.Text>
			),
		},
		{
			label: "狀態",
			value: "is_active",
			type: "custom",
			render: () => (
				<Tag color={record?.is_active ? "success" : "default"}>
					{record?.is_active ? "啟用" : "停用"}
				</Tag>
			),
		},
		{
			label: "備註",
			value: "note",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.note || "-"}</Typography.Text>
			),
		},
		{
			label: "建立時間",
			value: "created_at",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.created_at ? dayjs(record.created_at).format("YYYY-MM-DD HH:mm") : "-"}
				</Typography.Text>
			),
		},
		{
			label: "修改時間",
			value: "updated_at",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.updated_at ? dayjs(record.updated_at).format("YYYY-MM-DD HH:mm") : "-"}
				</Typography.Text>
			),
		},
	];

	if (isError) {
		return (
			<Alert
				message="錯誤"
				description={error?.message || "載入資料時發生錯誤"}
				type="error"
				showIcon
			/>
		);
	}

	return (
		<Show
			isLoading={isFetching}
			title={`${resource?.meta?.label}資料`}
			canDelete={canDelete?.can}
			canEdit={canEdit?.can}
			breadcrumb={
				<CustomBreadcrumb
					items={[
						{
							title: resource?.meta?.label || "",
							path: resource?.list?.toString() || "",
						},
						{
							title: `${resource?.meta?.label}資料`,
						},
					]}
				/>
			}
			headerButtons={({
				deleteButtonProps,
				editButtonProps,
				refreshButtonProps,
			}) => (
				<CustomShowHeaderButtons
					deleteButtonProps={{
						...deleteButtonProps,
						successNotification: {
							message: "刪除成功",
							description: `${resource?.meta?.label}已成功刪除`,
							type: "success",
						},
						errorNotification: {
							message: "刪除失敗",
							description: `無法刪除${resource?.meta?.label}`,
							type: "error",
						},
					}}
					editButtonProps={editButtonProps}
					refreshButtonProps={{
						...refreshButtonProps,
						onClick: () => query.refetch(),
					}}
					resource={ROUTE_RESOURCE.pet}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />

			{/* 共享成員區塊 */}
			{record?.petUsers && (
				<Card
					title={
						<Space>
							<TeamOutlined />
							<span>共享成員</span>
						</Space>
					}
					style={{ marginTop: 16 }}
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
						dataSource={record.petUsers}
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
		</Show>
	);
};
