## CSS 媒体特性 prefers-color-scheme

`prefers-color-scheme` 是一个 CSS 媒体特性，用于检测用户是否在操作系统或浏览器层面设置了偏好的主题色（亮色或暗色）。它可以帮助你为用户提供符合其系统偏好的网页显示模式。

### 取值说明

该特性支持以下三个关键字值：

- no-preference
  表示系统无法得知用户的主题色偏好。这通常意味着用户的操作系统不支持此功能，或者用户尚未进行相关设置。在布尔值上下文中，它的执行结果为 false。
- light
  表示用户已明确选择使用浅色（亮色）主题的界面。
- dark
  表示用户已明确选择使用深色主题的界面。

### 💡 实际应用示例

你可以使用 @media 查询来根据用户的偏好应用不同的样式。

1. 引入不同的主题样式表

在 HTML 中，可以根据媒体查询加载对应的 CSS 文件：

```html
<!-- 默认或浅色主题 -->
<link
  rel="stylesheet"
  href="light-theme.css"
  media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"
/>
<!-- 深色主题 -->
<link rel="stylesheet" href="dark-theme.css" media="(prefers-color-scheme: dark)" />
```

2. 在 CSS 中直接定义样式

你也可以在同一个 CSS 文件中使用媒体查询来编写不同的规则：

```css
/* 默认样式 (浅色模式) */
body {
  background-color: white;
  color: black;
}

/* 当用户偏好深色模式时 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: black;
    color: white;
  }
}
```

3. 结合 JavaScript 进行更复杂的逻辑

你可以结合 JavaScript 来监听用户偏好变化，或与用户的手动切换功能结合。

```js
// 检查当前用户的偏好
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

if (colorSchemeQuery.matches) {
  // 用户偏好深色模式
  document.body.classList.add('dark-theme')
} else {
  // 用户偏好浅色模式或无偏好
  document.body.classList.add('light-theme')
}

// 监听用户系统偏好变化
colorSchemeQuery.addEventListener('change', (e) => {
  if (e.matches) {
    // 切换到深色
    document.body.classList.replace('light-theme', 'dark-theme')
  } else {
    // 切换到浅色
    document.body.classList.replace('dark-theme', 'light-theme')
  }
})
```

### 🛠️ 开发者工具

在开发和调试时，你不必反复修改操作系统的设置。主流浏览器的开发者工具（如 Microsoft Edge 和 Chrome）都提供了模拟功能。

你可以在 DevTools 的 “Rendering” (呈现) 面板中，找到 “Emulate CSS media feature prefers-color-scheme” (模拟 CSS 媒体特性 prefers-color-scheme) 选项，然后手动切换 light、dark 或 no preference 来实时查看网页的显示效果。

## 分析Update如何根据用户偏好设置切换网页主题

```js
function update() {
  const isDark =
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark', 'changing-theme')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#0B1120')
  } else {
    document.documentElement.classList.remove('dark', 'changing-theme')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#f8fafc')
  }
  window.setTimeout(() => {
    document.documentElement.classList.remove('changing-theme')
  })
}
```

这段代码定义了一个名为 update 的函数，其核心作用是根据用户的偏好设置网页的主题（亮色或暗色模式），并同步更新页面的视觉样式和浏览器 UI。

它巧妙地结合了用户本地存储的设置和系统默认偏好来决定最终的主题。以下是逐行解析：

### 🧠 逻辑判断部分

```js
const isDark =
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
```

这段代码决定了当前应该使用暗色模式 (isDark 为 true) 还是亮色模式。

它遵循以下优先级逻辑：

1. 用户手动设置优先：首先检查 localStorage 中是否存有用户之前选择的主题 (localStorage.theme)。如果用户明确选择了 'dark'，则直接使用暗色模式。
2. 系统偏好作为默认值：如果用户从未手动选择过主题（即 localStorage 中没有 theme 这个键），则退回到检查用户的操作系统设置。通过 window.matchMedia 调用 prefers-color-scheme 媒体查询，如果系统设置为暗色，则使用暗色模式。
3. 其他情况：如果用户手动设置了非暗色（如亮色），或者系统偏好是亮色，则 isDark 为 false，使用亮色模式。

### 🎨 样式应用部分

```js
if (isDark) {
  document.documentElement.classList.add('dark', 'changing-theme')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', '#0B1120')
} else {
  document.documentElement.classList.remove('dark', 'changing-theme')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', '#f8fafc')
}
```

根据 isDark 的布尔值，执行不同的 DOM 操作：

- 添加/移除 CSS 类：
  - 如果是暗色模式，给 HTML 根元素 () 添加 dark 和 changing-theme 类。
  - 如果是亮色模式，从 HTML 根元素上移除这两个类。
  - 注：通常 CSS 中会定义 .dark { ... } 规则来改变颜色主题，而 changing-theme 可能用于处理过渡动画或防止闪烁。
- 修改主题色 Meta 标签：
  - 查找页面中的 <meta name="theme-color"> 标签（该标签用于控制移动端浏览器 UI 的颜色，如 Chrome 的地址栏）。
  - 如果是暗色模式，将其颜色值设置为深灰色 (#0B1120)。
  - 如果是亮色模式，将其颜色值设置为浅灰色/白色 (#f8fafc)。

### ⏳ 动画处理部分

```js
window.setTimeout(() => {
  document.documentElement.classList.remove('changing-theme')
}, 0)
```

这是一个微小的性能技巧：

- 它使用 setTimeout（延迟为 0 毫秒）将移除 changing-theme 类的操作放入浏览器的任务队列末尾。
- 目的：确保在主题切换的样式（如背景色变化）生效后，再移除 changing-theme 类。这通常用于触发 CSS 过渡动画，或者防止在快速连续调用 update() 时出现不必要的视觉闪烁。一旦样式应用完毕，changing-theme 类就会被清除，让页面进入稳定状态。

### 📌 总结

这个 update 函数实现了一个标准的暗色模式切换逻辑：

1. 优先尊重用户在网页上的手动选择。
2. 如果用户没选，则跟随操作系统（Windows/Mac）的深色/浅色模式设置。
3. 同步更新页面的 CSS 类和浏览器 UI 颜色。
