# 章节规划：智能体驱动的端到端测试

## 核心信息（一句话）

智能体测试不是替代确定性 E2E，而是把它从"表面变更引发的假失败"里解放出来——用目标意图换取韧性，用护栏与轨迹换取可控性。

---

## Page 1: 封面
- **Page Type**: Cover
- **Page Title**: 智能体驱动的端到端测试
- **Selected Template**: cover/tech/046.tpl
- **Content Structure**:
  - 主标题：智能体驱动的端到端测试
  - 副标题：提升 UI 自动化测试的韧性
  - 说明行：从 Slack Engineering 的 E2E 测试实践说起
  - 页脚：Slack Engineering · InfoQ
- **Content Density**: Light
- **Narrative Role**: 定调，给出主题与出处
- **Image Requirements**: 无（纯文字 + 几何装饰）
- **Page Weight**: 核心页
- **Notes**: 深色封面，主色 #266ED9 光晕，强调色 #ec95e3 点缀

## Page 2: 目录
- **Page Type**: TOC
- **Page Title**: 目录
- **Selected Template**: toc/tech/3580.tpl
- **Content Structure**:
  - 01 脆弱的基线：传统 E2E 为何失守
  - 02 智能体如何工作：从脚本到意图
  - 03 边界与治理：它不该做什么
- **Content Density**: Light
- **Narrative Role**: 建立三段式阅读预期
- **Image Requirements**: 无
- **Page Weight**: 次要页

## Page 3: 章节过渡 01
- **Page Type**: Transition
- **Page Title**: 01 脆弱的基线
- **Selected Template**: transition/tech/559.tpl
- **Content Structure**:
  - 章节号：01
  - 章节名：脆弱的基线
  - 引导句：传统 E2E 的三个假设，正在被快速迭代打破
- **Content Density**: Light
- **Narrative Role**: 切入问题域
- **Image Requirements**: 无
- **Page Weight**: 过渡页

## Page 4: 三个隐含假设正在失效
- **Page Type**: Content
- **Page Title**: 三个隐含假设，撑不住快速���代
- **Selected Template**: content/tech/1686.tpl
- **Content Structure**:
  - 1 固定步骤：脚本假定操作顺序恒定不变，任何一步插入或重排都会让后续全部错位。
  - 2 稳定选择器：脚本依赖 DOM 结构、class 与 id 不变，而 UI 重构几乎必然触碰它们。
  - 3 可预测流程：脚本提前枚举 UI 与 API 的行为路径，一旦分支变化即失去覆盖。
  - 4 结果：三个假设同时松动，维护投入随迭代频率持续上升。
- **Content Density**: Medium（4 点）
- **Narrative Role**: 界定问题的技术根因
- **Image Requirements**: 无（用四阶递进卡片承载）
- **Page Weight**: 核心页

## Page 5: 脆断的代价
- **Page Type**: Content
- **Page Title**: 脆断的代价：假失败淹没真回归
- **Selected Template**: content/tech/1676.tpl
- **Content Structure**:
  - 表面变更被判失败：UI 结构改动、元素位置迁移，都会被确定性脚本读成测试失败。
  - 维护成本持续累积：每一次界面调整都要人工修复选择器与步骤，力气花在脚本而非产品上。
  - 信号被噪声淹没：红灯太多之后，团队会默认忽略失败，真正的回归反而被漏掉。
  - 底部三个数字：3 类表面变更 / 1 个最敏感层（E2E）/ 0 真实功能回归
- **Content Density**: Medium（3 点 + 3 数字）
- **Narrative Role**: 把技术问题翻译成业务代价
- **Image Requirements**: 无
- **Page Weight**: 核心页

## Page 6: 章节过渡 02
- **Page Type**: Transition
- **Page Title**: 02 从脚本到意图
- **Selected Template**: transition/tech/559.tpl
- **Content Structure**:
  - 章节号：02
  - 章节名：智能体如何工作
  - 引导句：把责任从静态脚本，交给按目标执行
的智能体
- **Content Density**: Light
- **Narrative Role**: 转向解决方案
- **Image Requirements**: 无
- **Page Weight**: 过渡页

