import React, { useEffect, useState } from "react";
import { Select, Tabs } from "antd";
import apiClient from "../services/api/apiClient";
import { PET_TYPE_MAP } from "../common/constants";
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

// 共用 pets 快取，避免重複請求
let petsCache: Pet[] | null = null;
let petsCachePromise: Promise<Pet[]> | null = null;

const fetchPetsOnce = async (): Promise<Pet[]> => {
	if (petsCache !== null) return petsCache;
	if (petsCachePromise) return petsCachePromise;
	petsCachePromise = apiClient
		.get("/v1/pet/my-pets")
		.then((res) => {
			const data = res.data?.data || res.data || [];
			petsCache = data;
			return data;
		})
		.catch(() => {
			petsCache = [];
			return [];

		})
		.finally(() => {
			petsCachePromise = null;
		});
	return petsCachePromise;
};

export const HealthSubjectSelector: React.FC<HealthSubjectSelectorProps> = ({
	value,
	onChange,
	formMode = false,
}) => {
	const [pets, setPets] = useState<Pet[]>(petsCache ?? []);
	const [loading, setLoading] = useState(petsCache === null);

	useEffect(() => {
		if (petsCache !== null) {
			setPets(petsCache);
			setLoading(false);
			return;
		}
		setLoading(true);
		fetchPetsOnce().then((data) => {
			setPets(data);
			setLoading(false);
		});
	}, []);

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
				style={{ width: 200 }}
				value={value === undefined || value === null ? -1 : value}
				onChange={(val) => {
					onChange?.(val === -1 ? undefined : val);
				}}
				options={options}
				loading={loading}
			/>
		);
	}

	// 列表/趨勢模式：沒有寵物就不顯示
	if (!loading && pets.length === 0) {
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
