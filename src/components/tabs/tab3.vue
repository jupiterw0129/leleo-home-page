<template>
    <div v-if="!lyricsloaded || audioLoading" class="loading-spinner">
            <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <v-container class="pa-0">
      <v-divider :thickness="4"></v-divider>
      <!-- 顶部播放控制栏 -->
      <div class="pa-3">
          <div style="display: flex;width: 100%;align-items: center;">
             <v-avatar
              color=var(--leleo-vcard-color)
              rounded="0"
              :image="currentSong.pic"
              :size="xs?48:64"
            ></v-avatar>
            <v-btn icon @click="togglePlay" :size="xs?28:38" variant= 'tonal' class="ml-1">
              <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
            <v-btn icon @click="nextTrack" :size="xs?28:38" variant= 'tonal' class="ml-1">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>
            <v-slider style="margin-bottom: -22px;padding: 0;"
                  v-model="currentTime"
                  :max="duration"
                  color=var(--leleo-vcard-color)
                  thumb-size="12"
                  density="compact"
                  @update:modelValue="seek"
                  @end="onSliderEnd"
                  @strat="onSliderStart"
              ></v-slider>
            

            <span 
            :style="xs?{'font-size':'10px'}:{'font-size':'12px'}" 
            style="color:var(--leleo-vcard-color);"
            >{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            <!-- 控制区 -->
          </div>

          <!-- 音量控制 -->
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
            <v-icon :size="xs?14:16" style="color: var(--leleo-vcard-color); cursor: pointer;" @click="localVolume = localVolume === 0 ? 70 : 0">{{ volumeIcon }}</v-icon>
            <v-slider
              v-model="localVolume"
              :min="0"
              :max="100"
              color="var(--leleo-vcard-color)"
              thumb-size="10"
              density="compact"
              hide-details
              style="flex: 1;"
            ></v-slider>
            <span :style="xs?'font-size:10px':'font-size:12px'" style="color: var(--leleo-vcard-color); min-width: 26px; text-align: right;">{{ Math.round(localVolume) }}%</span>
          </div>

          <!-- 歌词区 -->
          <div class="lyrics-container ml-1">
              <div class="lyrics"
                  v-if="currentLyric"
                  :style="xs?{'font-size':'10px'}:{'font-size':'13px'}">{{ currentLyric }}
              </div>
              <div>
                  <span :style="xs?{'font-size':'10px'}:{'font-size':'14px'}" style="opacity: 0.7;">{{ currentSong.title }}</span>
                  <span :style="xs?{'font-size':'10px'}:{'font-size':'12px'}" style="opacity: 0.7;"> - - {{ currentSong.author }}</span>
              </div>
          </div>
      </div>
      <v-divider :thickness="4"></v-divider>
  
      <!-- 播放列表 -->
      <v-list style="max-height: 300px;background: transparent; overflow-y: auto;" ref="songList">
        <v-list-item style="position: relative;"
          v-for="(song, index) in musicinfo"
          :key="index"
          @click="play(index)"
          :class="{ 'active-song': index === currentIndex }"
          ref="songItems"
        >
          <v-list-item-content class="d-flex justify-space-between">
            <v-list-item-title style="color: var(--leleo-vcard-color);">
              <span style="margin-right: 12px;">{{ index+1 }}</span>
              <span>{{ song.title }}</span>
            </v-list-item-title>
            <span style="font-size: 12px; color: var(--leleo-vcard-color);">{{ song.author }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider :thickness="3" class="mt-3 mb-3"></v-divider>

      <div class="pa-2">
        <div :style="xs?{'font-size':'11px'}:{'font-size':'13px'}" style="color:var(--leleo-vcard-color);opacity:0.7;margin-bottom:6px;">
          澜音分享 ID（到期后粘贴新 ID 即可续期）
        </div>
        <div style="display:flex;gap:8px;">
          <v-text-field
            v-model="shareIdInput"
            placeholder="粘贴新的分享 ID"
            variant="outlined"
            density="compact"
            hide-details
            :style="xs?{'font-size':'12px'}:{}"
            @keyup.enter="applyShareId"
          ></v-text-field>
          <v-btn
            :size="xs?30:36"
            color="var(--leleo-vcard-color)"
            variant="tonal"
            @click="applyShareId"
            :loading="refreshing"
          >更新</v-btn>
        </div>
      </div>
    </v-container>
  </template>
  
<script>
import { useDisplay } from 'vuetify';
export default {
    setup() {
        const { xs,sm } = useDisplay();
        return { xs,sm };
    },
  props: {
    musicinfo: {
      type: Array,
      required: true
    },
    fromLyrics: {
      type: Array,
      required: true
    },
    currentIndex: {
      type: Number,
      required: true
    },
    isPlaying: {
      type: Boolean,
      required: true
    },
    audioPlayer: {
      type: HTMLAudioElement,
      required: true
    },
    audioLoading: {
      type: Boolean,
      required: true
    },
    volume: {
      type: Number,
      default: 70
    },
    shareId: {
      type: String,
      default: ''
    },
  },

  data() {
    return {
      lyricsloaded: true,
      lyrics: [], // 存储解析后的歌词
      currentLyric: "", // 当前显示的歌词
      lyricInterval: null, // 歌词更新定时器
      currentTime:null,
      duration:null,
      shareIdInput: '',
      refreshing: false,
      localVolume: this.volume,
    };
  },
  computed: {
    currentSong() {
      return this.musicinfo[this.currentIndex];
    },
    volumeIcon() {
      if (this.localVolume === 0) return 'mdi-volume-mute';
      if (this.localVolume < 34) return 'mdi-volume-low';
      if (this.localVolume < 67) return 'mdi-volume-medium';
      return 'mdi-volume-high';
    },
  },
  watch: {
    // 监听 currentIndex 变化，加载新歌词
    currentIndex() {
      this.loadLyrics();
      this.scrollToCurrentSong();
    },
    // 监听播放状态，启动或停止歌词更新
    isPlaying(isPlaying) {
      if (isPlaying) {
        this.startLyricUpdate();
      } else {
        this.stopLyricUpdate();
      }
    },
    localVolume(val) {
      this.$emit('update:volume', val);
    },
    volume(val) {
      this.localVolume = val;
    },
  },
  methods: {
    // 加载歌词
    async loadLyrics() {
      if (!this.currentSong.lrc) return;
      this.lyricsloaded = false;
      try {
        this.currentLyric = ""; // 重置当前歌词
        const response = await fetch(this.currentSong.lrc);
        const text = await response.text();
        this.lyrics = this.parseLyrics(text);
        // 获取到歌词就传到主件存放，当再次打开时无需请求
        this.$emit("update:current-lyrics", {index:this.currentIndex,lyrics:this.lyrics});
        this.lyricsloaded = true;
      } catch (error) {
        console.error("Failed to load lyrics:", error);
      }
    },
    // 解析歌词
    parseLyrics(text) {
      const lines = text.split("\n");
      return lines
        .map(line => {
          const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)/);
          if (match) {
            const minutes = parseFloat(match[1]);
            const seconds = parseFloat(match[2]);
            const milliseconds = parseFloat(match[3]);
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = match[4].trim();
            return { time, text };
          }
          return null;
        })
        .filter(line => line !== null);
    },
    // 更新当前歌词
    updateLyric() {
      const currentTime = this.audioPlayer.currentTime;
      for (let i = this.lyrics.length - 1; i >= 0; i--) {
        if (currentTime >= this.lyrics[i].time) {
          this.currentLyric = this.lyrics[i].text;
          break;
        }
      }
    },
    // 启动歌词更新定时器
    startLyricUpdate() {
      this.lyricInterval = setInterval(() => {
        this.updateLyric();
      }, 100);
    },
    // 停止歌词更新定时器
    stopLyricUpdate() {
      if (this.lyricInterval) {
        clearInterval(this.lyricInterval);
        this.lyricInterval = null;
      }
    },
    // 播放指定索引的歌曲
    play(index) {
      if (index === this.currentIndex && this.isPlaying) {
        this.togglePlay();
      } else {
        this.$emit("update:current-index", index);
        this.$emit("update:is-playing", true);
      }
    },
    // 切换播放/暂停状态（统一通过父组件处理，确保 AudioContext 在 play 之前就绪）
    togglePlay() {
      this.$emit("update:is-playing", !this.isPlaying);
    },
    // 播放下一首
    nextTrack() {
      const nextIndex = (this.currentIndex + 1) % this.musicinfo.length;
      this.$emit("update:current-index", nextIndex);
      this.$emit("update:is-playing", true);
    },
    // 滚动到当前播放的歌曲
    scrollToCurrentSong() {
      const currentSongItem = this.$refs.songItems[this.currentIndex];
      if (currentSongItem) {
        currentSongItem.$el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    updateTime() {
      this.currentTime = this.audioPlayer.currentTime;
    },
    updateDuration() {
      this.duration = this.audioPlayer.duration;
    },
    seek(time) {
      this.audioPlayer.currentTime = time;
    },
    onSliderStart(){
        this.$emit("update:is-playing", false);
    },
    onSliderEnd(){
        this.$emit("update:is-playing", true);
    },
    // 格式化时间（将秒转换为 mm:ss 格式）
    formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    applyShareId() {
      const val = this.shareIdInput.trim();
      if (!val) return;
      this.refreshing = true;
      this.$emit('update:share-id', val);
      this.shareIdInput = '';
      setTimeout(() => { this.refreshing = false; }, 1500);
    },
  },
  mounted() {
    if(this.fromLyrics.index>=0 && this.currentIndex == this.fromLyrics.index){
        this.lyrics = this.fromLyrics.lyrics;
        this.startLyricUpdate();
    }else{
        if(this.isPlaying == true){  //若从主件打开播放，则需打开歌词定时器
            this.startLyricUpdate();
            this.duration = this.audioPlayer.duration;  //从主件打开播放,audio已加载完，不会再监听
        }
        this.loadLyrics(); // 若之前无数据则初始化加载歌词
    }
    this.audioPlayer.addEventListener('timeupdate', this.updateTime);
    this.audioPlayer.addEventListener('loadedmetadata', this.updateDuration);
    this.duration = this.audioPlayer.duration;
    this.scrollToCurrentSong();
  },
  beforeDestroy() {
    this.stopLyricUpdate(); // 清除定时器
    this.audioPlayer.removeEventListener('timeupdate', this.updateTime);
    this.audioPlayer.removeEventListener('loadedmetadata', this.updateDuration);
  }
};
</script>
  
<style scoped>
.loading-spinner {
    position: absolute;
     top: 50%;
    left: 50%;
     transform: translate(-50%, -50%); 
    z-index: 1; 
}

/* 歌词显示区域 */
.lyrics-container {
  width: 100%;
  margin-top: 10px;
}

.lyrics {
  width: 100%;
  color: var(--leleo-vcard-color);
}

/* 列表样式 */
.v-list {
  border-radius: 0 0 8px 8px; /* 轻微圆角 */
}

/* 列表项样式 */
.v-list-item {
  border-bottom: solid 1px rgba(0, 0, 0, 0.3);
  min-height: 40px !important; /* 减小列表项高度 */
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

.v-list-item-title {
  font-size: 12px;
}

/* 当前播放的歌曲高亮 */
.active-song {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px; /* 轻微圆角 */
}

/* 覆盖全局的滚动条样式 */
.v-list::-webkit-scrollbar {
  width: 5px; /* 设置滚动条宽度 */
}

.v-list::-webkit-scrollbar-thumb {
  background-color: #888; /* 设置滚动条颜色 */
  border-radius: 4px; /* 设置滚动条圆角 */
}
</style>