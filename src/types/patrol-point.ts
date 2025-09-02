import { BaseEntity, BaseQuery } from './common';

// 巡查点位类型（根据后端返回的数据结构）
export interface PatrolPoint extends BaseEntity {
    bindTime?: Date | string;
    building?: string;
    createBy?: string;
    // createTime?: Date | string;
    deptId?: number;
    deptName?: string;
    detailName?: string;
    floor?: string;
    guardDept?: string;
    guardId?: number;
    guardName?: string;
    guardPhone?: string;
    params?: { [key: string]: any };
    pointCode?: string;
    pointUniqueCode?: string;
    pointId?: number;
    purpose?: string;
    qrCode?: string;
    qrCodeBase64: string;
    remark?: string;
    roomNumber?: string;
    updateBy?: string;
    // updateTime?: Date | string;
    [property: string]: any;
}

export interface PatrolPointPageQuery {
    /**
     * 楼栋
     */
    building?: string;
    /**
     * 部门ID
     */
    deptId?: number;
    /**
     * 详细名称
     */
    detailName?: string;
    /**
     * 楼层
     */
    floor?: string;
    /**
     * 安全员ID
     */
    guardId?: number;
    isAsc?: string;
    /**
     * 排序字段
     */
    orderByColumn?: string;
    /**
     * 当前页数
     */
    pageNum?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 点位编码
     */
    pointCode?: string;
    /**
     * 点位ID
     */
    pointId?: string;
    /**
     * 用途
     */
    purpose?: string;
    /**
     * 房间号
     */
    roomNumber?: string;
    [property: string]: any;
}

// 巡查点位表单类型
export interface PatrolPointForm {
    pointId?: number;
    pointCode: string;
    deptId: number;
    building?: string;
    floor?: string;
    roomNumber?: string;
    detailName?: string;
    purpose?: string;
    remark?: string;
}

// 巡查点位查询参数类型
export interface PatrolPointQuery extends BaseQuery {
    pointId?: string;
    pointCode?: string;
    deptId?: any;
    building?: string;
    floor?: string;
    roomNumber?: string;
    detailName?: string;
    purpose?: string;
    guardId?: number;
    pointName?: string;
}

// 批量下载二维码参数
export interface BatchDownloadQrCodeParams {
    building?: string;
    deptId?: number;
    detailName?: string;
    floor?: string;
    guardId?: number;
    pointCode?: string;
    pointId?: number;
    purpose?: string;
    roomNumber?: string;
}