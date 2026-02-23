import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
	FrownOutlined,
	MedicineBoxOutlined,
	FileTextOutlined,
	SettingOutlined,
} from "@ant-design/icons";

export const DashboardPage: React.FC = () => {
	return (
		<div>
			<h1>首頁</h1>
			<Row gutter={16}>
				<Col span={6}>
					<Card>
						<Statistic
							title="學校管理"
							prefix={<MedicineBoxOutlined />}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title="課程管理"
							prefix={<FrownOutlined />}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title="學生管理"
							prefix={<FileTextOutlined />}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title="網站設置"
							prefix={<SettingOutlined />}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
};
