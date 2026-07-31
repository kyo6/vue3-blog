1.  [什么是中后台系统](https://tdesign.tencent.com/design/offices#%E4%BB%80%E4%B9%88%E6%98%AF%E4%B8%AD%E5%90%8E%E5%8F%B0%E7%B3%BB%E7%BB%9F)
2.  [中后台页面框架的选择](https://tdesign.tencent.com/design/offices#%E4%B8%AD%E5%90%8E%E5%8F%B0%E9%A1%B5%E9%9D%A2%E6%A1%86%E6%9E%B6%E7%9A%84%E9%80%89%E6%8B%A9)
    1.  [页面导航](https://tdesign.tencent.com/design/offices#%E9%A1%B5%E9%9D%A2%E5%AF%BC%E8%88%AA)
    2.  [页面布局](https://tdesign.tencent.com/design/offices#%E9%A1%B5%E9%9D%A2%E5%B8%83%E5%B1%80)
        
3.  [常见的中后台页面](https://tdesign.tencent.com/design/offices#%E5%B8%B8%E8%A7%81%E7%9A%84%E4%B8%AD%E5%90%8E%E5%8F%B0%E9%A1%B5%E9%9D%A2)

## 什么是中后台系统[](https://tdesign.tencent.com/design/offices#%E4%BB%80%E4%B9%88%E6%98%AF%E4%B8%AD%E5%90%8E%E5%8F%B0%E7%B3%BB%E7%BB%9F)

中台系统主要指：响应前后台业务，实现双端的集中管理和价值提取，支持业务创新和精细化运营的数据处理系统。

后台系统主要指：对前端网站信息和数据进行管理的系统，主要面向企业内部的运营和管理人员。

在 Web 前端设计当中，中台与后台具有同质性，可看作同一类型来思考设计方法。通过 TDesign 提供的组件能力快速搭建好用的中后台系统，通常可以分三步：选择合适的页面框架-设计页面间的任务流程-合理使用组件。

## 中后台页面框架的选择[](https://tdesign.tencent.com/design/offices#%E4%B8%AD%E5%90%8E%E5%8F%B0%E9%A1%B5%E9%9D%A2%E6%A1%86%E6%9E%B6%E7%9A%84%E9%80%89%E6%8B%A9)

页面框架由「页面导航」与「页面布局」两部分组成。同时，TDesign 提供常见的页面模版，可根据需要直接选择合适的模版。

### 页面导航[](https://tdesign.tencent.com/design/offices#%E9%A1%B5%E9%9D%A2%E5%AF%BC%E8%88%AA)

导航是指：在页面中引导用户找到功能和理解信息层级，可分为整站导航与区域导航两大类。

| 导航分类 |               定义                |            相关组件            |
|------|---------------------------------|----------------------------|
| 整站导航 | 对整个网站系统的最大颗粒度模块的引导，也称为全局导航或总导航。 |            导航菜单            |
| 区域导航 |  对某一模块下的页面，进行引导和分类的导航，也称为情景导航。  | 固钉 、锚点、面包屑、下拉菜单、分页、步骤条、选项卡 |

![](https://oteam-tdesign-1258344706.cos.ap-guangzhou.myqcloud.com/site/design/20211215163954.png)

### 页面布局[](https://tdesign.tencent.com/design/offices#%E9%A1%B5%E9%9D%A2%E5%B8%83%E5%B1%80)

页面布局是指：将导航和信息内容在页面中进行合理安排和分布，由「[栅格](https://tdesign.tencent.com/vue/components/grid)」和「[布局](https://tdesign.tencent.com/vue/components/layout)」组成。

不同布局的选择依据，通常为：1 功能模块的数量。2 功能与功能之间的相关性。

TDesign主要提供3种布局方式：上下布局、左右布局、混合布局。

#### 上下结构的布局[](https://tdesign.tencent.com/design/offices#%E4%B8%8A%E4%B8%8B%E7%BB%93%E6%9E%84%E7%9A%84%E5%B8%83%E5%B1%80)

主要特征：导航在上信息内容在下的布局。横向导航空间有限，左右点击效率低。

何时使用：1 功能模块数量较少时（一般小于 9 个）。2 各模块间关联较弱、需要做明确区分或无需频繁切换时。

#### 左右结构的布局[](https://tdesign.tencent.com/design/offices#%E5%B7%A6%E5%8F%B3%E7%BB%93%E6%9E%84%E7%9A%84%E5%B8%83%E5%B1%80)

主要特征：导航在左信息内容在右的布局。纵向空间具有较好延展性，上下点击效率高。

何时使用：1 功能模块数量较多时。2 各模块间有一定相关性、或需要在模块间频繁切换时。

#### 混合结构的布局[](https://tdesign.tencent.com/design/offices#%E6%B7%B7%E5%90%88%E7%BB%93%E6%9E%84%E7%9A%84%E5%B8%83%E5%B1%80)

主要特征：将上下、左右相结合的综合布局。横纵空间优势互补，在展示和操作上都具有较好的延展性和包容性。

何时使用：1 功能模块数量较多时。2 各模块间有父子或交叉关系、 需要按层级展示时。

![](https://oteam-tdesign-1258344706.cos.ap-guangzhou.myqcloud.com/site/design/20211215164005.png)

## 常见的中后台页面[](https://tdesign.tencent.com/design/offices#%E5%B8%B8%E8%A7%81%E7%9A%84%E4%B8%AD%E5%90%8E%E5%8F%B0%E9%A1%B5%E9%9D%A2)

TDesign提供了中后台系统常见的页面模板，涵盖多种高频任务在页面中的典型布局方式。

| 典型页面模板 |                  相关高频任务                  |
|--------|------------------------------------------|
|  仪表盘   |            数据筛选与查询、效果预览、新手指引             |
|  列表页   | 数据筛选与查询、表格批量操作、数据导入、效果预览、状态流转、任务引导 、新手指引 |
|  表单页   |          数据筛选与查询、任务引导、效果预览、新手指引          |
|  详情页   |          数据筛选与查询、状态流转、数据导入、效果预览          |
|  结果页   |              状态流转、新手指引、任务引导              |
|  个人页   |                新手指引、效果预览                 |
|  登录页   |                新手指引、任务引导                 |