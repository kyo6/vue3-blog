---
tag: ['CSS', '前端', '小技巧', '滤镜', '渐变']
date: 2024-07-31
detail: 开发中保证你用得到的 CSS 小技巧：filter 滤镜家族（置灰 / 阴影 / 模糊 / 亮度）、单行与多行文本省略、linear-gradient 与 radial-gradient 渐变、mask 遮罩玩法、文字发光与毛玻璃效果，以及图片循环轮播、容器 / 文字扫光、元素倒影、元素交融展开等实战小案例，每个技巧都附带可直接运行的示例代码。
---

<!-- 全局演示样式 -->
<style>
.ct-demo {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0 32px 0;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.ct-demo-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
  font-weight: 600;
}
.ct-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.ct-img {
  width: 200px;
  max-width: 100%;
  border-radius: 10px;
  display: block;
}
.ct-figure {
  margin: 0;
  text-align: center;
}
.ct-figure figcaption {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}
.ct-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: #94a3b8;
  flex-wrap: wrap;
}
.ct-ctrl label {
  min-width: 64px;
  font-weight: 600;
  color: #cbd5e1;
}
.ct-ctrl input[type='range'] {
  flex: 1;
  min-width: 120px;
  accent-color: #fb923c;
}
.ct-val {
  font-variant-numeric: tabular-nums;
  color: #f8fafc;
  min-width: 44px;
  text-align: right;
  font-weight: 600;
}
.ct-note {
  font-size: 12.5px;
  color: #94a3b8;
  line-height: 1.7;
  margin-top: 12px;
  border-left: 3px solid #fb923c;
  padding-left: 10px;
}
/* 文本省略演示 */
.ct-ellipsis-single {
  width: 260px;
  max-width: 100%;
  height: 72px;
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 6px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
.ct-ellipsis-multi {
  width: 260px;
  max-width: 100%;
  height: 96px;
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 6px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  word-break: break-all;
  box-sizing: border-box;
}
/* 渐变演示 */
.ct-grad-box {
  width: 100%;
  height: 140px;
  border-radius: 10px;
}
/* mask 演示 */
.ct-mask-stage {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
}
.ct-mask-stage.ct-mask-split {
  height: auto;
  aspect-ratio: 3 / 2;
  max-height: 360px;
  background: #0b1220;
}
.ct-mask-stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.ct-mask-before, .ct-mask-after {
  width: 100%;
}
.ct-mask-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.ct-mask-pair .ct-sub {
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  height: 190px;
}
.ct-mask-pair img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ct-sub-tag {
  position: absolute;
  left: 8px;
  bottom: 8px;
  font-size: 11px;
  background: rgba(0,0,0,0.55);
  color: #e2e8f0;
  padding: 3px 8px;
  border-radius: 4px;
}
/* 毛玻璃演示 */
.ct-glass-bg {
  position: relative;
  height: 420px;
  border-radius: 10px;
  overflow: hidden;
  background: url('/blog/css-tips/demo-dog-stand.png') center/cover no-repeat;
  margin-bottom: 14px;
}
.ct-glass-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 110px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.35);
}
/* 轮播演示 */
.ct-swiper {
  width: 100%;
  height: 170px;
  overflow: hidden;
  -webkit-mask: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  mask: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  margin-bottom: 6px;
}
.ct-swiper-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: ct-swiper 12s linear infinite;
}
.ct-swiper:hover .ct-swiper-track { animation-play-state: paused; }
.ct-swiper-track img {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
  margin-right: 18px;
}
@keyframes ct-swiper {
  to { transform: translateX(-50%); }
}
/* 扫光演示 */
.ct-sweep-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 130px;
  background: #0b1220;
  border-radius: 10px;
}
.ct-tips {
  position: relative;
  width: fit-content;
  background: #ef4444;
  font-size: 13px;
  padding: 8px 14px;
  font-weight: 700;
  border-radius: 4px;
  color: #fff;
  overflow: hidden;
}
.ct-tips::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  animation: ct-tip 1.1s linear infinite;
}
@keyframes ct-tip {
  from { transform: skewX(45deg) translateX(70px); }
  to   { transform: skewX(45deg) translateX(-14px); }
}
/* 文字扫光 */
.ct-shine-text {
  font-size: 34px;
  font-weight: 700;
  background: #585757 linear-gradient(to left, transparent, #fff, transparent) no-repeat 0 0;
  background-size: 40% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: ct-shine 1.8s infinite;
}
@keyframes ct-shine {
  from { background-position: 0% 0%; }
  to   { background-position: 150% 100%; }
}
/* 倒影演示 */
.ct-reflect-stage {
  background: #0b1220;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-bottom: 14px;
}
.ct-reflect-img {
  width: 130px;
  height: auto;
  border-radius: 6px;
  -webkit-box-reflect: below 12px linear-gradient(transparent, transparent, rgba(0, 0, 0, 0.75));
}
/* 文字发光（静态） */
.ct-glow-word {
  font-size: 44px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
}
/* 交融演示 */
.ct-blend-stage {
  background: #000;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  overflow: hidden;
}
.ct-blend-text {
  color: #fff;
  font-weight: 700;
  font-size: 36px;
  white-space: nowrap;
  animation: ct-blend 3s ease-in-out infinite;
}
@keyframes ct-blend {
  0%   { letter-spacing: -100px; filter: blur(6px); }
  100% { letter-spacing: 0px;    filter: blur(0px); }
}
@media (max-width: 560px) {
  .ct-img { width: 160px; }
  .ct-mask-pair { grid-template-columns: 1fr; }
  .ct-blend-text { font-size: 24px; }
}
</style>

