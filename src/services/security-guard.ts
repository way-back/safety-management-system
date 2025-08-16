import { httpClient } from './httpClient';
import { SecurityGuard, SecurityGuardForm, SecurityGuardQuery, ImportSecurityGuardParams } from '../types/security-guard';
import { TableDataInfo } from '../types/common';
import { PatrolPoint } from '../types/patrol-point';

// 安全员管理API - 根据API文档
export const securityGuardApi = {
  // 查询安全员信息列表 - GET /campus/guard/list
  getSecurityGuards: async (params?: SecurityGuardQuery): Promise<TableDataInfo<SecurityGuard>> => {
    const queryParams: Record<string, any> = {};
    if (params?.deptId) queryParams.deptId = params.deptId;
    if (params?.guardId) queryParams.guardId = params.guardId;
    if (params?.name) queryParams.name = params.name;
    if (params?.officePhone) queryParams.officePhone = params.officePhone;
    if (params?.phoneNumber) queryParams.phoneNumber = params.phoneNumber;
    if (params?.wechatId) queryParams.wechatId = params.wechatId;
    if (params?.pageNum) queryParams.pageNum = params.pageNum;
    if (params?.pageSize) queryParams.pageSize = params.pageSize;
    if (params?.orderByColumn) queryParams.orderByColumn = params.orderByColumn;
    if (params?.isAsc) queryParams.isAsc = params.isAsc;

    const response = await httpClient.get<TableDataInfo<SecurityGuard>>('/campus/guard/list', queryParams);
    return response.data!;
  },

  // 获取安全员信息 - GET /campus/guard/{guardId}
  getSecurityGuardById: async (guardId: number): Promise<SecurityGuard> => {
    const response = await httpClient.get<SecurityGuard>(`/campus/guard/${guardId}`);
    return response.data!;
  },

  // 新增保存安全员信息 - POST /campus/guard/
  createSecurityGuard: async (data: SecurityGuardForm): Promise<SecurityGuard> => {
    const response = await httpClient.post<SecurityGuard>('/campus/guard/', data);
    return response.data!;
  },

  // 修改保存安全员信息 - PUT /campus/guard/
  updateSecurityGuard: async (data: SecurityGuardForm): Promise<SecurityGuard> => {
    const response = await httpClient.put<SecurityGuard>('/campus/guard/', data);
    return response.data!;
  },

  // 删除安全员信息 - DELETE /campus/guard/{ids}
  deleteSecurityGuards: async (ids: number[]): Promise<void> => {
    const idsStr = ids.join(',');
    await httpClient.delete(`/campus/guard/${idsStr}`);
  },

  // 下载点位导入模板
  importTemplate: async (): Promise<Blob> => {
    const response: any = await httpClient.download('/campus/guard/importTemplate');
    return response;
  },

  // 导出安全员信息列表 - POST /campus/guard/export
  exportSecurityGuards: async (params?: Omit<SecurityGuardQuery, keyof import('../types/common').BaseQuery>): Promise<Blob> => {
    const queryParams: Record<string, any> = {};
    if (params?.deptId) queryParams.deptId = params.deptId;
    if (params?.guardId) queryParams.guardId = params.guardId;
    if (params?.name) queryParams.name = params.name;
    if (params?.officePhone) queryParams.officePhone = params.officePhone;
    if (params?.phoneNumber) queryParams.phoneNumber = params.phoneNumber;
    if (params?.wechatId) queryParams.wechatId = params.wechatId;

    return await httpClient.download('/campus/guard/export', queryParams);
  },

  // 导入安全员信息 - POST /campus/guard/importData
  importSecurityGuards: async (params: ImportSecurityGuardParams): Promise<any> => {
    const response = await httpClient.upload<any>('/campus/guard/importData', params.file, { 
      updateSupport: params.updateSupport 
    });
    return response.data;
  },

  // 下载安全员导入模板 - POST /campus/guard/importTemplate
  downloadImportTemplate: async (): Promise<Blob> => {
    return await httpClient.download('/campus/guard/importTemplate');
  },

  // 获取可绑定的安全员列表(不带分页) - GET /campus/guard/bindableList
  getBindableSecurityGuards: async (): Promise<{ data: SecurityGuard[] }> => {
    const response = await httpClient.get<SecurityGuard[]>('/campus/guard/bindableList');
    return {
      data: response.data || []
    };
  },

  // 根据安全员ID查询绑定的点位列表 - GET /campus/guard/points/{guardId}
  getPatrolPointsByGuardId: async (guardId: number): Promise<{ data: PatrolPoint[] }> => {
    const response = await httpClient.get<PatrolPoint[]>(`/campus/guard/points/${guardId}`);
    return {
      data: response.data || []
    };
  },
};