<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.node_count || 0 }}</div>
          <div class="stat-label">实体节点数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.relation_count || 0 }}</div>
          <div class="stat-label">关系数量</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.doc_count || 0 }}</div>
          <div class="stat-label">已处理文献数</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 24px" v-if="stats.top_relations">
      <template #header>高频关系 Top 10</template>
      <el-table :data="stats.top_relations" border stripe>
        <el-table-column prop="relation" label="关系类型" />
        <el-table-column prop="count" label="出现次数" sortable />
      </el-table>
    </el-card>

    <el-card style="margin-top: 24px" v-if="stats.top_entities">
      <template #header>高频实体 Top 10</template>
      <el-table :data="stats.top_entities" border stripe>
        <el-table-column prop="entity" label="实体名称" />
        <el-table-column prop="count" label="出现次数" sortable />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '../../api/kg'

const stats = ref({})

const loadStats = async () => {
  try {
    const res = await getStats()
    stats.value = res.data
  } catch (err) {
    console.error('加载统计失败', err)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-value {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}
</style>