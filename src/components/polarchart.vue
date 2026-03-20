<template>
  <div class="chart-wrap reactor-rotate">
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
      baseSkillPoints: [],
      chartInstance: null,
      pulseTimer: null,
      phase: 0,
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }

    this.skills = this.configdata.polarChart.skills || [];
    this.skillPoints = [...(this.configdata.polarChart.skillPoints || [])];
    this.baseSkillPoints = [...this.skillPoints];

    this.renderChart();
    this.startPulseAnimation();
  },
  beforeDestroy() {
    this.cleanupChart();
  },
  beforeUnmount() {
    this.cleanupChart();
  },
  methods: {
    cleanupChart() {
      if (this.pulseTimer) {
        clearInterval(this.pulseTimer);
        this.pulseTimer = null;
      }
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },

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
            data: [...this.skillPoints],
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.6', '1')),
            borderWidth: 2,

            // 保留原 hover
            hoverOffset: 15,
            hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.8')),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 300,
            easing: 'easeInOutQuad'
          },
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
                label(context) {
                  const label = context.label || '';
                  const value = context.raw || '';
                  return `${label}: ${value} 技能点`;
                },
                title(context) {
                  return `${context[0].label}`;
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
                color: 'rgba(0, 0, 0, 0.1)',
                lineWidth: 0.5,
              },
              angleLines: {
                color: 'rgba(0, 0, 0, 0.2)',
                lineWidth: 1,
              },
            },
          },
        },
      });
    },

    startPulseAnimation() {
      // 自动律动，不依赖 hover
      // 每个扇形按不同相位轻微变化，像“反应堆脉冲”
      this.pulseTimer = setInterval(() => {
        if (!this.chartInstance) return;

        this.phase += 0.18;

        const pulsedData = this.baseSkillPoints.map((base, index) => {
          // 不同扇形错峰律动
          const wave = Math.sin(this.phase + index * 0.8);

          // 律动幅度：按基础值的 4%，最小 0.8，最大 3
          const amplitude = Math.min(Math.max(base * 0.04, 0.8), 3);

          const value = base + wave * amplitude;

          // 防止出现负数
          return Number(Math.max(0, value).toFixed(2));
        });

        this.chartInstance.data.datasets[0].data = pulsedData;
        this.chartInstance.update();
      }, 80);
    },
  },
};
</script>

<style scoped>
.chart-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 整体缓慢旋转，不影响 hover 命中区域 */
.reactor-rotate {
  animation: reactorSpin 18s linear infinite;
  transform-origin: center center;
}

@keyframes reactorSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
