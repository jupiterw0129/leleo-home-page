<template>
  <v-container fluid class="pa-0">
    <!-- 桌宠选择 -->
    <v-card variant="tonal" rounded="lg" class="mb-4 pa-3">
      <v-card-title class="text-body-1 font-weight-bold pa-2">
        <v-icon class="mr-2">mdi-paw</v-icon>桌宠选择
      </v-card-title>
      <v-row class="justify-center">
        <v-col cols="6" sm="4" v-for="pet in pets" :key="pet.index" class="d-flex justify-center">
          <v-card
            variant="tonal"
            rounded="lg"
            class="pet-card"
            :class="{ 'selected-item': selectedPet === pet.index }"
            @click="selectPet(pet.index)"
          >
            <v-img
              :src="pet.icon"
              :max-height="150"
              cover
              class="pet-img"
            >
              <template v-slot:placeholder>
                <v-row align="center" class="fill-height ma-0" justify="center">
                  <v-progress-circular color="grey-lighten-5" indeterminate></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-card-text class="text-center pa-2">
              <div class="pet-name">{{ pet.name }}</div>
              <div class="pet-author">{{ pet.author }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- 鼠标特效 -->
    <v-card variant="tonal" rounded="lg" class="mb-4 pa-3">
      <v-card-title class="text-body-1 font-weight-bold pa-2">
        <v-icon class="mr-2">mdi-mouse</v-icon>鼠标特效
      </v-card-title>
      <v-list density="compact" bg-color="transparent">
        <v-list-item>
          <template v-slot:prepend>
            <v-icon :color="sparkEnabled ? 'var(--leleo-vcard-color)' : ''">mdi-sparkles</v-icon>
          </template>
          <v-list-item-title>鼠标拖尾特效</v-list-item-title>
          <template v-slot:append>
            <v-switch
              v-model="sparkEnabled"
              color="var(--leleo-vcard-color)"
              hide-details
              inset
              density="compact"
              @update:model-value="toggleSpark"
            ></v-switch>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <div class="d-flex justify-center mt-2">
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
        { name: 'Doro', index: 0, icon: '/live2d/Doro/icon.webp', author: 'UP：水脚脚' },
        { name: '小周', index: 1, icon: '/live2d/XiaoZhou/icon.webp', author: 'UP：汪汪嗷唔' },
      ],
      selectedPet: 0,
      sparkEnabled: true,
    }
  },
  mounted() {
    const savedPet = localStorage.getItem('leleo-pet')
    if (savedPet !== null) {
      this.selectedPet = parseInt(savedPet)
    }

    this.sparkEnabled = localStorage.getItem(SPARK_KEY) !== '0'
  },
  methods: {
    async selectPet(index) {
      this.selectedPet = index
      if (window.__oml2d?.switchPet) {
        await window.__oml2d.switchPet(index)
      }
    },
    toggleSpark(val) {
      localStorage.setItem(SPARK_KEY, val ? '1' : '0')
      const canvas = document.getElementById('sparkCanvas')
      if (val) {
        if (canvas) {
          canvas.style.display = 'block'
        }
        // 如果页面加载时 spark 未初始化，现在创建
        if (window.SparkEffect && !window.spark) {
          window.SparkEffect.create('sparkCanvas', {
            color: '45,175,255',
            scale: 1.5,
            opacity: 1.0,
            trailSpeed: 1.0,
            clickSpeed: 1.0,
            enableTrail: true
          })
          if (window.setInputContext) {
            window.setInputContext('mouse', true)
          }
        }
      } else {
        if (canvas) {
          canvas.style.display = 'none'
        }
      }
    },
    cancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped>
.pet-card {
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  border: 2px solid transparent;
  width: 160px;
}

.pet-card:hover {
  border-color: var(--leleo-vcard-color);
}

.selected-item {
  border-color: var(--leleo-vcard-color);
  box-shadow: 0 0 12px var(--leleo-vcard-color);
}

.pet-img {
  border-radius: 0.5rem 0.5rem 0 0;
}

.pet-name {
  font-size: 14px;
  font-weight: bold;
  color: var(--leleo-vcard-color);
}

.pet-author {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}
</style>
