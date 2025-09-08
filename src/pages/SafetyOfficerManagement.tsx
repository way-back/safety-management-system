import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Upload,
  Divider,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { SecurityGuard, SecurityGuardForm, SecurityGuardQuery, SecurityGuardPageQuery, PatrolPoint, SafetyOfficerQuery, PatrolPointPageQuery, Department } from '../types';
import { API_CONFIG } from '../services';
import { securityGuardApi } from '../services/security-guard';
import { safetyOfficerApi } from '../services/api';
import { patrolPointApi } from '../services/patrol-point';
import { departmentApi } from '../services/department';
import { exportToExcel, readExcelFile } from '../utils/export';

const SafetyOfficerManagement: React.FC = () => {
  const [officers, setOfficers] = useState<SecurityGuard[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<SecurityGuard | null>(null);
  const [searchQuery, setSearchQuery] = useState<SecurityGuardQuery>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [points, setPoints] = useState<PatrolPoint[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [departments, setDepartments] = useState<Department[]>([]);

  // 选择使用的API
  const currentApi = securityGuardApi;

  // 添加错误弹窗状态
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 添加点位信息弹窗状态
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [selectedGuardPoints, setSelectedGuardPoints] = useState<PatrolPoint[]>([]);
  const [selectedGuardName, setSelectedGuardName] = useState('');
  const [pointsLoading, setPointsLoading] = useState(false);

  // 获取安全员列表
  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const queryParams: SecurityGuardPageQuery = {
        ...searchQuery,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };

      // const response = await currentApi.getSecurityGuards(queryParams);
      // 调用接口获取安全员列表
      const response = await safetyOfficerApi.getSafetyOfficers(queryParams);
      setOfficers(response.data || []);
      // console.log("queryParams", queryParams);
      // console.log("response", response);
      // 更新分页信息
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        current: queryParams.pageNum || 1,
        pageSize: queryParams.pageSize || 10,
      }));

      // 移除自动查询点位信息的逻辑，改为点击按钮时查询
      // const newMap = new Map<number, PatrolPoint[]>();
      // for (let securityGuard of response.data) {
      //   const res = await securityGuardApi.getPatrolPointsByGuardId(securityGuard.guardId!);
      //   newMap.set(securityGuard.guardId!, res.data);
      // }
      // setPointsMap(newMap);
    } catch (error) {
      message.error('获取安全员列表失败');
    } finally {
      setLoading(false);
    }
  };



  // 查看点位信息
  const handleViewPoints = async (record: SecurityGuard) => {
    setPointsLoading(true);
    setSelectedGuardName(record.name || '');
    setPointsModalVisible(true);

    try {
      const res = await securityGuardApi.getPatrolPointsByGuardId(record.guardId!);
      setSelectedGuardPoints(res.data || []);
    } catch (error) {
      message.error('获取点位信息失败');
      setSelectedGuardPoints([]);
    } finally {
      setPointsLoading(false);
    }
  };

  // 获取点位列表
  const fetchPoints = async () => {
    try {
      // 注意：这里暂时使用空数组，因为API文档中没有点位列表接口
      // 实际使用时需要根据后端提供的接口调整
      const queryParams: PatrolPointPageQuery = {
        pageNum: 1,
        pageSize: 1000,
      };
      const res = await patrolPointApi.getPatrolPoints(queryParams);
      console.log("getPoints", res);
      setPoints(res.data);
    } catch (error) {
      console.error('获取点位列表失败:', error);
    }
  };

  // 获取部门列表（用于表格分页显示）
  const fetchDepartments = async () => {
    try {
      // 注意：由于API文档中没有分页的部门列表接口，这里使用树形接口
      const response = await departmentApi.getDepartmentTree();
      setDepartments(response.data || []);
      // setDepartments(response.data?.map(dept => ({
      //   label: dept.deptName!,
      //   value: dept.deptId!,
      // })) || []);
    } catch (error) {
      message.error('获取部门列表失败');
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [searchQuery, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchPoints();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, []);



  // 搜索功能
  const handleSearch = (values: SecurityGuardQuery) => {
    values.phoneNumber = values.phoneNumber || "";
    values.name = values.name || "";
    console.log("search", searchQuery);
    setSearchQuery(values);
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSearchQuery({});
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
  };

  // 新增安全员
  const handleAdd = () => {
    setEditingOfficer(null);
    setModalVisible(true);
    form.resetFields();
  };

  // 编辑安全员
  const handleEdit = (record: SecurityGuard) => {
    setEditingOfficer(record);
    setModalVisible(true);

    // 设置表单值
    form.setFieldsValue({
      name: record.name,
      deptId: record.deptId,
      officePhone: record.officePhone,
      phoneNumber: record.phoneNumber,
      wechatId: record.wechatId,
      remark: record.remark,
    });
  };

  // 删除安全员
  const handleDelete = async (guardId: number) => {
    try {
      await currentApi.deleteSecurityGuards([guardId]);
      message.success('删除成功');
      fetchOfficers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: SecurityGuardForm) => {
    try {
      if (editingOfficer) {
        await currentApi.updateSecurityGuard({ ...values, guardId: editingOfficer.guardId });
        message.success('更新成功');
      } else {
        console.log("add", values);
        await currentApi.createSecurityGuard(values);
        message.success('新增成功');
      }
      setModalVisible(false);
      fetchOfficers();
    } catch (error) {
      message.error(editingOfficer ? '更新失败' : '新增失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 调用真实API导出
      const blob = await currentApi.exportSecurityGuards({
        name: searchQuery.name,
        phoneNumber: searchQuery.phoneNumber,
      });

      console.log("blob", blob);

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `安全员信息_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 批量导入
  const handleImport = async (file: File) => {
    try {
      const res = await securityGuardApi.importData(file, { updateSupport: true });
      // const data = await readExcelFile(file);
      // console.log('导入的数据:', data);
      if (res.code === 0) {
        message.success(`导入成功`);
        fetchOfficers();
      } else {
        // 处理业务错误
        setErrorMessage(res.msg || '导入失败');
        setErrorModalVisible(true);
      }
    } catch (error: any) {
      // 处理网络错误或其他异常
      const errorMsg = error.message || '导入失败，请检查文件格式';
      setErrorMessage(errorMsg);
      setErrorModalVisible(true);
    }
    return false;
  };

  const handleDownloadTemplate = async () => {
    try {
      // const response = await fetch('/api//campus/point/importTemplate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   // body: JSON.stringify(params),
      // });
      const response: any = await securityGuardApi.importTemplate();

      // if (!response.ok) {
      //   throw new Error(`请求失败: ${response.status}`);
      // }

      // 1. 获取二进制数据
      // const blob = await response.blob();
      const blob = response;

      // 2. 从 Content-Disposition 提取文件名（处理 URL 编码）
      // const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = '安全员管理-导入模板.xlsx'; // 默认文件名

      // if (contentDisposition) {
      //   // 匹配 filename= 或 filename*=utf-8'' 后的部分
      //   const match = contentDisposition.match(/filename[*=utf-8'']?["']?(.+?)["']?$/);
      //   if (match && match[1]) {
      //     fileName = decodeURIComponent(match[1]); // 解码中文文件名
      //   }
      // }

      // 3. 触发浏览器下载
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // 使用解码后的文件名
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败');
    }
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName',
      render: (text: string) => text || '-',
    },
    {
      title: '办公室电话',
      dataIndex: 'officePhone',
      key: 'officePhone',
      render: (text: string) => text || '-',
    },
    {
      title: '手机号码',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text: string) => text || '-',
    },
    {
      title: '微信号',
      dataIndex: 'wechatId',
      key: 'wechatId',
      render: (text: string) => text || '-',
    },
    {
      title: '点位信息',
      key: 'points',
      width: 120,
      render: (_: any, record: SecurityGuard) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleViewPoints(record)}
          loading={pointsLoading && selectedGuardName === record.name}
        >
          查看点位
        </Button>
      ),
    },
    {
      title: '备注', // 新增备注列
      dataIndex: 'remark',
      key: 'remark',
      render: (text: string) => text || '暂无',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: Date | string) => {
        if (!time) return '-';
        if (time instanceof Date) {
          return time.toLocaleString();
        }
        return time;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: SecurityGuard) => (
        <Space size={4}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个安全员吗？"
            onConfirm={() => handleDelete(record.guardId || 0)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="安全员信息管理" style={{ marginBottom: 20 }}>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 20 }}
        >
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" allowClear />
          </Form.Item>
          <Form.Item name="phoneNumber" label="手机号码">
            <Input placeholder="请输入手机号码" allowClear />
          </Form.Item>
          <Form.Item>
            <Space size="small">
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 操作按钮 */}
        <Row justify="space-between" style={{ marginBottom: 20 }}>
          <Col>
            <Space size="small">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增安全员
              </Button>
              <Upload
                beforeUpload={handleImport}
                showUploadList={false}
                accept=".xlsx,.xls"
              >
                <Button icon={<UploadOutlined />}>批量导入</Button>
              </Upload>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                下载导入模板
              </Button>
            </Space>
          </Col>
          <Col>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出数据
            </Button>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={officers}
          rowKey="guardId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: size || 10 }));
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingOfficer ? '编辑安全员' : '新增安全员'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* <Form.Item
                name="dept"
                label="部门"
                rules={[{ required: true, message: '请输入部门' }]}
              >
                <Input placeholder="请输入部门" />
              </Form.Item> */}
              <Form.Item
                name="deptId"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select
                  placeholder="请选择部门"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={departments.map(dept => ({
                    label: dept.deptName,
                    value: dept.deptId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="officePhone"
                label="办公室电话"
              >
                <Input placeholder="请输入办公室电话（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="手机号码"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入手机号码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="wechatId"
                label="微信号"
              >
                <Input placeholder="请输入微信号（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="remark"
                label="备注"
              >
                <Input placeholder="请输入备注（可选）" />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item
                name="pointIds"
                label="负责点位"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择负责的点位（可选）"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={points.map(point => ({
                    label: `${point.pointCode || point.name} - ${point.detailName || point.college || ''}`,
                    value: point.pointId,
                  }))}
                />
              </Form.Item>
            </Col> */}
          </Row>


          <Divider />
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space size="small">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingOfficer ? '更新' : '新增'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 点位信息弹窗 */}
      <Modal
        title={`${selectedGuardName} 的点位信息`}
        open={pointsModalVisible}
        onCancel={() => setPointsModalVisible(false)}
        footer={null}
        destroyOnClose
        width={800}
        loading={pointsLoading}
      >
        <Table
          columns={[
            {
              title: '序号',
              dataIndex: 'index',
              key: 'index',
              width: 60,
              render: (_: any, __: any, index: number) => index + 1,
            },
            {
              title: '点位编码',
              dataIndex: 'pointCode',
              key: 'pointCode',
              width: 120,
            },
            {
              title: '所属区域',
              dataIndex: 'deptName',
              key: 'deptName',
              width: 120,
            },
            {
              title: '楼栋',
              dataIndex: 'building',
              key: 'building',
              width: 120,
              render: (text: string) => text || '-',
            },
            {
              title: '楼层',
              dataIndex: 'floor',
              key: 'floor',
              width: 80,
              render: (text: string) => text || '-',
            },
            {
              title: '房间号',
              dataIndex: 'roomNumber',
              key: 'roomNumber',
              width: 100,
              render: (text: string) => text || '-',
            },
            {
              title: '详细名称',
              dataIndex: 'detailName',
              key: 'detailName',
              width: 150,
              render: (text: string) => text || '-',
            },
            {
              title: '用途',
              dataIndex: 'purpose',
              key: 'purpose',
              width: 120,
              render: (text: string) => text || '-',
            },
            {
              title: '备注',
              dataIndex: 'remark',
              key: 'remark',
              width: 120,
              render: (text: string) => text || '-',
            },
          ]}
          dataSource={selectedGuardPoints}
          rowKey="pointId"
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 900 }}
        />
      </Modal>

      {/* 错误弹窗 */}
      <Modal
        title="导入失败"
        open={errorModalVisible}
        onCancel={() => setErrorModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setErrorModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <div style={{
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            color: '#cf1322',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            ❌ 导入过程中发生错误
          </div>
          <div
            style={{
              color: '#434343',
              fontSize: '14px',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{ __html: errorMessage }}
          />
        </div>
        <div style={{
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '13px',
          color: '#52c41a'
        }}>
          💡 请检查以下内容：
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>确保Excel文件格式正确</li>
            <li>检查必填字段是否完整</li>
            <li>验证数据格式是否符合要求</li>
            <li>确认关联的部门信息是否存在</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default SafetyOfficerManagement; 