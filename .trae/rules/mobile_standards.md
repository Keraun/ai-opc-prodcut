# 移动端开发标准

本文档定义了项目中移动端开发的统一标准，所有移动端样式必须遵循以下规范。

## 参考机型

### iPhone 6s（主要参考机型）

| 属性 | 值 |
|------|------|
| 屏幕尺寸 | 4.7 英寸 |
| 分辨率 | 1334 × 750 像素 |
| 逻辑分辨率（CSS像素） | **375 × 667 px** |
| 像素密度 | 2x (Retina) |
| 设备像素比 (DPR) | 2 |

### 为什么选择 iPhone 6s 作为参考机型

1. **市场占有率**：iPhone 6s 系列在全球仍有大量用户
2. **屏幕尺寸代表性**：375px 宽度是目前主流移动设备的基准尺寸
3. **兼容性**：适配 iPhone 6s 可覆盖大部分移动设备

## 响应式断点标准

### 断点定义

```css
/* 移动端 - 手机 */
@media (max-width: 767px) {
  /* 适用于 iPhone 6s (375px) 及更小屏幕 */
}

/* 平板 - iPad */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 适用于 iPad (768px) 等平板设备 */
}

/* 桌面端 */
@media (min-width: 1024px) {
  /* 适用于桌面设备 */
}
```

### 移动端优先原则

推荐使用移动端优先的写法：

```css
/* 基础样式（移动端） */
.container {
  padding: 16px;
  font-size: 14px;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    font-size: 16px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    font-size: 18px;
  }
}
```

## 移动端布局规范

### 容器宽度

- **移动端最大宽度**：100%（不设置固定宽度）
- **内边距**：左右各 16px（标准），可根据设计调整
- **安全区域**：考虑刘海屏和底部手势区域

```css
.container {
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
}
```

### 字体大小

| 用途 | 移动端大小 | 桌面端大小 |
|------|-----------|-----------|
| 标题 H1 | 24px - 28px | 32px - 48px |
| 标题 H2 | 20px - 24px | 24px - 32px |
| 标题 H3 | 18px - 20px | 20px - 24px |
| 正文 | 14px - 16px | 16px - 18px |
| 辅助文字 | 12px - 14px | 14px - 16px |

### 间距规范

| 类型 | 移动端 | 桌面端 |
|------|--------|--------|
| 元素间距 | 8px - 16px | 16px - 24px |
| 模块间距 | 24px - 32px | 32px - 48px |
| 区块间距 | 48px - 64px | 64px - 96px |

### 触摸目标

- **最小触摸区域**：44px × 44px（Apple HIG 标准）
- **按钮高度**：最小 44px
- **链接间距**：最小 8px

```css
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}
```

## 图片和媒体

### 图片规范

```css
/* 响应式图片 */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 移动端图片尺寸 */
.hero-image {
  width: 100%;
  height: auto;
  max-height: 300px; /* 移动端限制高度 */
  object-fit: cover;
}

@media (min-width: 768px) {
  .hero-image {
    max-height: 500px;
  }
}
```

### 视频规范

```css
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

## 网格系统

### 移动端网格

```css
/* 移动端单列布局 */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 平板双列 */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* 桌面端多列 */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}
```

## Flexbox 布局

### 移动端 Flex 布局

```css
/* 移动端垂直堆叠 */
.flex-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 平板及以上水平排列 */
@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
    gap: 24px;
  }
}
```

## 导航和菜单

### 移动端导航

- **汉堡菜单**：移动端使用折叠菜单
- **底部导航**：固定底部，高度 56px - 64px
- **顶部导航**：固定顶部，高度 56px - 64px

```css
/* 移动端导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
}

/* 桌面端隐藏移动导航 */
@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}
```

## 表单元素

### 输入框

```css
.input {
  width: 100%;
  height: 44px; /* 最小触摸高度 */
  padding: 0 16px;
  font-size: 16px; /* 防止 iOS 自动缩放 */
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-sizing: border-box;
}
```

### 按钮

```css
.button {
  min-height: 44px;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
}

/* 移动端全宽按钮 */
@media (max-width: 767px) {
  .button-full {
    width: 100%;
  }
}
```

## 性能优化

### 移动端性能建议

1. **减少 HTTP 请求**：合并 CSS、JS 文件
2. **图片优化**：使用 WebP 格式，懒加载
3. **避免重排重绘**：使用 transform、opacity 动画
4. **字体优化**：使用系统字体或优化自定义字体加载

```css
/* 系统字体栈 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
}
```

## 预览设备尺寸

项目中预览功能使用的设备尺寸：

| 设备 | 宽度 | 说明 |
|------|------|------|
| Mobile (iPhone 6s) | 375px | 移动端参考机型 |
| iPad | 768px | 平板参考机型 |
| Web | 100% | 桌面端全屏 |

## 测试清单

移动端开发完成后，请确保：

- [ ] 在 375px 宽度下测试所有页面
- [ ] 触摸目标不小于 44px
- [ ] 字体不小于 12px
- [ ] 横屏模式正常显示
- [ ] 表单输入框字体大小不小于 16px（防止 iOS 缩放）
- [ ] 图片和媒体正确加载
- [ ] 滚动流畅，无卡顿
- [ ] 固定元素不遮挡内容

## 相关文件

- [coding_standards.md](coding_standards.md) - 编码规范
- [api_client_rules.md](api_client_rules.md) - API 客户端规范
