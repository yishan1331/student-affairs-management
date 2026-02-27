import { Form, Flex, DatePicker, TimePicker, Input, Select, Switch } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import {
	ICreateHealthToilet,
	IUpdateHealthToilet,
	ToiletType,
} from "../../../common/types/models";

type Props = {
	formProps: FormProps<any>;
};

const toiletTypeOptions = [
	{ label: "小便", value: ToiletType.urination },
	{ label: "大便", value: ToiletType.defecation },
];

export const HealthToiletForm = (props: Props) => {
	const { styles } = useStyles();

	return (
		<Form<ICreateHealthToilet | IUpdateHealthToilet>
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
				});
			}}
		>
			<Flex vertical>
				<Form.Item
					label="日期"
					name="date"
					className={styles.formItem}
					rules={[{ required: true }]}
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
					rules={[{ required: true }]}
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
					label="類型"
					name="type"
					className={styles.formItem}
					rules={[{ required: true }]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇類型"
						options={toiletTypeOptions}
					/>
				</Form.Item>
				<Form.Item
					label="是否正常"
					name="is_normal"
					className={styles.formItem}
					valuePropName="checked"
					initialValue={true}
				>
					<Switch
						checkedChildren="正常"
						unCheckedChildren="異常"
					/>
				</Form.Item>
				<Form.Item
					label="備註"
					name="note"
					className={styles.formItem}
				>
					<Input.TextArea
						rows={3}
						placeholder="請輸入備註（如異常狀況描述）"
						style={{ maxWidth: "400px" }}
					/>
				</Form.Item>
			</Flex>
		</Form>
	);
};
