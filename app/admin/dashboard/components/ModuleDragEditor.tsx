"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, Button, Space, Tag, Modal, Select, Message, Collapse } from "@arco-design/web-react"
import { IconDragDotVertical, IconDelete, IconPlus, IconSettings } from "@arco-design/web-react/icon"
import styles from "../dashboard.module.css"
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
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")
  const [editingModule, setEditingModule] = useState<ModuleInfo | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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
      Message.error("获取可用模块列表失败")
    }
  }

  const handleAddModule = () => {
    if (!selectedModuleId) {
      Message.error("请选择要添加的模块")
      return
    }

    const moduleInfo = availableModules.find((m) => m.moduleId === selectedModuleId)
    if (!moduleInfo) return

    const newModule: ModuleInfo = {
      moduleId: selectedModuleId,
      moduleName: moduleInfo.moduleName,
      moduleInstanceId: `${selectedModuleId}-${Date.now()}`,
      data: {},
    }

    onChange([...modules, newModule])
    setShowAddModal(false)
    setSelectedModuleId("")
    Message.success("模块添加成功")
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
    Message.success("模块数据已更新")
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
    <div className={styles.moduleDragEditor}>
      <div className={styles.moduleList}>
        <div className={styles.moduleListHeader}>
          <h3 style={{ margin: 0 }}>页面模块</h3>
          <Button
            type="primary"
            size="small"
            icon={<IconPlus />}
            onClick={() => setShowAddModal(true)}
          >
            添加模块
          </Button>
        </div>

        {modules.length === 0 ? (
          <Card className={styles.emptyModuleCard}>
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <p>暂无模块，点击上方按钮添加</p>
            </div>
          </Card>
        ) : (
          <div className={styles.moduleItems}>
            {modules.map((module, index) => (
              <Card
                key={module.moduleInstanceId}
                className={`${styles.moduleItem} ${
                  draggedIndex === index ? styles.moduleItemDragging : ""
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
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
            ))}
          </div>
        )}
      </div>

      <Modal
        title="添加模块"
        visible={showAddModal}
        onCancel={() => {
          setShowAddModal(false)
          setSelectedModuleId("")
        }}
        onOk={handleAddModule}
        okText="添加"
        cancelText="取消"
        style={{ width: 600 }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", color: "#6b7280" }}>
            选择要添加到页面的模块：
          </p>
          <Select
            value={selectedModuleId}
            onChange={setSelectedModuleId}
            placeholder="请选择模块"
            style={{ width: "100%" }}
            showSearch
            filterOption={(inputValue, option) =>
              option.props.children.toLowerCase().includes(inputValue.toLowerCase())
            }
          >
            {Object.entries(groupedModules).map(([category, mods]) => (
              <Select.OptGroup key={category} label={category}>
                {mods.map((mod) => (
                  <Select.Option key={mod.moduleId} value={mod.moduleId}>
                    {mod.moduleName}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
        </div>
      </Modal>

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
    </div>
  )
}
