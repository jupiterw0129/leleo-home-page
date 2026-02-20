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
      configdata:config,
      skills: null,
      skillPoints: null,
      chartInstance: null, // 新增：存储 Chart 实例
      pulseFactor: 1,          // 脉冲因子，用于动态透明度
      pulseDirection: 1,       // 脉冲方向（1递增，-1递减）
      pulseAnimationId: null,  // requestAnimationFrame ID
    };
  },
  mounted() {
    if(import.meta.env.VITE_CONFIG){
        this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    this.renderChart();
    this.startPulseEffect();   // 启动脉冲效果
  },
  beforeDestroy() { // 组件销毁前钩子（Vue 3 选项式 API 中也可用 beforeUnmount）
    if (this.chartInstance) {
      this.chartInstance.destroy(); // 销毁 Chart 实例
      this.chartInstance = null;
    }
    if (this.pulseAnimationId) {
      cancelAnimationFrame(this.pulseAnimationId); // 清理动画
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
      // 如果已有旧实例，先销毁（防止重复创建导致的内存泄漏）
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      this.originalColors = colors; // 存储原始颜色用于脉冲

      this.chartInstance = new Chart(ctx, { // 保存实例
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [{
            label: '技能点',
            data: this.skillPoints,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.6', '1')),
            borderWidth: 2,

            // 添加悬停效果
            hoverOffset: 15,                      // 扇形向外偏移15像素
            hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.8')), // 悬停时更亮
            hoverBorderColor: '#ffffff',           // 边框变白
            hoverBorderWidth: 4                    // 边框加粗
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
    startPulseEffect() {
      // 定义脉冲动画函数
      const pulse = () => {
        // 如果图表实例不存在或已被销毁，停止动画
        if (!this.chartInstance) return;
    
        // 更新脉冲因子：范围 0.6 ~ 1.0，步长 0.01
        this.pulseFactor += 0.01 * this.pulseDirection;
        
        // 边界检测并反转方向
        if (this.pulseFactor >= 1.0) {
          this.pulseFactor = 1.0;
          this.pulseDirection = -1;
        } else if (this.pulseFactor <= 0.6) {
          this.pulseFactor = 0.6;
          this.pulseDirection = 1;
        }
    
        // 基于原始颜色生成新的颜色数组，将透明度替换为当前脉冲因子
        const newColors = this.originalColors.map(color => {
          // 正则匹配 rgba 中的最后一个数字（透明度），替换为脉冲因子
          return color.replace(/[\d.]+\)$/, this.pulseFactor.toFixed(2) + ')');
        });
    
        // 更新图表数据集的背景色
        this.chartInstance.data.datasets[0].backgroundColor = newColors;
        
        // 调用 update 使图表重绘（使用无动画更新，避免与内置动画冲突）
        this.chartInstance.update();
    
        // 请求下一帧继续循环
        this.pulseAnimationId = requestAnimationFrame(pulse);
      };
    
      // 启动动画循环
      this.pulseAnimationId = requestAnimationFrame(pulse);
    },
  },
};
</script>

<style scoped>
</style>
