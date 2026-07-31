## Monorepo 组件库架构的改造

我已经完成了 Vue 2 项目向 Monorepo 组件库架构的改造。

### 改造内容总结：

1.  **基础设施建设**:
    - 在根目录 `package.json` 中配置了 `workspaces`，支持 `packages/*` 和 `examples`。
    - 建立了 `build/` 目录，配置了 `rollup.config.js` 和 `build-all.js`，支持一键构建所有组件包。
    - 安装了 Rollup、Babel、PostCSS 等必要的构建依赖。

2.  **组件迁移与解耦**:
    - **`packages/shared`**: 提取了 `src/utils` 中的通用工具函数（如日期格式化、校验逻辑）。
    - **`packages/pro-layout`**: 迁移了原 `src/layout` 的逻辑，并进行了初步解耦（如支持通过 props 传入 `title` 和 `logo`）。
    - **`packages/pro-table`**: 封装了 `ProTable` 组件，集成了原有的 `ColumnSetting` 和 `TableHeaderPopover` 功能。

3.  **演示环境 (Examples)**:
    - 初始化了 `examples/` 目录，配置了独立的 Vue CLI 环境。
    - 通过 Webpack Alias 实现了对 `packages` 源码的直接引用，支持开发时的热更新。
    - 创建了 `TableDemo.vue` 展示 `ProTable` 的基本用法。

4.  **方案文档**:
    - 生成了 `design-pro-components.md`，详细记录了目录结构、使用方法及后续规划。

### 如何开始使用：

- **构建组件库**:
  ```bash
  node build/build-all.js
  ```
- **运行示例项目**:
  ```bash
  npm run dev --prefix examples
  ```

详细方案请参阅根目录下的 `design-pro-components.md`。

## 继续分析 npm run dev --prefix examples 报错的原因

经过分析，`npm run dev --prefix examples` 报错的主要原因是：**`examples` 项目无法正确解析并转换 `packages` 目录中的高级 JS 语法（如可选链 `?.`）**。

### 具体原因分析：

1.  **语法冲突**: 在 `packages/pro-table/src/components/TableHeaderPopover/index.vue` 的第 204 行使用了可选链语法：

    ```javascript
    if (this.resetValue && this.resetValue?.length) {
    ```

    由于 `examples` 是基于 Vue CLI 4 的项目，默认情况下 Babel 只会转换项目根目录（即 `examples/src`）下的代码。

2.  **跨目录转换失效**: 即使在 `vue.config.js` 中配置了 `transpileDependencies`，由于 `packages` 目录位于 `examples` 之外，且我们通过 Webpack Alias 直接引用了源码，Vue CLI 的默认配置未能将其纳入 Babel 的编译范围。这导致 Webpack 在解析这些文件时遇到了它不认识的 `?.` 符号，从而抛出 `Module parse failed: Unexpected token` 错误。

3.  **依赖缺失**: `examples/package.json` 中缺少 `@vue/cli-plugin-babel`，这可能导致 Babel 配置未能完全生效。

### 已执行的修复操作：

1.  **更新 `examples/vue.config.js`**:
    - 将 `transpileDependencies` 修改为指向 `packages` 的绝对路径。
    - 在 `chainWebpack` 中显式将 `../packages` 目录添加到 `babel-loader` 的 `include` 范围内，确保其中的 `.js` 和 `.vue` 文件都能被正确转换。

2.  **完善 `examples/package.json`**:
    - 添加了 `@vue/cli-plugin-babel` 依赖，确保编译环境完整。

### 建议操作：

请在根目录下重新运行以下命令以同步依赖并启动：

```bash
# 1. 在根目录安装依赖（确保 link 正常）
npm install --legacy-peer-deps

# 2. 启动示例项目
npm run dev --prefix examples
```

如果仍然报错，请检查是否需要清理 `examples` 下的缓存：`rm -rf examples/node_modules/.cache`。

## ProLayout 菜单配置与动态菜单

现在的 ProLayout 还非常简陋，菜单数据还耦合在 vuex 中。在正常的业务中需要用户通过 props 设置菜单。同时支持动态菜单的功能。

通过查看代码，我确认了目前的实现情况：

