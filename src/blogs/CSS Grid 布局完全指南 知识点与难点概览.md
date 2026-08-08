---
tag: ['CSS', 'Grid', '布局', '前端']
date: 2026-08-08
detail: Grid 网格布局是当前最强大的 CSS 二维布局方案。本文从网格轨道、网格单元、网格线等核心概念讲起，系统梳理容器属性与项目属性，并针对网格线编号、隐式网格、auto-fill 与 auto-fit、fr 与 minmax 等高频难点逐一拆解，每个知识点都配有 HTML 实例与 SVG 示意图。
---

<!-- demo-area start -->
<style>
.demo-card {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px 20px 24px 20px;
  margin: 20px 0 32px 0;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.demo-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  font-weight: 600;
}
/* 5.1 两栏布局 */
.demo-grid-two {
  display: grid;
  grid-template-columns: 100px 1fr;
  min-height: 160px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.demo-two-sidebar {
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #1c1917;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 14px;
}
.demo-two-main {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  color: #fff;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 14px;
}
/* 5.2 十二栅格 */
.demo-grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 8px;
}
.demo-g12 {
  background: linear-gradient(135deg, #818cf8, #4f46e5);
  color: #fff;
  text-align: center;
  padding: 14px 0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}
.demo-col-4 { grid-column: span 4; }
.demo-col-8 { grid-column: span 8; }
.demo-col-6 { grid-column: span 6; }
.demo-col-12 { grid-column: span 12; }
/* 5.3 水平垂直居中 */
.demo-grid-center {
  display: grid;
  place-content: center;
  height: 200px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 8px;
}
.demo-center-box {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: #fff;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 700;
}
/* 5.4 圣杯布局 */
.demo-holy {
  display: grid;
  grid-template-areas:
    'header header'
    'nav    main'
    'footer footer';
  grid-template-columns: 140px 1fr;
  grid-template-rows: 44px 1fr 40px;
  height: 260px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.demo-holy-header {
  grid-area: header;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  display: grid;
  place-content: center;
  font-weight: 700;
  color: #fff;
}
.demo-holy-nav {
  grid-area: nav;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  display: grid;
  place-content: center;
  font-weight: 700;
  color: #1c1917;
}
.demo-holy-main {
  grid-area: main;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-content: center;
  font-weight: 700;
  color: #e2e8f0;
}
.demo-holy-footer {
  grid-area: footer;
  background: linear-gradient(135deg, #34d399, #059669);
  display: grid;
  place-content: center;
  font-weight: 700;
  color: #fff;
}
/* 5.5 自适应两端对齐 */
.demo-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.demo-card-item {
  height: 90px;
  background: linear-gradient(135deg, #c7d2fe, #818cf8);
  color: #1e1b4b;
  border-radius: 8px;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 14px;
}
</style>
<!-- demo-area end -->

> **网格布局（Grid）是最强大的 CSS 布局方案。** —— 阮一峰

虽然有段时间 JavaScript 的风头盖过了 CSS，但 CSS 其实一直在进步。弹性布局（Flexbox）、网格布局（Grid）相继被各大主流浏览器原生支持，我们终于可以摆脱 Bootstrap 栅格系统、告别各种 hack，用一两行 CSS 就实现复杂的页面布局。

Grid 是**二维布局**方案，能同时控制"行"和"列"；而 Flexbox 本质是**一维布局**，只能沿一个主轴排列。这是两者最根本的区别，也是 Grid 擅长搭页面骨架、Flexbox 擅长排组件内部的原因。

本文重在讲清 **Grid 的知识点与难点**：先建立核心概念（网格轨道、网格单元、网格线、网格区域），再梳理容器属性与项目属性，最后集中攻破几个高频难点。

---

## 1. 核心概念

在动手写代码之前，先建立一套"网格世界观"。Grid 布局把容器划分成**行（row）**和**列（column）**，行与列交叉产生**单元格**，项目就放置在单元格中。

一个完整的网格体系由 6 个核心概念组成：

| 概念 | 英文 | 一句话解释 |
| --- | --- | --- |
| 网格容器 | Grid Container | 设置了 `display: grid` 的元素 |
| 网格项目 | Grid Item | 容器的**顶层子元素** |
| 网格轨道 | Grid Track | 相邻两条网格线之间的区域，即一行或一列 |
| 网格单元 | Grid Cell | 相邻两条行网格线与列网格线围成的最小矩形 |
| 网格区域 | Grid Area | 多个网格单元组成的矩形区域 |
| 网格线 | Grid Line | 划分网格的分界线，横向叫行网格线，纵向叫列网格线 |

先看最基础的 HTML 结构——一个容器，6 个子项目，后面所有示意图都基于它：

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px); /* 3 列，每列 100px */
  grid-template-rows: repeat(2, 80px);    /* 2 行，每行 80px */
  gap: 10px;                              /* 行列间隙 */
}
```

下面这张图把 6 个概念一网打尽（容器 = 整个虚线框内区域，项目 = 数字块）：

<svg width="460" height="300" viewBox="0 0 460 300" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="440" height="280" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="14" y="26" font-size="12" fill="#64748b" font-family="sans-serif">网格容器 Grid Container</text>
  <!-- 3 列 x 2 行，格 110x90，gap 12 -->
  <!-- 列位置: x=30,152,274 ; 行位置: y=50,152 -->
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="30" y="50" width="110" height="90" fill="#f1f5f9"/>
    <rect x="152" y="50" width="110" height="90" fill="#ffffff"/>
    <rect x="274" y="50" width="110" height="90" fill="#f1f5f9"/>
    <rect x="30" y="152" width="110" height="90" fill="#ffffff"/>
    <rect x="152" y="152" width="110" height="90" fill="#f1f5f9"/>
    <rect x="274" y="152" width="110" height="90" fill="#ffffff"/>
  </g>
  <g font-family="sans-serif" font-size="20" fill="#475569" text-anchor="middle">
    <text x="85" y="103">1</text>
    <text x="207" y="103">2</text>
    <text x="329" y="103">3</text>
    <text x="85" y="205">4</text>
    <text x="207" y="205">5</text>
    <text x="329" y="205">6</text>
  </g>
</svg>

> 关键认知：**项目（Grid Item）只能是容器的顶层子元素**。嵌套在项目里的孙元素不算 Grid 项目，不会直接参与这个容器的网格布局。

### 1.1 网格轨道（Grid Track）

**轨道**是相邻两条网格线之间的区域，**一行或一列就是一条轨道**。`grid-template-columns` 定义的就是**列轨道**的尺寸，`grid-template-rows` 定义的是**行轨道**的尺寸。

<svg width="460" height="310" viewBox="0 0 460 310" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 3 列 x 2 行，格 110x100，gap 12；行1 y=40，行2 y=152 -->
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="30" y="40" width="110" height="100" fill="#ffffff"/>
    <rect x="152" y="40" width="110" height="100" fill="#dbeafe"/>
    <rect x="274" y="40" width="110" height="100" fill="#ffffff"/>
    <rect x="30" y="152" width="110" height="100" fill="#ffffff"/>
    <rect x="152" y="152" width="110" height="100" fill="#dbeafe"/>
    <rect x="274" y="152" width="110" height="100" fill="#ffffff"/>
  </g>
  <!-- 列轨道高亮：第 2 列（蓝），覆盖两行 -->
  <rect x="152" y="40" width="110" height="212" fill="#3b82f6" opacity="0.10"/>
  <!-- 行轨道高亮：第 1 行（橙），覆盖三列 -->
  <rect x="30" y="40" width="354" height="100" fill="#f97316" opacity="0.10"/>
  <g font-family="sans-serif" font-size="20" fill="#475569" text-anchor="middle">
    <text x="85" y="102">1</text>
    <text x="207" y="102">2</text>
    <text x="329" y="102">3</text>
    <text x="85" y="214">4</text>
    <text x="207" y="214">5</text>
    <text x="329" y="214">6</text>
  </g>
  <text x="32" y="30" font-size="12" fill="#ea580c" font-family="sans-serif" text-anchor="start">↑ 行轨道（第 1 行，橙色）</text>
  <text x="448" y="30" font-size="12" fill="#2563eb" font-family="sans-serif" text-anchor="end">列轨道（第 2 列，蓝色）→</text>
  <!-- 轨道尺寸标注 -->
  <line x1="152" y1="272" x2="262" y2="272" stroke="#2563eb" stroke-width="1.5"/>
  <text x="207" y="290" font-size="11" fill="#2563eb" font-family="sans-serif" text-anchor="middle">列轨道宽 110px</text>
  <line x1="16" y1="40" x2="16" y2="140" stroke="#ea580c" stroke-width="1.5"/>
  <text x="20" y="90" font-size="11" fill="#ea580c" font-family="sans-serif" transform="rotate(-90 20 90)" text-anchor="middle">行轨道高 100px</text>
</svg>

对应的 CSS 实例：

```css
.container {
  display: grid;
  /* 定义了 3 条列轨道，宽度分别为 100px、100px、100px */
  grid-template-columns: 100px 100px 100px;
  /* 定义了 2 条行轨道，高度分别为 80px、80px */
  grid-template-rows: 80px 80px;
}
```

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

> 轨道尺寸支持 `px`、`%`、`em`、`fr`、`auto` 等单位。**`fr` 是 Grid 独有的弹性单位**，表示"剩余空间的份数"，会在后面详细介绍。

### 1.2 网格单元（Grid Cell）

**网格单元**是两条相邻行网格线和两条相邻列网格线围成的最小矩形——可以理解为网格里的"一个格子"。它是 Grid 布局的最小单位，也是 `grid-auto-flow` 自动排布时项目默认落下的位置。

<svg width="460" height="320" viewBox="0 0 460 320" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 3 列 x 3 行，高亮第2行第2列的单元 -->
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="30" y="30" width="110" height="80" fill="#f1f5f9"/>
    <rect x="152" y="30" width="110" height="80" fill="#ffffff"/>
    <rect x="274" y="30" width="110" height="80" fill="#f1f5f9"/>
    <rect x="30" y="122" width="110" height="80" fill="#ffffff"/>
    <rect x="152" y="122" width="110" height="80" fill="#c7d2fe"/>
    <rect x="274" y="122" width="110" height="80" fill="#ffffff"/>
    <rect x="30" y="214" width="110" height="80" fill="#f1f5f9"/>
    <rect x="152" y="214" width="110" height="80" fill="#ffffff"/>
    <rect x="274" y="214" width="110" height="80" fill="#f1f5f9"/>
  </g>
  <!-- 高亮单元的行列线 -->
  <line x1="152" y1="122" x2="262" y2="122" stroke="#4f46e5" stroke-width="2"/>
  <line x1="152" y1="202" x2="262" y2="202" stroke="#4f46e5" stroke-width="2"/>
  <line x1="152" y1="122" x2="152" y2="202" stroke="#4f46e5" stroke-width="2"/>
  <line x1="262" y1="122" x2="262" y2="202" stroke="#4f46e5" stroke-width="2"/>
  <g font-family="sans-serif" font-size="18" fill="#475569" text-anchor="middle">
    <text x="85" y="76">1</text>
    <text x="207" y="76">2</text>
    <text x="329" y="76">3</text>
    <text x="85" y="168">4</text>
    <text x="329" y="168">6</text>
    <text x="85" y="260">7</text>
    <text x="207" y="260">8</text>
    <text x="329" y="260">9</text>
  </g>
  <text x="207" y="160" font-size="14" fill="#4338ca" font-family="sans-serif" text-anchor="middle" font-weight="bold">网格单元</text>
  <text x="207" y="178" font-size="11" fill="#4338ca" font-family="sans-serif" text-anchor="middle">Grid Cell</text>
  <text x="230" y="310" font-size="11" fill="#64748b" font-family="sans-serif" text-anchor="middle">网格单元 = 相邻两条行网格线与相邻两条列网格线围成的最小矩形（图示：第 2 行第 2 列）</text>
</svg>

> 关键认知：**网格单元 = 行轨道 ∩ 列轨道**。一个 `3×3` 的网格有 9 个网格单元；网格单元的数量决定了"隐式网格"的默认形状。

### 1.3 网格线（Grid Line）

**网格线**是划分网格的分界线。水平方向的叫**行网格线（row line）**，垂直方向的叫**列网格线（column line）**。每条网格线都有**编号**——这是 Grid 定位的核心机制，务必牢记：

- **编号从 1 开始**，不是 0！
- 正数从左（上）往右（下）数：第 1 条、第 2 条……
- **负数从右（下）往左（上）数**：`-1` 是最后一条网格线
- 一个 3 列的网格有 **4 条**列网格线（3 列 + 1 条边界）

<svg width="480" height="340" viewBox="0 0 480 340" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 3 列 x 2 行，标注 4 条列网格线 -->
  <g fill="#ffffff" stroke="#94a3b8" stroke-width="1.5">
    <rect x="40" y="60" width="110" height="90"/>
    <rect x="162" y="60" width="110" height="90"/>
    <rect x="284" y="60" width="110" height="90"/>
    <rect x="40" y="162" width="110" height="90"/>
    <rect x="162" y="162" width="110" height="90"/>
    <rect x="284" y="162" width="110" height="90"/>
  </g>
  <!-- 4 条列网格线 -->
  <line x1="40" y1="60" x2="40" y2="252" stroke="#3b82f6" stroke-width="2.5"/>
  <line x1="162" y1="60" x2="162" y2="252" stroke="#3b82f6" stroke-width="2.5"/>
  <line x1="284" y1="60" x2="284" y2="252" stroke="#3b82f6" stroke-width="2.5"/>
  <line x1="406" y1="60" x2="406" y2="252" stroke="#3b82f6" stroke-width="2.5"/>
  <!-- 顶部编号 -->
  <g font-family="sans-serif" font-size="13" fill="#2563eb" text-anchor="middle">
    <text x="40" y="44">①</text>
    <text x="162" y="44">②</text>
    <text x="284" y="44">③</text>
    <text x="406" y="44">④</text>
  </g>
  <!-- 底部负编号 -->
  <g font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">
    <text x="40" y="286">-4</text>
    <text x="162" y="286">-3</text>
    <text x="284" y="286">-2</text>
    <text x="406" y="286">-1</text>
  </g>
  <!-- 行网格线标注 -->
  <line x1="24" y1="60" x2="24" y2="162" stroke="#ea580c" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="16" y="116" font-size="11" fill="#ea580c" font-family="sans-serif" transform="rotate(-90 16 116)" text-anchor="middle">行网格线</text>
  <!-- 顶部 / 底部说明 -->
  <text x="240" y="26" font-size="12" fill="#2563eb" font-family="sans-serif" text-anchor="middle" font-weight="bold">正数编号：从 1 开始，从左往右数</text>
  <text x="240" y="316" font-size="12" fill="#dc2626" font-family="sans-serif" text-anchor="middle" font-weight="bold">负数编号：-1 是最后一条网格线，从右往左数</text>
</svg>

> **项目定位的本质，就是指定项目四条边落在哪条网格线上**。后面讲的 `grid-column-start/end`、`grid-row-start/end` 全部基于网格线编号。

### 1.4 网格区域（Grid Area）

**网格区域**由一个或多个相邻网格单元组成，是一个矩形。可以通过 `grid-template-areas` 给区域命名，命名后会自动产生**隐式命名的网格线**：区域起始处的网格线叫 `<区域名>-start`，终止处叫 `<区域名>-end`。

经典的页头 + 侧边栏 + 主内容 + 页脚布局：

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 80px 1fr 60px;
  grid-template-areas:
    'header  header'
    'sidebar main'
    'footer  footer';
  height: 400px;
}
```

```html
<div class="container">
  <header class="header">页头</header>
  <aside class="sidebar">侧边栏</aside>
  <main class="main">主内容</main>
  <footer class="footer">页脚</footer>
</div>
```

```css
/* 项目通过 grid-area 引用区域名，自动铺满对应区域 */
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

<svg width="460" height="300" viewBox="0 0 460 300" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 2 列 x 3 行的区域布局 -->
  <rect x="30" y="30" width="400" height="60" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <rect x="30" y="102" width="140" height="150" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5" rx="4"/>
  <rect x="182" y="102" width="248" height="150" fill="#c7d2fe" stroke="#4f46e5" stroke-width="1.5" rx="4"/>
  <rect x="30" y="264" width="400" height="30" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5" rx="4"/>
  <text x="230" y="66" font-size="16" fill="#1d4ed8" font-family="sans-serif" text-anchor="middle">header（跨 2 列）</text>
  <text x="100" y="182" font-size="16" fill="#c2410c" font-family="sans-serif" text-anchor="middle" transform="rotate(-90 100 182)">sidebar</text>
  <text x="306" y="182" font-size="16" fill="#4338ca" font-family="sans-serif" text-anchor="middle">main</text>
  <text x="230" y="284" font-size="13" fill="#15803d" font-family="sans-serif" text-anchor="middle">footer</text>
  <!-- 隐式命名网格线标注 -->
  <text x="30" y="22" font-size="11" fill="#64748b" font-family="sans-serif">header-start</text>
  <text x="438" y="22" font-size="11" fill="#64748b" font-family="sans-serif" text-anchor="end">header-end</text>
</svg>

> 使用 `grid-template-areas` 时，同一行中**必须用相同数量的字符串**（本列数相同），不相邻的区域不能同名，区域必须是矩形（不能是 L 形）。

---

## 2. 容器属性

容器属性必须写在**容器**（`display: grid` 的元素）上。设置网格布局后，容器子元素的 `float`、`display: inline-block`、`display: table-cell`、`vertical-align` 和 `column-*` 等设置都会失效。

### 2.1 开启网格：display

```css
display: grid;         /* 块级网格容器，独占一行 */
display: inline-grid;  /* 内联网格容器，不独占一行 */
```

### 2.2 定义轨道：grid-template-columns / grid-template-rows

轨道尺寸可以混用多种单位，常见写法：

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;        /* 3 列，每列固定 100px */
  grid-template-rows: 100px 100px 100px;           /* 3 行，每行固定 100px */
}
```

### 2.3 fr 弹性单位

`fr`（fraction，份）是 Grid 最常用的单位，表示**剩余空间的份数**。它把可用空间按比例分配给各轨道：

<svg width="460" height="240" viewBox="0 0 460 240" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- grid-template-columns: 100px 1fr 2fr 示意 -->
  <rect x="30" y="40" width="100" height="90" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="142" y="40" width="110" height="90" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>
  <rect x="264" y="40" width="156" height="90" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5"/>
  <g font-family="sans-serif" font-size="14" fill="#1e40af" text-anchor="middle">
    <text x="80" y="88" fill="#475569">固定 100px</text>
    <text x="197" y="88">1fr（1 份）</text>
    <text x="342" y="88">2fr（2 份）</text>
  </g>
  <text x="230" y="160" font-size="13" fill="#334155" font-family="sans-serif" text-anchor="middle">剩余空间 = 容器宽 - 100px - 2 个 gap，按 1 : 2 分配</text>
  <text x="230" y="186" font-size="13" fill="#334155" font-family="sans-serif" text-anchor="middle">第 2 列占 1/3，第 3 列占 2/3</text>
</svg>

```css
.container {
  display: grid;
  grid-template-columns: 100px 1fr 2fr;
  /* 第 1 列固定 100px，剩余空间按 1 : 2 分给第 2、3 列 */
}
```

```css
/* 更多 fr 用法 */
grid-template-columns: repeat(3, 1fr);  /* 3 列等宽，最常用 */
grid-template-columns: 100px auto;      /* 第 1 列 100px，第 2 列自适应剩余 */
```

> `1fr 1fr 1fr` 与 `repeat(3, 1fr)` 完全等价。**`fr` 不等于 `%`**：百分比基于容器宽度计算，而 `fr` 先扣除所有固定尺寸轨道，再分配**剩余空间**，两者在"有 gap 或固定列"时结果不同。

### 2.4 repeat() 与 minmax() 函数

`repeat()` 用来重复定义轨道，`minmax()` 用来给轨道设置尺寸范围：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px);          /* 等价于 100px 100px 100px */
  grid-template-columns: repeat(2, 1fr 2fr);        /* 等价于 1fr 2fr 1fr 2fr */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 响应式栅格，见难点 4 */
}

