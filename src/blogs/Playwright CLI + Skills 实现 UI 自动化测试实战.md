---
tag: ["Playwright", "UI 自动化测试", "E2E", "AI", "Skill"]
date: "2026-08-20"
detail: "从 midscene.js 的视觉识别切到 Playwright CLI + 无障碍树：用 @playwright/cli 的 ref 快照稳定定位元素，配合可安装 Skill 把「页面探索 → 用例生成 → 执行 → 自愈」整条 UI 自动化链路交给 AI Agent，token 成本仅为 MCP 的约 1/5，且快、稳、可复用。含登录实战与 Skill 设计。"
---

UI 自动化测试一直有个老大难：要么脚本脆弱、维护成本高，要么 AI 方案慢到没法用。本文分享一套我自己落地验证过的组合拳——**Playwright CLI + 无障碍树 + 可安装 Skill**，把「页面探索 → 用例生成 → 执行 → 自愈」整条链路交给 AI Agent 自动跑，而且快、稳、可复用。

> 思路参考自 Raina 的《基于 playwright-cli +Skills 实现 UI 自动化测试实战案例》（见文末参考链接），并结合官方 `@playwright/cli` 文档做了工程化整理与命令校准。

---

## 一、为什么要从「视觉识别」切到「无障碍树」

早些时候我试过用 **midscene.js** 做 UI 自动化：原理是对页面截图，再靠视觉模型识别元素、然后执行操作。跑下来最大的问题是**慢且不稳**——一次用例下来可能要好几分钟，而且视觉识别本身有概率误差，元素一变就定位失败。

根本原因有两点：

1. **依赖视觉而非结构**：截图识别受分辨率、样式、遮挡影响，定位本质上是「猜」；
2. **每步都重新识别**：没有稳定的元素引用，复用性几乎为零。

而 **Playwright CLI + 无障碍树（Accessibility Tree）** 走的是另一条路：直接读浏览器整理的语义树，每个可交互元素都有一个稳定的 `ref`（如 `e105`）。它不靠「看」，靠「解析 DOM 之上的语义结构」，所以又快又稳，还能一次生成、反复复用。

---

## 二、核心概念

### 2.1 Playwright 是什么

