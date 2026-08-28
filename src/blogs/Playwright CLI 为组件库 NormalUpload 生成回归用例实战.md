---
tag: ["Playwright", "UI 自动化测试", "E2E", "组件库", "视觉回归"]
date: "2026-08-28"
detail: "承接 Playwright CLI + Skills 系列，记录为 NormalUpload 落地回归用例的全过程。重点澄清：plan 不会自动编译成 TS——Agent 用 plan 定规格、用 CLI 探真页面拿 TS 草稿、手写 expect 后落盘；并覆盖 fixtures/seed、分 group 生成、布局契约与截图基线、何时更新基线。"
---

在[《Playwright CLI + Skills 实现 UI 自动化测试实战》](./Playwright%20CLI%20+%20Skills%20实现%20UI%20自动化测试实战.md)和[电商下单案例](./Playwright%20CLI%20+%20Skills%20跑通电商下单链路-实战案例.md)里，讲的是「如何用 CLI + Skill 跑通业务链路」。本文换一个更贴近组件库日常的场景：**给 `@fone/dg-components` 的 NormalUpload 写一套可维护的回归用例**。

这条链路的价值不在「会不会点上传」，而在把模糊的组件能力收成 **plan → fixtures → 分 group 生成 → 样式契约 / 截图**，并且把过程沉淀成可复用的工程习惯。

---

## 一、背景与目标

**被测对象：** NormalUpload（证照 / 附件上传，基于 Element UI `el-upload`）

**入口：** 文档站独立 demo  
`http://localhost:8080/matrix/demos/normal-upload/basic`

**目标：**

1. 覆盖 `img` / `doc` / `excel` / `zip` 成功上传与 token 回显；
2. 覆盖格式拒绝、超 2M 拒绝；
3. 覆盖预览 / 删除 / 重新上传；
4. 针对历史 bug「重新上传按钮被遮罩挡住 / 高度不对」做 **布局契约 + 截图** 回归。

前置：本地 `pnpm run serve`，组件库已 `build:lib`。

---

## 二、整体流程（plan → generate → heal）

与官方 Playwright CLI Skill 一致，但落到组件库时建议固定成四步：

```text
1. 功能拆解 + 素材盘点
2. 初始化 Playwright + seed / fixtures
3. 写 specs/<feature>.plan.md（场景级契约）
4. 按 group 用 CLI 探索 → 落盘用例 → 跑通 / heal
```

要点：**不要直接 `playwright-cli open` 当正式生成入口**。先跑 seed（带上 fixture 里的导航与约定），再 `attach` / `resume`，保证生成出的代码与日常 `npx playwright test` 环境一致。

---

## 三、功能拆解 → 测试分组

对照组件 props / `beforeUpload` / 预览态 DOM，把能力拆成三组（Deferred 另表）：

| Group | 主题 | 典型断言 |
|-------|------|----------|
| 1 Happy path | jpg/png、docx/pdf、xlsx、zip | 预览或缩略图、「重新上传」、`mock_` token |
| 2 Validation | txt/gif/md、oversized jpg/png | Message 文案、仍占位、token 为空 |
| 3 Interactions | 预览 Dialog、删除、重传、布局、截图 | Dialog / token 清空 / token 变化 / 几何契约 / 基线图 |

**素材目录：** `tests/resources/upload-assets/`

| 文件 | 用途 |
|------|------|
| `2-profilecover.jpg` | 成功上传 / 预览 / 删除 / 布局 / 截图 |
| `sample-small.png` | PNG 成功 + 重新上传对照 |
| `*.docx` / `small-pdf.pdf` / `*.xlsx` / `*.zip` | 各 type 成功路径 |
| `invalid.txt` / `.gif` / `.md` | 格式拒绝 |
| `oversized-image.jpg` / `.png`（>2M） | 大小拒绝 |

缺 >10M 文档、demo 未挂 `disabled` / `needCompressFlag` 的，先放 Deferred，不硬写 flaky 用例。

---

## 四、工程骨架：config、fixtures、seed

### 4.1 `playwright.config.ts`

```ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080/matrix/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

### 4.2 `tests/fixtures.ts`（每个场景干净落在 demo）

```ts
export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.goto('./demos/normal-upload/basic');
    await expect(page.locator('.demo-normal-upload')).toBeVisible();
    await use(page);
  },
});

