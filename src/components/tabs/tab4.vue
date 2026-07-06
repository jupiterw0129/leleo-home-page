<template>
  <v-container fluid class="pa-0 personal-console">
    <div class="personal-hero">
      <div>
        <span class="eyebrow">Personal Lab</span>
        <h3>个性化</h3>
        <p>管理桌宠、鼠标拖尾和页面陪伴感，让主页不只是一张背景。</p>
      </div>
      <div class="status-stack">
        <div>
          <span>桌宠</span>
          <strong>{{ petEnabled ? currentPetName : '已关闭' }}</strong>
        </div>
        <div>
          <span>鼠标特效</span>
          <strong>{{ sparkEnabled ? '开启' : '关闭' }}</strong>
        </div>
      </div>
    </div>

    <div class="settings-grid">
      <section class="setting-panel pet-panel">
        <div class="panel-title">
          <v-icon>mdi-paw</v-icon>
          <span>桌宠</span>
          <v-spacer></v-spacer>
          <v-switch
            v-model="petEnabled"
            color="var(--leleo-vcard-color)"
            hide-details
            inset
            density="compact"
            @update:model-value="togglePet"
          ></v-switch>
        </div>

        <div class="pet-grid" v-show="petEnabled">
          <button
            type="button"
            v-for="pet in pets"
            :key="pet.index"
            class="pet-card"
            :class="{ 'selected-item': selectedPet === pet.index }"
            @click="selectPet(pet.index)"
          >
            <img :src="pet.icon" :alt="pet.name">
            <span>{{ pet.name }}</span>
            <small>{{ pet.author }}</small>
          </button>
        </div>

        <div class="empty-state" v-show="!petEnabled">
          <v-icon>mdi-eye-off-outline</v-icon>
          <span>桌宠已隐藏，页面会更安静。</span>
        </div>
      </section>

      <section class="setting-panel effect-panel">
        <div class="panel-title">
          <v-icon>mdi-mouse</v-icon>
          <span>鼠标特效</span>
        </div>

        <div class="effect-row">
          <div class="spark-preview" :class="{ off: !sparkEnabled }">
            <i></i><i></i><i></i><i></i>
          </div>
          <div>
            <h4>鼠标拖尾特效</h4>
            <p>{{ sparkEnabled ? '移动鼠标时显示蓝色轨迹。' : '轨迹已隐藏，适合低干扰浏览。' }}</p>
          </div>
          <v-switch
            v-model="sparkEnabled"
            color="var(--leleo-vcard-color)"
            hide-details
            inset
            density="compact"
            @update:model-value="toggleSpark"
          ></v-switch>
        </div>

        <div class="tips-grid">
          <div>
            <v-icon>mdi-monitor</v-icon>
            <span>桌面端显示</span>
          </div>
          <div>
            <v-icon>mdi-content-save-outline</v-icon>
            <span>偏好自动保存</span>
          </div>
        </div>
      </section>
    </div>

    <div class="d-flex justify-center mt-4">
      <v-btn variant="tonal" class="ma-2" @click="cancel()">取消</v-btn>
    </div>
  </v-container>
</template>

<script>
const SPARK_KEY = 'leleo-spark'

