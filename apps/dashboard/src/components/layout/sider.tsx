import React, { useContext } from 'react';
import {
	useTranslate,
	useLogout,
	useTitle,
	type ITreeMenu,
	useIsExistAuthentication,
	useRouterContext,
	useMenu,
	useRefineContext,
	useLink,
	useRouterType,
	useActiveAuthProvider,
	pickNotDeprecated,
	useWarnAboutChange,
} from '@refinedev/core';
import { ThemedTitleV2, useThemedLayoutContext } from '@refinedev/antd';
import {
	DashboardOutlined,
	LogoutOutlined,
	UnorderedListOutlined,
	MenuOutlined,
	LeftOutlined,
	RightOutlined,
} from '@ant-design/icons';
import {
	Layout,
	Menu,
	Grid,
	Drawer,
	Button,
	theme,
	ConfigProvider,
} from 'antd';
import type { MenuProps } from 'antd';
import type { RefineThemedLayoutV2SiderProps } from '@refinedev/antd';
import type { CSSProperties } from 'react';

type MenuItem = NonNullable<MenuProps['items']>[number];

const drawerButtonStyles: CSSProperties = {
	borderStartStartRadius: 0,
	borderEndStartRadius: 0,
	position: 'fixed',
	top: 12,
	zIndex: 999,
};

