---
tag: ['shadcn/ui', '设计规范', 'Design Token', '后台管理', '前端']
date: 2026-08-28
detail: 基于 satnaing/shadcn-admin 最新源码（Tailwind v4 + CSS 变量方案）逐项拆解中后台控制台的设计规范：布局（内容区 1280px 上限、侧边栏 256/48/288px 三态、顶栏 64px）、间距层级（6/8/16/24px 递进）、色彩体系（OKLCH token + slate 基色 + 暗色反转映射）、Typography（Inter 可变字体 + 24/14/12px 字阶）与组件视觉属性（10px 圆角基、shadow-xs/sm/lg 分层、1px 边框、3px 焦点环），并标注对应 CSS 变量与 Tailwind token 及响应式断点适配规则。
---

# shadcn-admin 设计规范分析

> 分析对象：satnaing/shadcn-admin（⭐14k，MIT），基于最新 main 分支源码。
> 关键背景：项目采用 **Tailwind CSS v4** + **CSS 变量方案**（`components.json` 中 `style: "new-york"`、`baseColor: "slate"`、`cssVariables: true`）。所有设计 token 集中在 `src/styles/theme.css`，布局组件在 `src/components/layout/` 与 `src/components/ui/sidebar.tsx`。

---

## 1. 布局规范

| 项目 | 数值 | 来源（CSS 变量 / Tailwind token） |
|---|---|---|
| 内容区最大宽度 | **1280px（max-w-7xl）**，居中 | `Main.tsx`：`@7xl/content:mx-auto @7xl/content:max-w-7xl`（容器查询触发） |
| 侧边栏展开宽度 | **256px（16rem）** | `--sidebar-width: 16rem`（`SIDEBAR_WIDTH` 常量） |
| 侧边栏折叠宽度（icon 态） | **48px（3rem）** | `--sidebar-width-icon: 3rem` |
| 侧边栏移动端抽屉宽度 | **288px（18rem）** | `--sidebar-width-mobile: 18rem` |
| 顶部导航栏高度 | **64px（h-16）** | `Header.tsx`：`h-16`，内容 `p-4` |
| 页面四周留白 | 水平 **16px**（px-4）、垂直 **24px**（py-6） | `Main.tsx`：`px-4 py-6` |
| inset 变体额外留白 | 内容区 `m-2`（8px）＋ `rounded-xl` | `sidebar.tsx`：`md:peer-data-[variant=inset]:m-2 ... :rounded-xl` |
| 侧边栏 header/footer 内边距 | 8px（p-2），内部 gap-2 | `sidebar.tsx` `SidebarHeader/SidebarFooter` |

**布局机制要点**：
- 侧边栏使用 shadcn/ui 官方 `Sidebar` 组件，三态：桌面展开 `w-(--sidebar-width)`、折叠 `w-(--sidebar-width-icon)`、移动端抽屉 `w-(--sidebar-width-mobile)`。
- 默认布局参数：`variant: "inset"`、`collapsible: "icon"`（即默认折叠为 48px 图标栏），用户选择会写入 cookie（`layout_collapsible` / `layout_variant`，有效期 7 天）。
- 顶栏为 sticky（`fixed` 时 `sticky top-0`），**滚动超过 10px 后**出现 `shadow` + `backdrop-blur-lg` 毛玻璃背景（`after:bg-background/20`）。
- 内容区宽度上限不是靠媒体查询，而是**容器查询** `@container/content`：当内容容器宽度 ≥ 80rem（1280px）时锁定 `max-w-7xl` 并居中。

**代码示例**（来源：`src/components/ui/sidebar.tsx`、`src/components/layout/main.tsx`、`src/components/layout/header.tsx`）：

```tsx
// src/components/ui/sidebar.tsx（摘录）
// 侧边栏三态宽度常量：桌面 256px / 折叠 48px / 移动端抽屉 288px
const SIDEBAR_WIDTH = '16rem'        // 展开态 256px
const SIDEBAR_WIDTH_MOBILE = '18rem' // 移动端抽屉 288px
const SIDEBAR_WIDTH_ICON = '3rem'    // 折叠为图标栏 48px

// 通过 CSS 变量挂到根容器，组件内用 w-(--sidebar-width) 引用
style={{
  '--sidebar-width': SIDEBAR_WIDTH,
  '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
}}
```

```tsx
// src/components/layout/main.tsx
// 内容区：水平 16px、垂直 24px；>=80rem(1280px) 时锁定 max-w-7xl 居中
export function Main({ fixed, fluid, className, ...props }: MainProps) {
  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        'px-4 py-6',                                       // 页面四周留白
        fixed && 'flex grow flex-col overflow-hidden',
        // 容器查询：内容容器 >= 80rem(1280px) 时 mx-auto + max-w-7xl 居中
        !fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        className
      )}
    />
  )
}
```

