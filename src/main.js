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

// Live2D 看板娘 - 清除可能残留的错误状态
localStorage.removeItem('OML2D_STATUS')
localStorage.removeItem('OML2D_MODEL_INDEX')
localStorage.removeItem('OML2D_MODEL_CLOTHES_INDEX')

const oml2d = loadOml2d({
  dockedPosition: 'right',
  mobileDisplay: true,
  models: [
    {
      path: '/live2d/Doro/Doro.model3.json',
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

// 舞台加载完成后再加拖拽，避免 PixiJS 初始化冲突
oml2d.onStageSlideIn(() => {
  const stage = oml2d.stage?.element
  if (!stage) return


  let dragging = false, sx, sy, sl, st

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    dragging = true
    sx = e.clientX; sy = e.clientY
    const r = stage.getBoundingClientRect()
    sl = r.left; st = r.top
    // 拖拽时播放跑动动作
    try {
      const m = oml2d.models?.model?.children?.[0]
      const mm = m?.internalModel?.motionManager
      if (mm?.startMotion) mm.startMotion('跑', 0)
    } catch {}
  })

  document.addEventListener('pointermove', (e) => {
    if (!dragging) return
    const x = Math.max(0, Math.min(sl + (e.clientX - sx), window.innerWidth - stage.offsetWidth))
    const y = Math.max(0, Math.min(st + (e.clientY - sy), window.innerHeight - stage.offsetHeight))
    stage.style.left = x + 'px'
    stage.style.top = y + 'px'
    stage.style.right = 'auto'
    stage.style.bottom = 'auto'
  })

  document.addEventListener('pointerup', () => {
    if (!dragging) return
    dragging = false
  })
})
