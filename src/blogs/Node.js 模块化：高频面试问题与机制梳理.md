---
slug: nodejs-module-system
tag: ['JavaScript', 'Node.js', '前端', '工程化']
date: 2026-10-03
column: 技术研究
detail: 面试被问 CommonJS 和 ESM 的区别，答完「值的拷贝 vs 引用」就被追穿了？按出现频次梳理模块化高频问题，补上 require 解析、循环依赖、互操作这三个最常被漏掉的机制。
---

「CommonJS 和 ES Module 有什么区别？」

这是模块化面试的固定开场。大多数人的答案是四个字：**值的拷贝 vs 引用**。然后面试官追一句「那拷贝发生在什么时候」，就答不上来了。

问题不在记性，在于**只记了结论，没记机制**。而机制这件事在模块化里特别吃亏——因为同一个现象（比如循环依赖拿到 `undefined`）背后是一整套加载流程，你只看别人的总结是补不上的。

这篇文章做两件事：

① 按**出现频次**把模块化的考点排个序，让你知道哪些必须背、哪些可以放弃；

② 把最常被漏掉的三个机制（`require` 的解析流程、循环依赖的两种失败方式、CJS 与 ESM 的互操作）讲透。

文中所有的「预期输出」都在 **Node v22.22.2** 上实跑核对过，不是凭记忆写的。

---

## 先立一个骨架：模块系统只有五个问题

模块化知识点散，是因为大多数人按「有哪些方案」去记。换成按「**每个方案必须回答什么**」去记，散点会自动归位。

任何一个模块系统，都必须回答这五个问题：

| # | 问题 | 各方案的答案 |
|---|---|---|
| ① | **定义** —— 怎么声明一个模块？ | 文件即模块（CJS / ESM）；`define()`（AMD）；包装函数（UMD） |
| ② | **导出** —— 暴露什么、以什么形式暴露？ | 值对象（CJS）；接口名列表 + 绑定（ESM）；返回值（AMD） |
| ③ | **导入** —— 怎么引用别人？ | 函数调用 `require()`；静态声明 `import`；动态 `import()` |
| ④ | **解析与加载** —— 怎么找到它、何时执行、执行几次、互相引用怎么办？ | 见下 |
| ⑤ | **打包与发布** —— 怎么被其他环境消费？ | 产物格式 / `package.json` 入口 / 条件导出 |

其中 ④ 是所有差异的来源，它得再拆成四个子问题：

- **怎么找到它** → 模块解析算法
- **何时执行** → 编译时确定 vs 运行时加载
- **执行几次** → 缓存机制
- **互相引用怎么办** → 循环依赖

**记住这个拆法。** 后面每讲一个区别，你都能把它挂到这四个子问题里的某一个上——而不是当孤立的知识点背。

---

## 三个梯队：先看地图

按真实面试的出现频次，把考点分成三档：

| 序 | 考点 | 频次 | 层次 |
|---|---|---|---|
| 1 | CommonJS 与 ESM 的区别 | ★★★ | 能说出区别 |
| 2 | `require` 的查找与解析机制 | ★★★ | 能解释为什么 |
| 3 | 循环依赖的表现 | ★★★ | 能解释为什么 |
| 4 | `exports` 与 `module.exports` | ★★★ | 能说出区别 |
| 5 | 为什么 ESM 能做 tree shaking | ★★★ | 能解释为什么 |
| 6 | 模块缓存 / 单例语义 | ★★★ | 能说出区别 |
| 7 | ESM 的三阶段加载 | ★★ | 能解释为什么 |
| 8 | 动态 `import()` 与代码分割 | ★★ | 能解释为什么 |
| 9 | CJS ↔ ESM 互操作、双包危害 | ★★ | 踩过坑 |
| 10 | `package.json` 的 `type` / `exports` | ★★ | 踩过坑 |
| 11 | 顶层 await | ★★ | 能解释为什么 |
| 12 | AMD / CMD / UMD | ★ | 知道就行 |
| 13 | 浏览器原生 ESM | ★ | 知道就行 |

**注意这张表的排序逻辑**：面试官问的是「区别」，但真正决定你档位的，是你能不能顺着「为什么」往下走三层。前三题都是同一个套路——问区别，追机制，最后落到工程。

下面按这个顺序展开。

---

## 第一梯队

### 1. CommonJS 与 ESM 的区别

别想到哪说到哪，按这张表答，前四条必答，后四条加分：

| 维度 | CommonJS | ES Module |
|---|---|---|
| **加载时机** | 运行时加载（边走边执行） | 解析时确定依赖，求值时分阶段执行 |
| **导出本质** | 值的**拷贝** | 值的**引用**（live binding） |
| **接口确定时间** | 执行完才有 `module.exports` | 解析阶段就确定导出名的列表 |
| **加载方式** | 同步，阻塞 | 浏览器异步 / Node 三段式 |
| 顶层 `this` | `module.exports` | `undefined` |
| 严格模式 | 默认非严格 | 强制严格 |
| 静态分析 | 基本不可能 | 成立 → **tree shaking 的基础** |
| 循环依赖 | 可能拿到 `undefined` | 可能 TDZ 报错 |

**最容易翻车的是第二行。** 说「值的拷贝」不够，面试官会追问「拷贝发生在什么时候」。答案是：**在导出那一刻**。

