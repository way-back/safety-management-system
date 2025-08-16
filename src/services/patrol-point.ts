import { httpClient } from './httpClient';
import { PatrolPoint, PatrolPointQuery, BatchDownloadQrCodeParams, PatrolPointPageQuery, PatrolPointForm } from '../types/patrol-point';

// 巡查点位管理API - 根据API文档
export const patrolPointApi = {

  //分页查询
  getPatrolPoints: async (params: PatrolPointPageQuery): Promise<{
    total: number,
    data: PatrolPoint[]
  }> => {
    const response = await httpClient.get<PatrolPoint>(`/campus/point/list`, params);
    return { total: response.total!, data: response.rows as PatrolPoint[] };
  },

  createPatrolPoint: async (params: PatrolPointForm): Promise<void> => {
    const response = await httpClient.post(`/campus/point`, params);
    
  },

  updatePatrolPoint: async (pointId: number, params: PatrolPointForm): Promise<void> => {
    const response = await httpClient.put(`/campus/point`, { ...params, pointId });
    
  },

  deletePatrolPoints: async (pointIds: string): Promise<void> => {
    const response = await httpClient.delete(`/campus/point/${pointIds}`);
  },

  // 查询巡查点位信息 - GET /campus/point/{pointId}
  getPatrolPointById: async (pointId: number): Promise<PatrolPoint> => {
    const response = await httpClient.get<PatrolPoint>(`/campus/point/${pointId}`);
    return response.data!;
  },

  // 绑定安全员到巡查点位 - POST /campus/point/bind/{pointId}/{guardId}
  bindGuardToPoint: async (pointId: number, guardId: number): Promise<void> => {
    await httpClient.post(`/campus/point/bind/${pointId}/${guardId}`);
  },

  // 解绑巡查点位的安全员 - POST /campus/point/unbind/{pointId}
  unbindGuardFromPoint: async (pointId: number): Promise<void> => {
    await httpClient.post(`/campus/point/unbind/${pointId}`);
  },

  //下载点位导入模版
  // importTemplate: async (): Promise<any> => {
  //   const res = await httpClient.post('/campus/point/importTemplate');
  //   return res;
  // },
  // 下载点位导入模板
  importTemplate: async (): Promise<Blob> => {
    const response: any = await httpClient.download('/campus/point/importTemplate');
    return response;
  },

  // 校验点位编码唯一性 - GET /campus/point/checkPointCodeUnique
  checkPointCodeUnique: async (pointCode: string): Promise<{ unique: boolean }> => {
    const response = await httpClient.get<{ unique: boolean }>('/campus/point/checkPointCodeUnique', { pointCode });
    return response.data!;
  },

  // 根据二维码code查询点位信息 - GET /campus/point/getByQrCode
  getPatrolPointByQrCode: async (qrCode: string): Promise<PatrolPoint> => {
    const response = await httpClient.get<PatrolPoint>('/campus/point/getByQrCode', { qrCode });
    return response.data!;
  },

  // 获取点位二维码base64 - GET /campus/point/qrCodeBase64/{pointId}
  getPatrolPointQrCodeBase64: async (pointId: number): Promise<{ qrCodeBase64: string }> => {
    const response = await httpClient.get<{ qrCodeBase64: string }>(`/campus/point/qrCodeBase64/${pointId}`);
    return response.data!;
  },

  // 获取巡查点位二维码 - GET /qrcode/{pointId}
  getPatrolPointQrCode: async (pointId: number): Promise<Blob> => {
    const token = localStorage.getItem('token');
    const baseURL = '/api/';
    const response = await fetch(`${baseURL}/campus/point/qrcode/${pointId}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`获取二维码失败: ${response.status}`);
    }

    return response.blob();
  },

  // 批量下载二维码 - POST /campus/point/batchDownloadQrCode
  batchDownloadQrCode: async (params?: BatchDownloadQrCodeParams): Promise<Blob> => {
    const queryParams: Record<string, any> = {};
    if (params?.building) queryParams.building = params.building;
    if (params?.deptId) queryParams.deptId = params.deptId;
    if (params?.detailName) queryParams.detailName = params.detailName;
    if (params?.floor) queryParams.floor = params.floor;
    if (params?.guardId) queryParams.guardId = params.guardId;
    if (params?.pointCode) queryParams.pointCode = params.pointCode;
    if (params?.pointId) queryParams.pointId = params.pointId;
    if (params?.purpose) queryParams.purpose = params.purpose;
    if (params?.roomNumber) queryParams.roomNumber = params.roomNumber;

    const token = localStorage.getItem('token');
    const queryString = Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : '';

    const baseURL = '/api/';
    const response = await fetch(`${baseURL}/campus/point/batchDownloadQrCode${queryString}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`批量下载二维码失败: ${response.status}`);
    }

    return response.blob();
  },
};