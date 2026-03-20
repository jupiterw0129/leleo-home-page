<template>
  <div class="chart-wrap">
    <canvas id="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import config from '../config.js';

Chart.register(...registerables);

// 自定义插件：整体旋转 + 扇形脉冲外扩
const reactorMotionPlugin = {
  id: 'reactorMotionPlugin',
  beforeDatasetsDraw(chart, args, pluginOptions) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const now = Date.now();
    const rotationSpeed = pluginOptions.rotationSpeed ?? 0.002; // 旋转速度
    const pulseAmplitude = pluginOptions.pulseAmplitude ?? 8;   // 最大偏移距离
    const pulseSpeed = pluginOptions.pulseSpeed ?? 0.003;       // 脉冲速度
    const sequentialDelay = pluginOptions.sequentialDelay ?? 0.8; // 每个扇形错峰

    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data) return;

    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;

    // 保存画布状态并整体旋转
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(now * rotationSpeed);
    ctx.translate(-cx, -cy);

    // 给每个扇形增加“周期性呼吸偏移”
    meta.data.forEach((arc, index) => {
      // 缓存原始中心点
      if (arc.$originalX === undefined) arc.$originalX = arc.x;
      if (arc.$originalY === undefined) arc.$originalY = arc.y;

      // 当前扇形的中心角
      const angle = (arc.startAngle + arc.endAngle) / 2;

      // 让每个扇形错峰脉冲
      const pulse = (Math.sin(now * pulseSpeed + index * sequentialDelay) + 1) / 2;

      // 为了更像“推出去又缩回来”，做一个更柔和的脉冲
      const offset = pulse * pulseAmplitude;

      const dx = Math.cos(angle) * offset;
      const dy = Math.sin(angle) * offset;

      arc.x = arc.$originalX + dx;
      arc.y = arc.$originalY + dy;
    });
  },

  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    // 绘制结束后恢复 arc 中心，避免影响 tooltip 命中等逻辑
    if (meta && meta.data) {
      meta.data.forEach((arc) => {
        if (arc.$originalX !== undefined) arc.x = arc.$originalX;
        if (arc.$originalY !== undefined) arc.y = arc.$originalY;
      });
    }

    ctx.restore();
  }
};

Chart.register(reactorMotionPlugin);

export default {
  name: 'polarChart',
  data() {
    return {
      configdata: config,
      skills: null,
      skillPoints: null,
      chartInstance: null,
      animationFrameId: null, // 用于持续刷新动画
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.renderChart();
    this.startAnimationLoop();
  },
  beforeDestroy() {
    this.cleanupChart();
  },
  beforeUnmount() {
    this.cleanupChart();
  },
  methods: {
    cleanupChart() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },

    startAnimationLoop() {
      const animate = () => {
        if (this.chartInstance) {
          // 不使用内置过渡，直接每帧重绘，保证插件动效丝滑
          this.chartInstance.update('none');
        }
        this.animationFrameId = requestAnimationFrame(animate);
      };
      animate();
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

            // 保留你原有 hover 效果
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

            // 插件参数
            reactorMotionPlugin: {
              rotationSpeed: 0.0008,   // 越小越慢，建议 0.0005 ~ 0.0015
              pulseAmplitude: 6,       // 扇形推出距离，建议 4 ~ 10
              pulseSpeed: 0.004,       // 推出缩回节奏
              sequentialDelay: 0.9     // 扇形之间错峰
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
.chart-wrap {
  position: relative;
  width: 100%;
  height: 420px;
}
</style>
``*