```tsx
// src/components/layout/header.tsx（摘录）
// 顶栏固定 64px；fixed 时滚动>10px 加 shadow + backdrop-blur 毛玻璃
<header
  className={cn(
    'z-50 h-16',                                          // 64px 高度
    fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
    offset > 10 && fixed ? 'shadow' : 'shadow-none',      // 滚动后出现阴影
  )}
>
```

**运行效果（桌面 1440×900，亮色）**：侧边栏 256px 展开态、顶栏 64px、内容区按容器查询规则居中。

![shadcn-admin 桌面布局：展开态侧边栏 256px + 顶栏 64px + 内容区](/blog/shadcn-admin/06-dashboard-light.png)

---

## 2. 间距系统

间距基元基于 Tailwind v4 动态 spacing：`--spacing` 基准 **0.25rem（4px）**，任意间距类按倍数生成。

| 层级 | 数值 | 应用场景 | Tailwind token |
|---|---|---|---|
| 微间距 | 4px | 图标与文字、网格列间最小缝隙 | `gap-1` / `p-1` |
| 小间距 | 6px | 卡片标题↔描述、按钮内图标↔文字（sm） | `gap-1.5` |
| 中间距 | 8px | 侧边栏 header/footer 内边距、页面标题行下方 | `p-2` / `mb-2` / `m-2` |
| 区块间距 | **16px** | 卡片之间、Tabs 内容区、区块间垂直/水平间距（主档位） | `gap-4` / `space-y-4` |
| 卡片内边距 | **24px** | 卡片垂直/水平内边距、卡片内部元素间距 | `py-6` / `px-6` / `gap-6` |
| 页面上下留白 | 24px | 主内容区垂直方向 | `py-6` |

**间距递增规律**：6px → 8px → 16px → 24px，即 1.5 → 2 → 4 → 6 倍 4px 基元。**卡片内部用 6px（标题↔描述）、卡片内容间用 24px、卡片之间用 16px**——这是 shadcn new-york 风格最典型的节奏。

具体实例（`features/dashboard/index.tsx`）：
- 统计卡网格：`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`（卡片间距 16px）
- 图表区：`grid grid-cols-1 gap-4 lg:grid-cols-7`（7 列栅格内 4:3 分栏）
- 页面标题行：`mb-2 flex items-center justify-between`（标题与下方内容 8px）
- Tabs 内容：`space-y-4`（16px 垂直堆叠）

**代码示例**（来源：`src/features/dashboard/index.tsx`、`src/components/ui/card.tsx`）：

```tsx
// src/features/dashboard/index.tsx（摘录）
// 页面标题行：mb-2 (8px) 与下方 Tabs 隔开
<div className='mb-2 flex items-center justify-between space-y-2'>
  <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
  <Button>Download</Button>
</div>

// 统计卡：gap-4 (16px) 卡片间距；sm→2 列，lg→4 列
<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// 图表区：grid-cols-1 默认，lg 时 7 列内 4:3 分栏
<div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
  <Card className='col-span-1 lg:col-span-4'>...</Card>
  <Card className='col-span-1 lg:col-span-3'>...</Card>
</div>

// Tabs 内容：区块间垂直堆叠 16px
<TabsContent className='space-y-4'>...</TabsContent>
```

```tsx
// src/components/ui/card.tsx（摘录）
// Card：rounded-xl + 垂直 py-6 + 内部子元素 gap-6 (24px)
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className
      )}
    />
  )
}

// CardHeader：水平 px-6 (24px)，标题↔描述 gap-1.5 (6px)
function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
    />
  )
}
```

**运行效果**：下方 4 个统计卡彼此间距 16px（`gap-4`），每张卡内边距 24px（`py-6`），卡内标题与数字间 6px（`gap-1.5`）。

![dashboard 间距示意：4 个统计卡卡片间距 16px，卡内 padding 24px](/blog/shadcn-admin/06-dashboard-light.png)

---

## 3. 色彩体系

项目使用 **OKLCH** 色彩空间定义，基色为 **slate**。以下 hex 为 OKLCH 的近似转换（供肉眼参考，源码以 oklch() 为准）：

### 3.1 核心 token（亮色 ↔ 暗色映射）

| Token（CSS 变量） | 亮色 | 暗色 | 对应 slate 色阶 | 用途 |
|---|---|---|---|---|
| `--background` | `#ffffff` | `#020618` | white ↔ slate-950 | 页面背景 |
| `--foreground` | `#020618` | `#f8fafc` | slate-950 ↔ slate-50 | 主文字色 |
| `--card` / `--popover` | `#ffffff` | `#020919` | white ↔ 深蓝黑 | 卡片/弹层背景 |
| `--primary` | `#0f172b` | `#e2e8f0` | slate-900 ↔ slate-200 | 主操作色（**暗色反转为浅色**） |
| `--primary-foreground` | `#f8fafc` | `#0f172b` | slate-50 ↔ slate-900 | 主色上的文字 |
| `--secondary` / `--muted` / `--accent` | `#f1f5f9` | `#1d293d` | slate-100 ↔ 深蓝灰 | 次级背景/强调背景（三值相同） |
| `--secondary-foreground` / `--accent-foreground` | `#0f172b` | `#f8fafc` | — | 次级/强调上文字 |
| `--muted-foreground` | `#62748e` | `#90a1b9` | slate-500 ↔ slate-400 | 次级说明文字 |
| `--destructive` | `#e7000b` | `#ff6467` | red-600 ↔ red-400 | 危险操作（删除等） |
| `--border` | `#e2e8f0` | `rgba(255,255,255,0.10)` | slate-200 ↔ 白 10% | 边框 |
| `--input` | `#e2e8f0` | `rgba(255,255,255,0.15)` | 同 border ↔ 白 15% | 输入框边框 |
| `--ring` | `#90a1b9` | `#6a7282` | slate-400 ↔ slate-500 | 焦点环 |
| `--chart-1`~`--chart-5` | `#f54900 / #009689 / #104e64 / #ffb900 / #fe9a00` | `#1447e6 / #00bc7d / #fe9a00 / #ad46ff / #ff2056` | 彩色系 | 图表序列色 |

