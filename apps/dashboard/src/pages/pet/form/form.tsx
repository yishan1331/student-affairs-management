import { Form, Flex, DatePicker, InputNumber, Input, Select, Switch } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { useStyles } from "../../health-weight/editStyled";
import {
	ICreatePet,
	IUpdatePet,
	PetType,
} from "../../../common/types/models";
import { PET_TYPE_MAP, PET_GENDER_MAP } from "../../../common/constants";

type Props = {
	formProps: FormProps<any>;
};

const petTypeOptions = Object.entries(PET_TYPE_MAP).map(([value, { label }]) => ({
	label,
	value,
}));

const genderOptions = Object.entries(PET_GENDER_MAP).map(([value, { label }]) => ({
	label,
	value,
}));

export const PetForm = (props: Props) => {
	const { styles } = useStyles();

	return (
		<Form<ICreatePet | IUpdatePet>
			{...props.formProps}
			layout="vertical"
			onFinish={(values: any) => {
				props.formProps.onFinish?.({
					...values,
					birthday: values.birthday
						? dayjs(values.birthday).format("YYYY-MM-DD")
						: undefined,
				});
			}}
		>
			<Flex vertical>
				<Form.Item
					label="名稱"
					name="name"
					className={styles.formItem}
					rules={[{ required: true, message: "請輸入寵物名稱" }]}
				>
					<Input
						style={{ maxWidth: "400px" }}
						placeholder="請輸入寵物名稱"
					/>
				</Form.Item>
				<Form.Item
					label="種類"
					name="type"
					className={styles.formItem}
					rules={[{ required: true, message: "請選擇種類" }]}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇種類"
						options={petTypeOptions}
					/>
				</Form.Item>
				<Form.Item
					label="品種"
					name="breed"
					className={styles.formItem}
				>
					<Input
						style={{ maxWidth: "400px" }}
						placeholder="請輸入品種（如：柴犬、美短）"
					/>
				</Form.Item>
				<Form.Item
					label="性別"
					name="gender"
					className={styles.formItem}
				>
					<Select
						style={{ width: "200px" }}
						placeholder="請選擇性別"
						options={genderOptions}
						allowClear
					/>
				</Form.Item>
				<Form.Item
					label="生日"
					name="birthday"
					className={styles.formItem}
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
				>
					<InputNumber
						style={{ width: "200px" }}
						min={0}
						max={1000}
						step={0.1}
						precision={1}
						placeholder="請輸入體重"
					/>
				</Form.Item>
				<Form.Item
					label="狀態"
					name="is_active"
					className={styles.formItem}
					valuePropName="checked"
					initialValue={true}
				>
					<Switch
						checkedChildren="啟用"
						unCheckedChildren="停用"
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