CSS 主要用于设置网页的视觉样式，包括布局、颜色、字体和其他设计细节。它使得网页设计与内容分离，从而提高了网页的可维护性和可重用性。

🌞 今天我将分享一些有用的 CSS 小技巧，后续不断完善，灵感不息，创作不止。

# filter家族

**`filter`** 属性将模糊或颜色偏移等图形效果应用于元素。滤镜通常用于调整图像、背景和边框的渲染

## 图片置灰

```css
filter: grayscale(100%);
```

<div class="ct-demo">
  <div class="ct-demo-label">图片置灰 · filter: grayscale()</div>
  <div class="ct-stage"><img id="ct-grayscale" class="ct-img" src="/blog/css-tips/demo-portrait.png" alt="置灰演示图"></div>
  <div class="ct-ctrl">
    <label>灰度</label>
    <input type="range" min="0" max="100" value="0"
      oninput="var v=this.value;document.getElementById('ct-grayscale').style.filter='grayscale('+v+'%)';document.getElementById('ct-grayscale-val').textContent=v+'%'">
    <span id="ct-grayscale-val" class="ct-val">0%</span>
  </div>
</div>

## 滤镜阴影

```css
 filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.5));
```

大多数人都知道`box-shadow`是设置盒子阴影，但你知道` filter: drop-shadow`与`box-shadow`的区别吗？
举个例子：

<div class="ct-demo">
  <div class="ct-demo-label">box-shadow vs drop-shadow</div>
  <div class="ct-stage" style="background:#e2e8f0;border-radius:10px;padding:24px 16px">
    <figure class="ct-figure"><img class="ct-img" style="box-shadow:10px 10px 18px rgba(0,0,0,0.55)" src="/blog/css-tips/demo-cloud.png" alt="box-shadow 沿矩形边框"><figcaption style="color:#475569">box-shadow</figcaption></figure>
    <figure class="ct-figure"><img class="ct-img" style="filter:drop-shadow(10px 10px 18px rgba(0,0,0,0.55))" src="/blog/css-tips/demo-cloud.png" alt="drop-shadow 沿形状轮廓"><figcaption style="color:#475569">filter: drop-shadow</figcaption></figure>
  </div>
  <div class="ct-note">左边 box-shadow 沿元素边框（矩形）绘制阴影；右边 drop-shadow 沿图像实际形状绘制。注意：drop-shadow 只对<b>无背景（透明背景）</b>的图片生效。</div>
</div>

不难看出区别显而易见，但值的注意的是` filter: drop-shadow`只针对一张**无背景的图片。**

## 图片模糊化

```css
//数值越高越模糊
filter: blur(3px);
```

