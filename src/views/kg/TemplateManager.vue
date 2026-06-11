<template>
  <div class="template-manager">
    <el-button type="primary" style="margin-bottom: 16px" @click="openCreateDialog">
      <el-icon><Plus /></el-icon> 新建模板
    </el-button>

    <el-table :data="templates" border stripe>
      <el-table-column prop="name" label="模板名称" width="180" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="chunk_size" label="分块大小" width="100" />
      <el-table-column prop="confidence_threshold" label="置信度阈值" width="120" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="editTemplate(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editMode ? '编辑模板' : '新建模板'" width="600px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="模板名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Schema（JSON）">
          <el-input v-model="form.schema_str" type="textarea" :rows="5" placeholder='{"entity_types": ["材料", "方法"], "relation_types": ["制备", "表征"]}' />
        </el-form-item>
        <el-form-item label="分块大小">
          <el-input-number v-model="form.chunk_size" :min="200" :max="2000" />
        </el-form-item>
        <el-form-item label="重叠大小">
          <el-input-number v-model="form.chunk_overlap" :min="0" :max="500" />
        </el-form-item>
        <el-form-item label="置信度阈值">
          <el-slider v-model="form.confidence_threshold" :min="0" :max="1" :step="0.05" />
        </el-form-item>
        <el-form-item label="实体合并">
          <el-switch v-model="form.enable_entity_merge" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api/kg'
import { Plus } from '@element-plus/icons-vue'

const templates = ref([])
const dialogVisible = ref(false)
const editMode = ref(false)
const currentId = ref(null)

const form = reactive({
  name: '',
  description: '',
  schema_str: '{}',
  chunk_size: 1024,
  chunk_overlap: 200,
  confidence_threshold: 0.7,
  enable_entity_merge: true
})

const loadTemplates = async () => {
  const res = await getTemplates()
  templates.value = res.data
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.schema_str = '{}'
  form.chunk_size = 1024
  form.chunk_overlap = 200
  form.confidence_threshold = 0.7
  form.enable_entity_merge = true
  currentId.value = null
  editMode.value = false
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const editTemplate = (row) => {
  resetForm()
  editMode.value = true
  currentId.value = row.id
  form.name = row.name
  form.description = row.description || ''
  form.schema_str = typeof row.schema === 'string' ? row.schema : JSON.stringify(row.schema || {}, null, 2)
  form.chunk_size = row.chunk_size
  form.chunk_overlap = row.chunk_overlap
  form.confidence_threshold = row.confidence_threshold
  form.enable_entity_merge = row.enable_entity_merge
  dialogVisible.value = true
}

const saveTemplate = async () => {
  if (!form.name) {
    ElMessage.warning('请填写模板名称')
    return
  }
  let schema = {}
  try {
    schema = JSON.parse(form.schema_str)
  } catch (e) {
    ElMessage.error('Schema JSON 格式错误')
    return
  }
  const payload = {
    name: form.name,
    description: form.description,
    schema: schema,
    chunk_size: form.chunk_size,
    chunk_overlap: form.chunk_overlap,
    confidence_threshold: form.confidence_threshold,
    enable_entity_merge: form.enable_entity_merge
  }
  try {
    if (editMode.value) {
      await updateTemplate(currentId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createTemplate(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadTemplates()
  } catch (err) {
    ElMessage.error('操作失败: ' + (err.response?.data?.detail || err.message))
  }
}

const confirmDelete = (row) => {
  ElMessageBox.confirm(`确定删除模板 "${row.name}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    await deleteTemplate(row.id)
    ElMessage.success('删除成功')
    loadTemplates()
  }).catch(() => {})
}

onMounted(() => {
  loadTemplates()
})
</script>