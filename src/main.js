import { createApp } from 'vue'
import App from './App.vue'
import { loadOml2d } from 'oh-my-live2d'
import { startShimeji, stopShimeji, isShimejiRunning } from './shimeji.js'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import {
  VApp,
  VRow,
  VCol,
  VCard,
  VCardTitle,
  VCardSubtitle,
  VCardText,
  VCardActions,
  VCardItem,
  VAvatar,
  VImg,
  VChip,
  VBtn,
  VIcon,
  VContainer,
  VSwitch,
  VDialog,
  VTabs,
  VTab,
  VTabsWindow,
  VTabsWindowItem,
  VSpeedDial,
  VFab,
  VTooltip,
  VProgressCircular,
  VExpandTransition,
  VSpacer,
  VDivider,
  VTextField,
  VMenu,
  VList,
  VListItem,
  VListItemTitle,
  VSlider,
  VRadioGroup,
  VForm,
  VColorPicker,
  VSnackbar,
  VPagination,
} from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components: {
    VApp,
    VRow,
    VCol,
    VCard,
    VCardTitle,
    VCardSubtitle,
    VCardText,
    VCardActions,
    VCardItem,
    VAvatar,
    VImg,
    VChip,
    VBtn,
    VIcon,
    VContainer,
    VSwitch,
    VDialog,
    VTabs,
    VTab,
    VTabsWindow,
    VTabsWindowItem,
    VSpeedDial,
    VFab,
    VTooltip,
    VProgressCircular,
    VExpandTransition,
    VSpacer,
    VDivider,
    VTextField,
    VMenu,
    VList,
    VListItem,
    VListItemTitle,
    VSlider,
    VRadioGroup,
    VForm,
    VColorPicker,
    VSnackbar,
    VPagination,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  defaults: {
    VCard: {
      variant: 'tonal',
    },
  },
})

const app = createApp(App)
app.config.warnHandler = () => {}
app.use(vuetify).mount('#app')

// Live2D 看板娘 - 仅桌面端，清除可能残留的错误状态
if (window.innerWidth > 768) {
localStorage.removeItem('OML2D_STATUS')
localStorage.removeItem('OML2D_MODEL_CLOTHES_INDEX')

// 读取用户桌宠偏好，设置 Live2D 模型索引（阿蒙=2 时用 Doro 兜底）
const savedPetIndex = localStorage.getItem('leleo-pet')
if (savedPetIndex !== null && savedPetIndex !== '2') {
  localStorage.setItem('OML2D_MODEL_INDEX', savedPetIndex)
} else {
  localStorage.removeItem('OML2D_MODEL_INDEX')
}

const oml2d = loadOml2d({
  dockedPosition: 'right',
  mobileDisplay: false,
  models: [
    {
      path: '/live2d/Doro/Doro.model3.json',
    },
    {
      path: '/live2d/XiaoZhou/小周桌宠.model3.json',
    },
  ],
  statusBar: {
    disable: true,
  },
  menus: {
    disable: true,
  },
  tips: {
    style: {
      display: 'none',
    },
    welcomeTips: {
      duration: 0,
      message: {},
    },
  },
})

// 暴露实例到 window，供 tab4 切换模型
window.__oml2d = oml2d
window.__oml2d.switchPet = async (index) => {
  localStorage.setItem('leleo-pet', index)
  await oml2d.loadModelByIndex(index)
}

const bindDrag = (stage) => {
  stage.style.cursor = 'grab'
  stage.style.userSelect = 'none'

  let dragging = false, sx, sy, sl, st

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    dragging = true
    sx = e.clientX; sy = e.clientY
    const r = stage.getBoundingClientRect()
    sl = r.left; st = r.top
    stage.style.cursor = 'grabbing'
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    const x = Math.max(0, Math.min(sl + (e.clientX - sx), window.innerWidth - stage.offsetWidth))
    const y = Math.max(0, Math.min(st + (e.clientY - sy), window.innerHeight - stage.offsetHeight))
    stage.style.left = x + 'px'
    stage.style.top = y + 'px'
    stage.style.right = 'auto'
    stage.style.bottom = 'auto'
  }

  const onPointerUp = () => {
    if (!dragging) return
    dragging = false
    stage.style.cursor = 'grab'
  }

  stage.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
}

// 舞台加载完成后再加拖拽，避免 PixiJS 初始化冲突
oml2d.onStageSlideIn(() => {
  const stage = oml2d.stage?.element
  if (!stage) return
  bindDrag(stage)
})
}

// 阿蒙 Shimeji - 如果用户之前选了阿蒙，启动时加载
if (window.innerWidth > 768 && localStorage.getItem('leleo-pet') === '2' && localStorage.getItem('leleo-pet-off') !== '1') {
  // 先注入 CSS 隐藏 Live2D，避免闪烁
  const style = document.createElement('style')
  style.id = 'hide-live2d-temp'
  style.textContent = '#oml2d-stage { display: none; }'
  document.head.appendChild(style)
  startShimeji()
}

// 如果用户关闭了桌宠总开关，隐藏 Live2D
if (localStorage.getItem('leleo-pet-off') === '1') {
  const style = document.createElement('style')
  style.id = 'hide-live2d-temp'
  style.textContent = '#oml2d-stage { display: none; }'
  document.head.appendChild(style)
}

// 暴露切换函数给 tab4
window.__toggleShimeji = (enable) => {
  if (enable) {
    if (!isShimejiRunning()) startShimeji()
  } else {
    stopShimeji()
  }
}
