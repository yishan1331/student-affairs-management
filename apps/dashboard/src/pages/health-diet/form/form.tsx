import { Form, Flex, DatePicker, InputNumber, Input, Select } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../editStyled";
import {
	ICreateHealthDiet,
	IUpdateHealthDiet,
	MealType,
} from "../../../common/types/models";

type Props = {
	formProps: FormProps<any>;
};

const mealTypeOptions = [
	{ label: "早餐", value: MealType.breakfast },
	{ label: "午餐", value: MealType.lunch },
	{ label: "晚餐", value: MealType.dinner },
	{ label: "點心", value: MealType.snack },
];

export const HealthDietForm = (props: Props) => {
	const { styles } = useStyles();

	return (
		<Form<ICreateHealthDiet | IUpdateHealthDiet>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				props.formProps.onFinish?.({
					...values,
					date: values.date
						? dayjs(values.date).format("YYYY-MM-DD")
						: undefined,
				});
			}}
		>
			<Flex vertical>
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
					label="餐別"
					name="meal_type"
					className={styles.formItem}
					rules={[{ required: true, message: "請選擇餐別" }]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇餐別"
						options={mealTypeOptions}
					/>
				</Form.Item>
				<Form.Item
					label="食物名稱"
					name="food_name"
					className={styles.formItem}
					rules={[{ required: true, message: "請輸入食物名稱" }]}
				>
					<Input
						style={{ maxWidth: "400px" }}
						placeholder="請輸入食物名稱"
					/>
				</Form.Item>
				<Form.Item
					label="份量"
					name="amount"
					className={styles.formItem}
				>
					<Input
						style={{ maxWidth: "400px" }}
						placeholder="請輸入份量（如：1碗、2片）"
					/>
				</Form.Item>
				<Form.Item
					label="卡路里"
					name="calories"
					className={styles.formItem}
				>
					<InputNumber
						style={{ width: "200px" }}
						min={0}
						max={10000}
						step={1}
						precision={0}
						placeholder="請輸入卡路里"
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
