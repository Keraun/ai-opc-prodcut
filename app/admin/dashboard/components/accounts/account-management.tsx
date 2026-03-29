"use client"

import { Button, Card, Typography, Modal, Input, Table, Popconfirm, Form } from "@arco-design/web-react"
import { User as IconUser, Plus as IconPlus, Trash2 as IconTrash2, Edit as IconEdit } from "lucide-react"
import { useAccountManagement } from "./useAccountManagementHook"
import { ManagementHeader } from "../ManagementHeader"
import styles from "../../dashboard.module.css"

export function AccountManagement() {
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
    showSuperAdminPasswordModal,
    superAdminPasswordForAction,
    setSuperAdminPasswordForAction,
    handleAddAccount,
    handleDeleteAccount,
    handleEditAccount,
    openAddAccountModal,
    openDeleteAccountModal,
    openEditAccountModal,
    handleSuperAdminPasswordConfirm,
    closeSuperAdminPasswordModal,
    closeAddAccountModal,
    closeEditAccountModal,
    closeDeleteAccountModal
  } = useAccountManagement()

  return (
    <div className={styles.accountManagementContainer}>
      <ManagementHeader
        title="账号管理"
        description="管理系统账号，新增或删除账号"
        buttonText="新增账号"
        buttonIcon={<IconPlus />}
        onButtonClick={openAddAccountModal}
      />

      <Card 
        className={styles.accountManagementCard}
        bordered={false}
      >
        <Table 
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
              title: '备注',
              dataIndex: 'remark',
              key: 'remark',
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button 
                    type="text" 
                    icon={<IconEdit />}
                    onClick={() => openEditAccountModal(record)}
                  >
                    修改
                  </Button>
                  <Popconfirm
                    title={`确定要删除账号 ${record.username} 吗？`}
                    onConfirm={() => openDeleteAccountModal(record)}
                    disabled={record.username === 'admin'}
                  >
                    <Button 
                      type="text" 
                      status="danger"
                      icon={<IconTrash2 />}
                      disabled={record.username === 'admin'}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              ),
            },
          ]}
          pagination={false}
        />
      </Card>

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
            />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input 
              type="password"
              value={newAccount.password} 
              onChange={(value) => setNewAccount({...newAccount, password: value})}
              placeholder="请输入密码"
            />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input 
              value={newAccount.email} 
              onChange={(value) => setNewAccount({...newAccount, email: value})}
              placeholder="请输入邮箱"
            />
          </Form.Item>
          <Form.Item label="备注">
            <Input 
              value={newAccount.remark} 
              onChange={(value) => setNewAccount({...newAccount, remark: value})}
              placeholder="请输入备注"
            />
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
            />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input 
              value={editedAccount?.email} 
              onChange={(value) => setEditedAccount({...editedAccount, email: value})}
              placeholder="请输入邮箱"
            />
          </Form.Item>
          <Form.Item label="备注">
            <Input 
              value={editedAccount?.remark} 
              onChange={(value) => setEditedAccount({...editedAccount, remark: value})}
              placeholder="请输入备注"
            />
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

      {/* 超级管理员密码确认弹窗 */}
      <Modal
        title="安全验证"
        visible={showSuperAdminPasswordModal}
        onOk={handleSuperAdminPasswordConfirm}
        onCancel={closeSuperAdminPasswordModal}
        okText="确认"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="请输入超级管理员密码" required>
            <Input 
              type="password"
              value={superAdminPasswordForAction} 
              onChange={(value) => setSuperAdminPasswordForAction(value)}
              placeholder="请输入超级管理员密码进行验证"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
