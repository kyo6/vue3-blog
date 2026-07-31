---
tag: ['SVG', '坐标系统', '前端绘图']
date: 2026-07-31
detail: SVG 之所以能精准绘图，靠的是一套清晰的坐标系统。本文系统梳理坐标系的基本概念、视口（viewport）与视图框（viewBox）的区别与用法，以及坐标变换（transform）的核心机制，帮你彻底搞懂 SVG 的"画图逻辑"。
---

SVG 是用于绘图的矢量格式，它和 Canvas、PostScript 等绘图技术一样，背后都依赖一套**网格坐标系统**。理解这套坐标系统，是掌握 SVG 定位、缩放、旋转等一切操作的前提。

很多初学者写 SVG 时会困惑：为什么图形没出现在预期的位置？为什么 `viewBox` 一改，内容就被整体缩放了？为什么 `transform` 的旋转中心不是图形中心？这些问题的答案，都藏在坐标系统里。

本文从最基础的坐标系讲起，逐步拆解视口与视图框的关系，最后落到坐标变换这一最实用的机制。

---

## 1. 坐标系基本概念

SVG 使用的是一套**用户坐标系（user coordinate system）**，它有三条最基础的约定：

- **原点在左上角**，坐标为 `(0, 0)`。
- **X 轴正方向向右，Y 轴正方向向下**——注意这和数学里 Y 轴向上的笛卡尔坐标系是反的，也是很多人初学时"旋转方向看反"的根源。
- 坐标的**单位默认为"用户单位"（user unit）**，在没有额外缩放时，1 用户单位 = 1 像素（px）。

下面用一个内联 SVG 直观展示这套坐标系：`(0,0)` 位于左上角，X 轴向右、Y 轴向下，两个标记点的坐标分别是 `(60, 50)` 和 `(140, 110)`。

<svg width="220" height="150" viewBox="0 0 220 150" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <line x1="20" y1="20" x2="200" y2="20" stroke="#9ca3af" stroke-width="1"/>
  <line x1="20" y1="20" x2="20" y2="130" stroke="#9ca3af" stroke-width="1"/>
  <polygon points="200,16 208,20 200,24" fill="#9ca3af"/>
  <polygon points="16,130 20,138 24,130" fill="#9ca3af"/>
  <text x="185" y="14" font-size="11" fill="#6b7280">x</text>
  <text x="6" y="128" font-size="11" fill="#6b7280">y</text>
  <text x="24" y="34" font-size="11" fill="#6b7280">(0,0)</text>
  <circle cx="80" cy="70" r="4" fill="#7c3aed"/>
  <text x="86" y="74" font-size="11" fill="#7c3aed">(60,50)</text>
  <circle cx="160" cy="110" r="4" fill="#7c3aed"/>
  <text x="120" y="128" font-size="11" fill="#7c3aed">(140,110)</text>
</svg>

> 关键认知：**你在 SVG 里写的所有坐标（`<rect x="…">`、`<circle cx="…">` 等），都是在这个用户坐标系里取值**，而不是直接对应屏幕像素。屏幕像素只是"最终映射结果"。

---

## 2. viewport 视口：SVG 的"画布"有多大

**viewport（视口）** 指的是 SVG 元素在 HTML 页面中占据的那块真实画布区域，它由 `<svg>` 的 `width`、`height` 属性决定。

- 如果显式声明了 `width` / `height`，视口就是对应大小的矩形。
- 如果**不声明**，浏览器会给出一个默认视口：**300px × 150px**。

下面这段是最朴素的 SVG：没有 `viewBox`，只有视口 `300 × 200`，内部图形按用户坐标直接绘制。


<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;">
  <rect width="100%" height="100%" stroke="#FF5151" stroke-width="4" fill="#FF8EFF" />
  <circle cx="150" cy="100" r="80" fill="#BE77FF" />
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="white">你好</text>
</svg>


```xml
<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  width="300"
  height="200"
>
  <rect width="100%" height="100%" stroke="#FF5151" stroke-width="4" fill="#FF8EFF" />
  <circle cx="150" cy="100" r="80" fill="#BE77FF" />
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="white">你好</text>
</svg>
```