下面这组对照实验能说明问题：

```js
// counter.mjs —— ESM
export let count = 0;
export const inc = () => count++;
```

```js
// main.mjs
import { count, inc } from './counter.mjs';
console.log(count);  // 0
inc();
console.log(count);  // 1   ← 活绑定，看到的是最新值
```

```js
// counter.js —— CJS
let count = 0;
module.exports = { count, inc: () => count++ };
```

```js
// main.js
const m = require('./counter');
m.inc();
console.log(m.count);  // 0   ← 即便持有模块对象引用，也读不到新值
```

**这里我原本也以为会输出 `1`**——想着「拿到的是同一个对象引用，改属性当然能看到」。实测是 `0`。

根因是：`module.exports = { count, inc }` 在**导出那一刻**就把 `count` 的**当前值**拷进了导出对象。`inc` 闭包改的是模块内部的局部变量 `count`，而 `module.exports.count` 是导出瞬间的独立副本，**两者从此再无关联**。

所以 CJS 里想读到最新值，只有导出 getter 或访问函数一条路：

```js
let count = 0;
module.exports = {
  get count() { return count; },
  inc: () => count++,
};
// 此时 m.inc(); m.count 才会是 1
```

**准确表述**：

| | 导出的是什么 | 导出方改值后 |
|---|---|---|
| ESM | 模块内部变量的**活绑定** | 导入方立刻看到新值 |
| CJS | 导出那一刻的**快照** | 永远看不到，除非导出 getter / 函数 |

只背「拷贝 vs 引用」四个字，到这里就断了。

---

### 2. `require` 到底怎么找到模块

这题问法很朴素：「`require('./utils')` 里 Node 做了哪些事？」但它是**最容易答漏的一题**，因为流程有四步，多数人只能说出第一步的一半。

<svg viewBox="0 0 680 372" width="100%" style="max-width:680px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="require 解析的四个步骤">
  <defs>
    <marker id="ma1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="680" height="372" rx="14" fill="#111827"/>
  <text x="28" y="34" fill="#94A3B8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">require('./utils') 的四步</text>
  <g>
    <rect x="28" y="50" width="624" height="64" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <circle cx="56" cy="82" r="13" fill="#1D4ED8"/>
    <text x="56" y="87" fill="#FFFFFF" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">1</text>
    <text x="82" y="76" fill="#F1F5F9" font-size="14" font-weight="600" font-family="system-ui, sans-serif">解析请求字符串</text>
    <text x="82" y="98" fill="#94A3B8" font-size="12.5" font-family="system-ui, sans-serif">核心模块 / 路径模块 / 裸标识符 —— 三类走三条不同的路</text>
  </g>
  <path d="M340 118 L340 138" fill="none" stroke="#60A5FA" stroke-width="1.5" marker-end="url(#ma1)"/>
  <g>
    <rect x="28" y="142" width="624" height="64" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <circle cx="56" cy="174" r="13" fill="#1D4ED8"/>
    <text x="56" y="179" fill="#FFFFFF" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">2</text>
    <text x="82" y="168" fill="#F1F5F9" font-size="14" font-weight="600" font-family="system-ui, sans-serif">补全扩展名 / 进入目录</text>
    <text x="82" y="190" fill="#94A3B8" font-size="12.5" font-family="system-ui, sans-serif">X → X.js → X.json → X.node；是目录则读 package.json → index.js</text>
  </g>
  <path d="M340 210 L340 230" fill="none" stroke="#60A5FA" stroke-width="1.5" marker-end="url(#ma1)"/>
  <g>
    <rect x="28" y="234" width="624" height="64" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <circle cx="56" cy="266" r="13" fill="#1D4ED8"/>
    <text x="56" y="271" fill="#FFFFFF" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">3</text>
    <text x="82" y="260" fill="#F1F5F9" font-size="14" font-weight="600" font-family="system-ui, sans-serif">裸标识符：逐级向上找 node_modules</text>
    <text x="82" y="282" fill="#94A3B8" font-size="12.5" font-family="system-ui, sans-serif">从当前目录一路冒泡到文件系统根目录，每一级都重复第 2 步</text>
  </g>
  <path d="M340 302 L340 322" fill="none" stroke="#60A5FA" stroke-width="1.5" marker-end="url(#ma1)"/>
  <g>
    <rect x="28" y="326" width="624" height="40" rx="10" fill="#064E3B" stroke="#059669" stroke-width="1"/>
    <circle cx="56" cy="346" r="13" fill="#047857"/>
    <text x="56" y="351" fill="#FFFFFF" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">4</text>
    <text x="82" y="351" fill="#D1FAE5" font-size="13" font-family="system-ui, sans-serif">以「解析后的绝对路径」为 key 查缓存 —— 命中即返回，未命中才加载</text>
  </g>
</svg>

把每一步拆开：

**第一步：解析请求字符串**（`Module._resolveFilename`）

按标识符分三类：

1. **核心模块** —— `fs`、`path`、`http` 等，命中白名单直接返回。带 `node:` 前缀的（`node:fs`）**强制走核心模块**，可以绕开同名的第三方包
2. **路径模块** —— 以 `./`、`../`、`/` 开头
3. **裸标识符** —— 其余，走 `node_modules` 查找