/* minmax(最小值, 最大值) —— 轨道在区间内弹性伸缩 */
grid-template-columns: 1fr 1fr minmax(200px, 2fr);
/* 前两列等宽；第 3 列最小 200px，正常情况下是前两列的 2 倍 */
```

### 2.5 auto-fill 与 auto-fit

两者都用于"**让轨道数量自适应容器宽度**"，配合 `minmax` 实现真正的响应式栅格：

```css
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 自动填充，轨道只增不减 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  /* 自动适配，轨道可折叠 */
```

- `auto-fill`：**尽可能多地创建轨道**，即使容器空着，也会为"放得下"的轨道留出空间（空轨道仍占位）。
- `auto-fit`：**同样尽可能创建轨道，但空轨道会被折叠为 0**，让项目自动拉伸填满。

两者只在一个项目不足一行时出现差异，具体见难点 4 的对比图。

### 2.6 项目间距：gap / row-gap / column-gap

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-row-gap: 20px;    /* 行与行的间隙 */
  grid-column-gap: 20px; /* 列与列的间隙 */
  gap: 20px;             /* 简写：行列间隙一致 */
  gap: 20px 10px;        /* 简写：行 20px，列 10px */
}
```

### 2.7 项目对齐：justify-items / align-items

控制**项目在网格单元内的**水平（`justify-items`）与垂直（`align-items`）位置：