## Page 7: 核心转变
- **Page Type**: Content
- **Page Title**: 测试从"一段步骤"变成"一个目标"
- **Selected Template**: content/tech/1683.tpl
- **Content Structure**:
  - 左（传统）：click → click → type → assert；固定序列，改动即失败，责任在脚本作者。
  - 右（智能体）：goal → agent adapts → verify result；目标导向，按观察到的状态动态选路。
  - 关键差异：测试被表达为 objective 而非严格序列，由智能体解释意图并尝试完成工作流。
  - 结论：断言仍由工程师定义，智能体只负责"如何到达"。
- **Content Density**: Medium
- **Narrative Role**: 全篇最关键的一页，交代范式转变
- **Image Requirements**: 无（左右镜像对照，居中竖线分隔）
- **Page Weight**: 核心页

## Page 8: 执行循环
- **Page Type**: Content
- **Page Title**: 智能体执行循环：六步闭环
- **Selected Template**: content/tech/1687.tpl
- **Content Structure**:
  - 1 接收意图：测试意图（test intent）被传入智能体层。
  - 2 规划：智能体做 planning，把目标拆成可执行的动作计划。
  - 3 执行：对被测系统（UI 或 API 表面）执行动作。
  - 4 观察：读取并评估当前应用状态（application state）。
  - 5 迭代：重复执行—观察，直到目标完成或触发停止条件。
  - 6 校验：执行结果与工程师预定义的断言（assertions）比对。
- **Content Density**: Heavy（6 点）
- **Narrative Role**: 讲清机制，去除黑箱感
- **Image Requirements**: 无（3×2 六宫格）
- **Page Weight**: 核心页

## Page 9: 自适应能力
- **Page Type**: Content
- **Page Title**: 遇到变更：不立即失败，先换路再走
- **Selected Template**: content/tech/1673.tpl
- **Content Structure**:
  - 步骤一 遭遇变更：UI 结构被修改、元素被迁移到别处。
  - 步骤二 重新评估：智能体在每一步评估应用状态，据此重新决策。
  - 步骤三 选择替代路径：尝试 alternate paths 继续执行，而不是立刻判定失败。
  - 收敛：目标达成或触发停止条件后结束，结果仍交给断言校验。
- **Content Density**: Medium（3 步 + 结论）
- **Narrative Role**: 直接回应第一章的痛点
- **Image Requirements**: 无（三步箭头流）
- **Page Weight**: 核心页

## Page 10: 可观测性
- **Page Type**: Content
- **Page Title**: 没有执行轨迹，就没有归因
- **Selected Template**: content/tech/1678.tpl
- **Content Structure**:
  - 阶段一 意图输入：测试目标进入智能体层，成为本次运行的起点。
  - 阶段二 执行记录：结构化日志记录每一步的决策与交互，形成 execution traces。
  - 阶段三 回放检视：团队可以 replay 整条轨迹，把失败定位到具体步骤。
  - 右侧要点：动作序列可追溯 / 决策依据可解释 / 失败可复现 / 结果可审计
- **Content Density**: Medium
- **Narrative Role**: 解决"智能体不可控"的最大质疑
- **Image Requirements**: 无（左侧三段时间轴 + 右侧要点）
- **Page Weight**: 核心页

## Page 11: 章节过渡 03
- **Page Type**: Transition
- **Page Title**: 03 边界与治理
- **Selected Template**: transition/tech/559.tpl
- **Content Structure**:
  - 章节号：03
  - 章节名：边界与治理
  - 引导句：它该做什么，更重要的是——它不该做什么
- **Content Density**: Light
- **Narrative Role**: 收束到落地判断
- **Image Requirements**: 无
- **Page Weight**: 过渡页

## Page 12: 分工对比
- **Page Type**: Content
- **Page Title**: 确定性测试与智能体测试：分工，而非替代
- **Selected Template**: content/tech/1685.tpl
- **Content Structure**:
  - 确定性 E2E：在 CI 中做快速、可重复的回归验证，是校验核心逻辑与契约正确性的主要机制。
  - 智能体执行：以目标为导向，观察应用状态后动态决定如何达成，用于吸收 UI 与结构变化带来的脆弱性。
  - 底部左卡：确定性测试 = "是否发生回归"的判据。
  - 底部右卡：智能体测试 = 减少表面变更造成的误报。
- **Content Density**: Medium
- **Narrative Role**: 澄清最常见的误解
- **Image Requirements**: 无（上下两行对照）
- **Page Weight**: 核心页

