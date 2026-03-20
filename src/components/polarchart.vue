<template>
  <div class="chart-wrap">
    <canvas id="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import config from '../config.js';

Chart.register(...registerables);

// 自定义插件：让 polarArea 的每个扇形周期性向外偏移再回弹
const breathingPolarPlugin = {
  id: 'breathingPolarPlugin',
  afterDatasetDraw(chart, args, pluginOptions) {
    if (args.index !== 0) return;

    const meta = chart.getDatasetMeta(0);
    const elements = meta.data || [];
    const time = Date.now() * (pluginOptions.speed || 0.003);
    const amplitude = pluginOptions.amplitude || 6; // 偏移幅度，建议 4~8
    const stagger = pluginOptions.stagger || 0.6;   // 每个扇形错峰

    elements.forEach((arc, index) => {
      if (!arc) return;

      const { x, y, startAngle, endAngle } = arc;
      const angle = (startAngle + endAngle) / 2;

      // 呼吸节奏：0~1
      const pulse = (Math.sin(time + index * stagger) + 1) / 2;

      // 计算向外偏移量
      const offset = pulse * amplitude;

      // 保存原始位置，避免累计偏移
      if (!arc.$origin) {
        arc.$origin = { x, y };
      }

      arc.x = arc.$origin.x + Math.cos(angle) * offset;
      arc.y = arc.$origin.y + Math.sin(angle) * offset;
    });
  },

  beforeDatasetDraw(chart, args) {
    if (args.index !== 0) return;

    // 每次绘制前先还原，防止位置不断累积漂移
    const meta = chart.getDatasetMeta(0);
    const elements = meta.data || [];

    elements.forEach((arc) => {
      if (arc && arc.$origin) {
        arc.x = arc.$origin.x;
        arc.y = arc.$origin.y;
      }
    });
  }
};

Chart.register(breathingPolarPlugin);

export default {
  name: 'polarChart',
  data() {
    return {
      configdata: config,
      skills: null,
      skillPoints: null,
      chartInstance: null,
      animationFrameId: null, // 保存 requestAnimationFrame
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.renderChart();
    this.startBreathing();
  },
  beforeUnmount() {
    this.stopBreathing();
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

    startBreathing() {
      const animate = () => {
        if (this.chartInstance) {
          // 不走默认大动画，直接轻量刷新
          this.chartInstance.draw();
        }
        this.animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    },

    stopBreathing() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },

    renderChart() {
      const canvas = document.getElementById('polarChart');
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

            // 保留你原本的 hover 交互
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
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
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

            // 这里配置“呼吸”插件参数
            breathingPolarPlugin: {
              amplitude: 5, // 呼吸幅度：越大越明显，建议 4~8
              speed: 0.0035, // 呼吸速度：越大越快
              stagger: 0.8   // 扇形错峰
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
        },
      });
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
