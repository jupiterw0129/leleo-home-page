import { defineAsyncComponent } from 'vue'
import homeright from '../src/components/hoemright.vue';
import typewriter from './components/typewriter.vue';
import loader from './components/loader.vue';
import polarchart from './components/polarchart.vue';
import config from './config.js';
import { getCookie } from './utils/cookieUtils.js';
import { setMeta,getFormattedTime,getFormattedDate,dataConsole } from './utils/common.js';
import { useDisplay } from 'vuetify'

const extractShareId = (input) => {
  if (!input) return '';
  const m = input.match(/\/p\/([a-zA-Z0-9]+)\/?$/);
  return m ? m[1] : input.trim();
};

const tab1 = defineAsyncComponent(() => import('./components/tabs/tab1.vue'))
const tab2 = defineAsyncComponent(() => import('./components/tabs/tab2.vue'))
const tab3 = defineAsyncComponent(() => import('./components/tabs/tab3.vue'))

export default {
  components: {
    tab1,tab2,tab3,loader,homeright,typewriter,polarchart
  },
  setup() {
    const { xs,sm,md } = useDisplay();
    return { xs,sm,md };
  },
  data() {
    return {
      isloading:false,
      isClearScreen: false,
      ceruShareId: extractShareId(localStorage.getItem('ceru-share-id')) || config.musicPlayer.shareId,
      formattedTime:"",
      formattedDate:"",
      configdata: config,
      dialog1: false,
      dialog2: false,
      personalizedtags: null,
      videosrc: '',
      ismusicplayer: false,
      isPlaying:false,
      playlistIndex: 0,
      audioLoading: false,
      volume: parseInt(localStorage.getItem('music-volume')) || 70,
      musicinfo: null,
      musicinfoLoading:false,
      lyrics:{},
      socialPlatformIcons: null,
      isExpanded: false,
      clockTimer: null,
      stackicons:[
        {icon:"mdi-vuejs",color:"green", model: false,tip: 'vue'},
        {icon:"mdi-language-javascript",color:"#CAD300", model: false,tip: 'javascript'},
        {icon:"mdi-language-css3",color:"blue", model: false,tip: 'css'},
        {icon:"mdi-language-html5",color:"red", model: false,tip: 'html'},
        {icon:"$vuetify",color:"#1697F6", model: false,tip: 'vuetify'},
      ],
      projectcards:null,
      tab: null,
      tabs: [
        {
          icon: 'mdi-pencil-plus',
          text: '样式预览',
          value: 'tab-1',
          component: "tab1",
        },
        {
          icon: 'mdi-wallpaper',
          text: '背景预览',
          value: 'tab-2',
          component: "tab2",
        },
        {
          icon: 'mdi-music-circle-outline',
          text: '音乐播放',
          value: 'tab-3',
          component: "tab3",
        },
      ],

    };
  },
  async mounted() {
    if(import.meta.env.VITE_CONFIG){
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.projectcards = this.configdata.projectcards;this.socialPlatformIcons = this.configdata.socialPlatformIcons;
    this.personalizedtags = this.configdata.tags;
    this.isloading = true;
    const storedId = localStorage.getItem('ceru-share-id');
    if (storedId && storedId !== extractShareId(storedId)) {
      localStorage.setItem('ceru-share-id', extractShareId(storedId));
    }
    let imageurl = "";
    this.dataConsole();
    this.setMeta(this.configdata.metaData.title,this.configdata.metaData.description,this.configdata.metaData.keywords,this.configdata.metaData.icon);

    imageurl = this.setMainProperty(imageurl);

    //图片与视频并行加载，缩短总等待时间
    const loadImage = () => {
        const imageUrls = [
          config.avatar,
          ...config.projectcards.map(item => item.img)
        ];

        const imagesLoader = new Promise((resolve) => {
          if (!imageUrls.length) return resolve();
          const tasks = imageUrls.map((url) => new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }));
          const timeout = new Promise(resolve => setTimeout(resolve, 2500));
          Promise.race([Promise.all(tasks), timeout]).then(resolve);
        });

        const bgLoader = new Promise((resolve) => {
          if (imageurl) {
            const img = new Image();
            img.src = imageurl;
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(() => resolve(), 2000);
          } else {
            const video = this.$refs.VdPlayer;
            if (!video) return resolve();
            if (video.readyState >= 1) return resolve();
            video.onloadedmetadata = () => resolve();
            video.onerror = () => resolve();
            setTimeout(() => resolve(), 3000);
          }
        });

        return Promise.all([imagesLoader, bgLoader]);
     };

    const startClock = () => {
      const tick = () => {
        const now = new Date();
        this.formattedTime = this.getFormattedTime(now);
        const msToNextSecond = 1000 - now.getMilliseconds();
        this.clockTimer = setTimeout(tick, msToNextSecond);
      };
      const msToNextSecond = 1000 - Date.now() % 1000;
      this.clockTimer = setTimeout(tick, msToNextSecond);
    };

    loadImage().then(() => {
        this.formattedTime =  this.getFormattedTime(new Date());
        this.formattedDate =  this.getFormattedDate(new Date());
        startClock();
        setTimeout(() => {
          this.isloading = false;
        }, "500");
      }).catch((err) => {
        console.error('壁纸加载失败:', err);
        startClock();
        setTimeout(() => {
          this.isloading = false;
        }, "100");
      });

      await this.getMusicInfo();  //获取音乐数据
      this.setupAudioListener();  //设置 ended 事件监听器，当歌曲播放结束时自动调用 nextTrack 方法。
  },

  beforeDestroy() {
    if (this.clockTimer) { clearTimeout(this.clockTimer); this.clockTimer = null; }
    this.$refs.audioPlayer.removeEventListener('ended',  this.nextTrack);
  },

  watch:{
    isClearScreen(val){
      if(!this.videosrc){
        return
      }
      if(val){
        this.$refs.VdPlayer.style.zIndex = 0;
        this.$refs.VdPlayer.controls = true;
      }else{
        this.$refs.VdPlayer.style.zIndex = -100;
        this.$refs.VdPlayer.controls = false;
      }
    },
    audioLoading(val){
      this.isPlaying = !val;
    },
    volume(val) {
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.volume = val / 100;
      }
      localStorage.setItem('music-volume', val);
    },

  //若弹出框使得页面播放卡顿，可以先停止背景播放
  //   dialog1(val){
  //     if(val){
  //       this.$refs.VdPlayer.pause();
  //     }else{
  //       this.$refs.VdPlayer.play();
  //     }
  //  }
  },

  computed: {
    currentSong() {
      return this.musicinfo[this.playlistIndex];
    },
    audioPlayer() {
      return this.$refs.audioPlayer;
    },
    volumeIcon() {
      if (this.volume === 0) return 'mdi-volume-mute';
      if (this.volume < 34) return 'mdi-volume-low';
      if (this.volume < 67) return 'mdi-volume-medium';
      return 'mdi-volume-high';
    },
  },

  methods: {
    getCookie,setMeta,getFormattedTime,getFormattedDate,dataConsole,

    setMainProperty(imageurl){
      const root = document.documentElement;
      let leleodata = this.getCookie("leleodata");
      if(leleodata){
        root.style.setProperty('--leleo-welcomtitle-color', `${leleodata.color.welcometitlecolor}`);
        root.style.setProperty('--leleo-vcard-color', `${leleodata.color.themecolor}`);
        root.style.setProperty('--leleo-brightness', `${leleodata.brightness}%`);
        root.style.setProperty('--leleo-blur', `${leleodata.blur}px`);
      }else{
        root.style.setProperty('--leleo-welcomtitle-color', `${this.configdata.color.welcometitlecolor}`);
        root.style.setProperty('--leleo-vcard-color', `${this.configdata.color.themecolor}`);
        root.style.setProperty('--leleo-brightness', `${this.configdata.brightness}%`);
        root.style.setProperty('--leleo-blur', `${this.configdata.blur}px`);
      }

      let leleodatabackground = this.getCookie("leleodatabackground");
      const { xs } = useDisplay();
      if(leleodatabackground){
        if(xs.value){
          if(leleodatabackground.mobile.type == "pic"){
            root.style.setProperty('--leleo-background-image-url', `url('${leleodatabackground.mobile.datainfo.url}')`);
            imageurl = leleodatabackground.mobile.datainfo.url;
            return imageurl;
          }else{
            this.videosrc = leleodatabackground.mobile.datainfo.url;
          }
        }else{
          if(leleodatabackground.pc.type == "pic"){
            root.style.setProperty('--leleo-background-image-url', `url('${leleodatabackground.pc.datainfo.url}')`);
            imageurl = leleodatabackground.pc.datainfo.url;
            return imageurl;
          }else{
            this.videosrc = leleodatabackground.pc.datainfo.url;
          }
        }

      }else{
        if(xs.value){
          if(this.configdata.background.mobile.type == "pic"){
            root.style.setProperty('--leleo-background-image-url', `url('${this.configdata.background.mobile.datainfo.url}')`);
            imageurl = this.configdata.background.mobile.datainfo.url;
            return imageurl;
          }else{
            this.videosrc = this.configdata.background.mobile.datainfo.url;
          }
        }else{
          if(this.configdata.background.pc.type == "pic"){
            root.style.setProperty('--leleo-background-image-url', `url('${this.configdata.background.pc.datainfo.url}')`);
            imageurl = this.configdata.background.pc.datainfo.url;
            return imageurl;
          }else{
            this.videosrc = this.configdata.background.pc.datainfo.url;
          }

        }
      }
    },

    projectcardsShow(key){
      this.projectcards.forEach((item,index)=>{
        if(index!= key){
          item.show = false;
        }
      })
    },
    handleCancel(){
      this.dialog1 = false;
    },
    jump(url){
      window.open(url, '_blank').focus();
    },

    async getMusicInfo(){
      this.musicinfoLoading = true;
      try {
        const cfg = this.configdata.musicPlayer;
        if (cfg.mode === 'ceru-share') {
          const shareId = this.ceruShareId;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(`/api/share/playlist/${shareId}`, { signal: controller.signal });
          clearTimeout(timer);
          if (!res.ok) throw new Error('网络请求失败: ' + res.status);
          const data = await res.json();
          this.musicinfo = (data.data.playlist.songs || []).map(song => ({
            title: song.name,
            author: song.singer,
            url: `/api/share/playlist/${shareId}/song/${song.songmid}/audio`,
            pic: (song.img || '').replace(/^http:\/\//, 'https://'),
            lrc: '',
          }));
        } else {
          const response = await fetch(`https://api.i-meto.com/meting/api?server=${cfg.server}&type=${cfg.type}&id=${cfg.id}`);
          if (!response.ok) throw new Error('网络请求失败');
          this.musicinfo = await response.json();
        }
        this.musicinfoLoading = false;
      } catch (error) {
        console.error('音乐加载失败:', error.message || error);
        this.musicinfoLoading = false;
      }
    },
    updateCeruShareId(newId) {
      const id = extractShareId(newId);
      if (id) {
        this.ceruShareId = id;
        localStorage.setItem('ceru-share-id', id);
        this.getMusicInfo();
        this.updateAudio();
      }
    },
    musicplayershow(val) {
        this.ismusicplayer = val;
    },

    setupAudioListener() {
      this.$refs.audioPlayer.addEventListener('ended', this.nextTrack);
    },

    togglePlay() {
      if (!this.isPlaying) {
        this.audioPlayer.play();
        this.isVdMuted = true;
      } else {
        this.audioPlayer.pause();
        this.isVdMuted = false;
      }
      this.isPlaying = !this.musicinfoLoading && !this.isPlaying;
    },
    previousTrack() {
      this.playlistIndex = this.playlistIndex > 0 ? this.playlistIndex - 1 : this.musicinfo.length - 1;
      this.updateAudio();
    },
    nextTrack() {
      this.playlistIndex = this.playlistIndex < this.musicinfo.length - 1 ? this.playlistIndex + 1 : 0;
      this.updateAudio();
    },
    updateAudio() {
      this.audioLoading = true;
      this.audioPlayer.src = this.currentSong.url;
      this.audioPlayer.volume = this.volume / 100;
      this.$refs.audiotitle.innerText = this.currentSong.title;
      this.$refs.audioauthor.innerText = this.currentSong.author;
      this.isPlaying = true;
      this.audioPlayer.play();
      this.clearPrefetch();
    },
    preloadNext() {
      const nextIndex = (this.playlistIndex + 1) % this.musicinfo.length;
      const nextUrl = this.musicinfo[nextIndex]?.url;
      if (!nextUrl) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'audio';
      link.href = nextUrl;
      link.setAttribute('data-audio-prefetch', '');
      document.head.appendChild(link);
    },
    clearPrefetch() {
      document.head.querySelectorAll('link[data-audio-prefetch]').forEach(el => el.remove());
    },
    updateCurrentIndex(index) {
      this.playlistIndex = index;
      this.updateAudio();
    },
    updateIsPlaying(isPlaying) {
      this.isPlaying = isPlaying;
    },
    updateLyrics(lyrics){
      this.lyrics = lyrics;
    },
    onWaiting() {
      this.audioLoading = true;
    },
    onCanPlay() {
      this.audioLoading = false;
      setTimeout(() => this.preloadNext(), 2000);
    },
    expandSwitch() {
      this.isExpanded = true;
    },
    collapseSwitch() {
      this.isExpanded = false;
    },
  }
};
