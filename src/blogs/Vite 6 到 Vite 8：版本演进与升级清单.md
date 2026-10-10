---
slug: vite-version-evolution-upgrade
tag: ['Vite', '前端', '工程化']
date: 2026-10-07
column: 技术研究
detail: 'Vite 6 加 Environment API，Vite 7 砍 Node 18 和 CJS 产物，Vite 8 把 esbuild + Rollup 换成 Rolldown + Oxc。先把 Vite 解决的八个构建问题摊开，再逐版对改动，最后按业务应用 / 组件库 / 插件作者三类给升级清单。'
---

Vite 6、7、8 三个大版本，间隔都在一年以内：

| 版本 | 发布日期 |
|---|---|
| Vite 6.0.0 | 2024-11-26 |
| Vite 7.0.0 | 2025-06-24 |
| Vite 8.0.0 | 2026-03-12 |
| Vite 8.1.0 | 2026-06-23 |

如果你现在还在 Vite 5 上，中间隔着三次升级。

先把量级说清楚，因为这三版的性质不一样：

- **Vite 6 是内部重构**。加了 Environment API，普通 SPA 项目基本无感。
- **Vite 7 是收紧边界**。砍 Node 18、砍 CJS 产物、抬高默认浏览器基线。
- **Vite 8 是换引擎**。esbuild + Rollup 两条管线合并成 Rolldown 一条。

判断你要不要动、要动多少，先看你落在哪一类：业务应用、组件库作者、还是插件作者。

<svg viewBox="0 0 680 208" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" role="img" aria-label="Vite 6 到 8.1 的发布时间线">
<rect width="680" height="208" rx="12" fill="#111827"/>
<text x="32" y="44" font-size="17" font-weight="600" fill="#F8FAFC">Vite 6 到 8.1：时间线</text>
<line x1="60" y1="138" x2="620" y2="138" stroke="#334155" stroke-width="2"/>
<circle cx="110" cy="138" r="7" fill="#38BDF8"/>
<circle cx="270" cy="138" r="7" fill="#38BDF8"/>
<circle cx="430" cy="138" r="10" fill="#F472B6"/>
<circle cx="590" cy="138" r="7" fill="#38BDF8"/>
<text x="110" y="116" font-size="15" font-weight="600" fill="#E2E8F0" text-anchor="middle">Vite 6</text>
<text x="270" y="116" font-size="15" font-weight="600" fill="#E2E8F0" text-anchor="middle">Vite 7</text>
<text x="430" y="116" font-size="15" font-weight="600" fill="#F9A8D4" text-anchor="middle">Vite 8</text>
<text x="590" y="116" font-size="15" font-weight="600" fill="#E2E8F0" text-anchor="middle">Vite 8.1</text>
<text x="110" y="166" font-size="13" fill="#94A3B8" text-anchor="middle">2024-11</text>
<text x="270" y="166" font-size="13" fill="#94A3B8" text-anchor="middle">2025-06</text>
<text x="430" y="166" font-size="13" fill="#94A3B8" text-anchor="middle">2026-03</text>
<text x="590" y="166" font-size="13" fill="#94A3B8" text-anchor="middle">2026-06</text>
<text x="110" y="190" font-size="12" fill="#64748B" text-anchor="middle">Environment API</text>
<text x="270" y="190" font-size="12" fill="#64748B" text-anchor="middle">Node 18 退役</text>
<text x="430" y="190" font-size="12" fill="#F9A8D4" text-anchor="middle">Rolldown 上位</text>
<text x="590" y="190" font-size="12" fill="#64748B" text-anchor="middle">Bundled Dev</text>
</svg>

---

## Vite 的主要功能：从八个构建问题倒推

前面讲了版本，但没讲 Vite 本身在做什么。不先把这个说清楚，后面每一版的改动你都只能记结论。

所以换个角度：**不按功能分类列，按「它替开发者挡掉了什么」来排。**下面八个问题都是前端工程化里绕不开的，也是历代构建工具的战场。

### ① 冷启动：打包器为什么要等

**问题**：基于打包器的开发服务器，必须先把整个应用打包完，浏览器才能拿到第一个字节。项目越大等待越久。

