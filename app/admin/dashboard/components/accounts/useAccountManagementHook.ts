import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { 
  getAccounts, 
  addAccount, 
  deleteAccount, 
  updateAccount
} from "@/lib/api-client"

export interface Account {
  username: string
  password?: string
  email: string
  remark?: string
  role: string
}

export interface AccountFormData {
  username: string
  password: string
  email: string
  remark: string
  role: string
}

export function useAccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [newAccount, setNewAccount] = useState<AccountFormData>({
    username: "",
    password: "",
    email: "",
    remark: "",
    role: "operator"
  })
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [showEditAccountModal, setShowEditAccountModal] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)
  const [editedAccount, setEditedAccount] = useState<AccountFormData>({
    username: "",
    password: "",
    email: "",
    remark: "",
    role: "operator"
  })

  const [showViewPasswordModal, setShowViewPasswordModal] = useState(false)
  const [accountToView, setAccountToView] = useState<Account | null>(null)

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



  const handleAddAccount = useCallback(async () => {
    if (!newAccount.username || !newAccount.password) {
      toast.error("请填写用户名和密码")
      return
    }

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
  }, [newAccount, loadAccounts])

  const handleDeleteAccount = useCallback(async () => {
    if (!accountToDelete) return

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
  }, [accountToDelete, loadAccounts])

  const handleEditAccount = useCallback(async () => {
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
  }, [editedAccount, loadAccounts])

  const openAddAccountModal = useCallback(() => {
    setShowAddAccountModal(true)
  }, [])

  const openDeleteAccountModal = useCallback((account: Account) => {
    setAccountToDelete(account)
    setShowDeleteAccountModal(true)
  }, [])

  const openEditAccountModal = useCallback((account: Account) => {
    setAccountToEdit(account)
    setEditedAccount({
      username: account.username,
      password: "",
      email: account.email,
      remark: account.remark || "",
      role: account.role
    })
    setShowEditAccountModal(true)
  }, [])

  const openViewPasswordModal = useCallback((account: Account) => {
    setAccountToView(account)
    setShowViewPasswordModal(true)
  }, [])



  const closeAddAccountModal = useCallback(() => {
    setShowAddAccountModal(false)
    setNewAccount({ username: "", password: "", email: "", remark: "", role: "operator" })
  }, [])

  const closeEditAccountModal = useCallback(() => {
    setShowEditAccountModal(false)
    setAccountToEdit(null)
    setEditedAccount({ username: "", password: "", email: "", remark: "", role: "operator" })
  }, [])

  const closeDeleteAccountModal = useCallback(() => {
    setShowDeleteAccountModal(false)
    setAccountToDelete(null)
  }, [])

  const closeViewPasswordModal = useCallback(() => {
    setShowViewPasswordModal(false)
    setAccountToView(null)
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
  }
}