<div class="ct-demo">
  <div class="ct-demo-label">图片模糊化 · filter: blur()</div>
  <div class="ct-stage"><img id="ct-blur" class="ct-img" src="/blog/css-tips/demo-dog-chair.png" alt="模糊演示图"></div>
  <div class="ct-ctrl">
    <label>模糊</label>
    <input type="range" min="0" max="12" value="0"
      oninput="var v=this.value;document.getElementById('ct-blur').style.filter='blur('+v+'px)';document.getElementById('ct-blur-val').textContent=v+'px'">
    <span id="ct-blur-val" class="ct-val">0px</span>
  </div>
  <div class="ct-note">数值越大越模糊。</div>
</div>

## 图片亮度调整

```css
filter: brightness(1);
```

**`brightness()`**  [CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS)函数将线性乘数应用于输入图像，使其看起来更亮或更暗。

<div class="ct-demo">
  <div class="ct-demo-label">图片亮度调整 · filter: brightness()</div>
  <div class="ct-stage"><img id="ct-brightness" class="ct-img" src="/blog/css-tips/demo-dog-stand.png" alt="亮度演示图"></div>
  <div class="ct-ctrl">
    <label>亮度</label>
    <input type="range" min="0" max="200" value="100"
      oninput="var v=this.value;document.getElementById('ct-brightness').style.filter='brightness('+v/100+')';document.getElementById('ct-brightness-val').textContent=(v/100).toFixed(1)+'×'">
    <span id="ct-brightness-val" class="ct-val">1.0×</span>
  </div>
  <div class="ct-note"><code>brightness()</code> 函数对图像应用一个线性乘数，使画面更亮（&gt;1）或更暗（&lt;1），比如 <code>brightness(0.5)</code> 亮度减半。</div>
</div>

加上属相后的效果：

<div class="ct-demo">
  <div class="ct-demo-label">亮度多档效果对比</div>
  <div class="ct-stage">
    <figure class="ct-figure"><img class="ct-img" style="filter:brightness(0.4)" src="/blog/css-tips/demo-dog-stand.png" alt="亮度 0.4"><figcaption>0.4×</figcaption></figure>
    <figure class="ct-figure"><img class="ct-img" style="filter:brightness(0.7)" src="/blog/css-tips/demo-dog-stand.png" alt="亮度 0.7"><figcaption>0.7×</figcaption></figure>
    <figure class="ct-figure"><img class="ct-img" src="/blog/css-tips/demo-dog-stand.png" alt="亮度 1.0"><figcaption>1.0×</figcaption></figure>
    <figure class="ct-figure"><img class="ct-img" style="filter:brightness(1.5)" src="/blog/css-tips/demo-dog-stand.png" alt="亮度 1.5"><figcaption>1.5×</figcaption></figure>
  </div>
</div>

# 文本省略

## 单行文本

<div class="ct-demo">
  <div class="ct-demo-label">单行文本省略</div>
  <div class="ct-stage"><div class="ct-ellipsis-single">人总是在遭遇一次重创之后，才会幡然醒悟，重新认识自己的坚强和隐忍。所以，无论你正在遭遇什么磨难，都不要一味抱怨上苍不公平，甚至从此一蹶不振。人生没有过不去的坎，只有过不去的人。</div></div>
  <div class="ct-note">三个属性配合：<code>overflow: hidden</code> 隐藏溢出、<code>text-overflow: ellipsis</code> 显示省略号、<code>white-space: nowrap</code> 禁止换行。</div>
</div>

```css
<style>
    .box {
        width: 150px;
        height: 80px;
        border: 1px black solid;
        border-radius: 5px;
        overflow: hidden;
        /*超出部分隐藏*/
        text-overflow: ellipsis;
        /*超出部分显示省略号*/
        white-space: nowrap;
        /*规定段落中的文本不进行换行 */
    }
</style>

<body>
    <div class="box">
        人总是在遭遇一次重创之后，才会幡然醒悟，重新认识自己的坚强和隐忍。所以，无论你正在遭遇什么磨难，都不要一味抱怨上苍不公平，甚至从此一蹶不振。人生没有过不去的坎，只有过不去的人。
    </div>
</body>
```

## 多行文本

