<script setup>
import { reactive, watch, defineProps, defineEmits } from 'vue'
import MnModal from '@/components/mn/MnModal.vue'

const props = defineProps({
  show: Boolean,
  projectId: String,
  availableDocs: Array,
  availableTemplates: Array
})

const emit = defineEmits(['close', 'submit'])

const taskForm = reactive({
  step_name: 'parse',
  document_ids: [],
  template_id: null
})

function resetTaskForm() {
  taskForm.step_name = 'parse'
  taskForm.document_ids = []
  taskForm.template_id = null
}

watch(() => props.show, (visible) => {
  if (visible) {
    resetTaskForm()
  }
})

function toggleDoc(docId) {
  const index = taskForm.document_ids.indexOf(docId)
  if (index > -1) {
    taskForm.document_ids.splice(index, 1)
  } else {
    taskForm.document_ids.push(docId)
  }
}

function handleSubmit() {

  if (!taskForm.template_id&&taskForm.step_name === 'kg_extract') {
    alert('请选择任务模板')
    return
  }
  emit('submit', { ...taskForm })
  resetTaskForm()
}
</script>

<template>
  <MnModal :show="show" title="手动添加任务" @close="emit('close')">
    <div class="modal-stack">
      <div class="field-group">
        <label class="field-label">任务步骤 (Step)</label>
        <select v-model="taskForm.step_name" class="industrial-input full">
          <option value="parse">文献解析 (Parse)</option>
          <option value="kg_extract">知识抽取 (KG Extract)</option>
        </select>
      </div>

      <div class="field-group" v-if="taskForm.step_name !== 'parse'">
        <label class="field-label">选择任务模板</label>
        <select v-model="taskForm.template_id" class="industrial-input full">
          <option :value="null" disabled>请选择任务模板</option>
          <option v-for="tpl in availableTemplates" :key="tpl.id" :value="tpl.id">
            {{ tpl.name }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">选择目标文献 ID 列表</label>
        <div class="checklist" style="max-height: 200px; overflow-y: auto;">
          <label 
            v-for="doc in filteredAvailableDocs" 
            :key="doc.id" 
            class="check-item"
          >
            <input 
              type="checkbox" 
              :checked="taskForm.document_ids.includes(doc.id)"
              @change="toggleDoc(doc.id)"
            >
            <span>{{ doc.name }}</span>
          </label>

          <!-- TODO: 筛选出可选的文献，根据任务步骤和已解析/抽取的文献 -->
          <div 
            v-if="!filteredAvailableDocs || filteredAvailableDocs.length === 0" 
            class="muted-text tiny-text" 
            style="padding: 10px;"
          >
            暂无可用的文献，请先在文献管理中上传或完成对应步骤的文献。
          </div>
        </div>
      </div>

      <button 
        class="industrial-btn industrial-btn-primary industrial-btn-block" 
        @click="handleSubmit"
      >
        确认添加并触发任务
      </button>
    </div>
  </MnModal>
</template>