**核心 token 可视化**（hex 为 OKLCH 近似转换，源码以 `oklch()` 为准；色块内文字按亮度自动取深/浅色，透明色块带棋盘格底纹示意透明度。点击下方标签可在 **浅色 / 深色** 两个模式间切换）：

<div class="clr-wrap" style="margin:1.6rem 0 2.4rem">
<style>
.clr-wrap{--cbg:#ffffff;--cbd:#e2e8f0;--ctx:#0f172a;--cmt:#62748e;--cso:#f1f5f9;--cborder:rgba(0,0,0,.08);--cdash:rgba(0,0,0,.12)}
.dark .clr-wrap{--cbg:#0b1220;--cbd:rgba(255,255,255,.09);--ctx:#e2e8f0;--cmt:#90a1b9;--cso:rgba(255,255,255,.07);--cborder:rgba(255,255,255,.12);--cdash:rgba(255,255,255,.12)}
.clr-tab-ipt{position:absolute;width:0;height:0;opacity:0;pointer-events:none}
.clr-tabbar{display:flex;gap:8px;margin-bottom:14px}
.clr-tab{display:inline-block;cursor:pointer;font-size:.78rem;font-weight:600;line-height:1;padding:7px 16px;border-radius:999px;border:1px solid var(--cbd);color:var(--cmt);background:var(--cso);user-select:none;transition:color .15s,background .15s,border-color .15s}
.clr-tab:hover{color:var(--ctx)}
#clr-tb-light:checked ~ .clr-tabbar label[for=clr-tb-light],
#clr-tb-dark:checked ~ .clr-tabbar label[for=clr-tb-dark]{background:var(--ctx);color:var(--cbg);border-color:var(--ctx)}
#clr-tb-light:checked ~ .clr-grid .sw-dark,
#clr-tb-light:checked ~ .clr-chart .clr-chart-row.sw-dark{display:none}
#clr-tb-dark:checked ~ .clr-grid .sw-light,
#clr-tb-dark:checked ~ .clr-chart .clr-chart-row.sw-light{display:none}
.clr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}
.clr-card{background:var(--cbg);border:1px solid var(--cbd);border-radius:10px;padding:14px}
.clr-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}
.clr-token{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;font-weight:600;color:var(--ctx);background:var(--cso);border-radius:6px;padding:2px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.clr-use{font-size:.68rem;color:var(--cmt);background:var(--cso);border:1px solid var(--cbd);border-radius:999px;padding:1px 8px;white-space:nowrap}
.clr-pair{display:grid;grid-template-columns:1fr}
.clr-sw{position:relative;overflow:hidden;height:76px;border-radius:8px;border:1px solid var(--cborder);padding:10px;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start}
.clr-sw.is-alpha::before{content:"";position:absolute;inset:0;background-image:linear-gradient(45deg,rgba(0,0,0,.07) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.07) 75%),linear-gradient(45deg,rgba(0,0,0,.07) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.07) 75%);background-size:12px 12px;background-position:0 0,6px 6px}
.dark .clr-sw.is-alpha::before{background-image:linear-gradient(45deg,rgba(255,255,255,.08) 25%,transparent 25%,transparent 75%,rgba(255,255,255,.08) 75%),linear-gradient(45deg,rgba(255,255,255,.08) 25%,transparent 25%,transparent 75%,rgba(255,255,255,.08) 75%)}
.clr-sw>*{position:relative;z-index:1}
.clr-hex{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;font-weight:600;line-height:1.4}
.clr-mode{font-size:.62rem;opacity:.75;line-height:1.4}
.clr-sw.st-dark{color:#0f172a}.clr-sw.st-light{color:#f8fafc}
.clr-map{margin-top:10px;padding-top:8px;border-top:1px dashed var(--cdash);font-size:.72rem;color:var(--cmt)}
.clr-map b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:600;color:var(--ctx)}
.clr-chart{background:var(--cbg);border:1px solid var(--cbd);border-radius:10px;padding:16px;margin-top:12px}
.clr-chart-row{display:flex;gap:10px;margin-top:10px}
.clr-chart-item{flex:1;min-width:0}
.clr-chart-item .clr-sw{height:54px;padding:8px}
.clr-chart-item .clr-name{margin-top:6px;padding-left:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.6rem;color:var(--cmt)}
</style>
<input type="radio" class="clr-tab-ipt" id="clr-tb-light" name="clr-tab-mode" checked>
<input type="radio" class="clr-tab-ipt" id="clr-tb-dark" name="clr-tab-mode">
<div class="clr-tabbar">
<label class="clr-tab" for="clr-tb-light">浅色模式</label>
<label class="clr-tab" for="clr-tb-dark">深色模式</label>
</div>
<div class="clr-grid">
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--background</span><span class="clr-use">页面背景</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#ffffff"><span class="clr-hex">#ffffff</span><span class="clr-mode">white</span></div>
    <div class="clr-sw sw-dark st-light" style="background:#020618"><span class="clr-hex">#020618</span><span class="clr-mode">slate-950</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>white ↔ slate-950</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--foreground</span><span class="clr-use">主文字色</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-light" style="background:#020618"><span class="clr-hex">#020618</span><span class="clr-mode">slate-950</span></div>
    <div class="clr-sw sw-dark st-dark" style="background:#f8fafc"><span class="clr-hex">#f8fafc</span><span class="clr-mode">slate-50</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-950 ↔ slate-50</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--card / --popover</span><span class="clr-use">卡片/弹层背景</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#ffffff"><span class="clr-hex">#ffffff</span><span class="clr-mode">white</span></div>
    <div class="clr-sw sw-dark st-light" style="background:#020919"><span class="clr-hex">#020919</span><span class="clr-mode">深蓝黑</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>white ↔ 深蓝黑</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--primary</span><span class="clr-use">主操作色（暗色反转）</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-light" style="background:#0f172b"><span class="clr-hex">#0f172b</span><span class="clr-mode">slate-900</span></div>
    <div class="clr-sw sw-dark st-dark" style="background:#e2e8f0"><span class="clr-hex">#e2e8f0</span><span class="clr-mode">slate-200</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-900 ↔ slate-200</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--primary-foreground</span><span class="clr-use">主色上的文字</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#f8fafc"><span class="clr-hex">#f8fafc</span><span class="clr-mode">slate-50</span></div>
    <div class="clr-sw sw-dark st-light" style="background:#0f172b"><span class="clr-hex">#0f172b</span><span class="clr-mode">slate-900</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-50 ↔ slate-900</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--secondary / --muted / --accent</span><span class="clr-use">次级/强调背景</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#f1f5f9"><span class="clr-hex">#f1f5f9</span><span class="clr-mode">slate-100</span></div>
    <div class="clr-sw sw-dark st-light" style="background:#1d293d"><span class="clr-hex">#1d293d</span><span class="clr-mode">深蓝灰</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-100 ↔ 深蓝灰</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--secondary-foreground / --accent-foreground</span><span class="clr-use">次级/强调上文字</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-light" style="background:#0f172b"><span class="clr-hex">#0f172b</span><span class="clr-mode">slate-900</span></div>
    <div class="clr-sw sw-dark st-dark" style="background:#f8fafc"><span class="clr-hex">#f8fafc</span><span class="clr-mode">slate-50</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>—</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--muted-foreground</span><span class="clr-use">次级说明文字</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-light" style="background:#62748e"><span class="clr-hex">#62748e</span><span class="clr-mode">slate-500</span></div>
    <div class="clr-sw sw-dark st-dark" style="background:#90a1b9"><span class="clr-hex">#90a1b9</span><span class="clr-mode">slate-400</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-500 ↔ slate-400</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--destructive</span><span class="clr-use">危险操作（删除等）</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-light" style="background:#e7000b"><span class="clr-hex">#e7000b</span><span class="clr-mode">red-600</span></div>
    <div class="clr-sw sw-dark st-light" style="background:#ff6467"><span class="clr-hex">#ff6467</span><span class="clr-mode">red-400</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>red-600 ↔ red-400</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--border</span><span class="clr-use">边框</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#e2e8f0"><span class="clr-hex">#e2e8f0</span><span class="clr-mode">slate-200</span></div>
    <div class="clr-sw sw-dark st-light is-alpha" style="background:rgba(255,255,255,0.10)"><span class="clr-hex">rgba(255,255,255,0.10)</span><span class="clr-mode">白 10% 透明</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-200 ↔ 白 10%</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--input</span><span class="clr-use">输入框边框</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#e2e8f0"><span class="clr-hex">#e2e8f0</span><span class="clr-mode">slate-200</span></div>
    <div class="clr-sw sw-dark st-light is-alpha" style="background:rgba(255,255,255,0.15)"><span class="clr-hex">rgba(255,255,255,0.15)</span><span class="clr-mode">白 15% 透明</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>同 border ↔ 白 15%</b></div>
