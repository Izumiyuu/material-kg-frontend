<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import MnModal from '@/components/mn/MnModal.vue'
import MnSidebar from '@/components/mn/MnSidebar.vue'
import { useTemplateStore } from '@/stores/mn/template'

const templateStore = useTemplateStore()
const { editingTpl, modals, showEditor, templates } = storeToRefs(templateStore)

onMounted(() => {
  templateStore.fetchTemplates()
})
</script>

<template>
  <div class="mn-app">
    <MnSidebar />

    <main class="mn-main">
      <header class="mn-header">
        <div>
          <p class="mn-header-title-kicker">Recipes,</p>
          <h1 class="mn-header-title-main">任务模板配置</h1>
        </div>

        <div class="mn-toolbar">
          <button class="industrial-btn industrial-btn-primary" @click="templateStore.openCreateModal()">
            创建新模板
          </button>
        </div>
      </header>

      <section class="template-grid">
        <article v-for="tpl in templates" :key="tpl.id" class="glass-card project-card">
          <div class="panel-card-header">
            <h2 class="section-title" style="margin: 0">{{ tpl.name }}</h2>
            <span class="badge" :class="tpl.statusClass">{{ tpl.statusText }}</span>
          </div>

          <p class="muted-text" style="margin: 0 0 24px">{{ tpl.description }}</p>

          <div class="modal-stack" style="margin-bottom: 24px">
            <div>
              <p class="field-label">抽取实体类型</p>
              <div class="entity-tags">
                <span v-for="tag in tpl.entities" :key="tag" class="tag-input">{{ tag }}</span>
              </div>
            </div>

            <div v-if="tpl.parseScope && tpl.parseScope.length">
              <p class="field-label">解析范围</p>
              <div class="entity-tags">
                <span v-for="tag in tpl.parseScope" :key="tag" class="tag-input">{{ tag }}</span>
              </div>
            </div>
          </div>

          <div class="project-actions">
            <button class="industrial-btn industrial-btn-ghost" @click="templateStore.editTemplate(tpl)">
              编辑配置
            </button>
            <button class="industrial-btn industrial-btn-primary">一键克隆</button>
          </div>
        </article>
      </section>
    </main>

    <MnModal :show="modals.create" title="创建新任务模板" @close="templateStore.closeCreateModal()">
      <div class="modal-stack">
        <div class="field-group">
          <label class="field-label">模板名称</label>
          <input type="text" placeholder="输入模板名称，如：工艺流程抽取模板" class="industrial-input full" />
        </div>

        <div class="field-group">
          <label class="field-label">业务描述</label>
          <textarea placeholder="简要描述该模板的适用场景..." class="industrial-input full textarea" />
        </div>

        <div class="field-split">
          <div class="field-group">
            <label class="field-label">大模型 Temperature</label>
            <input type="number" step="0.1" value="0.1" class="industrial-input full" />
          </div>
          <div class="field-group">
            <label class="field-label">Max Tokens</label>
            <input type="number" value="4096" class="industrial-input full" />
          </div>
        </div>

        <button class="industrial-btn industrial-btn-primary industrial-btn-block">立即创建并保存</button>
      </div>
    </MnModal>

    <aside class="detail-panel" :class="{ 'is-hidden': !showEditor }">
      <div class="detail-panel-header">
        <h2 class="section-title" style="margin: 0">编辑模板配置</h2>
        <button class="icon-button" @click="templateStore.closeEditor()">✕</button>
      </div>

      <div v-if="editingTpl" class="modal-stack">
        <div class="field-group">
          <label class="field-label">模板名称</label>
          <input v-model="editingTpl.name" type="text" class="industrial-input full" />
        </div>

        <div class="field-group">
          <label class="field-label">JSON 配置定义</label>
          <div style="position: relative">
            <textarea v-model="editingTpl.configJson" class="industrial-input full editor-textarea" />
            <span class="config-note mono">JSON Format</span>
          </div>
        </div>

        <button class="industrial-btn industrial-btn-primary industrial-btn-block">保存模板变更</button>
        <button class="industrial-btn industrial-btn-ghost industrial-btn-block">重置为预置版本</button>
      </div>
    </aside>
  </div>
</template>
