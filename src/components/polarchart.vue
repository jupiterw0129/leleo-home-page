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
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.baseSkillPoints = [...this.skillPoints]; 
    
    // 非响应式变量
    this.chartInstance = null;
    this.animationFrameId = null;
    this.pistonStarted = false; 

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
    
    startPistonAnimation() {
      if (this.animationFrameId) return;

      const datasetData = this.chartInstance.data.datasets[0].data;
      const startTime = Date.now(); 

      const animate = () => {
        if (!this.chartInstance) return;

        const now = Date.now();
        // 稍微加快一点淡入速度 (800ms) 让过渡更果断
        const easeFactor = Math.min(1, (now - startTime) / 800); 
        const time = now / 300; 

        // 这里的 i < datasetData.length 比 this.baseSkillPoints.length 更安全
        for (let i = 0; i < datasetData.length; i++) {
          const baseVal = this.baseSkillPoints[i];
          const amplitude = baseVal * 0.10 * easeFactor; 
          const phase = i * (Math.PI / 1.5); 
          
          datasetData[i] = baseVal + amplitude * Math.sin(time + phase);
        }

        this.chartInstance.update('none');
        this.animationFrameId = requestAnimationFrame(animate);
      };

      this.animationFrameId = requestAnimationFrame(animate);
    },

    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
      const colors = this.generateColors(this.skills.length);
      
      // 1. 计算最大值，用于锁死坐标轴
      const maxScore = Math.max(...this.skillPoints);
      // 2. 预留 25% 的空间给活塞动画和悬停膨胀，防止撑破坐标轴
      const maxScale = maxScore * 1.25;

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      this.pistonStarted = false; 

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
            legend: { display: false },
            tooltip: {
              animation: false, // ⚠️ 关键修复：彻底关闭提示框的淡入动画，防止被高频刷新打断！
              backgroundColor: 'rgba(40, 40, 40, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 2,
              padding: 10,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  // 读取真实的静态数值
                  const realValue = this.baseSkillPoints[context.dataIndex];
                  return `${label}: ${realValue} 技能点`;
                },
                title: (context) => context[0].label,
              },
            },
          },
          scales: {
            r: {
              ticks: { display: false },
              grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 0.5 },
              angleLines: { color: 'rgba(0, 0, 0, 0.2)', lineWidth: 1 },
              
              // 之前修复跳动的锁死坐标轴
              suggestedMax: maxScale, 
              max: maxScale, 
              beginAtZero: true
            },
          },
          animation: {
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
            onComplete: () => {
              if (!this.pistonStarted) {
                this.pistonStarted = true;
                setTimeout(() => {
                    this.startPistonAnimation();
                }, 100);
              }
            }
          },
        },
      });
    },
  },
};
</script>
