<template>
  <div class="chart-wrapper">
    <canvas id="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import config from '../config.js';

Chart.register(...registerables);

// 自定义插件：让每个扇形周期性向外伸缩
const breathingPolarAreaPlugin = {
  id: 'breathingPolarAreaPlugin',
  afterDatasetDraw(chart, args, pluginOptions) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(args.index);

    if (!meta || !meta.data) return;

    const time = Date.now() * 0.003; // 控制整体速度
    const amplitude = pluginOptions?.amplitude ?? 8; // 律动幅度
    const speed = pluginOptions?.speed ?? 1; // 律动速度
    const stagger = pluginOptions?.stagger ?? 0.6; // 各扇形错峰

    meta.data.forEach((arc, index) => {
      if (!arc) return;

      // 保存原始半径，避免累计叠加
      if (arc.$originalOuterRadius == null) {
        arc.$originalOuterRadius = arc.outerRadius;
      }

      const pulse = Math.sin(time * speed + index * stagger);
      const offset = pulse * amplitude;

      arc.outerRadius = arc.$originalOuterRadius + offset;
    });

    // 触发下一帧
    if (!chart.$breathingAnimationFrame) {
      const animate = () => {
        if (!chart || chart._destroyed) return;
        chart.draw();
        chart.$breathingAnimationFrame = requestAnimationFrame(animate);
      };
      chart.$breathingAnimationFrame = requestAnimationFrame(animate);
    }
  },

  beforeDestroy(chart) {
    if (chart.$breathingAnimationFrame) {
      cancelAnimationFrame(chart.$breathingAnimationFrame);
      chart.$breathingAnimationFrame = null;
    }
  }
};

Chart.register(breathingPolarAreaPlugin);

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
      if (this.chartInstance.$breathingAnimationFrame) {
        cancelAnimationFrame(this.chartInstance.$breathingAnimationFrame);
        this.chartInstance.$breathingAnimationFrame = null;
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
      const canvas = document.getElementById('polarChart');
      const ctx = canvas.getContext('2d');
      const colors = this.generateColors(this.skills.length);

      if (this.chartInstance) {
        if (this.chartInstance.$breathingAnimationFrame) {
          cancelAnimationFrame(this.chartInstance.$breathingAnimationFrame);
          this.chartInstance.$breathingAnimationFrame = null;
        }
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

            // 自定义插件参数
            breathingPolarAreaPlugin: {
              amplitude: 6, // 往外伸缩的幅度
              speed: 1.6,   // 速度
              stagger: 0.8, // 每个扇形错开一点，更像律动
            }
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
  },
};
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
}
</style>
