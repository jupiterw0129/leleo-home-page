<template>
  <canvas id="polarChart"></canvas>
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
      baseSkillPoints: null, 
      // ⚠️ 关键修改：千万别把 chartInstance 和 animationFrameId 放在 data 里！
      // 这会导致 Vue 的 Proxy 破坏 Chart.js 的内部更新机制。
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.baseSkillPoints = [...this.skillPoints]; 
    
    // 初始化非响应式变量
    this.chartInstance = null;
    this.animationFrameId = null;

    this.renderChart();
  },
  beforeDestroy() { 
    // Vue 3 中如果你使用的是选项式 API，这里可能需要改成 beforeUnmount
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
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
    
    // 活塞跳动动画引擎
    startPistonAnimation() {
      // 确保之前的动画被清理
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      const animate = () => {
        if (!this.chartInstance) return;

        // ⚠️ 关键修改：使用 Date.now() 作为绝对时间，防止 requestAnimationFrame 时间戳在某些情况下异常
        const time = Date.now() / 300; 

        const newData = this.baseSkillPoints.map((baseVal, index) => {
          const amplitude = baseVal * 0.10; // 10% 振幅
          const phase = index * (Math.PI / 1.5); // 相位错开
          return baseVal + amplitude * Math.sin(time + phase);
        });

        // 强制更新数据
        this.chartInstance.data.datasets[0].data = newData;
        this.chartInstance.update('none');

        this.animationFrameId = requestAnimationFrame(animate);
      };

      this.animationFrameId = requestAnimationFrame(animate);
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
            data: [...this.baseSkillPoints],
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
                // 显示真实的固定数值，而不是波动中的小数
                label: (context) => {
                  const label = context.label || '';
                  const realValue = this.baseSkillPoints[context.dataIndex];
                  return `${label}: ${realValue} 技能点`;
                },
                title: function(context) {
                  return `${context[0].label}`;
                },
              },
            },
          },
          scales: {
            r: {
              ticks: { display: false },
              grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 0.5 },
              angleLines: { color: 'rgba(0, 0, 0, 0.2)', lineWidth: 1 },
            },
          },
          animation: {
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
            // ⚠️ 动画加载完毕后，开始“活塞”运动
            onComplete: () => {
              this.startPistonAnimation();
            }
          },
        },
      });
    },
  },
};
</script>

<style scoped>
</style>
