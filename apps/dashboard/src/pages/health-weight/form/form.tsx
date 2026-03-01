import { Form, Flex, DatePicker, InputNumber, Input } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import {
	ICreateHealthWeight,
	IUpdateHealthWeight,
} from "../../../common/types/models";
import { HealthSubjectSelector } from "../../../components";

type Props = {
	formProps: FormProps<any>;
};

export const HealthWeightForm = (props: Props) => {
	const { styles } = useStyles();

	return (
		<Form<ICreateHealthWeight | IUpdateHealthWeight>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				const weight = values.weight;
				const height = values.height;
				let bmi: number | undefined;
				if (weight && height && height > 0) {
					bmi =
						Math.round(
							(weight / ((height / 100) * (height / 100))) * 100
						) / 100;
				}
				props.formProps.onFinish?.({
					...values,
					date: values.date
						? dayjs(values.date).format("YYYY-MM-DD")
						: undefined,
					bmi,
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
					label="體重 (kg)"
					name="weight"
					className={styles.formItem}
					rules={[{ required: true, message: "請輸入體重" }]}
				>
					<InputNumber
						style={{ width: "200px" }}
						min={0.1}
						max={500}
						step={0.1}
						precision={1}
						placeholder="請輸入體重"
					/>
				</Form.Item>
				<Form.Item
					label="身高 (cm)"
					name="height"
					className={styles.formItem}
				>
					<InputNumber
						style={{ width: "200px" }}
						min={1}
						max={300}
						step={0.1}
						precision={1}
						placeholder="請輸入身高"
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