**Vite 的做法**：把「依赖」和「源码」拆开处理。

- **依赖**（几乎不变动的第三方库）：用 Rolldown 预构建一次，缓存到 `node_modules/.vite/deps`，之后走 HTTP 强缓存。
- **源码**（频繁改动的应用代码）：不打包，走浏览器原生 ESM 按需提供。浏览器请求哪个模块，Vite 就转换哪个。

结果是启动时间不再随应用规模线性增长。

<svg viewBox="0 0 680 196" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" role="img" aria-label="Vite 开发期依赖与源码的处理路径">
<rect width="680" height="196" rx="12" fill="#111827"/>
<text x="32" y="42" font-size="17" font-weight="600" fill="#F8FAFC">Vite 开发期：依赖和源码走两条路</text>
<text x="32" y="97" font-size="14" font-weight="600" fill="#38BDF8">依赖</text>
<rect x="110" y="70" width="538" height="44" rx="8" fill="#1E293B" stroke="#334155"/>
<text x="126" y="97" font-size="13" fill="#E2E8F0">Rolldown 预构建一次，结果缓存到 node_modules/.vite/deps</text>
<text x="32" y="163" font-size="14" font-weight="600" fill="#F472B6">源码</text>
<rect x="110" y="136" width="538" height="44" rx="8" fill="#1E293B" stroke="#334155"/>
<text x="126" y="163" font-size="13" fill="#E2E8F0">浏览器请求哪个模块就转换哪个，不提前打包</text>
</svg>

### ② 裸模块：浏览器不认识 `import 'my-dep'`

**问题**：`import { ref } from 'vue'` 这行代码，浏览器拿到会直接报错——它不知道 `vue` 是什么，也不知道去哪里找。打包器存在的一大半理由，就是替浏览器解决这件事。

**Vite 的做法**：预构建时把裸模块导入重写成合法 URL。

```js
// 你写的
import { ref } from 'vue'

// 浏览器收到的
import { ref } from '/node_modules/.vite/deps/vue.js?v=f3sf2ebd'
```

顺带解决第二件事：**把 CommonJS / UMD 包转成 ESM**。市面上还有大量没改格式的老包，Vite 在预构建阶段替你转。这是很多 CJS 老依赖能直接跑起来的原因。

### ③ 热更新：改一行不用等重新构建

**问题**：早期开发体验的痛点是改一个文件、等构建、刷新页面、应用状态全丢。表单填了一半、路由跳了三层，全白费。

**Vite 的做法**：围绕原生 ESM 做模块级 HMR，暴露 `import.meta.hot` API。框架层开箱集成，Vue SFC 和 React Fast Refresh 都不用你配置。

有一个 Vite 8 的破坏性变更要注意：`import.meta.hot.accept` **不再接受 URL**，必须传模块 id。写过自定义 HMR 逻辑的项目要检查。

### ④ 类型检查：该由谁负责

**问题**：TypeScript 项目里，类型检查是容易放错位置的工作。塞进构建流程，每次构建都要等全量检查；不塞进去，又可能带着类型错误上线。

**Vite 的做法**：明确分工——**只转译，不检查类型**。

这个取舍不是偷懒。转译可以逐文件独立完成，和 Vite 按需编译的模型契合；类型检查需要完整模块图，天生是全量操作。硬塞进开发服务器只会拖慢启动。

代价是几个约束要记住：

| 约束 | 表现 |
|---|---|
| `isolatedModules` 应为 `true` | 不支持 `const enum`、不支持隐式类型导入 |
| 忽略 `tsconfig.json` 的 `target` | 开发期看 `oxc.target`（默认 `esnext`），构建期 `build.target` 优先 |
| `paths` 默认不解析 | 需要显式开 `resolve.tsconfigPaths: true`，有性能损耗 |
| `emitDecoratorMetadata` 仅部分支持 | 完全支持需要类型推断，Oxc 做不到 |

类型检查交给外部工具：生产构建跑 `tsc --noEmit`，开发期跑 `tsc --noEmit --watch` 或挂 `vite-plugin-checker`。

