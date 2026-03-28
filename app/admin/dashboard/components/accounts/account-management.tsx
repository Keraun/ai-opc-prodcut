"use client"

import { Button, Card, Typography, Modal, Input, Table, Popconfirm, Form } from "@arco-design/web-react"
import { User as IconUser, Plus as IconPlus, Trash2 as IconTrash2, Edit as IconEdit } from "lucide-react"
import { useAccountManagement } from "./useAccountManagementHook"
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
      <div className={styles.accountManagementHeader}>
        <div className={styles.accountManagementHeaderContent}>
          <div className={styles.accountManagementHeaderIcon}>
            <IconUser className={styles.accountManagementHeaderIconSvg} />
          </div>
          <div className={styles.accountManagementHeaderText}>
            <h1 className={styles.accountManagementHeaderTitle}>账号管理</h1>
            <p className={styles.accountManagementHeaderSubtitle}>管理系统账号，新增或删除账号</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<IconPlus />}
          onClick={openAddAccountModal}
          className={styles.accountManagementAddButton}
        >
          新增账号
        </Button>
      </div>

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
          className={styles.accountManagementTable}
        />
      </Card>

      <Modal
        title="验证超级管理员权限"
        visible={showSuperAdminPasswordModal}
        onCancel={closeSuperAdminPasswordModal}
        footer={
          <>
            <Button onClick={closeSuperAdminPasswordModal}>取消</Button>
            <Button type="primary" onClick={handleSuperAdminPasswordConfirm}>确认</Button>
          </>
        }
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary">请输入当前账户密码以执行此操作：</Typography.Text>
          </div>
          <Input.Password
            placeholder="请输入当前账户密码"
            value={superAdminPasswordForAction}
            onChange={setSuperAdminPasswordForAction}
            onPressEnter={handleSuperAdminPasswordConfirm}
          />
        </div>
      </Modal>

      <Modal
        title="新增账号"
        visible={showAddAccountModal}
        onCancel={closeAddAccountModal}
        footer={
          <>
            <Button onClick={closeAddAccountModal}>取消</Button>
            <Button type="primary" onClick={handleAddAccount}>确认</Button>
          </>
        }
        className={styles.accountManagementModal}
      >
        <div style={{ padding: "16px 0" }}>
          <Form layout="vertical">
            <Form.Item label="用户名" required>
              <Input
                placeholder="请输入用户名"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e })}
              />
            </Form.Item>
            <Form.Item label="密码" required>
              <Input.Password
                placeholder="请输入密码"
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e })}
              />
            </Form.Item>
            <Form.Item label="邮箱" required>
              <Input
                placeholder="请输入邮箱"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e })}
              />
            </Form.Item>
            <Form.Item label="备注">
              <Input
                placeholder="请输入备注（可选）"
                value={newAccount.remark}
                onChange={(e) => setNewAccount({ ...newAccount, remark: e })}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title="修改账号"
        visible={showEditAccountModal}
        onCancel={closeEditAccountModal}
        footer={
          <>
            <Button onClick={closeEditAccountModal}>取消</Button>
            <Button type="primary" onClick={handleEditAccount}>确认修改</Button>
          </>
        }
        className={styles.accountManagementModal}
      >
        <div style={{ padding: "16px 0" }}>
          <Form layout="vertical">
            <Form.Item label="用户名" required>
              <Input
                placeholder="请输入用户名"
                value={editedAccount.username}
                disabled
              />
            </Form.Item>
            <Form.Item label="密码">
              <Input.Password
                placeholder="请输入密码（留空表示不修改）"
                value={editedAccount.password}
                onChange={(e) => setEditedAccount({ ...editedAccount, password: e })}
              />
            </Form.Item>
            <Form.Item label="邮箱" required>
              <Input
                placeholder="请输入邮箱"
                value={editedAccount.email}
                onChange={(e) => setEditedAccount({ ...editedAccount, email: e })}
              />
            </Form.Item>
            <Form.Item label="备注">
              <Input
                placeholder="请输入备注（可选）"
                value={editedAccount.remark}
                onChange={(e) => setEditedAccount({ ...editedAccount, remark: e })}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title="删除账号"
        visible={showDeleteAccountModal}
        onCancel={closeDeleteAccountModal}
        footer={
          <>
            <Button onClick={closeDeleteAccountModal}>取消</Button>
            <Button type="primary" status="danger" onClick={handleDeleteAccount}>确认删除</Button>
          </>
        }
        className={styles.accountManagementModal}
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary">
              您确定要删除账号 <strong>{accountToDelete?.username}</strong> 吗？
            </Typography.Text>
            <p style={{ marginTop: 8, color: "var(--color-danger)" }}>
              此操作不可逆，删除后将无法恢复。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
