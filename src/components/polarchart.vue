<template>
  <div class="polar-chart-wrapper">
    <canvas ref="polarChartRef"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import config from '../config.js'

Chart.register(...registerables)

export default {
  name: 'PolarChart',
  data() {
    return {
      configdata: config,
      skills: [],
      skillPoints: [],
      chartInstance: null,
    }
  },
  mounted() {
    this.initConfig()
    this.initChartData()
    this.renderChart()
  },
  beforeUnmount() {
    this.destroyChart()
  },
  methods: {
    initConfig() {
      try {
        if (import.meta.env.VITE_CONFIG) {
          this.configdata = JSON.parse(import.meta.env.VITE_CONFIG)
        }
      } catch (error) {
        console.warn('VITE_CONFIG 解析失败，已回退到本地 config：', error)
        this.configdata = config
      }
    },

    initChartData() {
      const polarChart = this.configdata?.polarChart || {}
      const skills = Array.isArray(polarChart.skills) ? polarChart.skills : []
      const skillPoints = Array.isArray(polarChart.skillPoints) ? polarChart.skillPoints : []

      const minLength = Math.min(skills.length, skillPoints.length)

      this.skills = skills.slice(0, minLength)
      this.skillPoints = skillPoints.slice(0, minLength)
    },

    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy()
        this.chartInstance = null
      }
    },

    hexToRgba(hex, alpha = 1) {
      if (!hex || typeof hex !== 'string') {
        return `rgba(255, 255, 255, ${alpha})`
      }

      let normalized = hex.replace('#', '').trim()

      if (normalized.length === 3) {
        normalized = normalized
          .split('')
          .map(char => char + char)
          .join('')
      }

      if (normalized.length !== 6) {
        return `rgba(255, 255, 255, ${alpha})`
      }

      const r = parseInt(normalized.slice(0, 2), 16)
      const g = parseInt(normalized.slice(2, 4), 16)
      const b = parseInt(normalized.slice(4, 6), 16)

      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },

    getThemeColors(count) {
      const themeColor = this.configdata?.color?.themecolor || '#409EFF'
      const color1 = this.configdata?.color?.turntablecolor1 || '#36A2EB'
      const color2 = this.configdata?.color?.turntablecolor2 || '#FF6384'

      const palette = [
        this.hexToRgba(themeColor, 0.65),
        this.hexToRgba(color1, 0.65),
        this.hexToRgba(color2, 0.65),
        this.hexToRgba(themeColor, 0.5),
        this.hexToRgba(color1, 0.5),
        this.hexToRgba(color2, 0.5),
        this.hexToRgba(themeColor, 0.8),
        this.hexToRgba(color1, 0.8),
        this.hexToRgba(color2, 0.8),
      ]

      return Array.from({ length: count }, (_, i) => palette[i % palette.length])
    },

    getBorderColors(colors) {
      return colors.map(color => color.replace(/,\s*[\d.]+\)$/, ', 1)'))
    },

    getHoverColors(colors) {
      return colors.map(color => color.replace(/,\s*[\d.]+\)$/, ', 0.85)'))
    },

    renderChart() {
      const canvas = this.$refs.polarChartRef
      if (!canvas) return
      if (!this.skills.length || !this.skillPoints.length) return

      const ctx = canvas.getContext('2d')
      const colors = this.getThemeColors(this.skills.length)

      this.destroyChart()

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [
            {
              label: '技能点',
              data: this.skillPoints,
              backgroundColor: colors,
              borderColor: this.getBorderColors(colors),
              borderWidth: 2,
              hoverOffset: 15,
              hoverBackgroundColor: this.getHoverColors(colors),
              hoverBorderColor: '#ffffff',
              hoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(40, 40, 40, 0.78)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1.5,
              padding: 10,
              caretSize: 6,
              caretPadding: 8,
              cornerRadius: 6,
              boxWidth: 10,
              boxHeight: 10,
              displayColors: true,
              callbacks: {
                label(context) {
                  const label = context.label || ''
                  const value = context.raw ?? ''
                  return `${label}: ${value} 技能点`
                },
                title(context) {
                  return context?.[0]?.label || ''
                },
              },
            },
          },
          scales: {
            r: {
              beginAtZero: true,
              ticks: {
                display: false,
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.08)',
                lineWidth: 0.8,
              },
              angleLines: {
                color: 'rgba(0, 0, 0, 0.15)',
                lineWidth: 1,
              },
              pointLabels: {
                color: '#666',
                font: {
                  size: 12,
                },
              },
            },
          },
          animation: {
            duration: 1600,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
          },
        },
      })
    },
  },
}
</script>

<style scoped>
.polar-chart-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
}
</style>
``_