客户端类型在 `tsconfig.json` 里加 `vite/client`（TS 5.9 起推荐写在 `compilerOptions.types`），它会带出资源导入、`import.meta.env`、`import.meta.hot` 的类型。

### ⑤ 样式链路：四件事本来要配四遍

**问题**：一个正常项目的样式链路通常包含 `@import` 内联、`url()` 路径变基、PostCSS 插件、Sass 预处理、CSS Modules、生产压缩。这套东西在旧工具里是一长串 loader 和 plugin。

**Vite 的做法**：内置。

| 需求 | Vite 的处理 | 关键配置 |
|---|---|---|
| `@import` 内联 | 预置 `postcss-import` | 无需配置 |
| `url()` 变基 | 自动处理，Sass / Less 同样支持 | 无需配置 |
| PostCSS | 检测到 `postcss.config.js` 自动应用 | `build.cssTarget` |
| CSS Modules | `.module.css` 后缀即生效 | `css.modules.localsConvention` |
| 预处理器 | `.scss/.sass/.less/.styl` 内置，只需装预处理依赖本身 | 如 `npm add -D sass-embedded` |
| 生产压缩 | 默认 Lightning CSS | `css.transformer: 'lightningcss'` 可整体切换 |

一个容易踩的点：想拿到 CSS 字符串但不注入页面，用 `?inline`。Vite 5 起默认导入和具名导入已被移除，只剩这一个入口。

Stylus 是例外，因为 API 限制，它不支持 `@import` 别名和 `url()` 变基。

### ⑥ 资源引用：我要的是 URL、字符串，还是模块

**问题**：这是构建配置的重灾区。「这个图片要输出成 URL」「这个文本要当字符串读进来」「这个 worker 要内联」——旧工具里每种需求对应一套 loader 配置和命名约定。

**Vite 的做法**：把意图写进导入语句本身。

```js
import imgUrl from './img.png?url'            // 显式要 URL
import txt from './file.txt?raw'              // 当字符串读
import css from './style.css?inline'          // 拿 CSS 不注入
import Worker from './worker?worker'          // worker 构造函数
import Worker2 from './worker?worker&inline'  // 构建时内联为 base64
import wasmInit from './mod.wasm?init'        // 手动初始化 wasm
```

这是 Vite 最有辨识度的设计之一：**用导入语法替代配置**。你不用查「这个 loader 叫什么、要不要加 `type: 'asset/resource'`」，看这行 import 想干什么就够了。

Web Worker 推荐用标准写法，Vite 会自动识别并拆成独立 chunk：

```js
new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
```

选项参数必须是静态值，动态拼进去 Vite 就识别不到。

### ⑦ 批量导入与多入口

**问题**：两个高度重复的场景。一是按目录注册模块——路由表、图标、i18n 词条，写起来是一屏 `import` 加一屏数组；二是多页面应用，旧工具要手写 entry 配置。

**Vite 的做法**：分别给了一个东西。

**`import.meta.glob`** 解决批量注册：

```js
const pages = import.meta.glob('./pages/*.js')                            // 懒加载
const others = import.meta.glob(['./a/*.js', '!**/b.js'])                // 反面匹配
const raws = import.meta.glob('./docs/*.md', { query: '?raw', import: 'default' })
const setups = import.meta.glob('./routes/*.js', { import: 'setup' })     // 取具名导出
```

两个硬约束：**参数必须是字面量**，不能用变量或表达式；匹配用的是 `tinyglobby`，所以 Vite 6 之后不再支持 `{01..03}` 这类区间花括号。

**HTML 即入口** 解决多页面。不用写 entry 配置——`<root>/index.html` 对应 `/`，`about.html` 对应 `/about.html`。HTML 里引用的资源也会被处理，覆盖 `<img src>`、`<source srcset>`、`<video poster>`、`<link href>` 等 13 类元素和属性。不想被处理的元素加 `vite-ignore`。Vite 8.1 又补了 `html.additionalAssetSources`，给自定义元素用。

### ⑧ 生产构建：默认就该做好的事

**问题**：分包、预加载、CSS 抽离、chunk 缓存失效，每一项单独看都不难，但都要人记得去配。

