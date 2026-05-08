<template>
  <canvas id="polarChart"></canvas>
</template>

<script>
import { Chart, PolarAreaController, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';
import config from '../config.js';

Chart.register(PolarAreaController, ArcElement, RadialLinearScale, Tooltip, Legend);

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
  beforeUnmount() { 
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

      // 【核心修复 1】：添加帧率控制器，锁定 30 FPS
      const targetFPS = 30; 
      const frameInterval = 1000 / targetFPS; // 约 33.33ms 绘制一次
      let lastRenderTime = startTime;

      const animate = () => {
        // 先注册下一帧，保证循环继续
        this.animationFrameId = requestAnimationFrame(animate);

        const now = Date.now();
        const elapsedSinceLast = now - lastRenderTime;

        // 如果距离上次绘制还没到 33 毫秒，直接跳过，什么都不做
        if (elapsedSinceLast < frameInterval) {
            return; 
        }

        // 校准下次执行的时间，防止随着时间推移产生误差
        lastRenderTime = now - (elapsedSinceLast % frameInterval);

        const totalElapsed = now - startTime;
        const easeFactor = Math.min(1, totalElapsed / 800); 
        const time = now / 300; 

        for (let i = 0; i < datasetData.length; i++) {
          const baseVal = this.baseSkillPoints[i];
          const amplitude = baseVal * 0.12 * easeFactor; 
          const phase = i * (Math.PI / 1.55); 
          datasetData[i] = baseVal + amplitude * Math.sin(time + phase);
        }

        this.chartInstance.update('none');
      };

      this.animationFrameId = requestAnimationFrame(animate);
    },

    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
      const colors = this.generateColors(this.skills.length);
      
      const maxScore = Math.max(...this.skillPoints);
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
            hoverBorderWidth: 3,
            
            // 【核心修复 2】：开启纯净数据模式。
            // 告诉 Chart.js：数据只是简单的一维数组，别去解析格式
            normalized: true, 
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          hover: { animationDuration: 0 }, 
          // 【核心修复 3】：进一步关闭没必要的内部动画开销
          transitions: { active: { animation: { duration: 0 } } }, 
          plugins: {
            legend: { display: false },
            tooltip: {
              animation: false, // 保持之前修复的 tooltip 无动画配置
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