1.  **`ProLayout` (`packages/pro-layout/src/index.vue`)**:
    - 通过 `currentMenuVersion` 切换一级侧边栏 (`Sidebar`) 和 分组侧边栏 (`GroupSideBar`)。
    - 包含二级侧边栏 (`ChildSideBar`)。
    - 目前只接收 `title` 和 `logo` 两个 props，菜单数据完全依赖 Vuex。

2.  **`Sidebar` (`packages/pro-layout/src/components/Sidebar/index.vue`)**:
    - 直接使用 `mapGetters(['permission_routes'])` 获取路由数据进行渲染。

为了支持通过 props 设置菜单和动态菜单，我计划进行以下修改：

### 实现思路 1

1.  **在 `ProLayout` 增加 `menu` 属性**：
    - 增加 `menu` (或 `routes`) prop，类型为 `Array`。
    - 在 `computed` 中定义一个 `finalMenu`，如果用户传了 `menu` prop 则使用它，否则回退到 Vuex 的 `permission_routes`。这样可以保证向后兼容。

2.  **向下传递菜单数据**：
    - 将 `finalMenu` 传递给 `Sidebar`、`GroupSideBar` 和 `ChildSideBar`。

3.  **修改子组件**：
    - 修改 `Sidebar` 等组件，使其优先接收并使用 props 中的菜单数据。

4.  **支持二级菜单联动**：
    - 目前 `hasChildSidebar` 依赖于 Vuex 中的 `activeChildMenu`。如果使用自定义菜单，可能也需要支持自定义的二级菜单逻辑。

接来下，我需要查看 `GroupSideBar` 和 `ChildSideBar` 的实现，以及 `SidebarItem` 的结构。

分析完代码后，我发现当前的 `ProLayout` 高度依赖 Vuex 来管理菜单数据和选中状态。特别是在 `GroupSideBar`（分组模式）下，它不仅读取 Vuex 里的菜单，还通过 Vuex 的 Mutation 来记录当前的“激活菜单”和“二级菜单”。

为了实现“通过 props 设置菜单”并支持“动态菜单”，我制定了以下计划：

### 实现思路 2

1.  **统一菜单来源**：在 `ProLayout` 增加 `menu` prop。通过计算属性 `finalMenu` 来决定是使用 prop 还是 Vuex。
2.  **传递数据**：将 `finalMenu` 向下传递给 `Sidebar`、`GroupSideBar` 等子组件。
3.  **解耦状态管理**：
    - 对于标准的 `Sidebar`，只需修改数据来源。
    - 对于 `GroupSideBar` 和 `ChildSideBar`，它们目前依赖 Vuex 存储的 `active_menu_info`。我们需要在 `ProLayout` 内部管理这个激活状态（如果提供了 `menu` prop），或者让子组件能够接收这个状态作为 prop。
4.  **保持动态响应**：利用 Vue 的响应式系统，当外部传入的 `menu` 变化时，计算属性会自动更新。

- [x] 修改 ProLayout 增加 menu prop 并分发数据
- [-] 修改 Sidebar 组件支持 routes prop
- [ ] 重构 GroupSideBar 和 ChildSideBar 的激活逻辑，支持 props 传递状态

我已完成 ProLayout 菜单解耦与动态化的实现。

### 需求理解

目前的 ProLayout 菜单数据耦合在 Vuex 中，无法通过 props 动态设置。需要实现：

1. 支持通过 `menu` props 传入菜单数据。
2. 解耦 Vuex 依赖，使其在没有 Vuex 菜单数据时也能正常工作。
3. 支持动态菜单切换。
4. 兼容现有的标准模式和分组模式。

### 实现思路

1. **核心组件改造**：在 `ProLayout` 主组件中引入 `menu` prop，并建立内部状态 `internalActiveMenuInfo` 来管理分组模式下的激活状态。
2. **数据流分发**：通过计算属性 `computedMenu` 和 `computedActiveMenuInfo` 统一处理数据来源（优先使用 props，无 props 时回退到 Vuex）。
3. **子组件适配**：
   - `Sidebar`：支持 `routes` prop。
   - `GroupSideBar`：支持 `menu` prop，并在菜单切换时通过事件通知父组件。
   - `ChildSideBar`：支持 `activeMenuInfo` prop，不再强制依赖 Vuex 的 getter。

