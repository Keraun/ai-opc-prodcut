"use client"

import { useState, useEffect } from "react"
import { Button, Card, Typography, Divider, Modal, Input, Message, Table, Popconfirm, Form } from "@arco-design/web-react"
import { 
  IconUser, 
  IconPlus, 
  IconDelete,
  IconEdit
} from "@arco-design/web-react/icon"
import styles from "../../dashboard.module.css"

export function AccountManagement() {
  // 账号管理相关状态
  const [accounts, setAccounts] = useState<any[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    email: "",
    remark: ""
  })
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<any>(null)
  const [showEditAccountModal, setShowEditAccountModal] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<any>(null)
  const [editedAccount, setEditedAccount] = useState({
    username: "",
    password: "",
    email: "",
    remark: ""
  })
  const [showSuperAdminPasswordModal, setShowSuperAdminPasswordModal] = useState(false)
  const [superAdminPasswordForAction, setSuperAdminPasswordForAction] = useState("")
  const [actionType, setActionType] = useState<string | null>(null)
  const [hasValidSuperAdminToken, setHasValidSuperAdminToken] = useState(false)
  
  // 加载账号列表
  useEffect(() => {
    loadAccounts()
  }, [])
  
  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true)
      const response = await fetch("/api/admin/accounts")
      const data = await response.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error("加载账号失败:", error)
    } finally {
      setLoadingAccounts(false)
    }
  }
  
  // 验证超级管理员密码
  const verifySuperAdminPassword = async (password: string) => {
    try {
      const response = await fetch("/api/admin/super-admin-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("验证超级管理员密码失败:", error)
      return false
    }
  }
  
  // 处理需要超级管理员权限的操作
  const handleActionWithSuperAdmin = async (action: () => Promise<void>) => {
    if (hasValidSuperAdminToken) {
      await action()
      return
    }
    
    const isValid = await verifySuperAdminPassword(superAdminPasswordForAction)
    if (isValid) {
      setHasValidSuperAdminToken(true)
      await action()
    } else {
      Message.error("超级管理员密码错误")
    }
  }
  
  // 处理添加账号
  const handleAddAccount = async () => {
    if (!newAccount.username || !newAccount.password || !newAccount.email) {
      Message.error("请填写完整的账号信息")
      return
    }
    
    const action = async () => {
      try {
        const response = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAccount),
        })
        const data = await response.json()
        if (data.success) {
          Message.success("账号添加成功")
          setShowAddAccountModal(false)
          setNewAccount({ username: "", password: "", email: "", remark: "" })
          loadAccounts()
        } else {
          Message.error(data.message || "账号添加失败")
        }
      } catch (error) {
        console.error("添加账号失败:", error)
        Message.error("账号添加失败")
      }
    }
    
    await handleActionWithSuperAdmin(action)
  }
  
  // 处理删除账号
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return
    
    const action = async () => {
      try {
        const response = await fetch(`/api/admin/accounts/${accountToDelete.username}`, {
          method: "DELETE",
        })
        const data = await response.json()
        if (data.success) {
          Message.success("账号删除成功")
          setShowDeleteAccountModal(false)
          setAccountToDelete(null)
          loadAccounts()
        } else {
          Message.error(data.message || "账号删除失败")
        }
      } catch (error) {
        console.error("删除账号失败:", error)
        Message.error("账号删除失败")
      }
    }
    
    await handleActionWithSuperAdmin(action)
  }
  
  // 处理修改账号
  const handleEditAccount = async () => {
    if (!editedAccount.email) {
      Message.error("请输入邮箱")
      return
    }
    
    const action = async () => {
      try {
        const response = await fetch(`/api/admin/accounts/${editedAccount.username}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedAccount),
        })
        const data = await response.json()
        if (data.success) {
          Message.success("账号修改成功")
          setShowEditAccountModal(false)
          setAccountToEdit(null)
          setEditedAccount({ username: "", password: "", email: "", remark: "" })
          loadAccounts()
        } else {
          Message.error(data.message || "账号修改失败")
        }
      } catch (error) {
        console.error("修改账号失败:", error)
        Message.error("账号修改失败")
      }
    }
    
    await handleActionWithSuperAdmin(action)
  }
  
  // 打开添加账号弹窗
  const openAddAccountModal = () => {
    if (hasValidSuperAdminToken) {
      setShowAddAccountModal(true)
    } else {
      setActionType("add")
      setShowSuperAdminPasswordModal(true)
      setSuperAdminPasswordForAction("")
    }
  }
  
  // 打开删除账号弹窗
  const openDeleteAccountModal = (account: any) => {
    setAccountToDelete(account)
    if (hasValidSuperAdminToken) {
      setShowDeleteAccountModal(true)
    } else {
      setActionType("delete")
      setShowSuperAdminPasswordModal(true)
      setSuperAdminPasswordForAction("")
    }
  }
  
  // 打开修改账号弹窗
  const openEditAccountModal = (account: any) => {
    setAccountToEdit(account)
    setEditedAccount({
      username: account.username,
      password: "",
      email: account.email,
      remark: account.remark || ""
    })
    if (hasValidSuperAdminToken) {
      setShowEditAccountModal(true)
    } else {
      setActionType("edit")
      setShowSuperAdminPasswordModal(true)
      setSuperAdminPasswordForAction("")
    }
  }

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
          type="default" 
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
                <Popconfirm
                  title={`确定要删除账号 ${record.username} 吗？`}
                  onConfirm={() => openDeleteAccountModal(record)}
                  disabled={record.username === 'admin'}
                >
                  <Button 
                    type="text" 
                    status="danger" 
                    icon={<IconDelete />}
                    disabled={record.username === 'admin'}
                  >
                    删除
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          pagination={false}
          className={styles.accountManagementTable}
        />
      </Card>

      {/* 超级管理员密码验证弹窗 */}
      <Modal
        title="验证超级管理员权限"
        visible={showSuperAdminPasswordModal}
        onCancel={() => {
          setShowSuperAdminPasswordModal(false)
          setSuperAdminPasswordForAction("")
          setActionType(null)
        }}
        footer={
          <>
            <Button 
              onClick={() => {
                setShowSuperAdminPasswordModal(false)
                setSuperAdminPasswordForAction("")
                setActionType(null)
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                if (!superAdminPasswordForAction) {
                  Message.error("请输入当前账户密码")
                  return
                }
                
                const isValid = await verifySuperAdminPassword(superAdminPasswordForAction)
                if (isValid) {
                  setHasValidSuperAdminToken(true)
                  setShowSuperAdminPasswordModal(false)
                  
                  if (actionType === "add") {
                    setShowAddAccountModal(true)
                  } else if (actionType === "delete" && accountToDelete) {
                    setShowDeleteAccountModal(true)
                  }
                } else {
                  Message.error("密码错误")
                }
              }}
            >
              确认
            </Button>
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
            onPressEnter={async () => {
              if (!superAdminPasswordForAction) {
                Message.error("请输入当前账户密码")
                return
              }
              
              const isValid = await verifySuperAdminPassword(superAdminPasswordForAction)
              if (isValid) {
                setHasValidSuperAdminToken(true)
                setShowSuperAdminPasswordModal(false)
                
                if (actionType === "add") {
                  setShowAddAccountModal(true)
                } else if (actionType === "delete" && accountToDelete) {
                  setShowDeleteAccountModal(true)
                }
              } else {
                Message.error("密码错误")
              }
            }}
          />
        </div>
      </Modal>

      {/* 新增账号弹窗 */}
      <Modal
        title="新增账号"
        visible={showAddAccountModal}
        onCancel={() => {
          setShowAddAccountModal(false)
          setNewAccount({ username: "", password: "", email: "", remark: "" })
        }}
        footer={
          <>
            <Button 
              onClick={() => {
                setShowAddAccountModal(false)
                setNewAccount({ username: "", password: "", email: "", remark: "" })
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleAddAccount}
            >
              确认
            </Button>
          </>
        }
        className={styles.accountManagementModal}
      >
        <div style={{ padding: "16px 0" }}>
          <Form layout="vertical">
            <Form.Item
              label="用户名"
              required
            >
              <Input
                placeholder="请输入用户名"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e })}
              />
            </Form.Item>
            <Form.Item
              label="密码"
              required
            >
              <Input.Password
                placeholder="请输入密码"
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e })}
              />
            </Form.Item>
            <Form.Item
              label="邮箱"
              required
            >
              <Input
                placeholder="请输入邮箱"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e })}
              />
            </Form.Item>
            <Form.Item
              label="备注"
            >
              <Input
                placeholder="请输入备注（可选）"
                value={newAccount.remark}
                onChange={(e) => setNewAccount({ ...newAccount, remark: e })}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 删除账号弹窗 */}
      <Modal
        title="删除账号"
        visible={showDeleteAccountModal}
        onCancel={() => {
          setShowDeleteAccountModal(false)
          setAccountToDelete(null)
        }}
        footer={
          <>
            <Button 
              onClick={() => {
                setShowDeleteAccountModal(false)
                setAccountToDelete(null)
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              status="danger"
              onClick={handleDeleteAccount}
            >
              确认删除
            </Button>
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
