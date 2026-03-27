"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, Button, Space, Tag, Modal, Collapse } from "@arco-design/web-react"
import { IconDragDotVertical, IconDelete, IconPlus, IconSettings, IconEye } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "../../dashboard.module.css"
import { ModuleFieldEditor } from "./ModuleFieldEditor"

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
  const [previewModule, setPreviewModule] = useState<AvailableModule | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedModule, setDraggedModule] = useState<AvailableModule | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchAvailableModules()
  }, [])

  const fetchAvailableModules = async () => {
    try {
      const response = await fetch("/api/modules")
      if (response.ok) {
        const data = await response.json()
        setAvailableModules(data.modules || [])
      }
    } catch (error) {
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
    } else if (draggedIndex !== null && draggedIndex !== index) {
      e.dataTransfer.dropEffect = "move"
      const updatedModules = [...modules]
      const [draggedMod] = updatedModules.splice(draggedIndex, 1)
      updatedModules.splice(index, 0, draggedMod)
      onChange(updatedModules)
      setDraggedIndex(index)
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updatedModules = [...modules]
    const [draggedModule] = updatedModules.splice(draggedIndex, 1)
    updatedModules.splice(index, 0, draggedModule)
    
    onChange(updatedModules)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleEditModule = (module: ModuleInfo) => {
    setEditingModule(module)
  }

  const handleSaveModuleData = (data: Record<string, unknown>) => {
    if (!editingModule) return

    const updatedModules = modules.map((m) =>
      m.moduleInstanceId === editingModule.moduleInstanceId
        ? { ...m, data }
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

  return (
    <div className={styles.moduleEditorLayout}>
      <div className={styles.modulePickerPanel}>
        <div className={styles.modulePickerHeader}>
          <h3 style={{ margin: 0 }}>可用模块</h3>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            拖拽添加到页面
          </span>
        </div>
        
        <div className={styles.modulePickerContent}>
          {Object.entries(groupedModules).map(([category, mods]) => (
            <div key={category} className={styles.moduleCategory}>
              <div className={styles.moduleCategoryTitle}>{category}</div>
              <div className={styles.moduleGrid}>
                {mods.map((mod) => (
                  <Card
                    key={mod.moduleId}
                    className={`${styles.moduleCard} ${draggedModule?.moduleId === mod.moduleId ? styles.moduleCardDragging : ""}`}
                    draggable
                    onDragStart={(e) => handleModuleDragStart(e, mod)}
                    onDragEnd={handleModuleDragEnd}
                    contentClassName={styles.moduleCardContent}
                  >
                    <div className={styles.moduleCardContent}>
                      <div className={styles.moduleCardInfo}>
                        <div className={styles.moduleCardName}>{mod.moduleName}</div>
                        <Tag size="small" color="arcoblue" className={styles.moduleCardTag}>{mod.moduleId}</Tag>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        icon={<IconEye />}
                        className={styles.moduleCardPreviewBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewModule(mod)
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.moduleListPanel}>
        <div className={styles.moduleListHeader}>
          <h3 style={{ margin: 0 }}>页面模块</h3>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            拖拽调整顺序
          </span>
        </div>

        {modules.length === 0 ? (
          <Card 
            className={styles.emptyModuleCard}
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
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <p>拖拽左侧模块到此处添加</p>
            </div>
          </Card>
        ) : (
          <div className={styles.moduleItems}>
            {modules.map((module, index) => (
              <div
                key={module.moduleInstanceId}
                onDragOver={(e) => handleListDragOver(e, index)}
                onDrop={(e) => handleListDrop(e, index)}
              >
                {dragOverIndex === index && draggedModule && (
                  <div className={styles.dropIndicator}>
                    放置到此处
                  </div>
                )}
                <Card
                  className={`${styles.moduleItem} ${
                    draggedIndex === index ? styles.moduleItemDragging : ""
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.moduleItemContent}>
                    <div className={styles.moduleItemDragHandle}>
                      <IconDragDotVertical />
                    </div>
                    <div className={styles.moduleItemInfo}>
                      <div className={styles.moduleItemName}>{module.moduleName}</div>
                      <div className={styles.moduleItemId}>
                        <Tag size="small" color="gray">
                          {module.moduleId}
                        </Tag>
                      </div>
                    </div>
                    <div className={styles.moduleItemActions}>
                      <Button
                        type="text"
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
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={`编辑模块：${editingModule?.moduleName || ""}`}
        visible={!!editingModule}
        onCancel={() => setEditingModule(null)}
        onOk={() => {
          if (editingModule) {
            handleSaveModuleData(editingModule.data)
          }
        }}
        okText="保存"
        cancelText="取消"
        style={{ width: 800 }}
      >
        {editingModule && (
          <ModuleFieldEditor
            moduleId={editingModule.moduleId}
            data={editingModule.data}
            onChange={(data) => setEditingModule({ ...editingModule, data })}
          />
        )}
      </Modal>

      <Modal
        title={`模块预览：${previewModule?.moduleName || ""}`}
        visible={!!previewModule}
        onCancel={() => setPreviewModule(null)}
        footer={null}
        style={{ width: 800 }}
      >
        {previewModule && (
          <div className={styles.modulePreviewContent}>
            <div className={styles.modulePreviewInfo}>
              <p><strong>模块ID：</strong>{previewModule.moduleId}</p>
              <p><strong>模块名称：</strong>{previewModule.moduleName}</p>
              <p><strong>分类：</strong>{previewModule.category || "其他"}</p>
            </div>
            <div className={styles.modulePreviewFrame}>
              <iframe
                src={`/admin/module-preview/${previewModule.moduleId}`}
                className={styles.previewFrame}
                title="模块预览"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}