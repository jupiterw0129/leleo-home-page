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
      baseSkillPoints: null, // 新增：保存真实的初始技能点
      chartInstance: null,
      animationFrameId: null, // 新增：存储动画帧 ID 用于销毁
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;
    // 拷贝一份真实数据，作为活塞运动的基准线
    this.baseSkillPoints = [...this.skillPoints]; 
    
    this.renderChart();
  },
  beforeDestroy() { 
    // 组件销毁前，必须停止动画循环，防止内存泄漏
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
    
    // 新增：活塞跳动动画引擎
    startPistonAnimation() {
      const animate = (timestamp) => {
        if (!this.chartInstance) return;

        // 控制速度：除以的数字越大，跳动越慢 (例如 300 比较适中)
        const time = timestamp / 300; 

        const newData = this.baseSkillPoints.map((baseVal, index) => {
          // 控制幅度：基础值的 10% 作为振幅
          const amplitude = baseVal * 0.10; 
          // 控制相位差：让每个扇形的波动错开，产生此起彼伏的活塞感
          const phase = index * (Math.PI / 1.5); 

          // 核心公式：基础值 + 振幅 * sin(时间 + 相位差)
          return baseVal + amplitude * Math.sin(time + phase);
        });

        // 将计算出的波动数据赋给图表
        this.chartInstance.data.datasets[0].data = newData;
        // 使用 'none' 模式更新，这非常重要！防止与 Chart.js 默认的过渡动画打架导致卡顿
        this.chartInstance.update('none');

        // 循环调用下一帧
        this.animationFrameId = requestAnimationFrame(animate);
      };

      // 启动动画
      this.animationFrameId = requestAnimationFrame(animate);
    },

    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
      const colors = this.generateColors(this.skills.length);
      
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [{
            label: '技能点',
            data: [...this.baseSkillPoints], // 初始使用真实数据
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
                // 【重要修改】让 Tooltip 显示真实的技能点，而不是波动中的小数点
                label: (context) => {
                  const label = context.label || '';
                  // 从 baseSkillPoints 读取真实值，而不是用 context.raw
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
            // 初始加载动画配置
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
            // 初始加载动画完成后，触发活塞跳动动画
            onComplete: () => {
              // 确保只启动一次
              if (!this.animationFrameId) {
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