**第二步：补全与目录解析**

- 若是文件 → 依次尝试 `X` → `X.js` → `X.json` → `X.node`
- 若是目录 → 读 `X/package.json` 的 `exports`（优先）或 `main` → 否则 `X/index.js` → `X/index.json` → `X/index.node`

**第三步：裸标识符的冒泡查找**

从当前文件所在目录开始，**逐级向上**找 `node_modules/X`，直到文件系统根目录。每一级都要重复第二步的解析。全都找不到 → 抛 `MODULE_NOT_FOUND`。

**第四步：缓存**

缓存 key 是**解析后的绝对路径**，不是你在 `require` 里写的那个字符串。

这个细节是后面两个问题的钥匙：

```js
require('./a');      // 和下一行
require('./a.js');   // 解析后是同一个绝对路径
```

实测：两次返回**同一个对象**（`===` 为 `true`），`require.cache` 里 `a.js` **只出现一次**。

同时也解释了删缓存为什么必须带 `require.resolve`：

```js
delete require.cache[require.resolve('./config')];  // ✅ 解析成绝对路径才删得掉
delete require.cache['./config'];                   // ❌ 这个 key 不存在
```

---

### 3. 循环依赖：两者的失败方式不一样

这题的重点**不是「会出问题」**，而是 **CJS 和 ESM 的坏法不同**。

#### CJS：静默给你一个半成品

```js
// a.js
exports.done = false;
const b = require('./b');
console.log('a 里读到 b.done =', b.done);
exports.done = true;
console.log('a done');
```

```js
// b.js
exports.done = false;
const a = require('./a');
console.log('b 里读到 a.done =', a.done);
exports.done = true;
console.log('b done');
```

```js
// main.js
require('./a');
```

实测输出：

```plaintext
b 里读到 a.done = false
b done
a 里读到 b.done = true
a done
```

**机制**：执行 `a.js` 时，Node **先**把还没执行完的 `module` 对象塞进缓存，再开始执行代码。执行到 `require('./b')` 进入 `b.js`，`b` 再 `require('./a')` 时**缓存命中，直接返回那个半成品**——此时 `a.done` 还是初始的 `false`。

#### ESM：直接报错，而且是 TDZ

```js
// a.mjs
import { b } from './b.mjs';
export const a = 'A';
console.log('a 里读到 b =', b);
```

```js
// b.mjs
import { a } from './a.mjs';
export const b = 'B';
console.log('b 里读到 a =', a);
```

实测报错：

```plaintext
ReferenceError: Cannot access 'a' before initialization
```

**机制**：绑定在实例化阶段就建好了（所以 ESM 循环依赖「能工作」），但 `a` 的求值还没发生，处于 **TDZ（暂时性死区）**。求值顺序是后序 DFS：`main → a → b`，`b` 先跑，读 `a` 就撞上了。

**把 `b.mjs` 里那行 `console.log` 删掉，整个程序正常跑完**（实测输出 `a 里读到 b = B`）。这才是「ESM 循环依赖能工作」的准确含义——绑定是活的，但你得等它活过来。

#### 一个细节：你见过的例子可能根本没踩坑

很多讲循环依赖的文章里，两个模块互相 `require` 却「运行正常」。原因通常是**其中一个在函数体内部才用对方**：

```js
// 这样写不会出事
const a = require('./a');
module.exports = function () {
  return a.something();   // 延迟到调用时才读，那时 a 早就执行完了
};
```

函数体内的 `require`（或对已导入变量的使用）不在模块**执行阶段**触发，自然绕开了半个模块的问题。**能解释清楚「为什么这个例子没事」，比背「循环依赖会炸」更能证明你懂。**

**规避手段**：① 延迟 `require`，挪进函数体；② 把共享部分抽到第三个模块；③ ESM 里避免在顶层立即使用循环依赖的变量。检测工具可以用 `madge`。

---

### 4. `exports` 和 `module.exports`

模块包装时，Node 执行的是 `module.exports = exports = {}`，所以**初始时两者指向同一个对象**。

| 写法 | 结果 | 原因 |
|---|---|---|
| `exports.a = 1` | ✅ 有效 | 改的是对象属性 |
| `module.exports.a = 1` | ✅ 有效 | 同上 |
| `module.exports = fn` | ✅ 有效 | **整体替换**，`require` 拿到 `fn` |
| `exports = fn` | ❌ **无效** | 只改了局部变量 |

实测三种写法：

```plaintext
exports.a = 1                              → { a: 1 }
exports.a = 1; module.exports = { b: 2 }   → { b: 2 }    ← a 被整体替换掉了
exports = { a: 1 }                         → {}          ← 空对象，赋值完全无效
```

断链示意：

