<template>
    <div class="leleo-typewriter" style="text-align: center;"><span class="qm">“ </span><span ref="text" class="msg"></span><span class="qm"> ”</span></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TypeIt from 'typeit'
import config from '../config.js';

const text = ref(null)
onMounted(() => {
    let configdata = null;
    try { 
        if(import.meta.env.VITE_CONFIG){
            configdata = JSON.parse(import.meta.env.VITE_CONFIG);
        }else{
            configdata = config;
        }
    } catch (e) {
        console.error('配置解析失败:', e);
        configdata = config; // 降级到本地配置
    }
    new (TypeIt)(text.value, {
        strings: configdata.typeWriterStrings,
        cursorChar: "<span class='cursorChar'>|</span>",//用于光标的字符。HTML也可以
        speed: 150,
        lifeLike: true,// 使打字速度不规则
        cursor: true,//在字符串末尾显示闪烁的光标
        breakLines: false,// 控制是将多个字符串打印在彼此之上，还是删除这些字符串并相互替换
        loop: true,//是否循环
    }).go()
})

</script>
 
<style scoped>
.leleo-typewriter {
  /* 容器样式 */
}

.msg, .qm{
    color: var(--leleo-vcard-color);
    letter-spacing: 2px;
    font-family: Arial, sans-serif;
    font-size: 25px;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
 
.msg ::v-deep.cursorChar {
    display: inline-block;
    margin-left: 2px;
    font-size: 26px; /* 原内联样式移到这里 */
    color: var(--leleo-vcard-color); /* 原内联样式移到这里 */
    animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media screen and (min-width: 960px) and (max-width: 1200px)  {
    .msg, .qm{
        font-size: 20px;
    }
    .msg ::v-deep .cursorChar {
    font-size: 20px; /* 光标大小随字体调整 */
    }
}
@media (max-width: 960px){
    .leleo-typewriter{
        min-height: 76px;   
    }
    .msg, .qm{
        font-size: 16px;
    }
    .msg ::v-deep .cursorChar {
    font-size: 16px; /* 光标大小随字体调整 */
    }
}
</style>
