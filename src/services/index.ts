// API服务统一导出 - 根据API文档模块化
// 只导出API文档中明确定义的接口

import * as mockApi from './api';

// 真实API服务模块
import { authApi as realAuthApi } from './auth';
import { departmentApi as realDepartmentApi } from './department';
import { securityGuardApi as realSecurityGuardApi } from './security-guard';
import { patrolPointApi as realPatrolPointApi } from './patrol-point';
import { fileApi as realFileApi } from './file';

// 开发环境下的API切换标志
const USE_REAL_API = import.meta.env.PROD || import.meta.env.VITE_USE_REAL_API === 'true';
console.log(import.meta.env.MODE);
console.log(import.meta.env.VITE_USE_REAL_API);
console.log(USE_REAL_API);

console.log(`[API] 当前使用 ${USE_REAL_API ? '真实' : '模拟'} API`);

// 根据配置选择API实现 - 只导出API文档中存在的接口
// export const authApi = USE_REAL_API ? realAuthApi : mockApi.authApi;
// export const departmentApi = USE_REAL_API ? realDepartmentApi : mockApi.departmentApi;
// export const securityGuardApi = USE_REAL_API ? realSecurityGuardApi : mockApi.safetyOfficerApi;
// export const patrolPointApi = USE_REAL_API ? realPatrolPointApi : mockApi.pointApi;
// export const fileApi = USE_REAL_API ? realFileApi : mockApi.downloadApi;

export const authApi = realAuthApi;
export const departmentApi = realDepartmentApi;
export const securityGuardApi = realSecurityGuardApi;
export const patrolPointApi = realPatrolPointApi;
export const fileApi = realFileApi;

// 兼容性别名
export const regionApi = departmentApi; // 区域管理使用部门接口
export const safetyOfficerApi = securityGuardApi; // 安全员别名
export const pointApi = patrolPointApi; // 点位别名
export const downloadApi = fileApi; // 下载别名

// // 获取下拉选项数据 - 基于现有API组合
// export const getSelectOptions = async () => {
//   try {
//     const [departmentsRes, guardsRes] = await Promise.all([
//       departmentApi.getDepartmentTree(),
//       securityGuardApi.getBindableSecurityGuards()
//     ]);

//     return {
//       regions: departmentsRes.data.map(item => ({
//         value: item.deptId,
//         label: item.deptName,
//       })),
//       safetyOfficers: guardsRes.data.map(item => ({
//         value: item.guardId,
//         label: `${item.name}-${item.deptName || ''}`,
//       })),
//     };
//   } catch (error) {
//     console.error('获取选项数据失败:', error);
//     return {
//       regions: [],
//       safetyOfficers: [],
//     };
//   }
// };

// 导出配置信息
export const API_CONFIG = {
  USE_REAL_API,
  BASE_URL: '/api/',
  ENV: import.meta.env.MODE,
};

// 导出所有类型定义
export * from '../types'; 