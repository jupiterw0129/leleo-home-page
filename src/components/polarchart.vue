<template>
  <div style="width: 100%; height: 100%;">
    <canvas id="polarChart"></canvas>
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
      // ⚠️ 核心修复 1：绝对不要把 chartInstance 和 animationFrameId 放在 data 里！
      // Vue 拦截 Chart 实例会导致可怕的性能问题和卡死。
    };
  },
  created() {
    // 将不需要响应式的实例挂载到 this 上
    this.chartInstance = null;
    this.animationFrameId = null;
  },
  mounted() {
    if(import.meta.env.VITE_CONFIG){
        this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.renderChart();
  },
  beforeDestroy() {
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
    
    startRhythmAnimation() {
      const dataset = this.chartInstance.data.datasets[0];
      const numSlices = dataset.data.length;
      
      if (!dataset.offset) {
        dataset.offset = new Array(numSlices).fill(0);
      }

      const speed = 400; // 动画速度
      const maxOffset = 15; // 弹出的最大距离

      const animate = () => {
        // 如果实例已被销毁，安全退出
        if (!this.chartInstance) return;

        // ⚠️ 核心修复 2：悬停检测
        // 获取当前鼠标正在悬停的元素
        const activeElements = this.chartInstance.getActiveElements();
        const isHovering = activeElements.length > 0;

        // 只有在【没有悬停】的情况下，才更新律动动画
        // 这样就把交互控制权完美还给了 Chart.js，悬停时绝对不会卡顿
        if (!isHovering) {
          const time = Date.now() / speed;
          
          for (let i = 0; i < numSlices; i++) {
            // 发动机活塞相差公式
            const phase = i * ((Math.PI * 2) / numSlices); 
            const wave = (Math.sin(time + phase) + 1) / 2;
            dataset.offset[i] = wave * maxOffset;
          }
          
          this.chartInstance.update('none'); 
        }

        // 循环调用下一帧
        this.animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    },

    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
      const colors = this.generateColors(this.skills.length);
      
      if (this.chartInstance) {
        this.chartInstance.destroy();
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
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
            
            offset: new Array(this.skills.length).fill(0),

            // 悬停时的额外偏移量，当鼠标放上去时，扇形会进一步向外凸出一点
            hoverOffset: 20, 
            hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.9')),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(40, 40, 40, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              padding: 10,
              caretSize: 6,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                label: context => `${context.label || ''}: ${context.raw || ''} 技能点`,
                title: context => `${context[0].label}`,
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
            duration: 1500,
            easing: 'easeOutQuart',
            animateRotate: true,
            animateScale: true,
            onComplete: () => {
              if (!this.animationFrameId) {
                this.startRhythmAnimation();
              }
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