export default {
  emits: ['cancel'],
  data() {
    return {
      pets: [
        { name: 'Doro',  index: 0, icon: '/live2d/Doro/icon.webp',    author: 'UP：水脚脚',   type: 'live2d' },
        { name: '小周',  index: 1, icon: '/live2d/XiaoZhou/icon.webp', author: 'UP：汪汪嗷唔', type: 'live2d' },
        { name: 'MCZhou', index: 2, icon: '/live2d/MCZhou/icon.webp', author: 'JupiterW',    type: 'live2d' },
        { name: '阿蒙',  index: 3, icon: '/shimeji/icon.webp',          author: 'UP：理智光泽汀', type: 'shimeji' },
      ],
      selectedPet: 0,
      sparkEnabled: true,
      petEnabled: true,
    }
  },
  computed: {
    currentPetName() {
      return this.pets.find(pet => pet.index === this.selectedPet)?.name || 'Doro'
    },
  },
  mounted() {
    const savedPet = localStorage.getItem('leleo-pet')
    if (savedPet !== null) {
      this.selectedPet = parseInt(savedPet)
    }
    this.sparkEnabled = localStorage.getItem(SPARK_KEY) !== '0'
    this.petEnabled = localStorage.getItem('leleo-pet-off') !== '1'
  },
  methods: {
    async selectPet(index) {
      this.selectedPet = index
      localStorage.setItem('leleo-pet', index)

      if (index === 3) {
        const stage = window.__oml2d?.stage?.element
        if (stage) stage.style.display = 'none'
        window.__toggleShimeji?.(true)
      } else {
        window.__toggleShimeji?.(false)
        const hideCss = document.getElementById('hide-live2d-temp')
        if (hideCss) hideCss.remove()
        const stage = window.__oml2d?.stage?.element
        if (stage) stage.style.display = 'block'
        if (window.__oml2d?.switchPet) {
          await window.__oml2d.switchPet(index)
        }
      }
    },
    togglePet(val) {
      localStorage.setItem('leleo-pet-off', val ? '0' : '1')
      if (val) {
        this.selectPet(this.selectedPet)
      } else {
        window.__toggleShimeji?.(false)
        const stage = window.__oml2d?.stage?.element
        if (stage) stage.style.display = 'none'
      }
    },
    toggleSpark(val) {
      localStorage.setItem(SPARK_KEY, val ? '1' : '0')
      const canvas = document.getElementById('sparkCanvas')
      if (val) {
        if (canvas) canvas.style.display = 'block'
        if (window.SparkEffect && !window.spark) {
          window.SparkEffect.create('sparkCanvas', {
            color: '45,175,255', scale: 1.5, opacity: 1.0,
            trailSpeed: 1.0, clickSpeed: 1.0, enableTrail: true
          })
          if (window.setInputContext) window.setInputContext('mouse', true)
        }
      } else {
        if (canvas) canvas.style.display = 'none'
      }
    },
    cancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped>
.personal-console {
  min-height: 520px;
}

.personal-hero,
.setting-panel {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
}

.personal-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  display: block;
  color: rgba(255,255,255,0.62);
  font-size: 0.76rem;
  text-transform: uppercase;
}

.personal-hero h3 {
  margin: 0.15rem 0 0.3rem;
  color: #fff;
  font-size: 1.7rem;
  letter-spacing: 0;
}

.personal-hero p,
.effect-row p {
  margin: 0;
  color: rgba(255,255,255,0.68);
}

.status-stack {
  display: grid;
  grid-template-columns: repeat(2, 128px);
  gap: 0.65rem;
}

.status-stack div,
.tips-grid div {
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(0,0,0,0.16);
}

.status-stack span {
  display: block;
  color: rgba(255,255,255,0.62);
  font-size: 0.75rem;
}

.status-stack strong {
  display: block;
  margin-top: 0.25rem;
  color: #fff;
}

.settings-grid {
  display: grid;
  grid-template-columns: minmax(420px, 1.2fr) minmax(300px, 0.8fr);
  gap: 1rem;
}

.setting-panel {
  min-height: 300px;
  padding: 1rem;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
  color: #fff;
  font-weight: 800;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.pet-card {
  min-height: 190px;
  padding: 0;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.16);
  color: #fff;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.pet-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.34);
}

.pet-card img {
  width: 100%;
  height: 118px;
  object-fit: cover;
  display: block;
}

.pet-card span,
.pet-card small {
  display: block;
  padding: 0 0.55rem;
}

.pet-card span {
  margin-top: 0.55rem;
  font-weight: 800;
}

.pet-card small {
  margin-top: 0.2rem;
  color: rgba(255,255,255,0.6);
}

.selected-item {
  border-color: var(--leleo-vcard-color);
  box-shadow: 0 0 12px var(--leleo-vcard-color);
}

.effect-row {
  display: grid;
  grid-template-columns: 86px 1fr auto;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem;
  border-radius: 8px;
  background: rgba(0,0,0,0.16);
}

.effect-row h4 {
  margin: 0 0 0.25rem;
  color: #fff;
  letter-spacing: 0;
}

.spark-preview {
  position: relative;
  height: 66px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(45,175,255,0.25), rgba(255,255,255,0.08));
}

.spark-preview i {
  position: absolute;
  width: 18px;
  height: 4px;
  border-radius: 999px;
  background: rgb(45,175,255);
  box-shadow: 0 0 14px rgba(45,175,255,0.8);
}

.spark-preview i:nth-child(1) { left: 14px; top: 18px; transform: rotate(-12deg); }
.spark-preview i:nth-child(2) { left: 30px; top: 29px; transform: rotate(8deg); }
.spark-preview i:nth-child(3) { left: 46px; top: 40px; transform: rotate(-8deg); }
.spark-preview i:nth-child(4) { left: 58px; top: 50px; transform: rotate(14deg); }
.spark-preview.off { filter: grayscale(1); opacity: 0.5; }

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.tips-grid div {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(255,255,255,0.74);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 210px;
  color: rgba(255,255,255,0.72);
}

@media (max-width: 900px) {
  .personal-hero,
  .settings-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .status-stack,
  .pet-grid,
  .tips-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
