<template>
  <div class="chart-wrap">
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
      skills: null,
      skillPoints: null,
      chartInstance: null,
      animationFrameId: null,
      baseOffsets: [], // 每个扇形当前的动态偏移
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.baseOffsets = new Array(this.skills.length).fill(0);

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
      const canvas = this.$refs.polarChart;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const colors = this.generateColors(this.skills.length);

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [{
            label: '技能点',
            data: this.skillPoints,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.6', '1')),
            borderWidth: 2,

            // 初始 offset
            offset: (context) => {
              return this.baseOffsets[context.dataIndex] || 0;
            },

            // 保留你的 hover 效果
            hoverOffset: 15,
            hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.8')),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
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
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || '';
                  return `${label}: ${value} 技能点`;
                },
                title: function(context) {
                  return `${context[0].label}`;
                },
              },
            },
          },
          scales: {
            r: {
              ticks: {
                display: false,
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                lineWidth: 0.5,
              },
              angleLines: {
                color: 'rgba(0, 0, 0, 0.2)',
                lineWidth: 1,
              },
            },
          },
          animation: {
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
          },
        },
      });
    },

    startPulseAnimation() {
      const amplitude = 8;   // 最大外扩距离
      const speed = 0.003;   // 速度
      const stagger = 0.8;   // 每个扇形错峰

      const animate = () => {
        const t = performance.now() * speed;

        this.baseOffsets = this.baseOffsets.map((_, i) => {
          // 0 ~ 1 的平滑脉冲
          const pulse = (Math.sin(t + i * stagger) + 1) / 2;
          return pulse * amplitude;
        });

        if (this.chartInstance) {
          // 关键：更新但不要走大动画
          this.chartInstance.update('none');
        }

        this.animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    },

    stopPulseAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },
  },
};
</script>

<style scoped>
.chart-wrap {
  position: relative;
  width: 100%;
  height: 400px;
}
</style>
