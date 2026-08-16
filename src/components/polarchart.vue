<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script>
import { Chart, PolarAreaController, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';
import config from '../config.js';

Chart.register(PolarAreaController, ArcElement, RadialLinearScale, Tooltip, Legend);

// —— 对数分频映射：128 bin → 11 组 ——
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

// 固定渐变色板：橙红 → 青蓝，与网站色调呼应
const PALETTE = [
  'rgba(255, 107, 53, 0.65)',   // 橙
  'rgba(255, 143, 66, 0.65)',   // 橙金
  'rgba(245, 180, 80, 0.65)',   // 金
  'rgba(210, 210, 90, 0.65)',   // 黄绿
  'rgba(140, 210, 120, 0.65)',  // 绿
  'rgba(80, 200, 165, 0.65)',   // 青绿
  'rgba(55, 185, 200, 0.65)',   // 青
  'rgba(50, 160, 220, 0.65)',   // 天蓝
  'rgba(60, 130, 225, 0.65)',   // 蓝
  'rgba(80, 100, 220, 0.65)',   // 深蓝
  'rgba(110, 80, 210, 0.65)',   // 紫蓝
];

export default {
  name: 'polarChart',

  props: {
    analyserNode: { type: Object, default: null },
    isPlaying: { type: Boolean, default: false },
    visible: { type: Boolean, default: false },
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

    this.chartInstance = null;
    this.animationFrameId = null;
    this._baseAnimId = null;
    this._stopTimer = null;
    this.chartMaxScale = 0;
    this.sectorEnergies = new Array(SECTOR_COUNT).fill(0);
    this.freqBuffer = new Uint8Array(TOTAL_BINS);

    if (this.visible) this.renderChart();
  },

  beforeDestroy() {
    if (this._stopTimer) { clearTimeout(this._stopTimer); this._stopTimer = null; }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this._baseAnimId) {
      cancelAnimationFrame(this._baseAnimId);
      this._baseAnimId = null;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },

  watch: {
    visible(val) {
      if (val && !this.chartInstance) {
        this.renderChart();
      }
    },
    isPlaying(val) {
      if (val) {
        if (this._stopTimer) { clearTimeout(this._stopTimer); this._stopTimer = null; }
        this.startMusicAnimation();
      } else {
        this._stopTimer = setTimeout(() => {
          this.stopMusicAnimation();
          this._stopTimer = null;
        }, 250);
      }
    },
    analyserNode(node) {
      if (node && this.isPlaying && this.chartInstance && !this.animationFrameId) {
        this.startMusicAnimation();
      }
    },
  },

  methods: {
    // ===================== 音乐律动动画 =====================

    startMusicAnimation() {
      if (this.animationFrameId) return;
      if (!this.analyserNode || !this.chartInstance) return;

      if (this._baseAnimId) {
        cancelAnimationFrame(this._baseAnimId);
        this._baseAnimId = null;
      }

      const datasetData = this.chartInstance.data.datasets[0].data;
      const targetFPS = 30;
      const frameInterval = 1000 / targetFPS;
      let lastTime = performance.now();

      // 统一摆动上限：所有扇区有相同的最大脉冲潜力
      const maxBase = Math.max(...this.baseSkillPoints);
      const sharedSwing = maxBase * 0.45;

      const animate = () => {
        this.animationFrameId = requestAnimationFrame(animate);

        const now = performance.now();
        if (now - lastTime < frameInterval) return;
        lastTime = now - ((now - lastTime) % frameInterval);

        // ① 频谱数据
        this.analyserNode.getByteFrequencyData(this.freqBuffer);

        // ② 每个扇区：包络跟随（快攻 + 慢衰 → 心跳感）
        const energies = [];
        for (let i = 0; i < SECTOR_COUNT; i++) {
          const { start, end } = FREQ_GROUPS[i];
          let maxVal = 0;
          for (let j = start; j <= end; j++) {
            if (this.freqBuffer[j] > maxVal) maxVal = this.freqBuffer[j];
          }
          // 轻度压缩，保留动态
          const norm = Math.pow(maxVal / 255, 0.55);

          if (norm > this.sectorEnergies[i]) {
            this.sectorEnergies[i] = norm;           // 瞬间冲上去
          } else {
            this.sectorEnergies[i] += (norm - this.sectorEnergies[i]) * 0.07; // 缓慢回落
          }
          energies[i] = this.sectorEnergies[i];
        }

        // ③ 极弱平滑 + 统一摆动 → 每个扇区独立跳动
        for (let i = 0; i < SECTOR_COUNT; i++) {
          const prev = energies[(i - 1 + SECTOR_COUNT) % SECTOR_COUNT];
          const curr = energies[i];
          const next = energies[(i + 1) % SECTOR_COUNT];
          const smoothed = prev * 0.05 + curr * 0.90 + next * 0.05;

          // 静音时保持技能点差异，有能量时统一爆发
          const baseVal = this.baseSkillPoints[i];
          let newVal = baseVal + sharedSwing * smoothed;
          if (newVal > this.chartMaxScale) newVal = this.chartMaxScale;
          if (newVal < baseVal * 0.08) newVal = baseVal * 0.08;

          datasetData[i] = newVal;
        }

        this.chartInstance.update('none');
      };

      this.animationFrameId = requestAnimationFrame(animate);
    },

    stopMusicAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.animateToBase();
    },

    animateToBase() {
      const datasetData = this.chartInstance.data.datasets[0].data;
      const returnSpeed = 0.07;
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
          this._baseAnimId = requestAnimationFrame(step);
        } else {
          this._baseAnimId = null;
          this.sectorEnergies.fill(0);
        }
      };

      this._baseAnimId = requestAnimationFrame(step);
    },

    // ===================== 图表初始化 =====================

    renderChart() {
      const canvas = this.$refs.chartCanvas;
      const ctx = canvas.getContext('2d');

      const maxScore = Math.max(...this.skillPoints);
      const maxScale = maxScore * 1.50;  // 给律动留足空间
      this.chartMaxScale = maxScale;

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.skills,
          datasets: [{
            label: '技能点',
            data: [...this.baseSkillPoints],
            backgroundColor: PALETTE,
            borderColor: PALETTE.map(c => c.replace('0.65', '0.95')),
            borderWidth: 2,
            hoverOffset: 12,
            hoverBackgroundColor: PALETTE.map(c => c.replace('0.65', '0.85')),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1800,
            easing: 'easeOutQuad',
            animateRotate: true,
            animateScale: true,
            onComplete: () => {
              if (this.isPlaying && this.analyserNode) {
                this.startMusicAnimation();
              }
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(30, 35, 45, 0.85)',
              titleColor: '#fff',
              bodyColor: '#ddd',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              callbacks: {
                label: (ctx) => {
                  const real = this.baseSkillPoints[ctx.dataIndex];
                  return `${ctx.label}: ${real} 技能点`;
                },
              },
            },
          },
          scales: {
            r: {
              ticks: { display: false },
              grid: { color: 'rgba(255, 255, 255, 0.08)', lineWidth: 0.5 },
              angleLines: { color: 'rgba(255, 255, 255, 0.10)', lineWidth: 0.8 },
              suggestedMax: maxScale,
              max: maxScale,
              beginAtZero: true,
            },
          },
        },
      });
    },
  },
};
</script>
