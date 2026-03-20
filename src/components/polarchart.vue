<template>
  <div class="chart-wrapper">
    <canvas ref="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import config from '../config.js';

Chart.register(ArcElement, Tooltip, Legend, RadialLinearScale);

/**
 * 律动插件：
 * 让每个扇形沿自身角平分线方向，周期性向外平移再回位
 */
const radialBreathingPlugin = {
  id: 'radialBreathingPlugin',

  afterUpdate(chart, args, pluginOptions) {
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data) return;

    meta.data.forEach((arc) => {
      if (arc.$baseX == null) arc.$baseX = arc.x;
      if (arc.$baseY == null) arc.$baseY = arc.y;
    });
  },

  beforeDatasetsDraw(chart, args, pluginOptions) {
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data) return;

    const time = performance.now() / 1000;
    const amplitude = pluginOptions?.amplitude ?? 12; // 位移幅度
    const speed = pluginOptions?.speed ?? 2.2;        // 速度
    const stagger = pluginOptions?.stagger ?? 0.45;   // 相位差

    meta.data.forEach((arc, index) => {
      const angle = (arc.startAngle + arc.endAngle) / 2;

      // 只往外推，不往里缩，避免“缩成一坨”
      const pulse = (Math.sin(time * speed + index * stagger) + 1) / 2;
      const offset = pulse * amplitude;

      arc.x = arc.$baseX + Math.cos(angle) * offset;
      arc.y = arc.$baseY + Math.sin(angle) * offset;
    });

    if (!chart.$breathingFrame) {
      const loop = () => {
        if (!chart || chart._destroyed) return;
        chart.draw();
        chart.$breathingFrame = requestAnimationFrame(loop);
      };
      chart.$breathingFrame = requestAnimationFrame(loop);
    }
  },

  afterDestroy(chart) {
    if (chart.$breathingFrame) {
      cancelAnimationFrame(chart.$breathingFrame);
      chart.$breathingFrame = null;
    }
  }
};

Chart.register(radialBreathingPlugin);

export default {
  name: 'polarChart',
  data() {
    return {
      configdata: config,
      skills: null,
      skillPoints: null,
      chartInstance: null,
    };
  },

  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.renderChart();
  },

  beforeUnmount() {
    if (this.chartInstance) {
      if (this.chartInstance.$breathingFrame) {
        cancelAnimationFrame(this.chartInstance.$breathingFrame);
        this.chartInstance.$breathingFrame = null;
      }
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
      const colors = this.generateColors(this.skills.length);

      if (this.chartInstance) {
        if (this.chartInstance.$breathingFrame) {
          cancelAnimationFrame(this.chartInstance.$breathingFrame);
          this.chartInstance.$breathingFrame = null;
        }
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [
            {
              label: '技能点',
              data: this.skillPoints,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('0.6', '1')),
              borderWidth: 2,
              hoverOffset: 15,
              hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.8')),
              hoverBorderColor: '#ffffff',
              hoverBorderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true
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
            },
            radialBreathingPlugin: {
              amplitude: 10, // 位移距离，先试 10
              speed: 2.4,    // 节奏
              stagger: 0.55  // 错峰，别全同步
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
