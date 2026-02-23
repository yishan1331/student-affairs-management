import React from 'react';
import { List, Typography } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import { DataSource } from '../../common/types/types';

type ShowListProps<T> = {
	record: T;
	dataSources: DataSource<T>[];
	token?: GlobalToken;
};

export const CustomShowList = <T extends object>({
	record,
	dataSources,
	token,
}: ShowListProps<T>) => {
	return (
		<div
			style={{
				backgroundColor: token?.colorBgContainer,
				padding: '16px',
			}}
		>
			<List
				dataSource={dataSources.map((dataSource) => {
					if (dataSource.type === 'text') {
						return {
							label: (
								<Typography.Text type="secondary">
									{dataSource.label}
								</Typography.Text>
							),
							value: (
								<Typography.Text>
									{record?.[dataSource.value] as string}
								</Typography.Text>
							),
						};
					}
					return {
						label: (
							<Typography.Text type="secondary">
								{dataSource.label}
							</Typography.Text>
						),
						value: dataSource.render?.(),
					};
				})}
				renderItem={(item) => {
					return (
						<List.Item>
							<List.Item.Meta
								style={{
									padding: '0 16px',
								}}
								avatar={item.label}
								title={item.value}
							/>
						</List.Item>
					);
				}}
			/>
		</div>
	);
};