<svg viewBox="0 0 680 260" width="100%" style="max-width:680px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="exports 与 module.exports 的断链">
  <rect x="0" y="0" width="680" height="260" rx="14" fill="#111827"/>
  <text x="28" y="32" fill="#94A3B8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">exports = { a: 1 } 之后发生了什么</text>
  <text x="28" y="72" fill="#64748B" font-size="12.5" font-family="system-ui, sans-serif">初始状态（同引用）</text>
  <rect x="28" y="86" width="120" height="34" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="88" y="107" fill="#E2E8F0" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">exports</text>
  <rect x="28" y="130" width="120" height="34" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="88" y="151" fill="#E2E8F0" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">module.exports</text>
  <rect x="230" y="108" width="90" height="34" rx="8" fill="#334155" stroke="#475569"/>
  <text x="275" y="129" fill="#F1F5F9" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">{}</text>
  <path d="M148 103 C190 103 195 120 230 122" fill="none" stroke="#34D399" stroke-width="1.5"/>
  <path d="M148 147 C190 147 195 130 230 128" fill="none" stroke="#34D399" stroke-width="1.5"/>
  <line x1="356" y1="60" x2="356" y2="200" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="380" y="72" fill="#64748B" font-size="12.5" font-family="system-ui, sans-serif">赋值之后（断链）</text>
  <rect x="380" y="86" width="120" height="34" rx="8" fill="#7F1D1D" stroke="#B91C1C"/>
  <text x="440" y="107" fill="#FECACA" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">exports</text>
  <rect x="380" y="130" width="120" height="34" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="440" y="151" fill="#E2E8F0" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">module.exports</text>
  <rect x="582" y="86" width="70" height="34" rx="8" fill="#7F1D1D" stroke="#B91C1C"/>
  <text x="617" y="107" fill="#FECACA" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">{a:1}</text>
  <rect x="582" y="130" width="70" height="34" rx="8" fill="#334155" stroke="#475569"/>
  <text x="617" y="151" fill="#F1F5F9" font-size="13" text-anchor="middle" font-family="ui-monospace, monospace">{}</text>
  <path d="M500 103 L582 103" fill="none" stroke="#F87171" stroke-width="1.5"/>
  <path d="M500 147 L582 147" fill="none" stroke="#34D399" stroke-width="1.5"/>
  <text x="380" y="190" fill="#F87171" font-size="12.5" font-family="system-ui, sans-serif">左侧新对象对外不可见，</text>
  <text x="380" y="207" fill="#F87171" font-size="12.5" font-family="system-ui, sans-serif">require 拿到的仍是右边的空对象</text>
  <text x="28" y="232" fill="#64748B" font-size="12.5" font-family="system-ui, sans-serif">结论：想换掉整个导出对象，只能走 module.exports</text>
</svg>

**一个能加分的区分**：`exports` 是 CommonJS **规范**里的东西；`module.exports` 是 **Node 的扩展**——规范并没有规定「能把导出对象整个换掉」。能分清规范与实现，比背对表格更能说明问题。

---

### 5. 为什么 ESM 能做 tree shaking

**原理**：`import` / `export` 是**声明**，路径必须是字符串字面量。所以打包器在**解析阶段**（不执行任何代码）就能构建出完整的依赖图，并知道每个模块导出了哪些名字、被用到了哪些——未被引用的导出可以安全删除。

CJS 反过来，`require` 是**函数调用**，参数可以是任意表达式：

```js
const name = process.env.NODE_ENV === 'prod' ? './a' : './b';
const mod = require(name);              // 依赖了谁？运行时才知道
const fn = require('./x')[someVar];     // 用了哪个属性？运行时才知道
```

不执行代码就无法分析，只能整体打包。

#### 追问：我自己写的库为什么摇不掉？

这是这题最容易翻车的地方。tree shaking 要成立，**四个条件缺一不可**：

| # | 条件 | 说明 |
|---|---|---|
| 1 | 源码是 ESM **且产物也是** | 如果 `package.json` 的 `main` 指向 CJS 产物，使用者引到的就是 CJS |
| 2 | 声明了无副作用 | `"sideEffects": false`，否则打包器不敢删（怕删掉 `import './polyfill'` 这类有效的副作用） |
| 3 | 生产构建 | 开发模式为保留调试信息通常不摇 |
| 4 | 导入方式正确 | `import { pick } from 'lodash-es'` 摇得掉；`import _ from 'lodash'` 摇不掉 |

**还有一个隐藏陷阱**：`export default { a, b, c }` 这种把东西塞进默认导出对象的写法，属性访问是运行时的，打包器无法判断哪个属性被用到，**整个对象都会被保留**。所以优先用具名导出。

同理，`import * as ns from './x'` 也会削弱摇树——打包器不知道你访问了哪个属性，只能保守全留。

---

### 6. 模块缓存与单例语义

- 模块在**执行之前**就写入了 `Module._cache`，key 是解析后的绝对路径
- 因此同一模块在一个进程内**只执行一次**，后续 `require` 直接返回缓存的 `module.exports`
- 由此带来**单例语义**：所有引用方拿到的是同一个对象引用

