---
tag: ["Vue3", "路由重构", "架构", "Vite"]
date: "2026-08-10"
detail: "将站点拆分为 Blog / Docs / Works 三块的改造记录"
---

# 站点三分结构改造：Blog / Docs / Works

本文记录把 vue3-blog 从「Blog + Templates + ShowCase」重叠结构，收敛为 **技术文章 / Tailwind 文档 / 作品展示** 三块的一次改造：动机、路由设计、落地步骤，以及后续如何往 Works 里加 HTML。

## 背景与问题

改造前顶栏导航是：

- **Blog**：Markdown 文章列表与详情（定位清晰）
- **Templates**：`sidebar` 左右栏 + `views/templates/*.vue` 自动注册
- **ShowCase**：另一套左右栏，承载 100days CSS / Tailwind 示例

Templates 与 ShowCase 在形态上高度重叠——都是「左导航 + 右内容」的文档站体验，但内容职责混杂：

| 模块 | 实际装了什么 | 问题 |
|------|--------------|------|
| Templates | 组件说明壳子 + 幻灯片演示 | 文档与作品挤在同一棵树 |
| ShowCase | CSS/Tailwind 交互示例 | 与 Templates 布局重复，顶层导航语义模糊 |

另外还有一批独立 HTML（如设计系统页）想挂进站点：若硬塞进文档侧栏，会遇到双侧栏、全屏布局、Tailwind CDN token 与构建时 Tailwind 不一致等问题。

目标拆成三块：

1. **技术文章**：列表 + 详情  
2. **Tailwind / 组件文档**：左右分栏  
3. **作品展示**：卡片画廊，适合完整页面与 HTML iframe  

## 目标信息架构

```
App
 ├─ FrameHeader（Blog | Docs | Works）
 └─ RouterView
     ├─ / 、/blog/:id          → 文章
     ├─ /docs/*                → DocsLayout（sidebar）+ 文档页
     ├─ /works                 → 卡片画廊
     └─ /works/:id             → 详情（iframe | vue | 外链）
```

内容归属原则：

- **Docs**：可检索的说明、组件用法、带 Preview 的 CSS/Tailwind 示例  
- **Works**：完整页面、幻灯片、外部 HTML、产品/工具入口  
- **Blog**：叙事型技术文章与改造记录（本文即此）

## 路由改造要点

### Docs（原 Templates）

- 视图目录：`src/views/templates/` → `src/views/docs/`
- 路由：`/templates` → `/docs`
- 仍用 `import.meta.glob` 自动注册 `views/docs/*.vue`
- `menu.json` 中 `href` 改为 `docs/...`
- 旧路径兼容：`/templates/:pathMatch(.*)*` → `/docs/...`

### Works（新建）

```text
/works          → views/works/index.vue（卡片墙）
/works/:id      → views/works/detail.vue（按 type 渲染）
```

元数据集中在 `src/config/works.json`，详情页根据 `type` 分支：

| type | 行为 |
|------|------|
| `iframe` | 加载 `public/works/*.html` |
| `vue` | 动态加载 `views/works/components/*.vue` |
| `link` | 展示摘要并跳转外链 |

### ShowCase 并入 Docs

第一版曾用 `/docs/examples` + `meta.bare` 保留独立左右栏，避免与 Docs 侧栏叠两层。随后进一步拆成两个普通文档页：

- `/docs/css-card`
- `/docs/tailwind-plugins`

共用 `ExampleDocPage`（Preview + Markdown），挂在 Docs 侧栏 **Examples** 分组下。独立 `examples` 布局与 `bare` 分支已删除。`/show-case`、`/docs/examples` 重定向到 `/docs/css-card`。

## 关键目录变化

```text
src/
  views/
    blog/                 # 文章（基本未动）
    docs/                 # 原 templates + 示例页
      css-card.vue
      tailwind-plugins.vue
      installation.vue / form.vue / icons.vue
    works/
      index.vue           # 卡片画廊
      detail.vue
      components/         # type=vue 的作品
  config/
    menu.json             # Docs 侧栏
    works.json            # Works 元数据
  components/docs/
    ExampleDocPage.vue    # 示例页共用壳
public/
  works/                  # 静态 HTML（iframe 源）
```

## Works 与全局 Header 的视觉对齐

Works 列表采用深色作品墙背景（`#14181f`），与默认浅色 Header 冲突。处理方式：

1. `App.vue` 根据路由给 `html` 打上 `works-route`，同步 body 背景色  
2. Header 接收 `worksTheme`，在 `/works*` 下使用同色深色顶栏与强调色高亮  
3. 详情页二级顶栏使用同一套色板  

离开 Works 后恢复原有 Header / 主题逻辑。

## 在 Works 中新增 HTML 的流程

日常加一个独立 HTML 页，只需两步（**不必改路由**）：

### 1. 放入静态文件

```text
public/works/your-page.html
```

Vite 会按原路径托管，浏览器访问 `/works/your-page.html`。

### 2. 在 `works.json` 登记

```json
{
  "id": "your-page",
  "title": "页面标题",
  "stack": "HTML / Tailwind",
  "summary": "一句话说明。",
  "type": "iframe",
  "src": "/works/your-page.html",
  "linkLabel": "查看页面"
}
```

然后本地 `pnpm dev`，打开 `/works` 与 `/works/your-page` 验证。

**注意：**

- HTML 内相对资源建议一并放在 `public/works/`，或写成以 `/works/` 开头的绝对路径  
- 可继续使用 CDN Tailwind，与项目构建时 Tailwind 互不干扰  
- Vue 作品：组件放 `src/views/works/components/`，`type` 设为 `"vue"` 并填写 `component` 文件名  

## 旧路径兼容一览

| 旧路径 | 新路径 |
|--------|--------|
| `/templates/*` | `/docs/*` |
| `/templates/slides-api-management-intro` | `/works/slides-api-management-intro` |
| `/show-case` | `/docs/css-card` |
| `/docs/examples` | `/docs/css-card` |

## 改造收益与后续

**收益：**

- 顶栏语义与布局一一对应，Templates / ShowCase 重叠消失  
- HTML 作品用 iframe 隔离样式与脚本，接入成本低  
- Docs 示例复用统一壳组件，侧栏菜单可扩展  

**可继续做的：**

- 为 Works 卡片增加封面图字段  
- Docs 文档页内容补全（installation / form 等仍偏壳）  
- 视需要缩短旧路径 redirect 保留周期  

---

一句话总结：站点按 **写文章 / 读文档 / 看作品** 拆开；文档继续左右栏，作品用卡片 + iframe/组件详情，独立 HTML 只进 `public/works` 与 `works.json`。
