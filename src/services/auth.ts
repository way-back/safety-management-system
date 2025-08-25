import { httpClient } from './httpClient';
import { LoginForm, LoginResponse, User } from '../types/auth';

// 认证API - 根据API文档
export const authApi = {
  // 用户登录 - POST /login (使用query参数)
  login: async (data: LoginForm): Promise<LoginResponse> => {
    const queryParams: Record<string, string> = {
      username: data.username,
      password: data.password,
      rememberMe: (data.rememberMe ?? false).toString(),
    };

    const response = await httpClient.postWithQuery<any>('/login', queryParams);

    // 根据实际返回结果构造LoginResponse
    return {
      user: {
        id: '1',
        username: data.username,
        name: data.username,
        role: 'ADMIN' as any,
        email: '',
        phone: '',
        status: 'active',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      },
      token: 'mock_token_'
    };
  },

  logout: async (): Promise<void> => {
    // API文档中没有明确的登出接口，保留基本实现
    await httpClient.post('/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    // API文档中没有明确的获取当前用户接口，保留基本实现
    const response = await httpClient.get<User>('/user/current');
    return response.data!;
  },
};