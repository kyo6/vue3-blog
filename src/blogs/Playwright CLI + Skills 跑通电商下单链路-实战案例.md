---
tag: ["Playwright", "UI 自动化测试", "E2E", "实战案例", "Skill"]
date: "2026-08-20"
detail: "承接《基于 Playwright CLI + Skills 实现 UI 自动化测试实战》，本文是第二个实战案例：在登录态复用的基础上，用 @playwright/cli 的 ref 快照 + 可安装 Skill 跑通电商「搜索 → 加购 → 结算 → 下单」端到端链路，重点拆解跨页面 ref 失效重快照、金额/数量动态断言、auth 状态复用与脚本自愈。"
---

在[上一篇](./Playwright%20CLI%20+%20Skills%20实现%20UI%20自动化测试实战.md)里，我们用登录流程讲清了整套方法：**Playwright CLI + 无障碍树 + 可安装 Skill**，把「页面探索 → 用例生成 → 执行 → 自愈」交给 AI Agent。

原文也预告过：登录只是开胃菜，**第二个案例会用实际项目中「稍复杂的业务」来讲**。本文就补上这个案例——一条电商「搜索商品 → 加入购物车 → 结算 → 提交订单」的端到端链路。它的复杂度刚好够味：

- 跨多个页面，每一步都要**重新快照**（ref 会失效）；
- 要断言**动态内容**（价格、购物车数量、下单结果文案）；
- 依赖**登录态**，需要复用而不是每次重登；
- 会出现**分支**（库存不足、登录失效），考验自愈。

下面全程用上一篇定义的 `ui-test-gen` / `ui-test-exec` 两个 Skill 来跑。

---

## 一、业务场景与测试范围

被测对象：一个标准电商站 `https://shop.example.com`。

| 步骤 | 操作 | 关键断言 |
|------|------|----------|
| 1 | 打开首页，搜索「无线机械键盘」 | 进入搜索结果页 |
| 2 | 点击第一个商品进入详情 | 详情页标题含关键词 |
| 3 | 点击「加入购物车」 | 出现「已加入购物车」提示 |
| 4 | 进入购物车页 | 商品数量为 1 |
| 5 | 点击「结算」并填写收货地址 | 进入订单确认页 |
| 6 | 提交订单 | URL 跳到 `/order/success`，文案含「下单成功」 |

前置条件：**已登录**。与其在用例里重复登录，不如复用第一篇登录案例产出的 `auth.json`（Playwright CLI 的 `state-save` / `state-load`）。

---

## 二、用例生成：ui-test-gen 探索 + 产出 JSON

把页面 URL 和上面的测试范围丢给 `ui-test-gen` Skill，它会：

1. `playwright-cli open https://shop.example.com --headed` 有头打开；
2. 在首页 `snapshot`，定位搜索框 ref；
3. 填词、回车、进结果页 → **再次 snapshot**（页面变了，ref 全作废）；
4. 逐页探索，把每一步的 ref 与断言写进 JSON。

产出的用例（`ui-testcase-order.json`）长这样：

```json
{
  "name": "电商下单全链路",
  "url": "https://shop.example.com",
  "precondition": { "authState": "auth.json" },
  "steps": [
    { "id": 1, "action": "goto", "target": "https://shop.example.com" },
    { "id": 2, "action": "fill", "ref": "e12", "value": "无线机械键盘" },
    { "id": 3, "action": "press", "value": "Enter" },
    { "id": 4, "action": "click", "ref": "e30", "desc": "第一个搜索结果" },
    { "id": 5, "action": "snapshot", "desc": "进入详情页，刷新 ref" },
    { "id": 6, "action": "click", "ref": "e45", "desc": "加入购物车" },
    { "id": 7, "action": "expect", "type": "text", "value": "已加入购物车" },
    { "id": 8, "action": "click", "ref": "e50", "desc": "去购物车" },
    { "id": 9, "action": "expect", "type": "count", "ref": "e60", "value": "1", "desc": "购物车商品数量=1" },
    { "id": 10, "action": "click", "ref": "e70", "desc": "结算" },
    { "id": 11, "action": "fill", "ref": "e80", "value": "北京市朝阳区 xx 路 1 号" },
    { "id": 12, "action": "click", "ref": "e90", "desc": "提交订单" },
    { "id": 13, "action": "expect", "type": "url", "value": "https://shop.example.com/order/success" },
    { "id": 14, "action": "expect", "type": "text", "value": "下单成功" }
  ]
}
```

> 注意第 5 步的 `snapshot`：详情页一加载，首页的 `e30` 等 ref 立即失效，必须重新快照拿到详情页的新 ref（如 `e45`），后续点击才能命中。**这是跨页面流程最容易踩的坑。**

---

## 三、关键难点与解法

### 3.1 跨页面 ref 失效 → 每步重快照

无障碍树的 ref 只在「当前快照」内有效。凡是发生导航（回车搜索、点进详情、去购物车、提交订单），都要在执行下个交互前重新 `snapshot`。`ui-test-exec` 的正确姿势是：**先 snapshot 拿 ref，再基于 ref 操作**，而不是一次性把整条链路的 ref 都记死。

