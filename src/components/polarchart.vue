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
      if (this.animationFrameId) return;

      const datasetData = this.chartInstance.data.datasets[0].data;
      
      // 新增：记录活塞动画开始的精确时间点
      const startTime = Date.now(); 

      const animate = () => {
        if (!this.chartInstance) return;

        const now = Date.now();
        const elapsed = now - startTime; // 计算动画运行了多久（毫秒）
        
        // 【核心修复】：振幅淡入因子 (0 到 1)
        // 让活塞跳动的力度在最初的 1.2 秒（1200ms）内，从 0 平滑过渡到 100%
        // 这样交接瞬间的变化量绝对为 0，彻底消灭“突的一下”
        const easeFactor = Math.min(1, elapsed / 1200); 

        const time = now / 300; 

        for (let i = 0; i < this.baseSkillPoints.length; i++) {
          const baseVal = this.baseSkillPoints[i];
          
          // 将淡入因子乘到振幅上
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
