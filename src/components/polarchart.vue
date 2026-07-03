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
    this.smoothedEnergy = 0;
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
     * 启动：包络跟随器 + 统一脉动（美观优先，不畸形）
     *
     * 策略：
     *   - 整体频谱能量 → 包络跟随（快攻慢衰）→ 所有扇区统一呼吸
     *   - 各频段仅贡献 20% 的细微差异，不会破坏对称美感
     *   - 只向外扩张（不收缩），严格钳位到 maxScale
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

        // ② 整体频谱能量（全频段平均 → 0~1）
        let total = 0;
        for (let i = 0; i < TOTAL_BINS; i++) total += this.freqBuffer[i];
        const avgEnergy = total / TOTAL_BINS / 255;

        // ③ 包络跟随器：快攻（beat 立刻跳起）+ 慢衰（自然回落）
        if (avgEnergy > this.smoothedEnergy) {
          this.smoothedEnergy = avgEnergy;
        } else {
          this.smoothedEnergy += (avgEnergy - this.smoothedEnergy) * 0.08;
        }

        // ④ 每个扇区：80% 统一能量 + 20% 本频段特色 → 对称又灵动
        for (let i = 0; i < SECTOR_COUNT; i++) {
          const baseVal = this.baseSkillPoints[i];

          const { start, end } = FREQ_GROUPS[i];
          let maxVal = 0;
          for (let j = start; j <= end; j++) {
            if (this.freqBuffer[j] > maxVal) maxVal = this.freqBuffer[j];
          }
          const freqNorm = maxVal / 255;

          const combined = this.smoothedEnergy * 0.80 + freqNorm * 0.20;

          // ⑤ 只向外扩张 ±25%，严格不越界
          const swing = baseVal * 0.25;
          let newVal = baseVal + swing * combined;
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
          this.smoothedEnergy = 0;
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
