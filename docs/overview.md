# 交付说明：智能体驱动的端到端测试（PPT）

## 成品

- **主题**：智能体驱动的端到端测试 —— 提升 UI 自动化测试的韧性
- **页数**：17 页
- **风格**：Tech（科技风），浅色正文页 + 深色封面/过渡/结束页
- **配色**：主色 `#266ED9`（蓝）、强调色 `#EC95E3`（粉）、中性灰 `#64748B` / `#94A3B8`，页面底色纯白，卡片用 `#F8FAFC` / `#F1F5F9`
- **字体**：标题 Poppins + Noto Sans SC，正文 Inter + Noto Sans SC
- **配图**：0 张外链/AI 图。金字塔、流程箭头、执行轨迹、护栏层级全部用 div / border 绘制，可编辑、无版权风险

## 内容结构（三段式）

| 章节 | 页码 | 要点 |
|------|------|------|
| 封面 / 目录 | 1–2 | 主题出处：Slack Engineering |
| 01 脆弱的基线 | 3–5 | 传统 E2E 的三个隐含假设（固定步骤 / 稳定选择器 / 可预测流程）逐条松动；脆断代价是假失败淹没真回归 |
| 02 从脚本到意图 | 6–10 | click→click→type→assert 对照 goal→agent adapts→verify result；六步执行循环；遇变更换路再走；执行轨迹与可观测性 |
| 03 边界与治理 | 11–16 | 确定性 vs 智能体的分工；测试金字塔第四层；成本决定边界；三类护栏；四步落地路径 |
| 结束页 | 17 | Q&A + 来源 |

## 关键决策

1. **不编造数据**。原文（Slack 博客 / InfoQ）没有给出任何量化收益数字，所以全篇只用定性表述 + 结构化数字（3 个假设、4 层金字塔、6 步循环、2 类推荐场景、0 次替换确定性测试），不臆造百分比。
2. **立场是"补充而非替代"**。第 12、14、16 页反复强调确定性 E2E 仍是 CI 主干，智能体只做 E2E 层内的补位，避免读者误用。
3. **全 CSS 图示**。Slack 原文的金字塔是外链图片，改用 div 绘制的同构金字塔，规避外链失效与版权问题。
4. **封面/过渡/结束保留深色底**。全局 slide 背景为白色，但深色页是有意的视觉节奏（首尾呼应），未套用 `slide-bg`。

## 产出文件

- `docs/product/material.md` — 素材整理（6 个维度）
- `docs/product/chapters.md` — 章节规划（含模板选型与一致性检查）
- `docs/product/features.md` — PPT 大纲
- `docs/page-global-config.json` — 全局样式配置
- `docs/pages.json` — 页面索引（含 poster 路径）
- `frontend/src/slides/slide-1.js` ~ `slide-17.js` — 17 页幻灯片
- `frontend/index.html` — 已注入字体、配色变量、17 个 slide 脚本引用
- `artifacts/presentation.pptx` — 导出的 PowerPoint 文件
- `frontend/public/assets/images/posters/pages/page-*.png` — 各页预览图

## 使用方式

在 `frontend/` 下执行 `npm run dev` 启动预览，用 ← → 方向键翻页，空格键下一页。
需要 PPTX 时执行 `npm run build:export-pptx`。