</div>
<div class="clr-card">
  <div class="clr-head"><span class="clr-token">--ring</span><span class="clr-use">焦点环</span></div>
  <div class="clr-pair">
    <div class="clr-sw sw-light st-dark" style="background:#90a1b9"><span class="clr-hex">#90a1b9</span><span class="clr-mode">slate-400</span></div>
    <div class="clr-sw sw-dark st-light" style="background:#6a7282"><span class="clr-hex">#6a7282</span><span class="clr-mode">slate-500</span></div>
  </div>
  <div class="clr-map">色阶映射：<b>slate-400 ↔ slate-500</b></div>
</div>
</div>
<div class="clr-chart">
  <div class="clr-head"><span class="clr-token">--chart-1 ~ --chart-5</span><span class="clr-use">图表序列色</span></div>
  <div class="clr-chart-row sw-light">
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#f54900"><span class="clr-hex">#f54900</span></div><div class="clr-name">chart-1</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#009689"><span class="clr-hex">#009689</span></div><div class="clr-name">chart-2</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#104e64"><span class="clr-hex">#104e64</span></div><div class="clr-name">chart-3</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-dark" style="background:#ffb900"><span class="clr-hex">#ffb900</span></div><div class="clr-name">chart-4</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-dark" style="background:#fe9a00"><span class="clr-hex">#fe9a00</span></div><div class="clr-name">chart-5</div></div>
  </div>
  <div class="clr-chart-row sw-dark">
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#1447e6"><span class="clr-hex">#1447e6</span></div><div class="clr-name">chart-1</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#00bc7d"><span class="clr-hex">#00bc7d</span></div><div class="clr-name">chart-2</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-dark" style="background:#fe9a00"><span class="clr-hex">#fe9a00</span></div><div class="clr-name">chart-3</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#ad46ff"><span class="clr-hex">#ad46ff</span></div><div class="clr-name">chart-4</div></div>
    <div class="clr-chart-item"><div class="clr-sw st-light" style="background:#ff2056"><span class="clr-hex">#ff2056</span></div><div class="clr-name">chart-5</div></div>
  </div>