此时的逻辑是：**用户坐标系 = 视口坐标系**，`(0,0)` 在左上角，`(150,100)` 正好落在画布中心。

> 易错点：`width`/`height` 不仅可以写像素（`300`），也可以写百分比（`100%`）。写百分比时，它相对于**父容器**的尺寸计算，这一点在响应式布局里非常有用。

---

## 3. viewBox 视图框：在画布里"框选"要看的坐标世界

**viewBox（视图框）** 是 SVG 最精妙、也最容易被误解的概念。它定义的是：**在用户坐标系里，我们究竟要截取多大一块区域、映射到整个视口上**。

`viewBox` 接收四个参数：

```
viewBox="min-x min-y width height"
```

- `min-x`、`min-y`：可视区左上角在用户坐标系中的位置；
- `width`、`height`：可视区的宽和高（同样是用户单位）；
- 若 `width` 或 `height` 设为 `0`，则表示"没有可视区"，什么都看不到。

**初始状态下，`viewBox` 的范围和 `viewport` 完全一致**（例如视口 300×200，则等价于 `viewBox="0 0 300 200"`）。

一旦你显式指定一个更小的 `viewBox`，魔法就发生了——SVG 会**自动把这一小块坐标区域缩放、铺满整个视口**：
<div class="flex">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;">
  <rect width="100%" height="100%" stroke="#FF5151" stroke-width="4" fill="#FF8EFF" />
  <circle cx="150" cy="100" r="80" fill="#BE77FF" />
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="white">你好</text>
</svg>

<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 100 100" style="display:block;margin:1.5rem auto;border:1px solid #e5e7eb;background:#fff;">
  <rect width="100%" height="100%" stroke="#FF5151" stroke-width="4" fill="#FF8EFF" />
  <circle cx="150" cy="100" r="80" fill="#BE77FF" />
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="white">你好</text>
</svg>
</div>

```xml
<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  width="300"
  height="200"
  viewBox="0 0 100 100"
>
  <rect width="100%" height="100%" stroke="#FF5151" stroke-width="4" fill="#FF8EFF" />
  <circle cx="150" cy="100" r="80" fill="#BE77FF" />
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="white">你好</text>
</svg>
```

这段代码里，视口仍是 `300 × 200`，但 `viewBox` 只看 `0 0 100 100` 这一块用户坐标。于是原本超出 `100×100` 的圆和文字，被整体缩放后塞进了视口——你会发现图形"变大"了，因为它被放大以填满更大的画布。

> 一句话区分二者：
> - **viewport 决定"画框（窗户）有多大"**——它是物理像素尺寸；
> - **viewBox 决定"窗外的风景截取哪一段、以多大比例放进来"**——它是逻辑坐标范围。

下面用两个并排的内联 SVG 直观对比：左图没有 `viewBox`（用户坐标直接等于视口），右图 `viewBox="0 0 50 50"` 把局部放大铺满同样大小的视口。

<svg width="180" height="140" viewBox="0 0 100 100" style="display:inline-block;margin:1rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="100" height="100" fill="#FF8EFF"/>
  <circle cx="50" cy="50" r="30" fill="#BE77FF"/>
  <text x="50" y="55" font-size="12" text-anchor="middle" fill="#fff">无 viewBox</text>
</svg>
<svg width="180" height="140" viewBox="0 0 50 50" style="display:inline-block;margin:1rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="100" height="100" fill="#FF8EFF"/>
  <circle cx="50" cy="50" r="30" fill="#BE77FF"/>
  <text x="50" y="55" font-size="12" text-anchor="middle" fill="#fff">viewBox 0 0 50 50</text>
</svg>

---

## 4. preserveAspectRatio：控制缩放时怎么对齐

当 `viewBox` 的宽高比和 `viewport` 不一致时，SVG 必须决定：是拉伸变形、还是保留比例并选择对齐方式？这由 `preserveAspectRatio` 控制。

语法为：

