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
      originalSkillPoints: null, // 新增：保存真实的原始数据
      chartInstance: null,
      animationFrameId: null,    // 新增：保存动画帧ID，用于清理
    };
  },
  mounted() {
    if(import.meta.env.VITE_CONFIG){
        this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    // 深拷贝一份原始数据，用于动画基准和 Tooltip 显示
    this.originalSkillPoints = [...this.skillPoints]; 
    
    this.renderChart();
  },
  beforeDestroy() { 
    // 组件销毁时，务必清除动画帧，防止内存泄漏
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
    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
      const colors = this.generateColors(this.skills.length);
      
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // 计算最大值，用于固定网格大小（加上10%的余量，防止呼吸时顶破边界）
      const maxDataValue = Math.max(...this.originalSkillPoints);

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [{
            label: '技能点',
            data: [...this.originalSkillPoints], // 使用副本初始化
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
                label: (context) => {
                  const label = context.label || '';
                  // 【关键】从原始数据中取值，否则会显示跳动产生的小数
                  const realValue = this.originalSkillPoints[context.dataIndex];
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
              max: maxDataValue * 1.15, // 【关键】固定最大值，防止网格跟着呼吸缩放
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

      // 等待初始的出场动画（1800ms）结束后，开始呼吸律动
      setTimeout(() => {
        this.startBreathingAnimation();
      }, 1800);
    },
    
    // 新增：呼吸律动核心逻辑
    startBreathingAnimation() {
      const animate = () => {
        if (!this.chartInstance) return;

        const time = Date.now() / 400; // 除数越小，跳动越快。400是一个偏向“心跳/呼吸”的舒适节奏
        const dataset = this.chartInstance.data.datasets[0];

        dataset.data = this.originalSkillPoints.map((val, index) => {
          // 振幅：数值的 4% 作为波动的幅度
          const amplitude = val * 0.04; 
          // 相位差：index * 0.8 让相邻的扇形错开跳动，形成一圈一圈的律动感
          const phase = index * 0.8; 
          
          return val + amplitude * Math.sin(time + phase);
        });

        // 使用 'none' 模式更新，避免触发默认的过渡动画，保证丝滑
        this.chartInstance.update('none'); 
        
        this.animationFrameId = requestAnimationFrame(animate);
      };

      this.animationFrameId = requestAnimationFrame(animate);
    }
  },
};
</script>

<style scoped>
</style>