**Vite 的做法**：默认全做，不配就有。

| 自动做的事 | 解决什么 | 关掉的开关 |
|---|---|---|
| CSS 代码分割 | 异步 chunk 的 CSS 抽成独立文件，加载时才引入，避免 FOUC | `build.cssCodeSplit: false` |
| 生成 `modulepreload` | 入口及其直接依赖提前预加载 | 无 |
| 异步 chunk 共用依赖预加载 | 消除动态导入产生的额外网络往返 | 无 |
| chunk import map | 避免改一个 chunk 导致上游 hash 级联失效 | `build.chunkImportMap` |

前三项从 Vite 早期就有，第四项是 Vite 8.1 新加的。

还有两块偏合规的功能，用到的时候知道在哪儿就行：`html.cspNonce` 处理 CSP nonce，`build.license` 生成依赖许可证清单到 `.vite/license.md`。

---

把功能摊开成这八个问题之后，再看版本演进就清楚了：**Vite 6 到 Vite 8 改的东西，全都落在这八条里的某一条上。**下面按版本讲。

---

## Vite 6：给框架作者用的 Environment API

Vite 6 发布时，官方自称「自 Vite 2 以来最重要的一个版本」。这个说法指的是内部架构，不是你能直接用到的新特性。

核心改动是 **Environment API**。它把「开发服务器」「模块图」「热更新」从只有一套，改成可以按环境（client、ssr、edge、worker）各有一套。Vite 2 到 Vite 5 里，SSR 一直是搭在浏览器那一套之上打的补丁，环境之间会互相污染。Environment API 是把这层补丁正式拆开。

它面向的是框架作者和插件作者。官方原话是：如果你在做 SPA，用一个 client 环境，一切照旧。所以 Vite 5 升 Vite 6，绝大多数项目不需要改代码。

**普通项目真正会碰到的改动，是这六条：**

| 改动 | 影响范围 | 做法 |
|---|---|---|
| `resolve.conditions` 默认值变化 | 手写过这个配置的项目 | 把 `['custom']` 改成 `['custom', ...defaultClientConditions]` |
| `json.stringify` 默认变成 `'auto'` | 大 JSON 文件 | 只有大文件会被转成 `JSON.parse()`，行为变了可显式设 `false` |
| HTML 里能引用资源的元素变多 | 用到 `vite-ignore` 的场景 | 不想要的元素加 `vite-ignore` |
| `postcss-load-config` 从 v4 升 v6 | 用 TS / YAML 写 postcss 配置 | TS 配置改用 `tsx` 或 `jiti`，不再用 `ts-node` |
| Sass 默认走 modern API | 所有用 Sass 的项目 | 这一版还能用 `api: 'legacy'`，但 Vite 7 直接删了 |
| 库模式 CSS 产物改名 | 组件库 | `style.css` 变成跟随 `package.json` 的 name，或用 `build.lib.cssFileName` 固定 |

另外还有一条容易被忽略：Vite 6 把 glob 从 `fast-glob` 换成了 `tinyglobby`，**不再支持区间花括号**。`{01..03}` 这种写法要改成 `{01,02,03}`。

**结论**：Vite 5 → 6 是这三步里最轻松的一步。不写自定义 `resolve.conditions`、不用 Sass legacy API 的项目，改个版本号就能跑。

---

## Vite 7：做减法，同时抬高基线

Vite 7 的主题是删东西，但它顺带改了构建产物的语法基线——这一条对业务项目的影响比删掉的那些 API 大得多。

### 1. Node 版本要求：20.19+ / 22.12+

Vite 7 停止支持 Node 18（2025 年 4 月 EOL）。

为什么门槛卡在 20.19 和 22.12 这两个具体的小版本上？因为这批版本开始**默认支持 `require(esm)`，不需要加 flag**。Vite 7 借此把自己发成纯 ESM 包，同时还不挡住 CJS 模块用 `require` 调 Vite 的 JavaScript API。

如果你有 CI 跑在 Node 18 上，升级前先改 CI 的 node 版本，不然会在 `pnpm install` 阶段就报引擎不兼容。

### 2. `build.target` 默认值改名为 `baseline-widely-available`