```
preserveAspectRatio = <align> <meetOrSlice>?
```

### 4.1 align：对齐方式（9 种 + none）

`align` 由 `x` 方向和 `y` 方向各取一个值组合而成：

| 取值 | 含义 |
| --- | --- |
| `none` | 不保持比例，直接拉伸 `viewBox` 填满整个视口（可能变形） |
| `xMin` | 视图框与视口**左边缘**对齐 |
| `xMid` | 视图框与视口 **x 轴中心**对齐（默认） |
| `xMax` | 视图框与视口**右边缘**对齐 |
| `YMin` | 视图框与视口**上边缘**对齐 |
| `YMid` | 视图框与视口 **y 轴中心**对齐（默认） |
| `YMax` | 视图框与视口**下边缘**对齐 |

组合后就得到 `xMinYMin`、`xMidYMid`、`xMaxYMax` 等 9 种定位。

### 4.2 meet / slice：如何取舍多余空间

- **`meet`**：保持宽高比，**尽可能放大**直到完整可见（类似 CSS 的 `object-fit: contain` / `background-size: contain`）。这是默认值。
- **`slice`**：保持宽高比，**取较大的缩放比**使视口被铺满，超出部分被裁掉（类似 CSS 的 `object-fit: cover` / `background-size: cover`）。
- **`none`**（仅作为 `align` 取值）：不保持比例，x、y 方向各自拉伸填满视口，可能变形。

常见默认值是 `xMidYMid meet`，即"居中、完整显示"。

### 4.3 计算流程：meetOrSlice 决定 scale，align 决定 offset

上一节讲到 viewBox 映射分五步，其中**步骤 3（算缩放比）和步骤 4（算偏移量）完全由 `preserveAspectRatio` 控制**。把它接上前面的公式，完整流程如下。

**第一步：算两个候选缩放比**（只跟 viewport 和 viewBox 尺寸有关）

```
sx = viewport宽 / viewBox宽
sy = viewport高 / viewBox高
```

**第二步：`<meetOrSlice>` 决定最终 scale**

| meetOrSlice | scale 公式 | 效果 |
| --- | --- | --- |
| `meet` | `min(sx, sy)` | 完整显示 viewBox，可能留白 |
| `slice` | `max(sx, sy)` | 铺满视口，可能裁切 |
| `none` | 不统一，x/y 各用各的 | `scaleX = sx`，`scaleY = sy`，可能变形 |

算出 scale 后，viewBox 映射到视口的逻辑尺寸为：

```
mappedW = viewBox宽 × scale
mappedH = viewBox高 × scale
```

**第三步：算「差额」**

```
extraX = viewport宽 - mappedW
extraY = viewport高 - mappedH
```

- **meet** 时，至少有一边 `extra = 0`（刚好贴满），另一边 `extra > 0`（留白）。
- **slice** 时，至少有一边 `extra = 0`（刚好贴满），另一边 `extra < 0`（溢出，需要裁切）。
- **none** 时，直接拉伸到视口大小，`extraX = extraY = 0`，无需偏移。

**第四步：`<align>` 决定 offset**

`align` 由 x 方向和 y 方向各取一个值组合，决定差额如何分配：

```
offsetX = extraX × x系数
offsetY = extraY × y系数
```

| x 方向 | x系数 | 效果（extraX > 0 时） |
| --- | --- | --- |
| `xMin` | `0` | 内容靠左，空白在右边 |
| `xMid` | `0.5` | 内容水平居中 |
| `xMax` | `1` | 内容靠右，空白在左边 |

| y 方向 | y系数 | 效果（extraY < 0 时） |
| --- | --- | --- |
| `YMin` | `0` | 贴上边，裁掉下方 |
| `YMid` | `0.5` | 垂直居中，上下各裁一半 |
| `YMax` | `1` | 贴下边，裁掉上方 |

**第五步：用户坐标 → 视口像素**（与上一节相同）

```
vx = (ux - minX) × scale + offsetX
vy = (uy - minY) × scale + offsetY
```

