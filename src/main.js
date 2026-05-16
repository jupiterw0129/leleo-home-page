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

// 模型就绪后强制重绘，修复 PixiJS 纹理初始化时序问题
oml2d.onLoad((status) => {
  if (status !== 'success') return
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 200)
})