旧默认值是 `'modules'`，这个值在 Vite 7 里**不再存在**。新默认值对齐 Baseline Widely Available（要求特性在各浏览器至少稳定 30 个月）。

| 浏览器 | Vite 5 / 6 | Vite 7 | Vite 8 |
|---|---|---|---|
| Chrome | 87 | 107 | 111 |
| Edge | 88 | 107 | 111 |
| Firefox | 78 | 104 | 114 |
| Safari | 14.0 | 16.0 | 16.4 |

注意 Safari 这一列。三次升级累计从 14.0 抬到 16.4，跨度接近三个大版本。**Safari 16.4 是 iOS 16.4，意味着 iOS 16.3 及以下被排除在默认目标之外。**

如果你的用户里有相当比例的旧 iOS、老安卓 WebView，或者依赖微信内置浏览器，就必须显式设置 `build.target`，不能吃默认值。

### 3. 删掉的三个 API

- **Sass legacy API**。Vite 6 就已经默认走 modern API 了，Vite 7 把 fallback 删掉。`css.preprocessorOptions.sass.api` 这个配置项可以直接删掉。
- **`splitVendorChunkPlugin`**。Vite 2 时代的过渡工具，改用 `manualChunks`。
- **`transformIndexHtml` 的 `enforce` / `transform`**。改成 Rollup 风格的对象钩子，用 `order` 和 `handler`。

### 4. 新增的东西

- **`buildApp` 钩子**：让插件协调多个环境的构建过程。配合 `vite build --app` 使用。这是 Environment API 的第一块落地拼图。
- **`this.meta` 在所有钩子里可用**。以前 Vite 专有的钩子（比如 `config`）拿不到 `this.meta`，插件作者要绕路。
- **`import.meta.glob` 支持 `base` 选项**。
- **`rolldown-vite` 开放试用**。这是 Vite 8 的前哨站，下面会讲。

**结论**：Vite 6 → 7 代码改动少，但要检查两件事——CI 的 Node 版本，和 `build.target` 能不能跟着抬。

---

## Vite 8：换引擎

Vite 8 是这三版里唯一需要认真评估的一次。官方称之为「自 Vite 2 以来最重要的架构变化」，这一次指的不是内部重构，是**打包器换了**。

### 为什么要合并管线

Vite 长期是两套东西：

- **esbuild** 负责开发期的依赖预构建和 TS / JSX 转译。
- **Rollup** 负责生产构建的分块和优化，整套插件 API 也来自它。

代价是：两条独立的转换管线，两套插件系统，外加大量胶水代码去保持两边一致。同一个模块在开发和生产可能走不同路径，于是出现「本地没问题，上线就炸」的边界情况。

Rolldown 用一套管线同时干两件事。配套换掉的还有：解析和转换从 esbuild 换成 **Oxc**，CSS 压缩从 esbuild 换成 **Lightning CSS**，JS 压缩换成 **Oxc minifier**，CommonJS 处理从 `@rollup/plugin-commonjs` 换成 Rolldown 内置。

<svg viewBox="0 0 680 240" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" role="img" aria-label="Vite 8 前后的打包管线对比">
<rect width="680" height="240" rx="12" fill="#111827"/>
<text x="32" y="40" font-size="17" font-weight="600" fill="#F8FAFC">Vite 8 之前和之后：打包管线</text>
<text x="32" y="83" font-size="13" fill="#94A3B8">Vite 6 / 7</text>
<rect x="130" y="58" width="235" height="42" rx="8" fill="#1E293B" stroke="#334155"/>
<text x="247" y="84" font-size="13" fill="#E2E8F0" text-anchor="middle">esbuild｜开发：预构建 + 转译</text>
<rect x="375" y="58" width="273" height="42" rx="8" fill="#1E293B" stroke="#334155"/>
<text x="511" y="84" font-size="13" fill="#E2E8F0" text-anchor="middle">Rollup｜生产：分块 + 压缩 + 插件</text>
<text x="32" y="163" font-size="13" fill="#94A3B8">Vite 8</text>
<rect x="130" y="138" width="518" height="42" rx="8" fill="#1E293B" stroke="#38BDF8"/>
<text x="389" y="164" font-size="13" fill="#E2E8F0" text-anchor="middle">Rolldown + Oxc + Lightning CSS｜开发与生产同一条管线</text>
<text x="32" y="214" font-size="12" fill="#94A3B8">两条管线时期，同一个模块在开发和生产可能走不同的转换路径。</text>
</svg>

