---
tag: ["CSS", "文字样式", "font-face", "text-shadow", "writing-mode", "background-clip"],
date: 2026-08-01
detail: 从自定义字体、字重、文字投影、竖排排版到渐变文字和图片蒙版文字，6个让文字变好看的CSS实用技巧
---

文字不只是黑白两色。CSS 提供了丰富的文字样式能力，从加载任意字体到给文字加投影、做竖排国风排版、甚至用图片填充文字，都能轻松实现。这篇笔记整理了 6 个实用的 CSS 文字样式技巧，每个都附带代码和效果说明。

<!-- demo-area start -->
<style>
.demo-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 32px 28px;
  margin: 20px 0 32px 0;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.demo-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

/* Section 1: @font-face demo */
.demo-font-default {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 28px;
  margin-bottom: 12px;
  color: #aaa;
}
.demo-font-web {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 28px;
  color: #e0c097;
}

/* Section 2: font-weight demo */
.demo-weight-row {
  display: flex;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.demo-weight-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.demo-weight-label {
  font-size: 13px;
  color: #888;
  font-family: 'SF Mono', 'Fira Code', monospace;
  min-width: 70px;
}
.demo-weight-text {
  font-size: 26px;
  color: #e8e8e8;
}

/* Section 3: text-shadow demo */
.demo-shadow-box {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.demo-glow {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px #ff4444, 0 0 20px #ff4444, 0 0 40px #ff2222, 3px 3px 6px rgba(255,0,0,0.5);
  text-align: center;
}
.demo-outline {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a2e;
  text-shadow:
    -1px -1px 0 #fff, 1px -1px 0 #fff,
    -1px  1px 0 #fff, 1px  1px 0 #fff,
     0px -1px 0 #fff, 0px  1px 0 #fff,
    -1px  0px 0 #fff, 1px  0px 0 #fff;
  text-align: center;
}

/* Section 4: writing-mode demo */
.demo-vertical-wrap {
  display: flex;
  justify-content: center;
  gap: 40px;
  align-items: flex-start;
}
.demo-vertical-rl {
  writing-mode: vertical-rl;
  font-size: 28px;
  font-weight: 700;
  color: #e8e8e8;
  letter-spacing: 4px;
  line-height: 1.8;
}
.demo-vertical-rl span::after {
  content: '\A';
  white-space: pre;
}
.demo-vertical-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-top: 12px;
  writing-mode: horizontal-tb;
}

/* Section 5: gradient text demo */
.demo-gradient-text {
  font-size: 40px;
  font-weight: 800;
  background-image: linear-gradient(103.3deg, rgb(252, 225, 208) 30%, rgb(255, 173, 214) 55.7%, rgb(162, 186, 245) 81.8%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  letter-spacing: -0.5px;
}

/* Section 6: image mask text demo */
.demo-mask-text {
  font-size: 40px;
  font-weight: 800;
  background-image:
    radial-gradient(circle at 20% 50%, #f093fb 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, #4facfe 0%, transparent 50%),
    radial-gradient(circle at 50% 80%, #43e97b 0%, transparent 50%);
  background-size: cover;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  letter-spacing: -0.5px;
}
</style>
<!-- demo-area end -->

## 1. 自定义字体 @font-face

默认情况下，网页只能使用用户电脑上已安装的字体。通过 `@font-face` 规则，我们可以加载自定义字体文件，让页面用上任意字体。

### 基本用法

```css
@font-face {
  font-family: hensuibian;
  src: url('./font/Sansation_Light.ttf');
}
```

`font-family` 给字体起一个名字（除了数字，随便取），`src` 指向字体文件的路径。定义好之后，就可以像使用系统字体一样引用它：

```css
.css-1 {
  font-weight: normal;
  font-family: hensuibian;
}
```

下面的演示对比了系统默认无衬线字体和使用 Web 字体（Georgia 衬线体）的效果差异：

<div class="demo-card">
  <div class="demo-label">Live Demo — 字体对比</div>
  <div class="demo-font-default">The quick brown fox jumps over the lazy dog</div>
  <div class="demo-font-web">The quick brown fox jumps over the lazy dog</div>
</div>

上方灰色文字是系统默认的无衬线字体，下方暖色文字使用了 Georgia 衬线体。虽然这里用的是系统自带的 Georgia 而非外部字体文件，但 `@font-face` 的用法完全一致——只是把 `src` 换成你自己的字体文件路径即可。

### 注意事项

- 字体文件支持 `.ttf`、`.woff`、`.woff2`、`.otf` 等格式，建议优先使用 `.woff2`，体积更小、加载更快
- 可以声明多个 `src` 做降级：`src: url('font.woff2') format('woff2'), url('font.ttf') format('truetype');`
- 字体文件通常放在项目的 `public/font/` 或 `src/assets/font/` 目录下

## 2. 字重 font-weight

`font-weight` 控制文字的粗细。它支持关键字和数值两种写法：

| 值 | 说明 |
|---|---|
| `normal` | 正常粗细，等同于 400 |
| `bold` | 加粗，等同于 700 |
| `bolder` | 比父元素更粗 |
| `lighter` | 比父元素更细 |
| `100` ~ `900` | 数值越大胆子越粗，100 最细，900 最粗 |

```css
.text-normal  { font-weight: normal; }
.text-bold    { font-weight: bold; }
.text-bolder  { font-weight: bolder; }
.text-lighter { font-weight: lighter; }
.text-800     { font-weight: 800; }
```

<div class="demo-card">
  <div class="demo-label">Live Demo — font-weight 对比</div>
  <div class="demo-weight-row">
    <div class="demo-weight-item">
      <span class="demo-weight-label">normal</span>
      <span class="demo-weight-text" style="font-weight: 400;">little bee.</span>
    </div>
  </div>
  <div class="demo-weight-row">
    <div class="demo-weight-item">
      <span class="demo-weight-label">bold</span>
      <span class="demo-weight-text" style="font-weight: 700;">little bee.</span>
    </div>
  </div>
  <div class="demo-weight-row">
    <div class="demo-weight-item">
      <span class="demo-weight-label">bolder</span>
      <span class="demo-weight-text" style="font-weight: 900;">little bee.</span>
    </div>
  </div>
  <div class="demo-weight-row">
    <div class="demo-weight-item">
      <span class="demo-weight-label">lighter</span>
      <span class="demo-weight-text" style="font-weight: 200;">little bee.</span>
    </div>
  </div>
  <div class="demo-weight-row">
    <div class="demo-weight-item">
      <span class="demo-weight-label">800</span>
      <span class="demo-weight-text" style="font-weight: 800;">little bee.</span>
    </div>
  </div>
</div>

需要注意的是，字重效果依赖于字体本身是否包含对应的字重文件。如果字体只有 Regular 一种字重，那么 `bold` 和 `normal` 看起来可能没有区别。使用 `@font-face` 加载字体时，可以为不同字重分别声明：

```css
@font-face {
  font-family: 'MyFont';
  src: url('./font/MyFont-Light.ttf');
  font-weight: 300;
}
@font-face {
  font-family: 'MyFont';
  src: url('./font/MyFont-Bold.ttf');
  font-weight: 700;
}
```

## 3. 文字投影 text-shadow

`text-shadow` 给文字添加阴影效果，语法为：

```css
text-shadow: h-offset v-offset blur color;
```

四个值分别是：水平偏移、垂直偏移、模糊半径、阴影颜色。

### 效果一：彩色光晕

```css
.glow-text {
  color: #fff;
  text-shadow: 5px 5px 5px red;
}
```

白色文字配上红色阴影，产生一种霓虹灯般的光晕效果。增大模糊半径可以让光晕更柔和。

### 效果二：镂空描边

```css
.outline-text {
  color: #000;
  text-shadow:
    -1px  0px 1px #fff,
     1px  0px 1px #fff,
     0px -1px 1px #fff,
     0px  1px 1px #fff;
}
```

通过在上、下、左、右四个方向各加一个 1px 的白色阴影，黑色文字看起来就像被白色描了一圈边，形成镂空效果。

<div class="demo-card">
  <div class="demo-label">Live Demo — text-shadow 两种效果</div>
  <div class="demo-shadow-box">
    <div>
      <div style="font-size:12px;color:#888;margin-bottom:8px;">彩色光晕</div>
      <div class="demo-glow">Little Bee.</div>
    </div>
    <div>
      <div style="font-size:12px;color:#888;margin-bottom:8px;">镂空描边</div>
      <div class="demo-outline">Little Bee.</div>
    </div>
  </div>
</div>

这个技巧常用于在复杂背景上让文字更清晰可读。光晕效果适合暗色背景的标题设计，镂空描边则适合在图片上方叠加文字。

## 4. 竖排文字 writing-mode

`writing-mode` 改变文字的排列方向，非常适合做国风、日文风格的竖排排版。

### HTML 结构

```html
<div class="css-18">
  <span>床前明月光，</span>
  <span>疑似地上霜。</span>
</div>
```

### CSS 样式

```css
.css-18 {
  writing-mode: vertical-rl;
}
.css-18 > span::after {
  content: '\A';
  white-space: pre;
}
```

`vertical-rl` 让文字从上到下、从右到左排列，这是中文传统竖排的书写方向。`::after` 伪元素插入换行符 `\A`，配合 `white-space: pre` 让两个 `<span>` 各占一列。

<div class="demo-card">
  <div class="demo-label">Live Demo — writing-mode: vertical-rl</div>
  <div class="demo-vertical-wrap">
    <div>
      <div class="demo-vertical-rl">
        <span>床前明月光，</span>
        <span>疑似地上霜。</span>
      </div>
      <div class="demo-vertical-label">vertical-rl（自右到左）</div>
    </div>
  </div>
</div>

### 四种模式对比

| 值 | 排列方向 |
|---|---|
| `vertical-rl` | 垂直，自右到左（传统中文竖排） |
| `vertical-lr` | 垂直，自左到右 |
| `sideways-rl` | 水平，自右到左（文字旋转90度） |
| `sideways-lr` | 水平，自左到右（文字旋转90度） |

`vertical-*` 和 `sideways-*` 的区别在于：前者每个字符保持正立（适合中日韩文字），后者每个字符都旋转 90 度（适合拉丁字母）。

## 5. 渐变文字 background-clip: text

让文字呈现渐变色彩，核心思路是三步：给文字区域设置渐变背景、把文字颜色设为透明、然后把背景裁剪到文字形状。

```css
.gradient-text {
  background-image: linear-gradient(
    103.3deg,
    rgb(252, 225, 208) 30%,
    rgb(255, 173, 214) 55.7%,
    rgb(162, 186, 245) 81.8%
  );
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
```

<div class="demo-card">
  <div class="demo-label">Live Demo — 渐变文字</div>
  <div class="demo-gradient-text">Little Bees In A Gradient.</div>
</div>

逐步拆解：

1. **`background-image`**：为文字区域设置一个线性渐变背景，从暖橙色过渡到粉色再到淡蓝色
2. **`color: transparent`**：将文字本身的颜色设为透明，这样文字就不会遮挡背景
3. **`background-clip: text`**：将背景裁剪成文字的形状，只有文字覆盖的区域才显示背景

`-webkit-background-clip: text` 是 WebKit 内核浏览器的私有前缀写法，建议同时写上以保证兼容性。

## 6. 图片蒙版文字

这是 `background-clip: text` 的进阶玩法——用一张图片代替渐变色来填充文字，让文字"变成"图片的样子。

```css
.image-text {
  background-image: url(./img/bg-2.png);
  background-size: cover;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

和渐变文字唯一的区别就是 `background-image` 的值从 `linear-gradient(...)` 换成了 `url(...)`。`background-size: cover` 确保图片覆盖整个文字区域。

<div class="demo-card">
  <div class="demo-label">Live Demo — 图片/图案蒙版文字</div>
  <div class="demo-mask-text">Little Bees In A Gradient.</div>
</div>

由于博客环境没有实际的图片资源，上方演示用 CSS 径向渐变模拟了"图片填充文字"的效果。实际使用时把 `background-image` 换成你的图片 URL 即可，效果会更有质感。

这个技巧非常适合做大标题的视觉设计，比如用风景照片填充标题文字，或者用纹理图片给文字增加质感。

## 总结

这 6 个技巧可以组合使用，创造出更丰富的文字效果。比如自定义字体 + 渐变文字 + 文字投影，就能做出很有设计感的标题。几个实用的组合思路：

- **国风标题**：`@font-face` 加载书法字体 + `writing-mode: vertical-rl` 竖排 + `text-shadow` 加投影
- **霓虹灯效果**：深色背景 + 亮色文字 + 多层 `text-shadow` 模拟发光
- **杂志封面**：`background-clip: text` 用大图填充超大号标题文字

掌握这些基础能力后，文字的视觉表现力就不再受限于系统默认的黑白样式了。
