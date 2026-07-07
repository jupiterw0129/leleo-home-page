<template>
      <div class="home-right">
        <div class="hero-heading-wrap">
          <div :style="xs||sm?{'display':'none'}:{'font-size':'4rem'}" class="leleo-left-welcome">{{ configdata.welcometitle }}</div>
        </div>
        <div class="home-right-main">
          <v-row align="center" class="hero-row">
            <v-col cols="12" md="8">
				<v-text-field class="v-card home-search"
					:style="xs||sm?{'display':'none'}:{}"
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
              <v-card class="clock-card ma-3" hover
                >
                  <template v-slot:title >
                    <span class="leleo-card-title clock-font">{{formattedTime}}</span>
                  </template>
                  <template v-slot:subtitle>
                    <span style="font-weight: bold;">{{formattedDate}}</span>
                  </template>
                  <turntable :color1="configdata.color.turntablecolor1" :color2="configdata.color.turntablecolor2" />
              </v-card>
            </v-col>
          </v-row>
          <div class="snake-panel">
            <div class="snake-copy">
              <span>Little Snake</span>
              <h3>点亮一格，让它去追</h3>
              <p>平时自己巡游，鼠标经过或点击方块后，小蛇会自动跑过去吃掉它。</p>
              <div class="snake-meta">
                <b>{{ snakeScore }}</b>
                <small>本次吃到</small>
                <b>{{ trackedVisitCount }}</b>
                <small>常用记录</small>
              </div>
            </div>
            <div
              class="snake-board"
              :style="snakeBoardStyle"
              aria-label="互动贪吃蛇装饰面板"
            >
              <button
                v-for="cell in snakeCells"
                :key="cell.id"
                type="button"
                class="snake-cell"
                :class="getSnakeCellClass(cell)"
                :aria-label="`点亮第 ${cell.id + 1} 格`"
                @pointerenter="setSnakeTarget(cell)"
                @click="setSnakeTarget(cell)"
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
              <img :src="item.img" :alt="item.title">
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
                    target="_blank"
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
			snakeScore: 0,
			snakeTimer: null,
			snakePulseCell: null,
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
    },
    beforeUnmount() {
      this.stopSnake();
    },
	computed: {
		isUrl(){
			const str = this.searchQuery.trim();
  			return this.isLikelyUrl(str);
		},
		trackedVisitCount() {
			return Object.values(this.visitStats).reduce((total, count) => total + Number(count || 0), 0);
		},
		featuredProjects() {
			return [...(this.projectcards || [])]
				.sort((a, b) => this.getProjectVisitCount(b) - this.getProjectVisitCount(a))
				.slice(0, 3);
		},
		snakeCols() {
			if (this.xs) return 12;
			if (this.sm) return 14;
			if (this.md) return 16;
			return 18;
		},
		snakeRows() {
			if (this.xs) return 5;
			if (this.sm) return 5;
			return 6;
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
	},
    watch: {
      xs() {
        this.initSnake();
      },
      sm() {
        this.initSnake();
      },
      md() {
        this.initSnake();
      },
    },
    methods:{
      initSnake(){
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
        this.stopSnake();
        this.snakeTimer = window.setInterval(() => {
          this.advanceSnake();
        }, 260);
      },
      stopSnake(){
        if (this.snakeTimer) {
          window.clearInterval(this.snakeTimer);
          this.snakeTimer = null;
        }
      },
      setSnakeTarget(cell){
        this.snakeTarget = { x: cell.x, y: cell.y };
      },
      getSnakeCellClass(cell){
        return {
          head: this.isSnakeHead(cell),
          body: this.isSnakeBody(cell),
          target: this.isSameSnakeCell(cell, this.snakeTarget),
          pulse: this.snakePulseCell === cell.id,
        };
      },
      isSnakeHead(cell){
        return this.snakeBody[0] && this.isSameSnakeCell(cell, this.snakeBody[0]);
      },
      isSnakeBody(cell){
        return this.snakeBody.slice(1).some(part => this.isSameSnakeCell(cell, part));
      },
      isSameSnakeCell(a, b){
        return Boolean(a && b && a.x === b.x && a.y === b.y);
      },
      getSnakeCellId(cell){
        return cell.y * this.snakeCols + cell.x;
      },
      getRandomSnakeCell(){
        const x = Math.floor(Math.random() * this.snakeCols);
        const y = Math.floor(Math.random() * this.snakeRows);
        return { x, y };
      },
      advanceSnake(){
        if (!this.snakeBody.length) {
          this.initSnake();
          return;
        }

        const head = this.snakeBody[0];
        const activeTarget = this.snakeTarget || this.snakeWanderTarget || this.getRandomSnakeCell();
        const nextHead = this.getNextSnakeHead(head, activeTarget);
        const nextBody = [nextHead, ...this.snakeBody];
        const reachedTarget = this.isSameSnakeCell(nextHead, this.snakeTarget);
        const reachedWander = this.isSameSnakeCell(nextHead, this.snakeWanderTarget);

        if (reachedTarget) {
          this.snakeScore += 1;
          this.snakePulseCell = this.getSnakeCellId(nextHead);
          window.setTimeout(() => {
            this.snakePulseCell = null;
          }, 360);
          this.snakeTarget = null;
          this.snakeWanderTarget = this.getRandomSnakeCell();
          this.snakeBody = nextBody.slice(0, 6);
          return;
        }

        if (reachedWander) {
          this.snakeWanderTarget = this.getRandomSnakeCell();
        }

        this.snakeBody = nextBody.slice(0, 5);
      },
      getNextSnakeHead(head, target){
        const next = { ...head };
        const deltaX = target.x - head.x;
        const deltaY = target.y - head.y;

        if (Math.abs(deltaX) >= Math.abs(deltaY) && deltaX !== 0) {
          next.x += Math.sign(deltaX);
        } else if (deltaY !== 0) {
          next.y += Math.sign(deltaY);
        } else {
          next.x += 1;
        }

        next.x = (next.x + this.snakeCols) % this.snakeCols;
        next.y = (next.y + this.snakeRows) % this.snakeRows;
        return next;
      },
      readVisitStats(){
        try {
          return JSON.parse(localStorage.getItem('leleo-project-visits') || '{}');
        } catch (error) {
          return {};
        }
      },
      getProjectVisitCount(item){
        return Number(this.visitStats?.[item.url] || 0);
      },
      recordProjectVisit(item){
        const nextStats = { ...this.visitStats, [item.url]: this.getProjectVisitCount(item) + 1 };
        this.visitStats = nextStats;
        localStorage.setItem('leleo-project-visits', JSON.stringify(nextStats));
      },
      projectcardsShow(key){
        for(let i = 0;i < this.projectcards.length;i++){
          if(i != key){
            this.projectcards[i].show = false;
          }
        }
      },
	  performSearch() {
		const query = this.searchQuery.trim();
		if (!query) return;

		if (this.isUrl) {
			let url = query;
			// 自动补全协议（如果缺少）
			if (!/^[a-z]+:\/\//i.test(url)) {
				url = 'http://' + url; // 默认用http
			}

			window.open(url, '_blank');
		} else {
			const engineUrls = {
				google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
				bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
				baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
				yandex: `https://yandex.com/search/?text=${encodeURIComponent(query)}`,
				duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
			};
			window.open(engineUrls[this.selectedEngine.value], '_blank');
		}
	  },
	  isLikelyUrl(input) {
		// 移除首尾空格
		const str = input.trim();

		// 情况1：明确包含协议头（http/https/ftp等）
		if (/^(https?|ftp):\/\//i.test(str)) return true;

		// 情况2：符合域名格式（支持国际化域名）
		const domainPattern = /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

		// 情况3：localhost或IP地址
		const localPattern = /^(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/.*)?$/i;


		return (
			domainPattern.test(str) ||
			localPattern.test(str)
		);
		}
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