<div class="ct-demo">
  <div class="ct-demo-label">多行文本省略 · -webkit-line-clamp</div>
  <div class="ct-stage"><div id="ct-ellipsis-multi" class="ct-ellipsis-multi" style="-webkit-line-clamp:3">人总是在遭遇一次重创之后，才会幡然醒悟，重新认识自己的坚强和隐忍。所以，无论你正在遭遇什么磨难，都不要一味抱怨上苍不公平，甚至从此一蹶不振。人生没有过不去的坎，只有过不去的人。</div></div>
  <div class="ct-ctrl">
    <label>显示行数</label>
    <input type="range" min="1" max="6" value="3"
      oninput="var v=this.value;var el=document.getElementById('ct-ellipsis-multi');el.style.webkitLineClamp=v;document.getElementById('ct-ellipsis-multi-val').textContent=v+' 行'">
    <span id="ct-ellipsis-multi-val" class="ct-val">3 行</span>
  </div>
  <div class="ct-note"><code>display: -webkit-box</code> + <code>-webkit-box-orient: vertical</code> + <code>-webkit-line-clamp: N</code>，配合 <code>overflow: hidden</code> 实现指定行数截断。</div>
</div>

```css
<style>
    .box {
        width: 150px;
        height: 80px;
        border: 1px black solid;
        border-radius: 5px;
        overflow: hidden;
        display: -webkit-box;   /*将对象作为弹性伸缩盒子模型显示*/  
       -webkit-box-orient: vertical;   /*设置伸缩盒对象的子元素的排列方式*/ 
       -webkit-line-clamp: 5;   /*用来限制在一个块元素中显示的文本的行数*/
        word-break: break-all;   /*让浏览器实现在任意位置的换行 *break-all为允许在单词内换行*/
    }
</style>

<body>
    <div class="box">
        人总是在遭遇一次重创之后，才会幡然醒悟，重新认识自己的坚强和隐忍。所以，无论你正在遭遇什么磨难，都不要一味抱怨上苍不公平，甚至从此一蹶不振。人生没有过不去的坎，只有过不去的人。
    </div>
</body>
```

# 渐变

## linear-gradient

**`linear-gradient()`** 创建一个由两种或多种颜色沿一条直线进行线性过渡的图像。

```css
linear-gradient(to right, #ff9a62, var(--main--bg));
```

<div class="ct-demo">
  <div class="ct-demo-label">linear-gradient() · 线性渐变</div>
  <div class="ct-stage" style="width:100%"><div id="ct-linear" class="ct-grad-box" style="background:linear-gradient(90deg,#ff9a62,#7c5cff)"></div></div>
  <div class="ct-ctrl">
    <label>方向</label>
    <input type="range" min="0" max="360" value="90"
      oninput="var v=this.value;document.getElementById('ct-linear').style.background='linear-gradient('+v+'deg,#ff9a62,#7c5cff)';document.getElementById('ct-linear-val').textContent=v+'deg'">
    <span id="ct-linear-val" class="ct-val">90deg</span>
  </div>
  <div class="ct-note">拖动滑块改变渐变方向。也支持关键字：<code>to right</code>、<code>to bottom left</code> 等。</div>
</div>

## radial-gradient()

**`radial-gradient()`** 创建一个图像，该图像由从原点辐射的两种或多种颜色之间的渐进过渡组成，其形状可以是圆形或椭圆形。

```css
   background: radial-gradient(rgb(243 152 73) 23%, #000000 75%);
```

<div class="ct-demo">
  <div class="ct-demo-label">radial-gradient() · 径向渐变</div>
  <div class="ct-stage" style="width:100%"><div id="ct-radial" class="ct-grad-box" style="background:radial-gradient(circle at 30% 30%, rgb(243 152 73) 23%, #000 75%)"></div></div>
  <div class="ct-ctrl">
    <label>圆心 X</label>
    <input id="ct-radial-x" type="range" min="0" max="100" value="30"
      oninput="var x=this.value,y=document.getElementById('ct-radial-y').value;document.getElementById('ct-radial').style.background='radial-gradient(circle at '+x+'% '+y+'%, rgb(243 152 73) 23%, #000 75%)';document.getElementById('ct-radial-x-val').textContent=x+'%'">
    <span id="ct-radial-x-val" class="ct-val">30%</span>
  </div>
  <div class="ct-ctrl">
    <label>圆心 Y</label>
    <input id="ct-radial-y" type="range" min="0" max="100" value="30"
      oninput="var y=this.value,x=document.getElementById('ct-radial-x').value;document.getElementById('ct-radial').style.background='radial-gradient(circle at '+x+'% '+y+'%, rgb(243 152 73) 23%, #000 75%)';document.getElementById('ct-radial-y-val').textContent=y+'%'">
    <span id="ct-radial-y-val" class="ct-val">30%</span>
  </div>
  <div class="ct-note">由圆心向四周辐射过渡，形状可为圆形或椭圆形：<code>radial-gradient(circle at x y, 颜色1 位置, 颜色2 位置)</code>。</div>
