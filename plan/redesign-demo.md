---
name: Redesign demo1 layout
overview: 重新设计 demo1.vue 页面，使其适配全局 Header、支持 Tailwind 主题切换，并参考 CSS 技术文档详情页的布局风格。
todos:
  - id: refactor-structure-template-hero-section-main-container-layout-reconstruct-template-structure-add-hero-section-and-main-container-layout
    content: 重构 demo1.vue 模板结构，添加 Hero Section 和主体容器布局
    status: completed
  - id: implement-showcase-card-layout-adapt-day1-component-display-layout-showcase-card-for-day1-component
    content: 实现 Showcase 展示卡片布局，适配 Day1 组件展示
    status: completed
  - id: apply-tailwind-theme-colors-adapt-global-header-spacing-and-dark-mode-apply-tailwind-theme-colors-handle-header-spacing-and-dark-mode
    content: 应用 Tailwind 主题色类，适配全局 Header 间距和暗黑模式
    status: completed
isProject: false
---

1. **分析并清理旧样式**: 移除 `src/views/animate/demo1.vue` 中硬编码的 CSS 样式，准备切换为 Tailwind。
2. **构建页面骨架**:

- 在顶部添加 Hero Section，包含标题和描述。
- 使用容器包裹主体内容，并设置 `max-w` 和居中。
- 为全局 Header 预留顶部间距。

1. **实现核心展示区 (Showcase)**:

- 仿照 `CSS技术文档详情页 (1).html` 的 `effect-card`，创建一个包含预览（左/上）和 Markdown 内容（右/下）的卡片。

1. **适配主题颜色**:

- 使用 Tailwind 的 `dark:` 类处理背景色、文字色、边框色。
- 确保 `MarkdownViewer` 在暗黑模式下也能正常显示（可能需要调整其内部类或父容器）。

1. **优化响应式设计**: 确保在不同屏幕尺寸下都有良好的表现。
