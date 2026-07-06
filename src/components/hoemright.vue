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

          <div class="quick-panel-grid">
            <div class="quick-panel" v-for="item in quickStats" :key="item.label">
              <v-icon :icon="item.icon"></v-icon>
              <div>
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <small>{{ item.hint }}</small>
              </div>
            </div>
          </div>

          <div class="focus-lane">
            <div class="focus-copy">
              <span>Focus Board</span>
              <h3>今天先从哪里开始？</h3>
              <p>把最常用的入口提到前面，打开主页就能直接进入状态。</p>
            </div>
            <a
              v-for="item in featuredProjects"
              :key="`featured-${item.title}`"
              class="focus-card"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
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
	computed: {
		isUrl(){
			const str = this.searchQuery.trim();
  			return this.isLikelyUrl(str);
		},
		quickStats() {
			return [
				{
					icon: 'mdi-compass-rose',
					label: '导航入口',
					value: `${this.projectcards?.length || 0} 个`,
					hint: '常用站点一屏抵达',
				},
				{
					icon: 'mdi-clock-fast',
					label: '当前时间',
					value: this.formattedTime,
					hint: this.formattedDate,
				},
				{
					icon: 'mdi-lightning-bolt-outline',
					label: '搜索模式',
					value: this.selectedEngine.title,
					hint: this.isUrl ? '识别为网址' : '关键词搜索',
				},
			];
		},
		featuredProjects() {
			return (this.projectcards || []).slice(0, 3);
		},
	},
    methods:{
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