export function uploadFormItem(page: Page, label: string) {
  return page
    .locator('.el-form-item')
    .filter({ has: page.locator('.el-form-item__label', { hasText: label }) })
    .first();
}

export async function setUploadFile(card: Locator, filePath: string) {
  await card.locator('input.el-upload__input').setInputFiles(filePath);
}
```

用 **label 精确定位**，避免 `hasText` 误伤描述文案；上传统一走 `el-upload__input` 的 `setInputFiles`（绕过原生文件框，稳定可重复）。

### 4.3 `tests/seed.spec.ts`

供 CLI plan / generate / heal 附着：

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli
playwright-cli attach tw-XXXX
playwright-cli resume
playwright-cli snapshot
```

---

## 五、先写 Plan，再生成代码

Plan 不是文档装饰，而是 **Agent / 人共用的场景契约**：文件路径、步骤、expect 一一对应。示例结构：

```markdown
### 1. Happy path uploads
**Seed:** `tests/seed.spec.ts`

#### 1.1. should-upload-image-with-bgimg
**File:** `tests/normal-upload/should-upload-image-with-bgimg.spec.ts`
**Steps:**
  1. 在「营业执照」上传区选择合法 jpg
    - expect: 出现预览与「重新上传」
  2. 查看绑定值
    - expect: businessPicUrl 为 mock_ 前缀
```

约定：

- **一场景一文件**；
- describe / test 名与 plan 一致；
- 从 fixtures 的 `test` 导入，不直接用 `@playwright/test`（否则丢 demo 导航）。

---

### 5.1 关键：plan 怎样变成最终的 `.spec.ts`

**没有「读 plan 一键编译出 TS」的命令。**  
`generate` 是 Agent 工作流：plan 定规格 → CLI 在真页面上探路 → 组装成可跑的用例。

```text
plan（测什么 / 期望什么 / 写到哪个文件）
  → seed + playwright-cli 按 Steps 真操作一遍
  → 每条 CLI 命令打印「等价 Playwright TS」碎片
  → Agent 整理定位、按 expect 手写断言、写入 plan 指定路径
  → npx playwright test 跑通；失败则 heal
```

| 产物 | 来源 | 角色 |
|------|------|------|
| `*.plan.md` | 先写 | 规格书 |
| CLI 日志里的 TS | `playwright-cli` 操作时自动打印 | 定位与操作的草稿 |
| `expect(...)` | Agent 对照 plan 的 `- expect:` **手写** | 回归断言（CLI 默认不生成） |
| `*.spec.ts` | Agent 组装落盘 | 正式用例 |

以 `should-upload-image-default-placeholder` 为例：

1. **读 plan**：锁定 File、Seed、「通用图片上传」+ jpg、token 非空。  
2. **挂 seed**：`--debug=cli` → `attach` → `resume`，页面状态与正式跑测一致。  
3. **CLI 演步骤**：`snapshot` / `find` / `setInputFiles`；输出里的  
   `await page.locator('input.el-upload__input').setInputFiles(...)`  
   即原材料，再收成 `uploadFormItem` + `uploadAssets` 等可维护写法。  
4. **补断言**：plan 写「重新上传可见」「defaultImgUrl 为 mock_」→ 写成 `expect`；文案以页面为准（如多句号则回写 plan）。  
5. **落盘并跑**：按 File 路径写入 → `npx playwright test`；挂了再 attach heal。

一句话：**plan 是合同，CLI 是探路仪，最终 TS 是「合同 + 探路结果」的组装件——不是 plan 语法的编译产物。**

只读源码瞎写 TS，易错 selector、漏悬停；只靠 CLI 乱点不写 plan，断言不全、难维护。二者绑在一起，才是这条 generate 链路。

---

## 六、按 Group 落地时的关键踩坑

### 6.1 格式错误文案带句号

组件里是：

```js
this.$message.error('请上传正确的图片格式。');
```

Plan / 断言必须对齐真实文案（含「。」），否则 Message 断言必挂。

### 6.2 下载 / 预览图标在悬停遮罩里

`.el-icon-download` / `.el-icon-zoom-in` 默认 `hidden`，要先：

```ts
await card.locator('.el-upload-list__item').first().hover();
```

### 6.3 el-upload 过渡产生重复 DOM

列表过渡常复制节点，定位加 `.first()`，按钮优先：

```ts
card.getByRole('button', { name: '重新上传' }).first()
```

### 6.4 重新上传不要写回主 `el-upload__input`