</div>

# mask

**`mask`** 允许使用者通过遮罩或者裁切特定区域的图片的方式来隐藏一个元素的部分或者全部可见区域。

## Case 1

先看图

<div class="ct-demo">
  <div class="ct-demo-label">mask 遮罩 · Case 1 对比</div>
  <div class="ct-mask-pair">
    <div class="ct-sub"><img src="/blog/css-tips/demo-dog-walk.png" alt="未加 mask 的生硬轮播"><span class="ct-sub-tag">未加 mask：生硬</span></div>
    <div class="ct-sub"><img id="ct-mask-img" src="/blog/css-tips/demo-dog-walk.png" alt="加 mask 后边缘渐隐" style="mask:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);-webkit-mask:linear-gradient(90deg,transparent,black 10%,black 90%,transparent)"><span class="ct-sub-tag">加 mask：边缘渐隐</span></div>
  </div>
  <div class="ct-ctrl">
    <label>透明区</label>
    <input type="range" min="0" max="50" value="10"
      oninput="var v=this.value;document.getElementById('ct-mask-img').style.mask='linear-gradient(90deg,transparent,black '+v+'%,black '+(100-v)+'%,transparent)';document.getElementById('ct-mask-img').style.webkitMask='linear-gradient(90deg,transparent,black '+v+'%,black '+(100-v)+'%,transparent)';document.getElementById('ct-mask-val').textContent=v+'%'">
    <span id="ct-mask-val" class="ct-val">10%</span>
  </div>
  <div class="ct-note">做图片轮播切换时，不加 mask 边缘切换生硬；加上横向渐变遮罩后，左右边缘渐隐，体验更顺滑。mask 中 <code>transparent</code> 的部分图片会变透明。</div>
</div>

如果你想做一个图片的轮播切换效果，就会出现上图所示，比较生硬。但是加上下面的`mask`效果，边缘有一层遮罩效果，体验就会好许多

```css
   mask: linear-gradient(
          90deg,
          transparent,
          black 10%,
          black 90%,
          transparent
     );
```

<div class="ct-demo">
  <div class="ct-demo-label">mask 渐隐效果特写</div>
  <div class="ct-stage" style="width:100%"><div class="ct-mask-stage"><img src="/blog/css-tips/demo-dog-walk.png" alt="横向渐隐遮罩特写" style="width:100%;height:100%;object-fit:cover;mask:linear-gradient(90deg,transparent,black 8%,black 92%,transparent);-webkit-mask:linear-gradient(90deg,transparent,black 8%,black 92%,transparent)"></div></div>
  <div class="ct-note">渐变遮罩沿 90° 方向展开：两端 <code>transparent</code> → 中间 <code>black</code>（完全不透明），实现图片两端淡出。</div>
</div>

mask设置`transparent`的部分，图片会变得透明

## Case 2

两张图片的一个好看的展示效果！

<div class="ct-demo">
  <div class="ct-demo-label">mask · Case 2 两图分割</div>
  <div class="ct-mask-stage ct-mask-split">
    <img id="ct-mask2-1" src="/blog/css-tips/demo-dog-walk.png" alt="第一张图" style="object-fit:cover;object-position:center;mask:linear-gradient(124deg,#000 55%,transparent 45%);-webkit-mask:linear-gradient(124deg,#000 55%,transparent 45%)">
    <img id="ct-mask2-2" src="/blog/css-tips/demo-sun.png" alt="第二张图" style="background:#0b1220;object-fit:cover;object-position:center;mask:linear-gradient(301deg,#000 48%,transparent 53%);-webkit-mask:linear-gradient(301deg,#000 48%,transparent 53%)">
  </div>
  <div class="ct-note">两张图片重叠，各自用不同角度的渐变 mask 裁切，即可实现对角分割、渐变过渡的展示效果。容器固定 <code>aspect-ratio: 3/2</code>，图片 <code>object-fit: cover</code> 居中裁切，保证比例和谐。</div>
