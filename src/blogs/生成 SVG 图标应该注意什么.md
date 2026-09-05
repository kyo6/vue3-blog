---
tag: ['SVG', '图标设计', '前端', '设计规范', '图标字体']
date: 2026-08-22
detail: 生成 SVG 图标远不止"画出来"那么简单。本文结合 Cursor 一年手绘 600+ 图标的设计实践，从尺寸与线宽的双规格体系、轮廓与填充的风格系统、直线加圆角的构建方法、光学微调，到一致性的基础设施与图标字体的交付替换，系统梳理生成 SVG 图标时最容易被忽略的讲究，每个原则都配有可直接运行的代码示例。
---

SVG 图标是前端最常用的视觉资产之一，但"生成一个 SVG 图标"和"生成一套好用的 SVG 图标"完全是两回事。单个图标难在好看，一套图标难在**统一**——几百个图标要像一个人画的，还要在 12px 到 32px 的任意尺寸下保持可读和精致。

今年 Cursor 上线了全新的图标集：**600+ 个图标、两种尺寸、两种风格，全部手工绘制，耗时一年**。设计者 Marek Minor 在文章中分享了完整过程，其中许多原则可以直接迁移到我们日常生成 SVG 图标的工作流里。本文把这些讲究整理成六个维度，每个都配了代码示例。

下面这张截图是 Cursor 真实界面的样子：左侧导航、右侧任务列表，每个菜单项前都配着统一线宽与圆角风格的图标。看起来"理所当然"——但每一处线宽、间距、视觉重量都经过了细致校准。

![Cursor 新图标集在真实界面中的应用：左侧导航（New Agent / Search / Automations / Customize）和右侧任务列表（This Week / This Month），每个菜单项前都配有统一线宽与圆角的图标](/blog/svg-icon-tips/03-real-application.png)

---

## 1. 尺寸与线宽：先定"规格"，别让图标裸奔

这是整套体系里最核心的观念，也是最容易被忽视的。

### 1.1 缩放陷阱：线宽是"绝对像素"，不是"相对比例"

SVG 是矢量图形，缩放时**所有东西等比变化，包括线宽**。这带来一个问题：

- 在 16px 图标里，1.25px 的线宽看起来**刚刚好**（和旁边的文字粗细匹配）；
- 同一个图标放大到 32px 时，线宽自动变成 2.5px——比这个尺寸下应该画的任何线都粗；
- 缩小到 12px，线又显细，细节还会糊成一片。

所以"缩放是免费的"是个错觉：**一个 16px 图标只能舒适地工作在 12~20px 区间**，超出就失衡。下面用同一个文件夹图标演示：左边是 16px 规格正常显示，中间是它直接拉伸到 64px（线宽跟着翻倍变粗），右边是真正的 24px 规格放大到同样大小（线宽更细、细节更多）。

<svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="#6366F1" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;padding:4px;">
  <path d="M2.5 5.5v5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5A1.5 1.5 0 0 0 12 5H8L6.5 3.5H4A1.5 1.5 0 0 0 2.5 5z"/>
</svg>
<svg width="64" height="64" viewBox="0 0 16 16" fill="none" stroke="#E11D48" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;padding:4px;">
  <path d="M2.5 5.5v5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5A1.5 1.5 0 0 0 12 5H8L6.5 3.5H4A1.5 1.5 0 0 0 2.5 5z"/>
</svg>
<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;padding:4px;">
  <path d="M3.5 8v8a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5.5a2 2 0 0 0-2 2z"/>
  <path d="M3.5 12.5h17"/>
</svg>

```xml
<!-- 16px 规格：线宽 1.25px，细节简化，可缩到 12px 仍可读 -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
     stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2.5 5.5v5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5A1.5 1.5 0 0 0 12 5H8L6.5 3.5H4A1.5 1.5 0 0 0 2.5 5z"/>
</svg>

<!-- 24px 规格：线宽 1.5px，空间允许时加入更多细节（如内部横线） -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3.5 8v8a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5.5a2 2 0 0 0-2 2z"/>
  <path d="M3.5 12.5h17"/>
</svg>
```

