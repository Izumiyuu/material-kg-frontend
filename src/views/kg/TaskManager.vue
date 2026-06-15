<template>
  <div class="task-manager">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span><el-icon><DocumentAdd /></el-icon> 单篇构建</span>
          </template>
          <el-form :model="singleForm" label-width="110px">
            <el-form-item label="文献ID" required>
              <el-input v-model="singleForm.doc_id" placeholder="输入文献ID（已在解析服务中存在）" />
            </el-form-item>
            <el-form-item label="模板ID（可选）">
              <el-select v-model="singleForm.template_id" clearable placeholder="选择模板">
                <el-option v-for="tpl in templates" :key="tpl.id" :label="tpl.name" :value="tpl.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="分块大小">
              <el-input-number v-model="singleForm.chunk_size" :min="200" :max="2000" />
            </el-form-item>
            <el-form-item label="置信度阈值">
              <el-slider v-model="singleForm.confidence_threshold" :min="0" :max="1" :step="0.05" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="startSingleBuild" :loading="building">开始构建</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span><el-icon><Grid /></el-icon> 批量构建</span>
          </template>
          <el-form :model="batchForm" label-width="110px">
            <el-form-item label="文献ID列表">
              <el-input v-model="batchForm.doc_ids_text" type="textarea" :rows="3" placeholder="多个ID用英文逗号分隔，如：doc1,doc2,doc3" />
            </el-form-item>
            <el-form-item label="模板ID">
              <el-select v-model="batchForm.template_id" clearable placeholder="选择模板">
                <el-option v-for="tpl in templates" :key="tpl.id" :label="tpl.name" :value="tpl.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大并发">
              <el-input-number v-model="batchForm.max_concurrent" :min="1" :max="5" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="startBatchBuild" :loading="batchBuilding">批量构建</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span><el-icon><List /></el-icon> 最近任务进度</span>
      </template>
      <el-table :data="taskList" style="width: 100%">
        <el-table-column prop="task_id" label="任务ID" width="200" />
        <el-table-column prop="doc_id" label="文献ID" width="150" />
        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <el-progress :percentage="Math.round((row.current / row.total) * 100)" :status="row.status === 'failed' ? 'exception' : (row.status === 'completed' ? 'success' : undefined)" />
          </template>
        </el-table-column>
        <el-table-column prop="stage" label="阶段" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : (row.status === 'failed' ? 'danger' : 'warning')">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="refreshTask(row.task_id)">刷新</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { buildKG, batchBuildKG, getTaskStatus, getTemplates } from '../../api/kg'
import { DocumentAdd, Grid, List } from '@element-plus/icons-vue'

const templates = ref([])
const building = ref(false)
const batchBuilding = ref(false)

const singleForm = ref({
  doc_id: '',
  template_id: '',
  chunk_size: 1024,
  confidence_threshold: 0.7
})

const batchForm = ref({
  doc_ids_text: '',
  template_id: '',
  max_concurrent: 2
})

const taskList = ref([])

const addTaskToList = (taskId, docId) => {
  if (!taskList.value.find(t => t.task_id === taskId)) {
    taskList.value.unshift({ task_id: taskId, doc_id: docId, current: 0, total: 100, stage: '等待中', status: 'pending' })
  }
}

const refreshTask = async (taskId) => {
  try {
    const res = await getTaskStatus(taskId)
    const idx = taskList.value.findIndex(t => t.task_id === taskId)
    if (idx !== -1) {
      taskList.value[idx] = { ...taskList.value[idx], ...res.data }
    }
  } catch (err) {
    console.error(err)
  }
}

const startSingleBuild = async () => {
  if (!singleForm.value.doc_id) {
    ElMessage.warning('请输入文献ID')
    return
  }
  building.value = true
  try {
    const res = await buildKG(singleForm.value)
    addTaskToList(res.data.task_id, singleForm.value.doc_id)
    ElMessage.success(`任务已启动: ${res.data.task_id}`)
    setTimeout(() => refreshTask(res.data.task_id), 2000)
  } catch (err) {
    ElMessage.error('启动失败: ' + (err.response?.data?.detail || err.message))
  } finally {
    building.value = false
  }
}

const startBatchBuild = async () => {
  const ids = batchForm.value.doc_ids_text.split(',').map(s => s.trim()).filter(s => s)
  if (ids.length === 0) {
    ElMessage.warning('请填写文献ID列表')
    return
  }
  batchBuilding.value = true
  try {
    const res = await batchBuildKG({
      doc_ids: ids,
      template_id: batchForm.value.template_id || undefined,
      max_concurrent: batchForm.value.max_concurrent,
      chunk_size: 1024,
      confidence_threshold: 0.7
    })
    ElMessage.success(`批量构建已启动，批次ID: ${res.data.batch_id}，共${res.data.submitted}篇`)
    for (let i = 0; i < res.data.task_ids.length; i++) {
      addTaskToList(res.data.task_ids[i], ids[i])
    }
  } catch (err) {
    ElMessage.error('批量启动失败: ' + (err.response?.data?.detail || err.message))
  } finally {
    batchBuilding.value = false
  }
}

const loadTemplates = async () => {
  try {
    const res = await getTemplates()
    templates.value = res.data
  } catch (err) {
    console.error('加载模板失败', err)
  }
}

onMounted(() => {
  loadTemplates()
})
</script>