---
slug: baseline-2026-css-rsvp-card
tag: ['CSS', '前端', '实战案例']
date: 2026-10-20
column: 教程
detail: '打字就变高的输入框、自己选黑白的文字、用百分比画的波浪、知道自己是第几个的头像——这六项 CSS 在 2026 年成为 Baseline。用一张活动报名卡把它们串起来，附完整可运行页面。'
---

一张派对邀请卡，六个功能，零 JavaScript。听起来像标题党，但这里每个效果都能在今天的 Chrome 里跑起来，代码在最后。

这是我从一支教程视频里拆出来的案例，重写成了可以直接用的版本：留言框自己长高、文字颜色跟着背景选黑白、波浪用百分比画、头像知道自己排第几、整张卡一个变量切日夜。下面按"它替掉了什么 → 怎么写 → 会踩什么坑"逐项过一遍。

## 先看结果

<div style="border:1px solid #e3e5ec;border-radius:14px;overflow:hidden;background:#fff;">
  <iframe
    src="../works/rooftop-party-rsvp.html"
    title="Rooftop Party 报名卡"
    loading="lazy"
    style="width:100%;height:760px;border:0;display:block;"
  ></iframe>
</div>
<p style="font-size:0.9rem;color:#64748b;margin-top:-0.6em;">
  上面这四个开关就是全部交互：主题色换 banner 前景，日夜换卡片底色。
  <a href="../works/rooftop-party-rsvp.html" target="_blank" rel="noopener">全屏打开 →</a>
</p>

页面是一个单文件 HTML，没有框架、没有构建、没有一行 JS 参与样式计算（那 20 行 JS 只负责切 `data-*`）。

## 这六项到底替掉了什么

| 特性 | 以前怎么写 | 卡片里用在哪 | 进入 Baseline |
|---|---|---|---|
| `field-sizing: content` | 监听 `input`，读 `scrollHeight` 写回 `height` | 留言框 | Chrome 123 / Firefox 152 / Safari 26.2 |
| `contrast-color()` | 手写两套前景色，或者运行时算亮度 | 标题、按钮、头像字母 | Chrome 147 / Firefox 146 / Safari 26 |
| `clip-path: shape()` | `path()` 写 SVG 指令，坐标只能是像素 | 标题区波浪 | Chrome 135 / Firefox 148 / Safari 18.4 |
| `sibling-index()` / `sibling-count()` | `nth-child(1..n)` 逐个枚举角度 | 头像色相与倾斜 | Chrome 138 / Firefox 154 / Safari 26.2 |
| `@container style()` | 给每个元素加 `.night`，再逐条覆盖 | 深浅外观 | Chrome 111 / Firefox 151 / Safari 18 |
| `:open` | `details[open]` 属性选择器 | FAQ 展开变色 | Chrome 133 / Firefox 136 / Safari 26.5 |

"Baseline" 在这里的意思很具体：Chrome、Edge、Firefox、Safari 四个内核都支持了。但**它分两档**——刚够四家叫 newly available，这个状态满 30 个月才是 widely available。上表六项全部停在第一档，这件事后面单独说。

## 一、field-sizing：输入框自己长高

`<textarea>` 默认是固定高度，字超了就内部滚动。过去的标准解法是监听输入、读 `scrollHeight`、写回 `height`，每敲一个字算一次。

现在一步到位：

```css
.message {
  field-sizing: content;   /* 尺寸由内容决定 */
  min-height: 3lh;         /* 至少三行，否则会塌成一条缝 */
}
```

`lh` 是"当前行高"的单位，`3lh` 就是三行文字的高度。用 `3lh` 而不是 `72px`，是因为它会跟着字号和 `line-height` 一起缩放。

> **坑一**：只写 `field-sizing: content` 不加 `min-height`，空输入框会缩到**一行**高，鼠标都难点中。初始高度这时由 `min-height` 决定，`rows` 属性不再说了算。
>
> **坑二**：`box-sizing: border-box` 下 `3lh` 包含内边距，实际可视行数会略少于三行。要严格三行就写 `min-height: calc(3lh + 18px)`。

实测：留空时 76.5px，输入五行后变 147.5px，中途没有任何 JS 参与。

## 二、contrast-color()：前景色自己选黑白

卡片的品牌色是一个变量 `--accent`，主办方随时可换。但标题颜色如果写死成黑色，主题色一改成深紫，字就糊在背景里。

```css
.banner {
  background: var(--accent);
  color: #ffffff;                        /* 降级：老浏览器白字 */
  color: contrast-color(var(--accent));  /* 新浏览器自动挑 */
}
```

它接收一个颜色，返回**黑或白**——取与背景对比度更高的那个。所以它不是"智能调色"，只解决二元选择：亮底配黑字，暗底配白字。