`none` 时公式变为 `vx = (ux - minX) × sx`，`vy = (uy - minY) × sy`，不使用统一的 scale。

> 记忆口诀：
> * **meetOrSlice 管 scale**：meet 取小（全露出），slice 取大（铺满），none 不统一。
> * align 管 offset：把 extra = viewport - mapped 按 0 / 0.5 / 1 分给各边。
> * meet 产生正 extra（留白）
> * slice 产生负 extra（溢出）。
> * 最终公式不变：vx = (ux - minX) × scale + offsetX（none 时 x/y 用各自的 scale）。

### 4.4 代入示例：viewport 300×200，viewBox 0 0 100 100

沿用第 3 节的博客示例，先算候选比：

```
sx = 300 / 100 = 3
sy = 200 / 100 = 2
```

**meet 时**（`scale = min(3, 2) = 2`）：

```
mappedW = 200，mappedH = 200
extraX = 300 - 200 = 100（左右留白）
extraY = 200 - 200 = 0（高度刚好贴满）
```

高度已贴满，y 方向的 align 没有实际效果，只有 x 方向的对齐有意义：

| align | offsetX | offsetY | 视觉效果 |
| --- | --- | --- | --- |
| `xMinYMid` | `100 × 0 = 0` | `0` | 内容贴左，右侧 100px 空白 |
| `xMidYMid`（默认） | `100 × 0.5 = 50` | `0` | 水平居中，左右各 50px |
| `xMaxYMid` | `100 × 1 = 100` | `0` | 内容贴右，左侧 100px 空白 |

圆心 `(150, 100)` 在 meet 下的视口坐标（`vx = 150 × 2 + offsetX`）：

| align | 圆心 → 视口像素 |
| --- | --- |
| `xMinYMid` | `(300, 200)` |
| `xMidYMid` | `(350, 200)` |
| `xMaxYMid` | `(400, 200)` |

**scale 不变，只有 offsetX 在变**——同一元素因对齐不同，在屏幕上会整体平移。

下面三个内联 SVG 用较小的视口（150×100）演示 meet 时 x 对齐的差异（粉色区域为 viewBox 映射结果，灰色边框为视口）：

<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin:1.5rem 0;">
<svg width="150" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMinYMid meet" style="border:1px solid #9ca3af;background:#f9fafb;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FF8EFF" stroke="#FF5151" stroke-width="2"/>
  <text x="50" y="55" font-size="10" text-anchor="middle" fill="#374151">xMinYMid</text>
</svg>
<svg width="150" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="border:1px solid #9ca3af;background:#f9fafb;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FF8EFF" stroke="#FF5151" stroke-width="2"/>
  <text x="50" y="55" font-size="10" text-anchor="middle" fill="#374151">xMidYMid</text>
</svg>
<svg width="150" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMid meet" style="border:1px solid #9ca3af;background:#f9fafb;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FF8EFF" stroke="#FF5151" stroke-width="2"/>
  <text x="50" y="55" font-size="10" text-anchor="middle" fill="#374151">xMaxYMid</text>
</svg>
</div>

**slice 时**（`scale = max(3, 2) = 3`）：

```
mappedW = 300，mappedH = 300
extraX = 300 - 300 = 0（宽度刚好贴满）
extraY = 200 - 300 = -100（高度溢出 100px，需要裁切）
```

宽度已贴满，x 方向的 align 没有实际效果，只有 y 方向的对齐有意义：

| align | offsetX | offsetY | 视觉效果 |
| --- | --- | --- | --- |
| `xMidYMin` | `0` | `(-100) × 0 = 0` | 贴上边，裁掉下方 |
| `xMidYMid` | `0` | `(-100) × 0.5 = -50` | 垂直居中，上下各裁 50px |
| `xMidYMax` | `0` | `(-100) × 1 = -100` | 贴下边，裁掉上方 |

slice 时 offset 常为**负数**——把放大后的 viewBox「往上推」，让视口只看到其中一块。