<svg viewBox="0 0 680 210" width="100%" style="max-width:680px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="模块缓存的单例语义">
  <rect x="0" y="0" width="680" height="210" rx="14" fill="#111827"/>
  <text x="28" y="32" fill="#94A3B8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">三处 require 同一个模块</text>
  <rect x="28" y="56" width="112" height="36" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="84" y="79" fill="#E2E8F0" font-size="12.5" text-anchor="middle" font-family="ui-monospace, monospace">a.js</text>
  <rect x="28" y="106" width="112" height="36" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="84" y="129" fill="#E2E8F0" font-size="12.5" text-anchor="middle" font-family="ui-monospace, monospace">b.js</text>
  <rect x="28" y="156" width="112" height="36" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="84" y="179" fill="#E2E8F0" font-size="12.5" text-anchor="middle" font-family="ui-monospace, monospace">c.js</text>
  <path d="M140 74 C210 74 210 110 268 116" fill="none" stroke="#60A5FA" stroke-width="1.5"/>
  <path d="M140 124 L268 124" fill="none" stroke="#60A5FA" stroke-width="1.5"/>
  <path d="M140 174 C210 174 210 138 268 132" fill="none" stroke="#60A5FA" stroke-width="1.5"/>
  <rect x="268" y="98" width="168" height="52" rx="10" fill="#1E293B" stroke="#475569"/>
  <text x="352" y="119" fill="#F1F5F9" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Module._cache</text>
  <text x="352" y="137" fill="#94A3B8" font-size="11.5" text-anchor="middle" font-family="ui-monospace, monospace">key = 绝对路径</text>
  <path d="M436 124 L500 124" fill="none" stroke="#34D399" stroke-width="1.5"/>
  <rect x="500" y="98" width="152" height="52" rx="10" fill="#064E3B" stroke="#059669"/>
  <text x="576" y="119" fill="#D1FAE5" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">同一个 exports</text>
  <text x="576" y="137" fill="#6EE7B7" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">只执行一次</text>
</svg>

**追问：「改了配置文件为什么不重启不生效？」** → 因为缓存还在。删除要用解析后的绝对路径：

```js
delete require.cache[require.resolve('./config')];
```

**追问：「缓存会内存泄漏吗？」** → 模块对象**永远不会被 GC**（只要 key 还在 `_cache` 里）。长驻进程里动态 `require` 大量文件时要留意。

**追问：「ESM 有缓存吗？」** → 有，但不是 `Module._cache` 这种可删的对象，而是 **Module Record 去重**——同一个 URL 只求值一次，而且**没有官方 API 能删**。这是 CJS 和 ESM 一个经常被忽略的差异。

---

## 第二梯队

这几题不是每场都问，但中高级岗问一次就能分出层次。

### 7. ESM 的三阶段加载

<svg viewBox="0 0 680 250" width="100%" style="max-width:680px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ESM 加载的三个阶段">
  <defs>
    <marker id="ma2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="680" height="250" rx="14" fill="#111827"/>
  <text x="28" y="32" fill="#94A3B8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">ESM 先建全图、再建绑定、最后求值</text>
  <rect x="28" y="56" width="192" height="112" rx="10" fill="#1E293B" stroke="#475569"/>
  <text x="124" y="82" fill="#60A5FA" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">① 构建</text>
  <text x="124" y="106" fill="#CBD5E1" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif">递归解析，生成模块图</text>
  <text x="124" y="126" fill="#64748B" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">每个模块 → Module Record</text>
  <text x="124" y="150" fill="#F87171" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">不执行任何代码</text>
  <path d="M220 112 L252 112" fill="none" stroke="#60A5FA" stroke-width="1.5" marker-end="url(#ma2)"/>
  <rect x="252" y="56" width="192" height="112" rx="10" fill="#1E293B" stroke="#475569"/>
  <text x="348" y="82" fill="#60A5FA" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">② 实例化</text>
  <text x="348" y="106" fill="#CBD5E1" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif">分配槽位，建立绑定</text>
  <text x="348" y="126" fill="#64748B" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">live binding 在这一步落地</text>
  <text x="348" y="150" fill="#FBBF24" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">变量进入 TDZ</text>
  <path d="M444 112 L476 112" fill="none" stroke="#60A5FA" stroke-width="1.5" marker-end="url(#ma2)"/>
  <rect x="476" y="56" width="176" height="112" rx="10" fill="#064E3B" stroke="#059669"/>
  <text x="564" y="82" fill="#6EE7B7" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">③ 求值</text>
  <text x="564" y="106" fill="#D1FAE5" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif">执行模块顶层代码</text>
  <text x="564" y="126" fill="#6EE7B7" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">后序 DFS：依赖先跑</text>
  <text x="348" y="200" fill="#94A3B8" font-size="12.5" text-anchor="middle" font-family="system-ui, sans-serif">CJS 是「边解析边执行」——这个三段式就是两者所有差异的总钥匙</text>
  <text x="348" y="224" fill="#64748B" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif">循环依赖为什么坏法不同，顶层 await 为什么能存在，都从这里推</text>
</svg>

| 阶段 | 做什么 |
|---|---|
| **① 构建** Construction | 从入口递归解析，每个模块生成 Module Record，静态分析 `import` 找出全部依赖，形成**模块图**。**这一阶段不执行任何代码** |
| **② 实例化** Instantiation | 为导出分配内存槽位，把导入方和导出方**连起来**（live binding 在这一步落地），此时被导入的变量处于 **TDZ** |
| **③ 求值** Evaluation | 按**后序 DFS** 执行模块顶层代码，依赖先于父模块 |

**记住这一句**：CJS 是「边解析边执行」，ESM 是「先建全图、再建绑定、最后求值」。这句话能推出一大片结论——循环依赖为什么表现不同、为什么支持顶层 await、为什么 `import` 路径不能是变量。

---

### 8. 动态 `import()` 与代码分割

