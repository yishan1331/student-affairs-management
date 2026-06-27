import type { RefineThemedLayoutV2HeaderProps } from '@refinedev/antd';
import { useGetIdentity } from '@refinedev/core';
import {
	Layout as AntdLayout,
	Avatar,
	Button,
	Grid,
	Space,
	theme,
	Typography,
} from 'antd';
import { MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import React, { useContext, useEffect } from 'react';

import { ColorModeContext } from '../../contexts/color-mode';
import { IUser } from '../../common/types/models';
import { useUser } from '../../contexts/userContext';
import { SubsystemSwitcher } from './subsystem-switcher';

const { Text } = Typography;
const { useToken } = theme;

export const ThemedHeaderV2: React.FC<RefineThemedLayoutV2HeaderProps> = ({
	sticky = true,
}) => {
	const { token } = useToken();
	const { data: user } = useGetIdentity<IUser>();
	const { mode, setMode } = useContext(ColorModeContext);
	const { setUser } = useUser();
	const breakpoint = Grid.useBreakpoint();
	const isMobile = typeof breakpoint.lg === 'undefined' ? false : !breakpoint.lg;

	useEffect(() => {
		if (user) {
			setUser(user);
		}
	}, [user, setUser]);

	const headerStyles: React.CSSProperties = {
		backgroundColor: token.colorBgElevated,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: isMobile ? '0px 12px 0px 48px' : '0px 24px',
		height: '64px',
	};

	if (sticky) {
		headerStyles.position = 'sticky';
		headerStyles.top = 0;
		// 高於內容（如被選中的 Radio.Button 預設 z-index:1），低於 antd 彈窗（1000+）
		headerStyles.zIndex = 11;
	}

	return (
		<AntdLayout.Header style={headerStyles}>
			{/* 左側：子系統切換器（僅授權多個子系統時顯示，否則為佔位空白以維持右側對齊） */}
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<SubsystemSwitcher />
			</div>
			<Space>
				<Button
					type="text"
					shape="circle"
					icon={mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
					onClick={() => {
						setMode(mode === 'light' ? 'dark' : 'light');
					}}
					size="large"
				/>
				<Space style={{ marginLeft: isMobile ? '4px' : '10px' }} size="small">
					<Avatar
						style={{ backgroundColor: 'var(--primary-btn-color)' }}
						icon={<UserOutlined />}
					/>
					{!isMobile && user?.username && <Text strong>{user.username}</Text>}
				</Space>
			</Space>
		</AntdLayout.Header>
	);
};