<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin:1.5rem 0;">
<svg width="150" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice" style="border:1px solid #9ca3af;background:#f9fafb;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#BE77FF" stroke="#7c3aed" stroke-width="2"/>
  <text x="50" y="55" font-size="10" text-anchor="middle" fill="#fff">xMidYMin</text>
</svg>
<svg width="150" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="border:1px solid #9ca3af;background:#f9fafb;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#BE77FF" stroke="#7c3aed" stroke-width="2"/>
  <text x="50" y="30" font-size="10" text-anchor="middle" fill="#fff">xMidYMid</text>
  <text x="50" y="80" font-size="10" text-anchor="middle" fill="#fff">slice</text>
</svg>
<svg width="150" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" style="border:1px solid #9ca3af;background:#f9fafb;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#BE77FF" stroke="#7c3aed" stroke-width="2"/>
  <text x="50" y="55" font-size="10" text-anchor="middle" fill="#fff">xMidYMax</text>
</svg>
</div>

**汇总：圆心 (150, 100) 在不同 preserveAspectRatio 下的视口坐标**

| preserveAspectRatio | scale | offsetX | offsetY | 圆心 → 视口像素 |
| --- | --- | --- | --- | --- |
| `xMinYMid meet` | 2 | 0 | 0 | (300, 200) |
| `xMidYMid meet` | 2 | 50 | 0 | (350, 200) |
| `xMaxYMid meet` | 2 | 100 | 0 | (400, 200) |
| `xMidYMin slice` | 3 | 0 | 0 | (450, 300) |
| `xMidYMid slice` | 3 | 0 | -50 | (450, 250) |
| `xMidYMax slice` | 3 | 0 | -100 | (450, 200) |
| `none` | sx=3, sy=2 | 0 | 0 | (450, 200) |

### 4.5 实战代码

```xml
<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  width="300"
  height="200"
  viewBox="0 0 100 100"
  preserveAspectRatio="xMinYMid slice"
>
  <rect width="300" height="200" stroke="#FF5151" stroke-width="4" fill="#FF8EFF" />
  <circle cx="150" cy="100" r="80" fill="#BE77FF" />
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="white">你好</text>
</svg>
```

> 实战经验：做**响应式图标**时，通常设 `preserveAspectRatio="xMidYMid meet"` 保证不变形；做**全屏背景 SVG** 时则用 `slice` 保证铺满。需要"刚好切掉某一边"时，用 `xMinYMin` 这类对齐值精确控制裁切位置。

---

## 5. 两个实战小例子

### 5.1 画一个半圆

把 `viewBox` 的上边界移到 y 轴负半轴，只显示圆的下半部分，配合 `slice` 裁掉上方空白：

<svg width="100" height="100" viewBox="0 -50 100 100" preserveAspectRatio="xMinYMin slice" style="outline: 2px solid red">
  <circle cx="0" cy="0" r="50" fill="green" />
</svg>

```xml
<svg
  width="100"
  height="100"
  viewBox="0 -50 100 100"
  preserveAspectRatio="xMinYMin slice"
  style="outline: 2px solid red"
>
  <circle cx="0" cy="0" r="50" fill="green" />
</svg>
```

### 5.2 用 preserveAspectRatio 移动圆的位置

当 `viewBox` 的宽是视口的两倍（`viewBox="0 0 200 200"`，视口 `100 × 200`），默认 `xMidYMid meet` 会让圆**居中**：

```xml
<svg width="100" height="200" viewBox="0 0 200 200" style="outline: 1px solid red">
  <circle cx="100" cy="100" r="100" fill="green" stroke="none"></circle>
</svg>
```

把对齐改成 `xMinYMin meet`（左上对齐），同样的图形就会**贴到视口左上角**：

```xml
<svg
  width="100"
  height="200"
  viewBox="0 0 200 200"
  preserveAspectRatio="xMinYMin meet"
  style="outline: 1px solid red"
>
  <circle cx="100" cy="100" r="100" fill="green" stroke="none"></circle>
</svg>
```

---

## 6. 坐标变换 transform：在坐标系上"叠加操作"