</div>
</div>

### 3.2 Sidebar 专用 token（全部引用主 token）

```
--sidebar: var(--background)            /* 侧边栏背景 = 页面背景（无独立深色栏） */
--sidebar-foreground: var(--foreground)
--sidebar-primary / -primary-foreground: var(--primary) / var(--primary-foreground)
--sidebar-accent / -accent-foreground: var(--accent) / var(--accent-foreground)
--sidebar-border: var(--border)
--sidebar-ring: var(--ring)
```

**设计要点**：侧边栏背景与页面背景同色，靠 `border-e` 分隔线 + 内容间距区分层级，而非深色侧边栏方案。

### 3.3 悬停 / 选中 / 焦点态

| 状态 | 规则 | 源码 |
|---|---|---|
| 主按钮 hover | 主色透明度 90% | `hover:bg-primary/90` |
| 次级按钮 hover | `hover:bg-secondary/80` | `button.tsx` |
| 描边按钮 hover | 切换为 accent 背景 | `hover:bg-accent hover:text-accent-foreground` |
| 危险按钮 hover | `hover:bg-destructive/90` | `button.tsx` |
| 侧边栏菜单项 hover | `hover:bg-sidebar-accent` | `sidebar.tsx` |
| 侧边栏菜单**选中** | `data-[active=true]:bg-sidebar-accent` ＋ `font-medium` 加粗 | `sidebar.tsx` |
| 焦点环 | `focus-visible:ring-[3px] ring-ring/50`；无效输入 `ring-destructive/20`（暗色 40%） | `button/input.tsx` |

### 3.4 暗色模式映射规则

- **背景与前景对调**：`--background` ↔ `--foreground` 互换主次（白↔深蓝黑、黑↔白）。
- **主色反色**：亮色近黑（slate-900）→ 暗色近白（slate-200），保证按钮在暗背景上的对比度。
- **边框降噪**：实色边框（slate-200）→ 白色低透明度（10%），暗色下更柔和。
- **危险色提亮**：深红（#e7000b）→ 亮红（#ff6467），暗色下保持可辨识。
- **实现方式**：`.dark` 选择器下覆盖同名 CSS 变量（`@custom-variant dark (&:is(.dark *))`），组件无需任何改动即可换肤。

**代码示例**（来源：`src/styles/theme.css`、`src/context/theme-provider.tsx`、`src/components/ui/button.tsx`）：

