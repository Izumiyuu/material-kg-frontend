# Material KG Frontend

基于 `Vue 3 + Vite + Vue Router + Pinia` 的前端工程。本项目是整个 Material KG（材料知识图谱）系统的前端仓库，供全组人员协作开发，包含多个子模块。

## 目录说明

- `src/views`：页面视图组件（按模块划分，如 `mn` 模块等）
- `src/components`：各模块及全站复用的组件（侧边栏、弹窗、图标等）
- `src/stores`：基于 Pinia 的页面状态与跨组件通讯
- `src/services`：服务层（API 请求封装，后续接入后端真实接口）
- `src/mock`：本地开发与演示使用的 mock 数据

## 运行方式

```bash
npm install
npm run dev
```

## 模块介绍

### mn 模块（管理端）
包含系统的仪表盘、文献管理、模板管理与项目管理等功能。
- **路由路径**：
  - `/mn/manage` (目前默认访问 `/` 会重定向至此)
  - `/mn/literature`
  - `/mn/template`
  - `/mn/project`
- **实现说明**：采用普通 CSS 与 Vue SFC 编写，未使用 Tailwind；组件间状态管理统一通过 Pinia 维护。

*(其他模块信息待补充...)*

## 开发代理

项目已在 `vite.config.js` 中配置了统一的开发环境代理，解决前后端分离的跨域问题：
- 前端请求 `/api/*`
- Vite 自动代理到后端服务 `http://localhost:8000`

## 团队协作规约

- **组件通信**：严禁通过多层 Props 钻取传递数据，涉及多组件联动的状态必须使用 Pinia Store 管理。
- **接口联调**：后端 API 未就绪时，优先在 `src/mock` 中补充结构并由 `src/services` 返回 Promise 占位，确保视图层不受影响。