</div>

```css
<style>
    .box {
        position: relative;
    }

    img {
        width: 600px;
        position: absolute;

    }

    img:nth-child(1) {
        mask: linear-gradient(124deg, #000 55%, transparent 45%)
    }

    img:nth-child(2) {
        mask: linear-gradient(301deg, #000 48%, transparent 53%)
    }
</style>

<body>
    <div class="box">
        <img src="./img/pic1.png" alt="">
        <img src="./img/pic2.png" alt="">

    </div>
</body>
```

两张图片重叠使用`mask`可达到分割渐变的效果。

# 其他

## background-blend-mode

```css
     //以下三个css属性结合，可以达到背景与背景颜色重合的效果
     background: url(../../assets/img/user_bg.png) no-repeat 50% 100%;
     background-blend-mode: overlay;
     background-color: rgba(255, 255, 255,0.1);
```

`overlay` 模式将背景图像和背景颜色以混合模式的方式结合起来，增强对比度，同时保持图像的明亮度。这种模式通常用于增强图像的视觉效果或与背景颜色进行对比。

## 让文字发光

```css
 text-shadow: 0px 0px 5px rgba(255, 255, 255)
```

<div class="ct-demo">
  <div class="ct-demo-label">让文字发光 · text-shadow</div>
  <div class="ct-stage"><span id="ct-glow" class="ct-glow-word">CSS</span></div>
  <div class="ct-ctrl">
    <label>光晕</label>
    <input type="range" min="0" max="30" value="6"
      oninput="var v=this.value;document.getElementById('ct-glow').style.textShadow='0 0 '+v+'px rgba(255,255,255,0.9)';document.getElementById('ct-glow-val').textContent=v+'px'">
    <span id="ct-glow-val" class="ct-val">6px</span>
  </div>
  <div class="ct-note"><code>text-shadow: 0 0 Npx rgba(255,255,255,0.9)</code>，偏移为 0 时形成围绕文字的发光光晕。</div>
</div>

## 毛玻璃

```css
 backdrop-filter: blur(2px);
```

**`backdrop-filter`** 属性可以让你为一个元素后面区域添加图形效果（如模糊或颜色偏移）。因为它适用于元素*背后*的所有元素，为了看到效果，必须使元素或其背景至少部分透明。

```css
<style>
   .box {
    width: 100vw;
    height: 100vh;
    background-color: gray;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('./img.png') no-repeat;
    background-size: cover;
  } 
  .text {
      width: 200px;
      height: 100px;
      backdrop-filter: blur(2px);
      border-radius: 20px;
      background-color: rgba(0, 0, 0, 0.1);
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.9);
      display: flex;
      color: black;
      align-items: center;
      justify-content: center;
    }
</style>

<body>
    <div class="box">
        <div class="text">
            css毛玻璃
        </div>
    </div>
</body>
```

<div class="ct-demo">
  <div class="ct-demo-label">毛玻璃 · backdrop-filter</div>
  <div class="ct-glass-bg"><div id="ct-glass-card" class="ct-glass-card" style="backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)">CSS 毛玻璃</div></div>
  <div class="ct-ctrl">
    <label>模糊</label>
    <input type="range" min="0" max="20" value="6"
      oninput="var v=this.value;document.getElementById('ct-glass-card').style.backdropFilter='blur('+v+'px)';document.getElementById('ct-glass-card').style.webkitBackdropFilter='blur('+v+'px)';document.getElementById('ct-glass-val').textContent=v+'px'">
    <span id="ct-glass-val" class="ct-val">6px</span>
  </div>
  <div class="ct-note"><code>backdrop-filter</code> 作用于元素<b>背后</b>的所有内容，因此背景需至少部分透明才能看到效果；配合半透明背景色 + 圆角 + 阴影即得毛玻璃卡片。</div>
</div>

# css小案例

## 图片循环轮播

