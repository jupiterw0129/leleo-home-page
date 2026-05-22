import { createApp } from 'vue'
import App from './App.vue'
import { loadOml2d } from 'oh-my-live2d'

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

// 读取用户桌宠偏好，设置模型索引
const savedPetIndex = localStorage.getItem('leleo-pet')
if (savedPetIndex !== null) {
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
