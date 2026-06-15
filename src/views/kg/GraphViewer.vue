<template>
  <div class="graph-viewer">
    <el-card class="query-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="实体名称">
          <el-input v-model="queryForm.entity" placeholder="如: 氧化铝" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="关系类型">
          <el-input v-model="queryForm.relation" placeholder="可选: 制备方法/性能" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="邻居深度">
          <el-input-number v-model="neighborDepth" :min="1" :max="3" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchGraph" :loading="loading">查询图谱</el-button>
          <el-button @click="queryNeighbors" :disabled="!queryForm.entity">邻居子图</el-button>
          <el-button @click="resetGraph">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="graph-container">
      <GraphCanvas :nodes="graphData.nodes" :edges="graphData.edges" />
    </div>

    <el-card class="info-card" v-if="graphData.total_nodes">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="节点数">{{ graphData.total_nodes }}</el-descriptions-item>
        <el-descriptions-item label="关系数">{{ graphData.total_edges }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ new Date().toLocaleString() }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { queryGraph, getEntityNeighbors } from '../../api/kg'
import GraphCanvas from '../../components/kg/GraphCanvas.vue'

const loading = ref(false)
const neighborDepth = ref(2)
const queryForm = reactive({ entity: '', relation: '' })
const graphData = ref({ nodes: [], edges: [], total_nodes: 0, total_edges: 0 })

const searchGraph = async () => {
  loading.value = true
  try {
    const params = {
      entity: queryForm.entity || undefined,
      relation: queryForm.relation || undefined,
      limit: 200
    }
    const res = await queryGraph(params)
    graphData.value = res.data
    if (res.data.total_nodes === 0) {
      ElMessage.info('未找到相关图谱数据')
    } else {
      ElMessage.success(`加载了 ${res.data.total_nodes} 个节点，${res.data.total_edges} 条关系`)
    }
  } catch (err) {
    ElMessage.error('查询失败: ' + (err.response?.data?.detail || err.message))
  } finally {
    loading.value = false
  }
}

const queryNeighbors = async () => {
  if (!queryForm.entity) {
    ElMessage.warning('请输入实体名称')
    return
  }
  loading.value = true
  try {
    const res = await getEntityNeighbors(queryForm.entity, neighborDepth.value, 200)
    graphData.value = res.data
    ElMessage.success(`获取邻居子图成功，节点 ${res.data.total_nodes}，关系 ${res.data.total_edges}`)
  } catch (err) {
    ElMessage.error('邻居查询失败: ' + (err.response?.data?.detail || err.message))
  } finally {
    loading.value = false
  }
}

const resetGraph = () => {
  graphData.value = { nodes: [], edges: [], total_nodes: 0, total_edges: 0 }
  queryForm.entity = ''
  queryForm.relation = ''
}
</script>

<style scoped>
.graph-viewer {
  height: 100%; 
  min-height: 600px; 
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px; 
}

.query-card {
  flex-shrink: 0;
}

.graph-container {
  flex: 1;               
  min-height: 400px;         
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.info-card {
  flex-shrink: 0;
}
</style>