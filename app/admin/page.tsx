"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Message, Modal, Dropdown } from "@arco-design/web-react"
import { IconUser, IconLock, IconCustomerService } from "@arco-design/web-react/icon"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [superAdminToken, setSuperAdminToken] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [generatedToken, setGeneratedToken] = useState("")

  const handleLogin = async () => {
    if (!username || !password) {
      Message.error("请输入用户名和密码")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(data.user))
        }
        
        if (data.showSuperAdminToken && data.superAdminToken) {
          setGeneratedToken(data.superAdminToken)
          setShowTokenModal(true)
        } else {
          Message.success("登录成功")
          router.push("/admin/dashboard")
        }
      } else {
        Message.error(data.message || "登录失败")
      }
    } catch (error) {
      Message.error("登录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleTokenModalClose = () => {
    setShowTokenModal(false)
    Message.success("登录成功")
    router.push("/admin/dashboard")
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken)
    Message.success("超级管理员口令已复制到剪贴板")
  }

  const handleForgotPassword = async () => {
    if (!superAdminToken) {
      Message.error("请输入超级管理员口令")
      return
    }
    if (!newUsername) {
      Message.error("请输入用户名")
      return
    }
    if (!newPassword) {
      Message.error("请输入新密码")
      return
    }
    if (newPassword !== confirmPassword) {
      Message.error("两次输入的密码不一致")
      return
    }
    if (newPassword.length < 8) {
      Message.error("密码长度至少为8位")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          superAdminToken,
          username: newUsername,
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Message.success("密码修改成功，请使用新密码登录")
        setShowForgotPassword(false)
        setSuperAdminToken("")
        setNewUsername("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        Message.error(data.message || "密码修改失败")
      }
    } catch (error) {
      Message.error("密码修改失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-2xl animate-pulse" style={{animationDuration: '12s', animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/20 p-10 border border-white/20">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent mb-3">配置管理后台</h1>
            <p className="text-gray-500 text-sm">请登录以管理网站配置</p>
          </div>

          {!showForgotPassword ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  用户名
                </label>
                <Input
                  prefix={<IconUser className="text-gray-400" />}
                  placeholder="请输入用户名"
                  value={username}
                  onChange={setUsername}
                  className="!h-12 !rounded-xl"
                  onPressEnter={handleLogin}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  密码
                </label>
                <Input
                  prefix={<IconLock className="text-gray-400" />}
                  placeholder="请输入密码"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  className="!h-12 !rounded-xl"
                  onPressEnter={handleLogin}
                />
              </div>

              <Button
                type="primary"
                long
                loading={loading}
                onClick={handleLogin}
                className="!h-12 !rounded-xl !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !shadow-lg !shadow-purple-500/30 hover:!shadow-xl hover:!shadow-purple-500/40 !transition-all"
              >
                登录
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                >
                  忘记密码？
                </button>
                <Dropdown
                  droplist={
                    <div className="p-4 bg-white rounded-lg shadow-lg">
                      <div className="w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                        <div className="text-center">
                          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">客服二维码</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">技术问题可扫码联系客服</p>
                    </div>
                  }
                  trigger="hover"
                  position="top"
                >
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <IconCustomerService className="text-sm" />
                    联系客服
                  </button>
                </Dropdown>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  超级管理员口令
                </label>
                <Input
                  placeholder="请输入超级管理员口令"
                  value={superAdminToken}
                  onChange={setSuperAdminToken}
                  className="!h-12 !rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  用户名
                </label>
                <Input
                  prefix={<IconUser className="text-gray-400" />}
                  placeholder="请输入要重置密码的用户名"
                  value={newUsername}
                  onChange={setNewUsername}
                  className="!h-12 !rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  新密码
                </label>
                <Input
                  prefix={<IconLock className="text-gray-400" />}
                  placeholder="请输入新密码（至少8位）"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  className="!h-12 !rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  确认新密码
                </label>
                <Input
                  prefix={<IconLock className="text-gray-400" />}
                  placeholder="请再次输入新密码"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  className="!h-12 !rounded-xl"
                />
              </div>

              <Button
                type="primary"
                long
                loading={loading}
                onClick={handleForgotPassword}
                className="!h-12 !rounded-xl !bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !shadow-lg !shadow-amber-500/30 hover:!shadow-xl hover:!shadow-amber-500/40 !transition-all"
              >
                重置密码
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setSuperAdminToken("")
                    setNewUsername("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                  className="text-xs text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                >
                  返回登录
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 text-center text-sm text-white/60">
          <p>© 2024 创客AI · 配置管理系统</p>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold">重要提示</span>
          </div>
        }
        visible={showTokenModal}
        onCancel={handleTokenModalClose}
        footer={
          <div className="flex gap-3 justify-end">
            <Button onClick={handleCopyToken} type="primary">
              复制口令
            </Button>
            <Button onClick={handleTokenModalClose} type="primary">
              我已保存，继续
            </Button>
          </div>
        }
        className="!max-w-lg"
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-semibold mb-2">
              ⚠️ 这是您的超级管理员口令，请务必妥善保管！
            </p>
            <p className="text-xs text-red-600 mb-3">
              此口令用于忘记密码时重置管理员密码，不会再次显示。如果丢失，将无法找回！
            </p>
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="text-xs text-gray-500 mb-1">超级管理员口令：</p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold text-red-600 break-all">{generatedToken}</code>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 建议：将口令复制到安全的地方保存，例如密码管理器或纸质记录
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