| | 静态 `import` | 动态 `import()` |
|---|---|---|
| 形式 | **声明**，会被提升 | **函数调用**，返回 `Promise` |
| 路径 | 必须是字符串字面量 | 可以是表达式 |
| 时机 | 参与静态模块图 | 运行时才加载 |
| 工程作用 | 被 tree shaking 消费 | **被 code splitting 消费** |

每次 `import()` 调用都是打包器切分 chunk 的触发点。

#### 先分清四个概念——「动态路由」是个歧义词

这题被追问时最容易翻车的地方在这里：中文说的「动态路由」，指的是两个完全不同的东西。

| 说法 | 实际含义 | 属于哪一层 |
|---|---|---|
| 权限动态路由 | `router.addRoute()`，运行时往路由表塞记录 | 框架 API |
| **路由懒加载** | `component: () => import(...)` | 框架约定 |
| 动态 `import()` | 异步取模块，返回 `Promise` | 语言规范（ES2020） |
| 代码分割 | 把产物切成多个 chunk | 构建工具 |

四者可以两两独立：不用打包器也能 `import()`（浏览器原生就支持）；不用 `import()` 也能做权限路由；不用路由框架也能按需加载任何模块。

**只有「路由懒加载」和动态 `import()` 有关系，而且这个关系比大多数人以为的弱。**

#### 关系拆解：框架定义的是一道「插槽」

路由记录的 `component` 字段接受三种值：

```js
import List from './views/List.vue'                    // ① 静态导入的组件对象
const mods = import.meta.glob('./views/*.vue')          // ③ 打包器生成的函数表

component: List                                         // ① 直接放组件
component: () => import('./views/About.vue')            // ② 工厂函数
component: mods['./views/Docs.vue']                     // ③ glob 返回的那个函数
```

注意 ③：`import.meta.glob()` 返回的**根本不是 `import()` 调用**，而是打包器在构建期生成的一批函数，直接当 `component` 用就行。

**框架消费的是「返回 `Promise` 的函数」这个形状，不是 `import()` 这个语法。** 所以下面这种写法里一个 `import()` 都没有，懒加载照样成立：

```js
{ path: '/x', component: () => Promise.resolve(SomeComponent) }
```

实测（vue-router 4.6.4，用 `createMemoryHistory` 在 Node 里跑真实路由，不需要浏览器）：

```plaintext
导航前 component 是: function
导航后 component 是: 组件对象 name=SomeComponent
工厂被调用次数: 1
```

**能分清「契约」和「实现」，是这题真正的分水岭。**

#### 那懒加载防的是什么？防的是「出现在静态依赖图里」

这是本节最值得带走的一条。

`component: List` 意味着 `router/index.js` 顶部躺着一行 `import List from './List.vue'`——**这是一条静态声明，打包器必须把它并入 router 所在的 chunk**。于是用户哪怕只访问首页，全部页面代码也已经在主包里了。

换成工厂函数之后，`router/index.js` 的静态依赖图里**不再出现任何页面组件**，页面才成为独立 chunk。

**所以「运行时才加载」只是副产品，懒加载真正做的事情是修改静态依赖图。**

<svg viewBox="0 0 680 308" width="100%" style="max-width:680px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="静态导入与工厂函数对打包结果的影响">
  <rect x="0" y="0" width="680" height="308" rx="14" fill="#111827"/>
  <text x="28" y="32" fill="#94A3B8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">component 的两种写法 → 产物完全不同</text>
  <text x="28" y="62" fill="#F87171" font-size="13" font-family="system-ui, sans-serif">① component: BlogList —— 静态导入</text>
  <rect x="28" y="76" width="180" height="48" rx="10" fill="#1E293B" stroke="#334155"/>
  <text x="118" y="96" fill="#E2E8F0" font-size="12" text-anchor="middle" font-family="ui-monospace, monospace">router/index.js</text>
  <text x="118" y="114" fill="#64748B" font-size="11" text-anchor="middle" font-family="ui-monospace, monospace">import List from '…'</text>
  <path d="M208 100 L254 100" fill="none" stroke="#F87171" stroke-width="1.5"/>
  <rect x="264" y="76" width="388" height="48" rx="10" fill="#7F1D1D" stroke="#B91C1C"/>
  <text x="458" y="96" fill="#FECACA" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">两个页面被合并进入口主包</text>
  <text x="458" y="114" fill="#FCA5A5" font-size="11.5" text-anchor="middle" font-family="ui-monospace, monospace">index-BEF1HUCp.js · 1204K</text>
  <path d="M28 148 L652 148" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="28" y="176" fill="#34D399" font-size="13" font-family="system-ui, sans-serif">② component: () =&gt; import(...) —— 工厂函数</text>
  <rect x="28" y="190" width="180" height="48" rx="10" fill="#1E293B" stroke="#334155"/>
  <text x="118" y="210" fill="#E2E8F0" font-size="12" text-anchor="middle" font-family="ui-monospace, monospace">router/index.js</text>
  <text x="118" y="228" fill="#64748B" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">静态图里没有页面组件</text>
  <path d="M208 214 L254 214" fill="none" stroke="#34D399" stroke-width="1.5" stroke-dasharray="5 4"/>
  <rect x="264" y="190" width="388" height="48" rx="10" fill="#064E3B" stroke="#059669"/>
  <text x="458" y="210" fill="#D1FAE5" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">页面各自成为独立 chunk</text>
  <text x="458" y="228" fill="#6EE7B7" font-size="11.5" text-anchor="middle" font-family="ui-monospace, monospace">其余 52 个 chunk · 约 800K</text>
  <text x="28" y="276" fill="#94A3B8" font-size="12.5" font-family="system-ui, sans-serif">真正的区别不是「调用得晚」，而是页面组件有没有出现在静态依赖图里</text>