```css
.container {
  display: grid;
  /* 项目在单元格内的水平位置 */
  justify-items: start | end | center | stretch;
  /* 项目在单元格内的垂直位置 */
  align-items: start | end | center | stretch;
  /* 简写：<align-items> <justify-items> */
  place-items: center;   /* 等价于 align-items:center; justify-items:center */
}
```

### 2.8 整体对齐：justify-content / align-content

当**所有轨道的总尺寸小于容器**时，控制整个网格在容器内的位置（类似 flex 的 content 对齐）：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;
  place-content: center; /* 网格整体水平垂直居中 */
}
```

> `place-items: center` 让**项目在各自单元格内**居中；`place-content: center` 让**整个网格在容器内**居中。两者别混淆！经典的一行代码水平垂直居中用的是后者（见实战 4.3）。

### 2.9 隐式网格：grid-auto-flow / grid-auto-rows / grid-auto-columns

当项目数量超过显式定义的轨道，或项目被定位到显式网格之外时，浏览器会**自动创建额外轨道**，这些自动生成的轨道叫**隐式轨道**：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px); /* 显式：3 列 */
  grid-auto-rows: 80px;   /* 隐式行高：自动创建的行都用 80px */
  grid-auto-flow: row;    /* 自动排布方向：row（先行后列，默认）| column | dense */
}
```

