"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Modal, Dropdown, Tabs } from "@arco-design/web-react"
import { IconCustomerService, IconEye, IconEyeInvisible } from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"

const TabPane = Tabs.TabPane

export default function AdminLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
  }, [])
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetMethod, setResetMethod] = useState("token")
  const [superAdminToken, setSuperAdminToken] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [generatedToken, setGeneratedToken] = useState("")
  const [showEmailSetup, setShowEmailSetup] = useState(false)
  const [setupEmail, setSetupEmail] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("请输入用户名和密码")
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
        
        if (data.requireEmailSetup) {
          setShowEmailSetup(true)
        } else if (data.showSuperAdminToken && data.superAdminToken) {
          setGeneratedToken(data.superAdminToken)
          setShowTokenModal(true)
        } else {
          toast.success("登录成功")
          router.push("/admin/dashboard")
        }
      } else {
        toast.error(data.message || "登录失败")
      }
    } catch (error) {
      toast.error("登录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSetup = async () => {
    if (!setupEmail) {
      toast.error("请输入邮箱地址")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(setupEmail)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/admin/setup-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: setupEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("邮箱设置成功")
        setShowEmailSetup(false)
        if (data.showSuperAdminToken && data.superAdminToken) {
          setGeneratedToken(data.superAdminToken)
          setShowTokenModal(true)
        } else {
          toast.success("登录成功")
          router.push("/admin/dashboard")
        }
      } else {
        toast.error(data.message || "邮箱设置失败")
      }
    } catch (error) {
      toast.error("邮箱设置失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleTokenModalClose = () => {
    setShowTokenModal(false)
    toast.success("登录成功")
    router.push("/admin/dashboard")
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken)
    toast.success("超级管理员口令已复制到剪贴板")
  }

  const handleSendCode = async () => {
    if (!email) {
      toast.error("请输入邮箱地址")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    try {
      const response = await fetch("/api/admin/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "验证码已发送到您的邮箱")
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(data.message || "验证码发送失败")
      }
    } catch (error) {
      toast.error("验证码发送失败，请重试")
    }
  }

  const handleForgotPassword = async () => {
    if (resetMethod === "token") {
      if (!superAdminToken) {
        toast.error("请输入超级管理员口令")
        return
      }
      if (!newUsername) {
        toast.error("请输入用户名")
        return
      }
    } else {
      if (!email) {
        toast.error("请输入邮箱地址")
        return
      }
      if (!verificationCode) {
        toast.error("请输入验证码")
        return
    }
    }
    
    if (!newPassword) {
      toast.error("请输入新密码")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }
    if (newPassword.length < 8) {
      toast.error("密码长度至少为8位")
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
          method: resetMethod,
          superAdminToken: resetMethod === "token" ? superAdminToken : undefined,
          username: resetMethod === "token" ? newUsername : undefined,
          email: resetMethod === "email" ? email : undefined,
          verificationCode: resetMethod === "email" ? verificationCode : undefined,
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("密码修改成功，正在登录...")
        
        const loginUsername = resetMethod === "token" ? newUsername : data.username
        const loginPassword = newPassword
        
        const loginResponse = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            username: loginUsername, 
            password: loginPassword 
          }),
        })

        const loginData = await loginResponse.json()

        if (loginResponse.ok) {
          if (loginData.user) {
            sessionStorage.setItem('currentUser', JSON.stringify(loginData.user))
          }
          toast.success("登录成功，3秒后自动跳转到管理后台...")
          
          setTimeout(() => {
            router.push("/admin/dashboard")
          }, 3000)
        } else {
          setShowForgotPassword(false)
          setUsername(loginUsername)
          toast.info("密码已重置，请使用新密码登录")
        }
      } else {
        toast.error(data.message || "密码修改失败")
      }
    } catch (error) {
      toast.error("密码修改失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 to-purple-600/10 rounded-full blur-3xl animate-spin-slow"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-gradient-to-br from-blue-600/20 to-cyan-600/10 rounded-full blur-3xl animate-spin-slow" style={{animationDirection: 'reverse', animationDelay: '3s'}}></div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-20">
          <div className="max-w-xl">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-5xl font-black text-white mb-4 leading-tight">
                创客AI
                <span className="block text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mt-2">
                  配置管理后台
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                专注AI一人公司服务，让配置管理更简单高效
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">快速配置</h3>
                  <p className="text-gray-400 text-sm">一键配置网站参数，实时生效</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">安全可靠</h3>
                  <p className="text-gray-400 text-sm">多重安全验证，数据加密存储</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/30">
                  <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">可视化管理</h3>
                  <p className="text-gray-400 text-sm">直观的界面，轻松管理所有配置</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl blur-xl opacity-30"></div>
              
              <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20">
                {!showEmailSetup && !showForgotPassword && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h2>
                      <p className="text-gray-500 text-sm">请登录您的账号</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          用户名
                        </label>
                        <Input
                          placeholder="请输入用户名"
                          value={username}
                          onChange={setUsername}
                          className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-violet-400 focus:!border-violet-500 !transition-all"
                          onPressEnter={handleLogin}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          密码
                        </label>
                        <Input
                          placeholder="请输入密码"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={setPassword}
                          className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-violet-400 focus:!border-violet-500 !transition-all"
                          onPressEnter={handleLogin}
                          suffix={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                              {showPassword ? <IconEyeInvisible /> : <IconEye />}
                            </button>
                          }
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="primary"
                          long
                          loading={loading}
                          onClick={handleLogin}
                          className="!h-12 !rounded-xl !text-base !font-bold !bg-gradient-to-r !from-violet-600 !to-blue-600 hover:!from-violet-700 hover:!to-blue-700 !shadow-lg !shadow-violet-500/30 hover:!shadow-xl !transition-all !duration-300"
                        >
                          登录
                        </Button>
                      </div>

                      <div className="pt-6 mt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-gray-500 hover:text-violet-600 transition-colors cursor-pointer font-medium"
                          >
                            忘记密码？
                          </button>
                          <Dropdown
                            droplist={
                              <div className="p-4 bg-white rounded-xl shadow-2xl border border-gray-100">
                                <div className="w-36 h-36 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                  <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center shadow-inner">
                                    <span className="text-xs text-gray-400 font-medium">客服二维码</span>
                                  </div>
                                </div>
                                <p className="text-center text-xs text-gray-600 mt-2 font-medium">技术问题可扫码联系客服</p>
                              </div>
                            }
                            trigger="hover"
                            position="top"
                          >
                            <button
                              type="button"
                              className="text-sm text-gray-500 hover:text-violet-600 transition-colors cursor-pointer font-medium flex items-center gap-1.5"
                            >
                              <IconCustomerService />
                              联系客服
                            </button>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {showEmailSetup && (
                  <>
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">设置邮箱</h2>
                      <p className="text-gray-500 text-sm">首次登录需要配置邮箱地址，用于找回密码</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          邮箱地址
                        </label>
                        <Input
                          placeholder="请输入邮箱地址"
                          value={setupEmail}
                          onChange={setSetupEmail}
                          className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !transition-all"
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="primary"
                          long
                          loading={loading}
                          onClick={handleEmailSetup}
                          className="!h-12 !rounded-xl !text-base !font-bold !bg-gradient-to-r !from-blue-500 !to-cyan-500 hover:!from-blue-600 hover:!to-cyan-600 !shadow-lg !shadow-blue-500/30 hover:!shadow-xl !transition-all !duration-300"
                        >
                          确认设置
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {showForgotPassword && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">找回密码</h2>
                      <p className="text-gray-500 text-sm">选择一种方式重置您的密码</p>
                    </div>

                    <Tabs activeTab={resetMethod} onChange={setResetMethod} className="mb-6">
                      <TabPane key="token" title="口令找回" />
                      <TabPane key="email" title="邮箱找回" />
                    </Tabs>

                    <div className="space-y-4">
                      {resetMethod === "token" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              超级管理员口令
                            </label>
                            <Input
                              placeholder="请输入超级管理员口令"
                              value={superAdminToken}
                              onChange={setSuperAdminToken}
                              className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-amber-400 focus:!border-amber-500 !transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              用户名
                            </label>
                            <Input
                              placeholder="请输入要重置密码的用户名"
                              value={newUsername}
                              onChange={setNewUsername}
                              className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-amber-400 focus:!border-amber-500 !transition-all"
                            />
                          </div>
                        </>
                      )}

                      {resetMethod === "email" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              邮箱地址
                            </label>
                            <Input
                              placeholder="请输入注册时的邮箱"
                              value={email}
                              onChange={setEmail}
                              className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              验证码
                            </label>
                            <div className="flex gap-3">
                              <Input
                                placeholder="请输入验证码"
                                value={verificationCode}
                                onChange={setVerificationCode}
                                className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !transition-all flex-1"
                              />
                              <Button
                                type="primary"
                                disabled={countdown > 0}
                                onClick={handleSendCode}
                                className="!h-12 !rounded-xl !px-6 !font-medium whitespace-nowrap"
                              >
                                {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          新密码
                        </label>
                        <Input
                          placeholder="请输入新密码（至少8位）"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={setNewPassword}
                          className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-violet-400 focus:!border-violet-500 !transition-all"
                          suffix={
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                              {showNewPassword ? <IconEyeInvisible /> : <IconEye />}
                            </button>
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          确认新密码
                        </label>
                        <Input
                          placeholder="请再次输入新密码"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={setConfirmPassword}
                          className="!h-12 !rounded-xl !text-base !border-2 !border-gray-200 hover:!border-violet-400 focus:!border-violet-500 !transition-all"
                          suffix={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                              {showConfirmPassword ? <IconEyeInvisible /> : <IconEye />}
                            </button>
                          }
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="primary"
                          long
                          loading={loading}
                          onClick={handleForgotPassword}
                          className="!h-12 !rounded-xl !text-base !font-bold !bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !shadow-lg !shadow-amber-500/30 hover:!shadow-xl !transition-all !duration-300"
                        >
                          重置密码
                        </Button>
                      </div>

                      <div className="pt-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false)
                            setSuperAdminToken("")
                            setNewUsername("")
                            setNewPassword("")
                            setConfirmPassword("")
                            setEmail("")
                            setVerificationCode("")
                          }}
                          className="text-sm text-gray-500 hover:text-violet-600 transition-colors cursor-pointer font-medium"
                        >
                          返回登录
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-white/40 font-medium">
              <p>© 创客AI · 配置管理系统</p>
            </div>
          </div>
        </div>

        <Modal
          title={
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-bold text-lg">重要提示</span>
            </div>
          }
          visible={showTokenModal}
          onCancel={handleTokenModalClose}
          footer={
            <div className="flex gap-3 justify-end">
              <Button onClick={handleCopyToken} type="primary" className="!rounded-xl">
                复制口令
              </Button>
              <Button onClick={handleTokenModalClose} type="primary" className="!rounded-xl">
                我已保存，继续
              </Button>
            </div>
          }
          className="!max-w-lg"
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-2 border-red-200 rounded-2xl p-5">
              <p className="text-base text-red-700 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                这是您的超级管理员口令，请务必妥善保管！
              </p>
              <p className="text-sm text-red-600 mb-4 leading-relaxed">
                此口令用于忘记密码时重置管理员密码，不会再次显示。如果丢失，将无法找回！
              </p>
              <div className="bg-white rounded-xl p-4 border border-red-200 shadow-inner">
                <p className="text-xs text-gray-500 mb-2 font-medium">超级管理员口令：</p>
                <div className="flex items-center gap-2">
                  <code className="text-xl font-mono font-bold text-red-600 break-all tracking-wider">{generatedToken}</code>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-700 font-medium flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>建议：将口令复制到安全的地方保存，例如密码管理器或纸质记录</span>
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
