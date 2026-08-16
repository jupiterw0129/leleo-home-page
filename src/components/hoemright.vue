<template>
      <div class="home-right">
        <div class="hero-heading-wrap">
	          <div :style="xs||sm?{'display':'none'}:{'font-size':'4rem'}" class="leleo-left-welcome">{{ configdata.welcometitle }}</div>
        </div>
        <div class="home-right-main">
          <v-row align="center" class="hero-row">
            <v-col cols="12" md="8">
				<v-text-field class="v-card home-search"
					:style="xs?{'max-width':'88vw','margin':'0.4rem auto','font-size':'0.88rem'}:sm?{'max-width':'540px'}:{}"
					v-model="searchQuery"
					placeholder="搜索关键词或输入网址"
					variant="outlined"
					rounded="lg"
					hide-details="true"
					clearable
					aria-label="搜索关键词或输入网址"
					@keyup.enter="performSearch"
					>
					<template v-slot:prepend-inner>
						<v-menu>
							<template v-slot:activator="{ props }">
							<v-btn
								variant="text"
								v-bind="props"
								class="engine-btn"
								aria-label="选择搜索引擎"
							>
								{{ selectedEngine.title }}
								<v-icon icon="mdi-chevron-down"></v-icon>
							</v-btn>
							</template>
							<v-list class="glass-list">
								<v-list-item
									v-for="engine in searchEngines"
									:key="engine.value"
									@click="selectedEngine = engine"
									density="compact"
								>
									{{ engine.title }}
								</v-list-item>
							</v-list>
						</v-menu>
					</template>

					<template v-slot:append-inner>
						<v-btn
						:icon="isUrl ? 'mdi-earth' : 'mdi-magnify'"
						variant="text"
						:aria-label="isUrl ? '打开网址' : '执行搜索'"
						@click="performSearch"
						></v-btn>
					</template>
					</v-text-field>
            <typewriter class="hero-copy ma-3 d-flex align-center justify-center"></typewriter>
            </v-col>
            <v-col cols="12" md="4" align="center">
              <v-card class="clock-card ma-3" hover>
                  <template v-slot:title>
                    <span class="leleo-card-title clock-font">{{formattedDate}}</span>
                  </template>
                  <turntable :color1="configdata.color.turntablecolor1" :color2="configdata.color.turntablecolor2" />
              </v-card>
            </v-col>
          </v-row>
          <div class="snake-panel">
            <div class="snake-copy">
              <span class="snake-label">Interactive Board</span>
              <h3>{{ modeLabel }}</h3>
              <div class="snake-actions">
                <div class="mode-toggle" role="radiogroup" :aria-label="'当前模式：' + modeLabel">
                  <div class="toggle-track" :class="'mode-' + mode">
                    <div class="toggle-thumb"></div>
                    <span class="toggle-icon" @click.stop="mode = 'snake'">🐍</span>
                    <span class="toggle-icon" @click.stop="mode = 'paint'">✏️</span>
                    <span class="toggle-icon" @click.stop="mode = 'clock'">🕐</span>
                  </div>
                </div>
                <button class="reset-btn" @click="resetBoard">{{ actionLabel }}</button>
              </div>
            </div>
            <div
              class="snake-board"
              :style="snakeBoardStyle"
              aria-label="互动像素面板"
              @mousedown.stop
              @mousemove.stop
            >
              <button
                v-for="cell in snakeCells"
                :key="cell.id"
                type="button"
                class="snake-cell"
                :class="getSnakeCellClass(cell)"
                :aria-label="cellAriaLabel(cell)"
                @click="handleCellClick(cell)"
              ></button>
            </div>
          </div>

          <div class="focus-lane">
            <div class="focus-copy">
              <span>Focus Board</span>
              <h3>今天先从哪里开始？</h3>
              <p>会根据你的点击次数排序，常用入口会自动浮到前面。</p>
            </div>
            <a
              v-for="item in featuredProjects"
              :key="`featured-${item.title}`"
              class="focus-card"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              @click="recordProjectVisit(item)"
            >
              <img :src="item.img" :alt="item.title" loading="lazy">
              <div>
                <span>{{ item.subtitle }}</span>
                <strong>{{ item.title }}</strong>
              </div>
              <v-icon icon="mdi-arrow-top-right"></v-icon>
            </a>
          </div>

          <div class="project-section-head">
            <v-chip class="project-chip" prepend-icon="mdi-webhook" size="large">
              快捷入口
            </v-chip>
            <span class="project-count">{{ projectcards?.length || 0 }} 个常用站点</span>
          </div>
          <v-container class="project-container">
            <v-row class="project-grid">
              <v-col
                v-for="(item,key) in projectcards"
                :key="item.title"
                cols="6"
                md="4"
                lg="3"
                :style="xs?{'padding': '6px'}:{}"
              >
                <v-card class="project-card">
                  <v-img
                    class="project-card-cover"
                    aspect-ratio="1.7778"
                    :src= item.img
                    cover
                    loading="lazy"
                  ></v-img>
                  <v-card-title class="project-card-title" :style="xs?{'font-size': '0.92rem'}:{'font-size': '1.08rem'}">
                    {{item.title}}
                  </v-card-title>
                  <v-card-subtitle class="project-card-subtitle" :style="xs?{'font-size': '0.68rem'}:{'font-size': '0.8rem'}">
                    {{ item.subtitle }}
                  </v-card-subtitle>

                  <v-card-actions class="project-card-actions" :style="xs||sm||md?{'height':'2.45rem'}:{'height':'2.75rem'}">
                    <v-btn :href="item.url"
                    target="_blank" rel="noopener noreferrer"
                      prepend-icon="mdi-open-in-new"
                      :text= "item.go"
                      @click="recordProjectVisit(item)"
                    ></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      :icon="item.show ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                      @click="item.show = !item.show;projectcardsShow(key);"
                    ></v-btn>
                  </v-card-actions>
                  <v-expand-transition>
                    <div v-show="item.show">
                      <v-divider></v-divider>
                      <v-card-text class="project-card-text" :style="xs?{'font-size': '0.74rem'}:{}">
                        {{item.text}}
                      </v-card-text>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-col>
            </v-row>
          </v-container>

        </div>
      </div>