这个特性最值钱的地方不是省一行代码，而是**让主题色变成真正可配置的**。以前换品牌色要重新检查每一个色块上的文字；现在把前景全部写成 `contrast-color(var(--accent))`，换色就是换一个变量。

同一个函数在头像上也能用，底色是算出来的 `oklch()`，字色就让函数自己决定：

```css
.guest {
  --avatar: oklch(72% 0.13 var(--hue));
  background: var(--avatar);
  color: #15151b;                        /* 降级 */
  color: contrast-color(var(--avatar));
}
```

> 它只认纯色。渐变、图片、半透明背景上它算不出正确结果，这类场景仍然要手写。悬停、禁用、聚焦这些状态也得单独验。

## 三、clip-path: shape()：用百分比画波浪

老写法 `clip-path: path('M ...')` 有两个硬伤：要手写 SVG 路径指令，而且坐标全是像素。卡片一缩窄，波浪错位，连日期都被裁掉。

`shape()` 允许百分比和长度混着写，形状跟着元素一起伸缩。这张卡的路径只有六段：

<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:680px;display:block;margin:0 auto">
  <rect width="680" height="300" rx="12" fill="#0F172A"/>
  <text x="24" y="36" font-size="15" font-weight="700" fill="#E2E8F0">六段路径，顺序错一处形状就歪</text>
  <path d="M60 90 H620 V200 Q480 236 360 200 T60 200 Z" fill="rgba(124,58,237,.30)" stroke="#A78BFA" stroke-width="2"/>
  <circle cx="60" cy="90" r="4.5" fill="#F472B6"/>
  <circle cx="620" cy="90" r="4.5" fill="#F472B6"/>
  <circle cx="620" cy="200" r="4.5" fill="#F472B6"/>
  <circle cx="360" cy="200" r="4.5" fill="#F472B6"/>
  <circle cx="60" cy="200" r="4.5" fill="#F472B6"/>
  <line x1="620" y1="200" x2="480" y2="236" stroke="#FBBF24" stroke-width="1.2" stroke-dasharray="4 4"/>
  <line x1="360" y1="200" x2="480" y2="236" stroke="#FBBF24" stroke-width="1.2" stroke-dasharray="4 4"/>
  <circle cx="480" cy="236" r="5" fill="#FBBF24"/>
  <text x="60" y="78" font-size="12.5" fill="#94A3B8">① from 0 0</text>
  <text x="620" y="78" font-size="12.5" fill="#94A3B8" text-anchor="end">② line to</text>
  <text x="596" y="224" font-size="12.5" fill="#94A3B8" text-anchor="end">③ line to</text>
  <text x="350" y="220" font-size="12.5" fill="#94A3B8" text-anchor="end">④ curve to</text>
  <text x="60" y="220" font-size="12.5" fill="#94A3B8">⑤ smooth to</text>
  <text x="492" y="254" font-size="12.5" fill="#FBBF24">with 控制点</text>
  <text x="70" y="150" font-size="12.5" fill="#94A3B8">⑥ close</text>
  <text x="24" y="286" font-size="12.5" fill="#64748B">curve 只给一个控制点（黄点），smooth 拿它的对称点补出另一半</text>
</svg>

对应的 CSS 就是这六行：

```css
.banner {
  clip-path: shape(
    from 0 0,
    line to 100% 0,
    line to 100% 88%,
    curve to 48% 88% with 76% 102%,
    smooth to 0% 88%,
    close
  );
}
```

- `curve` 后面的 `with` 是**控制点**坐标，`76% 102%` 把弧线往下拽出波谷；
- `smooth` 不用给控制点，它拿上一段控制点的**对称点**自动生成——半个波浪因此变成一整个（语义和 SVG 里的 `T` 完全一致）；
- `close` 从终点直接连回起点。

> **坑**：写完 `curve` 就 `close`、而不补 `smooth`，`close` 会从中间那个点拉一条直线回左上角，形状立刻变成一块歪掉的四边形。**终点停在中间时，必须把剩下半段补完再闭合。**
>
> 另一个坑：控制点别超过 `100%`。超过之后曲线会被元素自己的盒子裁平，波浪变成"平底锅"。

这种写法还有个隐含收益：整段没有任何像素值，卡片从 520px 缩到 360px，波浪自己跟着变形。

## 四、sibling-index() / sibling-count()：让元素知道自己排第几

想让头像排成扇形，老办法是 `nth-child(1)` 到 `nth-child(6)` 一条条写角度。中间插一个人，整张表重算。

这两个函数把"我是第几个""一共几个"暴露成了可计算的值：

