import { SaveButton, useDrawerForm, useSelect } from "@refinedev/antd";
import {
	type BaseKey,
	useParsed,
} from "@refinedev/core";
import {
	Form,
	Input,
	InputNumber,
	Grid,
	Button,
	Flex,
	Spin,
	Divider,
	Select,
	TimePicker,
	Checkbox,
} from "antd";
import dayjs from "dayjs";

import { CustomDrawer } from "../../../components/drawer";
import { ISchool, IUpdateCourse } from "../../../common/types/models";

const DAY_OF_WEEK_OPTIONS = [
	{ label: "週一", value: "1" },
	{ label: "週二", value: "2" },
	{ label: "週三", value: "3" },
	{ label: "週四", value: "4" },
	{ label: "週五", value: "5" },
	{ label: "週六", value: "6" },
	{ label: "週日", value: "7" },
];
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
	const breakpoint = Grid.useBreakpoint();
	const { styles } = useStyles();
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

	const title = props.action === "edit" ? null : "新增課程";

	const { selectProps: categorySelectProps } = useSelect<ISchool>({
		resource: "v1/school",
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
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
					onFinish={(values: any) => {
						const submitValues = {
							...values,
							modifier_id: user?.id,
							start_time: values.start_time
								? dayjs(values.start_time).toISOString()
								: undefined,
							end_time: values.end_time
								? dayjs(values.end_time).toISOString()
								: undefined,
							day_of_week: Array.isArray(values.day_of_week)
								? values.day_of_week.join(",")
								: values.day_of_week,
						};
						formProps.onFinish?.(submitValues);
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
									message: "請輸入課程名稱",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="課程描述"
							name="description"
							className={styles.formItem}
						>
							<Input.TextArea rows={3} />
						</Form.Item>
						<Form.Item
							label="學校"
							name="school_id"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請選擇學校",
								},
							]}
						>
							<Select
								{...categorySelectProps}
								style={{ width: "100%" }}
								showSearch={false}
								placeholder="請選擇學校"
							/>
						</Form.Item>
						<Form.Item
							label="年級"
							name="grade"
							className={styles.formItem}
						>
							<InputNumber
								min={1}
								style={{ width: "100%" }}
								placeholder="請輸入年級"
							/>
						</Form.Item>
						<Form.Item
							label="上課星期"
							name="day_of_week"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請選擇上課星期",
								},
							]}
							getValueFromEvent={(val: string[]) => val}
							getValueProps={(val: string) => ({
								value:
									typeof val === "string"
										? val
												.split(",")
												.map((d: string) => d.trim())
										: val,
							})}
						>
							<Checkbox.Group options={DAY_OF_WEEK_OPTIONS} />
						</Form.Item>
						<Form.Item
							label="開始時間"
							name="start_time"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請選擇開始時間",
								},
							]}
							getValueProps={(val: string) => ({
								value: val ? dayjs(val) : undefined,
							})}
						>
							<TimePicker
								format="HH:mm"
								style={{ width: "100%" }}
								placeholder="請選擇開始時間"
							/>
						</Form.Item>
						<Form.Item
							label="結束時間"
							name="end_time"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請選擇結束時間",
								},
							]}
							getValueProps={(val: string) => ({
								value: val ? dayjs(val) : undefined,
							})}
						>
							<TimePicker
								format="HH:mm"
								style={{ width: "100%" }}
								placeholder="請選擇結束時間"
							/>
						</Form.Item>
						<Form.Item
							label="課程時長（分鐘）"
							name="duration"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請輸入課程時長",
								},
							]}
						>
							<InputNumber
								min={1}
								style={{ width: "100%" }}
								placeholder="請輸入課程時長（分鐘）"
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
