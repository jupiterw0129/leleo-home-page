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
    
    // 初始化非响应式变量
    this.chartInstance = null;
    this.animationFrameId = null;
    this.pistonStarted = false; // 新增：动画锁，防止动画被重复触发

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
      // 如果已经在运行，直接跳过，防止动画打架
      if (this.animationFrameId) return;

      // 获取当前图表数据集的引用，直接在原数组上修改（极大提升性能，避免 GC 顿挫）
      const datasetData = this.chartInstance.data.datasets[0].data;

      const animate = () => {
        if (!this.chartInstance) return;

        const time = Date.now() / 300; 

        // 性能优化：使用普通的 for 循环原地更新数据，不再每次 map 产生新数组
        for (let i = 0; i < this.baseSkillPoints.length; i++) {
          const baseVal = this.baseSkillPoints[i];
          const amplitude = baseVal * 0.10; 
          const phase = i * (Math.PI / 1.5); 
          
          datasetData[i] = baseVal + amplitude * Math.sin(time + phase);
        }

        // 无动画模式强制刷新当前帧
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
      
      // 重置锁
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
          
          // 悬停动画配置：保持悬停响应，但缩短时间减少与 update('none') 的冲突
          hover: {
            animationDuration: 150 
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
            onComplete: () => {
              // ⚠️ 关键修改：只在图表第一次彻底加载完毕时触发一次活塞动画
              if (!this.pistonStarted) {
                this.pistonStarted = true;
                this.startPistonAnimation();
              }
            }
          },
        },
      });
    },
  },
};
</script>
