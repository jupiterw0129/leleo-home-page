<template>
    <div class="mx-auto rounded style-console" style="background: transparent;">
        <v-form fast-fail @submit.prevent>
            <div class="style-summary">
                <div class="style-preview">
                    <div class="preview-title" :style="{ color: color.welcometitlecolor }">Hi, I'm JupiterW</div>
                    <div class="preview-signature">世界醒，愚者归</div>
                    <div class="preview-card" :style="{ color: color.themecolor }">
                        <span>Tags</span>
                        <b>奇迹师</b>
                        <b>通识者</b>
                    </div>
                </div>
                <div class="style-stats">
                    <div>
                        <span>主题颜色</span>
                        <strong>{{ color.themecolor }}</strong>
                    </div>
                    <div>
                        <span>标题颜色</span>
                        <strong>{{ color.welcometitlecolor }}</strong>
                    </div>
                    <div>
                        <span>背景亮度</span>
                        <strong>{{ brightness }}%</strong>
                    </div>
                    <div>
                        <span>模糊度</span>
                        <strong>{{ blur }}px</strong>
                    </div>
                </div>
            </div>

            <div class="preset-row">
                <v-btn variant="tonal" @click="applyPreset('#FFFFFF', '#FFFFFF', 85, 5)">清透</v-btn>
                <v-btn variant="tonal" @click="applyPreset('#BDEBFF', '#FFFFFF', 78, 8)">冷光</v-btn>
                <v-btn variant="tonal" @click="applyPreset('#FFE6A7', '#FFFFFF', 72, 10)">暖影</v-btn>
            </div>

            <div class="control-grid">
                <v-text-field
                    v-model="color.themecolor"
                    label="主题颜色"
                    @click="selectcolor='themecolor';colordialog = true"
                    readonly
                    variant="outlined"
                ></v-text-field>
                <v-text-field
                    v-model="color.welcometitlecolor"
                    label="标题颜色"
                    @click="selectcolor='welcometitlecolor';colordialog = true"
                    readonly
                    variant="outlined"
                ></v-text-field>
            </div>

            <v-slider
                class="ml-5 mr-8"
                label="背景亮度"
                color=var(--leleo-vcard-color)
                :max="100"
                :min="50"
                :step="0.5"
                :thumb-size="xs?15:18"
                v-model="brightness"
                thumb-label="always"
            ></v-slider>
            <v-slider
                class="ml-5 mr-8"
                label="模糊度"
                color=var(--leleo-vcard-color)
                :max="20"
                :min="0"
                :thumb-size="xs?15:18"
                :step="0.2"
                v-model="blur"
                thumb-label="always"
            ></v-slider>

            <div style="display: flex;justify-content: center;align-items: center;">
                <v-btn :loading="loading1" variant="tonal" class="ma-2" @click="redefault()">恢复</v-btn>
                <v-btn variant="tonal" class="ma-2" @click="cancel()">取消</v-btn>
                <v-btn :loading="loading2" variant="tonal" class="ma-2" @click="submitdata()">确认</v-btn>
            </div>

            <v-dialog
                v-model="colordialog"
                width="auto"
                >
                <v-card title="颜色选择器">
                    <div class="d-flex flex-column">
                        <v-color-picker
                            v-model="color[selectcolor]"
                            v-model:mode="mode"
                        ></v-color-picker>
                    </div>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text="确认"
                        variant="elevated"
                        @click="colordialog = false"
                    ></v-btn>
                    </v-card-actions>
                </v-card>
             </v-dialog>
        </v-form>
    </div>

    <v-snackbar
      :timeout="2000"
      variant="tonal"
      color=var(--leleo-vcard-color)
      rounded="pill"
      v-model="snackbar"
    >
      {{snackbartext}}
    </v-snackbar>
</template>

