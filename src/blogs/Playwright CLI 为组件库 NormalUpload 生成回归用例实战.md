---
slug: playwright-cli-normalupload-regression-tests
tag: ["Playwright", "自动化测试", "UI 自动化测试", "E2E", "组件库", "视觉回归"]
date: "2026-08-28"
column: 教程
detail: 想给上传组件建立可维护的回归测试？从场景清单、测试素材和 Playwright 用例，到布局断言与截图基线，梳理一套可复用的落地流程。
---

在[《Playwright CLI + Skills 实现 UI 自动化测试实战》](/blog/playwright-cli-skills-ui-testing)和[电商下单案例](/blog/playwright-cli-skills-ecommerce-checkout)里，讲的是「如何用 CLI + Skill 跑通业务链路」。本文换一个更贴近组件库日常的场景：**给 `@fone/dg-components` 的 NormalUpload 写一套可维护的回归用例**。

上传本身并不难。真正麻烦的是：Agent 怎样知道要进入哪个页面、素材放在哪里、什么现象才算上传成功，以及生成的代码能否脱离当前浏览器会话独立运行。

本文不只展示最后的测试文件，而是沿着一次真实落地过程，说明 fixtures、seed、plan 和 Playwright CLI 分别解决什么问题，它们又怎样组合成一条可以重复执行的 Agent 测试链路。

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

## 二、从组件能力到回归用例，Agent 实际经历了什么

如果只把 Demo 地址交给 Agent，让它“帮我生成测试”，Agent 很容易得到一段能运行一次、却难以长期维护的脚本：页面地址写死在测试里，素材路径散落在各处，定位器依赖 DOM 顺序，甚至只验证“点击没有报错”，没有验证 token 是否真正更新。

因此，这个案例没有从浏览器操作开始，而是先为 Agent 准备一个稳定的测试环境，再让它进入页面探索。

```text
组件源码与 Demo
  ↓ 确认能力、限制和可观察结果
测试素材 + fixtures
  ↓ 固定入口、素材路径和共享操作
seed
  ↓ 启动一个与正式测试一致的浏览器会话
plan
  ↓ 告诉 Agent 要测什么、写到哪里、怎样算通过
CLI 探索真实页面
  ↓ 获得可用的定位和操作代码
Agent 生成断言并落盘
  ↓
运行测试；失败后根据 trace / 页面状态修正
```

这条流程里，每个文件的职责不同：

| 组成 | 解决的问题 | 不负责什么 |
|------|------------|------------|
| `fixtures.ts` | 测试从哪里开始、素材在哪里、通用操作如何复用 | 不描述具体业务场景 |
| `seed.spec.ts` | 给 CLI 一个可附着、可继续操作的真实测试会话 | 不承载正式回归断言 |
| `normal-upload.plan.md` | 定义场景、步骤、预期和目标文件 | 不提供真实 DOM 定位器 |
| Playwright CLI | 在运行中的页面上验证定位与交互 | 不理解业务上什么结果才算正确 |
| Agent | 把规格与页面证据组合为测试，并根据失败结果修正 | 不应绕过或弱化规格中的断言 |

理解这层分工后，后面的 `plan → generate → heal` 就不再是一组抽象命令，而是一条有输入、有证据、有验收标准的生成过程。

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

## 四、先把 Agent 的运行环境固定下来

正式写 plan 之前，我先补齐 Playwright 的工程骨架。原因很简单：如果 Agent 探索页面时使用的入口、数据和正式测试不一致，那么它找到的定位器即使当场可用，落盘后也可能立即失效。

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

### 4.2 `tests/fixtures.ts`：统一测试入口和可复用能力

fixture 的第一项职责，是保证每个用例都从同一个 Demo 页面开始：

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

这里没有在每个 `.spec.ts` 里重复写 `page.goto(...)`。测试只要从 `tests/fixtures.ts` 导入 `test`，就会自动进入 `/demos/normal-upload/basic`，并等待 Demo 根节点出现。这样做有两个直接收益：

