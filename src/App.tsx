import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Avatar, Space, Button, message } from 'antd';
import {
  EnvironmentOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  TeamOutlined,
  BugOutlined
} from '@ant-design/icons';
import RegionManagement from './pages/RegionManagement';
import PointManagement from './pages/PointManagement';
import SafetyOfficerManagement from './pages/SafetyOfficerManagement';
// import UserManagement from './pages/UserManagement';
import PointDetailH5 from './pages/PointDetailH5';
import Login from './pages/Login';
import ApiDebugger from './components/ApiDebugger';
import { User, UserRole } from './types';
import { authApi } from './services';
import './App.css';

const { Header, Sider, Content } = Layout;

// 权限保护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: UserRole }> = ({
  children,
  requiredRole
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 如果需要特定权限且用户权限不足
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/regions" replace />;
  }

  return <>{children}</>;
};

// 用户菜单组件
const UserMenu: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button type="text" style={{ color: '#1890ff', height: 'auto', padding: '4px 8px' }}>
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{user.name}</span>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      // await authApi.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      message.success('退出登录成功');
      navigate('/login');
    } catch (error) {
      message.error('退出登录失败');
    }
  };

  // 根据用户角色动态生成菜单
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/regions',
        icon: <EnvironmentOutlined />,
        label: '区域管理',
      },
      {
        key: '/points',
        icon: <SettingOutlined />,
        label: '点位管理',
      },
      {
        key: '/officers',
        icon: <TeamOutlined />,
        label: '安全员管理',
      },
    ];

    // 如果是超级管理员，添加用户管理菜单
    if (user?.role === UserRole.SUPER_ADMIN) {
      baseItems.push({
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理',
      });
    }

    // 在开发环境下添加调试工具菜单
    if (import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG === 'true') {
      baseItems.push({
        key: '/debug',
        icon: <BugOutlined />,
        label: 'API调试',
      });
    }

    return baseItems;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div className="logo" style={{
          height: 64,
          margin: 16,
          // background: 'rgba(24, 144, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          borderRadius: 6,
          textAlign: 'center',
          lineHeight: '24px',
          padding: '0 8px',
          color: '#1890ff',
          // border: '1px solid #1890ff'
        }}>
          消防安全责任人<br />管理系统
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          marginLeft: -200,
        }}>
          {user && <UserMenu user={user} onLogout={handleLogout} />}
        </Header>
        <Content style={{
          margin: 0,
          overflow: 'initial',
          padding: 24,
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          marginLeft: -200,
        }}>
          <div style={{
            background: colorBgContainer,
            borderRadius: 8,
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/regions" replace />} />
              <Route path="/regions" element={<RegionManagement />} />
              <Route path="/points" element={<PointManagement />} />
              <Route path="/officers" element={<SafetyOfficerManagement />} />
              <Route
                path="/users"
                // element={
                //   user?.role === UserRole.SUPER_ADMIN ?
                //     <UserManagement /> :
                //     <Navigate to="/regions" replace />
                // }
              />
              {/* 调试工具路由 - 仅在开发环境下可用 */}
              {(import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG === 'true') && (
                <Route path="/debug" element={<ApiDebugger />} />
              )}
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<Login />} />
        {/* H5页面路由，独立布局 */}
        <Route path="/h5/point/:id" element={<PointDetailH5 />} />
        {/* 管理端页面路由，使用AppContent布局和权限保护 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App; 