```css
/* src/styles/theme.css（摘录）*/
/* 亮色 token：以 slate 为基色 */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);                       /* #ffffff  页面背景 */
  --foreground: oklch(0.129 0.042 264.695);         /* #020618  主文字 */
  --primary: oklch(0.208 0.042 265.755);            /* #0f172b  主色（近黑） */
  --primary-foreground: oklch(0.984 0.003 247.858); /* #f8fafc  主色上的文字 */
  --secondary: oklch(0.968 0.007 247.896);          /* #f1f5f9  次级背景 */
  --muted-foreground: oklch(0.554 0.046 257.417);   /* #62748e  次级文字 */
  --destructive: oklch(0.577 0.245 27.325);         /* #e7000b  危险色 */
  --border: oklch(0.929 0.013 255.508);             /* #e2e8f0  边框 */
  --ring: oklch(0.704 0.04 256.788);                /* #90a1b9  焦点环 */
}

/* 暗色：在 .dark 下覆盖同名变量即可换肤 */
.dark {
  --background: oklch(0.129 0.042 264.695);         /* #020618  暗背景 */
  --foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);            /* #e2e8f0  主色反色（近白） */
  --destructive: oklch(0.704 0.191 22.216);         /* #ff6467  危险色提亮 */
  --border: oklch(1 0 0 / 10%);                     /* 白色 10% 透明 */
}
```

```tsx
// src/context/theme-provider.tsx（摘录）
// 主题存 cookie 'vite-ui-theme'（dark/light/system），通过 <html class> 切换
const setTheme = (theme: Theme) => {
  setCookie(storageKey, theme, 60 * 60 * 24 * 365)  // 1 年有效期
  _setTheme(theme)
}
useEffect(() => {
  const root = document.documentElement
  root.classList.remove('light', 'dark')           // 关键：给根加 .dark 触发 CSS 变量覆盖
  root.classList.add(resolvedTheme)
}, [resolvedTheme])
```

```tsx
// src/components/ui/button.tsx（摘录）
// 悬停规律：主色 90% 透明度，焦点环 3px
'inline-flex ... rounded-md text-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50'
default:     'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90'
```

**运行效果（dashboard 暗色模式）**：背景翻转为 #020618（slate-950），主色按钮翻转为 #e2e8f0 浅色，边框降噪为白 10% 透明。