1. Agent 探索页面和 CI 执行测试使用同一套导航逻辑；
2. 入口地址变化时只改 fixture，不需要批量修改所有用例。

fixture 的第二项职责，是把容易写错的细节收口起来。例如上传素材统一放在 `tests/resources/upload-assets/`，再导出为有语义的 `uploadAssets.jpg`、`uploadAssets.pdf`；读取页面底部 token 也封装为 `getFormTokens(page)`。最终用例表达的是“上传 JPG”“读取绑定值”，而不是一串本机路径和 JSON 解析代码。

定位上传区域时使用表单 label，而不是“页面上的第几个上传按钮”：

```ts
const card = uploadFormItem(page, '通用图片上传');
await setUploadFile(card, uploadAssets.jpg);
```

页面以后即使调整模块顺序，只要业务标签不变，这段代码仍然有效。`setUploadFile` 则统一操作 `el-upload__input`，绕过不可自动化的系统文件选择框，使上传动作可以稳定重复。

### 4.3 `tests/seed.spec.ts`：给 Agent 一个最小的真实会话

seed 不是“第一条正式测试”，也不需要复制一遍 fixture 的导航逻辑。它只做一件事：导入 fixture 中的 `test`，确认页面已经进入可探索状态，然后让 Playwright 保留这次调试会话。

```ts
import { test } from './fixtures';

test('seed', async ({ page }) => {
  // 页面导航已经由 fixtures 完成
  await page.locator('.demo-normal-upload').waitFor({ state: 'visible' });
});
```

启动 seed 后，CLI 附着的是一个“真正由测试框架创建的页面”，其中已经包含 `baseURL`、fixture 导航、浏览器项目等正式配置：

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli
playwright-cli attach tw-XXXX
playwright-cli resume
playwright-cli snapshot
```

此时 `snapshot` 看到的是 NormalUpload Demo，而不是一个由 Agent 临时打开、缺少测试上下文的浏览器标签页。后续 Agent 在这里尝试 hover、`setInputFiles` 或 Dialog 操作，得到的代码才更接近最终测试环境。

可以把两者的关系记成一句话：**fixture 定义环境，seed 把这个环境实例化给 Agent。**

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

**没有“读取 plan，然后一键编译出 TypeScript”的命令。**

原因是 plan 和测试代码解决的不是同一个问题。plan 中写的是业务语言，例如“在通用图片上传区选择合法 JPG”“上传后 token 非空”；Playwright 代码必须回答的却是另一组问题：页面中哪个 DOM 属于“通用图片上传区”、文件应该写入哪个 input、token 从哪里读取、异步更新需要等待多久。

这中间存在三次转换：

```text
业务意图                  页面证据                   可执行回归
上传合法 JPG      →      找到对应 input      →      setInputFiles(...)
出现成功预览      →      确认预览态 DOM       →      expect(...).toBeVisible()
token 已经更新     →      找到绑定值展示区域     →      expect.poll(...)
```

下面用 `should-upload-image-default-placeholder` 展开一次真实生成过程。

#### 第一步：Agent 从 plan 中提取测试合同

plan 给出的不是 selector，而是本场景不可丢失的业务约束：

```markdown
#### should-upload-image-default-placeholder

**File:** `tests/normal-upload/should-upload-image-default-placeholder.spec.ts`

1. 在「通用图片上传」区选择合法 jpg
   - expect: 出现图片预览与「重新上传」
2. 查看绑定值
   - expect: `defaultImgUrl` 非空
```

Agent 读完后至少知道四件事：目标区域是“通用图片上传”，素材类型是 JPG，需要同时验证界面成功态和绑定值，代码必须写入指定文件。

#### 第二步：在 seed 会话中确认页面怎样操作

Agent 附着到 seed，先读取页面快照。页面里有多个 `NormalUpload`，所以不能直接选择第一个 `input[type=file]`。通过 Demo 的表单结构，可以先用 label 缩小范围，再寻找该卡片内部的上传 input：

```ts
const card = page
  .locator('.el-form-item')
  .filter({
    has: page.locator('.el-form-item__label', {
      hasText: '通用图片上传',
    }),
  })
  .first();

