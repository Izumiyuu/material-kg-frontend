<template>
  <div ref="chartRef" class="graph-canvas" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  edges: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const option = {
    title: {
      show: props.nodes.length === 0,
      text: '暂无图谱数据，请先构建或查询',
      left: 'center',
      top: 'center',
      textStyle: { color: '#999', fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `<strong>${params.name}</strong><br/>类型: ${params.data.category || '实体'}`
        } else {
          return `<strong>${params.data.label || params.name}</strong>`
        }
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 300,
        edgeLength: 100,
        gravity: 0.1,
        friction: 0.1
      },
      data: props.nodes.map(n => ({
        name: n.label || n.id,
        id: n.id,
        category: n.category || 'entity',
        symbolSize: 30,
        itemStyle: {
          color: n.color || '#5470c6'
        }
      })),
      links: props.edges.map(e => ({
        source: e.source,
        target: e.target,
        label: e.label,
        lineStyle: { color: '#aaa', width: 2, curveness: 0.2, type: 'solid' }
      })),
      roam: true,
      draggable: true,
      focusNodeAdjacency: false,
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 8],
      label: {
        show: true,
        position: 'right',
        fontSize: 12,
        offset: [5, 0]
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 3, color: '#ffaa00' }
      },
      lineStyle: { color: '#888', width: 2, curveness: 0.2 }
    }]
  }
  chart.setOption(option, true)
}

watch(() => [props.nodes, props.edges], () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
})
</script>

<style scoped>
.graph-canvas {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>