export const ThemedSiderV2: React.FC<RefineThemedLayoutV2SiderProps> = ({
	Title: TitleFromProps,
	render,
	meta,
	fixed,
	activeItemDisabled = false,
}) => {
	const { token } = theme.useToken();
	const {
		siderCollapsed,
		setSiderCollapsed,
		mobileSiderOpen,
		setMobileSiderOpen,
	} = useThemedLayoutContext();

	const isExistAuthentication = useIsExistAuthentication();
	const direction = useContext(ConfigProvider.ConfigContext)?.direction;
	const routerType = useRouterType();
	const NewLink = useLink();
	const { warnWhen, setWarnWhen } = useWarnAboutChange();
	const { Link: LegacyLink } = useRouterContext();
	const Link = routerType === 'legacy' ? LegacyLink : NewLink;
	const TitleFromContext = useTitle();
	const translate = useTranslate();
	const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
	const breakpoint = Grid.useBreakpoint();
	const { hasDashboard } = useRefineContext();
	const authProvider = useActiveAuthProvider();
	const { mutate: mutateLogout } = useLogout({
		v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
	});

	const isMobile =
		typeof breakpoint.lg === 'undefined' ? false : !breakpoint.lg;

	const RenderToTitle = TitleFromProps ?? TitleFromContext ?? ThemedTitleV2;

	const buildMenuItems = (
		tree: ITreeMenu[],
		selectedKey?: string,
	): MenuItem[] => {
		return tree.map((item: ITreeMenu) => {
			const {
				icon,
				label,
				route,
				key,
				children,
				parentName,
				meta,
				options,
			} = item;

			if (children.length > 0) {
				return {
					key: item.key as string,
					icon: icon ?? <UnorderedListOutlined />,
					label,
					children: buildMenuItems(children, selectedKey),
				};
			}
			const isSelected = key === selectedKey;
			const isRoute = !(
				pickNotDeprecated(meta?.parent, options?.parent, parentName) !==
					undefined && children.length === 0
			);

			const linkStyle: React.CSSProperties =
				activeItemDisabled && isSelected
					? { pointerEvents: 'none' }
					: {};

			return {
				key: item.key as string,
				icon: icon ?? (isRoute ? <UnorderedListOutlined /> : undefined),
				style: linkStyle,
				label: (
					<>
						<Link to={route ?? ''} style={linkStyle}>
							{label}
						</Link>
						{!siderCollapsed && isSelected && (
							<div className="ant-menu-tree-arrow" />
						)}
					</>
				),
			};
		});
	};

	const handleLogout = () => {
		if (warnWhen) {
			const confirm = window.confirm(
				translate(
					'warnWhenUnsavedChanges',
					'Are you sure you want to leave? You have unsaved changes.',
				),
			);

			if (confirm) {
				setWarnWhen(false);
				mutateLogout();
			}
		} else {
			mutateLogout();
		}
	};

	const logoutItem: MenuItem | null = isExistAuthentication
		? {
				key: 'logout',
				icon: <LogoutOutlined />,
				label: translate('buttons.logout', 'Logout'),
				onClick: () => handleLogout(),
			}
		: null;

	const dashboardItem: MenuItem | null = hasDashboard
		? {
				key: 'dashboard',
				icon: <DashboardOutlined />,
				label: (
					<>
						<Link to="/">
							{translate('dashboard.title', 'Dashboard')}
						</Link>
						{!siderCollapsed && selectedKey === '/' && (
							<div className="ant-menu-tree-arrow" />
						)}
					</>
				),
			}
		: null;

	const treeItems = buildMenuItems(menuItems, selectedKey);

	const menuItemsAll: MenuItem[] = [
		...(dashboardItem ? [dashboardItem] : []),
		...treeItems,
		...(logoutItem ? [logoutItem] : []),
	];

	const renderMenu = () => {
		return (
			<Menu
				selectedKeys={selectedKey ? [selectedKey] : []}
				defaultOpenKeys={defaultOpenKeys}
				mode="inline"
				style={{
					paddingTop: '8px',
					border: 'none',
					overflow: 'auto',
					height: 'calc(100% - 72px)',
				}}
				items={menuItemsAll}
				onClick={() => {
					setMobileSiderOpen(false);
				}}
			/>
		);
	};

	const renderDrawerSider = () => {
		return (
			<>
				<Drawer
					open={mobileSiderOpen}
					onClose={() => setMobileSiderOpen(false)}
					placement={direction === 'rtl' ? 'right' : 'left'}
					closable={false}
					width={200}
					maskClosable={true}
					styles={{ body: { padding: 0 } }}
				>
					<Layout>
						<Layout.Sider
							style={{
								height: '100vh',
								backgroundColor: token.colorBgContainer,
								borderRight: `1px solid ${token.colorBgElevated}`,
							}}
						>
							<div
								style={{
									width: '200px',
									padding: '0 16px',
									display: 'flex',
									justifyContent: 'flex-start',
									alignItems: 'center',
									height: '64px',
									backgroundColor: token.colorBgElevated,
								}}
							>
								<RenderToTitle collapsed={false} />
							</div>
							{renderMenu()}
						</Layout.Sider>
					</Layout>
				</Drawer>
				<Button
					type="text"
					style={drawerButtonStyles}
					size="large"
					onClick={() => setMobileSiderOpen(true)}
					icon={<MenuOutlined />}
				/>
			</>
		);
	};

	if (isMobile) {
		return renderDrawerSider();
	}

	const siderStyles: React.CSSProperties = {
		backgroundColor: token.colorBgContainer,
		borderRight: `1px solid ${token.colorBgElevated}`,
	};

	if (fixed) {
		siderStyles.position = 'fixed';
		siderStyles.top = 0;
		siderStyles.height = '100vh';
		siderStyles.zIndex = 999;
	}
	const renderClosingIcons = () => {
		const iconProps = { style: { color: token.colorPrimary } };
		const OpenIcon = direction === 'rtl' ? RightOutlined : LeftOutlined;
		const CollapsedIcon =
			direction === 'rtl' ? LeftOutlined : RightOutlined;
		const IconComponent = siderCollapsed ? CollapsedIcon : OpenIcon;

		return <IconComponent {...iconProps} />;
	};

	return (
		<>
			{fixed && (
				<div
					style={{
						width: siderCollapsed ? '80px' : '200px',
						transition: 'all 0.2s',
					}}
				/>
			)}
			<Layout.Sider
				style={siderStyles}
				collapsible
				collapsed={siderCollapsed}
				onCollapse={(collapsed, type) => {
					if (type === 'clickTrigger') {
						setSiderCollapsed(collapsed);
					}
				}}
				collapsedWidth={80}
				breakpoint="lg"
				trigger={
					<Button
						type="text"
						style={{
							borderRadius: 0,
							height: '100%',
							width: '100%',
							backgroundColor: token.colorBgElevated,
						}}
					>
						{renderClosingIcons()}
					</Button>
				}
			>
				<div
					style={{
						width: siderCollapsed ? '80px' : '200px',
						padding: siderCollapsed ? '0' : '0 16px',
						display: 'flex',
						justifyContent: siderCollapsed
							? 'center'
							: 'flex-start',
						alignItems: 'center',
						height: '64px',
						backgroundColor: token.colorBgElevated,
						fontSize: '14px',
					}}
				>
					<RenderToTitle collapsed={siderCollapsed} />
				</div>
				{renderMenu()}
			</Layout.Sider>
		</>
	);
};
