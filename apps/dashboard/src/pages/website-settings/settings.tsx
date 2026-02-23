import React from 'react';
import { useForm } from '@refinedev/antd';
import { Form, Input, Button, Card, Typography, Row, Col, Switch } from 'antd';

const { Title } = Typography;

interface IWebsiteSettings {
	siteName: string;
	siteDescription: string;
	contactEmail: string;
	contactPhone: string;
	address: string;
	enableRegistration: boolean;
	enableBlog: boolean;
	enableAppointments: boolean;
	socialMediaLinks: {
		facebook: string;
		twitter: string;
		instagram: string;
		linkedin: string;
	};
}

export const WebsiteSettings: React.FC = () => {
	// const { formProps, saveButtonProps, form } = useForm<IWebsiteSettings>({
	// 	id: '1', // 網站設置通常只有一条记录
	// 	action: 'edit',
	// });

	return (
		<Card title={<Title level={4}>網站設置</Title>}>
			{/* <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="基本信息" bordered={false}>
              <Form.Item
                label="网站名称"
                name="siteName"
                rules={[{ required: true, message: "请输入网站名称" }]}
              >
                <Input placeholder="输入网站名称" />
              </Form.Item>
              <Form.Item
                label="网站描述"
                name="siteDescription"
                rules={[{ required: true, message: "请输入网站描述" }]}
              >
                <Input.TextArea rows={4} placeholder="输入网站描述" />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="联系信息" bordered={false}>
              <Form.Item
                label="联系邮箱"
                name="contactEmail"
                rules={[
                  { required: true, message: "请输入联系邮箱" },
                  { type: "email", message: "请输入有效的邮箱地址" }
                ]}
              >
                <Input placeholder="example@domain.com" />
              </Form.Item>
              <Form.Item
                label="联系电话"
                name="contactPhone"
              >
                <Input placeholder="输入联系电话" />
              </Form.Item>
              <Form.Item
                label="地址"
                name="address"
              >
                <Input.TextArea rows={2} placeholder="输入地址" />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="功能设置" bordered={false}>
              <Form.Item
                label="启用用户注册"
                name="enableRegistration"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="启用博客功能"
                name="enableBlog"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="启用预约功能"
                name="enableAppointments"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="社交媒体链接" bordered={false}>
              <Form.Item
                label="Facebook"
                name={["socialMediaLinks", "facebook"]}
              >
                <Input placeholder="Facebook链接" />
              </Form.Item>
              <Form.Item
                label="Twitter"
                name={["socialMediaLinks", "twitter"]}
              >
                <Input placeholder="Twitter链接" />
              </Form.Item>
              <Form.Item
                label="Instagram"
                name={["socialMediaLinks", "instagram"]}
              >
                <Input placeholder="Instagram链接" />
              </Form.Item>
              <Form.Item
                label="LinkedIn"
                name={["socialMediaLinks", "linkedin"]}
              >
                <Input placeholder="LinkedIn链接" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row justify="end" style={{ marginTop: 16 }}>
          <Button type="primary" {...saveButtonProps}>
            保存设置
          </Button>
        </Row>
      </Form> */}
		</Card>
	);
};