<div class="ct-demo">
  <div class="ct-demo-label">图片循环轮播 · CSS 动画（悬停暂停）</div>
  <div class="ct-swiper">
    <div class="ct-swiper-track">
      <img src="/blog/css-tips/demo-dog-walk.png" alt="轮播图 1">
      <img src="/blog/css-tips/demo-dog-chair.png" alt="轮播图 2">
      <img src="/blog/css-tips/demo-dog-stand.png" alt="轮播图 3">
      <img src="/blog/css-tips/demo-portrait.png" alt="轮播图 4">
      <img src="/blog/css-tips/demo-sun.png" alt="轮播图 5">
      <img src="/blog/css-tips/demo-dog-walk.png" alt="轮播图 1 副本">
      <img src="/blog/css-tips/demo-dog-chair.png" alt="轮播图 2 副本">
      <img src="/blog/css-tips/demo-dog-stand.png" alt="轮播图 3 副本">
      <img src="/blog/css-tips/demo-portrait.png" alt="轮播图 4 副本">
      <img src="/blog/css-tips/demo-sun.png" alt="轮播图 5 副本">
    </div>
  </div>
  <div class="ct-note">轨道内容复制一份，<code>translateX(-50%)</code> 循环平移实现无缝轮播；容器 <code>mask</code> 让两端渐隐。悬停时 <code>animation-play-state: paused</code> 暂停。</div>
</div>
如下sass代码

```css
<template>
 <div class="swiperContent">
        <div class="picImg">
            <img src="./img/pic1.jpg" alt="">
            <img src="./img/pic2.png" alt="">
            <img src="./img/pic3.png" alt="">
            <img src="./img/pic4.jpg" alt="">
            <img src="./img/pic5.jpg" alt="">
            <img src="./img/pic6.png" alt="">
            <img src="./img/pic7.jpg" alt="">
            <img src="./img/pic8.jpg" alt="">
            <img src="./img/pic1.jpg" alt="">
            <img src="./img/pic2.png" alt="">
            <img src="./img/pic3.png" alt="">
            <img src="./img/pic4.jpg" alt="">
            <img src="./img/pic5.jpg" alt="">
            <img src="./img/pic6.png" alt="">
            <img src="./img/pic7.jpg" alt="">
            <img src="./img/pic8.jpg" alt="">

        </div>
    </div>
</template>
<style scoped lang="scss">
 @keyframes swiper {
        to {
            transform: translateX(-50%);
        }
    }

    .swiperContent {
        width: 80%;
        height: 100vh;
        display: flex;
        overflow: hidden;
        margin: auto;
        mask: linear-gradient(90deg,
                transparent,
                black 10%,
                black 90%,
                transparent);

        .picImg {
            margin: auto;
            /* 撑满就不会出现动画效果的卡顿了 */
            width: max-content;
            display: flex;
            align-items: center;
            animation: swiper 10s linear infinite;

            img {
                width: 260px;
                height: 150px;
                border-radius: 10px;
                margin-right: 40px;
            }

            &:hover {
                animation-play-state: paused;
            }
        }
    }
</style>
```

## 扫光

### 容器扫光

<div class="ct-demo">
  <div class="ct-demo-label">容器扫光</div>
  <div class="ct-sweep-box"><div class="ct-tips">热门商品</div></div>
  <div class="ct-note">在标签上叠加一个白色半透明的 <code>::before</code> 伪元素，用 <code>skewX(45deg)</code> 倾斜并水平平移，形成扫光掠过效果。</div>
</div>

如下sass代码

```css
<template>
  <div class="tips">热门商品</div>
</template>
<style scoped lang="scss">
    @keyframes tip {
        from {
            transform: skewX(45deg) translateX(80px);
        }

        to {
            transform: skewX(45deg) translateX(-10px);
        }
    }

    .tips {
        width: 45px;
        margin-left: 10px;
        background-color: red;
        font-size: 10px;
        padding: 5px 10px;
        font-weight: bold;
        border-radius: 2px;
        color: #fff;
        position: relative;
        overflow: hidden;
        margin: 100px 100px;

        &::before {
            content: "";
            position: absolute;
            top: 0px;
            left: 0px;
            width: 15px;
            height: 100%;
            background-color: rgb(255, 255, 255, 0.5);
            animation: tip 1s linear infinite;
        }
    }
</style>

```

### 文字扫光

