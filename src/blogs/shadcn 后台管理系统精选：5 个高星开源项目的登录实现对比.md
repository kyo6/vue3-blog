---
tag: ['shadcn/ui', '后台管理', '开源项目', '登录界面', '前端']
date: 2026-08-28
detail: 从 GitHub 星标、活跃维护、文档完善、登录功能完整四个维度，筛选 5 个基于 shadcn/ui 的高星开源后台管理模板（satnaing/shadcn-admin、Kiranism/next-shadcn-dashboard-starter、arhamkhnz/next-shadcn-admin-dashboard、Qualiora/shadboard、Whbbit1999/shadcn-vue-admin），逐一说明技术栈、登录路由、支持的登录方式与登录页设计特点，并附 Playwright 实际截图与横向对比。
---

# shadcn 后台管理系统精选：5 个高星开源项目的登录实现对比

作为近几年最火的 React 组件库范式，**shadcn/ui**（"复制粘贴源码，不装 npm 包"）把 Radix UI 的无障碍能力与 Tailwind 的可定制性结合得恰到好处，自然也催生了一批高质量的开源后台管理模板。但项目一多，挑起来就头大——本文从 **GitHub 星标、持续维护、文档完善、登录功能完整可用** 四个维度，筛出 5 个最值得参考的项目，每个都附上我用 Playwright 实地抓的登录页截图，并做一次横向对比。

> 截图均通过 Playwright（系统 Chrome headless）于 2026-08-28 抓取，视口 1440×900。仓库星标为同期 GitHub API 实时数据。

---

## 1. shadcn-admin（satnaing）· ⭐14,041