`viewport` 和 `viewBox` 决定的是"坐标系到画布的映射"，而 **`transform` 决定的是"在用户坐标系之上，再叠加一层怎样的变换"**。它让你无需修改每个图形自身的坐标，就能整体平移、缩放、旋转、倾斜。

所有图形元素（`<rect>`、`<circle>`、`<g>`、`<path>` …）都支持 `transform` 属性。

### 6.1 translate：平移

```
transform="translate(tx, ty)"
```

把坐标系沿 x 轴平移 `tx`、沿 y 轴平移 `ty`。只写 `translate(tx)` 时，`ty` 默认为 `0`。

### 6.2 scale：缩放

```
transform="scale(sx, sy)"
```

在 x、y 方向分别放大 `sx`、`sy` 倍；只写 `scale(s)` 时 `sy = sx`。

- **缩放是绕坐标系原点 `(0,0)` 进行的**，因此 `sx > 1` 会把图形"推离原点放大"，而不是以自身中心放大。
- **负值会沿对应轴翻转（镜像）**：`scale(1, -1)` 让图形上下颠倒，`scale(-1, 1)` 左右镜像。

### 6.3 rotate：旋转

```
transform="rotate(angle)"            <!-- 绕原点顺时针旋转 angle 度 -->
transform="rotate(angle, cx, cy)"   <!-- 绕点 (cx, cy) 旋转 -->
```

- SVG 中旋转角度的单位是**度（degree）**，不是弧度。
- 因为 Y 轴向下，`rotate(90)` 在屏幕上看起来是**顺时针**转。

### 6.4 skewX / skewY：倾斜

```
transform="skewX(angle)"   <!-- 沿 x 轴倾斜，竖线变斜 -->
transform="skewY(angle)"   <!-- 沿 y 轴倾斜，横线变斜 -->
```

### 6.5 matrix：最通用的矩阵写法

```
transform="matrix(a, b, c, d, e, f)"
```

它对应如下 2D 变换矩阵（点 `(x, y)` 被映射为 `(a·x + c·y + e, b·x + d·y + f)`）：

```
| a  c  e |
| b  d  f |
| 0  0  1 |
```

- `a`、`d` 控制缩放；
- `b`、`c` 控制倾斜（配合时实现旋转）；
- `e`、`f` 控制平移。

前面所有变换都能用 `matrix` 表达，例如：

| 变换 | 等价 matrix |
| --- | --- |
| `translate(tx, ty)` | `matrix(1, 0, 0, 1, tx, ty)` |
| `scale(sx, sy)` | `matrix(sx, 0, 0, sy, 0, 0)` |
| `rotate(θ)` | `matrix(cosθ, sinθ, −sinθ, cosθ, 0, 0)` |
| `skewX(a)` | `matrix(1, 0, tan(a), 1, 0, 0)` |
| `skewY(a)` | `matrix(1, tan(a), 0, 1, 0, 0)` |

### 6.6 多个变换的组合与顺序（最容易踩坑）

可以写一串变换：`transform="translate(50, 50) rotate(45)"`。

**核心规则**：变换从左到右书写，每一个都作用于"前一个变换所建立的新坐标系"——可以理解为层层嵌套的坐标系。因此**顺序不同，结果完全不同**：

- `translate(50,0) rotate(45)`：先把坐标系搬到 `(50,0)`，再在"新家"里绕原点自转 45° → 相当于"先就位，再原地转身"。
- `rotate(45) translate(50,0)`：先在原始坐标系旋转 45°，再沿**旋转后的 x 轴**前进 50 → 相当于"先转身，再朝身前走 50 步"。

下面用内联 SVG 对比这两种顺序（左：先平移后旋转；右：先旋转后平移），可见图形落点明显不同：

<svg width="200" height="120" viewBox="0 0 200 120" style="display:inline-block;margin:1rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="50" width="40" height="30" fill="#BE77FF" transform="translate(60,0) rotate(30)"/>
  <text x="20" y="105" font-size="11" fill="#6b7280">translate→rotate</text>
