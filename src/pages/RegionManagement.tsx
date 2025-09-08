import React, { useState, useEffect } from 'react';
import {
  Tree,
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
  InputNumber,
  TreeSelect,
  Dropdown,
  Typography,
  MenuProps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { Department, DepartmentForm, DepartmentQuery, DepartmentFormWithDeptId } from '../types';
import { departmentApi } from '../services/api';

const { Text } = Typography;

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  icon?: React.ReactNode;
  isLeaf?: boolean;
  data: Department;
}

const RegionManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState<DepartmentQuery>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [parentDepartments, setParentDepartments] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 构建树形数据结构
  const buildTreeData = (departments: Department[], searchValue?: string): TreeNode[] => {
    const map = new Map<string, Department>();
    const roots: TreeNode[] = [];

    // 创建映射
    departments.forEach(dept => {
      if (dept.deptId) {
        map.set(dept.deptId.toString(), dept);
      }
    });

    departments.forEach(dept => {
      const isHighlighted = searchValue &&
        dept.deptName?.toLowerCase().includes(searchValue.toLowerCase());

      const nodeTitle = (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '32px',
          padding: '4px 8px',
          backgroundColor: isHighlighted ? '#fff1b8' : 'transparent',
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Text strong style={{ marginRight: '8px' }}>
              {dept.deptName || '未命名部门'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              (排序: {dept.orderNum || 0}, 点位: {dept.pointCount || 0})
            </Text>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{
                items: getMenuItems(dept),
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  handleMenuClick(key, dept);
                }
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
      );

      const treeNode: TreeNode = {
        key: dept.deptId?.toString() || '',
        title: nodeTitle,
        data: dept,
        children: [],
        icon: <FolderOutlined />
      };

      if (!dept.parentId || dept.parentId === 0 || !map.has(dept.parentId.toString())) {
        // 根节点
        roots.push(treeNode);
      } else {
        // 子节点
        const parent = map.get(dept.parentId.toString());
        if (parent && parent.deptId) {
          let parentNode = findNodeInTree(roots, parent.deptId.toString());
          if (!parentNode) {
            // 如果父节点还没有被创建，先创建父节点
            const parentTreeNode: TreeNode = {
              key: parent.deptId.toString(),
              title: createNodeTitle(parent),
              data: parent,
              children: [treeNode],
              icon: <FolderOutlined />
            };
            roots.push(parentTreeNode);
          } else {
            parentNode.children = parentNode.children || [];
            parentNode.children.push(treeNode);
          }
        }
      }
    });

    // 排序
    const sortTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .sort((a, b) => (a.data.orderNum || 0) - (b.data.orderNum || 0))
        .map(node => ({
          ...node,
          children: node.children ? sortTree(node.children) : undefined
        }));
    };

    return sortTree(roots);
  };

  // 在树中查找节点
  const findNodeInTree = (nodes: TreeNode[], key: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNodeInTree(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 创建节点标题
  const createNodeTitle = (dept: Department) => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '32px',
        padding: '4px 8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Text strong style={{ marginRight: '8px' }}>
            {dept.deptName || '未命名部门'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            (排序: {dept.orderNum || 0}, 点位: {dept.pointCount || 0})
          </Text>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: getMenuItems(dept),
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                handleMenuClick(key, dept);
              }
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      </div>
    );
  };

  // 获取菜单项
  const getMenuItems = (dept: Department): MenuProps['items'] => [
    {
      key: 'addChild',
      label: '添加子部门',
      icon: <PlusOutlined />
    },
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true
    }
  ];

  // 处理菜单点击
  const handleMenuClick = async (key: string, dept: Department) => {
    switch (key) {
      case 'addChild':
        handleAddChild(dept);
        break;
      case 'edit':
        handleEdit(dept);
        break;
      case 'delete':
        Modal.confirm({
          title: '确定要删除这个部门吗？',
          content: '删除后将无法恢复，且会影响所有子部门。',
          okText: '确定',
          cancelText: '取消',
          onOk: () => handleDelete(dept.deptId || 0)
        });
        break;
    }
  };

  // 获取部门列表（用于表格分页显示）
  const fetchDepartments = async (pageNum = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // 注意：由于API文档中没有分页的部门列表接口，这里使用树形接口
      const response = await departmentApi.getDepartmentTree(searchQuery);
      setDepartments(response.data);
      // console.log("searchQuery", searchQuery);
      // console.log("response", response);
      setPagination(prev => ({
        ...prev,
        current: pageNum,
        pageSize: pageSize,
        total: response.data.length
      }));
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有部门数据（用于构建树形结构）
  const fetchAllDepartments = async () => {
    setTreeLoading(true);
    try {
      const response = await departmentApi.getDepartmentTree({
        deptName: searchValue
      });
      console.log("treeRespnse", response);
      setAllDepartments(response.data);
      const tree = buildTreeData(response.data, searchValue);
      setTreeData(tree);

      // 默认展开所有节点
      const allKeys = getAllNodeKeys(tree);
      setExpandedKeys(allKeys);
    } catch (error) {
      console.error('获取树形数据失败');
    } finally {
      setTreeLoading(false);
    }
  };

  // 获取所有节点的key
  const getAllNodeKeys = (nodes: TreeNode[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        keys.push(node.key);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  // 获取父级部门列表
  const fetchParentDepartments = async () => {
    try {
      const response = await departmentApi.getDepartmentTree();
      const treeSelectData = response.data.map(dept => ({
        id: dept.deptId || 0,
        label: dept.deptName || '未命名部门',
        value: dept.deptId || 0
      }));
      setParentDepartments(treeSelectData);
    } catch (error) {
      console.error('获取父级部门列表失败');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchParentDepartments();
  }, [searchQuery]);

  useEffect(() => {
    fetchAllDepartments();
  }, [searchValue]);

  // 搜索功能
  const handleSearch = (values: DepartmentQuery) => {
    values.deptName = values.deptName || "";
    values.deptCode = values.deptCode || "";
    setSearchValue(values.deptName || '');
    setSearchQuery(values);
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页

    // 同时更新左侧树和右侧列表
    // fetchDepartments(1, pagination.pageSize);
    // fetchAllDepartments();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSearchQuery({});
    setSearchValue('');
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
  };

  // 树节点选择
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    const stringKeys = selectedKeys.map(key => key.toString());
    setSelectedKeys(stringKeys);
    if (stringKeys.length > 0) {
      const selectedId = stringKeys[0];
      const selectedDept = allDepartments.find(d => d.deptId?.toString() === selectedId);
      if (selectedDept) {
        // 可以在这里添加选中树节点后的操作，比如高亮表格中对应的行
        console.log('选中部门:', selectedDept);
      }
    }
  };

  // 新增部门
  const handleAdd = () => {
    setEditingDepartment(null);
    setModalVisible(true);
    form.resetFields();
  };

  // 新增子部门
  const handleAddChild = (parentDept: Department) => {
    setEditingDepartment(null);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      parentId: parentDept.deptId || 0
    });
  };

  // 编辑部门
  const handleEdit = (record: Department) => {
    setEditingDepartment(record);
    setModalVisible(true);
    form.setFieldsValue({
      // deptId: record.deptId, // 添加 deptId
      deptName: record.deptName,
      deptCode: record.deptCode,
      parentId: record.parentId || 0,
      orderNum: record.orderNum || 0,
      remark: record.remark || '',
    });
  };

  // 删除部门
  const handleDelete = async (deptId: number) => {
    try {
      await departmentApi.deleteDepartments(deptId.toString());
      message.success('删除成功');
      fetchDepartments(); // 刷新表格数据
      fetchAllDepartments(); // 刷新树形数据
      fetchParentDepartments(); // 刷新父级部门选项
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: DepartmentForm) => {
    try {
      // 注意：API文档中没有创建和更新部门的接口，这里保留原有逻辑
      // 实际使用时需要根据后端提供的接口进行调整
      // message.warning('部门创建和更新功能需要后端提供相应接口');
      if (!editingDepartment) {
        // console.log(values);
        await departmentApi.createDepartment(values);

      }
      else {
        console.log(values); //缺少deptId
        const departmentFormWithDeptId: DepartmentFormWithDeptId = {
          ...values,
          deptId: (editingDepartment.deptId)?.toString() as string,
        };
        await departmentApi.updateDepartment(departmentFormWithDeptId);
      }
      setModalVisible(false);

      // 自动刷新数据
      fetchDepartments(); // 刷新表格数据
      fetchAllDepartments(); // 刷新树形数据
    } catch (error) {
      console.log(error);
      message.error(editingDepartment ? '更新失败' : '新增失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '部门名称',
      dataIndex: 'deptName',
      key: 'deptName',
    },
    {
      title: '部门编码',
      dataIndex: 'deptCode',
      key: 'deptCode',
    },
    {
      title: '父级部门',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number) => {
        if (!parentId || parentId === 0) return '-';
        const parent = parentDepartments.find(p => p.id === parentId);
        return parent ? parent.label : parentId;
      },
    },
    {
      title: '排序号',
      dataIndex: 'orderNum',
      key: 'orderNum',
      render: (num: number) => num || 0,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text: string) => text || '-',
    },
    {
      title: '点位数量',
      dataIndex: 'pointCount',
      key: 'pointCount',
      render: (count: number) => count || 0,
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
      render: (_: any, record: Department) => (
        <Space size={4}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个部门吗？"
            onConfirm={() => handleDelete(record.deptId || 0)}
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
      <Card title="部门管理" style={{ marginBottom: 20 }}>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 20 }}
        >
          <Form.Item name="deptName" label="部门名称">
            <Input placeholder="请输入部门名称" allowClear />
          </Form.Item>
          <Form.Item name="deptCode" label="部门编码">
            <Input placeholder="请输入部门编码" allowClear />
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增部门
            </Button>
          </Col>
        </Row>

        {/* 左右分栏布局 */}
        <Row gutter={16}>
          {/* 左侧树形结构 */}
          <Col span={6}>
            <Card title="部门树" size="small" style={{ height: '500px' }}>
              <div style={{
                height: '420px',
                overflow: 'auto'
              }}>
                {treeLoading ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                  }}>
                    加载中...
                  </div>
                ) : (
                  <Tree
                    showIcon
                    showLine
                    blockNode
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    onExpand={(keys) => setExpandedKeys(keys as string[])}
                    onSelect={handleTreeSelect}
                    treeData={treeData}
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
              </div>
            </Card>
          </Col>

          {/* 右侧表格 */}
          <Col span={18}>
            <Card title="部门列表" size="small" style={{ height: '500px' }}>
              <Table
                columns={columns}
                dataSource={departments}
                rowKey="deptId"
                loading={loading}
                size="small"
                scroll={{ y: 350 }}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                  onChange: (page, pageSize) => {
                    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
                    fetchDepartments(page, pageSize);
                  },
                }}
                rowClassName={(record) =>
                  selectedKeys.includes(record.deptId?.toString() || '') ? 'ant-table-row-selected' : ''
                }
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingDepartment ? '编辑部门' : '新增部门'}
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
          initialValues={{ deptName: '', deptCode: '', parentId: 0, orderNum: 0, remark: '', status: '0' }}
        >
          <Form.Item
            name="deptName"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>

          <Form.Item
            name="deptCode"
            label="部门编码"
            rules={[{ required: true, message: '请输入部门编码' }]}
          >
            <Input placeholder="请输入部门编码" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="父级部门"
          >
            <TreeSelect
              placeholder="请选择父级部门（可选）"
              allowClear
              treeData={parentDepartments}
              fieldNames={{ label: 'label', value: 'value' }}
              showSearch // 启用搜索功能
              filterTreeNode={(inputValue, treeNode) => {
                // 本地搜索逻辑：根据输入值匹配节点的 label
                return (treeNode.label as string).toLowerCase().includes(inputValue.toLowerCase());
              }}
            />
          </Form.Item>

          <Form.Item
            name="orderNum"
            label="排序号"
          >
            <InputNumber
              placeholder="请输入排序号"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea
              placeholder="请输入部门备注（可选）"
              rows={4}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space size="small">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingDepartment ? '更新' : '新增'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegionManagement; 