</template>

<script>
import typewriter from '../components/typewriter.vue';
import turntable from '../components/turntable.vue';
import scrolltotop from './scrolltotop.vue';
import { useDisplay } from 'vuetify'
/* spring hover 使用 lerp 实现，不依赖 anime.js spring API */

/* pixel font — 3×5 digits */
const DIGIT_FONT = {
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b001, 0b001, 0b001],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
};

export default {
    components: {
        typewriter,turntable
    },
    props: ['configdata','formattedTime','formattedDate','projectcards'],
	data() {
		return {
			searchQuery: '',
			visitStats: {},
			snakeBody: [],
			snakeTarget: null,
			snakeWanderTarget: null,
			snakeTimer: null,
			snakePulseCell: null,
			snakeLength: 3,
			mode: 'snake',
			clockTime: '',
			clockTimer: null,
			clockGlitch: false,
			_glitchTimer: null,
			paintedCells: (() => {
				try { return JSON.parse(localStorage.getItem('leleo-painted-cells') || '{}'); }
				catch (_) { return {}; }
			})(),
			selectedEngine: { title: 'Bing', value: 'bing' },
      		searchEngines :[
				{ title: 'Bing', value: 'bing' },
				{ title: 'Google', value: 'google' },
				{ title: '百度', value: 'baidu' },
				{ title: 'Yandex', value: 'yandex' },
				{ title: 'DuckDuckGo', value: 'duckduckgo' },
			]
		}
	},
    setup() {
      const { xs,sm,md } = useDisplay();
      return {xs,sm,md};
    },
    mounted() {
      this.visitStats = this.readVisitStats();
      this.initSnake();
      this.startSnake();
      this.$nextTick(() => { this._initCardEffects() })
    },
    beforeUnmount() {
      this.stopSnake();
      this.stopClock();
      this._cleanupCardEffects();
    },
	computed: {
		isUrl(){
			const str = this.searchQuery.trim();
  			return this.isLikelyUrl(str);
		},
		featuredProjects() {
			return [...(this.projectcards || [])]
				.sort((a, b) => this.getProjectVisitCount(b) - this.getProjectVisitCount(a))
				.slice(0, 3);
		},
		modeLabel() {
			if (this.mode === 'snake') return '贪吃蛇';
			if (this.mode === 'paint') return '像素画板';
			return '像素时钟';
		},
		actionLabel() {
			if (this.mode === 'snake') return '重置';
			if (this.mode === 'paint') return '清空';
			return this.clockGlitch ? '异常' : '正常';
		},
		snakeCols() {
			if (this.xs) return 17;
			if (this.sm) return 23;
			if (this.md) return 27;
			return 31;
		},
		snakeRows() {
			return 5;
		},
		snakeCells() {
			return Array.from({ length: this.snakeCols * this.snakeRows }, (_, id) => ({
				id,
				x: id % this.snakeCols,
				y: Math.floor(id / this.snakeCols),
			}));
		},
		snakeBoardStyle() {
			return {
				'--snake-cols': this.snakeCols,
			};
		},
		/* clock pixel positions */
		clockPixels() {
			if (this.mode !== 'clock') return new Set();
			const t = this.clockTime;
			if (!t || t.length < 8) return new Set();
			const cols = this.snakeCols;
			const rows = this.snakeRows;
			const charW = 4;  /* 3 + 1 gap */
			const totalW = t.length * charW - 1;  /* last char no trailing gap */
			const startCol = Math.max(0, Math.floor((cols - totalW) / 2));
			const startRow = Math.max(0, Math.floor((rows - 5) / 2));
			const set = new Set();
			for (let ci = 0; ci < t.length; ci++) {
				const ch = t[ci];
				const glyph = DIGIT_FONT[ch];
				if (!glyph) continue;
				const colBase = startCol + ci * charW;
				for (let ry = 0; ry < glyph.length; ry++) {
					const row = startRow + ry;
					if (row >= rows) break;
					const bits = glyph[ry];
					for (let bx = 0; bx < 3; bx++) {
						if (bits & (1 << (2 - bx))) {
							const col = colBase + bx;
							if (col >= 0 && col < cols) {
								set.add(row * cols + col);
							}
						}
					}
				}
			}
			return set;
		},
	},
    watch: {
      xs() { this.initSnake(); },
      sm() { this.initSnake(); },
      md() { this.initSnake(); },
      mode(val) {
        this.stopSnake();
        this.stopClock();
        if (val === 'snake') { this.startSnake(); }
        if (val === 'clock') { this.startClock(); }
      },
    },
    methods:{
      /* ── Card Effects (anime.js) ── */
      _initCardEffects() {
        this._springCleanups = []
        // 项目卡片
        const projectCards = this.$el.querySelectorAll('.project-card')
        projectCards.forEach(card => {
          this._springCleanups.push(this._bindCardSpring(card))
        })
        // 焦点卡片（最常访问 top 3）
        const focusCards = this.$el.querySelectorAll('.focus-card')
        focusCards.forEach(card => {
          this._springCleanups.push(this._bindCardSpring(card, { scale: 0.03, lift: 4, stiffness: 200 }))
        })
      },
      _cleanupCardEffects() {
        if (this._springCleanups) {
          this._springCleanups.forEach(fn => { try { fn() } catch (_) {} })
          this._springCleanups = null
        }
      },
      _bindCardSpring(el, opts = {}) {
        const {
          scale: sMax = 0.035,
          lift = 6,
        } = opts
        el.style.transition = 'border-color .25s ease'
        let target = 0, current = 0, raf

        const tick = () => {
          // smooth lerp toward target
          current += (target - current) * 0.22
          const p = current
          const sx = 1 + p * sMax
          const sy = -p * lift
          const shY = 4 + p * 16
          const shBlur = 16 + p * 44
          const shAlpha = 0.1 + p * 0.18
          el.style.transform = `scale(${sx}) translateY(${sy}px)`
          el.style.boxShadow = `0 ${shY}px ${shBlur}px rgba(0,0,0,${shAlpha})`

          if (Math.abs(target - current) > 0.0005) {
            raf = requestAnimationFrame(tick)
          } else if (target === 0 && current < 0.001) {
            current = 0
            el.style.transform = ''
            el.style.boxShadow = ''
            el.style.willChange = ''
          }
        }

        const enter = () => { target = 1; el.style.willChange = 'transform, box-shadow'; cancelAnimationFrame(raf); tick() }
        const leave = () => { target = 0; cancelAnimationFrame(raf); tick() }
        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
        return () => {
          cancelAnimationFrame(raf)
          el.removeEventListener('mouseenter', enter)
          el.removeEventListener('mouseleave', leave)
          el.style.transform = ''
          el.style.boxShadow = ''
          el.style.willChange = ''
        }
      },
      /* ── Snake ── */
      initSnake(){
        this.snakeLength = 3;
        const startX = Math.max(3, Math.floor(this.snakeCols / 2));
        const startY = Math.floor(this.snakeRows / 2);
        this.snakeBody = [
          { x: startX, y: startY },
          { x: startX - 1, y: startY },
          { x: startX - 2, y: startY },
        ];
        this.snakeTarget = null;
        this.snakeWanderTarget = this.getRandomSnakeCell();
      },
      startSnake(){
        if (this.mode !== 'snake') return;
        this.stopSnake();
        this.snakeTimer = window.setInterval(() => { this.advanceSnake(); }, 260);
      },
      stopSnake(){
        if (this.snakeTimer) { window.clearInterval(this.snakeTimer); this.snakeTimer = null; }
      },
      setSnakeTarget(cell){ this.snakeTarget = { x: cell.x, y: cell.y }; },
      advanceSnake(){
        if (!this.snakeBody.length) { this.initSnake(); return; }
        const head = this.snakeBody[0];
        const target = this.snakeTarget || this.snakeWanderTarget || this.getRandomSnakeCell();
        const nextHead = this.getNextSnakeHead(head, target);
        const nextBody = [nextHead, ...this.snakeBody];
        const reached = this.isSameSnakeCell(nextHead, this.snakeTarget);
        if (reached) {
          this.snakeLength += 1;
          if (this.snakeLength > 15) { this.initSnake(); return; }
          this.snakePulseCell = this.getSnakeCellId(nextHead);
          window.setTimeout(() => { this.snakePulseCell = null; }, 360);
          this.snakeTarget = null;
          this.snakeWanderTarget = this.getRandomSnakeCell();
          this.snakeBody = nextBody.slice(0, this.snakeLength);
          return;
        }
        if (this.isSameSnakeCell(nextHead, this.snakeWanderTarget)) {
          this.snakeWanderTarget = this.getRandomSnakeCell();
        }
        this.snakeBody = nextBody.slice(0, this.snakeLength);
      },
      getNextSnakeHead(head, target){
        const n = { ...head };
        const dx = target.x - head.x;
        const dy = target.y - head.y;
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) n.x += Math.sign(dx);
        else if (dy !== 0) n.y += Math.sign(dy);
        else n.x += 1;
        n.x = (n.x + this.snakeCols) % this.snakeCols;
        n.y = (n.y + this.snakeRows) % this.snakeRows;
        return n;
      },
      isSnakeHead(cell){ return this.snakeBody[0] && this.isSameSnakeCell(cell, this.snakeBody[0]); },
      isSnakeBody(cell){ return this.snakeBody.slice(1).some(p => this.isSameSnakeCell(cell, p)); },
      isSameSnakeCell(a, b){ return !!(a && b && a.x === b.x && a.y === b.y); },
      getSnakeCellId(cell){ return cell.y * this.snakeCols + cell.x; },
      getRandomSnakeCell(){
        return { x: Math.floor(Math.random() * this.snakeCols), y: Math.floor(Math.random() * this.snakeRows) };
      },

      /* ── Clock ── */
      startClock(){
        if (this.mode !== 'clock' || this.clockGlitch) return;
        if (this.clockTimer) { window.clearTimeout(this.clockTimer); this.clockTimer = null; }
        const tick = () => {
          if (this.mode !== 'clock' || this.clockGlitch) return;
          const now = new Date();
          const h = String(now.getHours()).padStart(2, '0');
          const m = String(now.getMinutes()).padStart(2, '0');
          const s = String(now.getSeconds()).padStart(2, '0');
          this.clockTime = h + ':' + m + ':' + s;
          this.clockTimer = window.setTimeout(tick, 1020 - now.getMilliseconds());
        };
        tick();
      },
      stopClock(){
        if (this.clockTimer) { window.clearTimeout(this.clockTimer); this.clockTimer = null; }
        if (this._glitchTimer) { window.clearInterval(this._glitchTimer); this._glitchTimer = null; }
        this.clockGlitch = false;
      },

      /* ── Shared ── */
      resetBoard(){
        if (this.mode === 'paint') {
          this.paintedCells = {};
          localStorage.removeItem('leleo-painted-cells');
        } else if (this.mode === 'snake') {
          this.initSnake();
        } else if (this.mode === 'clock') {
          this.toggleGlitch();
        }
      },
      toggleGlitch(){
        if (this.clockGlitch) {
          window.clearInterval(this._glitchTimer);
          this._glitchTimer = null;
          this.clockGlitch = false;
          this.startClock();
        } else {
          if (this.clockTimer) { window.clearTimeout(this.clockTimer); this.clockTimer = null; }
          this.clockGlitch = true;
          const digits = '0123456789';
          const tick = () => {
            let s = '';
            for (let i = 0; i < 8; i++) {
              s += (i === 2 || i === 5) ? ':' : digits[Math.floor(Math.random() * 10)];
            }
            this.clockTime = s;
          };
          tick();
          this._glitchTimer = window.setInterval(tick, 300);
        }
      },
      handleCellClick(cell){
        if (this.mode === 'paint') {
          const key = cell.id;
          let next;
          if (this.paintedCells[key]) {
            next = { ...this.paintedCells };
            delete next[key];
          } else {
            next = { ...this.paintedCells, [key]: true };
          }
          this.paintedCells = next;
          localStorage.setItem('leleo-painted-cells', JSON.stringify(next));
        } else if (this.mode === 'snake') {
          this.setSnakeTarget(cell);
        }
      },
      getSnakeCellClass(cell){
        if (this.mode === 'paint') {
          return { painted: !!this.paintedCells[cell.id] };
        }
        if (this.mode === 'clock') {
          return { clock: this.clockPixels.has(cell.id) };
        }
        return {
          head: this.isSnakeHead(cell),
          body: this.isSnakeBody(cell),
          target: this.isSameSnakeCell(cell, this.snakeTarget),
          pulse: this.snakePulseCell === cell.id,
        };
      },
      cellAriaLabel(cell){
        if (this.mode === 'paint') return this.paintedCells[cell.id] ? '擦除' : '绘制';
        if (this.mode === 'clock') return '';
        return '召唤小蛇';
      },

      /* ── Visit / search ── */
      readVisitStats(){
        try { return JSON.parse(localStorage.getItem('leleo-project-visits') || '{}'); }
        catch (_) { return {}; }
      },
      getProjectVisitCount(item){ return Number(this.visitStats?.[item.url] || 0); },
      recordProjectVisit(item){
        const s = { ...this.visitStats, [item.url]: this.getProjectVisitCount(item) + 1 };
        this.visitStats = s;
        localStorage.setItem('leleo-project-visits', JSON.stringify(s));
      },
      projectcardsShow(key){
        for(let i = 0; i < this.projectcards.length; i++){
          if(i !== key) this.projectcards[i].show = false;
        }
      },
      performSearch() {
        const q = this.searchQuery.trim();
        if (!q) return;
        // 限制搜索长度防止滥用
        if (q.length > 2048) return;
        // 拦截危险协议
        if (/^(javascript|data|vbscript):/i.test(q)) return;
        if (this.isUrl) {
          let url = q;
          if (!/^[a-z]+:\/\//i.test(url)) url = 'https://' + url;
          // 二次校验：只允许 http/https
          if (!/^https?:\/\//i.test(url)) return;
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          const engines = {
            google: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
            baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
            yandex: `https://yandex.com/search/?text=${encodeURIComponent(q)}`,
            duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
          };
          window.open(engines[this.selectedEngine.value], '_blank', 'noopener,noreferrer');
        }
      },
      isLikelyUrl(input) {
        const s = input.trim();
        if (!s || s.length > 2048) return false;
        // 拦截危险协议
        if (/^(javascript|data|vbscript):/i.test(s)) return false;
        // 完整的 https? URL
        if (/^https?:\/\//i.test(s)) return true;
        // 类似域名的字符串
        return /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(s) ||
               /^(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/.*)?$/i.test(s);
      },
    }
};
</script>

<style scoped>
@import url(/css/app.less);
@import url(/css/mobile.less);
.glass-list {
	background: transparent !important;
	backdrop-filter: blur(var(--leleo-blur));
	border-radius: 5%;
	color: var(--leleo-vcard-color);
	overflow: hidden;
}
</style>