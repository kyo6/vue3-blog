# Markdown 渲染功能使用说明

## 功能概述

已成功集成 `markdown-it` 和 `highlight.js`，实现了 Markdown 文件的渲染功能，并支持代码高亮。

## 已完成的工作

### 1. 安装依赖

已在 `package.json` 中添加：
- `markdown-it`: ^14.1.1 - Markdown 解析器
- `highlight.js`: ^11.11.1 - 代码语法高亮

### 2. 创建组件

创建了通用的 Markdown 渲染组件：
- 路径：`src/components/MarkdownViewer.vue`
- 支持完整的 Markdown 语法
- 支持代码高亮（使用 GitHub 主题）
- 响应式设计，样式美观

### 3. 修改 demo1.vue

已将左侧面板的硬编码内容替换为动态渲染的 Markdown：
- 使用 `?raw` 方式导入 `demo.md` 文件
- 通过 `MarkdownViewer` 组件渲染内容

## 使用方法

### 在任何 Vue 组件中使用

```vue
<script setup>
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import myDoc from '@/docs/my-document.md?raw'
</script>

<template>
  <MarkdownViewer :markdown="myDoc" />
</template>
```

### MarkdownViewer 组件 Props

- `markdown`: String - 要渲染的 Markdown 字符串内容

## 支持的功能

### Markdown 语法
- ✅ 标题 (H1-H6)
- ✅ 段落和换行
- ✅ 强调（粗体、斜体）
- ✅ 列表（有序、无序）
- ✅ 代码块（带语法高亮）
- ✅ 行内代码
- ✅ 链接
- ✅ 引用块
- ✅ 分隔线
- ✅ 表格
- ✅ HTML 标签

### 代码高亮
支持多种编程语言的语法高亮：
- JavaScript/TypeScript
- HTML/CSS
- Python
- Java
- C/C++
- 等等...

## 样式定制

所有样式都在 `MarkdownViewer.vue` 中定义，可以根据需要修改：
- 标题样式（颜色、字号、边框）
- 代码块样式（背景、边框、字体）
- 链接样式（颜色、悬停效果）
- 表格样式
- 等等...

## 注意事项

1. **导入方式**：使用 `?raw` 后缀导入 Markdown 文件
   ```js
   import content from './file.md?raw'
   ```

2. **安全性**：组件中启用了 `html: true`，允许在 Markdown 中使用 HTML 标签

3. **性能**：对于大型文档，考虑使用虚拟滚动或懒加载

## 运行项目

```bash
npm run dev
```

访问 demo1 页面即可看到效果。