```css
.guest {
  --mid: calc((sibling-count() + 1) / 2);                /* 中间位置 */
  rotate: calc((sibling-index() - var(--mid)) * 10deg);  /* 相对中点偏转 */
}
```

六个头像时中点是 3.5，角度落在 −25° 到 +25°，左右对称。加到七个，中点自动变 4，角度变 −30° 到 +30°——**CSS 一个字都不用改**。

色相也这么算，用 `oklch()` 固定亮度、只转色相：

```css
.guest {
  --hue: calc(60deg + (sibling-index() - 1) * 70deg);
  background: oklch(72% 0.13 var(--hue));
}
```

六个值依次是 60°、130°、200°、270°、340°，第六个绕回 50°——所以首尾两个都是橙色，这正是参考图里的样子。用 `oklch()` 而不是 `hsl()` 的原因是：亮度 `L` 固定，六个头像看起来一样亮；换成 `hsl` 的 `l` 会因为人眼感知差异，黄绿显得比蓝紫亮一截。

> **注意**：`sibling-index()` 从 **1** 开始，不是 0。它数的是同一层的元素兄弟，跟 `nth-child` 的计数范围一致。

## 五、容器样式查询：由外层变量决定内部样式

夜间模式的老办法是给卡片加一个 `.night` 类，然后一条条写 `.night .title {}`、`.night .button {}`。容器样式查询反过来：**外层放变量，内部元素自己去问外层**。

<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:680px;display:block;margin:0 auto">
  <rect width="680" height="320" rx="12" fill="#0F172A"/>
  <text x="24" y="34" font-size="15" font-weight="700" fill="#E2E8F0">同样的变量，放错层级就完全不生效</text>
  <rect x="24" y="50" width="632" height="104" rx="10" fill="none" stroke="#334155" stroke-dasharray="6 5"/>
  <text x="42" y="74" font-size="13.5" font-weight="700" fill="#E2E8F0">.party</text>
  <text x="98" y="74" font-size="13" fill="#A78BFA">{ --tone: night }</text>
  <rect x="42" y="86" width="300" height="50" rx="8" fill="#1E293B" stroke="#34D399"/>
  <text x="60" y="106" font-size="13" font-weight="700" fill="#E2E8F0">.card</text>
  <text x="60" y="124" font-size="12" fill="#94A3B8">@container style(--tone: night)</text>
  <text x="372" y="104" font-size="13" fill="#34D399">往外问最近的祖先</text>
  <text x="372" y="124" font-size="13" fill="#34D399">✓ 拿到 night，整卡变深色</text>
  <rect x="24" y="172" width="632" height="104" rx="10" fill="none" stroke="#334155" stroke-dasharray="6 5"/>
  <text x="42" y="196" font-size="13.5" font-weight="700" fill="#E2E8F0">.card</text>
  <text x="88" y="196" font-size="13" fill="#F87171">{ --tone: night }</text>
  <text x="42" y="224" font-size="13" fill="#94A3B8">查询只认祖先容器，自己身上的变量不算</text>
  <rect x="430" y="198" width="200" height="44" rx="8" fill="#1E293B" stroke="#475569" stroke-dasharray="4 4"/>
  <text x="530" y="225" font-size="12.5" fill="#94A3B8" text-anchor="middle">上一层：没有 --tone</text>
  <text x="24" y="306" font-size="12.5" fill="#64748B">这是个静默失败：不报错，夜里也不切换，只能靠肉眼发现</text>
</svg>

```css
/* 外层声明 */
.party { --tone: night; }
.party[data-tone="day"] { --tone: day; }

/* 内部响应 */
@container style(--tone: night) {
  .card   { background: #191922; color: #f4f5f8; }
  .guest  { box-shadow: 0 0 0 3px #191922; }
  .faq p  { color: #b9bcc8; }
}
```

> **坑（这个最容易踩）**：把 `--tone` 写在 `.card` **自己**身上不生效。查询问的是"最近的祖先容器"，`.card` 的上一层是 `.party`，变量必须挪上去。而且它是**静默失败**——不报错、不警告，页面就是不变色。
>
> 补充一点：样式查询不需要先声明 `container-type`，任何元素默认就是样式容器；但如果你写了 `container-name`，查询里也要带上那个名字。

`--tone` 改成 `day` 立刻回日间。整个换肤只动一个变量，不再需要为每个子元素准备两套类名。

## 六、:open：展开态不再靠属性选择器

过去要判断 `<details>` 是否展开，只能写 `details[open]`。现在有语义伪类：

```css
.faq:open > summary { color: var(--accent); }
.faq:open > summary::marker { color: var(--accent); }
```

`details`、`dialog`、`select` 都能用。点开问题，标题变主题色；收起，自动恢复，不需要任何 JS 记账。