</svg>
<svg width="200" height="120" viewBox="0 0 200 120" style="display:inline-block;margin:1rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="50" width="40" height="30" fill="#BE77FF" transform="rotate(30) translate(60,0)"/>
  <text x="20" y="105" font-size="11" fill="#6b7280">rotate→translate</text>
</svg>

> 记忆口诀：**"先写的变换，先改变坐标系；后面的变换在改变后的坐标系里继续作用。"** 拿不准时，就在纸上逐步画嵌套坐标系，或在浏览器里实时调。

### 6.7 transform-origin：用 CSS 时的隐坑

当你用 **CSS 的 `transform` 属性**（而非 SVG 属性）时，可以配合 `transform-origin` 指定变换中心。

⚠️ **易错点**：SVG 元素的 `transform-origin` **默认是 `0 0`（坐标系原点）**，而 HTML 元素默认是 `50% 50%`（自身中心）。所以同样的：

```css
.svg-rect { transform: rotate(45deg); }   /* 绕 (0,0) 旋转，可能飞出视野 */
.html-box { transform: rotate(45deg); }   /* 绕自身中心旋转 */
```

如果想让 SVG 元素绕中心转，需要显式声明：

```css
.svg-rect { transform-origin: center; }   /* 或 transform-origin: 50% 50% */
```

### 6.8 一段对照演示

下面四个内联 SVG 分别展示 `translate` / `scale` / `rotate` / `skewX` 对同一个矩形的效果（原始矩形以灰色描边垫底，变换后的紫色矩形叠加其上）：

<svg width="170" height="110" viewBox="0 0 170 110" style="display:inline-block;margin:0.5rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="40" height="30" fill="none" stroke="#9ca3af"/>
  <rect x="20" y="40" width="40" height="30" fill="#BE77FF" transform="translate(40,10)"/>
  <text x="20" y="100" font-size="10" fill="#6b7280">translate</text>
</svg>
<svg width="170" height="110" viewBox="0 0 170 110" style="display:inline-block;margin:0.5rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="40" height="30" fill="none" stroke="#9ca3af"/>
  <rect x="20" y="40" width="40" height="30" fill="#BE77FF" transform="scale(1.6)"/>
  <text x="20" y="100" font-size="10" fill="#6b7280">scale（绕原点）</text>
</svg>
<svg width="170" height="110" viewBox="0 0 170 110" style="display:inline-block;margin:0.5rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="40" height="30" fill="none" stroke="#9ca3af"/>
  <rect x="20" y="40" width="40" height="30" fill="#BE77FF" transform="rotate(35)"/>
  <text x="20" y="100" font-size="10" fill="#6b7280">rotate</text>
</svg>
<svg width="170" height="110" viewBox="0 0 170 110" style="display:inline-block;margin:0.5rem;vertical-align:top;border:1px solid #e5e7eb;background:#fff;" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="40" height="30" fill="none" stroke="#9ca3af"/>
  <rect x="20" y="40" width="40" height="30" fill="#BE77FF" transform="skewX(30)"/>
  <text x="20" y="100" font-size="10" fill="#6b7280">skewX</text>
</svg>

---

## 7. 小结

把前面几块拼起来，SVG 的"画图逻辑"就清晰了：

1. **坐标系**是一切的基础：原点在左上，X 向右、Y 向下，单位为用户单位。
2. **viewport** 决定画布的物理像素尺寸（默认 300×150）。
3. **viewBox** 决定在用户坐标系里截取哪段范围、再缩放铺满视口——它是 SVG 实现"自适应缩放"的核心。
4. **preserveAspectRatio** 控制缩放时是否保比例、以及如何对齐（`meet`/`slice` + 9 种对齐）。
5. **transform** 在用户坐标系之上叠加平移、缩放、旋转、倾斜，本质是矩阵运算；要特别留意**组合顺序**与 SVG 下 `transform-origin` 默认 `0 0` 的坑。

掌握这套坐标系统后，无论是做图标、数据可视化，还是复杂的交互动画，你都能精准预测每一个图形最终落在屏幕的哪个位置。
