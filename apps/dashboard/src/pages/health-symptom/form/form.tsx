import { Form, Flex, DatePicker, TimePicker, Input, InputNumber, Select, Switch } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import {
	ICreateHealthSymptom,
	IUpdateHealthSymptom,
	SymptomType,
	Severity,
} from "../../../common/types/models";
import { SYMPTOM_TYPE_MAP, SEVERITY_MAP } from "../../../common/constants";
import { HealthSubjectSelector } from "../../../components";

type Props = {
	formProps: FormProps<any>;
};

const symptomTypeOptions = Object.entries(SYMPTOM_TYPE_MAP).map(([value, { label }]) => ({
	label,
	value,
}));

const severityOptions = Object.entries(SEVERITY_MAP).map(([value, { label }]) => ({
	label,
	value,
}));

export const HealthSymptomForm = (props: Props) => {
	const { styles } = useStyles();

	return (
		<Form<ICreateHealthSymptom | IUpdateHealthSymptom>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				props.formProps.onFinish?.({
					...values,
					date: values.date
						? dayjs(values.date).format("YYYY-MM-DD")
						: undefined,
					time: values.time
						? dayjs(values.time).format("HH:mm")
						: undefined,
					pet_id: values.pet_id ?? undefined,
				});
			}}
		>
			<Flex vertical>
				<Form.Item
					label="記錄對象"
					name="pet_id"
					className={styles.formItem}
				>
					<HealthSubjectSelector formMode />
				</Form.Item>
				<Form.Item
					label="日期"
					name="date"
					className={styles.formItem}
					rules={[{ required: true, message: "請選擇日期" }]}
					getValueProps={(value) => ({
						value: value ? dayjs(value) : undefined,
					})}
				>
					<DatePicker style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="時間"
					name="time"
					className={styles.formItem}
					rules={[{ required: true, message: "請選擇時間" }]}
					getValueProps={(value) => ({
						value: value ? dayjs(value, "HH:mm") : undefined,
					})}
				>
					<TimePicker
						style={{ width: "200px" }}
						format="HH:mm"
					/>
				</Form.Item>
				<Form.Item
					label="症狀類型"
					name="symptom_type"
					className={styles.formItem}
					rules={[{ required: true, message: "請選擇症狀類型" }]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇症狀類型"
						options={symptomTypeOptions}
						showSearch
						optionFilterProp="label"
					/>
				</Form.Item>
				<Form.Item
					label="嚴重程度"
					name="severity"
					className={styles.formItem}
					rules={[{ required: true, message: "請選擇嚴重程度" }]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇嚴重程度"
						options={severityOptions}
					/>
				</Form.Item>
				<Form.Item
					label="發生次數"
					name="frequency"
					className={styles.formItem}
					initialValue={1}
				>
					<InputNumber min={1} style={{ width: "200px" }} />
				</Form.Item>
				<Form.Item
					label="持續時間（分鐘）"
					name="duration_minutes"
					className={styles.formItem}
				>
					<InputNumber min={0} style={{ width: "200px" }} placeholder="選填" />
				</Form.Item>
				<Form.Item
					label="身體部位"
					name="body_part"
					className={styles.formItem}
				>
					<Input
						style={{ maxWidth: "400px" }}
						placeholder="例如：左前腳、腹部"
					/>
				</Form.Item>
				<Form.Item
					label="是否反覆發生"
					name="is_recurring"
					className={styles.formItem}
					valuePropName="checked"
					initialValue={false}
				>
					<Switch
						checkedChildren="是"
						unCheckedChildren="否"
					/>
				</Form.Item>
				<Form.Item
					label="詳細描述"
					name="description"
					className={styles.formItem}
				>
					<Input.TextArea
						rows={3}
						placeholder="請描述症狀詳細情況"
						style={{ maxWidth: "400px" }}
					/>
				</Form.Item>
				<Form.Item
					label="備註"
					name="note"
					className={styles.formItem}
				>
					<Input.TextArea
						rows={3}
						placeholder="請輸入備註"
						style={{ maxWidth: "400px" }}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
