"use client"

import { useState, useEffect } from "react"
import { Button, Card, Typography, Divider, Modal, Input, Table, Popconfirm, Form } from "@arco-design/web-react"
import { User as IconUser, Plus as IconPlus, Trash2 as IconTrash2, Edit as IconEdit } from "lucide-react"
import { toast } from "sonner"
import { 
  getAccounts, 
  addAccount, 
  deleteAccount, 
  updateAccount,
  getSuperAdminToken 
} from "@/lib/api-client"
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
      const result = await getAccounts()
      if (result.success && result.accounts) {
        setAccounts(result.accounts)
      }
    } catch (error) {
      console.error("加载账号失败:", error)
    } finally {
      setLoadingAccounts(false)
    }
  }
  
  const verifySuperAdminPassword = async (password: string) => {
    const result = await getSuperAdminToken(password)
    return result.success
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
      toast.error("超级管理员密码错误")
    }
  }
  
  const handleAddAccount = async () => {
    if (!newAccount.username || !newAccount.password || !newAccount.email) {
      toast.error("请填写完整的账号信息")
      return
    }
    
    const action = async () => {
      try {
        const result = await addAccount(newAccount)
        if (result.success) {
          toast.success("账号添加成功")
          setShowAddAccountModal(false)
          setNewAccount({ username: "", password: "", email: "", remark: "" })
          loadAccounts()
        } else {
          toast.error(result.message || "账号添加失败")
        }
      } catch (error) {
        console.error("添加账号失败:", error)
        toast.error("账号添加失败")
      }
    }
    
    await handleActionWithSuperAdmin(action)
  }
  
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return
    
    const action = async () => {
      try {
        const result = await deleteAccount(accountToDelete.username)
        if (result.success) {
          toast.success("账号删除成功")
          setShowDeleteAccountModal(false)
          setAccountToDelete(null)
          loadAccounts()
        } else {
          toast.error(result.message || "账号删除失败")
        }
      } catch (error) {
        console.error("删除账号失败:", error)
        toast.error("账号删除失败")
      }
    }
    
    await handleActionWithSuperAdmin(action)
  }
  
  const handleEditAccount = async () => {
    if (!editedAccount.email) {
      toast.error("请输入邮箱")
      return
    }
    
    const action = async () => {
      try {
        const result = await updateAccount(editedAccount.username, editedAccount)
        if (result.success) {
          toast.success("账号修改成功")
          setShowEditAccountModal(false)
          setAccountToEdit(null)
          setEditedAccount({ username: "", password: "", email: "", remark: "" })
          loadAccounts()
        } else {
          toast.error(result.message || "账号修改失败")
        }
      } catch (error) {
        console.error("修改账号失败:", error)
        toast.error("账号修改失败")
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
                  toast.error("请输入当前账户密码")
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
                  } else if (actionType === "edit" && accountToEdit) {
                    setShowEditAccountModal(true)
                  }
                } else {
                  console.error("密码错误")
                  toast.error("密码错误")
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
                toast.error("请输入当前账户密码")
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
                } else if (actionType === "edit" && accountToEdit) {
                  setShowEditAccountModal(true)
                }
              } else {
                console.error("密码错误")
                toast.error("密码错误")
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

      {/* 修改账号弹窗 */}
      <Modal
        title="修改账号"
        visible={showEditAccountModal}
        onCancel={() => {
          setShowEditAccountModal(false)
          setAccountToEdit(null)
          setEditedAccount({ username: "", password: "", email: "", remark: "" })
        }}
        footer={
          <>
            <Button 
              onClick={() => {
                setShowEditAccountModal(false)
                setAccountToEdit(null)
                setEditedAccount({ username: "", password: "", email: "", remark: "" })
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleEditAccount}
            >
              确认修改
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
                value={editedAccount.username}
                disabled
              />
            </Form.Item>
            <Form.Item
              label="密码"
            >
              <Input.Password
                placeholder="请输入密码（留空表示不修改）"
                value={editedAccount.password}
                onChange={(e) => setEditedAccount({ ...editedAccount, password: e })}
              />
            </Form.Item>
            <Form.Item
              label="邮箱"
              required
            >
              <Input
                placeholder="请输入邮箱"
                value={editedAccount.email}
                onChange={(e) => setEditedAccount({ ...editedAccount, email: e })}
              />
            </Form.Item>
            <Form.Item
              label="备注"
            >
              <Input
                placeholder="请输入备注（可选）"
                value={editedAccount.remark}
                onChange={(e) => setEditedAccount({ ...editedAccount, remark: e })}
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
