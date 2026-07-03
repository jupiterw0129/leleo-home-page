<template>
  <canvas id="polarChart"></canvas>
</template>

<script>
import { Chart, PolarAreaController, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';
import config from '../config.js';

Chart.register(PolarAreaController, ArcElement, RadialLinearScale, Tooltip, Legend);

// —— 对数分频映射：将 128 个频率 bin 编为 11 组（低音细腻，高音聚合）——
const TOTAL_BINS = 128;
const SECTOR_COUNT = 11;
const FREQ_GROUPS = (() => {
  const groups = [];
  for (let i = 0; i < SECTOR_COUNT; i++) {
    const start = i === 0 ? 0 : Math.floor(Math.pow(TOTAL_BINS, i / SECTOR_COUNT));
    const end = Math.min(Math.floor(Math.pow(TOTAL_BINS, (i + 1) / SECTOR_COUNT)), TOTAL_BINS - 1);
    groups.push({ start, end, count: end - start + 1 });
  }
  return groups;
})();

export default {
  name: 'polarChart',
  props: {
    /** 来自父组件的 AnalyserNode（Web Audio API） */
    analyserNode: {
      type: Object,
      default: null,
    },
    /** 当前是否正在播放音乐 */
    isPlaying: {
      type: Boolean,
      default: false,
    },
  },
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

    // 非响应式变量（避免 Vue 代理导致性能损耗）
    this.chartInstance = null;
    this.animationFrameId = null;
    this.chartReady = false;
    this.chartMaxScale = 0;
    this.sectorEnergies = new Array(SECTOR_COUNT).fill(0);
    this.freqBuffer = new Uint8Array(TOTAL_BINS);

    this.renderChart();
  },
  beforeDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },
  watch: {
    /** 监听播放状态：播放→律动 / 暂停→归位 */
    isPlaying(val) {
      if (val) {
        this.startMusicAnimation();
      } else {
        this.stopMusicAnimation();
      }
    },
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

    // ===================== 音乐律动动画 =====================

    /**
     * 启动：每扇区独立响应其频段 + 相邻平滑 + 压缩平衡
     *
     * 策略：
     *   - 每个扇区独立跟踪自己频段的能量（包络跟随）→ 有层次
     *   - 相邻扇区加权混合（空间平滑）→ 过渡自然，不畸形
     *   - 平方根压缩 → 缩窄强弱差距，各频段都有表现机会
     *   - 严格钳位 → 不越界
     */
    startMusicAnimation() {
      if (this.animationFrameId) return;
      if (!this.analyserNode) return;

      const datasetData = this.chartInstance.data.datasets[0].data;
      const targetFPS = 30;
      const frameInterval = 1000 / targetFPS;
      let lastRenderTime = performance.now();

      const animate = () => {
        this.animationFrameId = requestAnimationFrame(animate);

        const now = performance.now();
        if (now - lastRenderTime < frameInterval) return;
        lastRenderTime = now - ((now - lastRenderTime) % frameInterval);

        // ① 频谱数据
        this.analyserNode.getByteFrequencyData(this.freqBuffer);

        // ② 每个扇区：独立包络跟随 + 平方根压缩
        const rawEnergies = [];
        for (let i = 0; i < SECTOR_COUNT; i++) {
          const { start, end } = FREQ_GROUPS[i];
          let maxVal = 0;
          for (let j = start; j <= end; j++) {
            if (this.freqBuffer[j] > maxVal) maxVal = this.freqBuffer[j];
          }
          const norm = Math.sqrt(maxVal / 255); // sqrt 压缩：拉近强弱差距

          if (norm > this.sectorEnergies[i]) {
            this.sectorEnergies[i] = norm;           // 快攻
          } else {
            this.sectorEnergies[i] += (norm - this.sectorEnergies[i]) * 0.1; // 慢衰
          }
          rawEnergies[i] = this.sectorEnergies[i];
        }

        // ③ 空间平滑 + 应用到扇区
        for (let i = 0; i < SECTOR_COUNT; i++) {
          const prev = rawEnergies[(i - 1 + SECTOR_COUNT) % SECTOR_COUNT];
          const curr = rawEnergies[i];
          const next = rawEnergies[(i + 1) % SECTOR_COUNT];
          const smoothed = prev * 0.20 + curr * 0.60 + next * 0.20;

          const baseVal = this.baseSkillPoints[i];
          const swing = baseVal * 0.22;
          let newVal = baseVal + swing * smoothed;
          if (newVal > this.chartMaxScale) newVal = this.chartMaxScale;
          if (newVal < baseVal * 0.25) newVal = baseVal * 0.25;

          datasetData[i] = newVal;
        }

        this.chartInstance.update('none');
      };

      this.animationFrameId = requestAnimationFrame(animate);
    },

    /**
     * 停止律动 → 指数衰减回到基准值（约 1 秒）
     */
    stopMusicAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.animateToBase();
    },

    animateToBase() {
      const datasetData = this.chartInstance.data.datasets[0].data;
      const returnSpeed = 0.08;
      const threshold = 0.3;

      const step = () => {
        let settled = 0;
        for (let i = 0; i < datasetData.length; i++) {
          const diff = this.baseSkillPoints[i] - datasetData[i];
          if (Math.abs(diff) < threshold) {
            datasetData[i] = this.baseSkillPoints[i];
            settled++;
          } else {
            datasetData[i] += diff * returnSpeed;
          }
        }

        this.chartInstance.update('none');

        if (settled < datasetData.length) {
          requestAnimationFrame(step);
        } else {
          this.sectorEnergies.fill(0);
        }
      };

      requestAnimationFrame(step);
    },

    // ===================== 图表初始化 =====================

    renderChart() {
      const ctx = document.getElementById('polarChart').getContext('2d');
      const colors = this.generateColors(this.skills.length);

      const maxScore = Math.max(...this.skillPoints);
      const maxScale = maxScore * 1.30;
      this.chartMaxScale = maxScale;  // 存储供动画钳位

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      this.chartReady = false;

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
            normalized: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          hover: { animationDuration: 0 },
          transitions: { active: { animation: { duration: 0 } } },
          plugins: {
            legend: { display: false },
            tooltip: {
              animation: false,
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
              beginAtZero: true,
            },
          },
          animation: {
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
            onComplete: () => {
              this.chartReady = true;
              // 入场动画结束时若音乐已在播放，立刻启动律动
              if (this.isPlaying && this.analyserNode) {
                this.startMusicAnimation();
              }
            },
          },
        },
      });
    },
  },
};
</script>