这张图给出了真实图标在不同线宽下的对比——1px 时线显得单薄、撑不住旁边的文字；1.5px 又偏重、和正文粗细不匹配；1.25px 恰好和正文行高融为一体：

![同一组图标在 1px、1.25px、1.5px 三种线宽下的对比：1px 显得单薄撑不住文字，1.5px 又偏重，1.25px 恰好与正文匹配](/blog/svg-icon-tips/01-linewidth-comparison.png)

### 1.2 为什么是"16px + 24px"两档，而不是一个万能规格

因为人眼对线宽的感知是**相对的**：图标越小，越需要相对更粗的线来保持清晰；图标越大，越能容纳更细的线和更多细节。所以 Cursor 的做法是两套独立校准的规格：

| 规格 | 线宽 | 相对比例 | 适用区间 | 设计侧重 |
| --- | --- | --- | --- | --- |
| **16px** | 1.25px | 1.25/16 ≈ 7.8% | 12~20px | 可读性优先，简化细节 |
| **24px** | 1.5px | 1.5/24 ≈ 6.25% | 22px 以上 | 允许更多细节 |

注意一个关键点：**线宽没有按尺寸等比放大**（等比会是 1.875px），反而用了更细的 1.5px——大尺寸用更细的相对线宽，这正是"光学校准"。

这个观念在字体设计里早已存在，叫做**光学尺寸（optical size）**：一套字体有 Text 版（为小字号优化：笔画粗、字腔大、结构简化）和 Display 版（为大字号优化：笔画细、细节丰富），而不是把同一套字体直接拉大缩小。**16px/24px 双规格，就是图标界的 Text/Display**。

### 1.3 反常规细节：1.25px 故意不对齐像素网格

常规建议是小图标对齐像素网格（0.5px 整数倍），Cursor 却故意用 1.25px，理由是：

- 图标会在 12/14/16/20px 等多种尺寸下渲染，**不存在一个能同时对齐所有尺寸的网格**；
- 现代高分辨率屏幕上，1.25px 的亚像素线宽本身足够清晰；
- 对齐像素网格意味着要为每个绝对尺寸单独设计，等于从"符号"退化成"位图"。

> 一句话：**"16px/1.25px + 24px/1.5px"不是两组随意数字，而是"每个尺寸都用独立校准的线宽"这一原则的具体实例**，本质是在对抗"矢量缩放会同步放大线宽"的物理特性。

---

## 2. 风格系统：轮廓、填充与光学形状

### 2.1 轮廓（Outline）与填充（Filled）

一套图标通常有两种风格：**轮廓**由线条构成；**填充**由实心形状构成，内部细节直接从实心中挖出（相当于一个带镂空的剪影）。不是每个图标都需要填充版，只有产品需要的才做。

<svg width="64" height="64" viewBox="0 0 48 48" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;">
  <path d="M24 40S6 28 6 16.5A8.5 8.5 0 0 1 24 12a8.5 8.5 0 0 1 18 4.5C42 28 24 40 24 40z" fill="none" stroke="#E11D48" stroke-width="2" stroke-linejoin="round"/>
</svg>
<svg width="64" height="64" viewBox="0 0 48 48" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;">
  <path d="M24 40S6 28 6 16.5A8.5 8.5 0 0 1 24 12a8.5 8.5 0 0 1 18 4.5C42 28 24 40 24 40z" fill="#E11D48" fill-rule="evenodd"/>
  <circle cx="24" cy="22" r="4" fill="#f9fafb"/>
</svg>

```xml
<!-- 轮廓风格：仅描边 -->
<svg viewBox="0 0 48 48" fill="none" stroke="#E11D48" stroke-width="2" stroke-linejoin="round">
  <path d="M24 40S6 28 6 16.5A8.5 8.5 0 0 1 24 12a8.5 8.5 0 0 1 18 4.5C42 28 24 40 24 40z"/>
</svg>

<!-- 填充风格：内部细节从实心中挖出（fill-rule="evenodd" 实现镂空） -->
<svg viewBox="0 0 48 48" fill="#E11D48" fill-rule="evenodd">
  <path d="M24 40S6 28 6 16.5A8.5 8.5 0 0 1 24 12a8.5 8.5 0 0 1 18 4.5C42 28 24 40 24 40z"/>
  <circle cx="24" cy="22" r="4"/>
</svg>
```

