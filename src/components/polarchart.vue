<template>
  <div class="chart-wrapper">
    <canvas id="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import config from '../config.js';

Chart.register(...registerables);

// 轻微呼吸动画插件
const breathingPlugin = {
  id: 'breathingPlugin',
  beforeDraw(chart) {
    const { ctx, canvas } = chart;
    const now = Date.now();
    const scale = 1 + Math.sin(now / 800) * 0.015; // 轻微缩放，幅度很小

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  },
  afterDraw(chart) {
    chart.ctx.restore();
  }
};

Chart.register(breathingPlugin);

export default {
  name: 'polarChart',
  data() {
    return {
      configdata: config,
      skills: null,
      skillPoints: null,
      chartInstance: null,
      animationFrame: null,
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.renderChart();
    this.startLoop();
  },
  beforeUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
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

    startLoop() {
      const animate = () => {
        if (this.chartInstance) {
          this.chartInstance.draw();
        }
        this.animationFrame = requestAnimationFrame(animate);
      };
      animate();
    },

    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
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
            animateRotate: true,
            animateScale: true,
          },
          animations: {
            radius: {
              duration: 1200,
              easing: 'easeOutCubic',
              delay(context) {
                return context.dataIndex * 120;
              }
            },
            rotate: {
              duration: 1200,
              easing: 'easeOutCubic',
              delay(context) {
                return context.dataIndex * 120;
              }
            }
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  animation: fadeInScale 1s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
