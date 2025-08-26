import { useNavigate } from 'react-router-dom';
import { ApiResponse } from '../types/common';
import { message } from 'antd';

class HttpClient {
  private baseURL: string;

  constructor() {
    // 开发环境使用 /api 前缀，生产环境使用真实后端地址
    this.baseURL = '/api/';
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      // 移除 redirect: 'manual'，让代理正常工作
      ...options,
    };


    const fullUrl = `${this.baseURL}${url}`;
    console.log(`[HTTP] ${options.method || 'GET'} ${fullUrl}`, {
      config,
      body: options.body,
      env: import.meta.env.MODE
    });

    try {
      const response = await fetch(fullUrl, config);

      console.log(`[HTTP] Response Status: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      // console.log("response", response);

      if (!response.ok) {
        // 处理HTTP错误状态
        if (response.status === 401) {
          // 未授权，清除本地token并跳转登录
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('登录已过期，请重新登录');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败: ${response.status} ${response.statusText}`);
      }

      if(response.status === 500) {
        message.error('服务器内部错误');
        throw new Error('500, 服务器内部错误');
      }

      if (response.status === 401) {
        // 未授权，清除本地token并跳转登录
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('登录已过期，请重新登录');
      }

      const result = await response.json();

      if(result.code !== 0) {
        message.error(result.msg);
        throw new Error(result.msg);
      }
      console.log(`[HTTP] Response:`, result);

      // 直接返回结果，不检查业务状态码
      return result;
    } catch (error) {
      console.error(`[HTTP] Error:`, error);
      throw error;
    }
  }

  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${url}${queryString}`, { method: 'GET' });
  }

  post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 带query参数的POST请求（用于登录接口）
  postWithQuery<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${url}${queryString}`, { method: 'POST' });
  }

  put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  // 文件上传
  upload<T>(url: string, file: File, data?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    const token = localStorage.getItem('token');

    return this.request<T>(url, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }

  // 文件下载（POST方式，用于导出功能）
  async download(url: string, data?: any): Promise<Blob> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }

    return response.blob();
  }

  // 通用文件下载（GET方式）
  async downloadFile(fileName: string, deleteAfterDownload: boolean = false): Promise<Blob> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      fileName,
      delete: deleteAfterDownload.toString()
    });

    const response = await fetch(`${this.baseURL}/common/download?${params}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`文件下载失败: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }
}

export const httpClient = new HttpClient(); 