组件 `limit=1`，对主 input 再 `setInputFiles` **往往不会替换**。应写隐藏的 reUpload input：

```ts
await card.locator('input[type=file]:not(.el-upload__input)').setInputFiles(uploadAssets.png);
```

（等价于点「重新上传」再选文件；filechooser 容易误绑到主 input。）

### 6.5 预览 Dialog 关闭

`el-dialog` 无标题时 header 关闭按钮可能不可见，用 **Escape** 更稳。

---

## 七、样式回归：几何契约 + 截图

功能用例「能重传」**抓不住**「按钮被遮罩盖住半截」。历史样式问题对应两层断言：

### 7.1 `should-keep-reupload-button-layout`（几何 + 层叠）

校验设计契约（与 `normal-upload.scss` 一致）：

- 按钮高度约 **25px**，贴卡片底，宽度接近全宽；
- `.el-upload-list__item-actions` 底边 **不越过** 按钮顶边（遮罩 `bottom: 25px`）；
- `.refresh-btn`：`position: absolute`、`z-index: 101`；
- 按钮中心 `elementFromPoint` 命中 `.upload-btn`（可点）。

这是 **布局契约回归**，不依赖像素图。

### 7.2 `should-match-uploaded-image-card-screenshot`（视觉基线）

上传成功后对 `.el-upload-list__item` 做 `toHaveScreenshot`，把 padding、按钮条、圆角等「看起来不对」固化成基线，失败时看 diff 图即可排查。

```ts
await expect(listItem).toHaveScreenshot('uploaded-image-card.png', {
  maxDiffPixelRatio: 0.02,
  animations: 'disabled',
});
```

基线示例路径：

`tests/normal-upload/should-match-uploaded-image-card-screenshot.spec.ts-snapshots/uploaded-image-card-chromium-darwin.png`

**什么时候更新基线？**

| 该更新 | 不该更新 |
|--------|----------|
| 有意改样式 / 换测试图 / 改卡片结构，且验收新视觉 | 没改 UI 却挂了 → 当回归修代码 |
| CI 换平台后需补一份 `*-linux.png` 等 | 为了「让 CI 绿」盲目 `--update-snapshots` |

```bash
npx playwright test tests/normal-upload/should-match-uploaded-image-card-screenshot.spec.ts --update-snapshots
```

---

## 八、最终产物与命令

目录大致如下：

```text
specs/normal-upload.plan.md
tests/
  fixtures.ts
  seed.spec.ts
  resources/upload-assets/...
  normal-upload/
    should-upload-*.spec.ts          # group 1
    should-reject-*.spec.ts          # group 2
    should-preview / delete / reupload / layout / screenshot  # group 3
```

常用命令：

```bash
pnpm run serve
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/normal-upload/
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli
```

本仓库落地结果：NormalUpload 相关用例 **全绿**（含布局契约与截图基线）；Deferred 仅剩 demo 未暴露的禁用 / 压缩 / >10M 文档。

---

## 九、可复用的方法论小结

1. **先 plan 后代码**：场景、素材、expect 写死，生成才不跑偏。  
2. **generate = 组装，不是编译**：plan 定合同，CLI 出操作草稿，Agent 手写断言并落盘。  
3. **fixtures 承载被测入口**：seed 只负责给 CLI 挂载点。  
4. **CLI 探真实 DOM，断言对照 plan**：Message 文案、遮罩悬停、隐藏 input 都以线上行为为准。  
5. **功能断言 ≠ 样式断言**：交互通了仍可能样式回退；布局用几何，观感用截图。  
6. **基线是产品决策，不是救命稻草**：只在「有意变更」时更新。

若你也在维护 Vue2 + Element UI 的业务组件库，可以把同一套流程套到 ProTable / FormLayout：demo 页 → plan → fixtures → group 生成 → 对「易回退的布局」加契约或截图。

---

## 参考

- [Playwright CLI + Skills 实现 UI 自动化测试实战](./Playwright%20CLI%20+%20Skills%20实现%20UI%20自动化测试实战.md)
- [Playwright CLI + Skills 跑通电商下单链路-实战案例](./Playwright%20CLI%20+%20Skills%20跑通电商下单链路-实战案例.md)
- [Playwright: Visual comparisons](https://playwright.dev/docs/test-snapshots)
- `@playwright/cli` / playwright-cli Skill（plan → generate → heal）
