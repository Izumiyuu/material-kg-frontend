# Material KG Manage Frontend

基于 `Vue 3 + Vite + Vue Router + Pinia` 的管理端前端项目，已将 `before/mn` 下的旧 HTML 页面迁移为 Vue 视图，并保留 `/api` 到 `http://localhost:8000` 的开发代理。

## 目录说明

- `src/views/mn`：`manage`、`literature`、`template`、`project` 4 个页面
- `src/components/mn`：侧边栏、弹窗和图标等公共组件
- `src/stores/mn`：基于 Pinia 的页面状态与组件通讯
- `src/services/mn`：后续可替换为真实接口的服务层
- `src/mock/mn`：当前页面演示使用的 mock 数据

## 运行方式

```bash
npm install
npm run dev
```

## 路由

- `/mn/manage`
- `/mn/literature`
- `/mn/template`
- `/mn/project`

默认访问 `/` 会自动跳转到 `/mn/manage`。

## 开发代理

项目已在 `vite.config.js` 中配置：

- 前端请求 `/api/*`
- Vite 自动代理到 `http://localhost:8000`

## 当前实现说明

- 页面迁移采用普通 CSS 与 Vue SFC，不依赖 Tailwind
- 组件之间的共享状态统一通过 Pinia 管理
- 服务层当前读取 mock 数据，后续可平滑替换成真实后端接口
