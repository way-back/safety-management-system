import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../types';
import { authApi } from '../services';
import './Login.css';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      message.success('登录成功');
      navigate('/admin/regions');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <SafetyOutlined className="login-icon" />
            <Title level={2} style={{ margin: '16px 0 8px 0', color: '#1890ff' }}>
              消防安全管理系统
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              深圳技术大学安全保卫中心
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            size="large"
            onFinish={handleLogin}
            autoComplete="off"
            style={{ marginTop: '32px' }}
            initialValues={{ rememberMe: false }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked" style={{ marginBottom: '16px' }}>
              <Checkbox>记住我</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: '42px', fontSize: '16px' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;