### 官方公布的速度数据

| 团队 | 生产构建变化 |
|---|---|
| Linear | 46s → 6s |
| Ramp | -57% |
| Beehiiv | -64% |
| Mercedes-Benz.io | 最高 -38% |

这些数字来自 rolldown-vite 预览期和 beta 期的真实项目。**要注意它们都是大型代码库。**构建时间里有很大一块是解析和打包模块图，模块数越多收益越明显；一个几百个模块的中台项目，这块本来就不是瓶颈，换引擎拿不到这个比例。

### 三个 BREAKING CHANGES

Vite 8.0.0 的 changelog 里只有三条破坏性变更，但每条都不轻：

1. **`the epic rolldown-vite merge`** —— Rolldown 成为唯一的打包器。
2. **默认浏览器目标再次更新** —— Chrome / Edge 升到 111，Firefox 114，Safari 16.4。
3. **`import.meta.hot.accept` 不再接受 URL** —— 必须传模块 id。

### 配置怎么改

官方做了兼容层，会自动把旧的 esbuild / rollup 选项翻译成 Rolldown / Oxc 的写法。所以很多项目不改配置也能跑。但兼容层是过渡方案，官方明确说这些旧选项**未来会移除**。

要改的映射是这些：

| 旧写法 | 新写法 |
|---|---|
| `build.rollupOptions` | `build.rolldownOptions` |
| `worker.rollupOptions` | `worker.rolldownOptions` |
| `optimizeDeps.esbuildOptions` | `optimizeDeps.rolldownOptions` |
| `esbuild`（顶层转换选项） | `oxc` |
| `esbuild.minify*` | `build.rolldownOptions.output.minify` |
| `esbuild.drop` | `build.rolldownOptions.output.minify.compress.drop*` |
| `transformWithEsbuild()` | `transformWithOxc()` |
| `output.manualChunks`（对象形式） | 已移除 |
| `output.manualChunks`（函数形式） | 已废弃，用 `codeSplitting` |
| `output.watch.chokidar` | `output.watch.watcher` |

有几个是**硬限制**，不是「暂时没实现」：

- `esbuild.supported` 没有对应项，Oxc 不支持。
- 属性混淆相关选项（`mangleProps`、`reserveProps`、`mangleQuoted`、`mangleCache`）不支持。
- Oxc 转换器暂不支持降级原生装饰器。需要的话得挂 `@rolldown/plugin-babel` 或 `@rollup/plugin-swc`。
- `output.format` 的 `'system'` 和 `'amd'` 不再支持。
- 四个 Rollup 钩子被移除：`shouldTransformCachedModule`、`resolveImportMeta`、`renderDynamicImport`、`resolveFileUrl`。

另外，**`esbuild` 不再是 Vite 的直接依赖**，降级成了可选依赖。如果你的插件里用了 `transformWithEsbuild`，得自己把 `esbuild` 加进 `devDependencies`。

### 两个非配置层面的变化

**CommonJS 互操作行为变了。** 从 CJS 模块 `default` 导入时，是否拿到 `module.exports` 本身，现在取决于导入方的文件和 `package.json` 的 `type`。这条可能破坏运行时行为，而且不报构建错误——升级后要专门跑一遍依赖老旧 CJS 包的功能。临时恢复旧行为用 `legacy.inconsistentCjsInterop: true`。

**安装体积涨了约 15 MB。** 其中约 10 MB 来自 `lightningcss`（从可选 peer 依赖变成普通依赖），约 5 MB 来自 Rolldown 的二进制。对本地开发无所谓，对 CI 镜像大小和缓存命中率有影响，值得把 `node_modules` 挂进缓存。

---

## Vite 8.1 之后：把 Rolldown 的能力用起来

