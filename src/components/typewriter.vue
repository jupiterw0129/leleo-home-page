<template>
  <div class="leleo-typewriter">
    <span class="qm">“</span>
    <span ref="text" class="msg"></span>
    <span class="qm">”</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import TypeIt from "typeit"
import config from "../config.js"

const text = ref(null)
let typeitInstance = null

const getConfigData = () => {
  try {
    if (import.meta.env.VITE_CONFIG) {
      return JSON.parse(import.meta.env.VITE_CONFIG)
    }
  } catch (error) {
    console.warn("VITE_CONFIG 解析失败，已回退到本地 config：", error)
  }
  return config
}

onMounted(() => {
  const configdata = getConfigData()
  const strings = Array.isArray(configdata?.typeWriterStrings) && configdata.typeWriterStrings.length
    ? configdata.typeWriterStrings
    : ["欢迎来到我的主页"]

  if (!text.value) return

  typeitInstance = new TypeIt(text.value, {
    strings,
    cursorChar: "<span class='cursorChar'>|</span>",
    speed: 150,
    lifeLike: true,
    cursor: true,
    breakLines: false,
    nextStringDelay: 2000,
    loop: true,
    startDelay: 10,
  })

  typeitInstance.go()
})

onUnmounted(() => {
  if (typeitInstance) {
    typeitInstance.destroy()
    typeitInstance = null
  }
})
</script>

<style scoped>
.leleo-typewriter {
  text-align: center;
}

.msg,
.qm {
  color: var(--leleo-vcard-color);
  letter-spacing: 1px;
  font-family: "WQYBitmapSong", "SimSun", serif;
  font-size: 25px;
  font-weight: normal;
  text-shadow: none;
}

.msg :deep(.cursorChar) {
  display: inline-block;
  margin-left: 2px;
  font-size: 26px;
  color: var(--leleo-vcard-color);
}

@media screen and (min-width: 960px) and (max-width: 1200px) {
  .msg,
  .qm {
    font-size: 20px;
  }
}

@media (max-width: 960px) {
  .leleo-typewriter {
    min-height: 76px;
  }

  .msg,
  .qm {
    font-size: 16px;
  }

  .msg :deep(.cursorChar) {
    font-size: 18px;
  }
}
</style>
