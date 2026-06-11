<template>
  <div class="triple-search">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" size="default">
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="实体或关系关键词" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="关系类型">
          <el-input v-model="relationType" placeholder="如：制备方法" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="最低置信度" style="width: 260px">
          <el-slider v-model="minConfidence" :min="0" :max="1" :step="0.05" />
          <span style="margin-left: 12px; min-width: 40px">{{ (minConfidence * 100).toFixed(0) }}%</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">检索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="result-card" shadow="never">
      <template #header>
        <span>三元组列表（共 {{ total }} 条）</span>
      </template>
      <el-table 
        :data="triples" 
        border 
        stripe 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#1f2d3d' }"
      >
        <el-table-column prop="head_entity" label="头实体" min-width="150" show-overflow-tooltip />
        <el-table-column prop="relation" label="关系" min-width="120" show-overflow-tooltip />
        <el-table-column prop="tail_entity" label="尾实体" min-width="150" show-overflow-tooltip />
        <el-table-column prop="confidence" label="置信度" width="120" align="center">
          <template #default="{ row }">
            <el-progress 
              :percentage="Math.round(row.confidence * 100)" 
              :stroke-width="8" 
              :show-text="false" 
              style="width: 80px; display: inline-block" 
            />
            <span style="margin-left: 8px">{{ (row.confidence * 100).toFixed(0) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="doc_id" label="来源文献" min-width="180" show-overflow-tooltip />
      </el-table>
      <el-empty v-if="!loading && triples.length === 0" description="暂无数据，请先检索" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { searchTriples } from '../../api/kg'

const keyword = ref('')
const relationType = ref('')
const minConfidence = ref(0.5)
const loading = ref(false)
const triples = ref([])
const total = ref(0)

const handleSearch = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入关键词')
    return
  }
  loading.value = true
  try {
    const res = await searchTriples({
      keyword: keyword.value,
      relation_type: relationType.value || undefined,
      min_confidence: minConfidence.value,
      limit: 200
    })
    triples.value = res.data.triples
    total.value = res.data.total
    ElMessage.success(`找到 ${total.value} 条三元组`)
  } catch (err) {
    ElMessage.error('检索失败: ' + (err.response?.data?.detail || err.message))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.triple-search {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-card {
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
}
.result-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
}
.result-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  padding: 0;
}
.result-card :deep(.el-table) {
  margin-top: 0;
}
</style>