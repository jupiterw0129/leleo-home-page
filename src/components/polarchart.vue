<template>
  <div class="chart-wrapper">
    <canvas ref="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import config from '../config.js';

Chart.register(...registerables);

export default {
  name: 'polarChart',
  data() {
    return {
      configdata: config,
      skills: [],
      skillPoints: [],
      chartInstance: null,
      pulseTimer: null,
      activeIndex: 0,
      colors: []
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }

    this.skills = this.configdata.polarChart.skills || [];
    this.skillPoints = this.configdata.polarChart.skillPoints || [];
    this.colors = this.generateColors(this.skills.length);

    this.renderChart();
    this.startPulseAnimation();
  },
  beforeUnmount() {
    this.stopPulseAnimation();

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },
  methods: {
    generateColors(count) {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
      }
      return colors;
    },

    renderChart() {
      const ctx = this.$refs.polarChart.getContext('2d');

      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [
            {
              label: '技能点',
              data: this.skillPoints,
              backgroundColor: this.colors,
              borderColor: this.colors.map(color => color.replace('0.6', '1')),
              borderWidth: 2,

              // hover 时单个扇形弹出
              hoverOffset: 22,
              hoverBackgroundColor: this.colors.map(color => color.replace('0.6', '0.85')),
              hoverBorderColor: '#ffffff',
              hoverBorderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 380,
            easing: 'easeOutCubic'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(40, 40, 40, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 2,
              padding: 10,
              caretSize: 6,
              caretPadding: 8,
              cornerRadius: 6,
              boxWidth: 10,
              boxHeight: 10,
              displayColors: true,
              callbacks: {
                label(context) {
                  const label = context.label || '';
                  const value = context.raw || '';
                  return `${label}: ${value} 技能点`;
                },
                title(context) {
                  return `${context[0].label}`;
                }
              }
            }
          },
          scales: {
            r: {
              ticks: {
                display: false
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                lineWidth: 0.5
              },
              angleLines: {
                color: 'rgba(0, 0, 0, 0.2)',
                lineWidth: 1
              }
            }
          }
        }
      });
    },

    startPulseAnimation() {
      this.stopPulseAnimation();

      if (!this.chartInstance || !this.skills.length) return;

      this.pulseTimer = setInterval(() => {
        if (!this.chartInstance) return;

        const total = this.skills.length;
        const index = this.activeIndex % total;

        // 让当前扇形进入 active 状态
        this.chartInstance.setActiveElements([
          { datasetIndex: 0, index }
        ]);

        // 如果你不想显示 tooltip，可以注释下面这行
        this.chartInstance.tooltip.setActiveElements(
          [{ datasetIndex: 0, index }],
          { x: 0, y: 0 }
        );

        this.chartInstance.update();

        // 短暂弹出后收回
        setTimeout(() => {
          if (!this.chartInstance) return;
          this.chartInstance.setActiveElements([]);
          this.chartInstance.tooltip.setActiveElements([], { x: 0, y: 0 });
          this.chartInstance.update();
        }, 260);

        this.activeIndex++;
      }, 520);
    },

    stopPulseAnimation() {
      if (this.pulseTimer) {
        clearInterval(this.pulseTimer);
        this.pulseTimer = null;
      }
    }
  }
};
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 420px;
}
</style>
