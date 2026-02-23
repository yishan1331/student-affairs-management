import { SaveButton, useDrawerForm, useSelect } from "@refinedev/antd";
import {
	type BaseKey,
	useApiUrl,
	useGetToPath,
	useGo,
	useParsed,
} from "@refinedev/core";
import { getValueFromEvent } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Upload,
	Grid,
	Button,
	Flex,
	Avatar,
	Segmented,
	Spin,
	Divider,
	Select,
} from "antd";

import { useSearchParams } from "react-router";
import { CustomDrawer } from "../../../components/drawer";
import { UploadOutlined } from "@ant-design/icons";
import { ICourse, ISchool, IUpdateCourse } from "../../../common/types/models";
import { useStyles } from "../editStyled";
import { useDrawerClose } from "../../../hooks/useDrawerClose";
import { useGlobalNotification } from "../../../hooks/useGlobalNotification";
import { useUser } from "../../../contexts/userContext";

type Props = {
	id?: BaseKey;
	action: "create" | "edit";
	onClose?: () => void;
	onMutationSuccess?: () => void;
};

export const CourseDrawerForm = (props: Props) => {
	const { id } = useParsed();
	const apiUrl = useApiUrl();
	const breakpoint = Grid.useBreakpoint();
	const { styles, theme: themeStyles } = useStyles();
	const { success } = useGlobalNotification();
	const { user } = useUser();

	const { drawerProps, formProps, close, saveButtonProps, formLoading } =
		useDrawerForm<IUpdateCourse>({
			resource: "v1/course",
			id,
			action: props.action,
			redirect: false,
			onMutationSuccess: () => {
				success(
					`${props.action === "edit" ? "修改" : "新增"}成功`,
					`課程已成功${props.action === "edit" ? "更新" : "新增"}`
				);
				handleDrawerClose();
			},
			successNotification: false,
			errorNotification: false,
			meta: {
				auditLog: {
					permissions: ["course:update"],
				},
			},
		});

	const { handleDrawerClose } = useDrawerClose({
		onClose: props?.onClose,
		close,
		resource: "course",
	});

	const images = Form.useWatch("images", formProps.form);
	const image = images?.[0] || null;
	const previewImageURL = image?.url || image?.response?.url;
	const title = props.action === "edit" ? null : "新增課程";

	const { selectProps: categorySelectProps } = useSelect<ISchool>({
		resource: "v1/school",
		optionLabel: "name",
		optionValue: "id",
	});

	return (
		<CustomDrawer
			{...drawerProps}
			open={true}
			title={title}
			width={breakpoint.sm ? "378px" : "100%"}
			zIndex={1001}
			onClose={handleDrawerClose}
		>
			<Spin spinning={formLoading}>
				<Form
					{...formProps}
					layout="vertical"
					onFinish={(values) => {
						formProps.onFinish?.({
							...values,
							modifier_id: user?.id,
						});
					}}
				>
					<Form.Item
						name="modifier_id"
						hidden
						initialValue={user?.id}
					/>
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
						<Flex
							align="center"
							justify="space-between"
							style={{
								padding: "16px 16px 0px 16px",
							}}
						>
							<Button onClick={handleDrawerClose}>取消</Button>
							<SaveButton
								{...saveButtonProps}
								type="primary"
								icon={null}
							>
								{props.action === "edit" ? "修改" : "新增"}
							</SaveButton>
						</Flex>
					</Flex>
				</Form>
			</Spin>
		</CustomDrawer>
	);
};
