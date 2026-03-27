import { useState, useEffect } from "react";
import { useSelect } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Flex,
	Segmented,
	Divider,
	Select,
	DatePicker,
} from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import { useUser } from "../../../contexts/userContext";
import {
	ICreateCourseSession,
	IUpdateCourseSession,
	ICourse,
	ISchool,
} from "../../../common/types/models";
import { ROUTE_RESOURCE } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

export const CourseSessionForm = (props: Props) => {
	const { styles } = useStyles();
	const { user } = useUser();

	// 判斷是否為代課模式（編輯時依據既有資料決定）
	const initialValues = props.formProps.initialValues as any;
	const [isSubstitute, setIsSubstitute] = useState(false);

	useEffect(() => {
		if (initialValues) {
			// 如果沒有 course_id 但有 course_name 或 school_id，代表代課
			if (!initialValues.course_id && (initialValues.course_name || initialValues.school_id)) {
				setIsSubstitute(true);
			}
		}
	}, [initialValues]);

	const { query: courseQueryResult, selectProps: courseSelectProps } = useSelect<ICourse>({
		resource: ROUTE_RESOURCE.course,
		optionLabel: "name",
		optionValue: "id",
	});
	const courseOptions = (courseQueryResult?.data?.data || []).map((c: ICourse) => ({
		label: `${c.school?.name ? `${c.school.name} - ` : ""}${c.name}`,
		value: c.id,
	}));

	const { query: schoolQueryResult } = useSelect<ISchool>({
		resource: ROUTE_RESOURCE.school,
		optionLabel: "name",
		optionValue: "id",
		filters: [{ field: "is_active", operator: "eq", value: true }],
	});
	const schoolOptions = (schoolQueryResult?.data?.data || []).map((s: ISchool) => ({
		label: s.name,
		value: s.id,
	}));

	if (!user?.id) {
		return null;
	}

	return (
		<Form<ICreateCourseSession | IUpdateCourseSession>
			{...props.formProps}
			layout="vertical"
			onFinish={(values) => {
				const submitValues: any = {
					...values,
					date: values.date
						? dayjs(values.date).format("YYYY-MM-DD")
						: undefined,
					modifier_id: user.id,
				};

				// 清除不需要的欄位
				if (isSubstitute) {
					delete submitValues.course_id;
				} else {
					delete submitValues.course_name;
					delete submitValues.school_id;
					delete submitValues.duration;
				}

				props.formProps.onFinish?.(submitValues);
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
					label="課程類型"
					className={styles.formItem}
				>
					<Segmented
						block
						className={styles.segmented}
						value={isSubstitute ? "substitute" : "regular"}
						onChange={(val) => setIsSubstitute(val === "substitute")}
						options={[
							{ label: "正式課程", value: "regular" },
							{ label: "代課", value: "substitute" },
						]}
					/>
				</Form.Item>

				{!isSubstitute ? (
					<Form.Item
						label="課程"
						name="course_id"
						className={styles.formItem}
						rules={[
							{
								required: true,
								message: "請選擇課程",
							},
						]}
					>
						<Select
							{...courseSelectProps}
							options={courseOptions}
							style={{ width: "200px" }}
							showSearch={false}
							placeholder="請選擇課程"
						/>
					</Form.Item>
				) : (
					<>
						<Form.Item
							label="學校"
							name="school_id"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請選擇學校（用於薪資計算）",
								},
							]}
						>
							<Select
								options={schoolOptions}
								style={{ width: "200px" }}
								showSearch={false}
								placeholder="請選擇學校"
							/>
						</Form.Item>
						<Form.Item
							label="課程名稱"
							name="course_name"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請輸入課程名稱",
								},
							]}
						>
							<Input style={{ width: "200px" }} placeholder="例：代課 - 數學" />
						</Form.Item>
						<Form.Item
							label="上課時長（分鐘）"
							name="duration"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "請輸入上課時長",
								},
							]}
						>
							<InputNumber min={1} style={{ width: "200px" }} placeholder="例：60" />
						</Form.Item>
					</>
				)}

				<Form.Item
					label="日期"
					name="date"
					className={styles.formItem}
					rules={[
						{
							required: true,
						},
					]}
					getValueProps={(value) => ({
						value: value ? dayjs(value) : undefined,
					})}
				>
					<DatePicker style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="實際上課人數"
					name="actual_student_count"
					className={styles.formItem}
				>
					<InputNumber min={0} style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="備註"
					name="note"
					className={styles.formItem}
				>
					<Input.TextArea rows={6} />
				</Form.Item>
				<Form.Item
					label="課程狀態"
					name="is_cancelled"
					initialValue={false}
					className={styles.formItem}
				>
					<Segmented
						block
						className={styles.segmented}
						options={[
							{
								label: "正常",
								value: false,
								className: "actice",
							},
							{
								label: "停課",
								value: true,
								className: "inactice",
							},
						]}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
