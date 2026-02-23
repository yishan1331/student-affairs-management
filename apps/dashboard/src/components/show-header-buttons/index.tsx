import React from 'react';
import { DeleteButton, EditButton, RefreshButton } from '@refinedev/antd';
import { Space } from 'antd';

type ShowHeaderButtonsProps = {
	deleteButtonProps?: any;
	editButtonProps?: any;
	refreshButtonProps?: any;
	resource: string;
};

export const CustomShowHeaderButtons: React.FC<ShowHeaderButtonsProps> = ({
	deleteButtonProps,
	editButtonProps,
	refreshButtonProps,
	resource,
}) => {
	return (
		<Space size="small">
			{editButtonProps && (
				<EditButton hideText {...editButtonProps} type="default" />
			)}
			{deleteButtonProps && (
				<DeleteButton
					hideText
					{...deleteButtonProps}
					resource={resource}
					confirmTitle={`確認要刪除嗎？`}
					confirmOkText={`確認`}
					confirmCancelText={`取消`}
				/>
			)}
			<RefreshButton hideText {...refreshButtonProps} />
		</Space>
	);
};