### 2.2 光学形状：不是所有图标都"填满方框"

在风格之下，还有一套**光学形状**系统：方形、圆形、横向、纵向。每种形状都经过调整，让基于不同形状绘制的图标**看起来大小一致**——典型例子：圆形必须比方形画得稍大，视觉上才一样大。对角线形状最难处理，通常归入最接近的形状再靠眼睛微调。

下面这张来自 Cursor 实际规范：方形 13×13、圆形 14×14、横向 14×11、纵向 11×14——圆形比方形大 1 单位，竖向矩形比横向窄。同样规律在 24px 网格下放大到 19×19、21×21、21×17、17×21。**这套尺寸调整是图标集视觉等大的关键**。

![光学形状系统：方形 13×13、圆形 14×14、横向 14×11、纵向 11×14，两行分别是 16px 网格和 24px 网格上的尺寸调整，圆形画得稍大才看起来与方形等大](/blog/svg-icon-tips/02-optical-shapes.png)

### 2.3 方向感全集一致

图标的方向性是"系统语言"的一部分。例如 Cursor 的鼠标指针方向是左下→右上，所以所有可双向的图标（对角箭头、飞行物）都遵循这个方向；而斜线统一左上→右下，因为斜线是否定方向的，应该和方向切割。**定下一个方向规则，整个图标集遵守**，视觉才会统一。

---

## 3. 构建方法：直线 + 圆角，工程化造型

Cursor 的图标更像**技术制图**而不是有机图形：先画水平、垂直或 45° 的线段，在概念需要时允许其他角度，然后不断圆角，直到形状跟上想法。云不是用圆形拼的，而是从直线段开始圆角化连接处；自由曲线在这套图标里**极为罕见**。

以一朵"云"为例（直线段 + 圆角构建，而非多个 `<circle>` 拼接）：

```xml
<!-- 直线段 + 圆角构成云朵：先画折线路径，再用 stroke-linejoin 圆角化连接处 -->
<svg width="64" height="40" viewBox="0 0 64 40" fill="none" stroke="#0EA5E9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:1rem auto;">
  <path d="M12 32h34a10 10 0 0 0 0-20h-2a12 12 0 0 0-23-3A8 8 0 0 0 12 32z"/>
</svg>
```

```xml
<svg viewBox="0 0 64 40" fill="none" stroke="#0EA5E9" stroke-width="3"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- 直线段 + 大圆角：圆角让直线连接处变柔和 -->
  <path d="M12 32h34a10 10 0 0 0 0-20h-2a12 12 0 0 0-23-3A8 8 0 0 0 12 32z"/>
</svg>
```

其他几条构建原则：

- **封闭优先**：只要图标有"开放"的可能，就封闭形状——技术感、极简，且保证极小尺寸下的可读性。斜线穿过图标时，就是一个干脆的切割，不画阴影伪装。
- **保持物体固有比例**：铅笔就该又高又窄、纸币就该宽——把每个东西都塞满方框是"玩具感"的来源。**高的东西保持高**。
- **重复元素完全一致**：文件夹、箭头、徽章等在任意图标中出现都画得一模一样（Cursor 跟踪了 155+ 个重复元素的一致性）。

---

## 4. 光学微调：决定"高级感"的细节

这些是 logo 设计师才做、绝大多数图标集跳过的工作，但正是它们让图标"感觉刚刚好"。

### 4.1 光学断点：交点切缺口

两条或多条线相交时，交汇处因为形状叠加、角落光学上堵塞，看起来比实际更暗。解决办法：在交点处**切一个小缺口**（类似正文宋体打开"A"的紧密角落）。对比下面两个十字：

