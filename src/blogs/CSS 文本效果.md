---
tag: ["文本效果","立体徽章效果"],
date: 2025-02-12
detail: 该实现通过结构化拆解与CSS精密控制打造“100 DAYS CSS CHALLENGE”立体徽章效果
---

这段代码展示了一个 "100 DAYS CSS CHALLENGE" 的静态展示页面，主要使用 CSS 实现视觉效果。

### html代码结构

```html
<div class="frame">
  <div class="center">
    <div class="redhat number-stack">
      <div class="uno">1</div>
      <div class="cero">0</div>
      <div class="cero-dos">0</div>
    </div>
    <div class="cregular">DAYS</div>
    <div class="cbold">CSS CHALLENGE</div>
  </div>
</div>
```

结构说明：

- frame - 外层容器，整个卡片的背景框
- center - 居中容器，用于内部元素居中
- number-stack - 数字堆叠容器，包含三个数字元素
- uno、cero、cero-dos - 分别显示 "1"、"0"、"0"，通过重叠形成 "100" 的视觉效果
- cregular - 显示 "DAYS" 文字
- cbold - 显示 "CSS CHALLENGE" 文字

## CSS 样式

### 1. 外框样式

这部分代码主要解决“画布”在哪里的问题。

- **外层框架 `.frame`**：

  ```css
  .frame {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;
    margin-top: -200px; /* 高度的一半，用于向上偏移 */
    margin-left: -200px; /* 宽度的一半，用于向左偏移 */
    /* ...背景样式... */
  }
  ```

  **实现原理**：这是一个经典的 CSS 居中技巧（在 Flex/Grid 普及之前非常流行）。
  1.  `top: 50%` 和 `left: 50%` 将元素的左上角顶点移动到屏幕中心。
  2.  但此时元素是偏的，所以通过负的 `margin` 值（元素宽高的一半）将其拉回正中心。

- **内容居中 `.center`**：
  ```css
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 现代居中方式 */
    display: flex;
    flex-direction: column; /* 垂直排列内部元素 */
    align-items: center; /* 水平居中 */
  }
  ```
  **实现原理**：这里使用了 `transform` 进行位移，配合 Flexbox 布局，确保内部的数字和文字不管是变大变小，都能始终保持在卡片正中央。

---

### 2. 核心实现：数字“100”的层叠与遮挡

这是最关键的部分。为什么要把“100”拆成三个 `div`？是为了控制层叠关系。

#### A. 整体容器 `.number-stack`

```css
.number-stack {
  display: flex;
  align-items: center;
  height: 90px;
  margin-bottom: 14px;
}
```

**实现原理**：使用 Flex 布局让三个数字（1, 0, 0）横向排列。注意 `height: 90px`，这限制了容器高度，但数字字号有 `140px`，这意味着数字会溢出容器，形成一种紧凑的视觉压力。

#### B. 三个数字的层叠顺序

代码通过 `z-index` 和负边距 `margin-left` 制造了“覆盖”效果：

1.  **第一个 0 (`.cero-dos`)**：`z-index: 1`，位于最底层。
2.  **第二个 0 (`.cero`)**：
    ```css
    .cero {
      z-index: 2;
      margin-left: -15px; /* 关键点：负边距 */
    }
    ```
    **实现原理**：`z-index: 2` 让它盖在第一个 0 上面。`margin-left: -15px` 强行把它向左拉，让它和前一个元素重叠，产生紧凑感。
3.  **数字 1 (`.uno`)**：
    ```css
    .uno {
      z-index: 3; /* 位于最顶层 */
    }
    ```
    **实现原理**：`z-index: 3` 确保它盖在所有数字之上。

#### C. 遮挡技巧：`.uno::before` (核心难点)

如果只做上面的步骤，数字“1”很细，下面的“0”很宽，当它们重叠时，“0”的圆弧部分会从“1”的两侧露出来，视觉上会很乱。代码用一个**伪元素**解决了这个问题：

```css
.uno::before {
  content: '';
  position: absolute;
  width: 23px; /* 一个白色矩形的宽度 */
  height: 97px; /* 一个白色矩形的高度 */
  background: #fff; /* 背景色与文字颜色一致 */
  left: 22px; /* 精确定位在数字1的下方 */
  top: 33px;
  z-index: 1; /* 位于数字1的文字下方，但位于后面0的上方 */
  /* ...圆角和阴影... */
}
```

**具体实现逻辑图解：**

- **层级关系**：
  - 最顶层：`.uno` 的文字（数字 "1"）
  - 中间层：`.uno::before`（白色矩形块）
  - 底层：`.cero` 和 `.cero-dos`（数字 "0"）
- **效果**：这个白色的矩形块就像一张白纸，盖住了后面伸过来的“0”的部分。因为背景是白色的（或透明继承背景），所以看起来就像是“1”完美地压在了“0”上面，没有穿帮。

---

### 3. 文字排版细节

为了增强设计感，代码在字体细节上做了精细控制：

- **字体选择**：
  - 数字使用 `Red Hat Display`（一种现代无衬线字体），字重 `900`（极粗），视觉冲击力强。
  - 下面的文字使用 `Courier Prime`（等宽字体），这种字体像老式打字机或代码编辑器，暗示“CSS Challenge”的编程主题。

- **视觉微调**：
  ```css
  .cregular {
    line-height: 60px; /* 行高控制 */
    /* ... */
  }
  ```
  通过手动调整 `line-height` 和 `font-size`，让 "DAYS" 和 "CSS CHALLENGE" 紧凑地排列在数字下方，留出合适的呼吸空间。

### 总结

这段代码不仅仅是在写样式，而是在**“绘图”**。它利用：

1.  **HTML 结构拆分**：将 "100" 拆解为独立元素。
2.  **CSS 负边距**：打破常规布局流，制造元素重叠。
3.  **CSS 伪元素**：充当“遮挡层”，修正视觉穿帮。

最终实现了那个独特的、具有层叠立体感的徽章图标。
