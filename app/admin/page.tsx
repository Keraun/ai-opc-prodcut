"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Modal, Dropdown, Tabs, Tooltip } from "@arco-design/web-react"
import { IconCustomerService, IconEye, IconEyeInvisible, IconCopy } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import { checkAuthStatus, loginWithResponse, setupEmail as setupEmailApi, sendResetCode, resetPassword } from "@/lib/api-client"
import styles from "./admin.module.css"

const TabPane = Tabs.TabPane

export default function AdminLoginPage() {
  const router = useRouter()
  
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [showEmailSetup, setShowEmailSetup] = useState<boolean>(false)
  const [setupEmail, setSetupEmail] = useState<string>("")
  const [countdown, setCountdown] = useState<number>(0)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  // 检查是否有有效的cookie会话
  useEffect(() => {
    const checkAuth = async () => {
      const data = await checkAuthStatus()
      if (data.authenticated) {
        // 如果有有效的会话，直接跳转到后台页面管理
        router.push("/admin/dashboard?menu=pages")
      }
      setCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  const handleLogin = async (): Promise<void> => {
    if (!username || !password) {
      toast.error("请输入用户名和密码")
      return
    }

    setLoading(true)
    
    try {
      const data = await loginWithResponse(username, password)

      if (data.success) {
        if (data.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(data.user))
        }
        
        if (data.requireEmailSetup) {
          setShowEmailSetup(true)
        } else {
          toast.success("登录成功")
          router.push("/admin/dashboard?menu=pages")
        }
      } else {
        toast.error(data.message || "登录失败")
      }
    } catch (error) {
      toast.error("登录失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSetup = async (): Promise<void> => {
    if (!setupEmail) {
      toast.error("请输入邮箱地址")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(setupEmail)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    setLoading(true)
    
    const currentUserStr = sessionStorage.getItem('currentUser')
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
    const targetUsername = currentUser?.username || username
    
    const data = await setupEmailApi(setupEmail, targetUsername)

    if (data.success) {
      toast.success("邮箱设置成功")
      setShowEmailSetup(false)
      toast.success("登录成功")
      router.push("/admin/dashboard?menu=pages")
    } else {
      toast.error(data.message || "邮箱设置失败")
    }
    
    setLoading(false)
  }



  const handleSendCode = async (): Promise<void> => {
    if (!email) {
      toast.error("请输入邮箱地址")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    const data = await sendResetCode(email)

    if (data.success) {
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
  }

  const handleForgotPassword = async (): Promise<void> => {
    if (!email) {
      toast.error("请输入邮箱地址")
      return
    }
    if (!verificationCode) {
      toast.error("请输入验证码")
      return
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
    
    const data = await resetPassword({
      method: "email",
      email: email,
      code: verificationCode,
      newPassword 
    })

    if (data.success) {
      toast.success("密码修改成功，正在登录...")
      
      const loginUsername = data.username
      const loginPassword = newPassword
      
      const loginData = await loginWithResponse(loginUsername!, loginPassword)

      if (loginData.success) {
        if (loginData.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(loginData.user))
        }
        toast.success("登录成功，3秒后自动跳转到管理后台...")

        setTimeout(() => {
          router.push("/admin/dashboard?menu=pages")
        }, 3000)
      } else {
        setShowForgotPassword(false)
        setUsername(loginUsername ?? "")
        toast.info("密码已重置，请使用新密码登录")
      }
    } else {
      toast.error(data.message || "密码修改失败")
    }
    
    setLoading(false)
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.background}>
          <div className={styles.bgCircle1}></div>
          <div className={styles.bgCircle2}></div>
        </div>

        <div className={styles.leftPanel}>
          <div className={styles.leftContent}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoIcon}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className={styles.mainTitle}>
                
                <span className={styles.subtitle}>
                  管理后台
                </span>
              </h1>
              <p className={styles.description}>
                让配置管理更简单高效
              </p>
            </div>

            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={`${styles.featureIcon} ${styles.featureIconViolet}`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3>快速配置</h3>
                  <p>一键配置网站参数，实时生效</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3>安全可靠</h3>
                  <p>多重安全验证，数据加密存储</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={`${styles.featureIcon} ${styles.featureIconPink}`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3>可视化管理</h3>
                  <p>直观的界面，轻松管理所有配置</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formWrapper}>
            <div className={styles.formGlow}></div>
            
            <div className={styles.formCard}>
              {!showEmailSetup && !showForgotPassword && (
                <>
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>欢迎回来</h2>
                    <p className={styles.formSubtitle}>请登录您的账号</p>
                  </div>

                  <div className={styles.formFields}>
                    <div>
                      <label className={styles.formLabel}>
                        用户名
                      </label>
                      <Input
                        placeholder="请输入用户名"
                        value={username}
                        onChange={setUsername}
                        onPressEnter={handleLogin}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        密码
                      </label>
                      <Input
                        placeholder="请输入密码"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        onPressEnter={handleLogin}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          >
                            {showPassword ? <IconEyeInvisible /> : <IconEye />}
                          </button>
                        }
                      />
                    </div>

                    <div>
                      <Button
                        type="primary"
                        long
                        loading={loading}
                        onClick={handleLogin}
                      >
                        登录
                      </Button>
                    </div>

                    <div className={styles.formFooter}>
                      <div className={styles.formFooterRow}>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className={styles.forgotPasswordLink}
                        >
                          忘记密码？
                        </button>
                        <Dropdown
                          droplist={
                            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #f3f4f6' }}>
                              <div style={{ width: '9rem', height: '9rem', background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db' }}>
                                <div style={{ width: '7rem', height: '7rem', backgroundColor: 'white', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>客服二维码</span>
                                </div>
                              </div>
                              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#4b5563', marginTop: '0.5rem', fontWeight: 500 }}>技术问题可扫码联系客服</p>
                            </div>
                          }
                          trigger="hover"
                          position="top"
                        >
                          <button
                            type="button"
                            className={styles.contactServiceLink}
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
                  <div className={styles.formHeader}>
                    <div className={styles.iconWrapper}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className={styles.formTitle}>设置邮箱</h2>
                    <p className={styles.formSubtitle}>首次登录需要配置邮箱地址，用于找回密码</p>
                  </div>

                  <div className={styles.formFields}>
                    <div>
                      <label className={styles.formLabel}>
                        邮箱地址
                      </label>
                      <Input
                        placeholder="请输入邮箱地址"
                        value={setupEmail}
                        onChange={setSetupEmail}
                      />
                    </div>

                    <div>
                      <Button
                        type="primary"
                        long
                        loading={loading}
                        onClick={handleEmailSetup}
                      >
                        确认设置
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {showForgotPassword && (
                <>
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>找回密码</h2>
                    <p className={styles.formSubtitle}>通过邮箱验证重置您的密码</p>
                  </div>

                  <div className={styles.formFields}>
                    <div>
                      <label className={styles.formLabel}>
                        邮箱地址
                      </label>
                      <Input
                        placeholder="请输入注册时的邮箱"
                        value={email}
                        onChange={setEmail}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        验证码
                      </label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Input
                          placeholder="请输入验证码"
                          value={verificationCode}
                          onChange={setVerificationCode}
                          style={{ flex: 1 }}
                        />
                        <Button
                          type="primary"
                          disabled={countdown > 0}
                          onClick={handleSendCode}
                        >
                          {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        新密码
                      </label>
                      <Input
                        placeholder="请输入新密码（至少8位）"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={setNewPassword}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          >
                            {showNewPassword ? <IconEyeInvisible /> : <IconEye />}
                          </button>
                        }
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        确认新密码
                      </label>
                      <Input
                        placeholder="请再次输入新密码"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          >
                            {showConfirmPassword ? <IconEyeInvisible /> : <IconEye />}
                          </button>
                        }
                      />
                    </div>

                    <div>
                      <Button
                        type="primary"
                        long
                        loading={loading}
                        onClick={handleForgotPassword}
                      >
                        重置密码
                      </Button>
                    </div>

                    <div className={styles.backButtonWrapper}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false)
                          setNewPassword("")
                          setConfirmPassword("")
                          setEmail("")
                          setVerificationCode("")
                        }}
                        className={styles.backButton}
                      >
                        返回登录
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className={styles.copyright}>
              <p>©  · 配置管理系统</p>
            </div>
          </div>
        </div>


      </div>
    </>
  )
}