## Page 13: 测试金字塔第四层
- **Page Type**: Content
- **Page Title**: 测试金字塔，多出第四层
- **Selected Template**: content/tech/1672.tpl
- **Content Structure**:
  - 中心：四层金字塔（自下而上）——单元测试、集成测试、E2E 测试、智能体测试。
  - 角卡 1 单元测试：数量最多、执行最快的基础校验。
  - 角卡 2 集成测试：验证模块间协作与契约。
  - 角卡 3 E2E 测试：覆盖完整用户旅程，对 UI 与结构变化最敏感。
  - 角卡 4 智能体测试：置于 E2E 层内，负责高变更、高脆弱场景的探索与调试。
- **Content Density**: Medium
- **Narrative Role**: 给出整体定位，回应"它放在哪"
- **Image Requirements**: 无（中心用 CSS 绘制四层金字塔）
- **Page Weight**: 核心页

## Page 14: 成本边界
- **Page Type**: Content
- **Page Title**: 成本，决定了它的边界
- **Selected Template**: content/tech/1688.tpl
- **Content Structure**:
  - 更适合：定向调试、探索性测试、复杂 UI 行为探索、复现生产问题。
  - 暂不适合：在 CI 流水线中高频执行——Slack 工程师明确将成本列为主要考量。
  - 判断标准：一次运行能省下的排查时间，是否高于一次智能体执行的成本。
  - 底部数据卡：2 类推荐场景 / 1 条成本硬约束 / 0 —— 对确定性测试的替换次数
- **Content Density**: Medium
- **Narrative Role**: 给出可信的边界，避免被误用
- **Image Requirements**: 无（三列瀑布 + 数据卡）
- **Page Weight**: 核心页

## Page 15: 护栏与约束
- **Page Type**: Content
- **Page Title**: 治理：先装护栏，再放它跑
- **Selected Template**: content/tech/1689.tpl
- **Content Structure**:
  - 允许的动作范围：限定智能体可以执行哪些操作，越界即拒绝。
  - 探索边界：限定它在应用中的探索范围，避免偏离测试目标。
  - 停止条件：明确什么情况下终止执行，防止无限迭代与成本失控。
  - 兜底：无论如何执行，最终仍要与工程师定义的断言比对。
- **Content Density**: Medium
- **Narrative Role**: 落地的安全前提
- **Image Requirements**: 无
- **Page Weight**: 核心页

## Page 16: 落地建议
- **Page Type**: Content
- **Page Title**: 落地路径：先试点，后放量
- **Selected Template**: content/tech/1679.tpl
- **Content Structure**:
  - ① 选点：挑 E2E 层中变更最频繁、失败最脆的场景做试点。
  - ② 保主干：确定性测试继续承担 CI 中的高频回归，不动主干。
  - ③ 建能力：补齐意图表达、护栏配置、轨迹回放三件套。
  - ④ 换指标：用假失败率与归因耗时衡量收益，而不是用例数量。
- **Content Density**: Medium（4 点）
- **Narrative Role**: 收尾给可执行动作
- **Image Requirements**: 无
- **Page Weight**: 核心页

## Page 17: 结束页
- **Page Type**: Ending
- **Page Title**: 谢谢
- **Selected Template**: ending/tech/1107.tpl
- **Content Structure**:
  - 主标题：Thanks
  - 副标题：问题与讨论
  - 来源：Slack Engineering《Agentic Testing: Where Agents Fit in the E2E Testing Stack》
- **Content Density**: Light
- **Narrative Role**: 收束并给出出处
- **Image Requirements**: 无
- **Page Weight**: 次要页

---

## 一致性检查（MECE）

- **互斥**：第 1 章讲问题根因，第 2 章讲机制，第 3 章讲边界与落地，三段无重叠。
- **穷尽**：问题 → 方案 → 约束 → 建议，完整支撑核心信息。
- **顺序**：按重要性递进，符合结论先行的报告型结构。
- **图片比例**：0 / 17 = 0%，远低于 40% 上限；所有图示（金字塔、流程、时间轴）均以 CSS/Tailwind 绘制，可编辑、无版权风险。
- **模板复用**：内容页模板互不重复；三个过渡页统一使用 transition/tech/559.tpl。