await card
  .locator('input.el-upload__input')
  .setInputFiles('/临时探索时使用的素材路径/2-profilecover.jpg');
```

这一步的价值是验证“操作路径确实可行”。CLI 可以提供等价的 Playwright 代码片段，但这些片段仍是探索结果：绝对素材路径不能直接进入正式用例，重复的定位逻辑也应该复用 fixture 中已有的函数。

因此，Agent 会把探索代码收敛为：

```ts
const card = uploadFormItem(page, '通用图片上传');
await setUploadFile(card, uploadAssets.jpg);
```

#### 第三步：把 plan 中的预期写成断言

CLI 能证明“文件已经被写入 input”，但这不等于业务成功。Agent 还要回到 plan，把两条 expect 转成明确断言。

第一条 expect 对应页面成功态：

```ts
await expect(
  card.getByRole('button', { name: '重新上传' }).first(),
).toBeVisible();
await expect(card.locator('.upload-img').first()).toBeVisible();
```

第二条 expect 对应 `v-model`。Demo 使用 mock 上传，成功 token 以 `mock_` 开头，因此只检查“非空”还不够精确。token 又是异步更新的，所以使用可重试断言，而不是写固定等待时间：

```ts
await expect
  .poll(async () => (await getFormTokens(page)).defaultImgUrl)
  .toMatch(/^mock_/);
```

这里体现了 Agent 和录制工具的区别：录制工具可以记住操作，Agent 需要理解“什么证据足以证明场景通过”。

#### 第四步：组装成独立测试文件

将 fixture 提供的环境、CLI 验证过的操作路径和 plan 中的断言组合起来，才得到最终的 `.spec.ts`：

```ts
// spec: specs/normal-upload.plan.md
// seed: tests/seed.spec.ts
import {
  test,
  expect,
  uploadAssets,
  uploadFormItem,
  setUploadFile,
  getFormTokens,
} from '../fixtures';

test.describe('Happy path uploads', () => {
  test('should-upload-image-default-placeholder', async ({ page }) => {
    const card = uploadFormItem(page, '通用图片上传');
    await setUploadFile(card, uploadAssets.jpg);

    await expect(
      card.getByRole('button', { name: '重新上传' }).first(),
    ).toBeVisible();
    await expect(card.locator('.upload-img').first()).toBeVisible();

    await expect
      .poll(async () => (await getFormTokens(page)).defaultImgUrl)
      .toMatch(/^mock_/);
  });
});
```

#### 第五步：运行测试，用失败结果修正假设

代码落盘不是结束。Agent 先单独运行这个文件：如果失败，就根据错误、trace 和真实页面状态判断是哪一层出了问题。

- 找不到元素：重新检查定位范围或页面状态；
- 元素存在但不可见：检查是否需要 hover、是否处于过渡动画；
- token 断言超时：确认上传是否完成、读取位置是否正确；
- 单测通过但全组失败：检查场景之间是否共享了不该共享的状态。

修复时保留 plan 的业务目标，调整的是对页面的错误假设，而不是为了让测试变绿而删掉断言。

所以更准确地说：**plan 是测试合同，CLI 提供页面证据，Agent 负责翻译和验证，`.spec.ts` 是三者组合后的工程产物。**

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

- [Playwright CLI + Skills 实现 UI 自动化测试实战](/blog/playwright-cli-skills-ui-testing)
- [Playwright CLI + Skills 跑通电商下单链路-实战案例](/blog/playwright-cli-skills-ecommerce-checkout)
- [Playwright: Visual comparisons](https://playwright.dev/docs/test-snapshots)
- `@playwright/cli` / playwright-cli Skill（plan → generate → heal）
