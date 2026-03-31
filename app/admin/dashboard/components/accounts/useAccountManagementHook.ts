import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { 
  getAccounts, 
  addAccount, 
  deleteAccount, 
  updateAccount,
  getSuperAdminToken 
} from "@/lib/api-client"

export interface Account {
  username: string
  password?: string
  email: string
  remark?: string
}

export interface AccountFormData {
  username: string
  password: string
  email: string
  remark: string
}

export function useAccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [newAccount, setNewAccount] = useState<AccountFormData>({
    username: "",
    password: "",
    email: "",
    remark: ""
  })
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [showEditAccountModal, setShowEditAccountModal] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)
  const [editedAccount, setEditedAccount] = useState<AccountFormData>({
    username: "",
    password: "",
    email: "",
    remark: ""
  })
  const [showSuperAdminPasswordModal, setShowSuperAdminPasswordModal] = useState(false)
  const [superAdminPasswordForAction, setSuperAdminPasswordForAction] = useState("")
  const [actionType, setActionType] = useState<string | null>(null)
  const [hasValidSuperAdminToken, setHasValidSuperAdminToken] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = useCallback(async () => {
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
  }, [])

  const verifySuperAdminPassword = useCallback(async (password: string) => {
    const result = await getSuperAdminToken(password)
    return result.success
  }, [])

  const handleActionWithSuperAdmin = useCallback(async (action: () => Promise<void>) => {
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
  }, [hasValidSuperAdminToken, superAdminPasswordForAction, verifySuperAdminPassword])

  const handleAddAccount = useCallback(async () => {
    if (!newAccount.username || !newAccount.password) {
      toast.error("请填写用户名和密码")
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
  }, [newAccount, handleActionWithSuperAdmin, loadAccounts])

  const handleDeleteAccount = useCallback(async () => {
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
  }, [accountToDelete, handleActionWithSuperAdmin, loadAccounts])

  const handleEditAccount = useCallback(async () => {
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
  }, [editedAccount, handleActionWithSuperAdmin, loadAccounts])

  const openAddAccountModal = useCallback(() => {
    if (hasValidSuperAdminToken) {
      setShowAddAccountModal(true)
    } else {
      setActionType("add")
      setShowSuperAdminPasswordModal(true)
      setSuperAdminPasswordForAction("")
    }
  }, [hasValidSuperAdminToken])

  const openDeleteAccountModal = useCallback((account: Account) => {
    setAccountToDelete(account)
    if (hasValidSuperAdminToken) {
      setShowDeleteAccountModal(true)
    } else {
      setActionType("delete")
      setShowSuperAdminPasswordModal(true)
      setSuperAdminPasswordForAction("")
    }
  }, [hasValidSuperAdminToken])

  const openEditAccountModal = useCallback((account: Account) => {
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
  }, [hasValidSuperAdminToken])

  const handleSuperAdminPasswordConfirm = useCallback(async () => {
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
  }, [superAdminPasswordForAction, verifySuperAdminPassword, actionType, accountToDelete, accountToEdit])

  const closeSuperAdminPasswordModal = useCallback(() => {
    setShowSuperAdminPasswordModal(false)
    setSuperAdminPasswordForAction("")
    setActionType(null)
  }, [])

  const closeAddAccountModal = useCallback(() => {
    setShowAddAccountModal(false)
    setNewAccount({ username: "", password: "", email: "", remark: "" })
  }, [])

  const closeEditAccountModal = useCallback(() => {
    setShowEditAccountModal(false)
    setAccountToEdit(null)
    setEditedAccount({ username: "", password: "", email: "", remark: "" })
  }, [])

  const closeDeleteAccountModal = useCallback(() => {
    setShowDeleteAccountModal(false)
    setAccountToDelete(null)
  }, [])

  return {
    accounts,
    loadingAccounts,
    showAddAccountModal,
    newAccount,
    setNewAccount,
    showDeleteAccountModal,
    accountToDelete,
    showEditAccountModal,
    accountToEdit,
    editedAccount,
    setEditedAccount,
    showSuperAdminPasswordModal,
    superAdminPasswordForAction,
    setSuperAdminPasswordForAction,
    hasValidSuperAdminToken,
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
  }
}
