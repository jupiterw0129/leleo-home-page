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

// 读取用户桌宠偏好，设置 Live2D 模型索引（阿蒙=3 时用 Doro 兜底）
const savedPetIndex = localStorage.getItem('leleo-pet')
if (savedPetIndex !== null && savedPetIndex !== '3') {
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
    {
      path: '/live2d/MCZhou/L2DMCVT.model3.json',
      motionPreloadStrategy: 'ALL',
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

// 模型加载后显示手持工具
oml2d.onLoad((status) => {
  if (status === 'success') {
    const core = oml2d.models?.model?.internalModel?.coreModel
    if (core) {
      // 物品参数全部设为1
      ;['Param_Item_SideR1','Param_Item_SideR2','Param_Item_Flat_R1','Param_Item_Flat_R2',
        'Param_Item_SideL1','Param_Item_SideL2','Param_Item_Flat_L1','Param_Item_Flat_L2'
      ].forEach(p => {
        const idx = core.getParameterIndex(p)
        if (idx >= 0) core.setParameterValueByIndex(idx, 1)
      })
      // 关闭FCOD工具（可能遮挡手持物品）
      const fcod = core.getParameterIndex('Param_Tool_FCOD')
      if (fcod >= 0) core.setParameterValueByIndex(fcod, 0)
    }
  }
})

const easeTo = (core, param, to, duration = 120, onDone) => {
  const idx = core.getParameterIndex(param)
  if (idx < 0) return
  const from = core.getParameterValueByIndex(idx)
  const start = performance.now()
  const step = () => {
    const t = Math.min((performance.now() - start) / duration, 1)
    const v = from + (to - from) * (1 - Math.pow(1 - t, 3))
    core.setParameterValueByIndex(idx, v)
    if (t < 1) requestAnimationFrame(step)
    else if (onDone) onDone()
  }
  requestAnimationFrame(step)
}

const bindDrag = (stage) => {
  stage.style.cursor = 'grab'
  stage.style.userSelect = 'none'
  stage.addEventListener('contextmenu', e => e.preventDefault())

  let dragging = false, sx, sy, sl, st, moved, btn

  const onPointerDown = (e) => {
    if (e.button > 2) return
    e.preventDefault()
    dragging = true
    moved = false
    btn = e.button
    sx = e.clientX; sy = e.clientY
    const r = stage.getBoundingClientRect()
    sl = r.left; st = r.top
    stage.style.cursor = 'grabbing'

    const core = window.__oml2d?.models?.model?.internalModel?.coreModel
    if (!core) return

    if (e.button === 0) {
      easeTo(core, 'Param_MC_Arm_ControlR_Y', 80, 80)
      easeTo(core, 'Param_MC_ArmR_Y', 80, 80)
      setTimeout(() => {
        easeTo(core, 'Param_MC_Arm_ControlR_Y', -15, 50)
        easeTo(core, 'Param_MC_ArmR_Y', -15, 50)
        setTimeout(() => {
          easeTo(core, 'Param_MC_Arm_ControlR_Y', 0, 100)
          easeTo(core, 'Param_MC_ArmR_Y', 0, 100)
        }, 60)
      }, 80)
    } else if (e.button === 1) {
      easeTo(core, 'Param_MC_Arm_ControlR_Y', 80, 100)
      easeTo(core, 'Param_MC_ArmR_Y', 80, 100)
      easeTo(core, 'Param_MC_Arm_ControlL_Y', 80, 100)
      easeTo(core, 'Param_MC_ArmL_Y', 80, 100)
      setTimeout(() => {
        easeTo(core, 'Param_MC_Arm_ControlR_Y', 0, 600)
        easeTo(core, 'Param_MC_ArmR_Y', 0, 600)
        easeTo(core, 'Param_MC_Arm_ControlL_Y', 0, 600)
        easeTo(core, 'Param_MC_ArmL_Y', 0, 600)
      }, 800)
    } else {
      easeTo(core, 'Param_MC_Arm_ControlL_Y', 80, 80)
      easeTo(core, 'Param_MC_ArmL_Y', 80, 80)
      setTimeout(() => {
        easeTo(core, 'Param_MC_Arm_ControlL_Y', 0, 500)
        easeTo(core, 'Param_MC_ArmL_Y', 0, 500)
      }, 600)
    }
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    if (Math.abs(e.clientX - sx) > 6 || Math.abs(e.clientY - sy) > 6) moved = true
    if (!moved) return
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

    // 右键松手：不再做额外处理（动画自动完成）
  }

  stage.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
}

// 舞台加载完成后再加拖拽
oml2d.onStageSlideIn(() => {
  const stage = oml2d.stage?.element
  if (!stage) return
  bindDrag(stage)
})

// 空格键：走路切换
let walking = false, walkTimer = 0
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return
  e.preventDefault()
  const core = oml2d.models?.model?.internalModel?.coreModel
  if (!core) return

  walking = !walking
  if (walking) {
    let step = 0
    const doStep = () => {
      const rLeg = step % 2 === 0 ? 20 : -10
      const lLeg = step % 2 === 0 ? -10 : 20
      const rArm = step % 2 === 0 ? -10 : 15
      const lArm = step % 2 === 0 ? 15 : -10
      easeTo(core, 'Param_MC_Leg_ControlR_Y', rLeg, 250)
      easeTo(core, 'Param_MC_LegR_Y', rLeg, 250)
      easeTo(core, 'Param_MC_Leg_ControlL_Y', lLeg, 250)
      easeTo(core, 'Param_MC_LegL_Y', lLeg, 250)
      easeTo(core, 'Param_MC_Arm_ControlR_Y', rArm, 250)
      easeTo(core, 'Param_MC_ArmR_Y', rArm, 250)
      easeTo(core, 'Param_MC_Arm_ControlL_Y', lArm, 250)
      easeTo(core, 'Param_MC_ArmL_Y', lArm, 250)
      step++
    }
    doStep()
    walkTimer = setInterval(doStep, 300)
  } else {
    clearInterval(walkTimer)
    easeTo(core, 'Param_MC_Leg_ControlR_Y', 0, 200)
    easeTo(core, 'Param_MC_LegR_Y', 0, 200)
    easeTo(core, 'Param_MC_Leg_ControlL_Y', 0, 200)
    easeTo(core, 'Param_MC_LegL_Y', 0, 200)
    easeTo(core, 'Param_MC_Arm_ControlR_Y', 0, 200)
    easeTo(core, 'Param_MC_ArmR_Y', 0, 200)
    easeTo(core, 'Param_MC_Arm_ControlL_Y', 0, 200)
    easeTo(core, 'Param_MC_ArmL_Y', 0, 200)
  }
})
}

// 阿蒙 Shimeji - 如果用户之前选了阿蒙，启动时加载
if (window.innerWidth > 768 && localStorage.getItem('leleo-pet') === '3' && localStorage.getItem('leleo-pet-off') !== '1') {
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