<svg width="80" height="80" viewBox="0 0 80 80" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;">
  <path d="M10 40h60M40 10v60" stroke="#A32D2D" stroke-width="8" stroke-linecap="round"/>
  <text x="40" y="76" font-size="11" fill="#6b7280" text-anchor="middle">无缺口：交点发堵</text>
</svg>
<svg width="80" height="80" viewBox="0 0 80 80" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;">
  <path d="M10 36h26M44 36h26M36 10v26M36 44v26" stroke="#059669" stroke-width="8" stroke-linecap="round"/>
  <text x="40" y="76" font-size="11" fill="#6b7280" text-anchor="middle">切缺口：干净利落</text>
</svg>

```xml
<!-- 无缺口：十字在中心完全相交，视觉上发暗发堵 -->
<path d="M10 40h60M40 10v60" stroke="#A32D2D" stroke-width="8" stroke-linecap="round"/>

<!-- 有缺口：四条线在中心各留 4 单位缺口，交点干净 -->
<path d="M10 36h26M44 36h26M36 10v26M36 44v26" stroke="#059669" stroke-width="8" stroke-linecap="round"/>
```

### 4.2 线条减细与点的统一

- **线条减细**：在太多线条汇聚的地方，部分线条减细，避免某个点视觉重量过重。
- **点的统一**：行尾的点、"更多"的点、独立浮动的点需要略微不同的大小才能看起来合适——图标集要为每种"点"单独定义规格。

### 4.3 留意间距：不小于 3 个网格单位

重叠形状之间的间隙（比如文件夹上叠加一个加号徽章）**永远不小于 3 个网格单位**（在 16px 网格上）。2.5 或更小时形状开始接触、合并成一个模糊的形状；3 以上给小图标留出呼吸空间。

<svg width="88" height="64" viewBox="0 0 88 64" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;">
  <rect x="14" y="10" width="36" height="36" rx="6" fill="none" stroke="#0F766E" stroke-width="3"/>
  <path d="M32 20v16M24 28h16" stroke="#0F766E" stroke-width="3" stroke-linecap="round"/>
  <text x="32" y="60" font-size="11" fill="#6b7280" text-anchor="middle">间隙 3 单位</text>
</svg>
<svg width="88" height="64" viewBox="0 0 88 64" style="display:inline-block;margin:1rem;vertical-align:middle;border:1px solid #e5e7eb;background:#f9fafb;">
  <rect x="52" y="10" width="36" height="36" rx="6" fill="none" stroke="#A32D2D" stroke-width="3"/>
  <path d="M70 20v16M62 28h16" stroke="#A32D2D" stroke-width="3" stroke-linecap="round"/>
  <text x="70" y="60" font-size="11" fill="#6b7280" text-anchor="middle">间隙过小：粘连</text>
</svg>

```xml
<!-- 正确：加号与容器之间留足 3 个单位间距 -->
<rect x="14" y="10" width="36" height="36" rx="6" fill="none" stroke="#0F766E" stroke-width="3"/>
<path d="M32 20v16M24 28h16" stroke="#0F766E" stroke-width="3" stroke-linecap="round"/>
```

### 4.4 0.25px 级的偏执

设计师在对比的版本之间只差 0.25px——"在 16px 下这个差异不应该重要，但版本就是感觉不一样"。不断微调最小细节直到"刚刚好"。**这是 AI 生成图标时最需要人工复审的环节**：AI 能画出 90 分的图标，剩下的 10 分靠人眼校准。

---

## 5. 一致性：靠基础设施，不靠记忆力

保持几百个图标一致，靠的不是记忆而是**基础设施**。Cursor 维护三个核心文件：

1. **探索文件（Explorations）**：每个概念先做几十上百次尝试。
2. **总览文件（Overviews）**：整套图标的查找表，审计这些问题的答案：
   - 哪些图标遵循哪种光学形状？
   - 小形状嵌入大形状时，间隙各处是否一致？
   - 小的加号/减号/叉号徽章是否每次大小位置相同？
   - 细节缩减为单线条时，缩减方式是否一致？
   - 填充图标有几种处理方式，每种内部是否一致？
