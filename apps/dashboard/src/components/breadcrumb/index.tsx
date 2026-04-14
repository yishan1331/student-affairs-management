import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router';
import { useTranslate } from '@refinedev/core';

export type BreadcrumbItem = {
	title: string;
	path?: string;
};

type CustomBreadcrumbProps = {
	items?: BreadcrumbItem[];
	showHome?: boolean;
};

export const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
	items = [],
	showHome = false,
}) => {
	const location = useLocation();
	const t = useTranslate();

	const defaultItems: BreadcrumbItem[] = showHome
		? [
				{
					title: t('breadcrumb.home'),
					path: '/',
				},
			]
		: [];

	const allItems = [...defaultItems, ...items];

	return (
		<Breadcrumb
			items={allItems.map((item, index) => ({
				key: index,
				title: item.path ? (
					<Link to={item.path}>{item.title}</Link>
				) : (
					item.title
				),
			}))}
		/>
	);
};