<svg width="460" height="260" viewBox="0 0 460 260" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 显式 1 行 + 隐式 1 行，共 5 个项目 -->
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="30" y="40" width="100" height="80" fill="#e0f2fe"/>
    <rect x="142" y="40" width="100" height="80" fill="#e0f2fe"/>
    <rect x="254" y="40" width="100" height="80" fill="#e0f2fe"/>
    <rect x="30" y="132" width="100" height="80" fill="#fef3c7"/>
    <rect x="142" y="132" width="100" height="80" fill="#fef3c7"/>
  </g>
  <!-- 隐式行标记 -->
  <line x1="30" y1="132" x2="354" y2="132" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="362" y="130" font-size="11" fill="#dc2626" font-family="sans-serif">隐式行（自动创建）</text>
  <text x="30" y="24" font-size="12" fill="#334155" font-family="sans-serif">显式：grid-template-columns: repeat(3, 100px)，只有 1 行（没写 rows）</text>
  <text x="30" y="244" font-size="12" fill="#334155" font-family="sans-serif">放了 5 个项目 → 第 4、5 个自动落到第 2 行，高度由 grid-auto-rows 决定（默认 auto）</text>
  <g font-family="sans-serif" font-size="18" fill="#475569" text-anchor="middle">
    <text x="80" y="88">1</text>
    <text x="192" y="88">2</text>
    <text x="304" y="88">3</text>
    <text x="80" y="180">4</text>
    <text x="192" y="180">5</text>
  </g>