## 组装：一张卡的完整骨架

把六项拼起来，HTML 结构其实很朴素：

```html
<div class="party" data-accent="violet" data-tone="night">
  <article class="card">
    <header class="banner">
      <h1>Rooftop Party</h1>
      <p class="meta">Sat 7 Nov · 7 pm</p>
    </header>
    <div class="body">
      <ul class="guests">
        <li class="guest">AL</li>
        <li class="guest">BO</li>
        <li class="guest">CY</li>
        <li class="guest">DI</li>
        <li class="guest">EV</li>
        <li class="guest">FA</li>
      </ul>
      <details class="faq">
        <summary>What should I bring?</summary>
        <p>一瓶饮料、一件外套，还有能坐的东西。</p>
      </details>
      <textarea class="message" placeholder="Leave a message"></textarea>
      <button class="cta">I'm in!</button>
    </div>
  </article>
</div>
```

注意 `.party` 这一层的存在：它唯一的作用就是**承载 `--tone`**，好让里面的 `.card` 有东西可查。这是整个案例里唯一一处"为了 CSS 特性而多加的 DOM"。

核心样式（略去页面外壳和响应式断点）：

```css
.card {
  width: min(440px, calc(100vw - 32px));
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  color: #17171d;
}

.banner {
  padding: 30px 34px 68px;
  background: var(--accent);
  color: contrast-color(var(--accent));
  clip-path: shape(from 0 0, line to 100% 0, line to 100% 88%,
                   curve to 48% 88% with 76% 102%, smooth to 0% 88%, close);
}

.guest {
  --hue: calc(60deg + (sibling-index() - 1) * 70deg);
  --mid: calc((sibling-count() + 1) / 2);
  width: 60px; height: 60px; border-radius: 50%;
  background: oklch(72% 0.13 var(--hue));
  color: contrast-color(oklch(72% 0.13 var(--hue)));
  rotate: calc((sibling-index() - var(--mid)) * 10deg);
}
```

有个细节值得单独说：`clip-path` 会连元素**自己的** `box-shadow` 一起裁掉（`overflow: hidden` 只裁子元素，不动自己的投影）。这张卡把阴影放在 `.card` 上、波浪放在 `.banner` 上，两者互不干扰；如果反过来给 `.banner` 加阴影，投影会被波浪顺手削掉一半。

## 现在就敢上生产吗

我不敢。这六项都只是 newly available，企业内网、政企站点、还没升级的旧 Safari 设备一个都跑不了。按"失效后的后果"排优先级：

| 特性 | 失效后果 | 建议的处理 |
|---|---|---|
| `field-sizing` | 输入框回到固定高度，要滚动 | 最该垫。保留原来的 `scrollHeight` 逻辑，两者不冲突 |
| `contrast-color()` | 前景色退回写死的值 | 先手写一个通过对比度检查的颜色当默认值 |
| `sibling-index()` | 角度算不出来，头像排成直板 | `nth-child` 枚举虽然啰嗦但不花钱，值得留 |
| `shape()` | 波浪退化成直角 | 纯装饰，`@supports` 里做增强即可 |
| `@container style()` | 永远停在日间 | 保留 `.night` 类名方案做兜底，或者用 `:has()` |
| `:open` | 展开时标题不变色 | 退回 `details[open]`，一行的事 |

写法上，全部用"先写降级值、再写新值"的双声明：

```css
.banner {
  color: #ffffff;                        /* 老浏览器 */
  color: contrast-color(var(--accent));  /* 支持就覆盖 */
}
```

不支持的浏览器会在**解析阶段**就丢掉第二条声明，第一条照常生效。这比 `@supports` 更省事，前提是两条声明作用于同一个属性。

## 落地前的自查清单

1. `field-sizing` 的地方有没有 `min-height`？没有就会塌成一条缝。
2. `contrast-color()` 覆盖的每个元素，都验过 hover / focus / disabled 三种状态吗？
3. `shape()` 的路径，最后一段闭合前补完了吗？控制点有没有超过 `100%`？
4. 容器查询的变量，真的在**祖先**上吗？把卡片单独拎出来测一次。
5. `sibling-index()` 从 1 开始——算式里减了 1 没有？
6. 每个新特性都留了降级值？关掉新特性再看一遍，页面还能用吗？

## 源码

完整页面在仓库 `public/works/rooftop-party-rsvp.html`，单文件、无依赖，双击就能开。文首那个 iframe 加载的就是它。

这套写法不是唯一的答案。比如日夜切换也可以完全交给 `light-dark()` 加 `color-scheme`，链路上还少一个 `.party` 包装元素——但那要另开一篇了。
