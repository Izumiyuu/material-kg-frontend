<template>
  <div class="kg-main-container">
    <!-- 左侧子菜单 -->
    <div class="kg-sidebar">
      <div class="kg-logo">
        <h3>📖 知识图谱</h3>
      </div>
      <el-menu
        :default-active="activeSubMenu"
        class="kg-sub-menu"
        background-color="#f5f7fa"
        text-color="#333"
        active-text-color="#00a3e0"
        @select="handleSubMenuSelect"
      >
        <el-menu-item index="graph">
          <el-icon><Share /></el-icon>
          <span>图谱可视化</span>
        </el-menu-item>
        <el-menu-item index="tasks">
          <el-icon><Operation /></el-icon>
          <span>构建任务</span>
        </el-menu-item>
        <el-menu-item index="templates">
          <el-icon><Files /></el-icon>
          <span>模板管理</span>
        </el-menu-item>
        <el-menu-item index="triples">
          <el-icon><Search /></el-icon>
          <span>三元组检索</span>
        </el-menu-item>
        <el-menu-item index="stats">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计信息</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="kg-content">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import { Share, Operation, Files, Search, DataAnalysis } from '@element-plus/icons-vue'

// 导入五个子组件
import GraphViewer from './GraphViewer.vue'
import TaskManager from './TaskManager.vue'
import KGTemplateManager from './TemplateManager.vue'
import TripleSearch from './TripleSearch.vue'
import Statistics from './Statistics.vue'

// 当前激活的子菜单（默认图谱可视化）
const activeSubMenu = ref('graph')

// 当前要渲染的组件
const currentComponent = shallowRef(GraphViewer)

// 子菜单与组件的映射
const componentMap = {
  graph: GraphViewer,
  tasks: TaskManager,
  templates: KGTemplateManager,
  triples: TripleSearch,
  stats: Statistics
}

// 处理子菜单点击
const handleSubMenuSelect = (index) => {
  activeSubMenu.value = index
  currentComponent.value = componentMap[index]
}
</script>

<style scoped>
.kg-main-container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.kg-sidebar {
  width: 220px;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.kg-logo {
  padding: 20px 16px;
  text-align: center;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.kg-logo h3 {
  font-size: 18px;
  font-weight: 500;
  color: #1a2c3e;
  margin: 0;
}

.kg-sub-menu {
  border-right: none;
  background-color: transparent;
}

.kg-sub-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  margin: 4px 8px;
  border-radius: 8px;
}

.kg-sub-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #00a3e0;
}

.kg-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
}
</style>