</svg>

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
</div>
```

> `grid-auto-flow: dense` 是难点 5 的主角——它允许"回填"前面跳过的空洞，是瀑布流布局的利器。

---

## 3. 项目属性

项目属性必须写在**项目**上。定位项目的方法，就是**指定项目四条边分别落在哪条网格线**上。

### 3.1 基于网格线定位：grid-column / grid-row

```css
.item {
  /* 左边框落在第 1 条列网格线，右边框落在第 3 条列网格线（即跨 2 列） */
  grid-column-start: 1;
  grid-column-end: 3;
  /* 上边框落在第 1 条行网格线，下边框落在第 2 条行网格线 */
  grid-row-start: 1;
  grid-row-end: 2;
}
```

简写形式：

```css
.item {
  grid-column: 1 / 3;  /* 等价于 start:1; end:3 */
  grid-row: 1 / 2;     /* 等价于 start:1; end:2 */
  grid-column: 1 / span 2; /* span 关键字：从第 1 条线开始，跨 2 列 */
  grid-column: span 2;      /* 省略起始线：自动放置，只指定跨度 */
}
```

`span` 关键字与 `grid-auto-flow: dense` 配合，可以实现"前一个项目跨两列、后一个项目自动补位"的经典卡片流。

### 3.2 使用负数和命名网格线

负数网格线：`-1` 永远指向最后一条网格线，适合"从头跨到尾"：

```css
.item {
  grid-column: 1 / -1; /* 横跨整行，等价于 1 / 4（4 列网格时） */
}
```

命名网格线（在定义轨道时给线起名字）：

```css
.container {
  display: grid;
  grid-template-columns: [c1] 100px [c2] 100px [c3] auto [c4];
}
.item {
  grid-column: c2 / c4; /* 用名字代替数字编号 */
}
```

> 区域命名会自动生成隐式命名网格线：区域 `header` 的起始线叫 `header-start`，终止线叫 `header-end`，也可以直接拿来定位。

### 3.3 网格区域：grid-area

```css
.item {
  grid-area: 1 / 1 / 3 / 3;
  /* 等价于 row-start / column-start / row-end / column-end */
  grid-area: header; /* 引用容器上 grid-template-areas 命名的区域 */
}
```

### 3.4 项目自身对齐：justify-self / align-self / place-self

覆盖容器上的 `justify-items` / `align-items`，只作用于当前项目：

```css
.item {
  justify-self: start | end | center | stretch; /* 水平 */
  align-self: start | end | center | stretch;   /* 垂直 */
  place-self: center; /* 简写 */
}
```

---

## 4. 难点概览

理论都懂，一写就乱？下面 5 个难点是面试和实战中最容易踩坑的地方。

### 难点 1：网格线编号从 1 开始，负数是反着数的

**陷阱**：习惯了 JS 数组从 0 开始，容易把 `grid-column: 0 / 2` 写出来——这是无效值！网格线编号**从 1 开始**，0 不存在。

<svg width="480" height="220" viewBox="0 0 480 220" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 4 列，橙色项目从第 2 条线（-3）跨到第 4 条线（-1），即跨 2 列 -->
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="30" y="40" width="90" height="80" fill="#e0f2fe"/>
    <rect x="132" y="40" width="192" height="80" fill="#fed7aa"/>
    <rect x="336" y="40" width="90" height="80" fill="#bbf7d0"/>
  </g>
  <g font-family="sans-serif" font-size="13" fill="#2563eb" text-anchor="middle">
    <text x="30" y="28">1</text>
    <text x="132" y="28">2</text>
    <text x="234" y="28">3</text>
    <text x="336" y="28">4</text>
    <text x="438" y="28">5</text>
  </g>
  <g font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">
    <text x="30" y="146">-4</text>
    <text x="132" y="146">-3</text>
    <text x="234" y="146">-2</text>
    <text x="336" y="146">-1</text>
  </g>
  <text x="282" y="182" font-size="12" fill="#475569" font-family="sans-serif" text-anchor="middle">grid-column: -3 / -1 → 橙色项目从倒数第 3 条线跨到倒数第 1 条线</text>
</svg>

```css
.item {
  grid-column: -3 / -1;  /* 从倒数第 3 条列网格线到最后一条 */
  grid-column: 1 / -1;   /* 横跨整行，无论有多少列都成立 */
}
```

**记忆口诀**：正数从左往右数、负数从右往左数，`-1` 永远是最后一条边。

### 难点 2：显式网格 vs 隐式网格

显式网格是你用 `grid-template-*` 定义出来的网格；**任何超出显式网格范围或自动创建的轨道都是隐式的**。隐式轨道的尺寸默认是 `auto`（由内容撑开），常常导致布局"意外长高"：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px); /* 只定义了列 */
  /* 没有定义行 —— 所有行都是隐式行！ */
}
.item:nth-child(1) {
  grid-row: span 2; /* 跨越 2 个隐式行 */
}
```