![dashboard 暗色模式：背景 #020618、主色反转为浅色、边框白 10%](/blog/shadcn-admin/07-dashboard-dark.png)

**运行效果（登录页暗色）**：卡片 #020919 深蓝黑、Sign in 按钮反色为浅底深字，GitHub/Facebook 描边按钮在暗背景下的可读性适配。

![登录页暗色模式：CardTitle、Form 标签、Input 边框在暗色下的色彩映射](/blog/shadcn-admin/09-signin-dark.png)

---

## 4. Typography

### 4.1 字体家族

| Token | 定义 | 说明 |
|---|---|---|
| `--font-inter` | `'Inter', 'sans-serif'` | 预置 Inter 可变字体（`wght 100-900, opsz 14-32`），可作全局 UI 字体 |
| `--font-manrope` | `'Manrope', 'sans-serif'` | 预置 Manrope（`wght 200-800`），用于展示性描述文本（如设置页 FormDescription） |

正文未显式指定 `font-family`，走 Tailwind 默认 sans 栈；将 `--font-sans` 指向 Inter 即可全局启用。

### 4.2 字号 / 字重 / 颜色层级

| 层级 | 字号 | 字重 | 颜色 | 示例源码 |
|---|---|---|---|---|
| 页面 H1 | 24px（`text-2xl`） | 700 bold | foreground（#020618） | `Dashboard` 页：`text-2xl font-bold tracking-tight` |
| 页面 H1（settings 放大） | 30px（`md:text-3xl`） | 700 | foreground | `settings/index.tsx` |
| 区块 H2 | 24px（`text-2xl`） | 700 | foreground | `tasks` 页标题 |
| 卡片标题（默认） | 继承 | 600 semibold，`leading-none` | card-foreground | `CardTitle` 基类 |
| 登录卡标题 | 18px（`text-lg`） | 500，`tracking-tight` | — | `auth/sign-in` 的 CardTitle |
| 统计卡小标题 | 14px（`text-sm`） | 500 medium | — | `CardTitle text-sm font-medium` |
| 正文 / 表单 / 菜单 | 14px（`text-sm`） | 400 | foreground | 按钮、菜单项、CardDescription |
| 指标大数字 | 24px（`text-2xl`） | 700 | foreground | `$45,231.89` |
| 次级说明 | 12px（`text-xs`） | 400 | **muted-foreground**（#62748e） | 指标副文本、Badge 数字 |
| 占位符 | 14px | 400 | `placeholder:text-muted-foreground` | Input |

**文字颜色分层**：主内容 `foreground` → 描述/辅助 `muted-foreground` → 占位符 `muted-foreground`；危险文字用 `text-destructive`。

**代码示例**（来源：`index.html`、`src/features/dashboard/index.tsx`、`src/features/settings/index.tsx`）：

```html
<!-- index.html（摘录） -->
<!-- 预加载 Inter (variable 100-900) 与 Manrope (200-800) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=Manrope:wght@200..800&display=swap"
  rel="stylesheet"
/>
```

```tsx
// src/features/dashboard/index.tsx（摘录）
// 三级字阶：页面标题 24px/700 → 指标 24px/700 → 卡标题 14px/500 → 副说明 12px/400
<h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>      {/* 24px / 700 */}

<CardHeader>
  <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle> {/* 14px / 500 */}
</CardHeader>
<CardContent>
  <div className='text-2xl font-bold'>$45,231.89</div>                {/* 24px / 700 指标 */}
  <p className='text-xs text-muted-foreground'>                        {/* 12px / muted-foreground */}
    +20.1% from last month
  </p>
</CardContent>
```

```tsx
// src/features/settings/index.tsx（摘录）
// H1 移动端 24px → 桌面端 30px（md:text-3xl），副描述用 muted-foreground
<h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Settings</h1>
<p className='text-muted-foreground'>Manage your account settings and set e-mail preferences.</p>
```

**运行效果（Settings 页）**：H1 在 1440px 视口下放大到 30px/700；二级区块标题（如 Profile、Username）继承 CardTitle 字阶；Form 标签、表单说明、占位符、URL 文本形成完整文字层级（24/20/14/12px + foreground/muted-foreground）。

![Settings 页 Typography 层级：H1 30px、二级标题 18px、表单 14px、说明 12px/muted](/blog/shadcn-admin/10-settings-light.png)

---

## 5. 组件视觉属性

### 5.1 圆角系统（`--radius: 0.625rem = 10px` 为基准）

| Token | 计算 | 数值 | 应用 |
|---|---|---|---|
| `--radius-sm` | `--radius - 4px` | 6px | — |
| `--radius-md` | `--radius - 2px` | 8px | Button、Input、Badge、菜单项 |
| `--radius-lg` | `--radius` | 10px | floating 侧边栏 |
| `--radius-xl` | `--radius + 4px` | 14px | **Card**、inset 内容区 |

### 5.2 阴影层级（Tailwind v4 内置 token，按实际使用频率）

| 层级 | 数值（近似） | 使用场景 |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgb(0 0 0 / 0.05)` | **默认层**：按钮、Input（13 处） |
| `shadow` | `0 1px 2px 0, 0 1px 3px 0`（v4） | 顶栏滚动后 |
| `shadow-sm` | `0 1px 3px, 0 1px 2px` | **卡片**、floating sidebar |
| `shadow-md` / `shadow-lg` | 加大模糊与偏移 | 下拉菜单、对话框等浮层（lg 4 处） |
| `shadow-xl` | 最大 | 个别浮层 |

### 5.3 边框 / 焦点环

- **边框**：全局 1px（`@apply border-border`，index.css 基础层）；输入框 `border border-input`；侧边栏右侧分隔 `border-e`。
- **焦点环**：`focus-visible:ring-[3px] ring-ring/50`（3px 半透明环）；无效态 `ring-destructive/20`。
- **组件尺寸**：Button `h-9`（36px）/ sm `h-8`（32px）/ lg `h-10`（40px）；Input `h-9`；Badge `px-2 py-0.5 text-xs`；图标 `size-4`（16px，Badge 内 `size-3`）。

**代码示例**（来源：`src/components/ui/button.tsx`、`src/components/ui/card.tsx`、`src/components/ui/input.tsx`）：

```tsx
// src/components/ui/button.tsx（核心摘录）
// 基础：rounded-md (8px) + text-sm + 焦点环 3px
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ... rounded-md text-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 ...",
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',         // 主色按钮
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',             // 危险按钮
        outline:     'border bg-background shadow-xs hover:bg-accent',                          // 描边按钮
        secondary:   'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',   // 次级按钮
        ghost:       'hover:bg-accent hover:text-accent-foreground',                            // 幽灵按钮
        link:        'text-primary underline-offset-4 hover:underline',                        // 文字按钮
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',   // 36px 高
        sm:      'h-8 rounded-md gap-1.5 px-3',     // 32px
        lg:      'h-10 rounded-md px-6',            // 40px
        icon:    'size-9',                          // 36×36 方形
      },
    }
  }
)
```

```tsx
// src/components/ui/card.tsx（摘录）
// Card：rounded-xl (14px) + shadow-sm + py-6 + 内部 gap-6 (24px)
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className
      )}
    />
  )
}
function CardTitle({ className, ...props }) {
  return <div className={cn('leading-none font-semibold', className)} {...props} />
}
function CardDescription({ className, ...props }) {
  return <div className={cn('text-sm text-muted-foreground', className)} {...props} />
}
```

```tsx
// src/components/ui/input.tsx（摘录）
// Input：rounded-md (8px) + h-9 (36px) + border-input + shadow-xs + 焦点环 3px
'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs md:text-sm'
'placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50'
```

**运行效果（Settings 页）**：Card 圆角 14px + shadow-sm、Input/Button 圆角 8px + shadow-xs、focus 时 3px ring — 三种圆角与两种阴影在同一个表单中清晰可辨。

![组件视觉：Card (rounded-xl + shadow-sm) / Input (rounded-md + shadow-xs) / Button (h-9 + 焦点环) 在 Settings 页的实装效果](/blog/shadcn-admin/10-settings-light.png)

---

## 6. 响应式断点适配规则

项目同时使用 **媒体查询断点**（Tailwind v4 默认）与 **容器查询**（`@container/content`）。

### 6.1 媒体查询断点（Tailwind v4 默认）

| 断点 | 宽度 | 典型适配 |
|---|---|---|
| `sm` | 640px | 统计卡网格 `sm:grid-cols-2` |
| `md` | 768px | 侧边栏开始显示（`md:flex`）、Input 字号 `md:text-sm`、inset 边距生效 |
| `lg` | 1024px | 统计卡 `lg:grid-cols-4`、图表区 `lg:grid-cols-7` |
| `xl` | 1280px | 更大屏布局微调 |
| `2xl` | 1536px | — |

### 6.2 容器查询（`@container/content`，作用于 SidebarInset）

| 容器断点 | 宽度 | 用途 |
|---|---|---|
| `@2xl/content` | 672px | 部分组件内部响应 |
| `@4xl/content` | 896px | 部分组件内部响应 |
| `@7xl/content` | 1280px | 内容区锁定 `max-w-7xl` 并居中 |

> 容器查询的妙处：以"内容区实际宽度"而非"视口宽度"为基准，侧边栏折叠/展开后内容区变宽，卡片内部布局随之自适应，与侧边栏状态解耦。

### 6.3 关键断点行为总结

- **< 768px（移动）**：侧边栏变为 288px 抽屉（可覆盖层），顶栏保留；Input 强制 `text-base`（16px）防 iOS 聚焦缩放。
- **768px ~ 1536px**：侧边栏 256px（可折叠为 48px 图标栏），内容区 `px-4 py-6`，卡片网格 1→2→4 列递增。
- **≥ 1280px 容器**：内容区宽至 1280px 封顶居中，不再随视口增长。

**代码示例**（来源：`src/components/layout/main.tsx`、`src/components/layout/authenticated-layout.tsx`、`src/features/dashboard/index.tsx`、`src/components/ui/input.tsx`、`src/components/ui/sidebar.tsx`）：

```tsx
// src/components/layout/authenticated-layout.tsx（摘录）
// SidebarInset 是 content 的容器查询容器
<SidebarInset
  className={cn(
    '@container/content',                                                // 关键：声明 content 容器
    'has-data-[layout=fixed]:h-svh',                                     // fixed 时占满视口
    'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
  )}
