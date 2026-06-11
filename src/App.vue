<template>
  <main class="page-shell">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Vue 3 + Vite + JS</p>
        <h1>前端项目已完成跨域配置</h1>
        <p class="hero-text">
          当前项目已通过 Vite 开发代理将 <code>/api</code> 请求转发到
          <code>http://localhost:8000</code>，开发阶段无需直接处理浏览器跨域问题。
        </p>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <span>代理前缀</span>
          <strong>/api</strong>
        </div>
        <div class="meta-card">
          <span>代理目标</span>
          <strong>http://localhost:8000</strong>
        </div>
      </div>
    </section>

    <article class="panel panel-single">
      <div class="panel-head">
        <div>
          <p class="panel-label">当前状态</p>
          <h2>测试页已移除，保留代理能力</h2>
        </div>
        <span class="state-badge" data-state="success">已配置</span>
      </div>

      <ul class="tips-list">
        <li>前端继续使用相对路径，例如 <code>/api/xxx</code>。</li>
        <li>Vite 会自动把请求转发到 <code>http://localhost:8000</code>。</li>
        <li>如果后续要接真实业务接口，直接在页面或 API 封装里发请求即可。</li>
      </ul>
    </article>
  </main>
</template>