🔗 [github.com/satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) · 预览：[shadcn-admin.netlify.app](https://shadcn-admin.netlify.app/)

- **技术栈**：Vite + React + TypeScript + shadcn/ui + TanStack Router/Query + Zustand + react-hook-form + Zod
- **登录路由**：`/sign-in`、`/sign-up`、`/forgot-password`、`/otp`，源码位于 `src/features/auth/`
- **登录方式**：邮箱密码（Zustand 管理 mock 会话，24h 过期）＋可选接入 Clerk；页面内含 GitHub / Facebook OAuth 按钮；带 OTP 验证页
- **设计特点**：**居中卡片式**登录（见下图），左侧 Logo + 标题居中对齐，密码框自带显隐切换；注册/找回密码为同类卡片风格

![satnaing shadcn-admin 登录页](/blog/shadcn-admin/01-satnaing-signin.png)

- ⚠️ 默认认证是**演示级 mock**，接生产需替换为真实后端；Clerk 集成需自行配置环境变量

> 整个生态最被 fork 的免费后台，10+ 业务页面、命令面板、RTL、暗色模式全部到位。

---

## 2. next-shadcn-dashboard-starter（Kiranism）· ⭐6,894

🔗 [github.com/Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) · 预览：[next-shadcn-dashboard-starter.vercel.app](https://next-shadcn-dashboard-starter.vercel.app/)

- **技术栈**：Next.js 16 (App Router) + React 19 + shadcn/ui（Base UI 原语）+ Tailwind v4 + **Clerk** + TanStack Query/Form + Zod + Zustand + kbar + Sentry
- **登录路由**：**无自定义登录页**，`/sign-in` 由 Clerk 托管（Hosted Account Pages）
- **登录方式**：Clerk 全套——**无密码登录**（邮箱魔法链接/OTP）、社交登录（Google/GitHub 等）、**企业 SSO**；MFA/2FA 需付费计划；还包含 Organizations 多租户、Billing 计费、RBAC
- **设计特点**：登录 UI 使用 Clerk 默认居中卡片，可通过 `appearance.variables` 与 shadcn 设计 token 对齐；下方为项目 landing page

![Kiranism 项目 landing（登录由 Clerk 托管，无自研登录页）](/blog/shadcn-admin/02-kiranism-dashboard.png)

- ✅ 生产可用的完整认证，文档最完善（`clerk_setup.md`、`deployment.md`、`AGENTS.md`），2026-08 仍在高频更新
- 内置 `bun run cleanup clerk` 一键移除 Clerk 换自研认证

> 想"开箱即用 + 认证直接可用"的首选，代价是对 Clerk 的依赖。

---

## 3. next-shadcn-admin-dashboard（arhamkhnz）· ⭐2,949

🔗 [github.com/arhamkhnz/next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard) · 预览：[next-shadcn-admin-dashboard.vercel.app](https://next-shadcn-admin-dashboard.vercel.app/)

- **技术栈**：Next.js 16 + shadcn/ui + Tailwind v4 + react-hook-form + Zod + Zustand + TanStack Table + Biome
- **登录路由**：`src/app/(main)/auth/` → `/auth/v1/login`、`/auth/v1/register`、`/auth/v2/login`、`/auth/v2/register`（4 屏认证变体）
- **登录方式**：自研前端 mock（邮箱密码）＋ Google 社交登录按钮（`_components/social-auth/google-button.tsx`）；无真实后端
- **设计特点**：**v1 与 v2 同一仓库给出两套登录设计**——v1 居中卡片，v2 **split-screen 品牌面板**（下图为 v1 变体）

![arhamkhnz v1 登录页（split-screen 品牌面板）](/blog/shadcn-admin/03-arhamkhnz-signin.png)

- 配套 20+ 业务页面（CRM/Finance/Analytics/Productivity 等 5 套 Dashboard）+ 主题预设（shadcn neutral / Tangerine / Neo Brutalism / Soft Pop）

> 想在一份代码里同时看到"卡片 vs 分屏"两种主流登录写法的，看这个。

---

## 4. shadboard（Qualiora）· ⭐712

🔗 [github.com/Qualiora/shadboard](https://github.com/Qualiora/shadboard) · 预览：[shadboard.vercel.app](https://shadboard.vercel.app/)

- **技术栈**：Next.js 15 + React 19 + shadcn/ui + Tailwind 4 + **NextAuth.js** + Zod + react-hook-form + TanStack Table + Recharts
- **登录路由**：`/sign-in`、`/register`、`/forgot-password`、`/new-password`、`/verify-email`（**认证页全套**）
- **登录方式**：NextAuth.js **真实认证**——邮箱密码＋可配置 OAuth providers、邮箱验证、密码重置、会话管理；无内置 2FA
- **设计特点**：**split-screen，左侧表单 + 右侧大幅黑白人物插画**，"Welcome" 主题品牌感强，社交按钮（Facebook/GitHub/Google/X）排成一行

![shadboard 登录页（左侧表单 + 右侧插画）](/blog/shadcn-admin/04-shadboard-signin.png)

- 配套 401/403/maintenance/coming-soon 等状态页 + 主题定制器（颜色/圆角实时切换）+ 完整文档站（shadboard.vercel.app/docs）
- 提供 `starter-kit`（精简）/`full-kit`（完整）两种形态

> 想**参考真实 NextAuth 全链路**（注册 → 邮箱验证 → 密码重置 → 会话）的，看这个。

---

## 5. shadcn-vue-admin（Whbbit1999）· ⭐435

🔗 [github.com/Whbbit1999/shadcn-vue-admin](https://github.com/Whbbit1999/shadcn-vue-admin) · 预览：[shadcn-vue-admin.vercel.app](https://shadcn-vue-admin.vercel.app/)

- **技术栈**：**Vue 3.5 + shadcn-vue + reka-ui + Vite + Pinia + vue-router 5 + Tailwind v4** + TanStack Vue Query/Table + vue-i18n
- **登录路由**：`src/pages/auth/`（基于文件结构自动生成路由，访问 `/auth/sign-in`）
- **登录方式**：mock 邮箱密码（satnaing 原版的 Vue 移植，逻辑同源）；GitHub / Google 社交按钮
- **设计特点**：**居中卡片式登录**，复刻 React 版布局；右上 Logo + 居中表单；Terms / Privacy 链接位于表单下方

![shadcn-vue-admin 登录页](/blog/shadcn-admin/05-shadcn-vue-admin.png)

- 文档为中文 README + advanced guides；i18n、命令面板、文件结构自动路由齐全

> Vue 技术栈（尤其像我一样在写 Vue 3 博客/管理端的）直接 fork 改主题即可。

---

## 登录实现横向对比

| 维度 | ① satnaing | ② Kiranism | ③ arhamkhnz | ④ shadboard | ⑤ vue-admin |
|---|---|---|---|---|---|
| 框架 | Vite + React SPA | Next.js 16 SSR | Next.js 16 | Next.js 15 | Vue 3.5 + Vite |
| 认证落地程度 | mock + 可选 Clerk | **Clerk 全托管** | mock | **NextAuth 真实** | mock |
| 登录路由 | `/sign-in` 等 | `/sign-in`（Clerk 接管） | `/auth/v1\|v2/login` | `/sign-in` 等 | `/auth/sign-in` |
| 邮箱密码 | ✅ | ✅（Clerk） | ✅ | ✅ | ✅ |
| 第三方 OAuth | 按钮（演示） | ✅（Clerk） | Google 按钮（演示） | ✅（NextAuth） | 按钮（演示） |
| 2FA / OTP | OTP 页（mock） | MFA（付费） | ❌ | 邮箱验证 | ❌ |
| 登录布局 | **居中卡片** | Clerk 默认卡片 | **分屏 + 卡片双变体** | **分屏 + 插画** | **居中卡片** |
| 最近活跃 | 2026-07 | 2026-08 | 2026-08 | 2025-12 | 2026-08 |
| 协议 | MIT | MIT | MIT | MIT | MIT |

---

## 选型建议

- **最热门的 UI 参考** → ① satnaing（设计最主流、资料最多，登录页结构值得逐文件抄）
- **想认证直接可用** → ② Kiranism（passwordless / OAuth / SSO / 组织 / 计费一应俱全，代价是绑定 Clerk）
- **研究登录页设计变体** → ③ arhamkhnz（同一仓库同时给 v1 卡片 + v2 分屏）
- **参考真实认证链路** → ④ shadboard（NextAuth 全流程：注册→邮箱验证→密码重置）
- **Vue 技术栈** → ⑤ shadcn-vue-admin（直接 fork 改主题）

**一个共性提醒**：除 ②④ 外，多数 shadcn 后台的登录是**演示级 mock**。视觉与交互参考价值很高，但接生产时要么选托管认证（Clerk / NextAuth），要么自行实现 session 与 API。

---

## 写在最后

shadcn 范式最大的优势是"组件代码在你手里"——你 fork 哪个项目，本质上是把它当成"可改可拆的零件库"，而不是死守一个 npm 包。登录页尤其如此：本文列出的 5 个项目，把任意一个的 `auth/` 或 `pages/auth/` 目录拎出来当模板，配合本文对比表里的认证方案组合（mock → 接后端 / 直接换 Clerk / 接 NextAuth），基本能覆盖 90% 的中后台登录需求。

下次你准备开新坑的时候，不妨先 clone 这 5 个里的一个，再决定"自己写"还是"接服务"。