<script>
import { setCookie, getCookie, eraseCookie } from '../../utils/cookieUtils.js';
import config from '../../config.js';
import { useDisplay } from 'vuetify';
export default {
  emits: ['cancel'],
  setup() {
        const { xs } = useDisplay();
        return { xs };
    },
  data() {
    return {
        loading1: false,
        loading2: false,
        snackbar: false,
        configdata:config,
        snackbartext: '',
        color:{
            "themecolor":'',
            "welcometitlecolor": '',
        },
        brightness: 78,
        blur: 0,
        selectcolor: "themecolor",
        colordialog: false,
        mode: 'hex',
    };
  },
  mounted() {
    if(import.meta.env.VITE_CONFIG){
        this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }

    let leleodata = this.getCookie("leleodata");
    if(leleodata){
        this.color = leleodata.color;
        this.brightness = leleodata.brightness;
        this.blur = leleodata.blur;
    }else{
        this.color = this.configdata.color;
        this.brightness = this.configdata.brightness;
        this.blur = this.configdata.blur;
    }

    this.$nextTick(() => { this._initSignatureBounce() })
  },
  beforeUnmount() {
    if (this._sigRaf) { cancelAnimationFrame(this._sigRaf); this._sigRaf = null }
  },
  methods: {
    setCookie,
    getCookie,
    eraseCookie,
    _initSignatureBounce() {
      const el = document.querySelector('.preview-signature')
      if (!el) return
      const text = el.textContent.trim()
      el.textContent = ''
      const chars = []
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span')
        span.textContent = text[i]
        span.style.display = 'inline-block'
        span.style.setProperty('--i', i)
        span.style.setProperty('--n', text.length)
        el.appendChild(span)
        chars.push(span)
      }
      // 连续正弦波浪：每个字符按不同相位上下浮动
      let time = 0
      const tick = () => {
        time += 0.016
        chars.forEach((span, i) => {
          const phase = (i - chars.length / 2) * 0.35
          const y = Math.sin(time * 2.8 + phase) * 9
          const glow = Math.abs(Math.sin(time * 2.8 + phase))
          span.style.transform = `translateY(${y}px)`
          span.style.textShadow = `0 0 ${8 + glow * 14}px rgba(189,235,255,${0.3 + glow * 0.5})`
        })
        this._sigRaf = requestAnimationFrame(tick)
      }
      this._sigRaf = requestAnimationFrame(tick)
    },
    submitdata() {
        this.loading2 = true
        setTimeout(() => {
            this.loading2 = false;
            this.setCookie('leleodata', {color:this.color,brightness:String(this.brightness),blur:String(this.blur),backgroundblur:String(this.backgroundblur)},0.005);
            location.reload();
        }, 800)
    },
    redefault(){
        this.loading1 = true
        setTimeout(() => {
            this.loading1 = false;
            this.eraseCookie('leleodata');
            location.reload();
        }, 800)

    },
    cancel() {
        this.$emit('cancel');
    },
    applyPreset(theme, title, brightness, blur) {
        this.color.themecolor = theme;
        this.color.welcometitlecolor = title;
        this.brightness = brightness;
        this.blur = blur;
    },
  },

};

</script>

<style scoped>
.style-console {
    min-height: 520px;
}

.style-summary {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(300px, 0.85fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.style-preview,
.style-stats div {
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
}

.style-preview {
    min-height: 220px;
    padding: 1rem;
    background:
        linear-gradient(135deg, rgba(16, 22, 30, 0.76), rgba(255, 255, 255, 0.08)),
        radial-gradient(circle at 78% 20%, rgba(100, 200, 255, 0.25), transparent 34%);
}

.preview-title {
    font-size: clamp(1.5rem, 2.5vw, 2.4rem);
    line-height: 1;
    font-weight: 800;
    letter-spacing: 0;
}

.preview-signature {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(100%, 520px);
    min-height: 54px;
    margin: 1.2rem 0;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
    backdrop-filter: blur(var(--leleo-blur));
    color: rgba(255, 255, 255, 0.92);
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    font-weight: 800;
    letter-spacing: 0.16em;
    text-shadow: 0 0 18px rgba(189, 235, 255, 0.42);
}

.preview-card {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 58px;
    padding: 0 0.85rem;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.16);
    font-weight: 700;
}

.preview-card b {
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 0.78rem;
}

.style-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.style-stats div {
    min-height: 96px;
    padding: 0.85rem;
}

.style-stats span {
    display: block;
    color: rgba(255, 255, 255, 0.62);
    font-size: 0.78rem;
}

.style-stats strong {
    display: block;
    margin-top: 0.45rem;
    color: #fff;
    font-size: 1.05rem;
    word-break: break-all;
}

.preset-row,
.control-grid {
    display: flex;
    gap: 0.7rem;
}

.preset-row {
    justify-content: center;
    margin-bottom: 1rem;
}

.control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

@media (max-width: 900px) {
    .style-summary,
    .control-grid {
        grid-template-columns: 1fr;
    }
}
</style>