</svg>

这也解释了为什么 tree shaking 和 code splitting 共享同一个前提：**两者都依赖「不执行代码就能算出依赖图」**。区别只是——前者据此删代码，后者据此切代码。

#### 一个反直觉点：工厂只会被调用一次

实测继续往后走：

```plaintext
第一次导航到该路由：工厂调用 1 次，component 从「函数」变成「组件对象」
离开再回到该路由：  工厂调用仍是 1 次
```

vue-router 会把解析结果**就地写回路由记录**，工厂永远只执行一次。所以「每次导航都重新 `import()` 会不会重复下载」这个担心是多余的——即便工厂真被多次调用，底下还叠着模块缓存。

顺便，没被访问过的路由到那一刻仍然是函数状态，说明解析是纯粹按需的，不会预先解析整张路由表。

#### 面试怎么答

被问到「动态路由和动态 import 什么关系」：

> 这得先分清指哪个。如果是 `addRoute` 那种运行时注册路由，跟动态 `import()` 没关系，那是框架自己的路由表管理。如果是路由懒加载，关系是：框架把 `component` 定义成「组件对象或返回 Promise 的函数」，`import()` 只是最常用的填充物——写 `Promise.resolve` 也行。真正的价值在于把页面组件从 router 的静态依赖图里摘出去，打包器才能切 chunk。

**最后一句才是重点。** 只答「懒加载就是晚点加载」，面试官追一句「那和 `import()` 有什么区别」就穿了。

#### 工程陷阱

**一个体积陷阱**：路径里带变量时，打包器无法确定具体是哪个文件，只能把**整个目录**都打进去：

```js
// 危险：locale 目录下所有文件都会被塞进产物
const mod = await import(`./locales/${lang}.js`);
```

**解法**：改成有限枚举的映射表。

```js
const loaders = {
  zh: () => import('./locales/zh.js'),
  en: () => import('./locales/en.js'),
};
const mod = await loaders[lang]();
```

**注意**：拿到的是模块命名空间对象，默认导出在 `.default` 上，和静态导入的语法糖不一样。

对比一下就很清楚：**vue-router 会替你取 `.default`**（实测把 `export default` 的模块直接放进 `component`，拿到的是组件本身而不是命名空间对象），而你自己手写 `import()` 时必须自己取。

这是「框架替你兜了一层」的典型例子——也就难怪很多人用了几年懒加载，却说不清它和 `import()` 的边界在哪。

---

### 9. 互操作：两个方向的坑

这是日常踩坑最多、也最容易被忽略的一块。

**方向一：ESM 里引 CJS**

- `import pkg from 'cjs-pkg'` → `pkg` 就是整个 `module.exports`（**最稳**）
- `import { foo } from 'cjs-pkg'` → Node 用 `cjs-module-lexer` **静态扫描 CJS 源码猜导出名**。猜得到才行；动态赋值（`module.exports[k] = v`）猜不到

**方向二：CJS 里引 ESM**

- 旧方案：只能 `import()`（异步），同步语境拿不到
- 新方案：**Node 22.12+ / 20.19+ 支持 `require(esm)`**，无需 flag。前提是该 ESM 图里**没有顶层 await**——`require` 必须同步返回

> 实测在 v22.22.2 上可直接 `require()` 一个 `.mjs` 模块。**这条是近两年的变化，老资料里还写着「必须用 `import()`」，面试时标出版本分界是加分项。**

**方向三：双包危害（dual package hazard）**

包用 `exports` 条件导出同时发 CJS 和 ESM 两份产物时，同一个包可能**被加载两次**，模块状态不共享 → 单例变成两个、`instanceof` 失效。

缓解：只发 ESM；或把状态收敛到纯 CJS 里。

**方向四：ESM 里没有的那些变量**

| CJS | ESM 替代 |
|---|---|
| `__dirname` | `import.meta.dirname`（Node 20.11+）或 `path.dirname(fileURLToPath(import.meta.url))` |
| `__filename` | `import.meta.filename` |
| `require` | `createRequire(import.meta.url)` |
| `require.resolve` | `import.meta.resolve()` |

这张表是实操题，写 ESM 时几乎躲不掉。

---

### 10. `package.json` 的 `type` 与 `exports`

**`type`**：决定 `.js` 文件按哪种规范解析。`"module"` → ESM；`"commonjs"` 或缺失 → CJS。

`.mjs` 恒为 ESM，`.cjs` 恒为 CJS，**不受 `type` 影响**。

**入口字段的演进**：`main`（CJS 时代）→ `module`（社区约定，非标准）→ **`exports`（现代标准）**。

**`exports` 的三个关键行为**：