Vite 8.1.0 发布于 2026-06-23，是 8.x 线上第一个带新功能的版本。它的 changelog 里没有 BREAKING CHANGES 段落，但有一个需要动手的配置点。

### Bundled Dev Mode（实验性）

这是最有意思的一个。Vite 一直靠「开发期不打捆」取胜，但项目大到一定程度，模块数就成了负担——每个模块单独发一个请求，冷启动和整页刷新都会被拖慢。

Bundled Dev Mode 在开发期也发打捆产物。官方给的测试数据：

- 一个加载 1 万个 React 组件的应用，启动快约 15 倍，整页刷新快约 10 倍。
- Linear 实测冷启动渲染最快提升 3 倍，整页刷新快约 40%，网络请求少 10 倍。

开启方式：

```js
// vite.config.js
export default defineConfig({
  experimental: { bundledDev: true },
})
```

或者命令行加 `--experimental-bundle`。

**现在别在业务项目上开。** 官方明确说目前只覆盖浏览器侧、基础插件和主要功能，第三方插件可能不工作，小众功能可能行为不一致。

### Chunk Import Map（实验性）

这个解决的是一个很具体的问题：产物里 chunk 的 import 语句内嵌了对方的内容 hash，于是改一个 utils chunk，所有 import 它的 chunk 都得跟着改 hash，一层层往上传导到 entry。结果是只改了一行代码，用户要重新下载整条链路。

Chunk Import Map 用 import map 承载映射，hash 不再内嵌进 import 语句，缓存能留下来。它依赖浏览器的 `import.meta.resolve`，老浏览器走 `plugin-legacy`。

### 其他几项

- **Wasm ESM Integration**：可以直接 `import { add } from './add.wasm'`，不用再写 `?init` 后缀。客户端和 SSR 都支持。
- **`import.meta.glob` 支持 `caseSensitive`**：Windows 和 macOS 文件系统大小写敏感性不一致时有用。
- **`html.additionalAssetSources`**：给自定义元素和非标准属性（比如 `data-src-dark`）声明资源引用。
- **CSS 侧在为 Lightning CSS 铺路**：`css.transformer: 'lightningcss'` 已经可用。官方说**考虑在下一个大版本把它设为默认**。这就是下一个 BREAKING 的预告。

### `server.hmr` → `server.ws`

WebSocket 相关选项从 `server.hmr` 挪到了 `server.ws`，`server.hmr` 收窄成开关。

```js
// 旧
server: { hmr: { host: 'localhost', port: 443, clientPort: 443 } }

// 新
server: { ws: { host: 'localhost', port: 443, clientPort: 443 }, hmr: true }
```

改动是机械的：把 `server.hmr` 里除开关以外的字段整块搬到 `server.ws`。旧字段保留了同步，但你迟早要改。

Vite 8.2 和 8.3 是维护线加小功能。8.3 加了 `closeServer` / `closePreviewServer` 钩子。当前维护线是 8.3.x。

---

## 三次升级对构建产物的实际影响

把前面拆开的内容收拢成一张表。**这才是你真正会感知到的部分**：

| 影响 | 出现在 | 具体表现 |
|---|---|---|
| 语法基线抬升 | 7、8 | 降级代码变少，产物体积下降；同时老浏览器支持范围收窄 |
| 依赖预构建换引擎 | 8 | 开发期首屏预热行为可能变化，`optimizeDeps` 相关配置失效 |
| CSS 压缩换实现 | 8 | Lightning CSS 语法降级能力更强，体积可能略有增减 |
| JS 压缩换实现 | 8 | 从 esbuild 换成 Oxc minifier |
| 分块策略 API 变更 | 8 | `manualChunks` 对象形式直接报错，函数形式废弃 |
| 模块解析不再探测格式 | 8 | `package.json` 同时有 `browser` 和 `module` 字段时，严格按 `resolve.mainFields` 顺序 |
| CJS 互操作行为变化 | 8 | 运行时报错风险，构建期不报 |
| 配置文件的打包器也换了 | 8 | `vite.config.js` 本身从 esbuild 换成 Rolldown 打包 |
| 安装体积 +15 MB | 8 | CI 缓存策略要跟着调 |

