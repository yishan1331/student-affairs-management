import React from "react";
import { useForm } from "@refinedev/antd";
import { Form, Input, Button, Card, Typography, Row, Col, Switch, Space, Upload, message } from "antd";
import { SaveOutlined, UploadOutlined } from "@ant-design/icons";

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
  const { formProps, saveButtonProps, form } = useForm<IWebsiteSettings>({
    id: "1", // 網站設置通常只有一条记录
    action: "edit",
  });

  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上傳成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上傳失敗`);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="網站設置" bordered={false}>
          <Form {...formProps} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="網站名稱"
                  name="siteName"
                  rules={[{ required: true, message: '請輸入網站名稱' }]}
                >
                  <Input placeholder="請輸入網站名稱" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="網站標語"
                  name="siteSlogan"
                  rules={[{ required: true, message: '請輸入網站標語' }]}
                >
                  <Input placeholder="請輸入網站標語" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="網站描述"
                  name="siteDescription"
                  rules={[{ required: true, message: '請輸入網站描述' }]}
                >
                  <Input.TextArea rows={4} placeholder="請輸入網站描述" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="聯繫郵箱"
                  name="contactEmail"
                  rules={[
                    { required: true, message: '請輸入聯繫郵箱' },
                    { type: 'email', message: '請輸入有效的郵箱地址' }
                  ]}
                >
                  <Input placeholder="請輸入聯繫郵箱" />
                </Form.Item>
                <Form.Item
                  label="聯繫電話"
                  name="contactPhone"
                >
                  <Input placeholder="請輸入聯繫電話" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="網站標誌"
                  name="siteLogo"
                >
                  <Upload
                    name="logo"
                    listType="picture"
                    onChange={handleUpload}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>上傳標誌</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="網站圖標"
                  name="siteFavicon"
                >
                  <Upload
                    name="favicon"
                    listType="picture"
                    onChange={handleUpload}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>上傳圖標</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              label="版權信息"
              name="copyrightText"
              rules={[{ required: true, message: '請輸入版權信息' }]}
            >
              <Input placeholder="請輸入版權信息" />
            </Form.Item>
            
            <Form.Item
              label="META關鍵詞"
              name="metaKeywords"
            >
              <Input.TextArea rows={2} placeholder="請輸入META關鍵詞，用逗號分隔" />
            </Form.Item>
            
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                {...saveButtonProps}
              >
                保存設置
              </Button>
            </Space>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}; 