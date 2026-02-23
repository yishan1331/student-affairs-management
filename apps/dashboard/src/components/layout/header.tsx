import type { RefineThemedLayoutV2HeaderProps } from '@refinedev/antd';
import { useGetIdentity } from '@refinedev/core';
import {
	Layout as AntdLayout,
	Avatar,
	Button,
	Space,
	theme,
	Typography,
} from 'antd';
import { MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import React, { useContext, useEffect } from 'react';

import { ColorModeContext } from '../../contexts/color-mode';
import { IUser } from '../../common/types/models';
import { useUser } from '../../contexts/userContext';

const { Text } = Typography;
const { useToken } = theme;

export const ThemedHeaderV2: React.FC<RefineThemedLayoutV2HeaderProps> = ({
	sticky = true,
}) => {
	const { token } = useToken();
	const { data: user } = useGetIdentity<IUser>();
	const { mode, setMode } = useContext(ColorModeContext);
	const { setUser } = useUser();

	useEffect(() => {
		if (user) {
			setUser(user);
		}
	}, [user, setUser]);

	const headerStyles: React.CSSProperties = {
		backgroundColor: token.colorBgElevated,
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		padding: '0px 24px',
		height: '64px',
	};

	if (sticky) {
		headerStyles.position = 'sticky';
		headerStyles.top = 0;
		headerStyles.zIndex = 1;
	}

	return (
		<AntdLayout.Header style={headerStyles}>
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
				<Space style={{ marginLeft: '10px' }} size="small">
					<Avatar
						style={{ backgroundColor: 'var(--primary-btn-color)' }}
						icon={<UserOutlined />}
					/>
					{user?.username && <Text strong>{user.username}</Text>}
					{/* {user?.avatar && (
						<Avatar src={user?.avatar} alt={user?.name} />
					)} */}
				</Space>
			</Space>
		</AntdLayout.Header>
	);
};
