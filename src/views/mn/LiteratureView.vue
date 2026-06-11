<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import MnModal from '@/components/mn/MnModal.vue'
import MnSidebar from '@/components/mn/MnSidebar.vue'
import { useLiteratureStore } from '@/stores/mn/literature'

const literatureStore = useLiteratureStore()
const {
  filteredLiterature,
  modals,
  searchQuery,
  selectedDoc,
  showDetail,
  statusFilter,
  uploading,
  uploadPercent,
  uploadStatus,
} = storeToRefs(literatureStore)

const zipInput = ref(null)
const pdfInput = ref(null)

onMounted(() => {
  literatureStore.fetchLiterature()
})

function triggerMockUpload() {
  literatureStore.startMockUpload()
  window.setTimeout(() => {
    literatureStore.finishMockUpload()
  }, 900)
}
</script>

<template>
  <div class="mn-app">
    <MnSidebar />

    <main class="mn-main">
      <header class="mn-header">
        <div>
          <p class="mn-header-title-kicker">Library,</p>
          <h1 class="mn-header-title-main">文献管理中心</h1>
        </div>

        <div class="mn-toolbar">
          <button class="industrial-btn industrial-btn-ghost" @click="literatureStore.openModal('batchImport')">
            批量导入 (ZIP)
          </button>
          <button class="industrial-btn industrial-btn-primary" @click="literatureStore.openModal('upload')">
            上传文献
          </button>
        </div>
      </header>

      <section class="glass-card">
        <div class="toolbar-panel">
          <div class="toolbar-filters">
            <input v-model="searchQuery" type="text" placeholder="搜索文献名称、作者..." class="industrial-input" />
            <select v-model="statusFilter" class="industrial-input">
              <option value="all">所有状态</option>
              <option value="pending">待审核</option>
              <option value="passed">已通过</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>
          <span class="toolbar-meta mono">共 {{ filteredLiterature.length }} 篇文献</span>
        </div>

        <table class="industrial-table">
          <thead>
            <tr>
              <th>文献ID</th>
              <th>文件名称</th>
              <th>作者</th>
              <th>上传时间</th>
              <th>审计状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in filteredLiterature" :key="doc.id">
              <td class="mono tiny-text">{{ doc.id }}</td>
              <td><strong>{{ doc.name }}</strong></td>
              <td>{{ doc.author }}</td>
              <td class="muted-text">{{ doc.uploadTime }}</td>
              <td><span class="badge" :class="doc.statusClass">{{ doc.statusText }}</span></td>
              <td>
                <button class="link-button" @click="literatureStore.openDetail(doc)">审计详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <MnModal :show="modals.batchImport" title="批量上传导入文献 (ZIP)" @close="literatureStore.closeModal('batchImport')">
      <div class="modal-stack">
        <div>
          <label class="field-label">上传 ZIP 压缩包 (支持大文件流式上传)</label>
          <div class="upload-dropzone" @click="zipInput?.click()">
            <div class="upload-icon">📦</div>
            <p>点击选择或拖拽 ZIP 文件到此处</p>
            <p class="tiny-text" style="color: var(--primary)">支持 3GB+ 大文件，流式传输不占内存</p>
            <input ref="zipInput" type="file" accept=".zip" class="hidden-input" @change="triggerMockUpload" />
          </div>
        </div>

        <div v-if="uploading" class="upload-progress">
          <div class="upload-progress-meta">
            <span>{{ uploadStatus }}</span>
            <span style="color: var(--primary)">{{ uploadPercent }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: `${uploadPercent}%` }" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="industrial-btn industrial-btn-ghost" @click="literatureStore.closeModal('batchImport')">
            关闭
          </button>
        </div>
      </div>
    </MnModal>

    <MnModal :show="modals.upload" title="上传单篇文献 (PDF)" @close="literatureStore.closeModal('upload')">
      <div class="modal-stack">
        <div class="upload-dropzone" @click="pdfInput?.click()">
          <div class="upload-icon">📄</div>
          <p>选择 PDF 文件</p>
          <input ref="pdfInput" type="file" accept=".pdf" class="hidden-input" />
        </div>

        <div class="field-group">
          <label class="field-label">手动备注 (可选)</label>
          <input type="text" placeholder="输入备注信息..." class="industrial-input full" />
        </div>

        <button class="industrial-btn industrial-btn-primary industrial-btn-block">
          开始上传并自动解析
        </button>
      </div>
    </MnModal>

    <aside class="detail-panel" :class="{ 'is-hidden': !showDetail }">
      <div class="detail-panel-header">
        <h2 class="section-title" style="margin: 0">文献审计详情</h2>
        <button class="icon-button" @click="literatureStore.closeDetail()">✕</button>
      </div>

      <div v-if="selectedDoc" class="modal-stack">
        <div class="preview-box">
          PDF 预览加载中... ({{ selectedDoc.name }})
        </div>

        <div class="detail-grid">
          <div>
            <p class="field-label">标题</p>
            <p>{{ selectedDoc.name }}</p>
          </div>
          <div>
            <p class="field-label">文件大小</p>
            <p>4.2 MB</p>
          </div>
          <div>
            <p class="field-label">页数</p>
            <p>12 Pages</p>
          </div>
          <div>
            <p class="field-label">自动提取状态</p>
            <p style="color: var(--success); font-weight: 600">Success</p>
          </div>
        </div>

        <div class="modal-actions" style="justify-content: stretch">
          <button class="industrial-btn industrial-btn-primary industrial-btn-block">通过审计</button>
          <button class="industrial-btn industrial-btn-danger industrial-btn-block">驳回文献</button>
        </div>
      </div>
    </aside>
  </div>
</template>