```css
/* 解决：给隐式轨道一个确定尺寸 */
.container {
  grid-auto-rows: minmax(80px, auto); /* 隐式行最小 80px，内容多时撑开 */
}
```

### 难点 3：grid-auto-flow: dense 的回填行为

默认 `grid-auto-flow: row` 按顺序排布，一旦前面的项目跨度大、把后面的项目挤到了下一行，留下的**空洞不会自动填充**。`dense` 允许后面的项目"倒流"回填空洞：

<svg width="560" height="250" viewBox="0 0 560 250" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- 3 列网格：格宽 70 高 50，gap 10。项目 1、2 各跨 2 列 -->
  <text x="20" y="24" font-size="13" fill="#334155" font-family="sans-serif" font-weight="bold">默认 row：空洞保留 ×</text>
  <!-- 左图：grid-auto-flow: row -->
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="20" y="40" width="150" height="50" fill="#bfdbfe"/>
    <rect x="180" y="40" width="70" height="50" fill="#f8fafc" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4"/>
    <rect x="20" y="100" width="150" height="50" fill="#fdba74"/>
    <rect x="180" y="100" width="70" height="50" fill="#86efac"/>
    <rect x="20" y="160" width="70" height="50" fill="#c4b5fd"/>
  </g>
  <g font-family="sans-serif" font-size="15" fill="#475569" text-anchor="middle">
    <text x="95" y="72">1</text>
    <text x="95" y="132">2</text>
    <text x="215" y="132">3</text>
    <text x="55" y="192">4</text>
  </g>
  <text x="215" y="68" font-size="11" fill="#dc2626" font-family="sans-serif" text-anchor="middle">空洞</text>
  <text x="110" y="228" font-size="11" fill="#64748b" font-family="sans-serif" text-anchor="middle">项目 1 跨 2 列 → 项目 2 也跨 2 列被挤到第 2 行，</text>
  <text x="110" y="244" font-size="11" fill="#64748b" font-family="sans-serif" text-anchor="middle">第 1 行第 3 列留洞，项目 4 按顺序排到第 3 行，不回头</text>
  <!-- 右图：grid-auto-flow: row dense -->
  <text x="540" y="24" font-size="13" fill="#334155" font-family="sans-serif" font-weight="bold" text-anchor="end">row dense：项目 4 回填空洞 ✓</text>
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="290" y="40" width="150" height="50" fill="#bfdbfe"/>
    <rect x="450" y="40" width="70" height="50" fill="#c4b5fd"/>
    <rect x="290" y="100" width="150" height="50" fill="#fdba74"/>
    <rect x="450" y="100" width="70" height="50" fill="#86efac"/>
  </g>
  <g font-family="sans-serif" font-size="15" fill="#475569" text-anchor="middle">
    <text x="365" y="72">1</text>
    <text x="485" y="72">4</text>
    <text x="365" y="132">2</text>
    <text x="485" y="132">3</text>
  </g>
  <text x="485" y="36" font-size="11" fill="#7c3aed" font-family="sans-serif" text-anchor="middle">↑ 回填</text>
  <text x="395" y="228" font-size="11" fill="#64748b" font-family="sans-serif" text-anchor="middle">dense 允许后面的项目"倒流"填进第 1 行第 3 列的空洞</text>
</svg>

