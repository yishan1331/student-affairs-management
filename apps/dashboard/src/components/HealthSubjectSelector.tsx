import React from "react";
import { Select, Tabs } from "antd";
import { useList } from "@refinedev/core";
import { PET_TYPE_MAP, ROUTE_RESOURCE } from "../common/constants";
import { PetType } from "../common/types/models";

interface Pet {
	id: number;
	name: string;
	type: string;
}

interface HealthSubjectSelectorProps {
	value?: number;
	onChange?: (petId: number | undefined) => void;
	/** 是否為表單模式（渲染 Select 而非 Tabs） */
	formMode?: boolean;
}

export const HealthSubjectSelector: React.FC<HealthSubjectSelectorProps> = ({
	value,
	onChange,
	formMode = false,
}) => {
	const { data, isLoading } = useList<Pet>({
		resource: ROUTE_RESOURCE.pet,
		filters: [{ field: "is_active", operator: "eq", value: true }],
		sorters: [{ field: "name", order: "asc" }],
		pagination: { pageSize: 100, mode: "server" },
	});

	const pets = data?.data ?? [];

	const petItems = pets.map((pet) => {
		const typeInfo = PET_TYPE_MAP[pet.type as PetType];
		const typeLabel = typeInfo ? typeInfo.label : pet.type;
		return { label: `${pet.name}（${typeLabel}）`, value: pet.id };
	});

	// 表單模式：渲染 Select 下拉選單
	if (formMode) {
		const options = [{ label: "我自己", value: -1 }, ...petItems];
		return (
			<Select
				style={{ width: '100%', maxWidth: 200 }}
				value={value === undefined || value === null ? -1 : value}
				onChange={(val) => {
					onChange?.(val === -1 ? undefined : val);
				}}
				options={options}
				loading={isLoading}
			/>
		);
	}

	// 列表/趨勢模式：沒有寵物就不顯示
	if (!isLoading && pets.length === 0) {
		return null;
	}

	// 列表/趨勢模式：渲染 Tabs
	const activeKey = value === undefined || value === null ? "self" : String(value);
	const tabItems = [
		{ key: "self", label: "我自己" },
		...pets.map((pet) => {
			const typeInfo = PET_TYPE_MAP[pet.type as PetType];
			const typeLabel = typeInfo ? typeInfo.label : pet.type;
			return { key: String(pet.id), label: `${pet.name}（${typeLabel}）` };
		}),
	];

	return (
		<Tabs
			activeKey={activeKey}
			onChange={(key) => {
				onChange?.(key === "self" ? undefined : Number(key));
			}}
			items={tabItems}
			style={{ marginBottom: 8 }}
		/>
	);
};
