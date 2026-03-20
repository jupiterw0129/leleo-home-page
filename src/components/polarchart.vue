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
      chartInstance: null,
      animationFrameId: null, // 新增：用于存储动画帧ID，方便销毁
    };
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
    // 组件销毁前必须清理动画，防止内存泄漏
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
    
    // 新增：启动律动动画的方法
    startRhythmAnimation() {
      const dataset = this.chartInstance.data.datasets[0];
      const numSlices = dataset.data.length;
      
      // 初始化 offset 数组（如果还没有的话）
      if (!dataset.offset) {
        dataset.offset = new Array(numSlices).fill(0);
      }

      // 动画核心参数
      const speed = 400; // 动画速度，数值越小越快
      const maxOffset = 15; // 扇形向外弹出的最大像素值

      const animate = () => {
        const time = Date.now() / speed;
        
        for (let i = 0; i < numSlices; i++) {
          // 计算相位差：使得每个扇形依次弹起（发动机活塞效果）
          // 如果你想要整体“心跳/呼吸”效果，把 phase 设为 0 即可：const phase = 0;
          const phase = i * ((Math.PI * 2) / numSlices); 
          
          // Math.sin 产生 -1 到 1 的值，(sin + 1) / 2 将其转换为 0 到 1 的平滑值
          const wave = (Math.sin(time + phase) + 1) / 2;
          
          // 动态设置当前扇形的偏移量
          dataset.offset[i] = wave * maxOffset;
        }

        // 使用 'none' 模式更新图表，避免触发默认的重绘动画导致卡顿
        this.chartInstance.update('none'); 
        
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
            
            // 基础偏移量（会被动画动态修改）
            offset: new Array(this.skills.length).fill(0),

            // 悬停效果
            hoverOffset: 25, // 因为动画已经有 offset 了，悬停时的外扩可以再稍微加大一点点
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
              backgroundColor: 'rgba(40, 40, 40, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 2,
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
            duration: 1800,
            easing: 'easeOutElastic', // 初始加载动画改成了有弹性的效果，看起来更有活力
            animateRotate: true,
            animateScale: true,
            onComplete: () => {
              // 关键：等待 Chart.js 的初始开场动画结束后，再接上我们的无限循环律动动画
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
