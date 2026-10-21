<template>
  <button
    type="button"
    class="music-entrance"
    aria-label="进入音乐空间，打开 Folia 播放器页面"
    @click="$emit('open')"
  >
    <span class="music-entrance-record" aria-hidden="true">
      <v-icon icon="mdi-play" size="18" />
    </span>
    <span class="music-entrance-copy">
      <span class="music-entrance-title">音乐空间 <span>Folia</span></span>
      <span class="music-entrance-description">给此刻，配一首歌</span>
    </span>
    <v-icon class="music-entrance-arrow" icon="mdi-arrow-right" size="20" aria-hidden="true" />
  </button>
</template>

<script>
// 头像下方的音乐入口，交由主页打开现有 Folia 播放器。
export default {
  name: 'MusicEntrance',
  emits: ['open'],
}
</script>

<style scoped>
.music-entrance {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: min(100%, 270px);
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  background: rgba(16, 22, 30, 0.76);
  color: #fff;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  transition: background-color 180ms ease, border-color 180ms ease;
}

.music-entrance:hover {
  background: rgba(16, 22, 30, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}

.music-entrance:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

.music-entrance:active {
  background: #10161e;
}

.music-entrance-record {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: repeating-radial-gradient(circle, #202932 0 2px, #35414b 3px, #202932 4px 5px);
}

.music-entrance-record .v-icon {
  width: 24px;
  height: 24px;
  padding-left: 2px;
  border-radius: 50%;
  background: #e6d2a9;
  color: #202932;
}

.music-entrance-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.music-entrance-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.music-entrance-title span {
  margin-left: 4px;
  color: #e6d2a9;
  font-size: 11px;
  font-weight: 400;
}

.music-entrance-description {
  color: #d6dde4;
  font-size: 12px;
  line-height: 1.5;
}

.music-entrance-arrow {
  flex-shrink: 0;
  color: #e6d2a9;
  transition: transform 180ms ease;
}

.music-entrance:hover .music-entrance-arrow,
.music-entrance:focus-visible .music-entrance-arrow {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .music-entrance,
  .music-entrance-arrow {
    transition: none;
  }

  .music-entrance:hover .music-entrance-arrow,
  .music-entrance:focus-visible .music-entrance-arrow {
    transform: none;
  }
}
</style>