### 3.2 动态内容断言

固定 ref 好点，但「购物车数量=1」「总价正确」「文案含『下单成功』」是动态的，得靠 `expect`：

```bash
# 断言购物车数量（取 e60 的文本，应等于 "1"）
playwright-cli snapshot --filename=cart.yaml
# 由 Skill 解析 cart.yaml 中 e60 的文本并比对
```

`expect` 支持几种类型：`url`（地址跳转）、`text`（页面文案）、`count`（某元素的重复次数 / 文本数值）、`visible`（元素可见）。

### 3.3 登录态复用，不重复登录

用第一篇登录案例保存的 `auth.json`，下单链路直接带状态启动：

```bash
# 加载已保存的登录态，避免每次重登
playwright-cli state-load auth.json
playwright-cli open https://shop.example.com --headed
```

如果没保存过，先跑一遍登录并落盘：

```bash
playwright-cli open https://shop.example.com/login --headed
playwright-cli fill e105 "testuser"
playwright-cli fill e108 "secret"
playwright-cli click e120
playwright-cli state-save auth.json   # 存登录态，后续复用
playwright-cli close
```

### 3.4 分支与自愈

真实业务里会冒出意外，`ui-test-exec` 靠 Skill 里的自愈逻辑兜住：

- **库存不足**：点「加入购物车」后弹「已售罄」而非「已加入购物车」→ Skill 识别到 `expect` 失败，重新快照、改选同页第二个商品再试；
- **登录失效**：打开首页发现被重定向到登录页 → Skill 检测到 URL 不符预期，自动调用 `state-load` 重试，仍失败则**暂停交人工**；
- **ref 漂移**：某次快照里「结算」按钮的 ref 从 `e70` 变成 `e73` → Skill 按「按钮文本=结算」重新定位，改写用例里的 ref 并继续。

这种「识别错了就重快照、修正、重跑」的能力，正是 CLI + Skill 方案比写死脚本强的地方。

---

## 四、执行：ui-test-exec 真实命令流

发给 Agent：`/ui-test-exec + ui-testcase-order.json`。它内部展开的命令流（节选）形如：

```bash
# 0. 复用登录态
playwright-cli state-load auth.json

# 1. 首页搜索
playwright-cli open https://shop.example.com --headed
playwright-cli snapshot --filename=s1.yaml
playwright-cli fill e12 "无线机械键盘"
playwright-cli press Enter

# 2. 结果页 → 详情（重快照）
playwright-cli snapshot --filename=s2.yaml
playwright-cli click e30

# 3. 详情页（再重快照）
playwright-cli snapshot --filename=s3.yaml
playwright-cli click e45          # 加入购物车
playwright-cli snapshot --filename=s4.yaml   # 校验「已加入购物车」

# 4. 购物车 → 结算
playwright-cli click e50
playwright-cli snapshot --filename=s5.yaml   # 校验数量=1
playwright-cli click e70          # 结算

# 5. 填写地址 → 提交
playwright-cli snapshot --filename=s6.yaml
playwright-cli fill e80 "北京市朝阳区 xx 路 1 号"
playwright-cli click e90          # 提交订单

# 6. 结果断言 + 留证
playwright-cli snapshot --filename=result.yaml   # 校验 URL / 文案
playwright-cli screenshot --filename=order-success.png
playwright-cli close
```

执行过程中，Skill 会把每一步的成功/失败、实际 ref、断言结果写回一个执行日志（如 `ui-testcase-order.result.json`），方便回看哪步出了问题。

---

## 五、可视化评审（可选）

拿 `ui-testcase-order.json` 跑 `/json-testcase-to-excel`，导出一份 Excel 用例表，发给产品或测试同学评审：AI 要执行的步骤、每步的期望结果是否对齐需求。对 AI 而言 JSON 更顺手，对人也更直观。

---

## 六、与登录案例的复杂度对比

| 维度 | 案例一：登录 | 案例二：下单链路（本文） |
|------|------------|--------------------------|
| 页面数 | 1~2 | 5+（首页/结果/详情/购物车/订单） |
| ref 管理 | 单次快照即可 | 每步重快照，频繁失效 |
| 断言 | URL 跳转 | URL + 文本 + 数量（动态） |
| 前置依赖 | 无 | 需登录态复用 |
| 分支 | 验证码 | 库存不足 / 登录失效 / ref 漂移 |
| 自愈价值 | 中 | 高（步骤多，错一步全链路断） |

可以看到：步骤越多、跨页越频繁，**「重快照 + 自愈」**的收益越明显——这正是把逻辑写进 Skill、而非手敲脚本的意义。

---

## 七、参考

- 上篇：基于 Playwright CLI + Skills 实现 UI 自动化测试实战（同站博客）
- 思路来源：Raina《基于 playwright-cli +Skills 实现 UI 自动化测试实战案例》
  https://mp.weixin.qq.com/s/CCLV_CU1AgSNOjCHkyafAA
- 官方文档：Playwright CLI Introduction https://playwright.dev/agent-cli/introduction
