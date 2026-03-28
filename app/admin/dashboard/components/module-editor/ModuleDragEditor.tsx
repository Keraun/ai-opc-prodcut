"use client"

import { useState, useEffect } from "react"
import { Button, Tag, Drawer, Tooltip } from "@arco-design/web-react"
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
  IconEye 
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
  const [gridColumns, setGridColumns] = useState<1 | 2>(2)

  useEffect(() => {
    loadAvailableModules()
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
      data: {},
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
  }

  const handleEditModule = (module: ModuleInfo) => {
    setEditingModule({
      ...module,
      data: JSON.parse(JSON.stringify(module.data))
    })
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

  const groupedModules = availableModules.reduce((acc, module) => {
    const category = module.category || "其他"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(module)
    return acc
  }, {} as Record<string, AvailableModule[]>)

  const gridStyle = {
    gridTemplateColumns: gridColumns === 1 ? '1fr' : 'repeat(2, 1fr)'
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
          </div>
        </div>
        
        <div className={styles.modulePickerContentV2}>
          {Object.entries(groupedModules).map(([category, mods]) => (
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
          ))}
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
                onDragOver={(e) => handleListDragOver(e, index)}
                onDrop={(e) => handleListDrop(e, index)}
              >
                {dragOverIndex === index && draggedModule && (
                  <div className={styles.dropIndicatorV2}>
                    放置到此处
                  </div>
                )}
                <div
                  className={`${styles.moduleItemV2} ${
                    draggedIndex === index ? styles.moduleItemDraggingV2 : ""
                  }`}
                  draggable
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
                      <Button
                        type="primary"
                        size="small"
                        icon={<IconSettings />}
                        onClick={() => handleEditModule(module)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        status="danger"
                        icon={<IconDelete />}
                        onClick={() => handleDeleteModule(index)}
                      />
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
        width={720}
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
          <ModuleFieldEditor
            moduleId={editingModule.moduleId}
            data={editingModule.data}
            onChange={(data) => setEditingModule({ 
              ...editingModule, 
              data: JSON.parse(JSON.stringify(data)),
            })}
          />
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
        <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
          <iframe
            src={`/admin/module-preview/${previewingModule?.moduleId}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${previewingModule?.moduleName} 预览`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </Drawer>
    </div>
  )
}