浏览器基线这一条要单独盯。**从 Vite 5 到 Vite 8，Safari 从 14.0 到 16.4。**如果你的产品有面向旧 iOS 的用户，升级时先确认 `build.target`，别让它吃默认值。

---

## 该怎么跟：按角色分三类

### 业务应用

如果构建时间不痛，**不必为了新特性升级**。Vite 8 的收益和项目模块数近乎成正比，中小项目拿到的主要是「少一层兼容层」和「开发与生产同管线」，不是速度。

要升级的话，别跳版本。5 → 6 → 7 → 8 逐个走，每步跑一次完整构建和一遍关键页面。逐个走的意义在于出问题时你能定位到是哪一版引起的——一次跳三版，出问题只能靠猜。

大项目建议走官方给的渐进路径：**先让 Vite 7 换成 `rolldown-vite` 这个包，再升 Vite 8。**

```json
// 先隔离打包器这一个变量
{ "devDependencies": { "vite": "npm:rolldown-vite@7.x.x" } }
```

跑通之后再升 Vite 8。这样如果出问题，你能确定问题来自 Rolldown 而不是 Vite 8 的其他改动。注意要**锁具体版本**，`rolldown-vite` 是实验包。

### 组件库 / 库模式

重点检查三处：

1. `build.lib.cssFileName`。Vite 5 的产物固定叫 `style.css`，Vite 6 起跟随包名。你的 `package.json` 里 `exports` 指向 `./dist/style.css` 的话要一起改。
2. `build.rollupOptions` → `build.rolldownOptions`。库模式对分块配置更敏感。
3. `output.manualChunks` 的对象形式和函数形式在 Vite 8 里都不可用了。

### 插件作者

要改的是代码不是配置，工作量最大：

- 用了 `transformWithEsbuild` 的，迁移到 `transformWithOxc`，并自己声明 `esbuild` 依赖。
- 在 `load` / `transform` 里把非 JS 模块转成 JS 的，返回值要加 `moduleType: 'js'`。
- 用了 `shouldTransformCachedModule`、`resolveImportMeta`、`renderDynamicImport`、`resolveFileUrl` 这四个钩子的，要重写。
- Rollup 的并行钩子改成串行执行了，依赖并行假设的逻辑要检查。
- `bundle` 对象不再支持 `bundle[foo] = ...` 赋值，也不能跨钩子共享引用，改用 `this.emitFile()`。

有个排查手法很有用：**在 `configResolved` 里把兼容层翻译出来的结果打出来**，看官方到底替你转了什么。

```js
const logConfig = {
  name: 'log-config',
  configResolved(config) {
    console.log(config.optimizeDeps.rolldownOptions, config.oxc)
  },
}
```

升级时如果 Rolldown 报了 `Invalid key` 之类的选项校验警告，用这个办法对照一下，能快速分出是你自己传的还是框架传的。

---

## 我的判断

Vite 7 是这三版里最容易被低估的。它没有新概念、删了几个没人用的 API，看起来像个小版本，但把默认浏览器目标抬到 Safari 16.0 这件事，对业务项目的实际影响比 Vite 8 换引擎更大——换引擎最多让你构建慢一点或快一点，基线抬升是直接改变支持范围。

反过来，Vite 8 是这三版里最容易被高估的。官方列出的构建提速数据很漂亮，但 Linear 那个 46s → 6s 的前提是代码库大到一个量级。一个正常规模的中台项目升级后如果发现构建时间只动了 10%，那不是你配置错了，是这个版本本来就不解决你的问题。

一个可以被反驳的点：我认为**现在还看不到必须升 Vite 8 的理由**，除非你的构建时间已经成了日常痛点，或者你在等 Bundled Dev Mode 成熟。Rolldown 的能力还没被完全用起来（`codeSplitting`、Module Federation 这些都在后面），现在是迁移成本最高、收益半成品的窗口期。

反过来说——如果你手上正好有个在 Vite 5 上、构建要跑三分钟的项目，那 Vite 8 是绕不过去的。这种情况下的正确做法也不是等，而是先把 `rolldown-vite` 挂上去测一遍，用真实数据决定值不值得动。