```css
.container {
  display: grid;
  grid-auto-flow: row dense; /* 允许后面项目回填空洞，实现瀑布流 */
}
```

> 注意 `dense` 会**改变项目的视觉顺序**，可能与 DOM 顺序不一致，对键盘焦点顺序和阅读顺序有影响，使用前请三思。

### 难点 4：auto-fill vs auto-fit，差在哪？

两者都配合 `minmax` 使用，区别只在**当容器放不下第二个轨道、产生"空轨道"时**：

- `auto-fill`：保留空轨道，宽度不变，项目不会拉伸。
- `auto-fit`：把空轨道折叠成 0，剩余空间重新分配给已有项目。

<svg width="480" height="260" viewBox="0 0 480 260" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <!-- auto-fill: 2 个轨道，第 2 个留白 -->
  <text x="20" y="24" font-size="13" fill="#334155" font-family="sans-serif" font-weight="bold">auto-fill：保留空轨道</text>
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="20" y="36" width="120" height="60" fill="#bfdbfe"/>
    <rect x="152" y="36" width="120" height="60" fill="#e2e8f0"/>
  </g>
  <text x="20" y="112" font-size="11" fill="#64748b" font-family="sans-serif">repeat(auto-fill, minmax(120px, 1fr)) → 第 2 条轨道为空，仍占位</text>
  <!-- auto-fit: 第 2 个轨道折叠，项目拉伸 -->
  <text x="20" y="146" font-size="13" fill="#334155" font-family="sans-serif" font-weight="bold">auto-fit：折叠空轨道，项目拉伸</text>
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="20" y="158" width="252" height="60" fill="#93c5fd"/>
  </g>
  <text x="20" y="234" font-size="11" fill="#64748b" font-family="sans-serif">repeat(auto-fit, minmax(120px, 1fr)) → 空轨道折叠为 0，项目占满整行</text>
  <line x1="140" y1="158" x2="140" y2="218" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="152" y="180" font-size="10" fill="#dc2626" font-family="sans-serif">空轨道被折叠</text>
</svg>

```css
/* 单个卡片占满一行，宽度足够时自动变成多列 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 若希望"无论多少都保持等宽列"，用 auto-fill 配合固定列宽 */
```

**实战经验**：卡片栅格几乎无脑用 `auto-fit + minmax`；需要"列数固定"时用 `repeat(n, 1fr)`。

### 难点 5：fr 与 minmax 的陷阱 —— 项目最小尺寸

