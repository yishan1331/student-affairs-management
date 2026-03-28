import React, { useState } from "react";
import { Card, theme } from "antd";
import { FilterOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";

interface MobileFilterBarProps {
	children: React.ReactNode;
	isMobile: boolean;
}

export const MobileFilterBar: React.FC<MobileFilterBarProps> = ({
	children,
	isMobile,
}) => {
	const [expanded, setExpanded] = useState(false);
	const { token } = theme.useToken();

	if (!isMobile) {
		return <>{children}</>;
	}

	return (
		<div
			style={{
				position: "sticky",
				top: 64,
				zIndex: 10,
				backgroundColor: "inherit",
				paddingBottom: 4,
			}}
		>
			{!expanded ? (
				<Card
					size="small"
					style={{
						marginBottom: 16,
						cursor: "pointer",
						borderRadius: 8,
					}}
					styles={{ body: { padding: "10px 16px" } }}
					onClick={() => setExpanded(true)}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							color: token.colorTextSecondary,
						}}
					>
						<span style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<FilterOutlined />
							篩選條件
						</span>
						<DownOutlined style={{ fontSize: 10 }} />
					</div>
				</Card>
			) : (
				<div>
					{children}
					<div
						style={{
							textAlign: "center",
							padding: "6px 0",
							cursor: "pointer",
							color: token.colorTextSecondary,
							fontSize: 12,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: 4,
						}}
						onClick={() => setExpanded(false)}
					>
						<UpOutlined style={{ fontSize: 10 }} />
						收合篩選
					</div>
				</div>
			)}
		</div>
	);
};