>
  {children ?? <Outlet />}
</SidebarInset>
```

```tsx
// src/components/layout/main.tsx（摘录）
// 容器查询：内容容器 >= 80rem(1280px) 时 mx-auto + max-w-7xl 居中
className={cn(
  'px-4 py-6',
  !fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
)}
```

```tsx
// src/features/dashboard/index.tsx（摘录）
// 媒体查询断点：sm 2 列 → lg 4 列；图表 lg 7 列内 4:3 分栏
<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>...</div>
<div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>...</div>
```

```tsx
// src/components/ui/input.tsx（摘录）
// 移动端 text-base 16px 避免 iOS 聚焦缩放；桌面 md:text-sm 14px
'flex h-9 ... rounded-md border ... text-base ... md:text-sm'
```

```tsx
// src/components/ui/sidebar.tsx（摘录）
// 侧边栏：移动端 hidden，md (768px) 以上 flex 显示
'hidden h-svh w-(--sidebar-width) ... md:flex'
```

**运行效果（桌面 1440×900，亮色）**：侧边栏 256px 展开、统计卡 4 列、容器查询触发内容区 1280px 居中。

![桌面 1440：侧边栏 256px 展开 + 统计卡 4 列 + 内容区按容器查询居中](/blog/shadcn-admin/06-dashboard-light.png)

**运行效果（移动 375×812，亮色）**：侧边栏隐藏为抽屉触发器（顶栏第一个图标）、Header 内容 `p-4` 紧凑、统计卡 `grid-cols-1` 单列堆叠，Input 在 iOS 上保持 16px 防缩放。

![移动 375：侧边栏变抽屉触发器 + 统计卡 1 列 + Header 紧凑布局](/blog/shadcn-admin/08-dashboard-mobile.png)

---

## 小结

这套规范的本质是 **shadcn/ui new-york 风格 + slate 基色的标准实现**，可以提炼为几条可直接复用的规则：

1. **布局**：侧边栏 256px（折叠 48px、移动 288px）、顶栏 64px、内容区 1280px 封顶居中、留白 16×24px。
2. **间距**：卡片内 24px、卡片间 16px、标题与描述 6px——四档递进（6/8/16/24）。
3. **色彩**：主色即文字主色（近黑），语义色只预置 destructive，成功/警告需自行引入；暗色模式通过变量反转实现，零组件改动。
4. **字体**：24px 页面标题 / 14px 正文 / 12px 说明的三级字阶 + muted-foreground 次级色。
5. **视觉**：圆角基准 10px（md 8 / xl 14）、卡片 shadow-sm、控件 shadow-xs、焦点环 3px。

如果你要基于它二次开发，直接 fork 后改 `src/styles/theme.css` 里的变量即可完成整套换肤；要切换成深色侧边栏，只需把 `--sidebar-*` 变量改为独立色值。