<div class="ct-demo">
  <div class="ct-demo-label">文字扫光</div>
  <div class="ct-sweep-box"><span class="ct-shine-text">文字扫光效果</span></div>
  <div class="ct-note">文字用 <code>background-clip: text</code> + 透明文字色，背景为一条白色渐变光带，动画改变 <code>background-position</code> 实现光带扫过。</div>
</div>

```css
<template>
     <div class="box">
        <span class="tip">文字扫光效果</span>
     </div>
</template>

<style scoped lang="scss">
        @keyframes shine {
            from {
                background-position: 0% 0%;
            }

            to {
                background-position: 150% 100%;
            }
        }

        .box {
            width: 200px;
            height: 100px;
            border-radius: 5px;
            font-weight: bold;
            background-color: black;
            display: flex;
            align-items: center;
            justify-content: center;

            .tip {
                font-size: 30px;
                background: #585757 linear-gradient(to left, transparent, #fff, transparent) no-repeat 0 0;
                background-size: 40% 100%;
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                animation: shine 1s infinite;
            }
        }
    </style>
```

## 元素倒影

<div class="ct-demo">
  <div class="ct-demo-label">元素倒影 · -webkit-box-reflect</div>
  <div class="ct-reflect-stage"><img id="ct-reflect" class="ct-reflect-img" src="/blog/css-tips/demo-helmet.png" alt="倒影演示图"></div>
  <div class="ct-ctrl">
    <label>反射距离</label>
    <input type="range" min="0" max="40" value="12"
      oninput="var v=this.value;document.getElementById('ct-reflect').style.webkitBoxReflect='below '+v+'px linear-gradient(transparent,transparent,rgba(0,0,0,0.75))';document.getElementById('ct-reflect-val').textContent=v+'px'">
    <span id="ct-reflect-val" class="ct-val">12px</span>
  </div>
  <div class="ct-note"><code>-webkit-box-reflect: below 距离 遮罩渐变</code>，渐变从透明到半透明黑，让倒影逐渐淡出（WebKit 内核浏览器支持，如 Chrome / Safari）。</div>
</div>

代码如下

```js
<template>
  <div class="box">
    <img
      src="/blog/css-tips/demo-portrait.png"
      class="pic"
    />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.box {
  width: 100%;
  height: 100vh;
  background: black;
  display: flex;
  justify-content: center;
  .pic {
    width: 300px;
    height: 450px;
    margin-top: 50px;
    border-radius: 4px;
    box-shadow: 0px 0px 10px #ffffffcc;
    //   元素倒影
    -webkit-box-reflect: below 10px
      linear-gradient(transparent, transparent, rgb(0, 0, 0, 0.8));
  }
}
</style>
```

## 元素交融展开

<div class="ct-demo">
  <div class="ct-demo-label">元素交融展开</div>
  <div class="ct-blend-stage"><span class="ct-blend-text">我于杀戮之中盛放，亦如黎明中的花朵</span></div>
  <div class="ct-note">从 <code>letter-spacing: -100px</code> + <code>blur(6px)</code> 过渡到正常字距，文字像从远处展开、由模糊到清晰，循环播放。</div>
</div>
代码如下

```js
<template>
  <div class="app">
    <div class="text">我于杀戮之中盛放，亦如黎明中的花朵</div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@keyframes animation {
  0% {
    letter-spacing: -100px;
    filter: blur(6px);
  }
  100% {
    letter-spacing: 0px;
    filter: blur(0px);
  }
}
.app {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 78px;

  .text {
    animation: animation 3s infinite;
  }
}
</style>

```

# 写在最后

🙉 以上就是一些开发中可能会用到的css小技巧，如果有机会我还会和大家分享更多有趣且实用小技巧！！！

最后分享几个使用的第三方库和一些网站，仅供参考

1.  [vue-3-slider-component高度定制的滑块组件](https://vue-3-slider-component.netlify.app/?path=/docs/vue-3-slider-component--docs)
2.  [CSS clip-path 生成器](https://www.jiangweishan.com/tool/clippy/)
3.  [css可视化](https://css.bqrdh.com/safety-color)
4.  [Animate.css（css动画库）](https://animate.style/)
5.  [javascript动效库](https://animejs.com/documentation/)
6.  [css生成优惠卷](https://coupon.codelabo.cn/?fileGuid=dpWDG6kDhy66gRVq)