### 完成的任务

- [x] 修改 `ProLayout` 增加 `menu` prop 并分发数据
- [x] 修改 `Sidebar` 组件支持 `routes` prop
- [x] 重构 `GroupSideBar` 和 `ChildSideBar` 的激活逻辑，支持 props 传递状态

### 关键代码变更

#### ProLayout 核心逻辑

在 `packages/pro-layout/src/index.vue` 中，我们增加了对 `menu` 的支持，并统一了激活菜单的判断逻辑：

```12:17:packages/pro-layout/src/index.vue
    <div :class="{ 'hasTagsView': needTagsView, 'has-child-sidebar': hasChildSidebar }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
```

#### 分组侧边栏适配

`GroupSideBar` 现在可以接收外部菜单，并在切换时通知 `ProLayout`：

```36:51:packages/pro-layout/src/components/GroupSideBar/index.vue
export default {
  name: 'GroupSideBar',
  components: {
    Item,
    Logo,
  },
  props: {
    title: String,
    logo: String,
    menu: {
      type: Array,
      default: () => null
    }
  },
  data() {
    return {
```

#### 二级菜单适配

`ChildSideBar` 现在通过 `activeMenuInfo` prop 获取当前需要展示的子菜单数据：

```35:43:packages/pro-layout/src/components/GroupSideBar/ChildSideBar.vue
export default {
  name: 'ChildSidebar',
  components: { Item },
  props: {
    activeMenuInfo: {
      type: Object,
      default: () => null
    }
  },
```

现在你可以通过给 `ProLayout` 传递 `menu` 属性来实现动态菜单功能了。

### dg-components 组件库构建

我需要：

1. 为 dg-components 创建专门的 rollup 配置
2. 更新 src/index.js 和 src/components.js 实现完整和按需导出
3. 配置样式编译
4. 添加构建脚本

第3步：创建 dg-components 专用的 Rollup 配置:rollup.dg-components.config.js
第4步：创建样式编译脚本 build-style.js
第5步：创建 dg-components 专用构建脚本 build-dg-components.js
第6步：更新根目录 package.json 添加构建脚本,添加build-lib、build-styles、build-lib-watch 脚本
第7步：检查并确保依赖完整 `grep -E '"sass":|"node-sass":' package.json`
第8步：为 dg-components 创建 README.md
第9步：测试构建 `npm run build-lib`

## TODO

1. 解决相对路径引用容易出错的问题： 我需要更新这个引用路径为 `../../../style/pro-layout.scss
2. svg 引用不支持

```js
 <span class="title-txt">表头设置</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      fill="none"
      width="24"
      height="24"
      viewBox="0 0 16 16"
      style="cursor: pointer"
      @click="() => (visible = false)"
    >
      <path d="M5.171572866943359,4.4644658669433595L8.00001986694336,7.292519866943359L10.82842986694336,4.4644658669433595C11.023689866943359,4.26920416694336,11.340269866943359,4.26920416694336,11.53552986694336,4.4644658669433595C11.730799866943359,4.659727866943359,11.730799866943359,4.97631086694336,11.53552986694336,5.171572866943359L8.70751986694336,8.00001986694336L11.53552986694336,10.82842986694336C11.730799866943359,11.023689866943359,11.730799866943359,11.340269866943359,11.53552986694336,11.53552986694336C11.340269866943359,11.730799866943359,11.023689866943359,11.730799866943359,10.82842986694336,11.53552986694336L8.00001986694336,8.70751986694336L5.171572866943359,11.53552986694336C4.97631086694336,11.730799866943359,4.659727866943359,11.730799866943359,4.4644658669433595,11.53552986694336C4.26920416694336,11.340269866943359,4.26920416694336,11.023689866943359,4.4644658669433595,10.82842986694336L7.292519866943359,8.00001986694336L4.4644658669433595,5.171572866943359C4.26920416694336,4.97631086694336,4.26920416694336,4.659727866943359,4.4644658669433595,4.4644658669433595C4.659727866943359,4.26920416694336,4.97631086694336,4.26920416694336,5.171572866943359,4.4644658669433595Z" fill-rule="evenodd" fill="#4E5969" fill-opacity="1" />
    </svg>
  </div>
```