1. **条件导出**，顺序敏感、**首个命中即止**，所以 `default` 必须放最后，`types` 必须放最前
2. **会「关闭」其他入口** —— 一旦写了 `exports`，`pkg/internal.js` 这种深层路径直接报错。这既是封装能力，也是升级时的破坏性变更
3. 可以做**子路径导出**（`"./utils": "./utils.js"`），不写进去就引不到

常用条件：`types` / `import` / `require` / `node` / `browser` / `default`。

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    },
    "./utils": "./dist/utils.mjs"
  }
}
```

**一个相关的加分点**：`imports` 字段（`#` 开头）是 Node 官方的**包内私有别名**，不对外暴露。它和构建工具里的 `@` 别名是对应关系——也正好解释了「本地能跑、`node dist/index.js` 报错」这个经典问题：**别名是构建期的，Node 运行时读不懂**。

---

### 11. 顶层 await

- **为什么 ESM 可以**：回到三阶段——ESM 有独立的求值阶段，模块可以被标记为「异步模块」
- **为什么 CJS 不行**：`require` 必须**同步返回**，无法等待 Promise。这也是 `require(esm)` 要求目标图里没有顶层 await 的同一个原因
- **代价**：一个模块顶层 `await` 一个慢接口，**所有依赖它的模块的求值都要等**；循环依赖 + 顶层 await 可能**死锁**

---

## 第三梯队：知道就行

这三块一次性记忆，不必深挖。

**AMD / CMD / UMD**

- **AMD** —— RequireJS，`define([deps], factory)`，**依赖前置**、异步，为浏览器设计
- **CMD** —— SeaJS（国内），**依赖就近**、延迟执行。和 AMD 的核心差异**不是同步/异步，而是「何时确定依赖」**
- **UMD** —— 不是竞争者，是**兼容层**。依次检测 `typeof define === 'function' && define.amd` → `typeof exports === 'object'` → 挂全局

**浏览器原生 ESM**

`<script type="module">` 自带 `defer` 语义（不阻塞解析、DOM 就绪后按顺序执行）、强制严格模式、严格 MIME 检查（必须 `text/javascript`）、受 CORS 约束、同一 URL 只求值一次。

**裸标识符在浏览器里不行**——需要用 import maps 映射到 URL。这相当于浏览器侧的 `node_modules` 解析。

**演进史（常作为开口题）**

「为什么要模块化？」→ 三个问题：全局污染 / 依赖顺序靠人工维护 / 无法被工具静态分析。

演进线：`script 标签 → IIFE → 命名空间对象 → AMD / CMD → UMD → CommonJS → ES Module`。

一句话概括方向：**粒度从「脚本文件」到「模块」，时机从「运行时猜」到「编译时确定」。**

---

## 反过来：可以放弃的部分

面试复习的性价比，一半在于**敢放弃**。下面几块在模块化话题里基本不会被问：

| 内容 | 处理 |
|---|---|
| 「编译时」的长篇讨论 | 压成一句：**引擎解析源代码、生成 AST 的阶段，不需要执行代码就能确定依赖与接口** |
| Babel 是编译器还是转译器 | 删。除非你投 Babel 团队 |
| ESM 语法全表（九种导入导出组合） | 扫一眼即可。记住有默认导出、命名导出、命名空间导入、副作用导入四类 |
| IIFE 的具体写法 | 一句话带过，不必会默写 |

**判断标准很简单**：一个知识点，如果面试官追问第二层时你答不下去，那它就不是「该背的」，而是「该放弃的」或者「该去跑一遍的」。

---

## 附：七个可以自己跑的实验

文中所有结论我都实跑核对过，代码整理在七个可独立运行的目录里。**先猜输出再跑——先跑后看等于白跑。**

| 目录 | 验证什么 |
|---|---|
| `01-cjs-循环依赖` | 四行输出，看半成品是怎么被拿到的 |
| `02-esm-循环依赖` | TDZ 报错；删掉一行 `console.log` 就正常 |
| `03-live-binding` | ESM `0 → 1`，CJS `0 → 0`（含 getter 的正确写法） |
| `04-exports-断链` | 三种写法的实测结果 |
| `05-require-缓存` | `require('./a')` 与 `require('./a.js')` 同缓存同对象 |
| `06-require-esm` | CJS 里 `require()` 一个 ESM 模块 |
| `07-路由懒加载契约` | 不含 `import()` 的工厂函数也能懒加载；工厂只被调用一次 |

其中 **03 和 07 最值得亲手跑**。03 让我发现「CJS 持有模块对象引用就能读到新值」是错的（实测 `0`）；07 则证明「懒加载 = 动态 import」是错的——**用 `Promise.resolve` 写的工厂函数，一个 `import()` 都没有，照样懒加载**。

这两处都是「以为自己懂了」的地方，只有跑一遍才会暴露。

---

## 最后：三句话记住整篇文章

1. **任何一个模块系统都在回答五个问题**：定义、导出、导入、解析与加载、打包发布。差异全部来自第四个。
2. **ESM 三段式（构建 / 实例化 / 求值）、CJS 边解析边执行**——这一个区别推得出循环依赖、顶层 await、tree shaking 的全部结论。
3. **面试官问「区别」，考的是你能不能顺着「为什么」往下走三层。** 停在结论上，第一层就结束了。