[Playwright](https://playwright.dev/) 是微软出品的 Web 自动化与端到端（E2E）测试框架，用来自动控制浏览器、模拟用户操作、验证页面功能。你可以把它理解成「用代码驱动浏览器」的基础设施。

### 2.2 Playwright CLI 是什么，为什么比 MCP 更省 token

**Playwright CLI**（`@playwright/cli`）是微软开源的一个 Playwright 命令行工具，官方描述是 **"CLI for common Playwright actions"**。它主要用来完成这些事情：

- 打开页面并驱动浏览器
- 记录和生成 Playwright 代码
- 抓取页面快照，获取元素引用
- 截图、导出 PDF
- 配合 coding agent 进行自动化测试和网页操作

换句话说，它更像「给 AI 编码助手准备的浏览器自动化接口」，而不只是给人类工程师手动点击网页的工具。

当前 GitHub README 里把它定位得非常明确：**如果你正在使用 coding agents，CLI 往往比 Playwright MCP 更合适；如果你更需要持久状态、丰富 introspection 和长时间 agentic loop，MCP 仍然有它的价值。**

> 本文的 UI 自动化场景（把「页面探索 → 用例生成 → 执行 → 自愈」整条链路交给 coding agent）正好落在 CLI 最擅长的区间，所以下文以 CLI + Skill 为主线展开。

之前也试过用 **Playwright MCP** 做 UI 自动化。MCP 也是一种扩展 AI 能力的方式，但它会把**完整的工具 Schema**（函数名、参数、类型、描述、枚举……）全部塞进上下文，很快造成 **token 爆炸**。

Playwright CLI 换了个思路：

- 它不是把工具 Schema 灌进上下文，而是**以命令行方式驱动浏览器**；
- 采用 **客户端—守护进程（client-daemon）架构**：浏览器常驻后台，命令通过 Unix socket 发往守护进程，执行后把**快照写入磁盘文件**，只回给模型一个文件路径；
- Agent 需要能力时，再通过**可安装的 Skill** 按需加载，而不是一次性把帮助文本全读进来。

实测对比（同一套 30 步浏览器流程，相同模型）：

| 指标 | Playwright MCP | Playwright CLI | 差异 |
|------|---------------|----------------|------|
| 总 token 消耗 | ~115,000 | ~25,000 | **减少 4.6 倍** |
| 上下文占用 | 200K 窗口的 57% | 12% | 释放 ~45% |
| 单步成本 | ~3,800 token | ~830 token | 4.6 倍 |
| 完成率 | 第 20 步左右退化 | 完整跑完 30 步 | CLI 真正跑完了 |

安装方式（二选一）：

```bash
# 全局安装
npm install -g @playwright/cli@latest

# 或临时使用
npx playwright-cli --help
```

可选：安装浏览器内核（首次使用前）

```bash
playwright-cli install chromium
```

### 2.3 无障碍树（Accessibility Tree）是什么

按 `F12` 打开 DevTools 的 Elements 面板，你看到的是 **DOM**：一堆 `div`、`span`、层层嵌套的节点。

而**无障碍树**是浏览器在 DOM 之上整理的「给辅助技术用的另一棵树」——读屏软件、系统无障碍接口都依赖它。它的每个节点通常带有：

- **role**：按钮、链接、文本框等语义角色；
- **可访问名称**：读屏会念出来的那段文字；
- **state**：是否禁用、是否勾选等状态。

Playwright CLI 会把关键元素抓取下来，用 `ref` 表示。比如用户名输入框在快照里可能是：

```text
- textbox "用户名" [ref=e105]
- textbox "密码" [ref=e108]
- button "登录" [ref=e120]
```

后续所有操作都基于这个 `ref`，**一次快照、稳定复用**，而不是每次重新截图识别。

### 2.4 playwright-cli 核心能力一览

最常用的几类命令：

```bash
# 导航与打开
playwright-cli open https://example.com --headed   # 有头模式打开（看得见浏览器）
playwright-cli goto <url>
playwright-cli go-back / go-forward / reload

# 快照（核心：拿到无障碍树 + 元素 ref）
playwright-cli snapshot
playwright-cli snapshot --filename=after.yaml       # 指定文件名
playwright-cli snapshot --depth=4                    # 限制树深度，控制输出体积

# 交互（用快照里的 ref）
playwright-cli click e120
playwright-cli fill e105 "testuser"                  # 填充输入框
playwright-cli type "Buy groceries"                  # 逐字输入
playwright-cli check e15                             # 勾选
playwright-cli select e20 "option-value"             # 下拉选择
playwright-cli press Enter                           # 键盘
playwright-cli hover e20                             # 悬停

# 截图与导出
playwright-cli screenshot
playwright-cli screenshot --full-page
playwright-cli pdf --filename=page.pdf

# 会话（多实例隔离）
playwright-cli -s=auth open https://app.example.com/login
playwright-cli session-list
```

快照输出示例（accessibility tree）：

```text
### Page
- Page URL: https://example.com/login
- Page Title: 登录

### Snapshot
- textbox "用户名" [ref=e105]
- textbox "密码" [ref=e108]
- button "登录" [ref=e120]
```

> 关键约定：**ref 只在当前快照内有效**，页面一旦变化就会被作废，所以每次导航/操作后都要重新 `snapshot`。优先用 ref 而非 CSS 选择器，因为 ref 指向的是 Agent「刚看到」的确切元素，更可靠。

### 2.5 Playwright CLI 会话管理：多浏览器会话、隔离、持久化与清理

用 Playwright CLI 做自动化，很快就会遇到一个实际问题：**同一时间能不能开多个互不干扰的浏览器会话？** 答案是可以——而且 CLI 已经把这套「命名会话」机制做得很直接。下面按官方 `session-management` 参考文档，整理最常用的几块：命名会话、会话隔离、持久化 profile、并发使用与清理命令。

#### 命名会话：`-s` 参数

官方建议用 `-s` 隔离不同的浏览器上下文：

```bash
# 浏览器 1：登录流程
playwright-cli -s=auth open https://app.example.com/login

# 浏览器 2：匿名访问（独立的 cookies、storage）
playwright-cli -s=public open https://example.com

# 命令按会话隔离，互不影响
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=public snapshot
```

> 不同 `session` 名对应不同浏览器上下文。可以把 `auth` 用在登录流程、`public` 用在匿名访问，二者**不会共用 cookies 或本地状态**。

#### 会话隔离了什么

每个浏览器会话都会独立维护以下状态，彼此之间完全隔离：

- Cookies
- LocalStorage / SessionStorage
- IndexedDB
- Cache
- 浏览历史
- 已打开标签页

这意味着在 `auth` 会话里登录了某站，并不会自动影响 `public` 会话。做**多账号测试、登录态校验、匿名对比**时，这一点尤其重要。

#### 会话相关命令

```bash
# 列出所有会话
playwright-cli list

# 结束会话（关闭浏览器）
playwright-cli close                  # 结束默认浏览器
playwright-cli -s=mysession close     # 结束命名浏览器

# 结束所有会话
playwright-cli close-all

# 强制杀掉所有守护进程（处理残留 / 僵尸进程）
playwright-cli kill-all

# 删除会话用户数据（profile 目录）
playwright-cli delete-data                 # 删除默认浏览器数据
playwright-cli -s=mysession delete-data    # 删除命名浏览器数据
```

可以把它们分成三类操作：

- `list`：查看当前有哪些会话；
- `close` / `close-all` / `kill-all`：结束会话或清理卡住的浏览器进程；
- `delete-data`：删除某会话对应的用户数据目录。

> 一般先用 `close` 结束浏览器；若已出现残留进程或僵尸进程，再用 `kill-all` 更合适。

#### 用环境变量设置默认会话

如果不想每条命令都重复写 `-s=mysession`，官方还提供了环境变量方式：

```bash
export PLAYWRIGHT_CLI_SESSION="mysession"
playwright-cli open example.com  # 自动使用 mysession，无需再写 -s
```

#### 持久化浏览器 profile

默认情况下，浏览器 profile **只保存在内存里**。若希望持久化到磁盘，需要在 `open` 时加 `--persistent`：

```bash
# 持久化 profile（自动生成存放位置）
playwright-cli open https://example.com --persistent

# 持久化 profile 到自定义目录
playwright-cli open https://example.com --profile=/path/to/profile
```

这个能力适合需要**长期复用登录态、本地缓存或扩展调试环境**的场景。反复调试同一站点时，持久化 profile 往往比每次从零开始更高效。

#### 常见模式：并发抓取

参考文档给了一个典型的并发抓取例子，每个站点都跑在独立会话里，互不污染本地状态：

```bash
#!/bin/bash
# 并发抓取多个站点

# 同时启动多个浏览器
playwright-cli -s=site1 open https://site1.com &
playwright-cli -s=site2 open https://site2.com &
playwright-cli -s=site3 open https://site3.com &
wait

# 各自采集快照
playwright-cli -s=site1 snapshot
playwright-cli -s=site2 snapshot
playwright-cli -s=site3 snapshot

# 统一清理
playwright-cli close-all
```

#### 常见模式：A/B 测试会话

同时对比不同实验版本时，两个变体在独立会话里运行，截图和状态检查也更容易分开管理：

```bash
# 测试不同用户体验
playwright-cli -s=variant-a open "https://app.com?variant=a"
playwright-cli -s=variant-b open "https://app.com?variant=b"

# 对比截图
playwright-cli -s=variant-a screenshot
playwright-cli -s=variant-b screenshot
```

#### 官方最佳实践

1. **用有语义的会话名**

   ```bash
   # 推荐：名字直接表达用途
   playwright-cli -s=github-auth open https://github.com
   playwright-cli -s=docs-scrape open https://docs.example.com

   # 避免：无意义的泛化命名
   playwright-cli -s=s1 open https://github.com
   ```

2. **用完及时清理**

   ```bash
   # 结束单个会话
   playwright-cli -s=auth close
   playwright-cli -s=scrape close

   # 或一次性全关
   playwright-cli close-all

   # 浏览器无响应或残留僵尸进程时
   playwright-cli kill-all
   ```

3. **删除陈旧浏览器数据**

   ```bash
   # 删掉不再使用的旧会话数据，释放磁盘空间
   playwright-cli -s=oldsession delete-data
   ```

#### 小结

- `-s=<name>` 用来创建并使用独立浏览器会话；
- 不同会话之间隔离 cookies、各类存储、缓存、历史记录和标签页；
- `close-all` 适合统一关闭，`kill-all` 适合处理异常残留进程；
- `--persistent` 把 profile 落盘，适合长期复用状态；
- 会话名尽量语义化，旧数据定期清理。

如果你工作流里已经有登录态复用、多账号并行、A/B 对比或批量抓取需求，那么会话管理基本是 Playwright CLI 里最值得先掌握的一块能力。

### 2.6 Playwright CLI storage state：保存与读取登录态

上一节的持久化 profile（`--persistent`）是把**整个浏览器状态**落盘，适合长期复用。但如果你只想**单独保存「登录态」（cookies + 本地存储）**，并在后续会话里一键恢复，用 `storage-state` 更轻量、更可控。

这个能力特别适合「**先登录一次 → 之后所有用例直接带登录态跑**」的自动化场景：避免每个用例都重复走登录流程，也避免把账号密码写进脚本（呼应 3.3 里的 `{{password}}` 占位思路）。

#### 保存登录态

在已登录的会话里，把当前 cookies 与本地存储导出成 JSON：

```bash
# 在当前会话登录后，保存登录态
playwright-cli storage-state save auth.json
```

> `auth.json` 同时包含 cookies、localStorage、sessionStorage 等可序列化状态。建议把它当作敏感文件，用环境变量或密钥注入路径，避免明文提交到仓库。

#### 带登录态启动新会话

下次直接用 `--storage-state` 载入保存的状态，浏览器打开即处于登录态：

```bash
# 读取已保存的登录态，免登录直接进业务页
playwright-cli --storage-state auth.json open https://app.example.com/dashboard
```

这样后续用例不必再重复 `fill` 用户名密码 + `click 登录`，直接从已登录页面开始 `snapshot` 探索，整条链路更快。

#### 单独读取各类存储

除了整体保存，CLI 也支持单独查看当前会话里的各类存储，方便调试与断言：

```bash
# 读取 Cookies
playwright-cli cookies

# 读取 LocalStorage
playwright-cli local-storage

# 读取 SessionStorage
playwright-cli session-storage

# 读取 IndexedDB
playwright-cli indexed-db
```

这几条在排查「登录态为什么没生效」「某个 token 存到了哪里」时很实用——比如对比 `--storage-state` 恢复前后的 `cookies` 差异，就能确认登录态是否被正确使用。

#### 小结

- `storage-state save <file>`：把当前会话的登录态（cookies + 本地存储）导出为 JSON；
- `--storage-state <file>`：启动时载入保存的登录态，免去重复登录；
- `cookies` / `local-storage` / `session-storage` / `indexed-db`：分别读取对应存储，便于调试与断言；
- 适合「登录一次、多用例复用」的自动化，比 `--persistent` 更轻量、更聚焦。

---

## 三、实战案例：登录流程 UI 自动化

下面用一个最常见的「用户登录」场景，串起整条链路。

### 3.1 环境准备

1. 安装 Node.js（Playwright CLI 的前置）；
2. 安装 CLI：`npm install -g @playwright/cli@latest`；
3. 安装浏览器内核：`playwright-cli install chromium`。

### 3.2 Skill 设计：把自动化逻辑写进 Skill

这套方案的核心思想是——**所有 UI 自动化的逻辑都写在 Skill 里**，而不是散落在每次对话的 prompt 中。这样复用稳定、可版本管理、可分享。

建议拆成三个 Skill（1 个辅助 + 2 个主流程）：

| Skill | 职责 |
|-------|------|
| `ui-test-gen` | 页面探索 + 生成 JSON 用例 |
| `ui-test-exec` | 执行 JSON 用例 + 脚本自愈 |
| `json-testcase-to-excel`（辅助） | 把 JSON 用例转成 Excel，便于人工评审 |

一个最小可用的 `ui-test-gen` 的 `SKILL.md` 骨架：

```markdown
---
name: ui-test-gen
description: 根据页面 URL 与需求文档，调用 playwright-cli 做无障碍快照，
  自动探索页面并生成结构化 JSON UI 测试用例。
---

# UI 测试用例生成

## 流程
1. 用有头模式打开目标页面：
   `playwright-cli open <url> --headed`
2. 采集无障碍快照：
   `playwright-cli snapshot --filename=step1.yaml`
3. 根据需求文档逐步骤定位元素 ref，构造用例 JSON。
4. 遇到页面跳转/弹窗，重新 snapshot 再继续。
5. 输出 `ui-testcase.json`。

## 输出格式
见下文章节「用例结构」。
```

### 3.3 页面探索与用例编写

使用时，先给 Agent 提供：

- **项目页面地址**（URL）；
- **需求文档或详细测试用例**（可选但强烈建议）。

输入信息越完整，大模型生成的用例越精准、覆盖越全面。

发给 Agent 后，它会**自动执行**：

1. 调用 `playwright-cli open <url> --headed`，用有头模式打开浏览器和界面；
2. 做**无障碍快照采集**——对每一个发生变化的页面都采集一次，用于定位元素；
3. 注意：这里**不是视觉识别**，而是对 DOM 解析，所以一次生成、后续可复用；
4. 收集完成后，产出一个 JSON 文件，作为 UI 自动化用例。

**用例结构（建议）**：

```json
{
  "name": "用户登录流程",
  "url": "https://example.com/login",
  "steps": [
    { "id": 1, "action": "goto", "target": "https://example.com/login" },
    { "id": 2, "action": "fill", "ref": "e105", "value": "testuser" },
    { "id": 3, "action": "fill", "ref": "e108", "value": "{{password}}" },
    { "id": 4, "action": "click", "ref": "e120" },
    { "id": 5, "action": "expect", "type": "url", "value": "https://example.com/dashboard" }
  ]
}
```

> 真实项目里 `ref` 应由 Skill 在探索阶段动态写入；这里写出来是为了说明结构。`{{password}}` 这类占位符可用环境变量或密钥注入，避免明文落库。

### 3.4 Excel 可视化（可选）

这一步非必须，主要用于**生成 Excel 用例便于可视化阅读和评审**。对 AI 来说，JSON 更结构化、可扩展，是更优的载体。

输入：

```text
/json-testcase-to-excel + ui-testcase.json
```

输出一份 Excel 用例表，可以拿去给产品或测试同学评审，确认 AI 要执行的步骤是否 OK。

### 3.5 执行用例

输入：

```text
/ui-test-exec + ui-testcase.json
```

Agent 会：

1. 逐条执行 JSON 用例（内部仍是 `open / snapshot / fill / click / expect` 这一套）；
2. 在执行**成功或中断**时都做记录；
3. 遇到**基础验证码图片**，能自己识别并自动填入验证（这是 Skill 里加的能力）；
4. 遇到复杂到 AI 也解不出的验证码，会**暂停**下来交给你人工处理；
5. **脚本自愈**：若某元素识别错误，会重新生成快照、修正元素引用、再重新执行。

一段真实命令流长这样：

```bash
# 1. 有头模式打开登录页
playwright-cli open https://example.com/login --headed

# 2. 采集快照，拿到 ref
playwright-cli snapshot --filename=login.yaml

# 3. 填充并登录
playwright-cli fill e105 "testuser"
playwright-cli fill e108 "secret"
playwright-cli click e120

# 4. 验证跳转
playwright-cli snapshot --filename=after-login.yaml

# 5. 留证 + 收尾
playwright-cli screenshot --filename=result.png
playwright-cli close
```

### 3.6 一段最小可跑的 Skill 执行脚本示例

如果你不想等 Agent 自己发挥，也可以把执行逻辑固化成一个脚本，让 Skill 直接调用：

```bash
#!/usr/bin/env bash
set -e
playwright-cli open "$1" --headed
playwright-cli snapshot --filename=step.yaml
# 下面这些 ref 来自 step.yaml，真实场景由 Skill 解析后填充
playwright-cli fill e105 "$USERNAME"
playwright-cli fill e108 "$PASSWORD"
playwright-cli click e120
playwright-cli snapshot
playwright-cli screenshot --filename=result.png
playwright-cli close
```

---

## 四、方案价值与总结

这套方案跑下来，体感上的几个明显收益：

- **基于快照定位，稳定可复用**：元素靠 `ref` 引用，不是每次重新截图识别；
- **用例不足时能自己探索补充**：Agent 会主动采集页面快照来补全步骤；
- **速度快**：无障碍树解析远快于视觉识别，token 成本也只有 MCP 的约 1/5；
- **能识别基础验证码并自动输入**：Skill 里注入的能力；
- **脚本自愈**：元素识别错了会重新快照、修正、重跑。

和另外两条路线的对比：

| 维度 | midscene.js（视觉识别） | Playwright MCP | Playwright CLI + Skills |
|------|------------------------|----------------|--------------------------|
| 元素定位 | 截图 + 视觉识别 | 无障碍树 | 无障碍树 |
| 速度 | 慢（分钟级/用例） | 快 | 快 |
| 上下文成本 | 中 | 高（token 爆炸） | 低（4.6x 优于 MCP） |
| 可复用性 | 低 | 中 | 高（Skill + JSON 用例） |
| 自愈能力 | 弱 | 依赖实现 | 内置 |

**适用边界**：基础验证码、标准表单、常规跳转都能稳稳覆盖；但遇到复杂图形验证码、强动态渲染或反爬严格的页面，仍需要人工介入或配合专用打码/接口方案。

---

## 五、参考

- 思路来源：Raina《基于 playwright-cli +Skills 实现 UI 自动化测试实战案例》
  https://kyo6.github.io/vue3-blog/blog/29
- 官方文档：Playwright CLI Introduction https://playwright.dev/agent-cli/introduction
- 快照机制：Playwright CLI Snapshots https://playwright.dev/agent-cli/snapshots
- 会话管理：Playwright CLI 会话管理（多浏览器会话、隔离、持久化与清理）https://knightli.com/2026/04/15/playwright-cli-session-management/