3. **图标文件（Icons）**：最终图标作为组件，带"填充/尺寸"两个属性。

> 对应到工程实践：在生成图标前，先写好一份**图标规范文档**（网格、线宽、圆角半径、间隙规则、重复元素的画法），让每次生成都遵循它，而不是每次自由发挥。规范文档就是你的"总览文件"。

---

## 6. 交付与替换：从 SVG 到图标字体

图标生成完之后还有最后一公里：**交付**。

### 6.1 图标字体：Unicode 编码点映射

图标以**字体形式**交付，每个字形映射一个 Unicode 编码点。**替换规则：保持编码点不变**——`arrow-up` 还在它一直在的位置，加载新字体就能自动替换全部旧引用，不需要改任何代码。

```css
/* 新字体保持与旧字体相同的编码点，即可实现无缝替换 */
@font-face {
  font-family: 'MyIcons16';
  src: url('icons-16.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

.icon-arrow-up::before {
  font-family: 'MyIcons16';
  content: '\E001';   /* 编码点与旧字体一致，加载新字体即自动替换 */
}
```

### 6.2 路径展平：字体编译器的硬要求

字体编译器**无法处理布尔运算和未描边的线条**，所以发布前必须把每个图标**展平为单一路径**。如果图标由多个形状叠成（比如环形 = 外圆 - 内圆），用 `fill-rule="evenodd"` 合并成一个 path：

```xml
<!-- 展平前：两个形状（外圆 + 内圆），字体编译器无法处理 -->
<svg viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="#6366F1"/>
  <circle cx="12" cy="12" r="6" fill="white"/>
</svg>

<!-- 展平后：单一路径 + evenodd 规则，编译器可识别 -->
<svg viewBox="0 0 24 24">
  <path fill-rule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/>
</svg>
```

### 6.3 自动化流水线

Cursor 最后用一条 `ship it` 命令串起全部发布流程：注册 SVG 并分配编码点 → 编译四种字体（两个尺寸 × 两个风格）→ 合并样式表 → 重写字体元数据 → 重新生成配套网站的数据 → 构建网站 → 提交推送。手动做这些需要一个下午而且总会漏掉某一步——**把可重复的发布步骤脚本化**。

---

## 7. 给 AI 生成 SVG 的落地建议

把这六个维度落到 AI 生成工作流里，就是一张自查清单：

| 阶段 | 建议 |
| --- | --- |
| 生成前 | 先定规格：viewBox、网格、线宽、圆角、是否需要 16px/24px 双规格 |
| 生成中 | 用统一 prompt 模板约束：直线+圆角优先、封闭优先、保持固有比例、方向一致 |
| 生成后 | 检查 4 件事：交点是否发堵（切缺口）、间隙是否 ≥3 单位、极小尺寸可读性、重复元素是否一致 |
| 交付时 | 如需图标字体：展平路径、保持编码点映射、脚本化发布流程 |

一个可复用的 prompt 模板示例：

```text
请生成一个 16px 规格的 SVG 图标，遵循以下规范：
1. viewBox="0 0 16 16"，尺寸 16×16，网格 16 单位
2. 线宽 1.25px（stroke-width="1.25"），圆角线帽与圆角连接
3. 用直线段 + 圆角构建，避免自由曲线
4. 封闭形状优先，保持物体固有比例
5. 使用 currentColor 作为描边颜色，方便主题切换
6. 无多余节点，路径尽量精简
```

---

## 小结

生成 SVG 图标的难点不在"画得出来"，而在三个层面：

1. **多尺寸可读**——用 16px/24px 双规格、独立校准线宽，而不是让一个图标裸奔缩放；
2. **整套统一**——光学形状、方向感、重复元素、间隙规则，靠规范文档而非记忆力；
3. **可无缝替换**——图标字体 + 编码点映射 + 路径展平 + 自动化发布。

正如 Cursor 设计师所说，那些 0.25px 的差异"不该重要，但就是感觉不一样"。**AI 能把图标画到 90 分，剩下的 10 分，需要规范和人工校准来补齐。**