这是最容易"翻车"的坑。**fr 轨道默认允许内容溢出**：当一个项目里有一长串不可断行的内容（如 URL、英文长单词）时，`1fr` 轨道可能被内容撑到超出容器，而不是压缩内容。

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr; /* 看起来没毛病？ */
}
.item {
  min-width: 0; /* 关键：允许项目内容收缩 */
}
```

原因：Grid 项目有 `min-width: auto` 的默认行为，类似 flex 项目。**解决方式**是给项目设 `min-width: 0`，或用 `minmax(0, 1fr)` 替代 `1fr`：

```css
grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); /* 彻底杜绝溢出 */
```

<svg width="460" height="240" viewBox="0 0 460 240" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="24" font-size="13" fill="#334155" font-family="sans-serif" font-weight="bold">❌ 1fr：内容超长时被撑爆</text>
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="20" y="36" width="180" height="60" fill="#fecaca"/>
    <rect x="212" y="36" width="228" height="60" fill="#e2e8f0"/>
  </g>
  <text x="110" y="72" font-size="11" fill="#7f1d1d" font-family="sans-serif" text-anchor="middle">thelongesturl…（溢出容器）</text>
  <text x="20" y="116" font-size="13" fill="#334155" font-family="sans-serif" font-weight="bold">✅ minmax(0, 1fr)：内容可收缩，比例稳定</text>
  <g stroke="#cbd5e1" stroke-width="1.5">
    <rect x="20" y="128" width="146" height="60" fill="#bbf7d0"/>
    <rect x="178" y="128" width="262" height="60" fill="#e2e8f0"/>
  </g>
  <text x="93" y="164" font-size="11" fill="#166534" font-family="sans-serif" text-anchor="middle">thelongesturl…（换行截断）</text>
  <text x="309" y="164" font-size="11" fill="#475569" font-family="sans-serif" text-anchor="middle">2fr</text>
  <text x="20" y="212" font-size="11" fill="#64748b" font-family="sans-serif">网格项目默认 min-width: auto，1fr 的最小尺寸是内容宽度；minmax(0, 1fr) 可打破该限制</text>
</svg>

---

## 5. 实战实例

### 5.1 两栏布局：一侧固定，一侧自适应

```html
<style>
  .container {
    display: grid;
    grid-template-columns: 100px 1fr; /* 或 100px auto */
    min-height: 200px;
  }
  aside { background: #fbbf24; }
  main  { background: #93c5fd; }
</style>
<div class="container">
  <aside>固定侧栏</aside>
  <main>自适应主内容区</main>
</div>
```

上面的代码渲染出的效果：

<div class="demo-card">
  <div class="demo-label">Live Demo — 两栏布局：100px 固定 + 1fr 自适应</div>
  <div class="demo-grid-two">
    <aside class="demo-two-sidebar">固定侧栏 100px</aside>
    <main class="demo-two-main">自适应主内容区 1fr</main>
  </div>
</div>

### 5.2 十二栅格布局

```html
<style>
  .container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 10px;
  }
  .item { background: #bfdbfe; text-align: center; padding: 16px 0; }
  /* 指定项目占用栅格数 */
  .col-4  { grid-column: span 4; }
  .col-8  { grid-column: span 8; }
</style>
<div class="container">
  <div class="item col-4">占 4 格</div>
  <div class="item col-8">占 8 格</div>
  <div class="item col-6">占 6 格</div>
  <div class="item col-6">占 6 格</div>
</div>
```

上面的代码渲染出的效果（4 + 8 凑满一行，6 + 6 再凑满一行）：

<div class="demo-card">
  <div class="demo-label">Live Demo — 十二栅格 repeat(12, 1fr)</div>
  <div class="demo-grid-12">
    <div class="demo-g12 demo-col-4">span 4</div>
    <div class="demo-g12 demo-col-8">span 8</div>
    <div class="demo-g12 demo-col-6">span 6</div>
    <div class="demo-g12 demo-col-6">span 6</div>
    <div class="demo-g12 demo-col-12">span 12</div>
  </div>
</div>

### 5.3 水平垂直居中（一行代码）

Grid 是目前唯一能用一行 CSS 实现水平垂直居中的方案：

```html
<style>
  .container {
    display: grid;
    place-content: center; /* 整个网格在容器内居中 */
    height: 200px;
    background: #f1f5f9;
  }
</style>
<div class="container">
  <div>我是居中的内容</div>
</div>
```

上面的代码渲染出的效果：

<div class="demo-card">
  <div class="demo-label">Live Demo — 一行代码水平垂直居中</div>
  <div class="demo-grid-center">
    <div class="demo-center-box">我是居中的内容</div>
  </div>
</div>

### 5.4 圣杯布局（响应式）

```html
<style>
  .container {
    display: grid;
    grid-template-areas:
      'header header'
      'nav    main'
      'footer footer';
    grid-template-columns: 180px 1fr;
    grid-template-rows: 60px 1fr 50px;
    min-height: 100vh;
  }
  header { grid-area: header; background: #93c5fd; }
  nav    { grid-area: nav;    background: #fbbf24; }
  main   { grid-area: main;   background: #fff; }
  footer { grid-area: footer; background: #86efac; }
  /* 窄屏时切换为单列 */
  @media (max-width: 640px) {
    .container {
      grid-template-areas:
        'header'
        'nav'
        'main'
        'footer';
      grid-template-columns: 1fr;
    }
  }
</style>
<div class="container">
  <header>页头</header>
  <nav>导航</nav>
  <main>主内容</main>
  <footer>页脚</footer>
</div>
```

上面的代码渲染出的效果（窗口宽度小于 640px 时会自动切换为单列）：

<div class="demo-card">
  <div class="demo-label">Live Demo — 圣杯布局 grid-template-areas</div>
  <div class="demo-holy">
    <header class="demo-holy-header">header</header>
    <nav class="demo-holy-nav">nav</nav>
    <main class="demo-holy-main">main</main>
    <footer class="demo-holy-footer">footer</footer>
  </div>
</div>

### 5.5 自适应两端对齐、最后一行左对齐

这是 flex 很难实现的经典场景：卡片数量不确定，要求**两端对齐 + 最后一行左对齐**。flex 方案需要空标签占位，而 Grid 的 `auto-fit` 天然支持：

```html
<style>
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  .card {
    height: 120px;
    background: #c7d2fe;
    border-radius: 8px;
  }
</style>
<div class="container">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <!-- 无论 3 个还是 5 个，最后一行都自动左对齐 -->
</div>
```

上面的代码渲染出的效果（改变浏览器窗口宽度，卡片会自动增减列数，最后一行始终左对齐）：

<div class="demo-card">
  <div class="demo-label">Live Demo — auto-fit 两端对齐、尾行左对齐</div>
  <div class="demo-grid-cards">
    <div class="demo-card-item">卡片 1</div>
    <div class="demo-card-item">卡片 2</div>
    <div class="demo-card-item">卡片 3</div>
    <div class="demo-card-item">卡片 4</div>
    <div class="demo-card-item">卡片 5</div>
  </div>
</div>

---

## 6. 总结

用一张图记住 Grid 的思维模型：

```
容器 display: grid
  ├─ 轨道定义：grid-template-columns / grid-template-rows（fr、repeat、minmax）
  ├─ 区域定义：grid-template-areas（自动生成 区域名-start/end 网格线）
  ├─ 间隙：gap
  ├─ 隐式轨道：grid-auto-flow（dense）、grid-auto-rows / grid-auto-columns
  ├─ 整体对齐：justify-content / align-content / place-content
  └─ 单元内对齐：justify-items / align-items / place-items
项目（容器的顶层子元素）
  ├─ 网格线定位：grid-column / grid-row（start/end、span、负数、命名线）
  ├─ 区域引用：grid-area
  └─ 自身对齐：justify-self / align-self / place-self
```

**5 个必背难点**：

1. 网格线编号从 **1** 开始，负数从尾部数，`-1` 是最后一条线。
2. 显式轨道没定义到的地方都是**隐式轨道**，记得用 `grid-auto-rows` 控制尺寸。
3. `dense` 能回填空洞（瀑布流），但会改变视觉顺序。
4. `auto-fit` 折叠空轨道、`auto-fill` 保留空轨道，卡片栅格用 `auto-fit + minmax`。
5. `1fr` 的隐藏坑：项目内容超长会撑爆轨道，用 `minmax(0, 1fr)` 或 `min-width: 0` 解决。

都 2026 年了，别再用 float 布局了——把 Grid 用起来，拥抱最强大的 CSS 布局方案。
