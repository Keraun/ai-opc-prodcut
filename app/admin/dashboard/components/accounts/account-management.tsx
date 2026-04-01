"use client"

import { Typography, Modal, Input, Popconfirm, Form } from "@arco-design/web-react"
import { User as IconUser, Plus as IconPlus, Trash2 as IconTrash2, Edit as IconEdit, Eye as IconEye } from "lucide-react"
import { useAccountManagement } from "./useAccountManagementHook"
import { ManagementHeader } from "../ManagementHeader"
import { CommonTable, ActionButton } from "../CommonTable"
import styles from "../../dashboard.module.css"

// Get current user info from session storage
const getCurrentUser = (): any => {
  const userStr = sessionStorage.getItem('currentUser')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

export function AccountManagement() {
  const currentUser = getCurrentUser()
  const currentUserRole = currentUser?.role || 'operator'
  const currentUsername = currentUser?.username || ''
  const isOperator = currentUserRole === 'operator'
  
  const {
    accounts,
    loadingAccounts,
    showAddAccountModal,
    newAccount,
    setNewAccount,
    showDeleteAccountModal,
    accountToDelete,
    showEditAccountModal,
    editedAccount,
    setEditedAccount,
    handleAddAccount,
    handleDeleteAccount,
    handleEditAccount,
    openAddAccountModal,
    openDeleteAccountModal,
    openEditAccountModal,
    openViewPasswordModal,
    closeAddAccountModal,
    closeEditAccountModal,
    closeDeleteAccountModal,
    closeViewPasswordModal,
    showViewPasswordModal,
    accountToView
  } = useAccountManagement()

  return (
    <div className={styles.accountManagementContainer}>
      <ManagementHeader
        title="账号管理"
        description="管理系统账号，新增或删除账号"
        buttonText="新增账号"
        buttonIcon={<IconPlus />}
        onButtonClick={openAddAccountModal}
        buttonDisabled={isOperator}
      />

      <CommonTable
        data={accounts}
        loading={loadingAccounts}
        columns={[
          {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
          },
          {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
          },
          {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
              switch (role) {
                case 'admin':
                  return '管理员';
                case 'operator':
                  return '操作员';
                default:
                  return role;
              }
            }
          },
          {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
          },
          {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => {
              // 判断是否是超管账号
              const isSuperAdminAccount = record.isSuperAdmin === true
              // 判断是否是自己的账号
              const isSelf = record.username === currentUsername
              // 超管账号不能被删除
              const canDelete = !isOperator && !isSuperAdminAccount
              // 超管账号不能被其他管理员修改密码和查看密码，但是可以修改自己的密码
              const canEditPassword = !isOperator && (isSelf || !isSuperAdminAccount)
              const canViewPassword = !isOperator && (isSelf || !isSuperAdminAccount)
              
              return (
                <div style={{ display: 'flex', gap: 8 }}>
                  <ActionButton
                    type="primary"
                    icon={<IconEdit size={16} />}
                    onClick={() => openEditAccountModal(record)}
                    disabled={!canEditPassword}
                  >
                    修改
                  </ActionButton>
                  <ActionButton
                    type="default"
                    icon={<IconEye size={16} />}
                    onClick={() => openViewPasswordModal(record)}
                    disabled={!canViewPassword}
                  >
                    查看密码
                  </ActionButton>
                  <Popconfirm
                    title={`确定要删除账号 ${record.username} 吗？`}
                    onConfirm={() => openDeleteAccountModal(record)}
                    disabled={!canDelete}
                  >
                    <ActionButton
                      type="danger"
                      icon={<IconTrash2 size={16} />}
                      onClick={() => openDeleteAccountModal(record)}
                      disabled={!canDelete}
                    >
                      删除
                    </ActionButton>
                  </Popconfirm>
                </div>
              )
            },
          },
        ]}
        pagination={false}
        emptyText="暂无账号数据"
      />

      {/* 添加账号弹窗 */}
      <Modal
        title="新增账号"
        visible={showAddAccountModal}
        onOk={handleAddAccount}
        onCancel={closeAddAccountModal}
        okText="添加"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="用户名" required>
            <Input 
              value={newAccount.username} 
              onChange={(value) => setNewAccount({...newAccount, username: value})}
              placeholder="请输入用户名"
              allowClear
            />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input 
              type="password"
              value={newAccount.password} 
              onChange={(value) => setNewAccount({...newAccount, password: value})}
              placeholder="请输入密码"
              allowClear
            />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input 
              value={newAccount.email} 
              onChange={(value) => setNewAccount({...newAccount, email: value})}
              placeholder="请输入邮箱"
              allowClear
            />
          </Form.Item>
          <Form.Item label="备注">
            <Input 
              value={newAccount.remark} 
              onChange={(value) => setNewAccount({...newAccount, remark: value})}
              placeholder="请输入备注"
              allowClear
            />
          </Form.Item>
          <Form.Item label="角色" required>
            <select
              value={newAccount.role}
              onChange={(e) => setNewAccount({...newAccount, role: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
              disabled
            >
              <option value="operator">操作员</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑账号弹窗 */}
      <Modal
        title="修改账号"
        visible={showEditAccountModal}
        onOk={handleEditAccount}
        onCancel={closeEditAccountModal}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="用户名">
            <Input 
              value={editedAccount?.username} 
              disabled
            />
          </Form.Item>
          <Form.Item label="新密码（留空则不修改）">
            <Input 
              type="password"
              value={editedAccount?.password} 
              onChange={(value) => setEditedAccount({...editedAccount, password: value})}
              placeholder="请输入新密码"
              allowClear
            />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input 
              value={editedAccount?.email} 
              onChange={(value) => setEditedAccount({...editedAccount, email: value})}
              placeholder="请输入邮箱"
              allowClear
            />
          </Form.Item>
          <Form.Item label="备注">
            <Input 
              value={editedAccount?.remark} 
              onChange={(value) => setEditedAccount({...editedAccount, remark: value})}
              placeholder="请输入备注"
              allowClear
            />
          </Form.Item>
          <Form.Item label="角色" required>
            <select
              value={editedAccount?.role}
              onChange={(e) => setEditedAccount({...editedAccount, role: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            >
              <option value="admin">管理员</option>
              <option value="operator">操作员</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除账号确认弹窗 */}
      <Modal
        title="删除账号"
        visible={showDeleteAccountModal}
        onOk={handleDeleteAccount}
        onCancel={closeDeleteAccountModal}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ status: 'danger' }}
      >
        <Typography.Text>确定要删除账号 {accountToDelete?.username} 吗？此操作不可恢复。</Typography.Text>
      </Modal>

      {/* 查看密码弹窗 */}
      <Modal
        title="查看密码"
        visible={showViewPasswordModal}
        onCancel={closeViewPasswordModal}
        okText="关闭"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="用户名">
            <Input 
              value={accountToView?.username} 
              disabled
            />
          </Form.Item>
          <Form.Item label="密码">
            <Input 
              value={accountToView?.password} 
              disabled
            />
          </Form.Item>
        </Form>
      </Modal>


    </div>
  )
}
