<template>
  <div class="chart-wrap">
    <canvas ref="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import config from '../config.js';

Chart.register(ArcElement, Tooltip, Legend, RadialLinearScale);

// 纯绘制型插件：不改数据，不改事件，只改显示效果
const breathingPolarPlugin = {
  id: 'breathingPolarPlugin',

  afterDatasetsDraw(chart, args, pluginOptions) {
    const datasetIndex = 0;
    const meta = chart.getDatasetMeta(datasetIndex);
    const dataset = chart.data.datasets[datasetIndex];
    if (!meta || !meta.data) return;

    const ctx = chart.ctx;
    const time = performance.now() * (pluginOptions.speed || 0.0025);
    const amplitude = pluginOptions.amplitude || 6;
    const stagger = pluginOptions.stagger || 0.8;

    meta.data.forEach((arc, i) => {
      const props = arc.getProps(
        ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius', 'options'],
        true
      );

      const angle = (props.startAngle + props.endAngle) / 2;
      const pulse = (Math.sin(time + i * stagger) + 1) / 2;
      const offset = pulse * amplitude;

      const dx = Math.cos(angle) * offset;
      const dy = Math.sin(angle) * offset;

      // hover 时保留原本的 hoverOffset 视觉增强
      const isActive = arc.active === true;
      const extraHoverOffset = isActive ? (props.options.hoverOffset || 15) : 0;
      const hdx = Math.cos(angle) * extraHoverOffset;
      const hdy = Math.sin(angle) * extraHoverOffset;

      const backgroundColor = Array.isArray(dataset.backgroundColor)
        ? dataset.backgroundColor[i]
        : dataset.backgroundColor;

      const borderColor = Array.isArray(dataset.borderColor)
        ? dataset.borderColor[i]
        : dataset.borderColor;

      const hoverBackgroundColor = Array.isArray(dataset.hoverBackgroundColor)
        ? dataset.hoverBackgroundColor[i]
        : dataset.hoverBackgroundColor;

      const hoverBorderColor = dataset.hoverBorderColor || '#ffffff';
      const hoverBorderWidth = dataset.hoverBorderWidth || 3;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(props.x + dx + hdx, props.y + dy + hdy);
      ctx.arc(
        props.x + dx + hdx,
        props.y + dy + hdy,
        props.outerRadius,
        props.startAngle,
        props.endAngle
      );
      ctx.arc(
        props.x + dx + hdx,
        props.y + dy + hdy,
        props.innerRadius,
        props.endAngle,
        props.startAngle,
        true
      );
      ctx.closePath();

      ctx.fillStyle = isActive
        ? (hoverBackgroundColor || backgroundColor)
        : backgroundColor;
      ctx.fill();

      ctx.lineWidth = isActive
        ? hoverBorderWidth
        : (Array.isArray(dataset.borderWidth) ? dataset.borderWidth[i] : dataset.borderWidth || 2);

      ctx.strokeStyle = isActive
        ? hoverBorderColor
        : borderColor;

      ctx.stroke();
      ctx.restore();
    });
  }
};

Chart.register(breathingPolarPlugin);

export default {
  name: 'polarChart',
  data() {
    return {
      configdata: config,
      skills: null,
      skillPoints: null,
      chartInstance: null,
      animationFrameId: null,
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.polarChart.skills;
    this.skillPoints = this.configdata.polarChart.skillPoints;

    this.renderChart();
    this.startBreathing();
  },
  beforeUnmount() {
    this.stopBreathing();

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
      const canvas = this.$refs.polarChart;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
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
            data: this.skillPoints,

            // 保持你的原配色
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.6', '1')),
            borderWidth: 2,

            // 保持 hover 配置
            hoverOffset: 15,
            hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.8')),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,

          // 关闭默认数据动画，避免和自定义“呼吸”打架
          animation: {
            duration: 0,
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

            // 插件参数
            breathingPolarPlugin: {
              amplitude: 8,
              speed: 0.003,
              stagger: 0.8,
            }
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

          // 交互保持开启
          interaction: {
            mode: 'nearest',
            intersect: true,
          },
        },

        plugins: [
          {
            // 把原始扇形隐藏掉，但保留事件命中
            id: 'hideOriginalArcs',
            beforeDatasetDraw(chart, args) {
              if (args.index !== 0) return;

              const meta = chart.getDatasetMeta(0);
              meta.data.forEach((arc) => {
                if (!arc.$savedOptions) {
                  arc.$savedOptions = {
                    backgroundColor: arc.options.backgroundColor,
                    borderColor: arc.options.borderColor,
                    borderWidth: arc.options.borderWidth,
                  };
                }

                arc.options.backgroundColor = 'rgba(0,0,0,0)';
                arc.options.borderColor = 'rgba(0,0,0,0)';
                arc.options.borderWidth = 0;
              });
            },
            afterDatasetDraw(chart, args) {
              if (args.index !== 0) return;

              const meta = chart.getDatasetMeta(0);
              meta.data.forEach((arc) => {
                if (arc.$savedOptions) {
                  arc.options.backgroundColor = arc.$savedOptions.backgroundColor;
                  arc.options.borderColor = arc.$savedOptions.borderColor;
                  arc.options.borderWidth = arc.$savedOptions.borderWidth;
                }
              });
            }
          }
        ]
      });
    },

    startBreathing() {
      const loop = () => {
        if (this.chartInstance) {
          // 只重绘，不 update 数据，不破坏 hover 状态
          this.chartInstance.draw();
        }
        this.animationFrameId = requestAnimationFrame(loop);
      };
      loop();
    },

    stopBreathing() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },
  },
};
</script>

<style scoped>
.chart-wrap {
  position: relative;
  width: 100%;
  height: 400px;
}
</style>
