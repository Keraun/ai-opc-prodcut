"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button, Tag, Drawer, Tooltip } from "@arco-design/web-react"
import { IconFullscreen, IconFullscreenExit } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "../../dashboard.module.css"
import { ModuleFieldEditor } from "./ModuleFieldEditor"
import { getAvailableModules } from "@/lib/api-client"
import { 
  IconDragDotVertical, 
  IconDelete, 
  IconSettings, 
  IconApps, 
  IconUnorderedList, 
  IconEye,
  IconDesktop,
  IconMobile
} from "@/components/icons"

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

interface AvailableModule {
  moduleId: string
  moduleName: string
  category?: string
  defaultData?: Record<string, unknown>
}

interface ModuleDragEditorProps {
  modules: ModuleInfo[]
  onChange: (modules: ModuleInfo[]) => void
}

export function ModuleDragEditor({ modules, onChange }: ModuleDragEditorProps) {
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([])
  const [editingModule, setEditingModule] = useState<ModuleInfo | null>(null)
  const [previewingModule, setPreviewingModule] = useState<AvailableModule | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedModule, setDraggedModule] = useState<AvailableModule | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [gridColumns, setGridColumns] = useState<1 | 2 | 3>(3)
  const [previewDevice, setPreviewDevice] = useState<'web' | 'mobile' | 'ipad'>('web')
  const [editPreviewDevice, setEditPreviewDevice] = useState<'web' | 'mobile' | 'ipad'>('ipad')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editPreviewIframeRef = useRef<HTMLIFrameElement>(null)
  const previewPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAvailableModules()
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && previewPanelRef.current) {
        await previewPanelRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('全屏切换失败:', error)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const loadAvailableModules = async () => {
    const modules = await getAvailableModules()
    if (modules.length > 0) {
      setAvailableModules(modules)
    } else {
      toast.error("获取可用模块列表失败")
    }
  }

  const handleAddModule = (moduleInfo: AvailableModule, insertIndex?: number) => {
    const newModule: ModuleInfo = {
      moduleId: moduleInfo.moduleId,
      moduleName: moduleInfo.moduleName,
      moduleInstanceId: `${moduleInfo.moduleId}-${Date.now()}`,
      data: moduleInfo.defaultData ? JSON.parse(JSON.stringify(moduleInfo.defaultData)) : {},
    }

    if (insertIndex !== undefined) {
      const updatedModules = [...modules]
      updatedModules.splice(insertIndex, 0, newModule)
      onChange(updatedModules)
    } else {
      const headerIndex = modules.findIndex(m => m.moduleId === 'site-header')
      const footerIndex = modules.findIndex(m => m.moduleId === 'site-footer')
      
      let smartInsertIndex = modules.length
      
      if (headerIndex !== -1 && footerIndex !== -1) {
        smartInsertIndex = footerIndex
      } else if (headerIndex !== -1) {
        smartInsertIndex = headerIndex + 1
      } else if (footerIndex !== -1) {
        smartInsertIndex = footerIndex
      }
      
      const updatedModules = [...modules]
      updatedModules.splice(smartInsertIndex, 0, newModule)
      onChange(updatedModules)
    }
    toast.success("模块添加成功")
  }

  const handleModuleDragStart = (e: React.DragEvent, moduleInfo: AvailableModule) => {
    setDraggedModule(moduleInfo)
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("text/plain", moduleInfo.moduleId)
  }

  const handleModuleDragEnd = () => {
    setDraggedModule(null)
    setDragOverIndex(null)
  }

  const handleListDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedModule) {
      e.dataTransfer.dropEffect = "copy"
      setDragOverIndex(index)
    }
  }

  const handleListDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedModule) {
      handleAddModule(draggedModule, index)
    }
    setDraggedModule(null)
    setDragOverIndex(null)
  }

  const handleDeleteModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index)
    onChange(updatedModules)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleReorderDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const newModules = [...modules]
      const [movedModule] = newModules.splice(draggedIndex, 1)
      newModules.splice(targetIndex, 0, movedModule)
      onChange(newModules)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSaveModuleData = (data: Record<string, unknown>) => {
    if (!editingModule) return

    const updatedModules = modules.map((m) =>
      m.moduleInstanceId === editingModule.moduleInstanceId
        ? { ...m, data: JSON.parse(JSON.stringify(data)) }
        : m
    )
    
    onChange(updatedModules)
    setEditingModule(null)
    toast.success("模块数据已更新")
  }

  const sendPreviewData = useCallback((data: Record<string, unknown>) => {
    if (editPreviewIframeRef.current && editPreviewIframeRef.current.contentWindow) {
      editPreviewIframeRef.current.contentWindow.postMessage({
        type: 'MODULE_PREVIEW_DATA',
        data: data
      }, '*')
    }
  }, [])

  const handleEditModuleChange = useCallback((data: Record<string, unknown>) => {
    if (editingModule) {
      setEditingModule({ 
        ...editingModule, 
        data: JSON.parse(JSON.stringify(data)),
      })
      sendPreviewData(data)
    }
  }, [editingModule, sendPreviewData])

  const handleEditModule = (module: ModuleInfo) => {
    setEditingModule({
      ...module,
      data: JSON.parse(JSON.stringify(module.data))
    })
  }

  const handleEditPreviewMessage = useCallback((event: MessageEvent) => {
    if (event.data && event.data.type === 'MODULE_PREVIEW_READY') {
      if (editingModule) {
        sendPreviewData(editingModule.data)
      }
    }
  }, [editingModule, sendPreviewData])

  useEffect(() => {
    window.addEventListener('message', handleEditPreviewMessage)
    return () => {
      window.removeEventListener('message', handleEditPreviewMessage)
    }
  }, [handleEditPreviewMessage])

  const groupedModules = availableModules.reduce((acc, module) => {
    const category = module.category || "其他"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(module)
    return acc
  }, {} as Record<string, AvailableModule[]>)

  const sortedCategories = Object.keys(groupedModules).sort((a, b) => {
    if (a === '站点') return 1
    if (b === '站点') return -1
    return a.localeCompare(b)
  })

  const gridStyle = {
    gridTemplateColumns: gridColumns === 1 ? '1fr' : gridColumns === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  }

  return (
    <div className={styles.moduleEditorLayoutV2}>
      <div className={styles.modulePickerPanelV2}>
        <div className={styles.modulePickerHeaderV2}>
          <div>
            <h3>可用模块</h3>
            <span>点击/拖拽添加到页面</span>
          </div>
          <div className={styles.layoutToggle}>
            <Tooltip content="一排一个">
              <Button 
                size="mini" 
                type={gridColumns === 1 ? "primary" : "text"}
                icon={<IconUnorderedList />}
                onClick={() => setGridColumns(1)}
              />
            </Tooltip>
            <Tooltip content="一排两个">
              <Button 
                size="mini" 
                type={gridColumns === 2 ? "primary" : "text"}
                icon={<IconApps />}
                onClick={() => setGridColumns(2)}
              />
            </Tooltip>
            <Tooltip content="一排三个">
              <Button 
                size="mini" 
                type={gridColumns === 3 ? "primary" : "text"}
                icon={<IconDesktop />}
                onClick={() => setGridColumns(3)}
              />
            </Tooltip>
          </div>
        </div>
        
        <div className={styles.modulePickerContentV2}>
          {sortedCategories.map((category) => {
            const mods = groupedModules[category]
            return (
              <div key={category} className={styles.moduleCategoryV2}>
                <div className={styles.moduleCategoryTitleV2}>{category}</div>
                <div className={styles.moduleGridV2} style={gridStyle}>
                  {mods.map((mod) => (
                    <div
                      key={mod.moduleId}
                      className={`${styles.moduleCardV2} ${draggedModule?.moduleId === mod.moduleId ? styles.moduleCardDraggingV2 : ""}`}
                      draggable
                      onDragStart={(e) => handleModuleDragStart(e, mod)}
                      onDragEnd={handleModuleDragEnd}
                      onClick={() => handleAddModule(mod)}
                    >
                      <div className={styles.moduleCardInfoV2}>
                        <div className={styles.moduleCardNameV2}>{mod.moduleName}</div>
                        <Tag size="small" color="arcoblue" className={styles.moduleCardTagV2}>{mod.moduleId}</Tag>
                      </div>
                      <Tooltip content="预览模块">
                        <Button
                          type="text"
                          size="mini"
                          icon={<IconEye />}
                          className={styles.moduleCardPreviewBtnV2}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewingModule(mod)
                          }}
                        />
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.moduleListPanelV2}>
        <div className={styles.moduleListHeaderV2}>
          <h3>页面模块</h3>
          <span>拖拽调整顺序</span>
        </div>

        {modules.length === 0 ? (
          <div 
            className={styles.emptyModuleCardV2}
            onDragOver={(e) => {
              e.preventDefault()
              if (draggedModule) {
                e.dataTransfer.dropEffect = "copy"
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedModule) {
                handleAddModule(draggedModule, 0)
                setDraggedModule(null)
              }
            }}
          >
            <div className={styles.emptyModuleIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.emptyModuleText}>拖拽左侧模块到此处添加</p>
          </div>
        ) : (
          <div 
            className={styles.moduleItemsV2}
            onDragOver={(e) => {
              e.preventDefault()
              if (draggedModule) {
                e.dataTransfer.dropEffect = "copy"
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedModule) {
                handleAddModule(draggedModule, modules.length)
                setDraggedModule(null)
              }
            }}
          >
            {modules.map((module, index) => (
              <div
                key={module.moduleInstanceId}
                onDragOver={(e) => {
                  if (draggedModule) {
                    handleListDragOver(e, index)
                  } else if (draggedIndex !== null) {
                    handleReorderDragOver(e, index)
                  }
                }}
                onDrop={(e) => {
                  if (draggedModule) {
                    handleListDrop(e, index)
                  } else {
                    handleReorderDrop(e, index)
                  }
                }}
              >
                {dragOverIndex === index && (
                  <div className={styles.dropIndicatorV2}>
                    {draggedModule ? '放置到此处' : '移动到此位置'}
                  </div>
                )}
                <div
                  className={`${styles.moduleItemV2} ${
                    draggedIndex === index ? styles.moduleItemDraggingV2 : ""
                  }`}
                  draggable={module.moduleId !== 'site-root' && module.moduleId !== 'site-footer' && module.moduleId !== 'site-header'}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.moduleItemContentV2}>
                    <div className={styles.moduleItemDragHandleV2}>
                      <IconDragDotVertical />
                    </div>
                    <div className={styles.moduleItemInfoV2}>
                      <div className={styles.moduleItemNameV2}>{module.moduleName}</div>
                      <div className={styles.moduleItemIdV2}>
                        <Tag size="small" color="gray">
                          {module.moduleId}
                        </Tag>
                      </div>
                    </div>
                    <div className={styles.moduleItemActionsV2}>
                      {module.moduleId !== 'site-root' && module.moduleId !== 'site-footer' && module.moduleId !== 'site-header' && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<IconSettings />}
                          onClick={() => handleEditModule(module)}
                        >
                          编辑
                        </Button>
                      )}
                      {module.moduleId !== 'site-root' && module.moduleId !== 'site-footer' && module.moduleId !== 'site-header' && (
                        <Button
                          type="text"
                          size="small"
                          status="danger"
                          icon={<IconDelete />}
                          onClick={() => handleDeleteModule(index)}
                        />
                      )}
                      {(module.moduleId === 'site-root' || module.moduleId === 'site-footer' || module.moduleId === 'site-header') && (
                        <>
                          <Button
                            type="text"
                            size="small"
                            icon={<IconEye />}
                            onClick={() => setPreviewingModule({ 
                              moduleId: module.moduleId, 
                              moduleName: module.moduleName 
                            })}
                          >
                            预览
                          </Button>
                          <Tag color="orange" size="small">全局配置</Tag>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer
        title={
          <div className={styles.drawerTitleWrapper}>
            <div>
              <span className={styles.drawerTitle}>编辑模块</span>
              <Tag className={styles.drawerModuleTag} color="arcoblue" size="small">{editingModule?.moduleName || ""}</Tag>
            </div>
          </div>
        }
        visible={!!editingModule}
        placement="right"
        width="95%"
        closable={true}
        autoFocus={false}
        maskClosable={true}
        onCancel={() => setEditingModule(null)}
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={() => setEditingModule(null)}>取消</Button>
            <Button 
              type="primary" 
              onClick={() => {
                if (editingModule) {
                  handleSaveModuleData(editingModule.data)
                }
              }}
            >
              保存更改
            </Button>
          </div>
        }
      >
        {editingModule && (
          <div className={styles.editModuleSplitLayout}>
            <div 
              className={`${styles.editModulePreviewPanel} ${isFullscreen ? styles.fullscreenPreview : ''}`}
              ref={previewPanelRef}
            >
              <div className={styles.editModulePreviewHeader}>
                <h4>实时预览</h4>
                <div className={styles.editModulePreviewControls}>
                  <div className={styles.editModulePreviewDevices}>
                    <Tooltip content="桌面端">
                      <Button 
                        size="mini" 
                        type={editPreviewDevice === 'web' ? "primary" : "text"}
                        icon={<IconDesktop />}
                        onClick={() => setEditPreviewDevice('web')}
                      />
                    </Tooltip>
                    <Tooltip content="平板端">
                      <Button 
                        size="mini" 
                        type={editPreviewDevice === 'ipad' ? "primary" : "text"}
                        icon={<IconApps />}
                        onClick={() => setEditPreviewDevice('ipad')}
                      />
                    </Tooltip>
                    <Tooltip content="移动端">
                      <Button 
                        size="mini" 
                        type={editPreviewDevice === 'mobile' ? "primary" : "text"}
                        icon={<IconMobile />}
                        onClick={() => setEditPreviewDevice('mobile')}
                      />
                    </Tooltip>
                  </div>
                  <Tooltip content={isFullscreen ? "退出全屏" : "全屏查看"}>
                    <Button 
                      size="mini"
                      type="text"
                      icon={isFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
                      onClick={toggleFullscreen}
                    />
                  </Tooltip>
                </div>
              </div>
              <div className={styles.editModulePreviewContent}>
                <div 
                  className={styles.editModulePreviewFrame}
                  style={{
                    width: editPreviewDevice === 'web' ? '100%' : editPreviewDevice === 'mobile' ? '375px' : '768px'
                  }}
                >
                  <iframe
                    ref={editPreviewIframeRef}
                    src={`/admin/module-preview/${editingModule.moduleId}`}
                    className={styles.editModulePreviewIframe}
                    title={`${editingModule.moduleName} 预览`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </div>
            <div className={styles.editModuleFormPanel}>
              <div className={styles.editModuleFormHeader}>
                <h4>模块配置</h4>
                <span>修改后实时预览</span>
              </div>
              <div className={styles.editModuleFormContent}>
                <ModuleFieldEditor
                  moduleId={editingModule.moduleId}
                  data={editingModule.data}
                  onChange={handleEditModuleChange}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        className={styles.previewDrawer}
        visible={!!previewingModule}
        placement="right"
        width={1200}
        closable={false}
        autoFocus={false}
        maskClosable={true}
        onCancel={() => setPreviewingModule(null)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>模块预览</span>
              {previewingModule && (
                <>
                  <Tag color="arcoblue">{previewingModule.moduleId}</Tag>
                  <Tag color="green">{previewingModule.moduleName}</Tag>
                  <Tag color="gray">{previewingModule.category || "未分类"}</Tag>
                </>
              )}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                <Button 
                  type={previewDevice === 'web' ? 'primary' : 'secondary'} 
                  size="small"
                  onClick={() => setPreviewDevice('web')}
                >
                  Web
                </Button>
                <Button 
                  type={previewDevice === 'mobile' ? 'primary' : 'secondary'} 
                  size="small"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  Mobile
                </Button>
                <Button 
                  type={previewDevice === 'ipad' ? 'primary' : 'secondary'} 
                  size="small"
                  onClick={() => setPreviewDevice('ipad')}
                >
                  iPad
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={() => setPreviewingModule(null)}>关闭</Button>
              <Button 
                type="primary" 
                onClick={() => {
                  if (previewingModule) {
                    handleAddModule(previewingModule)
                    setPreviewingModule(null)
                  }
                }}
              >
                添加此模块
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ 
          width: '100%', 
          height: 'calc(100vh - 80px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#f0f2f5',
          padding: '20px'
        }}>
          <div style={{
            width: previewDevice === 'web' ? '100%' : previewDevice === 'mobile' ? '375px' : '768px',
            height: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            background: '#fff'
          }}>
            <iframe
              src={`/admin/module-preview/${previewingModule?.moduleId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={`${previewingModule?.moduleName} 预览`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
