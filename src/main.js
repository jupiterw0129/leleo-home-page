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

// Live2D 看板娘 - 来自 DoroPet_V3
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

// 模型就绪后强制重绘 + 启用拖拽
oml2d.onLoad((status) => {
  if (status !== 'success') return
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))

    const stage = oml2d.stage?.element
    const canvas = oml2d.stage?.canvasElement
    if (!stage || !canvas) return

    stage.style.cursor = 'grab'
    stage.style.touchAction = 'none'

    let dragging = false, sx, sy, sl, st

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      dragging = true
      sx = e.clientX; sy = e.clientY
      const r = stage.getBoundingClientRect()
      sl = r.left; st = r.top
      stage.style.cursor = 'grabbing'
      stage.style.transition = 'none'
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
      stage.style.cursor = 'grab'
      stage.style.transition = ''
    })
  }, 200)
})
